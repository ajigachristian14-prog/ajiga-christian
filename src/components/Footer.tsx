import React from 'react';
import { Compass, ShieldCheck, Building2, MapPin, Mail, Phone, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenAuth: (mode?: 'login' | 'register', defaultRole?: 'buyer' | 'supplier') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAuth }) => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 font-black">
                <Compass className="h-5 w-5 stroke-[2.5]" />
              </div>
              <span className="text-base font-black text-white">AI Middleman</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nigeria's AI-powered procurement marketplace. Connecting vetted corporate buyers with verified suppliers across Lagos, Ibadan, Abuja, Port Harcourt, and nationwide.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 pt-1">
              <ShieldCheck className="h-4 w-4" />
              <span>Verified Direct Bank Transfer rail</span>
            </div>
          </div>

          {/* Sourcing & Marketplace */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Sourcing</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('sourcing_create')} className="hover:text-emerald-400 transition-colors">
                  Submit Sourcing Request
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('marketplace')} className="hover:text-emerald-400 transition-colors">
                  Supplier Directory
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('how_it_works')} className="hover:text-emerald-400 transition-colors">
                  Procurement Process
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pricing')} className="hover:text-emerald-400 transition-colors">
                  Commission & Pricing
                </button>
              </li>
            </ul>
          </div>

          {/* Supplier & Verification */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Suppliers</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onOpenAuth('register', 'supplier')} className="hover:text-emerald-400 transition-colors">
                  Become a Verified Supplier
                </button>
              </li>
              <li>
                <span className="text-slate-500">CAC Business Verification</span>
              </li>
              <li>
                <span className="text-slate-500">RFQ Opportunity Matching</span>
              </li>
              <li>
                <span className="text-slate-500">Escrow Payout Guidelines</span>
              </li>
            </ul>
          </div>

          {/* Direct Bank Transfer & Compliance */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-1">Treasury & Bank Payment</h4>
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-[11px] leading-relaxed">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold mb-1">
                <Lock className="h-3.5 w-3.5" />
                <span>Official Receiving Account</span>
              </div>
              <p className="text-slate-300">
                Bank: <strong className="text-white">OPAY</strong><br />
                Account Name: <strong className="text-white">OLAROTIMI RUFUS AJIGA</strong><br />
                Account No: <strong className="text-emerald-300 font-mono">8149482654</strong>
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                All Direct Bank Transfers are strictly verified by treasury before orders enter fulfillment.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 AI Middleman Ltd. All rights reserved. Nigeria Trade & Procurement Platform.</p>
          <div className="flex space-x-4 mt-2 sm:mt-0 text-[11px]">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Procurement</span>
            <span>•</span>
            <span>Refund & Escrow Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
