export type UserRole = 'buyer' | 'supplier' | 'admin';

export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  company?: string;
  location?: string;
  avatarUrl?: string;
  status: UserStatus;
  createdAt: string;
}

export type VerificationLevel = 'unverified' | 'identity_verified' | 'business_verified' | 'platform_verified';

export interface SupplierProfile {
  id: string;
  userId: string;
  businessName: string;
  registrationNumber?: string;
  logo?: string;
  description: string;
  city: string;
  address: string;
  categories: string[];
  productsServices: string[];
  minOrderAmount: number;
  deliveryLocations: string[];
  verificationLevel: VerificationLevel;
  verificationDocUrl?: string;
  verificationNotes?: string;
  rating: number;
  reviewCount: number;
  completedTransactions: number;
  responseRate: number; // percentage, e.g. 98
  typicalResponseTime: string; // e.g. "Under 2 hours"
  isFeatured: boolean;
  createdAt: string;
}

export type RequestStatus = 
  | 'draft'
  | 'submitted'
  | 'processing'
  | 'supplier_matching'
  | 'awaiting_quotes'
  | 'quotes_received'
  | 'negotiation'
  | 'buyer_reviewing'
  | 'supplier_selected'
  | 'payment_pending'
  | 'in_fulfillment'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export interface SourcingRequest {
  id: string; // e.g. REQ-2026-000001
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  title: string;
  category: string;
  productOrService: string;
  quantity: number;
  unit?: string;
  budget: number;
  currency: 'NGN';
  location: string;
  deliveryDeadline: string;
  qualityRequirements?: string;
  specifications: string;
  customization?: string;
  additionalRequirements?: string;
  status: RequestStatus;
  aiExtracted?: {
    category: string;
    product: string;
    quantity: number;
    budget: number;
    location: string;
    deadline: string;
    confidence: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type MatchTier = 'Strong Match' | 'Good Match' | 'Possible Match';

export interface SupplierMatch {
  id: string;
  requestId: string;
  supplierId: string;
  supplierName: string;
  supplierCity: string;
  supplierRating: number;
  verificationLevel: VerificationLevel;
  matchScore: number; // 0-100
  matchTier: MatchTier;
  reasons: string[];
  createdAt: string;
}

export type QuoteStatus = 'draft' | 'submitted' | 'negotiation' | 'accepted' | 'rejected' | 'expired';

export interface Quote {
  id: string; // QTE-2026-000001
  requestId: string;
  supplierId: string;
  supplierName: string;
  supplierCity: string;
  supplierRating: number;
  supplierVerification: VerificationLevel;
  unitPrice: number;
  totalPrice: number;
  minOrderQty: number;
  productionTimeDays: number;
  deliveryTimeDays: number;
  deliveryCost: number;
  warranty: string;
  paymentTerms: string;
  validUntil: string;
  notes: string;
  status: QuoteStatus;
  attachments?: string[];
  createdAt: string;
}

export interface Negotiation {
  id: string;
  quoteId: string;
  requestId: string;
  buyerId: string;
  supplierId: string;
  initiatedBy: 'buyer' | 'supplier';
  originalPrice: number;
  proposedPrice: number;
  proposalMessage: string;
  supplierResponse?: string;
  revisedQuotePrice?: number;
  status: 'pending' | 'accepted' | 'countered' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export type OrderPaymentStatus = 'pending' | 'pending_verification' | 'paid' | 'failed' | 'refunded';
export type OrderFulfillmentStatus = 'processing' | 'in_production' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'disputed';

export interface Order {
  id: string; // ORD-2026-000001
  requestId: string;
  quoteId: string;
  buyerId: string;
  buyerName: string;
  supplierId: string;
  supplierName: string;
  itemsDescription: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  deliveryCost: number;
  platformFee: number;
  totalAmount: number;
  supplierEarnings: number;
  currency: 'NGN';
  paymentStatus: OrderPaymentStatus;
  fulfillmentStatus: OrderFulfillmentStatus;
  deliveryAddress: string;
  deliveryCity: string;
  trackingNumber?: string;
  buyerConfirmedDelivery: boolean;
  paymentMethod?: 'Direct Bank Transfer' | 'Online Gateway';
  createdAt: string;
  updatedAt: string;
}

export type PaymentSubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface PaymentSubmission {
  id: string; // SUB-2026-000001
  userId: string;
  userName: string;
  userEmail: string;
  orderId: string;
  orderNumber: string;
  transactionId?: string;
  amountClaimed: number;
  expectedAmount: number;
  currency: 'NGN';
  senderName: string;
  bankMethod: 'Direct Bank Transfer';
  referenceId: string;
  proofFile?: string; // Base64 data URI
  proofFileName?: string;
  status: PaymentSubmissionStatus;
  submittedAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  adminNote?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string; // TXN-2026-000001
  orderId: string;
  userId: string;
  amount: number;
  currency: 'NGN';
  type: 'buyer_payment' | 'platform_commission' | 'supplier_payout';
  paymentMethod: 'Direct Bank Transfer' | 'Online Gateway';
  reference: string;
  status: 'pending' | 'confirmed' | 'failed' | 'refunded';
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Commission {
  id: string;
  orderId: string;
  transactionId: string;
  grossAmount: number;
  commissionPercent: number;
  platformCommission: number;
  supplierAmount: number;
  status: 'unearned' | 'earned' | 'paid_out';
  earnedAt?: string | null;
  createdAt: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  orderNumber: string;
  openedBy: string; // userId
  openedByName: string;
  againstUser: string; // userId
  reason: string;
  description: string;
  evidence?: string[];
  requestedResolution: string;
  status: 'open' | 'under_review' | 'awaiting_info' | 'resolved' | 'rejected' | 'escalated';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  supplierId: string;
  rating: number; // 1-5
  qualityRating: number;
  communicationRating: number;
  deliveryRating: number;
  accuracyRating: number;
  comment: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string;
  message: string;
  attachments?: string[];
  read: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'quote' | 'payment' | 'order' | 'negotiation' | 'verification' | 'system';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export interface PlatformSettings {
  platformName: string;
  tagline: string;
  supportEmail: string;
  commissionPercent: number; // default 5%
  minPlatformFee: number; // default 2500 NGN
  directBankTransferBankName: string; // "OPAY"
  directBankTransferAccountName: string; // "OLAROTIMI RUFUS AJIGA"
  directBankTransferAccountNumber: string; // "8149482654"
  supportedCities: string[];
  currency: string;
  buyerSubscriptionMonthlyFee: number;
  supplierSubscriptionMonthlyFee: number;
}
