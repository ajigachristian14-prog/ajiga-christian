import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { AuthModal } from './components/AuthModal.js';
import { HomeView } from './views/HomeView.js';
import { SourcingCreateView } from './views/SourcingCreateView.js';
import { SourcingDetailView } from './views/SourcingDetailView.js';
import { MarketplaceView } from './views/MarketplaceView.js';
import { OrderDetailView } from './views/OrderDetailView.js';
import { BuyerDashboardView } from './views/BuyerDashboardView.js';
import { SupplierDashboardView } from './views/SupplierDashboardView.js';
import { AdminDashboardView } from './views/AdminDashboardView.js';
import { HowItWorksView } from './views/HowItWorksView.js';
import { PricingView } from './views/PricingView.js';
import { api } from './services/api.js';
import { SupplierProfile } from './types/index.js';

function MainApp() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [featuredSuppliers, setFeaturedSuppliers] = useState<SupplierProfile[]>([]);

  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authModalRole, setAuthModalRole] = useState<'buyer' | 'supplier'>('buyer');

  useEffect(() => {
    // Fetch featured suppliers for homepage
    const fetchFeatured = async () => {
      try {
        const res = await api.getSuppliers();
        setFeaturedSuppliers(res.suppliers?.slice(0, 6) || []);
      } catch (err) {
        console.error('Failed to load featured suppliers:', err);
      }
    };
    fetchFeatured();

    // Check hash URL on load
    const hash = window.location.hash;
    if (hash.startsWith('#/sourcing/')) {
      const id = hash.replace('#/sourcing/', '');
      setCurrentView('sourcing_detail');
      setSelectedId(id);
    } else if (hash.startsWith('#/orders/')) {
      const id = hash.replace('#/orders/', '');
      setCurrentView('order_detail');
      setSelectedId(id);
    }
  }, []);

  const handleNavigate = (view: string, id?: string) => {
    setCurrentView(view);
    setSelectedId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (view === 'sourcing_detail' && id) {
      window.location.hash = `#/sourcing/${id}`;
    } else if (view === 'order_detail' && id) {
      window.location.hash = `#/orders/${id}`;
    } else {
      window.location.hash = '';
    }
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login', role: 'buyer' | 'supplier' = 'buyer') => {
    setAuthModalMode(mode);
    setAuthModalRole(role);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300">
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />

      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
            featuredSuppliers={featuredSuppliers}
          />
        )}

        {currentView === 'sourcing_create' && (
          <SourcingCreateView
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentView === 'sourcing_detail' && selectedId && (
          <SourcingDetailView
            requestId={selectedId}
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentView === 'marketplace' && (
          <MarketplaceView
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentView === 'order_detail' && selectedId && (
          <OrderDetailView
            orderId={selectedId}
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentView === 'buyer_dashboard' && (
          <BuyerDashboardView onNavigate={handleNavigate} />
        )}

        {currentView === 'supplier_dashboard' && (
          <SupplierDashboardView onNavigate={handleNavigate} />
        )}

        {currentView === 'admin_dashboard' && (
          <AdminDashboardView onNavigate={handleNavigate} />
        )}

        {currentView === 'how_it_works' && (
          <HowItWorksView
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {currentView === 'pricing' && (
          <PricingView
            onNavigate={handleNavigate}
            onOpenAuth={handleOpenAuth}
          />
        )}
      </main>

      <Footer
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        defaultRole={authModalRole}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
