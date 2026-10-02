import React, { useState } from 'react';
import {
  Compass,
  Search,
  Sparkles,
  Building2,
  Bell,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  CreditCard,
  ChevronDown,
  LayoutDashboard,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, id?: string) => void;
  onOpenAuth: (mode?: 'login' | 'register', defaultRole?: 'buyer' | 'supplier') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenAuth }) => {
  const { user, supplierProfile, notifications, unreadCount, logout, quickLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const getDashboardView = () => {
    if (!user) return 'home';
    if (user.role === 'admin') return 'admin_dashboard';
    if (user.role === 'supplier') return 'supplier_dashboard';
    return 'buyer_dashboard';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Compass className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-lg font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                AI Middleman
              </span>
              <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                NG
              </span>
            </div>
            <p className="hidden sm:block text-[10px] text-slate-400 -mt-0.5">
              Tell us what you need. We'll find the right supplier.
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
          <button
            onClick={() => onNavigate('sourcing_create')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors ${
              currentView === 'sourcing_create'
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>Find a Supplier</span>
          </button>

          <button
            onClick={() => onNavigate('marketplace')}
            className={`px-3 py-2 rounded-lg transition-colors ${
              currentView === 'marketplace'
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span>Supplier Marketplace</span>
          </button>

          <button
            onClick={() => onNavigate('how_it_works')}
            className={`px-3 py-2 rounded-lg transition-colors ${
              currentView === 'how_it_works'
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span>How It Works</span>
          </button>

          <button
            onClick={() => onNavigate('pricing')}
            className={`px-3 py-2 rounded-lg transition-colors ${
              currentView === 'pricing'
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span>Pricing</span>
          </button>
        </nav>

        {/* Right Section: Auth & User Menu */}
        <div className="flex items-center space-x-3">
          {user ? (
            <>
              {/* Dashboard Link */}
              <button
                onClick={() => onNavigate(getDashboardView())}
                className="hidden sm:inline-flex items-center space-x-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-1.5 text-xs font-semibold text-white hover:border-emerald-500/50 hover:bg-slate-800 transition-all"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-emerald-400" />
                <span>
                  {user.role === 'admin'
                    ? 'Admin Portal'
                    : user.role === 'supplier'
                    ? 'Supplier Portal'
                    : 'Buyer Dashboard'}
                </span>
              </button>

              {/* Notifications dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
                  title="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-slate-950">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-800 bg-slate-900 p-3 shadow-2xl z-50">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 px-1">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Platform Notifications
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {notifications.length} total
                      </span>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-1.5">
                      {notifications.length === 0 ? (
                        <p className="text-center text-xs text-slate-500 py-4">No notifications yet.</p>
                      ) : (
                        notifications.slice(0, 6).map((n) => (
                          <div
                            key={n.id}
                            className={`rounded-lg p-2.5 text-xs transition-colors ${
                              n.isRead ? 'bg-slate-950/40 text-slate-400' : 'bg-emerald-500/10 text-slate-200 border border-emerald-500/20'
                            }`}
                          >
                            <p className="font-semibold text-white">{n.title}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                            <span className="text-[9px] text-slate-500 font-mono mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:border-slate-700 transition-colors"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline-block max-w-[100px] truncate">{user.name}</span>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                    {user.role}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50">
                    <div className="border-b border-slate-800 pb-2 mb-1 px-3 pt-2">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate font-mono">{user.email}</p>
                      <p className="text-[10px] text-emerald-400 capitalize mt-0.5">
                        {user.role} • {user.location || 'Nigeria'}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onNavigate(getDashboardView());
                      }}
                      className="w-full flex items-center space-x-2 rounded-lg px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4 text-emerald-400" />
                      <span>My Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onNavigate('sourcing_create');
                      }}
                      className="w-full flex items-center space-x-2 rounded-lg px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 transition-colors"
                    >
                      <Sparkles className="h-4 w-4 text-emerald-400" />
                      <span>New Sourcing Request</span>
                    </button>

                    <div className="border-t border-slate-800 my-1" />

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        logout();
                        onNavigate('home');
                      }}
                      className="w-full flex items-center space-x-2 rounded-lg px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </button>

              <button
                onClick={() => onOpenAuth('register', 'buyer')}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
              >
                Find a Supplier
              </button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 py-4 space-y-2">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('sourcing_create');
            }}
            className="w-full flex items-center space-x-2 rounded-lg p-2.5 text-sm font-medium text-emerald-400 bg-emerald-500/10"
          >
            <Sparkles className="h-4 w-4" />
            <span>Find a Supplier (AI Sourcing)</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('marketplace');
            }}
            className="w-full flex items-center space-x-2 rounded-lg p-2.5 text-sm font-medium text-slate-300 hover:bg-slate-900"
          >
            <Building2 className="h-4 w-4" />
            <span>Supplier Marketplace</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('how_it_works');
            }}
            className="w-full flex items-center space-x-2 rounded-lg p-2.5 text-sm font-medium text-slate-300 hover:bg-slate-900"
          >
            <CheckCircle className="h-4 w-4" />
            <span>How It Works</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('pricing');
            }}
            className="w-full flex items-center space-x-2 rounded-lg p-2.5 text-sm font-medium text-slate-300 hover:bg-slate-900"
          >
            <CreditCard className="h-4 w-4" />
            <span>Pricing & Commission</span>
          </button>

          {user && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate(getDashboardView());
              }}
              className="w-full flex items-center space-x-2 rounded-lg p-2.5 text-sm font-medium text-white bg-slate-900 border border-slate-800"
            >
              <LayoutDashboard className="h-4 w-4 text-emerald-400" />
              <span>Go to Dashboard</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
