import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Building, MapPin, Phone, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  defaultRole?: 'buyer' | 'supplier';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  defaultRole = 'buyer',
}) => {
  const { login, register, quickLogin } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<'buyer' | 'supplier'>(defaultRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Lagos');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({
          email,
          password,
          name,
          role,
          company,
          phone,
          location,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuick = async (roleKey: any) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await quickLogin(roleKey);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white">
            {mode === 'login' ? 'Sign In to AI Middleman' : 'Create Your Account'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' ? 'Access your procurement portal' : 'Start sourcing and quoting verified suppliers'}
          </p>
        </div>

        {/* Quick Demo Switcher */}
        <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Instant Demo Sign-in:</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuick('admin')}
              className="rounded-lg bg-slate-950 border border-slate-800 px-2 py-1.5 text-[11px] font-medium text-slate-200 hover:border-emerald-500/50 hover:text-emerald-300 transition-colors"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuick('buyer')}
              className="rounded-lg bg-slate-950 border border-slate-800 px-2 py-1.5 text-[11px] font-medium text-slate-200 hover:border-emerald-500/50 hover:text-emerald-300 transition-colors"
            >
              🛍️ Buyer
            </button>
            <button
              type="button"
              onClick={() => handleQuick('supplier-apparel')}
              className="rounded-lg bg-slate-950 border border-slate-800 px-2 py-1.5 text-[11px] font-medium text-slate-200 hover:border-emerald-500/50 hover:text-emerald-300 transition-colors"
            >
              🏭 Supplier (Ibadan)
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center space-x-2 rounded-xl bg-red-500/10 p-3 text-xs text-red-300 border border-red-500/30">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab switch between Login and Register */}
        <div className="mb-5 flex rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              mode === 'login' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              mode === 'register' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              {/* Role selection */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`rounded-xl border p-2.5 text-left text-xs font-medium transition-all ${
                    role === 'buyer'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <span className="block font-bold">Buyer Account</span>
                  <span className="text-[10px] text-slate-500">Source goods & RFQs</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('supplier')}
                  className={`rounded-xl border p-2.5 text-left text-xs font-medium transition-all ${
                    role === 'supplier'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <span className="block font-bold">Supplier Account</span>
                  <span className="text-[10px] text-slate-500">Provide quotes & products</span>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Babatunde Lawal"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-1">
                    Company / Brand
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Ade Ventures"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-1">
                    Primary City
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Lagos">Lagos</option>
                      <option value="Abuja">Abuja</option>
                      <option value="Ibadan">Ibadan</option>
                      <option value="Port Harcourt">Port Harcourt</option>
                      <option value="Kano">Kano</option>
                      <option value="Benin City">Benin City</option>
                      <option value="Enugu">Enugu</option>
                      <option value="Kaduna">Kaduna</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-1">
              Work Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@business.ng"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            {isSubmitting ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
