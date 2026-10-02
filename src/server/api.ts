import express, { Response } from 'express';
import { db, hashPassword, verifyPassword } from './db.js';
import {
  AuthenticatedRequest,
  generateToken,
  requireAuth,
  requireRole,
} from './auth.js';
import {
  parseSourcingPrompt,
  analyzeQuotesComparison,
  generateNegotiationProposal,
} from './gemini.js';
import {
  User,
  SupplierMatch,
  MatchTier,
  Quote,
  Order,
  PaymentSubmission,
  Transaction,
  Commission,
  Review,
  Message,
  Dispute,
} from '../types/index.js';

export const apiRouter = express.Router();

// --- HEALTH & CONFIG ---
apiRouter.get('/config', (req, res) => {
  const settings = db.getSettings();
  res.json({
    platformName: settings.platformName,
    tagline: settings.tagline,
    currency: settings.currency,
    supportedCities: settings.supportedCities,
    commissionPercent: settings.commissionPercent,
    directBankTransfer: {
      bankName: settings.directBankTransferBankName,
      accountName: settings.directBankTransferAccountName,
      accountNumber: settings.directBankTransferAccountNumber,
    },
    hasAiKey: !!process.env.GEMINI_API_KEY,
  });
});

// --- AUTHENTICATION ---
apiRouter.post('/auth/register', (req, res) => {
  try {
    const { email, password, name, role, phone, company, location } = req.body;
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Email, password, name, and role are required.' });
    }
    if (!['buyer', 'supplier'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either buyer or supplier.' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const { hash, salt } = hashPassword(password);
    const id = `USR-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

    const user: User & { passwordHash: string; passwordSalt: string } = {
      id,
      email,
      name,
      role,
      phone: phone || '',
      company: company || '',
      location: location || 'Lagos',
      status: 'active',
      createdAt: new Date().toISOString(),
      passwordHash: hash,
      passwordSalt: salt,
    };

    db.createUser(user);

    // If registered as supplier, create initial profile
    if (role === 'supplier') {
      db.createSupplierProfile({
        id: `SUP-PROF-${Date.now().toString(36).toUpperCase()}`,
        userId: id,
        businessName: company || `${name} Enterprises`,
        description: 'New verified supplier offering procurement services.',
        city: location || 'Lagos',
        address: `${location || 'Lagos'}, Nigeria`,
        categories: ['Corporate Apparel & Textiles'],
        productsServices: [],
        minOrderAmount: 50000,
        deliveryLocations: [location || 'Lagos', 'Nationwide'],
        verificationLevel: 'unverified',
        rating: 5.0,
        reviewCount: 0,
        completedTransactions: 0,
        responseRate: 100,
        typicalResponseTime: 'Under 2 hours',
        isFeatured: false,
        createdAt: new Date().toISOString(),
      });
    }

    const { passwordHash, passwordSalt, ...safeUser } = user;
    const token = generateToken(safeUser);

    db.createAuditLog({
      id: `LOG-${Date.now()}`,
      adminId: 'system',
      adminEmail: 'system@aimiddleman.ng',
      action: 'User Registered',
      targetType: 'user',
      targetId: user.id,
      details: `New ${role} registered: ${user.name} (${user.email})`,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({ user: safeUser, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

apiRouter.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
    }

    const isValid = verifyPassword(password, user.passwordHash, user.passwordSalt);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const { passwordHash, passwordSalt, ...safeUser } = user;
    const token = generateToken(safeUser);
    const supplierProfile = user.role === 'supplier' ? db.getSupplierProfileByUserId(user.id) : null;

    res.json({ user: safeUser, token, supplierProfile });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const supplierProfile = user.role === 'supplier' ? db.getSupplierProfileByUserId(user.id) : null;
  res.json({ user, supplierProfile });
});

// Quick Switcher for Testing & Demonstration
apiRouter.post('/auth/quick-login', (req, res) => {
  const { accountKey } = req.body;
  let targetEmail = 'admin@aimiddleman.ng';
  if (accountKey === 'buyer') targetEmail = 'buyer.demo@aimiddleman.ng';
  if (accountKey === 'supplier-apparel') targetEmail = 'supplier.apparel@aimiddleman.ng';
  if (accountKey === 'supplier-furniture') targetEmail = 'supplier.furniture@aimiddleman.ng';
  if (accountKey === 'supplier-industrial') targetEmail = 'supplier.industrial@aimiddleman.ng';
  if (accountKey === 'supplier-tech') targetEmail = 'supplier.tech@aimiddleman.ng';

  const user = db.getUserByEmail(targetEmail);
  if (!user) {
    return res.status(404).json({ error: 'Target account not found.' });
  }

  const { passwordHash, passwordSalt, ...safeUser } = user;
  const token = generateToken(safeUser);
  const supplierProfile = user.role === 'supplier' ? db.getSupplierProfileByUserId(user.id) : null;
  res.json({ user: safeUser, token, supplierProfile });
});

// --- AI SOURCING ENGINE ---
apiRouter.post('/sourcing/parse', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Please enter your procurement requirements.' });
    }

    const structured = await parseSourcingPrompt(prompt);
    res.json({ data: structured });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to process sourcing prompt.' });
  }
});

// Create Sourcing Request with real Supplier Matching
apiRouter.post('/sourcing/requests', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const buyer = req.user!;
    const {
      title,
      category,
      productOrService,
      quantity,
      unit,
      budget,
      location,
      deliveryDeadline,
      qualityRequirements,
      specifications,
      customization,
      additionalRequirements,
    } = req.body;

    if (!title || !category || !productOrService || !quantity) {
      return res.status(400).json({ error: 'Title, category, product/service, and quantity are required.' });
    }

    const requestId = db.nextRequestId();
    const newRequest = db.createRequest({
      id: requestId,
      buyerId: buyer.id,
      buyerName: buyer.name,
      buyerEmail: buyer.email,
      title,
      category,
      productOrService,
      quantity: Number(quantity),
      unit: unit || 'units',
      budget: Number(budget) || 0,
      currency: 'NGN',
      location: location || buyer.location || 'Lagos',
      deliveryDeadline: deliveryDeadline || 'Within 14 days',
      qualityRequirements: qualityRequirements || 'Commercial grade',
      specifications: specifications || '',
      customization: customization || '',
      additionalRequirements: additionalRequirements || '',
      status: 'supplier_matching',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Real Supplier Matching Engine
    const allSuppliers = db.listSupplierProfiles();
    const matchedSuppliers: SupplierMatch[] = [];

    for (const sup of allSuppliers) {
      let score = 0;
      const reasons: string[] = [];

      // 1. Category overlap
      const hasCategory = sup.categories.some(
        (c) => c.toLowerCase() === category.toLowerCase() || category.toLowerCase().includes(c.toLowerCase())
      );
      if (hasCategory) {
        score += 45;
        reasons.push(`Specializes in ${category}`);
      }

      // 2. Product keywords
      const reqText = `${productOrService} ${specifications} ${title}`.toLowerCase();
      const hasProduct = sup.productsServices.some((p) => reqText.includes(p.toLowerCase()));
      if (hasProduct) {
        score += 25;
        reasons.push('Exact catalog match for requested product');
      }

      // 3. Location delivery capability
      const deliversToLocation =
        sup.deliveryLocations.some((l) => l.toLowerCase() === location.toLowerCase() || l.toLowerCase() === 'nationwide') ||
        sup.city.toLowerCase() === location.toLowerCase();
      if (deliversToLocation) {
        score += 15;
        reasons.push(`Direct delivery coverage for ${location}`);
      }

      // 4. Rating & Verification bonus
      if (sup.verificationLevel === 'platform_verified') {
        score += 10;
        reasons.push('Platform Verified supplier with verified performance guarantee');
      } else if (sup.verificationLevel === 'business_verified') {
        score += 7;
        reasons.push('Verified CAC business credentials');
      }

      if (sup.rating >= 4.8) {
        score += 5;
        reasons.push(`Top-tier ${sup.rating}★ rating`);
      }

      if (score >= 40) {
        let matchTier: MatchTier = 'Possible Match';
        if (score >= 75) matchTier = 'Strong Match';
        else if (score >= 55) matchTier = 'Good Match';

        matchedSuppliers.push({
          id: `MAT-${requestId}-${sup.id}`,
          requestId,
          supplierId: sup.userId,
          supplierName: sup.businessName,
          supplierCity: sup.city,
          supplierRating: sup.rating,
          verificationLevel: sup.verificationLevel,
          matchScore: Math.min(score, 99),
          matchTier,
          reasons,
          createdAt: new Date().toISOString(),
        });

        // Notify the matched supplier
        db.createNotification({
          id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          userId: sup.userId,
          title: 'New RFQ Procurement Opportunity',
          message: `New request matching your catalog: "${title}" (${quantity} units in ${location}). Submit a quote now.`,
          type: 'quote',
          link: `/sourcing/${requestId}`,
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    if (matchedSuppliers.length > 0) {
      db.saveMatches(matchedSuppliers);
      db.updateRequest(requestId, { status: 'awaiting_quotes' });
    } else {
      db.updateRequest(requestId, { status: 'submitted' });
    }

    // Buyer notification
    db.createNotification({
      id: `NOTIF-${Date.now()}`,
      userId: buyer.id,
      title: 'Sourcing Request Created',
      message: `Your request ${requestId} has been broadcast to ${matchedSuppliers.length} verified suppliers in Nigeria.`,
      type: 'order',
      link: `/sourcing/${requestId}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      request: db.getRequestById(requestId),
      matchedCount: matchedSuppliers.length,
      matches: matchedSuppliers,
      message:
        matchedSuppliers.length > 0
          ? `Identified ${matchedSuppliers.length} matching verified suppliers.`
          : "We currently don't have enough verified suppliers matching your requirements. We've saved your request and will notify you when suitable suppliers become available.",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create request.' });
  }
});

// List Sourcing Requests
apiRouter.get('/sourcing/requests', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  if (user.role === 'buyer') {
    const list = db.listRequests({ buyerId: user.id });
    return res.json({ requests: list });
  }

  if (user.role === 'supplier') {
    // Show open opportunities relevant to supplier
    const profile = db.getSupplierProfileByUserId(user.id);
    const all = db.listRequests();
    if (!profile) return res.json({ requests: all });

    const relevant = all.filter((r) =>
      profile.categories.some((c) => c.toLowerCase() === r.category.toLowerCase()) || r.status === 'awaiting_quotes'
    );
    return res.json({ requests: relevant });
  }

  // Admin sees all
  const all = db.listRequests();
  res.json({ requests: all });
});

