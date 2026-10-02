import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Building2,
  Clock,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Star,
  Lock,
  Layers,
  Award,
} from 'lucide-react';
import { SourcingWizard } from '../components/SourcingWizard.js';
import { SupplierProfile } from '../types/index.js';

interface HomeViewProps {
  onNavigate: (view: string, id?: string) => void;
  onOpenAuth: (mode?: 'login' | 'register', defaultRole?: 'buyer' | 'supplier') => void;
  featuredSuppliers: SupplierProfile[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenAuth,
  featuredSuppliers,
}) => {
  return (
    <div className="space-y-20 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 sm:pt-16 pb-8">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Powered B2B Procurement Engine • Nigeria</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Tell us what you need. <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
              We'll find the right supplier.
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            AI Middleman searches, compares, and helps you source products and services from verified suppliers across Nigeria.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('sourcing_create')}
              className="inline-flex items-center space-x-2 rounded-2xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/25 cursor-pointer"
            >
              <span>Find a Supplier</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => onOpenAuth('register', 'supplier')}
              className="inline-flex items-center space-x-2 rounded-2xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-white hover:border-slate-600 hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Building2 className="h-4 w-4 text-emerald-400" />
              <span>Become a Supplier</span>
            </button>
          </div>

          {/* Integrated Live Sourcing Engine Box */}
          <div className="mt-12 max-w-3xl mx-auto text-left">
            <SourcingWizard
              onSuccess={(reqId) => onNavigate('sourcing_detail', reqId)}
              onOpenAuth={onOpenAuth}
            />
          </div>
        </div>
      </section>

      {/* TRUST BADGES & PAYMENT RAIL */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="flex items-start space-x-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 flex-shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">CAC Verified Businesses</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Every recommended supplier is screened with verifiable Nigerian corporate registration and workshops.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 flex-shrink-0">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Direct Bank Transfer Treasury</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Pay directly to our designated OPAY treasury account. Payout is released only upon confirmed delivery.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 flex-shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">AI-Assisted Negotiation</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Intelligent price analysis and structured counter-proposals help you lock in the most competitive terms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED VERIFIED SUPPLIERS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
              <Award className="h-4 w-4" />
              <span>Verified Partner Network</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Vetted Nigerian Suppliers
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Pre-inspected manufacturers and corporate vendors ready for commercial procurement.
            </p>
          </div>

          <button
            onClick={() => onNavigate('marketplace')}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
          >
            <span>Explore All Suppliers</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-emerald-500/40 transition-all hover:shadow-xl hover:shadow-emerald-950/20"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={supplier.logo || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=120&q=80'}
                      alt={supplier.businessName}
                      className="h-12 w-12 rounded-xl object-cover border border-slate-800"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white leading-snug line-clamp-1">
                        {supplier.businessName}
                      </h4>
                      <div className="flex items-center space-x-1 text-xs text-slate-400 mt-0.5">
                        <MapPin className="h-3 w-3 text-emerald-400" />
                        <span>{supplier.city}</span>
                      </div>
                    </div>
                  </div>

                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 capitalize">
                    {supplier.verificationLevel.replace('_', ' ')}
                  </span>
                </div>

                <p className="mt-4 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {supplier.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {supplier.productsServices.slice(0, 3).map((item, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-slate-950 px-2.5 py-1 text-[10px] font-medium text-slate-400 border border-slate-800"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs font-bold text-amber-400">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <span>{supplier.rating}</span>
                  <span className="text-slate-500 font-normal">({supplier.completedTransactions} orders)</span>
                </div>

                <button
                  onClick={() => onNavigate('sourcing_create')}
                  className="rounded-xl bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 hover:text-slate-950 transition-colors cursor-pointer"
                >
                  Request Quote
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 sm:p-12 relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white">How Procurement Works</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              From natural-language request to direct bank transfer and verified delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-sm mb-3">
                1
              </span>
              <h4 className="text-sm font-bold text-white">Describe Your Need</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Type your requirements naturally. AI extracts quantities, deadlines, and specs.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-sm mb-3">
                2
              </span>
              <h4 className="text-sm font-bold text-white">Verified Matching</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Matched Nigerian suppliers receive the RFQ and submit competitive quotations.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-sm mb-3">
                3
              </span>
              <h4 className="text-sm font-bold text-white">AI Quote Comparison</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Compare price, delivery time, and warranties. Use AI to negotiate better pricing.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-sm mb-3">
                4
              </span>
              <h4 className="text-sm font-bold text-white">Pay via Bank Transfer</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Pay directly to our verified OPAY account. Payment is confirmed before fulfillment begins.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
