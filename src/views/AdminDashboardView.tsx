import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Building2,
  Users,
  CreditCard,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Settings,
  AlertTriangle,
  Layers,
  Banknote,
  DollarSign,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { PaymentSubmission, User, SupplierProfile, AuditLog, PlatformSettings } from '../types/index.js';
import { api } from '../services/api.js';

interface AdminDashboardViewProps {
  onNavigate: (view: string, id?: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigate }) => {
  const [tab, setTab] = useState<'transfers' | 'overview' | 'users' | 'suppliers' | 'settings' | 'audit'>('transfers');
  const [metrics, setMetrics] = useState<any>(null);
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Transfer verification filters & modals
  const [transferStatusFilter, setTransferStatusFilter] = useState<string>('all');
  const [transferSearch, setTransferSearch] = useState<string>('');
  const [selectedSubmission, setSelectedSubmission] = useState<PaymentSubmission | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [adminNote, setAdminNote] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Settings form
  const [commissionPercent, setCommissionPercent] = useState<number>(5);
  const [minPlatformFee, setMinPlatformFee] = useState<number>(2500);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [metricsRes, subsRes, usersRes, supsRes, logsRes, settingsRes] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminBankTransfers({
          status: transferStatusFilter === 'all' ? undefined : transferStatusFilter,
          search: transferSearch.trim() || undefined,
        }),
        api.getAdminUsers(),
        api.getSuppliers(),
        api.getAdminAuditLogs(),
        api.getAdminSettings(),
      ]);

      setMetrics(metricsRes.metrics);
      setSubmissions(subsRes.submissions || []);
      setUsers(usersRes.users || []);
      setSuppliers(supsRes.suppliers || []);
      setAuditLogs(logsRes.logs || []);
      setSettings(settingsRes.settings);
      if (settingsRes.settings) {
        setCommissionPercent(settingsRes.settings.commissionPercent);
        setMinPlatformFee(settingsRes.settings.minPlatformFee);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [transferStatusFilter]);

  const handleSearchTransfers = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission || !reviewAction) return;

    setIsVerifying(true);
    try {
      await api.verifyBankTransfer(selectedSubmission.id, {
        action: reviewAction,
        adminNote,
        rejectionReason: reviewAction === 'reject' ? rejectionReason : undefined,
      });

      setSelectedSubmission(null);
      setReviewAction(null);
      setAdminNote('');
      setRejectionReason('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleToggleUserStatus = async (userToUpdate: User) => {
    const newStatus = userToUpdate.status === 'active' ? 'suspended' : 'active';
    try {
      await api.updateUserStatus(userToUpdate.id, newStatus);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status.');
    }
  };

  const handleUpdateSupplierLevel = async (supplierId: string, level: string) => {
    try {
      await api.verifySupplier(supplierId, {
        verificationLevel: level,
        verificationNotes: `Approved by admin at ${new Date().toLocaleDateString()}`,
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update supplier verification.');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateAdminSettings({
        commissionPercent: Number(commissionPercent),
        minPlatformFee: Number(minPlatformFee),
      });
      alert('Platform settings updated successfully.');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save settings.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <ShieldAlert className="h-4 w-4" />
            <span>Platform Operations & Treasury</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Admin Management Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review Direct Bank Transfers, audit transactions, supervise users, and configure commissions.
          </p>
        </div>

        {metrics?.pendingBankTransfersCount > 0 && (
          <div className="flex items-center space-x-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 px-4 py-2 text-xs font-bold text-amber-300 animate-pulse">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>{metrics.pendingBankTransfersCount} Bank Transfers Awaiting Verification</span>
          </div>
        )}
      </div>

      {/* Real-time Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-[10px] uppercase text-slate-500 font-semibold block">Registered Users</span>
            <span className="text-xl font-black text-white mt-1 block">{metrics.totalUsers}</span>
            <span className="text-[10px] text-slate-400">{metrics.buyersCount} buyers • {metrics.suppliersCount} sups</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-[10px] uppercase text-slate-500 font-semibold block">Active RFQs</span>
            <span className="text-xl font-black text-white mt-1 block">{metrics.activeRequestsCount}</span>
            <span className="text-[10px] text-slate-400">{metrics.totalQuotesCount} quotes total</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-[10px] uppercase text-slate-500 font-semibold block">Orders</span>
            <span className="text-xl font-black text-white mt-1 block">{metrics.totalOrdersCount}</span>
            <span className="text-[10px] text-emerald-400">{metrics.completedOrdersCount} completed</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-[10px] uppercase text-slate-500 font-semibold block">Gross GMV</span>
            <span className="text-lg font-black text-white font-mono mt-1 block truncate">
              ₦{metrics.transactionVolume.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500">Verified transactions</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-[10px] uppercase text-slate-500 font-semibold block">Platform Revenue</span>
            <span className="text-lg font-black text-emerald-400 font-mono mt-1 block truncate">
              ₦{metrics.earnedCommissions.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500">Commissions earned</span>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4">
            <span className="text-[10px] uppercase text-amber-300 font-semibold block">Pending Transfers</span>
            <span className="text-xl font-black text-amber-400 mt-1 block">
              {metrics.pendingBankTransfersCount}
            </span>
            <span className="text-[10px] text-slate-400">
              {metrics.approvedBankTransfersCount} approved
            </span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap border-b border-slate-800 gap-1">
        <button
          onClick={() => setTab('transfers')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center space-x-2 ${
            tab === 'transfers'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Direct Bank Transfer Verification ({submissions.length})</span>
        </button>

        <button
          onClick={() => setTab('users')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center space-x-2 ${
            tab === 'users'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>User Management ({users.length})</span>
        </button>

        <button
          onClick={() => setTab('suppliers')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center space-x-2 ${
            tab === 'suppliers'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Supplier Verification ({suppliers.length})</span>
        </button>

        <button
          onClick={() => setTab('settings')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center space-x-2 ${
            tab === 'settings'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Commission & Settings</span>
        </button>

        <button
          onClick={() => setTab('audit')}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center space-x-2 ${
            tab === 'audit'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB CONTENT */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Clock className="h-5 w-5 animate-spin text-emerald-400" />
        </div>
      ) : tab === 'transfers' ? (
        /* 1. DIRECT BANK TRANSFER VERIFICATION INTERFACE */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            {/* Filter buttons */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-semibold uppercase text-[10px]">Status:</span>
              {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setTransferStatusFilter(s)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                    transferStatusFilter === s
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Search */}
            <form onSubmit={handleSearchTransfers} className="flex items-center space-x-2">
              <input
                type="text"
                value={transferSearch}
                onChange={(e) => setTransferSearch(e.target.value)}
                placeholder="Search user, order, or reference..."
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none w-56 sm:w-64"
              />
              <button
                type="submit"
                className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Search
              </button>
            </form>
          </div>

          {/* Submissions Table */}
          {submissions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center bg-slate-900/30">
              <CheckCircle2 className="h-10 w-10 text-slate-600 mx-auto mb-2" />
              <h4 className="text-base font-bold text-white">No payment submissions found</h4>
              <p className="text-xs text-slate-400 mt-1">
                When buyers submit transfer references or receipts, they will appear here for verification.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Submission ID</th>
                    <th className="p-3.5">Buyer</th>
                    <th className="p-3.5">Order</th>
                    <th className="p-3.5">Claimed Amount</th>
                    <th className="p-3.5">Sender Name</th>
                    <th className="p-3.5">Bank Reference</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Submitted</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-emerald-400">
                        {sub.id}
                      </td>
                      <td className="p-3.5">
                        <p className="font-semibold text-white">{sub.userName}</p>
                        <span className="text-[10px] text-slate-500 font-mono">{sub.userEmail}</span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-300">
                        {sub.orderNumber}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-white">
                        ₦{sub.amountClaimed.toLocaleString()}
                        {sub.amountClaimed !== sub.expectedAmount && (
                          <span className="block text-[10px] text-amber-400">
                            Exp: ₦{sub.expectedAmount.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-300">{sub.senderName}</td>
                      <td className="p-3.5 font-mono text-slate-300 truncate max-w-[120px]">
                        {sub.referenceId}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            sub.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : sub.status === 'rejected'
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-amber-500/20 text-amber-300 animate-pulse'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400 font-mono text-[10px]">
                        {new Date(sub.submittedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        {new Date(sub.submittedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedSubmission(sub)}
                          className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
                        >
                          Review & Verify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : tab === 'users' ? (
        /* 2. USER MANAGEMENT */
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Company</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Registered</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40">
                  <td className="p-3.5">
                    <p className="font-bold text-white">{u.name}</p>
                    <span className="font-mono text-[10px] text-slate-500">{u.email}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300">{u.company || '—'}</td>
                  <td className="p-3.5 text-slate-300">{u.location || 'Nigeria'}</td>
                  <td className="p-3.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        u.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400 font-mono text-[10px]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 text-right">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleToggleUserStatus(u)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                          u.status === 'active'
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : tab === 'suppliers' ? (
        /* 3. SUPPLIER VERIFICATION */
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Control supplier credentials and set official verification badges (Unverified, Business Verified, Platform Verified).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map((sup) => (
              <div key={sup.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-base">{sup.businessName}</h4>
                    <span className="text-xs text-slate-400">{sup.city} • {sup.registrationNumber || 'No RC'}</span>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 capitalize">
                    {sup.verificationLevel.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2">{sup.description}</p>

                <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Verification Level:</span>
                  <select
                    value={sup.verificationLevel}
                    onChange={(e) => handleUpdateSupplierLevel(sup.id, e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="unverified">Unverified</option>
                    <option value="identity_verified">Identity Verified</option>
                    <option value="business_verified">Business Verified (CAC)</option>
                    <option value="platform_verified">Platform Verified (Gold Tier)</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : tab === 'settings' ? (
        /* 4. PLATFORM SETTINGS & COMMISSION */
        <div className="max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Platform Commission & Financial Settings</h3>
            <p className="text-xs text-slate-400 mt-1">
              Configure transaction fees automatically deducted from orders upon completion.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Default Commission Percentage (%)
              </label>
              <input
                type="number"
                min="1"
                max="25"
                step="0.5"
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(parseFloat(e.target.value) || 5)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Standard platform fee deducted from order subtotal (default: 5%)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Minimum Platform Fee (₦ NGN)
              </label>
              <input
                type="number"
                min="500"
                value={minPlatformFee}
                onChange={(e) => setMinPlatformFee(parseFloat(e.target.value) || 2500)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-white uppercase text-[10px] block text-emerald-400">
                Official Receiving Account (Treasury Controlled):
              </span>
              <p>Bank: <strong>OPAY</strong></p>
              <p>Account Name: <strong>OLAROTIMI RUFUS AJIGA</strong></p>
              <p>Account Number: <strong className="font-mono text-emerald-300">8149482654</strong></p>
            </div>

            <button
              type="submit"
              className="rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400"
            >
              Save Platform Configuration
            </button>
          </form>
        </div>
      ) : (
        /* 5. AUDIT LOGS */
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Target</th>
                <th className="p-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="p-3.5 text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3.5 text-emerald-400">{log.adminEmail}</td>
                  <td className="p-3.5 font-bold text-white">{log.action}</td>
                  <td className="p-3.5 text-slate-400">{log.targetType} #{log.targetId}</td>
                  <td className="p-3.5 text-slate-300 font-sans text-xs">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DETAILED PAYMENT REVIEW MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => {
                setSelectedSubmission(null);
                setReviewAction(null);
              }}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              ✕
            </button>

            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
              <FileCheck className="h-4 w-4" />
              <span>Direct Bank Transfer Verification</span>
            </div>

            <h3 className="text-xl font-bold text-white">
              Review Submission #{selectedSubmission.id}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Order: <span className="font-mono text-white">{selectedSubmission.orderNumber}</span> • Submitted: {new Date(selectedSubmission.submittedAt).toLocaleString()}
            </p>

            {/* Comparison Box */}
            <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-slate-950 p-4 border border-slate-800">
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-semibold">Claimed Amount Transferred</span>
                <p className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                  ₦{selectedSubmission.amountClaimed.toLocaleString()}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase text-slate-500 font-semibold">Authoritative Order Amount</span>
                <p className="text-xl font-black text-white font-mono mt-0.5">
                  ₦{selectedSubmission.expectedAmount.toLocaleString()}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase text-slate-500 font-semibold">Sender's Account Name</span>
                <p className="text-sm font-bold text-white mt-0.5">{selectedSubmission.senderName}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase text-slate-500 font-semibold">Banking Reference / Session ID</span>
                <p className="text-sm font-bold text-emerald-300 font-mono mt-0.5">{selectedSubmission.referenceId}</p>
              </div>
            </div>

            {/* Proof Attachment */}
            {selectedSubmission.proofFile && (
              <div className="mt-4">
                <span className="text-xs font-semibold text-slate-400 uppercase text-[10px] block mb-2">
                  Uploaded Payment Proof / Screenshot
                </span>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-2 max-h-64 overflow-hidden flex items-center justify-center">
                  <img
                    src={selectedSubmission.proofFile}
                    alt="Payment receipt proof"
                    className="max-h-60 rounded object-contain"
                  />
                </div>
              </div>
            )}

            {/* Status & Review Form */}
            {selectedSubmission.status === 'approved' ? (
              <div className="mt-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs text-emerald-300">
                ✓ This transfer has already been verified and approved on {new Date(selectedSubmission.reviewedAt || '').toLocaleString()}.
              </div>
            ) : (
              <form onSubmit={handleVerifySubmit} className="mt-6 border-t border-slate-800 pt-5 space-y-4">
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setReviewAction('approve')}
                    className={`flex-1 rounded-xl p-3 text-xs font-bold transition-all ${
                      reviewAction === 'approve'
                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-emerald-500/40'
                    }`}
                  >
                    ✓ Approve Payment
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewAction('reject')}
                    className={`flex-1 rounded-xl p-3 text-xs font-bold transition-all ${
                      reviewAction === 'reject'
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                        : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-red-500/40'
                    }`}
                  >
                    ✕ Reject Payment
                  </button>
                </div>

                {reviewAction === 'reject' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-red-400 mb-1">
                      Reason for Rejection <span className="text-white">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Reference not found on OPAY account statement, or amount mismatch."
                      className="w-full rounded-xl border border-red-500/40 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Internal Admin Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="e.g. Confirmed on OPAY transaction report #10928."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSubmission(null);
                      setReviewAction(null);
                    }}
                    className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!reviewAction || isVerifying}
                    className={`rounded-xl px-6 py-2 text-xs font-bold disabled:opacity-50 ${
                      reviewAction === 'reject'
                        ? 'bg-red-500 text-white hover:bg-red-400'
                        : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                    }`}
                  >
                    {isVerifying ? 'Processing...' : 'Confirm Decision'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
