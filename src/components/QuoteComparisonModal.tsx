import React from 'react';
import { X, Sparkles, Check, AlertTriangle, ShieldCheck, Clock, Award } from 'lucide-react';
import { Quote, SourcingRequest } from '../types/index.js';

interface QuoteComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: SourcingRequest;
  quotes: Quote[];
  analysis: {
    summary: string;
    bestValueSupplierId: string;
    fastestSupplierId: string;
    comparisons: {
      supplierId: string;
      supplierName: string;
      pros: string[];
      cons: string[];
      riskAssessment: string;
    }[];
    recommendation: string;
  } | null;
  onSelectSupplier: (quote: Quote) => void;
  onNegotiate: (quote: Quote) => void;
}

export const QuoteComparisonModal: React.FC<QuoteComparisonModalProps> = ({
  isOpen,
  onClose,
  request,
  quotes,
  analysis,
  onSelectSupplier,
  onNegotiate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
          <Sparkles className="h-4 w-4" />
          <span>AI Commercial Quote Analysis</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white">
          Compare Supplier Quotes for "{request.title}"
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Target budget: ₦{request.budget.toLocaleString()} • Quantity: {request.quantity} units • Delivery to {request.location}
        </p>

        {analysis && (
          <div className="mt-5 space-y-4">
            {/* AI Summary Banner */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-1 flex items-center space-x-1.5">
                <Award className="h-4 w-4 text-emerald-400" />
                <span>Executive Summary & Recommendation</span>
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed">{analysis.summary}</p>
              <div className="mt-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                💡 {analysis.recommendation}
              </div>
            </div>

            {/* Comparison Matrix Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Supplier</th>
                    <th className="p-3.5">Total Quote</th>
                    <th className="p-3.5">Lead Time</th>
                    <th className="p-3.5">Rating / Trust</th>
                    <th className="p-3.5">Key Advantage</th>
                    <th className="p-3.5">Risk Flag</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                  {quotes.map((quote) => {
                    const comp = analysis.comparisons.find((c) => c.supplierId === quote.supplierId);
                    const isBestValue = analysis.bestValueSupplierId === quote.supplierId;
                    const isFastest = analysis.fastestSupplierId === quote.supplierId;

                    return (
                      <tr key={quote.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5">
                          <p className="font-bold text-white">{quote.supplierName}</p>
                          <span className="text-[10px] text-slate-400">{quote.supplierCity}</span>
                          {isBestValue && (
                            <span className="ml-1 inline-block rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                              Best Value
                            </span>
                          )}
                          {isFastest && (
                            <span className="ml-1 inline-block rounded bg-teal-500/20 px-1.5 py-0.2 text-[9px] font-bold text-teal-300 border border-teal-500/30">
                              Fastest
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono">
                          <span className="text-sm font-black text-white">
                            ₦{quote.totalPrice.toLocaleString()}
                          </span>
                          <span className="block text-[10px] text-slate-500">
                            (₦{quote.unitPrice.toLocaleString()}/unit)
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-slate-200">
                            {quote.deliveryTimeDays} days
                          </span>
                          <span className="block text-[10px] text-slate-500">
                            +{quote.productionTimeDays}d prod
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center space-x-1">
                            <span className="text-amber-400 font-bold">★ {quote.supplierRating}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 capitalize">
                            {quote.supplierVerification.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3.5 text-emerald-300">
                          {comp?.pros?.[0] || 'Competitive pricing'}
                        </td>
                        <td className="p-3.5 text-amber-300/80">
                          {comp?.riskAssessment || 'Standard verified supplier'}
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onNegotiate(quote);
                            }}
                            className="rounded-lg bg-slate-800 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-700"
                          >
                            Negotiate
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onSelectSupplier(quote);
                            }}
                            className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-slate-950 hover:bg-emerald-400 shadow-sm shadow-emerald-500/20"
                          >
                            Select & Order
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
