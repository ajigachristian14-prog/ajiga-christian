import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Building2,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  ChevronRight,
  TrendingDown,
  Award,
} from 'lucide-react';
import { SourcingRequest, SupplierMatch, Quote } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { QuoteComparisonModal } from '../components/QuoteComparisonModal.js';
import { NegotiationModal } from '../components/NegotiationModal.js';

interface SourcingDetailViewProps {
  requestId: string;
  onNavigate: (view: string, id?: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const SourcingDetailView: React.FC<SourcingDetailViewProps> = ({
  requestId,
  onNavigate,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const [request, setRequest] = useState<SourcingRequest | null>(null);
  const [matches, setMatches] = useState<SupplierMatch[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comparison & Negotiation Modals
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonAnalysis, setComparisonAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [selectedQuoteForNeg, setSelectedQuoteForNeg] = useState<Quote | null>(null);

  // Supplier Quote Submission State (if current user is a supplier)
  const [quoteUnitPrice, setQuoteUnitPrice] = useState<number>(0);
  const [quoteDeliveryCost, setQuoteDeliveryCost] = useState<number>(15000);
  const [quoteProdDays, setQuoteProdDays] = useState<number>(7);
  const [quoteDelivDays, setQuoteDelivDays] = useState<number>(3);
  const [quoteWarranty, setQuoteWarranty] = useState<string>('30 days defect replacement warranty');
  const [quoteNotes, setQuoteNotes] = useState<string>('Certified manufacturing and delivery inspection.');
  const [isSubmittingQuote, setIsSubmittingQuote] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getRequestDetail(requestId);
      setRequest(data.request);
      setMatches(data.matches || []);
      setQuotes(data.quotes || []);

      // If buyer and budget is known, set default quote unit price estimate for suppliers
      if (data.request.budget && data.request.quantity) {
        setQuoteUnitPrice(Math.round(data.request.budget / data.request.quantity));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load sourcing request details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [requestId]);

  const handleOpenComparison = async () => {
    if (quotes.length === 0) return;
    setIsAnalyzing(true);
    setShowComparison(true);
    try {
      const res = await api.analyzeQuotes(requestId);
      setComparisonAnalysis(res.analysis);
    } catch (err: any) {
      console.error('Quote comparison analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAcceptQuote = async (quote: Quote) => {
    try {
      const res = await api.acceptQuote(quote.id, {
        deliveryAddress: request?.location || 'Lagos',
        deliveryCity: request?.location || 'Lagos',
      });
      onNavigate('order_detail', res.order.id);
    } catch (err: any) {
      alert(err.message || 'Failed to accept quote.');
    }
  };

  const handleSupplierSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'supplier') return;
    if (!request) return;

    setIsSubmittingQuote(true);
    try {
      const totalPrice = quoteUnitPrice * request.quantity + quoteDeliveryCost;
      await api.submitQuote({
        requestId: request.id,
        unitPrice: quoteUnitPrice,
        totalPrice,
        minOrderQty: 1,
        productionTimeDays: quoteProdDays,
        deliveryTimeDays: quoteDelivDays,
        deliveryCost: quoteDeliveryCost,
        warranty: quoteWarranty,
        notes: quoteNotes,
      });

      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit quote.');
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center space-x-2 text-emerald-400">
          <Clock className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Loading Sourcing Request...</span>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 mb-3">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Sourcing Request Not Found</h3>
        <p className="text-xs text-slate-400 mt-1">{error || 'The requested RFQ could not be located.'}</p>
        <button
          onClick={() => onNavigate('home')}
          className="mt-6 inline-flex items-center space-x-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return Home</span>
        </button>
      </div>
    );
  }

  const isBuyerOwner = user?.id === request.buyerId;
  const isSupplier = user?.role === 'supplier';
  const supplierHasQuoted = quotes.some((q) => q.supplierId === user?.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Breadcrumb & ID */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('buyer_dashboard')}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {request.id}
              </span>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
                {request.status.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">{request.title}</h1>
          </div>
        </div>

        {quotes.length > 1 && isBuyerOwner && (
          <button
            onClick={handleOpenComparison}
            className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:brightness-110 shadow-lg shadow-emerald-500/20"
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Compare Quotes ({quotes.length})</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Request Details & Quotes */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Request Specifications Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center space-x-2">
              <FileText className="h-4 w-4 text-emerald-400" />
              <span>Procurement Specifications</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-xl bg-slate-950/60 p-4 border border-slate-800/80 mb-5">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Quantity</span>
                <p className="text-base font-bold text-white font-mono mt-0.5">
                  {request.quantity.toLocaleString()} {request.unit || 'units'}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Target Budget</span>
                <p className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                  ₦{request.budget.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Location</span>
                <p className="text-sm font-bold text-white mt-0.5 truncate">{request.location}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">Deadline</span>
                <p className="text-sm font-bold text-white mt-0.5 truncate">{request.deliveryDeadline}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div>
                <strong className="text-slate-400 font-semibold block mb-0.5">Product / Service:</strong>
                <p className="text-white">{request.productOrService}</p>
              </div>
              {request.specifications && (
                <div>
                  <strong className="text-slate-400 font-semibold block mb-0.5">Technical Specs:</strong>
                  <p className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 text-slate-300 whitespace-pre-line">
                    {request.specifications}
                  </p>
                </div>
              )}
              {request.customization && (
                <div>
                  <strong className="text-slate-400 font-semibold block mb-0.5">Customization / Branding:</strong>
                  <p>{request.customization}</p>
                </div>
              )}
            </div>
          </div>

          {/* 2. Received Quotations List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <span>Supplier Quotations</span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-mono text-emerald-300">
                    {quotes.length}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Quotes submitted by verified suppliers</p>
              </div>

              {quotes.length > 1 && isBuyerOwner && (
                <button
                  onClick={handleOpenComparison}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Run AI Comparison</span>
                </button>
              )}
            </div>

            {quotes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center bg-slate-900/30">
                <Clock className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white">Awaiting Supplier Quotes</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Your request has been broadcast to {matches.length} matching suppliers. You will receive quotes here shortly.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {quotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-emerald-500/40 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-white text-base">{quote.supplierName}</h4>
                          <span className="text-xs text-amber-400 font-bold">★ {quote.supplierRating}</span>
                          <span className="rounded-full bg-slate-800 px-2 py-0.2 text-[10px] font-semibold text-slate-300 capitalize">
                            {quote.supplierVerification.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{quote.supplierCity}</p>

                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-300">
                          <span>
                            Turnaround: <strong className="text-white">{quote.deliveryTimeDays} days</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Production: <strong className="text-white">{quote.productionTimeDays} days</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Warranty: <strong className="text-white">{quote.warranty}</strong>
                          </span>
                        </div>

                        {quote.notes && (
                          <p className="mt-2 text-xs italic text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                            "{quote.notes}"
                          </p>
                        )}
                      </div>

                      <div className="text-left sm:text-right flex-shrink-0">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                          Total Quote
                        </span>
                        <p className="text-2xl font-black text-emerald-400 font-mono">
                          ₦{quote.totalPrice.toLocaleString()}
                        </p>
                        <span className="text-xs font-mono text-slate-400">
                          (₦{quote.unitPrice.toLocaleString()}/unit + ₦{quote.deliveryCost.toLocaleString()} deliv)
                        </span>

                        {isBuyerOwner && (
                          <div className="mt-4 flex items-center sm:justify-end space-x-2">
                            <button
                              onClick={() => setSelectedQuoteForNeg(quote)}
                              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
                            >
                              Negotiate
                            </button>
                            <button
                              onClick={() => handleAcceptQuote(quote)}
                              className="rounded-xl bg-emerald-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow-md shadow-emerald-500/20"
                            >
                              Accept Quote
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. If Logged-in Supplier: Submit Quote Form */}
          {isSupplier && !supplierHasQuoted && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Building2 className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Submit a Quote for this RFQ</h3>
              </div>

              <form onSubmit={handleSupplierSubmitQuote} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Unit Price (₦)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={quoteUnitPrice}
                      onChange={(e) => setQuoteUnitPrice(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Delivery Cost (₦)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={quoteDeliveryCost}
                      onChange={(e) => setQuoteDeliveryCost(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Delivery Days
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={quoteDelivDays}
                      onChange={(e) => setQuoteDelivDays(parseInt(e.target.value, 10) || 1)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Warranty Terms
                    </label>
                    <input
                      type="text"
                      value={quoteWarranty}
                      onChange={(e) => setQuoteWarranty(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Notes to Buyer
                    </label>
                    <input
                      type="text"
                      value={quoteNotes}
                      onChange={(e) => setQuoteNotes(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400">
                    Calculated Total Quote:{' '}
                    <strong className="text-emerald-400 font-mono text-sm">
                      ₦{(quoteUnitPrice * request.quantity + quoteDeliveryCost).toLocaleString()}
                    </strong>
                  </span>

                  <button
                    type="submit"
                    disabled={isSubmittingQuote}
                    className="rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {isSubmittingQuote ? 'Submitting Quote...' : 'Submit Quote'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Col: Matched Suppliers & Summary */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Matched Verified Suppliers ({matches.length})</span>
            </h3>

            {matches.length === 0 ? (
              <p className="text-xs text-slate-400">
                We are actively matching suppliers from our verified directory.
              </p>
            ) : (
              <div className="space-y-3">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-xs truncate max-w-[160px]">
                        {match.supplierName}
                      </h4>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          match.matchTier === 'Strong Match'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                        }`}
                      >
                        {match.matchTier}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-1">
                      <MapPin className="h-3 w-3 text-emerald-400" />
                      <span>{match.supplierCity}</span>
                      <span>•</span>
                      <span className="text-amber-400">★ {match.supplierRating}</span>
                    </div>

                    <ul className="mt-2 space-y-1">
                      {match.reasons.map((r, i) => (
                        <li key={i} className="text-[10px] text-slate-400 flex items-center space-x-1">
                          <span className="text-emerald-400">✓</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quote Comparison Modal */}
      <QuoteComparisonModal
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        request={request}
        quotes={quotes}
        analysis={comparisonAnalysis}
        onSelectSupplier={handleAcceptQuote}
        onNegotiate={(q) => setSelectedQuoteForNeg(q)}
      />

      {/* Negotiation Modal */}
      <NegotiationModal
        isOpen={!!selectedQuoteForNeg}
        onClose={() => setSelectedQuoteForNeg(null)}
        quote={selectedQuoteForNeg}
        onNegotiationSent={loadData}
      />
    </div>
  );
};
