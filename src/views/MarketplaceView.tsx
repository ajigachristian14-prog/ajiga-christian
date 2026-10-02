import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Building2,
  MapPin,
  Star,
  ShieldCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  Layers,
  X,
} from 'lucide-react';
import { SupplierProfile } from '../types/index.js';
import { api } from '../services/api.js';

interface MarketplaceViewProps {
  onNavigate: (view: string, id?: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  onNavigate,
  onOpenAuth,
}) => {
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<SupplierProfile | null>(null);

  const categories = [
    'All Categories',
    'Corporate Apparel & Textiles',
    'Office & Commercial Furniture',
    'Industrial Supplies & PPE',
    'Commercial Printing & Packaging',
    'IT Hardware & Networking',
  ];

  const cities = ['All Cities', 'Lagos', 'Abuja', 'Ibadan', 'Port Harcourt', 'Kano'];

  const loadSuppliers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSuppliers({
        category: selectedCategory === 'all' || selectedCategory === 'All Categories' ? undefined : selectedCategory,
        city: selectedCity === 'all' || selectedCity === 'All Cities' ? undefined : selectedCity,
        search: search.trim() || undefined,
        verifiedOnly: verifiedOnly ? true : undefined,
      });
      setSuppliers(data.suppliers || []);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [selectedCategory, selectedCity, verifiedOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadSuppliers();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <Building2 className="h-4 w-4" />
            <span>Verified Nigerian Vendor Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Supplier Marketplace</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Discover verified corporate suppliers, manufacturers, and direct importers across Nigeria.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, brands, or CAC..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filters Strip */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-1.5 text-xs text-slate-400 mr-2">
          <Filter className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-semibold uppercase tracking-wider text-[10px]">Filter by:</span>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
        >
          {cities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        <label className="flex items-center space-x-2 text-xs text-slate-300 ml-auto cursor-pointer">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
          />
          <span>CAC / Platform Verified Only</span>
        </label>
      </div>

      {/* Suppliers Grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Clock className="h-5 w-5 animate-spin text-emerald-400" />
        </div>
      ) : suppliers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center bg-slate-900/40">
          <Building2 className="h-10 w-10 text-slate-600 mx-auto mb-2" />
          <h4 className="text-base font-bold text-white">No suppliers match your criteria</h4>
          <p className="text-xs text-slate-400 mt-1">Try resetting filters or submitting an AI Sourcing request.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedCity('all');
              setSearch('');
              setVerifiedOnly(false);
            }}
            className="mt-4 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
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
                      <h4 className="text-sm font-bold text-white line-clamp-1">
                        {supplier.businessName}
                      </h4>
                      <div className="flex items-center space-x-1 text-xs text-slate-400 mt-0.5">
                        <MapPin className="h-3 w-3 text-emerald-400" />
                        <span>{supplier.city}</span>
                        {supplier.registrationNumber && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-[10px] text-slate-500">{supplier.registrationNumber}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 capitalize">
                    {supplier.verificationLevel.replace('_', ' ')}
                  </span>
                </div>

                <p className="mt-4 text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {supplier.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {supplier.productsServices.slice(0, 4).map((p, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-slate-950 px-2.5 py-1 text-[10px] font-medium text-slate-400 border border-slate-800"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-1 text-xs font-bold text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <span>{supplier.rating}</span>
                    <span className="text-slate-500 font-normal">({supplier.completedTransactions} completed)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Response time: {supplier.typicalResponseTime}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedProfile(supplier)}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700"
                  >
                    View
                  </button>
                  <button
                    onClick={() => onNavigate('sourcing_create')}
                    className="rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow-sm shadow-emerald-500/20 cursor-pointer"
                  >
                    RFQ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Supplier Profile Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setSelectedProfile(null)}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start space-x-4 border-b border-slate-800 pb-5">
              <img
                src={selectedProfile.logo || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=140&q=80'}
                alt={selectedProfile.businessName}
                className="h-16 w-16 rounded-2xl object-cover border border-slate-800"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-bold text-white">{selectedProfile.businessName}</h3>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20 capitalize">
                    {selectedProfile.verificationLevel.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{selectedProfile.address}</span>
                  {selectedProfile.registrationNumber && (
                    <>
                      <span>•</span>
                      <span className="font-mono text-emerald-400">{selectedProfile.registrationNumber}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-4 text-xs text-slate-300">
              <div>
                <h4 className="font-bold text-white uppercase text-[11px] mb-1">Company Overview</h4>
                <p className="leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  {selectedProfile.description}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white uppercase text-[11px] mb-1.5">Products & Services Catalog</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProfile.productsServices.map((p, i) => (
                    <span key={i} className="rounded-lg bg-slate-950 px-3 py-1.5 text-xs text-emerald-300 border border-slate-800">
                      ✓ {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-center">
                  <span className="text-[10px] uppercase text-slate-500 block">Rating</span>
                  <span className="text-base font-bold text-amber-400">★ {selectedProfile.rating}</span>
                </div>
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-center">
                  <span className="text-[10px] uppercase text-slate-500 block">Orders Completed</span>
                  <span className="text-base font-bold text-white">{selectedProfile.completedTransactions}</span>
                </div>
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-center sm:col-span-1 col-span-2">
                  <span className="text-[10px] uppercase text-slate-500 block">Response Rate</span>
                  <span className="text-base font-bold text-emerald-400">{selectedProfile.responseRate}%</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3 border-t border-slate-800 pt-4">
              <button
                onClick={() => setSelectedProfile(null)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedProfile(null);
                  onNavigate('sourcing_create');
                }}
                className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
              >
                Request Sourcing Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
