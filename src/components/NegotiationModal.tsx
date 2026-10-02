import React, { useState } from 'react';
import { X, Sparkles, Send, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { Quote } from '../types/index.js';
import { api } from '../services/api.js';

interface NegotiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote | null;
  onNegotiationSent: () => void;
}

export const NegotiationModal: React.FC<NegotiationModalProps> = ({
  isOpen,
  onClose,
  quote,
  onNegotiationSent,
}) => {
  if (!isOpen || !quote) return null;

  const [targetPrice, setTargetPrice] = useState<string>(
    Math.round(quote.totalPrice * 0.9).toString()
  );
  const [buyerNotes, setBuyerNotes] = useState('We are ready to initiate Direct Bank Transfer payment today upon confirmation.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposalPreview, setProposalPreview] = useState<{
    message: string;
    rationale: string;
  } | null>(null);

  const discountPercent = (
    ((quote.totalPrice - parseFloat(targetPrice || '0')) / quote.totalPrice) *
    100
  ).toFixed(1);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetVal = parseFloat(targetPrice);
    if (isNaN(targetVal) || targetVal <= 0 || targetVal >= quote.totalPrice) {
      setError('Target price must be lower than the current quote total.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const res = await api.negotiateQuote(quote.id, {
        targetPrice: targetVal,
        buyerNotes,
      });

      setProposalPreview({
        message: res.negotiation.proposalMessage,
        rationale: res.rationale,
      });
      onNegotiationSent();
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch negotiation proposal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-7 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
          <Sparkles className="h-4 w-4" />
          <span>AI Negotiation Assistant</span>
        </div>

        <h3 className="text-xl font-bold text-white">Negotiate with {quote.supplierName}</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Current Quote: <strong className="text-white font-mono">₦{quote.totalPrice.toLocaleString()}</strong> (₦{quote.unitPrice.toLocaleString()}/unit)
        </p>

        {error && (
          <div className="mt-4 flex items-center space-x-2 rounded-xl bg-red-500/10 p-3 text-xs text-red-300 border border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {proposalPreview ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4">
              <span className="text-xs font-bold uppercase text-emerald-400">
                ✓ Negotiation Proposal Sent to Supplier
              </span>
              <p className="text-xs text-slate-300 mt-2 whitespace-pre-line bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
                {proposalPreview.message}
              </p>
              <p className="text-xs text-slate-400 mt-2 italic">
                AI Strategic Rationale: {proposalPreview.rationale}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-white hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Your Target Price (₦ NGN)
              </label>
              <input
                type="number"
                required
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-[11px] text-emerald-400 mt-1 block">
                Discount requested: <strong>{discountPercent}%</strong> off original quote
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Buyer Notes / Commitment Terms
              </label>
              <textarea
                rows={3}
                value={buyerNotes}
                onChange={(e) => setBuyerNotes(e.target.value)}
                placeholder="e.g. Ready to confirm order today, repeat orders likely..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="rounded-xl bg-slate-950/60 p-3 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              💡 Our AI strategist will formulate a courteous, commercial proposal emphasizing immediate order confirmation upon agreed price adjustment.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center space-x-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Generating AI Proposal & Dispatching...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Negotiation Proposal</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
