import React from 'react';
import { Sparkles, ArrowLeft, ShieldCheck } from 'lucide-react';
import { SourcingWizard } from '../components/SourcingWizard.js';

interface SourcingCreateViewProps {
  onNavigate: (view: string, id?: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const SourcingCreateView: React.FC<SourcingCreateViewProps> = ({
  onNavigate,
  onOpenAuth,
}) => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <button
        onClick={() => onNavigate('home')}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Home</span>
      </button>

      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Intelligent Procurement Initiation</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Create Sourcing Request</h1>
        <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
          State your requirements in plain English. Our AI will structure the procurement brief and notify verified suppliers in our network.
        </p>
      </div>

      <SourcingWizard
        onSuccess={(reqId) => onNavigate('sourcing_detail', reqId)}
        onOpenAuth={onOpenAuth}
      />
    </div>
  );
};
