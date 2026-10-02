import React, { useState, useEffect } from 'react';
import {
  Building2,
  Package,
  FileText,
  DollarSign,
  Star,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Truck,
  Plus,
} from 'lucide-react';
import { SourcingRequest, Order, Quote, SupplierProfile } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

interface SupplierDashboardViewProps {
  onNavigate: (view: string, id?: string) => void;
}

export const SupplierDashboardView: React.FC<SupplierDashboardViewProps> = ({ onNavigate }) => {
  const { user, supplierProfile } = useAuth();
  const [tab, setTab] = useState<'opportunities' | 'orders' | 'earnings' | 'profile'>('opportunities');
  const [opportunities, setOpportunities] = useState<SourcingRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [reqsData, ordersData] = await Promise.all([
          api.getRequests(),
          api.getOrders(),
        ]);
        setOpportunities(reqsData.requests || []);
        setOrders(ordersData.orders || []);
      } catch (err) {
        console.error('Failed to load supplier dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalGross = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const totalNetEarnings = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((acc, o) => acc + o.supplierEarnings, 0);

  const totalPlatformFees = totalGross - totalNetEarnings;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <Building2 className="h-4 w-4" />
            <span>Supplier Portal</span>
            {supplierProfile && (
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.2 text-[10px] text-emerald-400 border border-emerald-500/20 capitalize">
                {supplierProfile.verificationLevel.replace('_', ' ')}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {supplierProfile?.businessName || user?.company || user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            View commercial RFQs, submit quotes, manage fulfillment, and track net earnings.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs font-bold text-amber-400">
            <Star className="h-4 w-4 fill-amber-400" />
            <span>{supplierProfile?.rating || 5.0} Rating</span>
          </div>
          <button
            onClick={() => onNavigate('marketplace')}
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
          >
            Public Profile
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">New RFQ Leads</span>
          <p className="text-2xl font-black text-white mt-1">{opportunities.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Fulfillment Orders</span>
          <p className="text-2xl font-black text-white mt-1">
            {orders.filter((o) => o.fulfillmentStatus !== 'completed').length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Completed Orders</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {orders.filter((o) => o.fulfillmentStatus === 'completed').length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Net Payouts</span>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
            ₦{totalNetEarnings.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setTab('opportunities')}
          className={`pb-3 px-4 text-xs font-semibold transition-all border-b-2 ${
            tab === 'opportunities'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          RFQ Opportunities ({opportunities.length})
        </button>
        <button
          onClick={() => setTab('orders')}
          className={`pb-3 px-4 text-xs font-semibold transition-all border-b-2 ${
            tab === 'orders'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Active Orders ({orders.length})
        </button>
        <button
          onClick={() => setTab('earnings')}
          className={`pb-3 px-4 text-xs font-semibold transition-all border-b-2 ${
            tab === 'earnings'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Earnings & Platform Fees
        </button>
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Clock className="h-5 w-5 animate-spin text-emerald-400" />
        </div>
      ) : tab === 'opportunities' ? (
        opportunities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center bg-slate-900/40">
            <Package className="h-10 w-10 text-slate-600 mx-auto mb-2" />
            <h4 className="text-base font-bold text-white">No quotation requests yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              We'll notify you when a matching opportunity appears in your categories.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/40 transition-all gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {opp.id}
                    </span>
                    <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-slate-300">
                      {opp.category}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white mt-1.5">{opp.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Quantity: {opp.quantity} {opp.unit || 'units'} • Delivery to {opp.location} • Deadline: {opp.deliveryDeadline}
                  </p>
                </div>

                <div className="flex items-center space-x-4 sm:text-right">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Buyer Budget</span>
                    <span className="text-base font-black text-white font-mono">
                      ₦{opp.budget.toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigate('sourcing_detail', opp.id)}
                    className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors shadow-sm shadow-emerald-500/20"
                  >
                    Submit Quote
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : tab === 'orders' ? (
        orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center bg-slate-900/40">
            <Building2 className="h-10 w-10 text-slate-600 mx-auto mb-2" />
            <h4 className="text-base font-bold text-white">No active orders yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Accepted quotes and buyer orders will appear here for fulfillment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div
                key={o.id}
                onClick={() => onNavigate('order_detail', o.id)}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/40 transition-all cursor-pointer gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {o.id}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
                        o.paymentStatus === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : o.paymentStatus === 'pending_verification'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Payment: {o.paymentStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white mt-1.5">{o.itemsDescription}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Buyer: {o.buyerName} • Destination: {o.deliveryCity}
                  </p>
                </div>

                <div className="flex items-center space-x-6 sm:text-right">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Your Net Payout</span>
                    <span className="text-base font-black text-emerald-400 font-mono">
                      ₦{o.supplierEarnings.toLocaleString()}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* EARNINGS TAB */
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
          <h3 className="text-base font-bold text-white">Financial Statement & Commission Accounting</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
              <span className="text-xs text-slate-400">Total Gross Sales</span>
              <p className="text-xl font-bold text-white font-mono mt-1">₦{totalGross.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
              <span className="text-xs text-slate-400">Platform Transaction Fees (5%)</span>
              <p className="text-xl font-bold text-slate-400 font-mono mt-1">₦{totalPlatformFees.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
              <span className="text-xs text-emerald-400 font-semibold">Net Released / Earned</span>
              <p className="text-xl font-bold text-emerald-400 font-mono mt-1">₦{totalNetEarnings.toLocaleString()}</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            Funds for orders made via Direct Bank Transfer are held in verified escrow until delivery is confirmed by the buyer, ensuring fair and guaranteed payment release.
          </p>
        </div>
      )}
    </div>
  );
};
