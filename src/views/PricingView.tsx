import React from 'react';
import { Check, Sparkles, Building2, ShieldCheck, ArrowRight, Lock } from 'lucide-react';

interface PricingViewProps {
  onNavigate: (view: string) => void;
  onOpenAuth: (mode?: 'login' | 'register', defaultRole?: 'buyer' | 'supplier') => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ onNavigate, onOpenAuth }) => {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Transparent Commercial Model</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Pricing & Commission Structure
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Fair, success-based transaction fees. Zero hidden charges.
        </p>
      </div>

      {/* Primary Model: Transaction Commission */}
      <div className="rounded-3xl border border-emerald-500/40 bg-slate-900/80 p-8 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
          <div>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              Primary Marketplace Monetization
            </span>
            <h3 className="text-2xl font-black text-white mt-2">5% Standard Transaction Commission</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-lg">
              Paid by the platform upon successful fulfillment. Deducted automatically from the gross order subtotal before supplier payout.
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Min Platform Fee</span>
            <span className="text-3xl font-black text-emerald-400 font-mono">₦2,500</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
            <strong className="text-white font-semibold block mb-1">1. Buyer Sourcing is Free</strong>
            <p className="text-slate-400 leading-relaxed">
              Buyers create requests, receive quotes, and use AI negotiation assistance at zero upfront cost.
            </p>
          </div>

          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
            <strong className="text-white font-semibold block mb-1">2. Escrow Protection</strong>
            <p className="text-slate-400 leading-relaxed">
              Direct Bank Transfer payments are held securely in treasury until delivery is confirmed by buyer.
            </p>
          </div>

          <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
            <strong className="text-white font-semibold block mb-1">3. Guaranteed Payout</strong>
            <p className="text-slate-400 leading-relaxed">
              Suppliers receive net earnings immediately upon buyer confirmation of order receipt.
            </p>
          </div>
        </div>
      </div>

      {/* Supplier & Buyer Optional Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Supplier Membership</span>
            <h3 className="text-xl font-bold text-white mt-1">Verified Supplier Pro</h3>
            <p className="text-xs text-slate-400 mt-1">Optional upgrade for high-volume manufacturers & importers</p>
          </div>

          <div className="text-2xl font-black text-white font-mono">
            ₦35,000 <span className="text-xs font-normal text-slate-400">/ month</span>
          </div>

          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>Priority placement in matching algorithms</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>Official "Platform Verified" Gold Badge eligibility</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>Unlimited RFQ quoting opportunities</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>SMS & WhatsApp priority lead notifications</span>
            </li>
          </ul>

          <button
            onClick={() => onOpenAuth('register', 'supplier')}
            className="w-full rounded-xl bg-slate-800 py-3 text-xs font-bold text-white hover:bg-slate-700"
          >
            Register as Supplier
          </button>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Buyer Enterprise</span>
            <h3 className="text-xl font-bold text-white mt-1">Procurement Plus</h3>
            <p className="text-xs text-slate-400 mt-1">For corporate teams with frequent sourcing requirements</p>
          </div>

          <div className="text-2xl font-black text-white font-mono">
            ₦25,000 <span className="text-xs font-normal text-slate-400">/ month</span>
          </div>

          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-teal-400 flex-shrink-0" />
              <span>Dedicated human procurement manager inspection</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-teal-400 flex-shrink-0" />
              <span>Deep-dive vendor financial background reports</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-teal-400 flex-shrink-0" />
              <span>Custom contract & SLA drafting support</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-teal-400 flex-shrink-0" />
              <span>Unlimited RFQ broadcasting</span>
            </li>
          </ul>

          <button
            onClick={() => onNavigate('sourcing_create')}
            className="w-full rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400"
          >
            Start Sourcing Now
          </button>
        </div>
      </div>
    </div>
  );
};
