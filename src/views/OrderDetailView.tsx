import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Package,
  Building2,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  Star,
  FileCheck,
  CreditCard,
} from 'lucide-react';
import { Order, PaymentSubmission, Transaction } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { DirectBankTransferCard } from '../components/DirectBankTransferCard.js';

interface OrderDetailViewProps {
  orderId: string;
  onNavigate: (view: string, id?: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const OrderDetailView: React.FC<OrderDetailViewProps> = ({
  orderId,
  onNavigate,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [officialAccount, setOfficialAccount] = useState<{
    bankName: string;
    accountName: string;
    accountNumber: string;
  }>({
    bankName: 'OPAY',
    accountName: 'OLAROTIMI RUFUS AJIGA',
    accountNumber: '8149482654',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getOrderDetail(orderId);
      setOrder(data.order);
      setSubmissions(data.submissions || []);
      setTransactions(data.transactions || []);
      if (data.officialAccount) {
        setOfficialAccount(data.officialAccount);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load order details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orderId]);

  const handleConfirmDelivery = async () => {
    if (!order) return;
    try {
      await api.confirmDelivery(order.id);
      await loadData();
      setShowReviewModal(true);
    } catch (err: any) {
      alert(err.message || 'Failed to confirm delivery.');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setIsSubmittingReview(true);
    try {
      await api.submitReview({
        orderId: order.id,
        rating,
        qualityRating,
        communicationRating,
        deliveryRating,
        accuracyRating: 5,
        comment,
      });
      setReviewSubmitted(true);
      setShowReviewModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center space-x-2 text-emerald-400">
          <Clock className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Loading Order Details...</span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 mb-3">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Order Not Found</h3>
        <p className="text-xs text-slate-400 mt-1">{error || 'This order does not exist or access is restricted.'}</p>
        <button
          onClick={() => onNavigate('buyer_dashboard')}
          className="mt-6 inline-flex items-center space-x-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Go to Orders</span>
        </button>
      </div>
    );
  }

  const isBuyer = user?.id === order.buyerId;
  const isSupplier = user?.id === order.supplierId;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate(isSupplier ? 'supplier_dashboard' : 'buyer_dashboard')}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {order.id}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                  order.paymentStatus === 'paid'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : order.paymentStatus === 'pending_verification'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                Payment: {order.paymentStatus.replace('_', ' ')}
              </span>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
                Fulfillment: {order.fulfillmentStatus.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
              Procurement Order: {order.itemsDescription}
            </h1>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Order Total</span>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            ₦{order.totalAmount.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Payment & Fulfillment */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Progress Lifecycle */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Order Fulfillment Progress
            </h3>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div
                className={`p-3 rounded-xl border ${
                  order.paymentStatus === 'paid'
                    ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400'
                }`}
              >
                <div className="font-bold">1. Payment</div>
                <div className="text-[10px] mt-0.5 capitalize">{order.paymentStatus.replace('_', ' ')}</div>
              </div>

              <div
                className={`p-3 rounded-xl border ${
                  ['in_production', 'shipped', 'delivered', 'completed'].includes(order.fulfillmentStatus)
                    ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400'
                }`}
              >
                <div className="font-bold">2. Production</div>
                <div className="text-[10px] mt-0.5">Fulfillment</div>
              </div>

              <div
                className={`p-3 rounded-xl border ${
                  ['shipped', 'delivered', 'completed'].includes(order.fulfillmentStatus)
                    ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400'
                }`}
              >
                <div className="font-bold">3. Shipping</div>
                <div className="text-[10px] mt-0.5">In Transit</div>
              </div>

              <div
                className={`p-3 rounded-xl border ${
                  order.fulfillmentStatus === 'completed'
                    ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400'
                }`}
              >
                <div className="font-bold">4. Completed</div>
                <div className="text-[10px] mt-0.5">Delivered</div>
              </div>
            </div>

            {/* Buyer Delivery Confirmation Action */}
            {isBuyer && order.paymentStatus === 'paid' && order.fulfillmentStatus !== 'completed' && (
              <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-white">Have you received and inspected your order?</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Confirming delivery completes the transaction and marks the platform payout for the supplier.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleConfirmDelivery}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow-md shadow-emerald-500/20 flex-shrink-0"
                >
                  Confirm Delivery & Receipt
                </button>
              </div>
            )}
          </div>

          {/* DIRECT BANK TRANSFER CARD (Official Receiving Account) */}
          <DirectBankTransferCard
            order={order}
            submissions={submissions}
            officialAccount={officialAccount}
            onPaymentSubmitted={loadData}
          />
        </div>

        {/* Right Col: Financial Breakdown & Participants */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Financial Breakdown
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal ({order.quantity} units)</span>
                <span className="font-mono font-medium">₦{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Delivery & Logistics</span>
                <span className="font-mono font-medium">₦{order.deliveryCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Platform Commission ({((order.platformFee / order.subtotal) * 100).toFixed(1)}%)</span>
                <span className="font-mono">₦{order.platformFee.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-800 pt-3 flex justify-between text-sm font-bold text-white">
                <span>Total Amount Payable</span>
                <span className="font-mono text-emerald-400">₦{order.totalAmount.toLocaleString()}</span>
              </div>
              {isSupplier && (
                <div className="mt-2 rounded-lg bg-emerald-500/10 p-2 text-[11px] text-emerald-300 border border-emerald-500/20">
                  Net supplier payout upon delivery: <strong>₦{order.supplierEarnings.toLocaleString()}</strong>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Order Participants
            </h3>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase font-medium">Buyer</span>
                <p className="font-bold text-white mt-0.5">{order.buyerName}</p>
                <div className="flex items-center space-x-1 text-slate-400 text-[11px] mt-1">
                  <MapPin className="h-3 w-3 text-emerald-400" />
                  <span>{order.deliveryAddress}, {order.deliveryCity}</span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase font-medium">Supplier</span>
                <p className="font-bold text-white mt-0.5">{order.supplierName}</p>
                <div className="flex items-center space-x-1 text-emerald-400 text-[11px] mt-1">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Verified Platform Supplier</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Review {order.supplierName}</h3>
            <p className="text-xs text-slate-400 mt-1">
              Rate your procurement fulfillment experience to build marketplace trust.
            </p>

            <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Overall Rating (1 - 5 Stars)
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-xl ${star <= rating ? 'text-amber-400' : 'text-slate-600'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Review Comment
                </label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Excellent material quality, delivered 2 days ahead of schedule to our Ibadan facility."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white"
                >
                  Later
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
