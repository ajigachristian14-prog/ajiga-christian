import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  SupplierProfile,
  SourcingRequest,
  SupplierMatch,
  Quote,
  Negotiation,
  Order,
  PaymentSubmission,
  Transaction,
  Commission,
  Dispute,
  Review,
  Message,
  Notification,
  AuditLog,
  PlatformSettings,
} from '../types/index.js';

interface DatabaseSchema {
  users: (User & { passwordHash: string; passwordSalt: string })[];
  supplierProfiles: SupplierProfile[];
  sourcingRequests: SourcingRequest[];
  supplierMatches: SupplierMatch[];
  quotes: Quote[];
  negotiations: Negotiation[];
  orders: Order[];
  paymentSubmissions: PaymentSubmission[];
  transactions: Transaction[];
  commissions: Commission[];
  disputes: Dispute[];
  reviews: Review[];
  messages: Message[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  platformSettings: PlatformSettings;
  counters: {
    request: number;
    quote: number;
    order: number;
    transaction: number;
    submission: number;
  };
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Helper password hashing with PBKDF2
export function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string) {
  const check = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return check === hash;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  platformName: 'AI Middleman',
  tagline: 'Tell us what you need. We will find the right supplier.',
  supportEmail: 'support@aimiddleman.ng',
  commissionPercent: 5,
  minPlatformFee: 2500,
  directBankTransferBankName: 'OPAY',
  directBankTransferAccountName: 'OLAROTIMI RUFUS AJIGA',
  directBankTransferAccountNumber: '8149482654',
  supportedCities: [
    'Lagos',
    'Abuja',
    'Ibadan',
    'Port Harcourt',
    'Kano',
    'Benin City',
    'Enugu',
    'Kaduna',
  ],
  currency: 'NGN',
  buyerSubscriptionMonthlyFee: 25000,
  supplierSubscriptionMonthlyFee: 35000,
};

function getSeedData(): DatabaseSchema {
  const adminPass = hashPassword('AdminPass2026!');
  const supplierPass = hashPassword('SupplierPass2026!');
  const buyerPass = hashPassword('BuyerPass2026!');

  const adminUser = {
    id: 'USR-ADMIN-001',
    email: 'admin@aimiddleman.ng',
    name: 'Administrator',
    role: 'admin' as const,
    phone: '+2348000000001',
    company: 'AI Middleman Operations',
    location: 'Lagos',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    status: 'active' as const,
    createdAt: new Date().toISOString(),
    passwordHash: adminPass.hash,
    passwordSalt: adminPass.salt,
  };

  const buyerUser = {
    id: 'USR-BUYER-001',
    email: 'buyer.demo@aimiddleman.ng',
    name: 'Tunde Adebayo',
    role: 'buyer' as const,
    phone: '+2348021112233',
    company: 'Apex Horizon Ventures',
    location: 'Ibadan',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    status: 'active' as const,
    createdAt: new Date().toISOString(),
    passwordHash: buyerPass.hash,
    passwordSalt: buyerPass.salt,
  };

  // 5 verified Nigerian suppliers
  const supplierUsers = [
    {
      id: 'USR-SUP-001',
      email: 'supplier.apparel@aimiddleman.ng',
      name: 'Adewale Ogunleye',
      role: 'supplier' as const,
      phone: '+2348035551234',
      company: 'Ibadan Garments & Apparel Ltd',
      location: 'Ibadan',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      passwordHash: supplierPass.hash,
      passwordSalt: supplierPass.salt,
    },
    {
      id: 'USR-SUP-002',
      email: 'supplier.furniture@aimiddleman.ng',
      name: 'Chioma Okonkwo',
      role: 'supplier' as const,
      phone: '+2348028889900',
      company: 'Crown Corporate Furniture & Interiors',
      location: 'Lagos',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      passwordHash: supplierPass.hash,
      passwordSalt: supplierPass.salt,
    },
    {
      id: 'USR-SUP-003',
      email: 'supplier.industrial@aimiddleman.ng',
      name: 'Emeka Nwosu',
      role: 'supplier' as const,
      phone: '+2348037774433',
      company: 'Apex Industrial Supplies & Safety',
      location: 'Port Harcourt',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      passwordHash: supplierPass.hash,
      passwordSalt: supplierPass.salt,
    },
    {
      id: 'USR-SUP-004',
      email: 'supplier.print@aimiddleman.ng',
      name: 'Hauwa Danjuma',
      role: 'supplier' as const,
      phone: '+2348061118822',
      company: 'Abuja Prime Print & Packaging',
      location: 'Abuja',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      passwordHash: supplierPass.hash,
      passwordSalt: supplierPass.salt,
    },
    {
      id: 'USR-SUP-005',
      email: 'supplier.tech@aimiddleman.ng',
      name: 'Babajide Adeleke',
      role: 'supplier' as const,
      phone: '+2348092223344',
      company: 'NaijaTech Enterprise Solutions',
      location: 'Lagos',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      passwordHash: supplierPass.hash,
      passwordSalt: supplierPass.salt,
    },
  ];

  const supplierProfiles: SupplierProfile[] = [
    {
      id: 'SUP-PROF-001',
      userId: 'USR-SUP-001',
      businessName: 'Ibadan Garments & Apparel Ltd',
      registrationNumber: 'RC-1492044',
      logo: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80',
      description: 'Premier industrial textile manufacturer in Oyo State specializing in corporate apparel, customized promotional T-shirts, school uniforms, and event merchandise with in-house screen printing and embroidery.',
      city: 'Ibadan',
      address: 'Plot 14 Industrial Layout, Ring Road, Ibadan, Oyo State',
      categories: ['Corporate Apparel & Textiles', 'Commercial Printing & Packaging'],
      productsServices: ['Branded T-shirts', 'Polo Shirts', 'Company Uniforms', 'Industrial Overalls', 'Embroidered Caps', 'Lanyards'],
      minOrderAmount: 100000,
      deliveryLocations: ['Ibadan', 'Lagos', 'Abeokuta', 'Oshogbo', 'Abuja', 'Nationwide'],
      verificationLevel: 'business_verified',
      verificationDocUrl: 'verified-cac-cert.pdf',
      verificationNotes: 'CAC documents and physical workshop inspection verified by platform inspector.',
      rating: 4.9,
      reviewCount: 38,
      completedTransactions: 82,
      responseRate: 98,
      typicalResponseTime: 'Under 1 hour',
      isFeatured: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'SUP-PROF-002',
      userId: 'USR-SUP-002',
      businessName: 'Crown Corporate Furniture & Interiors',
      registrationNumber: 'RC-1038291',
      logo: 'https://images.unsplash.com/photo-1580481077195-c266858a7f0e?auto=format&fit=crop&w=200&q=80',
      description: 'Leading commercial office furniture manufacturer and direct importer based in Lagos. Specializing in ergonomic office chairs, modular executive desks, conference tables, and space planning.',
      city: 'Lagos',
      address: 'Commercial Avenue, Victoria Island & Ikeja Showroom, Lagos',
      categories: ['Office & Commercial Furniture'],
      productsServices: ['Ergonomic Office Chairs', 'Executive Desks', 'Workstation Partitions', 'Conference Tables', 'Filing Cabinets'],
      minOrderAmount: 250000,
      deliveryLocations: ['Lagos', 'Ibadan', 'Abuja', 'Port Harcourt', 'Kano', 'Enugu'],
      verificationLevel: 'platform_verified',
      verificationDocUrl: 'cac-tax-verified.pdf',
      verificationNotes: 'Tier-1 enterprise supplier with warranty guarantee and verified local warehouse.',
      rating: 4.8,
      reviewCount: 64,
      completedTransactions: 144,
      responseRate: 99,
      typicalResponseTime: 'Under 45 mins',
      isFeatured: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'SUP-PROF-003',
      userId: 'USR-SUP-003',
      businessName: 'Apex Industrial Supplies & Safety',
      registrationNumber: 'RC-1849302',
      logo: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=200&q=80',
      description: 'Industrial safety equipment and procurement specialist serving the oil & gas, construction, and manufacturing sectors with certified PPE, safety boots, gas detectors, and safety tools.',
      city: 'Port Harcourt',
      address: 'Trans-Amadi Industrial Layout, Port Harcourt, Rivers State',
      categories: ['Industrial Supplies & PPE'],
      productsServices: ['Safety Helmets', 'Steel-toe Boots', 'Reflective Vests', 'Chemical Respirators', 'Safety Harnesses', 'Fire Blankets'],
      minOrderAmount: 150000,
      deliveryLocations: ['Port Harcourt', 'Lagos', 'Warri', 'Calabar', 'Benin City', 'Abuja'],
      verificationLevel: 'business_verified',
      verificationDocUrl: 'safety-certifications.pdf',
      verificationNotes: 'NIPEX certified and verified business registration.',
      rating: 4.7,
      reviewCount: 29,
      completedTransactions: 67,
      responseRate: 96,
      typicalResponseTime: 'Under 2 hours',
      isFeatured: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'SUP-PROF-004',
      userId: 'USR-SUP-004',
      businessName: 'Abuja Prime Print & Packaging',
      registrationNumber: 'RC-1729013',
      logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=200&q=80',
      description: 'High-speed commercial print factory producing corrugated packaging, branded shipping boxes, corporate gift bags, brochures, and government contract documentation across Northern Nigeria.',
      city: 'Abuja',
      address: 'Industrial Estate, Idu, Abuja FCT',
      categories: ['Commercial Printing & Packaging', 'Corporate Apparel & Textiles'],
      productsServices: ['Corrugated Shipping Boxes', 'Custom Shopping Bags', 'Product Labels & Stickers', 'Corporate Annual Reports', 'Promotional Items'],
      minOrderAmount: 80000,
      deliveryLocations: ['Abuja', 'Kaduna', 'Kano', 'Jos', 'Lagos', 'Ibadan'],
      verificationLevel: 'business_verified',
      verificationDocUrl: 'abuja-prime-cac.pdf',
      verificationNotes: 'Fully equipped offset and digital machinery verified.',
      rating: 4.9,
      reviewCount: 42,
      completedTransactions: 112,
      responseRate: 97,
      typicalResponseTime: 'Under 1.5 hours',
      isFeatured: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'SUP-PROF-005',
      userId: 'USR-SUP-005',
      businessName: 'NaijaTech Enterprise Solutions',
      registrationNumber: 'RC-1290348',
      logo: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=200&q=80',
      description: 'Authorized enterprise IT hardware distributor stocking business laptops, rackmount servers, commercial UPS systems, and enterprise networking hardware with full manufacturer warranty.',
      city: 'Lagos',
      address: 'Otigba Street, Computer Village & Ikeja GRA, Lagos',
      categories: ['IT Hardware & Networking'],
      productsServices: ['Commercial Laptops', 'Server Racks', 'Enterprise Routers', 'CCTV & Access Control', 'Commercial Monitors', 'Online UPS'],
      minOrderAmount: 500000,
      deliveryLocations: ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Enugu', 'Nationwide'],
      verificationLevel: 'platform_verified',
      verificationDocUrl: 'oem-partner-authorization.pdf',
      verificationNotes: 'Official OEM tier partner with authenticated serial tracking.',
      rating: 4.8,
      reviewCount: 51,
      completedTransactions: 95,
      responseRate: 98,
      typicalResponseTime: 'Under 30 mins',
      isFeatured: true,
      createdAt: new Date().toISOString(),
    },
  ];

  return {
    users: [adminUser, buyerUser, ...supplierUsers],
    supplierProfiles,
    sourcingRequests: [],
    supplierMatches: [],
    quotes: [],
    negotiations: [],
    orders: [],
    paymentSubmissions: [],
    transactions: [],
    commissions: [],
    disputes: [],
    reviews: [],
    messages: [],
    notifications: [],
    auditLogs: [
      {
        id: 'LOG-INIT',
        adminId: 'USR-ADMIN-001',
        adminEmail: 'admin@aimiddleman.ng',
        action: 'System Initialized',
        targetType: 'system',
        targetId: 'platform',
        details: 'AI Middleman procurement platform core initialized with OPAY Direct Bank Transfer payment rail and initial verified suppliers.',
        timestamp: new Date().toISOString(),
      },
    ],
    platformSettings: DEFAULT_SETTINGS,
    counters: {
      request: 0,
      quote: 0,
      order: 0,
      transaction: 0,
      submission: 0,
    },
  };
}

class Database {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Failed reading database file, initializing with fresh seed data:', err);
    }
    const seed = getSeedData();
    this.persistSync(seed);
    return seed;
  }

  private persistSync(dataToSave: DatabaseSchema) {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  }

  private queueSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.persistSync(this.data);
      this.saveTimeout = null;
    }, 100);
  }

  // Next ID Generators
  nextRequestId(): string {
    this.data.counters.request += 1;
    this.queueSave();
    const num = String(this.data.counters.request).padStart(6, '0');
    return `REQ-2026-${num}`;
  }

  nextQuoteId(): string {
    this.data.counters.quote += 1;
    this.queueSave();
    const num = String(this.data.counters.quote).padStart(6, '0');
    return `QTE-2026-${num}`;
  }

  nextOrderId(): string {
    this.data.counters.order += 1;
    this.queueSave();
    const num = String(this.data.counters.order).padStart(6, '0');
    return `ORD-2026-${num}`;
  }

  nextTransactionId(): string {
    this.data.counters.transaction += 1;
    this.queueSave();
    const num = String(this.data.counters.transaction).padStart(6, '0');
    return `TXN-2026-${num}`;
  }

  nextSubmissionId(): string {
    this.data.counters.submission += 1;
    this.queueSave();
    const num = String(this.data.counters.submission).padStart(6, '0');
    return `SUB-2026-${num}`;
  }

  // --- Users ---
  getUserById(id: string) {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: User & { passwordHash: string; passwordSalt: string }) {
    this.data.users.push(user);
    this.queueSave();
    return user;
  }

  updateUser(id: string, updates: Partial<User>) {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.queueSave();
      return this.data.users[idx];
    }
    return null;
  }

  listUsers() {
    return this.data.users.map(({ passwordHash, passwordSalt, ...safeUser }) => safeUser);
  }

  // --- Suppliers ---
  getSupplierProfileByUserId(userId: string) {
    return this.data.supplierProfiles.find((s) => s.userId === userId);
  }

  getSupplierProfileById(id: string) {
    return this.data.supplierProfiles.find((s) => s.id === id);
  }

  listSupplierProfiles() {
    return this.data.supplierProfiles;
  }

  createSupplierProfile(profile: SupplierProfile) {
    this.data.supplierProfiles.push(profile);
    this.queueSave();
    return profile;
  }

  updateSupplierProfile(id: string, updates: Partial<SupplierProfile>) {
    const idx = this.data.supplierProfiles.findIndex((s) => s.id === id || s.userId === id);
    if (idx !== -1) {
      this.data.supplierProfiles[idx] = { ...this.data.supplierProfiles[idx], ...updates };
      this.queueSave();
      return this.data.supplierProfiles[idx];
    }
    return null;
  }

  // --- Sourcing Requests ---
  createRequest(request: SourcingRequest) {
    this.data.sourcingRequests.unshift(request);
    this.queueSave();
    return request;
  }

  getRequestById(id: string) {
    return this.data.sourcingRequests.find((r) => r.id === id);
  }

  listRequests(filters?: { buyerId?: string; category?: string; status?: string }) {
    return this.data.sourcingRequests.filter((r) => {
      if (filters?.buyerId && r.buyerId !== filters.buyerId) return false;
      if (filters?.category && r.category.toLowerCase() !== filters.category.toLowerCase()) return false;
      if (filters?.status && r.status !== filters.status) return false;
      return true;
    });
  }

  updateRequest(id: string, updates: Partial<SourcingRequest>) {
    const idx = this.data.sourcingRequests.findIndex((r) => r.id === id);
    if (idx !== -1) {
      this.data.sourcingRequests[idx] = {
        ...this.data.sourcingRequests[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.queueSave();
      return this.data.sourcingRequests[idx];
    }
    return null;
  }

  // --- Supplier Matches ---
  saveMatches(matches: SupplierMatch[]) {
    this.data.supplierMatches.push(...matches);
    this.queueSave();
    return matches;
  }

  getMatchesByRequestId(requestId: string) {
    return this.data.supplierMatches.filter((m) => m.requestId === requestId);
  }

  // --- Quotes ---
  createQuote(quote: Quote) {
    this.data.quotes.unshift(quote);
    this.queueSave();
    return quote;
  }

  getQuoteById(id: string) {
    return this.data.quotes.find((q) => q.id === id);
  }

  listQuotes(filters?: { requestId?: string; supplierId?: string; status?: string }) {
    return this.data.quotes.filter((q) => {
      if (filters?.requestId && q.requestId !== filters.requestId) return false;
      if (filters?.supplierId && q.supplierId !== filters.supplierId) return false;
      if (filters?.status && q.status !== filters.status) return false;
      return true;
    });
  }

  updateQuote(id: string, updates: Partial<Quote>) {
    const idx = this.data.quotes.findIndex((q) => q.id === id);
    if (idx !== -1) {
      this.data.quotes[idx] = { ...this.data.quotes[idx], ...updates };
      this.queueSave();
      return this.data.quotes[idx];
    }
    return null;
  }

  // --- Negotiations ---
  createNegotiation(neg: Negotiation) {
    this.data.negotiations.unshift(neg);
    this.queueSave();
    return neg;
  }

  getNegotiationById(id: string) {
    return this.data.negotiations.find((n) => n.id === id);
  }

  listNegotiations(quoteId: string) {
    return this.data.negotiations.filter((n) => n.quoteId === quoteId);
  }

  updateNegotiation(id: string, updates: Partial<Negotiation>) {
    const idx = this.data.negotiations.findIndex((n) => n.id === id);
    if (idx !== -1) {
      this.data.negotiations[idx] = {
        ...this.data.negotiations[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.queueSave();
      return this.data.negotiations[idx];
    }
    return null;
  }

  // --- Orders ---
  createOrder(order: Order) {
    this.data.orders.unshift(order);
    this.queueSave();
    return order;
  }

  getOrderById(id: string) {
    return this.data.orders.find((o) => o.id === id);
  }

  listOrders(filters?: { buyerId?: string; supplierId?: string; status?: string }) {
    return this.data.orders.filter((o) => {
      if (filters?.buyerId && o.buyerId !== filters.buyerId) return false;
      if (filters?.supplierId && o.supplierId !== filters.supplierId) return false;
      if (filters?.status && o.fulfillmentStatus !== filters.status) return false;
      return true;
    });
  }

  updateOrder(id: string, updates: Partial<Order>) {
    const idx = this.data.orders.findIndex((o) => o.id === id);
    if (idx !== -1) {
      this.data.orders[idx] = {
        ...this.data.orders[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.queueSave();
      return this.data.orders[idx];
    }
    return null;
  }

  // --- Payment Submissions (Direct Bank Transfer) ---
  createPaymentSubmission(submission: PaymentSubmission) {
    // Check duplicate referenceId across all submissions
    const existingRef = this.data.paymentSubmissions.find(
      (p) => p.referenceId.trim().toLowerCase() === submission.referenceId.trim().toLowerCase()
    );
    if (existingRef) {
      throw new Error(`Transaction reference '${submission.referenceId}' has already been submitted.`);
    }

    this.data.paymentSubmissions.unshift(submission);
    this.queueSave();
    return submission;
  }

  getPaymentSubmissionById(id: string) {
    return this.data.paymentSubmissions.find((p) => p.id === id);
  }

  getPaymentSubmissionsByOrderId(orderId: string) {
    return this.data.paymentSubmissions.filter((p) => p.orderId === orderId);
  }

  listPaymentSubmissions(filters?: {
    status?: string;
    userId?: string;
    search?: string;
  }) {
    return this.data.paymentSubmissions.filter((p) => {
      if (filters?.status && filters.status !== 'all' && p.status !== filters.status) return false;
      if (filters?.userId && p.userId !== filters.userId) return false;
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        const matchesUser = p.userName.toLowerCase().includes(q) || p.userEmail.toLowerCase().includes(q);
        const matchesOrder = p.orderNumber.toLowerCase().includes(q) || p.orderId.toLowerCase().includes(q);
        const matchesRef = p.referenceId.toLowerCase().includes(q);
        const matchesId = p.id.toLowerCase().includes(q);
        const matchesSender = p.senderName.toLowerCase().includes(q);
        if (!matchesUser && !matchesOrder && !matchesRef && !matchesId && !matchesSender) return false;
      }
      return true;
    });
  }

  updatePaymentSubmission(id: string, updates: Partial<PaymentSubmission>) {
    const idx = this.data.paymentSubmissions.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.data.paymentSubmissions[idx] = {
        ...this.data.paymentSubmissions[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.queueSave();
      return this.data.paymentSubmissions[idx];
    }
    return null;
  }

  // --- Transactions ---
  createTransaction(txn: Transaction) {
    this.data.transactions.unshift(txn);
    this.queueSave();
    return txn;
  }

  listTransactions(filters?: { orderId?: string; userId?: string }) {
    return this.data.transactions.filter((t) => {
      if (filters?.orderId && t.orderId !== filters.orderId) return false;
      if (filters?.userId && t.userId !== filters.userId) return false;
      return true;
    });
  }

  // --- Commissions ---
  createCommission(comm: Commission) {
    this.data.commissions.unshift(comm);
    this.queueSave();
    return comm;
  }

  listCommissions() {
    return this.data.commissions;
  }

  // --- Disputes ---
  createDispute(dispute: Dispute) {
    this.data.disputes.unshift(dispute);
    this.queueSave();
    return dispute;
  }

  listDisputes(filters?: { orderId?: string; userId?: string }) {
    return this.data.disputes.filter((d) => {
      if (filters?.orderId && d.orderId !== filters.orderId) return false;
      if (filters?.userId && d.openedBy !== filters.userId && d.againstUser !== filters.userId) return false;
      return true;
    });
  }

  getDisputeById(id: string) {
    return this.data.disputes.find((d) => d.id === id);
  }

  updateDispute(id: string, updates: Partial<Dispute>) {
    const idx = this.data.disputes.findIndex((d) => d.id === id);
    if (idx !== -1) {
      this.data.disputes[idx] = {
        ...this.data.disputes[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.queueSave();
      return this.data.disputes[idx];
    }
    return null;
  }

  // --- Reviews ---
  createReview(review: Review) {
    // Check if review already exists for this order
    const exists = this.data.reviews.find((r) => r.orderId === review.orderId);
    if (exists) {
      throw new Error('A review has already been submitted for this order.');
    }
    this.data.reviews.unshift(review);
    // Update supplier rating & count
    const supplierProf = this.data.supplierProfiles.find((s) => s.userId === review.supplierId || s.id === review.supplierId);
    if (supplierProf) {
      const allSupplierReviews = this.data.reviews.filter((r) => r.supplierId === review.supplierId);
      const avg = (allSupplierReviews.reduce((acc, r) => acc + r.rating, 0) / allSupplierReviews.length).toFixed(1);
      supplierProf.rating = parseFloat(avg);
      supplierProf.reviewCount = allSupplierReviews.length;
    }
    this.queueSave();
    return review;
  }

  listReviewsBySupplier(supplierId: string) {
    return this.data.reviews.filter((r) => r.supplierId === supplierId);
  }

  // --- Messages ---
  createMessage(msg: Message) {
    this.data.messages.push(msg);
    this.queueSave();
    return msg;
  }

  listMessages(conversationId: string) {
    return this.data.messages.filter((m) => m.conversationId === conversationId);
  }

  listUserConversations(userId: string) {
    const userMessages = this.data.messages.filter((m) => m.senderId === userId || m.recipientId === userId);
    const convIds = Array.from(new Set(userMessages.map((m) => m.conversationId)));
    return convIds.map((cId) => {
      const msgs = this.data.messages.filter((m) => m.conversationId === cId);
      const last = msgs[msgs.length - 1];
      const otherUserId = last.senderId === userId ? last.recipientId : last.senderId;
      const otherUser = this.getUserById(otherUserId);
      const unreadCount = msgs.filter((m) => m.recipientId === userId && !m.read).length;
      return {
        conversationId: cId,
        lastMessage: last,
        otherUser: otherUser ? { id: otherUser.id, name: otherUser.name, role: otherUser.role } : null,
        unreadCount,
      };
    });
  }

  // --- Notifications ---
  createNotification(notif: Notification) {
    this.data.notifications.unshift(notif);
    this.queueSave();
    return notif;
  }

  listNotifications(userId: string) {
    return this.data.notifications.filter((n) => n.userId === userId);
  }

  markNotificationRead(id: string) {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.queueSave();
    }
    return notif;
  }

  // --- Audit Logs ---
  createAuditLog(log: AuditLog) {
    this.data.auditLogs.unshift(log);
    this.queueSave();
    return log;
  }

  listAuditLogs() {
    return this.data.auditLogs;
  }

  // --- Platform Settings ---
  getSettings(): PlatformSettings {
    return this.data.platformSettings;
  }

  updateSettings(updates: Partial<PlatformSettings>) {
    this.data.platformSettings = { ...this.data.platformSettings, ...updates };
    this.queueSave();
    return this.data.platformSettings;
  }

  // --- Real Analytics & Admin Overview ---
  getOverviewMetrics() {
    const totalUsers = this.data.users.length;
    const buyersCount = this.data.users.filter((u) => u.role === 'buyer').length;
    const suppliersCount = this.data.users.filter((u) => u.role === 'supplier').length;
    const verifiedSuppliersCount = this.data.supplierProfiles.filter((s) => s.verificationLevel !== 'unverified').length;
    
    const activeRequestsCount = this.data.sourcingRequests.filter((r) => !['completed', 'cancelled'].includes(r.status)).length;
    const totalQuotesCount = this.data.quotes.length;
    const totalOrdersCount = this.data.orders.length;
    const completedOrdersCount = this.data.orders.filter((o) => o.fulfillmentStatus === 'completed').length;
    
    // Revenue calculations strictly from confirmed transactions and earned commissions
    const confirmedTxns = this.data.transactions.filter((t) => t.status === 'confirmed');
    const transactionVolume = confirmedTxns.reduce((acc, t) => acc + t.amount, 0);
    const earnedCommissions = this.data.commissions
      .filter((c) => c.status === 'earned')
      .reduce((acc, c) => acc + c.platformCommission, 0);

    const pendingBankTransfersCount = this.data.paymentSubmissions.filter((p) => p.status === 'pending').length;
    const approvedBankTransfersCount = this.data.paymentSubmissions.filter((p) => p.status === 'approved').length;
    const rejectedBankTransfersCount = this.data.paymentSubmissions.filter((p) => p.status === 'rejected').length;
    const activeDisputesCount = this.data.disputes.filter((d) => d.status === 'open' || d.status === 'under_review').length;

    return {
      totalUsers,
      buyersCount,
      suppliersCount,
      verifiedSuppliersCount,
      activeRequestsCount,
      totalQuotesCount,
      totalOrdersCount,
      completedOrdersCount,
      transactionVolume,
      earnedCommissions,
      pendingBankTransfersCount,
      approvedBankTransfersCount,
      rejectedBankTransfersCount,
      activeDisputesCount,
    };
  }
}

export const db = new Database();
