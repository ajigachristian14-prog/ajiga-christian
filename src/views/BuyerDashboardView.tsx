import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Package,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  CreditCard,
  Building2,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { SourcingRequest, Order, Quote } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

interface BuyerDashboardViewProps {
  onNavigate: (view: string, id?: string) => void;
}

export const BuyerDashboardView: React.FC<BuyerDashboardViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'requests' | 'orders' | 'payments'>('requests');
  const [requests, setRequests] = useState<SourcingRequest[]>([]);
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
        setRequests(reqsData.requests || []);
        setOrders(ordersData.orders || []);
      } catch (err) {
        console.error('Failed to load buyer data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalSpent = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <Sparkles className="h-4 w-4" />
            <span>Buyer Procurement Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Welcome back, {user?.name || 'Buyer'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your sourcing briefs, supplier offers, Direct Bank Transfers, and fulfillment.
          </p>
        </div>

        <button
          onClick={() => onNavigate('sourcing_create')}
          className="inline-flex items-center space-x-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4" />
          <span>New Sourcing Request</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Active RFQs</span>
          <p className="text-2xl font-black text-white mt-1">{requests.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Active Orders</span>
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
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Verified Spend</span>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
            ₦{totalSpent.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setTab('requests')}
          className={`pb-3 px-4 text-xs font-semibold transition-all border-b-2 ${
            tab === 'requests'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          My Sourcing Requests ({requests.length})
        </button>
        <button
          onClick={() => setTab('orders')}
          className={`pb-3 px-4 text-xs font-semibold transition-all border-b-2 ${
            tab === 'orders'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          My Orders ({orders.length})
        </button>
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Clock className="h-5 w-5 animate-spin text-emerald-400" />
        </div>
      ) : tab === 'requests' ? (
        requests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center bg-slate-900/40">
            <Package className="h-10 w-10 text-slate-600 mx-auto mb-2" />
            <h4 className="text-base font-bold text-white">You haven't created a sourcing request yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Tell our AI what you need and get competitive quotations from vetted suppliers.
            </p>
            <button
              onClick={() => onNavigate('sourcing_create')}
              className="mt-4 rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
            >
              Find a Supplier
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((r) => (
              <div
                key={r.id}
                onClick={() => onNavigate('sourcing_detail', r.id)}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/40 transition-all cursor-pointer gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {r.id}
                    </span>
                    <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                      {r.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white mt-1.5">{r.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {r.quantity} {r.unit || 'units'} • {r.category} • Delivery to {r.location}
                  </p>
                </div>

                <div className="flex items-center space-x-6 sm:text-right">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Target Budget</span>
                    <span className="text-base font-black text-white font-mono">
                      ₦{r.budget.toLocaleString()}
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        )
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center bg-slate-900/40">
          <CreditCard className="h-10 w-10 text-slate-600 mx-auto mb-2" />
          <h4 className="text-base font-bold text-white">No orders created yet</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Once you accept a supplier quote, your orders and Direct Bank Transfer payments will show here.
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
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
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
                  Supplier: <strong className="text-slate-300">{o.supplierName}</strong> • Delivery: {o.deliveryCity}
                </p>
              </div>

              <div className="flex items-center space-x-6 sm:text-right">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 block">Total</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    ₦{o.totalAmount.toLocaleString()}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-500" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
