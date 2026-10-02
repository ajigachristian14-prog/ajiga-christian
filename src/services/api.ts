import {
  User,
  SupplierProfile,
  SourcingRequest,
  SupplierMatch,
  Quote,
  Order,
  PaymentSubmission,
  Transaction,
  Notification,
  AuditLog,
  PlatformSettings,
  Review,
} from '../types/index.js';

const TOKEN_KEY = 'aimiddleman_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export const api = {
  // Config
  getConfig: () => request<{
    platformName: string;
    tagline: string;
    currency: string;
    supportedCities: string[];
    commissionPercent: number;
    directBankTransfer: {
      bankName: string;
      accountName: string;
      accountNumber: string;
    };
    hasAiKey: boolean;
  }>('/config'),

  // Auth
  register: (payload: {
    email: string;
    password: string;
    name: string;
    role: 'buyer' | 'supplier';
    phone?: string;
    company?: string;
    location?: string;
  }) => request<{ user: User; token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  login: (payload: { email: string; password: string }) =>
    request<{ user: User; token: string; supplierProfile?: SupplierProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  quickLogin: (accountKey: 'admin' | 'buyer' | 'supplier-apparel' | 'supplier-furniture' | 'supplier-industrial' | 'supplier-tech') =>
    request<{ user: User; token: string; supplierProfile?: SupplierProfile }>('/auth/quick-login', {
      method: 'POST',
      body: JSON.stringify({ accountKey }),
    }),

  getCurrentUser: () =>
    request<{ user: User; supplierProfile?: SupplierProfile }>('/auth/me'),

  // Sourcing & AI
  parsePrompt: (prompt: string) =>
    request<{ data: any }>('/sourcing/parse', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }),

  createRequest: (payload: any) =>
    request<{ request: SourcingRequest; matchedCount: number; matches: SupplierMatch[]; message: string }>(
      '/sourcing/requests',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),

  getRequests: () => request<{ requests: SourcingRequest[] }>('/sourcing/requests'),

  getRequestDetail: (id: string) =>
    request<{ request: SourcingRequest; matches: SupplierMatch[]; quotes: Quote[] }>(`/sourcing/requests/${id}`),

  // Quotes
  submitQuote: (payload: any) =>
    request<{ quote: Quote }>('/quotes', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  analyzeQuotes: (requestId: string) =>
    request<{ analysis: any }>('/quotes/analyze', {
      method: 'POST',
      body: JSON.stringify({ requestId }),
    }),

  negotiateQuote: (quoteId: string, payload: { targetPrice: number; buyerNotes?: string }) =>
    request<{ negotiation: any; rationale: string }>(`/quotes/${quoteId}/negotiate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  respondNegotiation: (negId: string, payload: { action: 'accept' | 'counter' | 'reject'; counterPrice?: number; message?: string }) =>
    request<{ negotiation: any }>(`/negotiations/${negId}/respond`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  acceptQuote: (quoteId: string, payload: { deliveryAddress: string; deliveryCity: string }) =>
    request<{ order: Order }>(`/quotes/${quoteId}/accept`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Orders & Direct Bank Transfer
  getOrders: () => request<{ orders: Order[] }>('/orders'),

  getOrderDetail: (id: string) =>
    request<{
      order: Order;
      submissions: PaymentSubmission[];
      transactions: Transaction[];
      officialAccount: {
        bankName: string;
        accountName: string;
        accountNumber: string;
      };
    }>(`/orders/${id}`),

  submitDirectBankTransfer: (
    orderId: string,
    payload: {
      amountClaimed: number;
      senderName: string;
      referenceId: string;
      proofFile?: string;
      proofFileName?: string;
    }
  ) =>
    request<{ message: string; submission: PaymentSubmission }>(`/orders/${orderId}/direct-bank-transfer`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  confirmDelivery: (orderId: string) =>
    request<{ message: string; order: Order }>(`/orders/${orderId}/confirm-delivery`, {
      method: 'POST',
    }),

  // Reviews
  submitReview: (payload: {
    orderId: string;
    rating: number;
    qualityRating: number;
    communicationRating: number;
    deliveryRating: number;
    accuracyRating: number;
    comment: string;
  }) =>
    request<{ review: Review }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Suppliers Directory
  getSuppliers: (params?: { category?: string; city?: string; search?: string; verifiedOnly?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set('category', params.category);
    if (params?.city) q.set('city', params.city);
    if (params?.search) q.set('search', params.search);
    if (params?.verifiedOnly) q.set('verifiedOnly', 'true');
    return request<{ suppliers: SupplierProfile[] }>(`/suppliers?${q.toString()}`);
  },

  getSupplierDetail: (id: string) =>
    request<{ profile: SupplierProfile; reviews: Review[] }>(`/suppliers/${id}`),

  updateSupplierOnboarding: (payload: Partial<SupplierProfile>) =>
    request<{ profile: SupplierProfile }>('/suppliers/onboarding', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Notifications
  getNotifications: () => request<{ notifications: Notification[] }>('/notifications'),

  markNotificationRead: (id: string) =>
    request<{ notification: Notification }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  // Admin
  getAdminOverview: () => request<{ metrics: any }>('/admin/overview'),

  getAdminBankTransfers: (params?: { status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    return request<{ submissions: PaymentSubmission[] }>(`/admin/bank-transfers?${q.toString()}`);
  },

  verifyBankTransfer: (
    submissionId: string,
    payload: {
      action: 'approve' | 'reject';
      adminNote?: string;
      rejectionReason?: string;
    }
  ) =>
    request<{ message: string; submission: PaymentSubmission }>(`/admin/bank-transfers/${submissionId}/verify`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getAdminUsers: () => request<{ users: User[] }>('/admin/users'),

  updateUserStatus: (userId: string, status: 'active' | 'suspended') =>
    request<{ user: User }>(`/admin/users/${userId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),

  verifySupplier: (supplierId: string, payload: { verificationLevel: string; verificationNotes?: string }) =>
    request<{ supplier: SupplierProfile }>(`/admin/suppliers/${supplierId}/verify`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getAdminSettings: () => request<{ settings: PlatformSettings }>('/admin/settings'),

  updateAdminSettings: (payload: Partial<PlatformSettings>) =>
    request<{ settings: PlatformSettings }>('/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  getAdminAuditLogs: () => request<{ logs: AuditLog[] }>('/admin/audit-logs'),

  getAdminTransactions: () => request<{ transactions: Transaction[]; commissions: any[] }>('/admin/transactions'),
};
