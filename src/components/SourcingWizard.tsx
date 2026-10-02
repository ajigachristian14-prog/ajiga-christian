import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle,
  Building,
  MapPin,
  Calendar,
  Layers,
  Banknote,
  Clock,
  ShieldCheck,
  AlertCircle,
  Edit3,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

interface SourcingWizardProps {
  onSuccess: (requestId: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  initialPrompt?: string;
}

export const SourcingWizard: React.FC<SourcingWizardProps> = ({
  onSuccess,
  onOpenAuth,
  initialPrompt = '',
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'prompt' | 'review'>('prompt');
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extracted structured fields
  const [formData, setFormData] = useState({
    title: '',
    category: 'Corporate Apparel & Textiles',
    productOrService: '',
    quantity: 100,
    unit: 'units',
    budget: 1500000,
    location: 'Ibadan',
    deliveryDeadline: 'Within 14 days',
    qualityRequirements: 'Premium commercial grade',
    specifications: '',
    customization: 'Custom corporate branding required',
    additionalRequirements: 'Delivery with full inspection on receipt',
  });

  const promptSuggestions = [
    '500 branded T-shirts for a company event in Ibadan. Budget ₦1,500,000 delivered within 14 days.',
    '200 ergonomic mesh office chairs in Lagos budget ₦8,000,000 delivery within 10 days.',
    '60 certified safety boots and helmets in Port Harcourt budget ₦950,000.',
    '2,000 custom printed shipping boxes with logo in Abuja budget ₦600,000.',
  ];

  const handleAnalyze = async (textToParse?: string) => {
    const input = textToParse || prompt;
    if (!input.trim()) {
      setError('Please describe what you need to source.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    try {
      const res = await api.parsePrompt(input);
      const data = res.data;
      setFormData({
        title: data.title || `Sourcing Request for ${data.quantity || 100} units`,
        category: data.category || 'Corporate Apparel & Textiles',
        productOrService: data.productOrService || input.slice(0, 60),
        quantity: data.quantity || 100,
        unit: data.unit || 'units',
        budget: data.budget || 0,
        location: data.location || 'Lagos',
        deliveryDeadline: data.deliveryDeadline || 'Within 14 days',
        qualityRequirements: data.qualityRequirements || 'Commercial standard',
        specifications: data.specifications || input,
        customization: data.customization || 'None',
        additionalRequirements: data.additionalRequirements || 'Inspection before final delivery',
      });
      setStep('review');
    } catch (err: any) {
      setError(err.message || 'Failed to analyze requirements.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth('login');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const res = await api.createRequest(formData);
      onSuccess(res.request.id);
    } catch (err: any) {
      setError(err.message || 'Failed to submit sourcing request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      {step === 'prompt' ? (
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
            <Sparkles className="h-4 w-4" />
            <span>AI Sourcing Engine</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Tell us what you need. We'll find the right supplier.
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Describe your product or service specifications in normal language. Our AI converts it to a structured commercial RFQ and matches verified suppliers in Nigeria.
          </p>

          {error && (
            <div className="mt-4 flex items-center space-x-2 rounded-xl bg-red-500/10 p-3 text-xs text-red-300 border border-red-500/30">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Sourcing Input Box */}
          <div className="mt-5 relative">
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What do you need? e.g. I need 500 branded T-shirts for a company event in Ibadan. My budget is ₦1,500,000 and I need them delivered within 14 days..."
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
            />
          </div>

          {/* Suggestion Chips */}
          <div className="mt-3">
            <span className="text-[11px] font-medium text-slate-400 block mb-2">
              Or click a sample requirement:
            </span>
            <div className="flex flex-wrap gap-2">
              {promptSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(s);
                    handleAnalyze(s);
                  }}
                  className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-300 hover:border-emerald-500/50 hover:text-emerald-300 transition-all text-left truncate max-w-full sm:max-w-md cursor-pointer"
                >
                  ⚡ {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-800/80 pt-5">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Broadcasts only to verified Nigerian businesses</span>
            </div>

            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => handleAnalyze()}
              className="inline-flex items-center justify-center space-x-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              {isAnalyzing ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>AI Parsing Requirements...</span>
                </>
              ) : (
                <>
                  <span>Process Procurement Request</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* STEP 2: REVIEW STRUCTURED REQUIREMENTS */
        <form onSubmit={handleSubmitRequest} className="space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Your Sourcing Request</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Review and edit structured fields before broadcasting to verified suppliers.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep('prompt')}
              className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Modify Prompt</span>
            </button>
          </div>

          {error && (
            <div className="flex items-center space-x-2 rounded-xl bg-red-500/10 p-3 text-xs text-red-300 border border-red-500/30">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Request Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Corporate Apparel & Textiles">Corporate Apparel & Textiles</option>
                <option value="Office & Commercial Furniture">Office & Commercial Furniture</option>
                <option value="Industrial Supplies & PPE">Industrial Supplies & PPE</option>
                <option value="Commercial Printing & Packaging">Commercial Printing & Packaging</option>
                <option value="IT Hardware & Networking">IT Hardware & Networking</option>
                <option value="Agro-Allied & Commodities">Agro-Allied & Commodities</option>
                <option value="Building & Construction Materials">Building & Construction Materials</option>
                <option value="Logistics & Freight Services">Logistics & Freight Services</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Product / Service Required
              </label>
              <input
                type="text"
                required
                value={formData.productOrService}
                onChange={(e) => setFormData({ ...formData, productOrService: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Quantity & Unit
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 1 })}
                  className="w-2/3 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="pcs"
                  className="w-1/3 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Target Budget (₦ NGN)
              </label>
              <input
                type="number"
                min="0"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Delivery Location
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Delivery Deadline
              </label>
              <input
                type="text"
                required
                value={formData.deliveryDeadline}
                onChange={(e) => setFormData({ ...formData, deliveryDeadline: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Technical Specifications & Details
              </label>
              <textarea
                rows={3}
                value={formData.specifications}
                onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Customization & Additional Requirements
              </label>
              <input
                type="text"
                value={formData.customization}
                onChange={(e) => setFormData({ ...formData, customization: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800 pt-5">
            <button
              type="button"
              onClick={() => setStep('prompt')}
              className="text-xs text-slate-400 hover:text-white"
            >
              ← Back to prompt
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-emerald-500 px-8 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Matching Suppliers & Creating Request...</span>
                </>
              ) : (
                <>
                  <span>Submit Sourcing Request</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
