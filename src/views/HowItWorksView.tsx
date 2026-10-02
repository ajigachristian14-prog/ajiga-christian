import React from 'react';
import {
  Sparkles,
  Building2,
  FileCheck,
  Scale,
  CreditCard,
  Truck,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface HowItWorksViewProps {
  onNavigate: (view: string) => void;
  onOpenAuth: (mode?: 'login' | 'register', defaultRole?: 'buyer' | 'supplier') => void;
}

export const HowItWorksView: React.FC<HowItWorksViewProps> = ({ onNavigate, onOpenAuth }) => {
  const steps = [
    {
      num: 1,
      title: 'Tell us what you need',
      desc: 'Describe your product or service requirement in normal conversational language. Mention quantities, target budget, and delivery city.',
      icon: Sparkles,
    },
    {
      num: 2,
      title: 'AI understands your request',
      desc: 'Our Gemini-powered engine extracts technical specifications, category classification, timelines, and commercial constraints.',
      icon: FileCheck,
    },
    {
      num: 3,
      title: 'We find matching suppliers',
      desc: 'Your request is matched against vetted Nigerian manufacturers, distributors, and corporate suppliers.',
      icon: Building2,
    },
    {
      num: 4,
      title: 'Compare offers',
      desc: 'Review structured quotations with itemized unit prices, production days, shipping costs, and warranty commitments.',
      icon: Scale,
    },
    {
      num: 5,
      title: 'AI-assisted negotiation',
      desc: 'Request strategic price concessions. Our AI helps draft respectful, volume-based counter-proposals.',
      icon: ShieldCheck,
    },
    {
      num: 6,
      title: 'Choose your supplier',
      desc: 'Accept the winning quote. An authoritative order contract with unique ID is generated immediately.',
      icon: CheckCircle2,
    },
    {
      num: 7,
      title: 'Pay securely via Direct Bank Transfer',
      desc: 'Transfer directly to our designated OPAY platform receiving account. Funds are held in escrow until delivery.',
      icon: Lock,
    },
    {
      num: 8,
      title: 'Track your order to completion',
      desc: 'Monitor production and transit in real time. Confirm final receipt to release supplier payout.',
      icon: Truck,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>The Modern Procurement Standard</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          How AI Middleman Works
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          From natural language input to verified delivery: a streamlined 8-step B2B procurement workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex items-start space-x-4 hover:border-emerald-500/40 transition-colors"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-base flex-shrink-0">
                {step.num}
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span>{step.title}</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Box */}
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-slate-900 p-8 sm:p-10 text-center">
        <h3 className="text-2xl font-black text-white">Ready to source verified corporate suppliers?</h3>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl mx-auto">
          Start your first sourcing request today or join as a verified supplier.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('sourcing_create')}
            className="rounded-xl bg-emerald-500 px-6 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
          >
            Start Sourcing Now
          </button>
          <button
            onClick={() => onOpenAuth('register', 'supplier')}
            className="rounded-xl bg-slate-800 px-6 py-3 text-xs font-semibold text-white hover:bg-slate-700 border border-slate-700"
          >
            Join as Verified Supplier
          </button>
        </div>
      </div>
    </div>
  );
};