// Single Sourcing Request details
apiRouter.get('/sourcing/requests/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const request = db.getRequestById(id);
  if (!request) {
    return res.status(404).json({ error: 'Sourcing request not found.' });
  }

  // Role access check
  const user = req.user!;
  if (user.role === 'buyer' && request.buyerId !== user.id) {
    return res.status(403).json({ error: 'You do not have permission to view this request.' });
  }

  const matches = db.getMatchesByRequestId(id);
  const quotes = db.listQuotes({ requestId: id });

  res.json({ request, matches, quotes });
});

// --- QUOTES & RFQ MANAGEMENT ---
apiRouter.post('/quotes', requireAuth, requireRole('supplier'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const supplier = req.user!;
    const profile = db.getSupplierProfileByUserId(supplier.id);
    const {
      requestId,
      unitPrice,
      totalPrice,
      minOrderQty,
      productionTimeDays,
      deliveryTimeDays,
      deliveryCost,
      warranty,
      paymentTerms,
      validUntil,
      notes,
    } = req.body;

    const request = db.getRequestById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Sourcing request not found.' });
    }

    if (!unitPrice || !totalPrice) {
      return res.status(400).json({ error: 'Unit price and total price are required.' });
    }

    const quoteId = db.nextQuoteId();
    const newQuote: Quote = {
      id: quoteId,
      requestId,
      supplierId: supplier.id,
      supplierName: profile?.businessName || supplier.company || supplier.name,
      supplierCity: profile?.city || supplier.location || 'Lagos',
      supplierRating: profile?.rating || 5.0,
      supplierVerification: profile?.verificationLevel || 'unverified',
      unitPrice: Number(unitPrice),
      totalPrice: Number(totalPrice),
      minOrderQty: Number(minOrderQty) || 1,
      productionTimeDays: Number(productionTimeDays) || 7,
      deliveryTimeDays: Number(deliveryTimeDays) || 3,
      deliveryCost: Number(deliveryCost) || 0,
      warranty: warranty || '30 days defect replacement warranty',
      paymentTerms: paymentTerms || 'Payment via AI Middleman direct escrow / bank transfer',
      validUntil: validUntil || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      notes: notes || '',
      status: 'submitted',
      createdAt: new Date().toISOString(),
    };

    db.createQuote(newQuote);
    db.updateRequest(requestId, { status: 'quotes_received' });

    // Notify buyer
    db.createNotification({
      id: `NOTIF-${Date.now()}`,
      userId: request.buyerId,
      title: 'New Supplier Quote Received',
      message: `${newQuote.supplierName} submitted a quote of ₦${newQuote.totalPrice.toLocaleString()} for "${request.title}".`,
      type: 'quote',
      link: `/sourcing/${requestId}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ quote: newQuote });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit quote.' });
  }
});

// AI Quote Analysis
apiRouter.post('/quotes/analyze', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { requestId } = req.body;
    const request = db.getRequestById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    const quotes = db.listQuotes({ requestId });
    const analysis = await analyzeQuotesComparison(request, quotes);
    res.json({ analysis });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Quote analysis failed.' });
  }
});

// AI-Assisted Negotiation Proposal
apiRouter.post('/quotes/:id/negotiate', requireAuth, requireRole('buyer'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { targetPrice, buyerNotes } = req.body;
    const quote = db.getQuoteById(id);
    if (!quote) return res.status(404).json({ error: 'Quote not found.' });

    const request = db.getRequestById(quote.requestId);
    if (!request) return res.status(404).json({ error: 'Associated request not found.' });

    if (request.buyerId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized to negotiate for this request.' });
    }

    const aiProposal = await generateNegotiationProposal(request, quote, Number(targetPrice), buyerNotes);

    const neg = db.createNegotiation({
      id: `NEG-${Date.now()}`,
      quoteId: quote.id,
      requestId: quote.requestId,
      buyerId: req.user!.id,
      supplierId: quote.supplierId,
      initiatedBy: 'buyer',
      originalPrice: quote.totalPrice,
      proposedPrice: Number(targetPrice),
      proposalMessage: aiProposal.proposalMessage,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Notify supplier
    db.createNotification({
      id: `NOTIF-${Date.now()}`,
      userId: quote.supplierId,
      title: 'Counter-Offer / Negotiation Received',
      message: `Buyer for "${request.title}" submitted a counter-offer of ₦${Number(targetPrice).toLocaleString()}.`,
      type: 'negotiation',
      link: `/supplier/quotes`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    res.json({ negotiation: neg, rationale: aiProposal.strategicRationale });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Negotiation failed.' });
  }
});

// Supplier responds to negotiation
apiRouter.post('/negotiations/:id/respond', requireAuth, requireRole('supplier'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action, counterPrice, message } = req.body; // 'accept' | 'counter' | 'reject'
    const neg = db.getNegotiationById(id);
    if (!neg) return res.status(404).json({ error: 'Negotiation not found.' });

    if (neg.supplierId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    if (action === 'accept') {
      neg.status = 'accepted';
      neg.supplierResponse = message || 'Accepted negotiated terms.';
      db.updateQuote(neg.quoteId, { totalPrice: neg.proposedPrice });
      db.updateNegotiation(id, neg);

      db.createNotification({
        id: `NOTIF-${Date.now()}`,
        userId: neg.buyerId,
        title: 'Negotiation Accepted!',
        message: `Supplier agreed to your proposed price of ₦${neg.proposedPrice.toLocaleString()}. You may now proceed to accept quote & order.`,
        type: 'negotiation',
        link: `/sourcing/${neg.requestId}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    } else if (action === 'counter') {
      neg.status = 'countered';
      neg.revisedQuotePrice = Number(counterPrice);
      neg.supplierResponse = message || `Counter-offer: ₦${Number(counterPrice).toLocaleString()}`;
      db.updateQuote(neg.quoteId, { totalPrice: Number(counterPrice) });
      db.updateNegotiation(id, neg);

      db.createNotification({
        id: `NOTIF-${Date.now()}`,
        userId: neg.buyerId,
        title: 'Supplier Counter-Offer',
        message: `Supplier proposed revised price: ₦${Number(counterPrice).toLocaleString()}.`,
        type: 'negotiation',
        link: `/sourcing/${neg.requestId}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    } else {
      neg.status = 'rejected';
      neg.supplierResponse = message || 'Original quote stands.';
      db.updateNegotiation(id, neg);
    }

    res.json({ negotiation: neg });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Response failed.' });
  }
});

// Accept Quote -> Create Order & Calculate Commission
apiRouter.post('/quotes/:id/accept', requireAuth, requireRole('buyer'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { deliveryAddress, deliveryCity } = req.body;
    const buyer = req.user!;

    const quote = db.getQuoteById(id);
    if (!quote) return res.status(404).json({ error: 'Quote not found.' });

    const request = db.getRequestById(quote.requestId);
    if (!request || request.buyerId !== buyer.id) {
      return res.status(403).json({ error: 'Unauthorized to accept this quote.' });
    }

    const settings = db.getSettings();
    const orderNumber = db.nextOrderId();

    // Server-side financial calculations
    const subtotal = quote.totalPrice;
    const deliveryCost = quote.deliveryCost || 0;
    const totalAmount = subtotal + deliveryCost;

    // Platform Commission (server-side, never trusted from client)
    const commissionPercent = settings.commissionPercent;
    const calculatedFee = Math.round((subtotal * commissionPercent) / 100);
    const platformFee = Math.max(settings.minPlatformFee, calculatedFee);
    const supplierEarnings = totalAmount - platformFee;

    const newOrder: Order = {
      id: orderNumber,
      requestId: request.id,
      quoteId: quote.id,
      buyerId: buyer.id,
      buyerName: buyer.name,
      supplierId: quote.supplierId,
      supplierName: quote.supplierName,
      itemsDescription: `${request.productOrService} (${request.quantity} units)`,
      quantity: request.quantity,
      unitPrice: quote.unitPrice,
      subtotal,
      deliveryCost,
      platformFee,
      totalAmount,
      supplierEarnings,
      currency: 'NGN',
      paymentStatus: 'pending',
      fulfillmentStatus: 'processing',
      deliveryAddress: deliveryAddress || buyer.location || 'Lagos',
      deliveryCity: deliveryCity || request.location || 'Lagos',
      buyerConfirmedDelivery: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createOrder(newOrder);
    db.updateQuote(quote.id, { status: 'accepted' });
    db.updateRequest(request.id, { status: 'supplier_selected' });

    // Buyer notification
    db.createNotification({
      id: `NOTIF-${Date.now()}`,
      userId: buyer.id,
      title: 'Order Created - Payment Pending',
      message: `Order ${orderNumber} created. Please select payment method to complete your transfer.`,
      type: 'order',
      link: `/orders/${orderNumber}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    // Supplier notification
    db.createNotification({
      id: `NOTIF-${Date.now()}-sup`,
      userId: quote.supplierId,
      title: 'Quote Accepted! Order Awaiting Payment',
      message: `Buyer accepted your quote for Order ${orderNumber}. You will be notified once payment is verified.`,
      type: 'order',
      link: `/supplier/orders`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ order: newOrder });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to accept quote.' });
  }
});

// --- ORDERS & DIRECT BANK TRANSFER WORKFLOW ---
apiRouter.get('/orders', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  if (user.role === 'buyer') {
    return res.json({ orders: db.listOrders({ buyerId: user.id }) });
  }
  if (user.role === 'supplier') {
    return res.json({ orders: db.listOrders({ supplierId: user.id }) });
  }
  // Admin
  res.json({ orders: db.listOrders() });
});

apiRouter.get('/orders/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const order = db.getOrderById(id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  const user = req.user!;
  if (user.role === 'buyer' && order.buyerId !== user.id) {
    return res.status(403).json({ error: 'Unauthorized.' });
  }
  if (user.role === 'supplier' && order.supplierId !== user.id) {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  const submissions = db.getPaymentSubmissionsByOrderId(order.id);
  const transactions = db.listTransactions({ orderId: order.id });
  const settings = db.getSettings();

  res.json({
    order,
    submissions,
    transactions,
    officialAccount: {
      bankName: settings.directBankTransferBankName,
      accountName: settings.directBankTransferAccountName,
      accountNumber: settings.directBankTransferAccountNumber,
    },
  });
});

// SUBMIT DIRECT BANK TRANSFER (User workflow)
apiRouter.post('/orders/:id/direct-bank-transfer', requireAuth, requireRole('buyer'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { amountClaimed, senderName, referenceId, proofFile, proofFileName } = req.body;
    const buyer = req.user!;

    const order = db.getOrderById(id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    if (order.buyerId !== buyer.id) {
      return res.status(403).json({ error: 'You are not the buyer for this order.' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'This order has already been paid and verified.' });
    }

    // Input validation
    const claimedNum = Number(amountClaimed);
    if (isNaN(claimedNum) || claimedNum <= 0) {
      return res.status(400).json({ error: 'Please enter a valid numeric transfer amount greater than zero.' });
    }

    if (!senderName || typeof senderName !== 'string' || senderName.trim().length < 2) {
      return res.status(400).json({ error: 'Please provide the valid name on the sending bank account.' });
    }

    if (!referenceId || typeof referenceId !== 'string' || referenceId.trim().length < 4) {
      return res.status(400).json({ error: 'Please provide a valid transaction reference or session ID from your banking app.' });
    }

    // Server-side duplicate reference protection
    const cleanRef = referenceId.trim();
    const submissionId = db.nextSubmissionId();

    const submission: PaymentSubmission = {
      id: submissionId,
      userId: buyer.id,
      userName: buyer.name,
      userEmail: buyer.email,
      orderId: order.id,
      orderNumber: order.id,
      amountClaimed: claimedNum,
      expectedAmount: order.totalAmount,
      currency: 'NGN',
      senderName: senderName.trim(),
      bankMethod: 'Direct Bank Transfer',
      referenceId: cleanRef,
      proofFile: proofFile || undefined,
      proofFileName: proofFileName || undefined,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save submission (throws if reference already exists)
    db.createPaymentSubmission(submission);

    // Update order status to pending verification
    db.updateOrder(order.id, {
      paymentStatus: 'pending_verification',
      paymentMethod: 'Direct Bank Transfer',
    });

    // Record pending transaction
    const txnId = db.nextTransactionId();
    db.createTransaction({
      id: txnId,
      orderId: order.id,
      userId: buyer.id,
      amount: order.totalAmount,
      currency: 'NGN',
      type: 'buyer_payment',
      paymentMethod: 'Direct Bank Transfer',
      reference: cleanRef,
      status: 'pending',
      metadata: {
        submissionId,
        amountClaimed: claimedNum,
        senderName: senderName.trim(),
      },
      createdAt: new Date().toISOString(),
    });

    // User Notification
    db.createNotification({
      id: `NOTIF-${Date.now()}`,
      userId: buyer.id,
      title: 'Payment Submitted for Verification',
      message: `Your transfer of ₦${claimedNum.toLocaleString()} (Ref: ${cleanRef}) for Order ${order.id} has been received and is awaiting admin verification.`,
      type: 'payment',
      link: `/orders/${order.id}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    // Audit log
    db.createAuditLog({
      id: `LOG-${Date.now()}`,
      adminId: 'system',
      adminEmail: buyer.email,
      action: 'Direct Bank Transfer Submitted',
      targetType: 'order',
      targetId: order.id,
      details: `Buyer ${buyer.name} submitted bank transfer: ₦${claimedNum} (Ref: ${cleanRef}, Sender: ${senderName})`,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({
      message: 'Payment submitted successfully. Your transfer details have been received and are awaiting verification.',
      submission,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Payment submission failed.' });
  }
});

// Buyer confirms order fulfillment completion
apiRouter.post('/orders/:id/confirm-delivery', requireAuth, requireRole('buyer'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const buyer = req.user!;
    const order = db.getOrderById(id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    if (order.buyerId !== buyer.id) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({ error: 'Order payment must be confirmed before delivery completion.' });
    }

    db.updateOrder(order.id, {
      buyerConfirmedDelivery: true,
      fulfillmentStatus: 'completed',
    });

    // Mark platform commission as earned
    const comms = db.listCommissions().filter((c) => c.orderId === order.id);
    comms.forEach((c) => {
      c.status = 'earned';
      c.earnedAt = new Date().toISOString();
    });

    // Notify supplier
    db.createNotification({
      id: `NOTIF-${Date.now()}`,
      userId: order.supplierId,
      title: 'Order Completed & Delivered',
      message: `Buyer confirmed receipt for Order ${order.id}. Funds are queued for supplier payout.`,
      type: 'order',
      link: `/supplier/orders`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    db.createAuditLog({
      id: `LOG-${Date.now()}`,
      adminId: 'system',
      adminEmail: buyer.email,
      action: 'Delivery Confirmed by Buyer',
      targetType: 'order',
      targetId: order.id,
      details: `Buyer confirmed delivery completion. Order ${order.id} marked as completed.`,
      timestamp: new Date().toISOString(),
    });

    res.json({ message: 'Delivery confirmed. Order marked as completed.', order: db.getOrderById(id) });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to confirm delivery.' });
  }
});

// --- ADMIN VERIFICATION & DASHBOARD ---
apiRouter.get('/admin/overview', requireAuth, requireRole('admin'), (req, res) => {
  const metrics = db.getOverviewMetrics();
  res.json({ metrics });
});

// List Direct Bank Transfer Submissions for Admin Verification
apiRouter.get('/admin/bank-transfers', requireAuth, requireRole('admin'), (req, res) => {
  const { status, search } = req.query;
  const submissions = db.listPaymentSubmissions({
    status: status as string,
    search: search as string,
  });
  res.json({ submissions });
});

// VERIFY (APPROVE OR REJECT) DIRECT BANK TRANSFER (Admin only!)
apiRouter.post('/admin/bank-transfers/:id/verify', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action, adminNote, rejectionReason } = req.body; // 'approve' | 'reject'
    const admin = req.user!;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be either "approve" or "reject".' });
    }

    const submission = db.getPaymentSubmissionById(id);
    if (!submission) {
      return res.status(404).json({ error: 'Payment submission not found.' });
    }

    if (submission.status === 'approved') {
      return res.status(400).json({ error: 'This payment has already been verified and approved.' });
    }

    const order = db.getOrderById(submission.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Associated order not found.' });
    }

    const now = new Date().toISOString();

    if (action === 'approve') {
      // 1. Update PaymentSubmission
      db.updatePaymentSubmission(submission.id, {
        status: 'approved',
        reviewedAt: now,
        reviewedBy: admin.id,
        adminNote: adminNote || 'Payment verified against OPAY statement.',
        rejectionReason: null,
      });

      // 2. Update Order payment status
      db.updateOrder(order.id, {
        paymentStatus: 'paid',
        fulfillmentStatus: order.fulfillmentStatus === 'processing' ? 'in_production' : order.fulfillmentStatus,
      });

      // 3. Update Transaction status
      const txns = db.listTransactions({ orderId: order.id });
      const txn = txns.find((t) => t.type === 'buyer_payment');
      if (txn) {
        txn.status = 'confirmed';
      }

      // 4. Calculate & Record Platform Commission server-side
      const settings = db.getSettings();
      const grossAmount = order.totalAmount;
      const commissionPercent = settings.commissionPercent;
      const calculatedFee = Math.round((order.subtotal * commissionPercent) / 100);
      const platformCommission = Math.max(settings.minPlatformFee, calculatedFee);
      const supplierAmount = grossAmount - platformCommission;

      const commId = `COMM-${order.id}`;
      // Prevent duplicate commissions
      const existingComm = db.listCommissions().find((c) => c.orderId === order.id);
      if (!existingComm) {
        db.createCommission({
          id: commId,
          orderId: order.id,
          transactionId: txn?.id || `TXN-${order.id}`,
          grossAmount,
          commissionPercent,
          platformCommission,
          supplierAmount,
          status: 'earned',
          earnedAt: now,
          createdAt: now,
        });
      }

      // 5. Notify Buyer
      db.createNotification({
        id: `NOTIF-${Date.now()}-buyer`,
        userId: submission.userId,
        title: 'Payment Approved!',
        message: `Your payment of ₦${submission.expectedAmount.toLocaleString()} for Order ${order.id} has been verified and approved. Supplier is fulfilling your order.`,
        type: 'payment',
        link: `/orders/${order.id}`,
        isRead: false,
        createdAt: now,
      });

      // 6. Notify Supplier
      db.createNotification({
        id: `NOTIF-${Date.now()}-sup`,
        userId: order.supplierId,
        title: 'Order Funded & Verified',
        message: `Direct bank transfer payment confirmed for Order ${order.id} (₦${supplierAmount.toLocaleString()} net payout upon completion). Proceed with fulfillment.`,
        type: 'order',
        link: `/supplier/orders`,
        isRead: false,
        createdAt: now,
      });

      // 7. Audit Log
      db.createAuditLog({
        id: `LOG-${Date.now()}`,
        adminId: admin.id,
        adminEmail: admin.email,
        action: 'Direct Bank Transfer Payment Approved',
        targetType: 'payment_submission',
        targetId: submission.id,
        details: `Approved payment for Order ${order.id}. Claimed: ₦${submission.amountClaimed}, Required: ₦${submission.expectedAmount}. Platform Commission: ₦${platformCommission}. Note: ${adminNote || 'None'}`,
        timestamp: now,
      });

      return res.json({
        message: 'Payment successfully approved. Order and commission records updated.',
        submission: db.getPaymentSubmissionById(submission.id),
      });
    }

    if (action === 'reject') {
      if (!rejectionReason) {
        return res.status(400).json({ error: 'Please provide a clear reason for rejecting the payment submission.' });
      }

      // 1. Update PaymentSubmission
      db.updatePaymentSubmission(submission.id, {
        status: 'rejected',
        reviewedAt: now,
        reviewedBy: admin.id,
        adminNote: adminNote || '',
        rejectionReason: rejectionReason || 'Payment could not be verified on the bank account statement.',
      });

      // 2. Revert Order payment status
      db.updateOrder(order.id, {
        paymentStatus: 'pending',
      });

      // 3. Notify Buyer
      db.createNotification({
        id: `NOTIF-${Date.now()}`,
        userId: submission.userId,
        title: 'Payment Verification Not Approved',
        message: `Your transfer submission for Order ${order.id} was not approved. Reason: ${rejectionReason}. Please review your bank reference and resubmit.`,
        type: 'payment',
        link: `/orders/${order.id}`,
        isRead: false,
        createdAt: now,
      });

      // 4. Audit Log
      db.createAuditLog({
        id: `LOG-${Date.now()}`,
        adminId: admin.id,
        adminEmail: admin.email,
        action: 'Direct Bank Transfer Payment Rejected',
        targetType: 'payment_submission',
        targetId: submission.id,
        details: `Rejected payment for Order ${order.id}. Ref: ${submission.referenceId}. Reason: ${rejectionReason}`,
        timestamp: now,
      });

      return res.json({
        message: 'Payment submission marked as rejected.',
        submission: db.getPaymentSubmissionById(submission.id),
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Verification failed.' });
  }
});

// Admin Users Management
apiRouter.get('/admin/users', requireAuth, requireRole('admin'), (req, res) => {
  const users = db.listUsers();
  res.json({ users });
});

apiRouter.post('/admin/users/:id/status', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['active', 'suspended'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }
  const updated = db.updateUser(id, { status });
  if (!updated) return res.status(404).json({ error: 'User not found.' });

  db.createAuditLog({
    id: `LOG-${Date.now()}`,
    adminId: req.user!.id,
    adminEmail: req.user!.email,
    action: `User ${status === 'active' ? 'Activated' : 'Suspended'}`,
    targetType: 'user',
    targetId: id,
    details: `Admin changed status to ${status}`,
    timestamp: new Date().toISOString(),
  });

  res.json({ user: updated });
});

// Admin Supplier Verification Approval
apiRouter.post('/admin/suppliers/:id/verify', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { verificationLevel, verificationNotes } = req.body;
  const validLevels = ['unverified', 'identity_verified', 'business_verified', 'platform_verified'];
  if (!validLevels.includes(verificationLevel)) {
    return res.status(400).json({ error: 'Invalid verification level.' });
  }

  const updated = db.updateSupplierProfile(id, {
    verificationLevel,
    verificationNotes: verificationNotes || '',
  });

  if (!updated) return res.status(404).json({ error: 'Supplier profile not found.' });

  db.createAuditLog({
    id: `LOG-${Date.now()}`,
    adminId: req.user!.id,
    adminEmail: req.user!.email,
    action: 'Supplier Verification Updated',
    targetType: 'supplier_profile',
    targetId: id,
    details: `Updated verification level to ${verificationLevel}. Notes: ${verificationNotes || 'None'}`,
    timestamp: new Date().toISOString(),
  });

  res.json({ supplier: updated });
});

// Admin Settings
apiRouter.get('/admin/settings', requireAuth, requireRole('admin'), (req, res) => {
  res.json({ settings: db.getSettings() });
});

apiRouter.patch('/admin/settings', requireAuth, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const updates = req.body;
    const updated = db.updateSettings(updates);

    db.createAuditLog({
      id: `LOG-${Date.now()}`,
      adminId: req.user!.id,
      adminEmail: req.user!.email,
      action: 'Platform Settings Updated',
      targetType: 'settings',
      targetId: 'platform_settings',
      details: `Updated platform settings: ${Object.keys(updates).join(', ')}`,
      timestamp: new Date().toISOString(),
    });

    res.json({ settings: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update settings.' });
  }
});

// Admin Audit Logs
apiRouter.get('/admin/audit-logs', requireAuth, requireRole('admin'), (req, res) => {
  res.json({ logs: db.listAuditLogs() });
});

// Admin Commissions & Transactions
apiRouter.get('/admin/transactions', requireAuth, requireRole('admin'), (req, res) => {
  const transactions = db.listTransactions();
  const commissions = db.listCommissions();
  res.json({ transactions, commissions });
});

// --- SUPPLIER MARKETPLACE PUBLIC ---
apiRouter.get('/suppliers', (req, res) => {
  const { category, city, search, verifiedOnly } = req.query;
  let list = db.listSupplierProfiles();

  if (category) {
    list = list.filter((s) => s.categories.some((c) => c.toLowerCase() === String(category).toLowerCase()));
  }
  if (city) {
    list = list.filter((s) => s.city.toLowerCase() === String(city).toLowerCase());
  }
  if (verifiedOnly === 'true') {
    list = list.filter((s) => s.verificationLevel !== 'unverified');
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      (s) =>
        s.businessName.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.productsServices.some((p) => p.toLowerCase().includes(q))
    );
  }

  res.json({ suppliers: list });
});

apiRouter.get('/suppliers/:id', (req, res) => {
  const { id } = req.params;
  const profile = db.getSupplierProfileById(id) || db.getSupplierProfileByUserId(id);
  if (!profile) return res.status(404).json({ error: 'Supplier not found.' });

  const reviews = db.listReviewsBySupplier(profile.userId);
  res.json({ profile, reviews });
});

// Supplier Onboarding update
apiRouter.post('/suppliers/onboarding', requireAuth, requireRole('supplier'), (req: AuthenticatedRequest, res: Response) => {
  const supplier = req.user!;
  const updates = req.body;
  const updated = db.updateSupplierProfile(supplier.id, updates);
  res.json({ profile: updated });
});

// --- MESSAGING & NOTIFICATIONS ---
apiRouter.get('/notifications', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const notifications = db.listNotifications(req.user!.id);
  res.json({ notifications });
});

apiRouter.patch('/notifications/:id/read', requireAuth, (req, res) => {
  const { id } = req.params;
  const notif = db.markNotificationRead(id);
  res.json({ notification: notif });
});

// Conversations
apiRouter.get('/conversations', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const convs = db.listUserConversations(req.user!.id);
  res.json({ conversations: convs });
});

apiRouter.get('/conversations/:id/messages', requireAuth, (req, res) => {
  const { id } = req.params;
  const messages = db.listMessages(id);
  res.json({ messages });
});

apiRouter.post('/conversations/:id/messages', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { recipientId, message } = req.body;
  const sender = req.user!;

  if (!message || !recipientId) {
    return res.status(400).json({ error: 'Recipient and message text required.' });
  }

  const msg: Message = {
    id: `MSG-${Date.now()}`,
    conversationId: id,
    senderId: sender.id,
    senderName: sender.name,
    senderRole: sender.role,
    recipientId,
    message: message.trim(),
    read: false,
    createdAt: new Date().toISOString(),
  };

  db.createMessage(msg);

  db.createNotification({
    id: `NOTIF-${Date.now()}`,
    userId: recipientId,
    title: `New message from ${sender.name}`,
    message: msg.message.slice(0, 100),
    type: 'system',
    link: `/messages/${id}`,
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ message: msg });
});

// Reviews
apiRouter.post('/reviews', requireAuth, requireRole('buyer'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const buyer = req.user!;
    const { orderId, rating, qualityRating, communicationRating, deliveryRating, accuracyRating, comment } = req.body;

    const order = db.getOrderById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    if (order.buyerId !== buyer.id) {
      return res.status(403).json({ error: 'You can only review your own orders.' });
    }

    if (order.fulfillmentStatus !== 'completed') {
      return res.status(400).json({ error: 'You can only review orders that have been completed.' });
    }

    const review: Review = {
      id: `REV-${Date.now()}`,
      orderId: order.id,
      buyerId: buyer.id,
      buyerName: buyer.name,
      supplierId: order.supplierId,
      rating: Number(rating) || 5,
      qualityRating: Number(qualityRating) || 5,
      communicationRating: Number(communicationRating) || 5,
      deliveryRating: Number(deliveryRating) || 5,
      accuracyRating: Number(accuracyRating) || 5,
      comment: comment || '',
      createdAt: new Date().toISOString(),
    };

    db.createReview(review);

    // Notify supplier
    db.createNotification({
      id: `NOTIF-${Date.now()}`,
      userId: order.supplierId,
      title: 'New Client Review Received',
      message: `${buyer.name} left a ${rating}★ review for Order ${order.id}.`,
      type: 'system',
      link: `/supplier/profile`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ review });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to submit review.' });
  }
});
