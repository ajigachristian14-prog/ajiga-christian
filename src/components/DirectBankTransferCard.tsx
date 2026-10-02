import React, { useState } from 'react';
import {
  Building2,
  Copy,
  Check,
  AlertTriangle,
  Upload,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  ShieldCheck,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Order, PaymentSubmission } from '../types/index.js';
import { api } from '../services/api.js';

interface DirectBankTransferCardProps {
  order: Order;
  submissions: PaymentSubmission[];
  officialAccount: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
  onPaymentSubmitted: () => void;
}

export const DirectBankTransferCard: React.FC<DirectBankTransferCardProps> = ({
  order,
  submissions,
  officialAccount,
  onPaymentSubmitted,
}) => {
  const [copied, setCopied] = useState(false);
  const [amountClaimed, setAmountClaimed] = useState<string>(order.totalAmount.toString());
  const [senderName, setSenderName] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [proofFile, setProofFile] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const latestSubmission = submissions.length > 0 ? submissions[0] : null;

  const handleCopyAccount = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(officialAccount.accountNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } else {
        // Fallback for older or restricted environments
        const textArea = document.createElement('textarea');
        textArea.value = officialAccount.accountNumber;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setFormError('Receipt image must be smaller than 8MB.');
      return;
    }

    setProofFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setProofFile(reader.result as string);
      setFormError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessNotice(null);

    const claimedVal = parseFloat(amountClaimed);
    if (isNaN(claimedVal) || claimedVal <= 0) {
      setFormError('Please enter a valid transfer amount greater than ₦0.');
      return;
    }

    if (!senderName.trim()) {
      setFormError('Please provide the account name used for making the bank transfer.');
      return;
    }

    if (!referenceId.trim()) {
      setFormError('Please enter your banking transfer reference / transaction session ID.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitDirectBankTransfer(order.id, {
        amountClaimed: claimedVal,
        senderName: senderName.trim(),
        referenceId: referenceId.trim(),
        proofFile: proofFile || undefined,
        proofFileName: proofFileName || undefined,
      });

      setSuccessNotice(res.message);
      onPaymentSubmitted();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit payment details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Official Bank Account Card */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-slate-900/90 p-6 shadow-xl shadow-emerald-950/20 backdrop-blur-md">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">Direct Bank Transfer</h3>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                  Official Receiving Account
                </span>
              </div>
              <p className="text-xs text-slate-400">Secure manual verification managed directly by platform treasury</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Amount to Transfer</p>
            <p className="text-2xl font-black text-emerald-400 font-mono">
              ₦{order.totalAmount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Account Details Box */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl bg-slate-950/80 p-5 border border-slate-800">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">Bank Name</span>
            <p className="text-base font-bold text-white mt-0.5">{officialAccount.bankName}</p>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">Account Name</span>
            <p className="text-base font-bold text-white mt-0.5">{officialAccount.accountName}</p>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-slate-500 font-medium">Account Number</span>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-lg font-black text-emerald-300 font-mono tracking-wider">
                {officialAccount.accountNumber}
              </span>
              <button
                type="button"
                onClick={handleCopyAccount}
                className="inline-flex items-center space-x-1 rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all cursor-pointer"
                title="Copy Account Number"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-300" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Warning Callout */}
        <div className="mt-4 flex items-start space-x-3 rounded-xl bg-amber-500/10 p-3.5 border border-amber-500/25">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-400 mt-0.5" />
          <p className="text-xs text-amber-200/90 leading-relaxed">
            <strong className="font-semibold text-amber-300">Important Warning:</strong> Before making your transfer, carefully verify the bank name (<span className="text-white font-mono">{officialAccount.bankName}</span>), account name (<span className="text-white font-mono">{officialAccount.accountName}</span>), account number (<span className="text-white font-mono">{officialAccount.accountNumber}</span>), and exact payment amount (<span className="text-white font-mono">₦{order.totalAmount.toLocaleString()}</span>).
          </p>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="mt-5 border-t border-slate-800/80 pt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
            <Info className="h-4 w-4 text-emerald-400" />
            <span>Transfer Steps</span>
          </h4>
          <ol className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs text-slate-300">
            <li className="flex items-start space-x-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">1</span>
              <span>Open banking app & select Bank Transfer</span>
            </li>
            <li className="flex items-start space-x-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">2</span>
              <span>Transfer exact amount: <strong>₦{order.totalAmount.toLocaleString()}</strong></span>
            </li>
            <li className="flex items-start space-x-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">3</span>
              <span>Confirm recipient name: <strong>{officialAccount.accountName}</strong></span>
            </li>
            <li className="flex items-start space-x-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">4</span>
              <span>Complete transfer & capture receipt reference</span>
            </li>
            <li className="flex items-start space-x-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 sm:col-span-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">5</span>
              <span>Return here and submit transfer info below for platform verification</span>
            </li>
          </ol>
        </div>
      </div>

      {/* 2. Current Submission Status Tracker (if submitted) */}
      {latestSubmission && (
        <div
          className={`rounded-2xl border p-5 transition-all ${
            latestSubmission.status === 'approved'
              ? 'border-emerald-500/40 bg-emerald-950/30'
              : latestSubmission.status === 'rejected'
              ? 'border-red-500/40 bg-red-950/30'
              : 'border-amber-500/40 bg-amber-950/30'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {latestSubmission.status === 'approved' ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : latestSubmission.status === 'rejected' ? (
                <XCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Clock className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-white text-base">
                    {latestSubmission.status === 'approved'
                      ? 'Payment Approved & Verified'
                      : latestSubmission.status === 'rejected'
                      ? 'Payment Verification Rejected'
                      : 'Payment Submitted — Pending Verification'}
                  </h4>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                      latestSubmission.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : latestSubmission.status === 'rejected'
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {latestSubmission.status}
                  </span>
                </div>
                
                <p className="mt-1 text-xs text-slate-300">
                  {latestSubmission.status === 'approved' ? (
                    'Payment approved. Your order can now continue to the next stage.'
                  ) : latestSubmission.status === 'rejected' ? (
                    <>
                      Payment verification was not approved. Rejection reason:{' '}
                      <span className="font-semibold text-red-300">{latestSubmission.rejectionReason}</span>. Please review the payment details and submit a new reference or contact support.
                    </>
                  ) : (
                    'Your transfer details have been received and are awaiting verification. Your payment/order status will only be updated after the transfer has been verified by the administrator.'
                  )}
                </p>

                {latestSubmission.adminNote && (
                  <p className="mt-2 text-xs italic text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800">
                    Admin note: {latestSubmission.adminNote}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-4 text-xs font-mono text-slate-400">
                  <span>Ref: <strong className="text-white">{latestSubmission.referenceId}</strong></span>
                  <span>Claimed: <strong className="text-white">₦{latestSubmission.amountClaimed.toLocaleString()}</strong></span>
                  <span>Sender: <strong className="text-white">{latestSubmission.senderName}</strong></span>
                  <span>Submitted: {new Date(latestSubmission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Payment Submission Form (Hidden if already approved) */}
      {order.paymentStatus !== 'paid' && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
            <div>
              <h4 className="text-base font-bold text-white flex items-center space-x-2">
                <FileText className="h-5 w-5 text-emerald-400" />
                <span>Submit Bank Transfer Information</span>
              </h4>
              <p className="text-xs text-slate-400">Fill in your transaction details for verification</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
              Manual Verification Required
            </span>
          </div>

          {formError && (
            <div className="mb-4 flex items-center space-x-2 rounded-lg bg-red-500/10 p-3 text-xs text-red-300 border border-red-500/30">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-400" />
              <span>{formError}</span>
            </div>
          )}

          {successNotice && (
            <div className="mb-4 flex items-center space-x-2 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-300 border border-emerald-500/30">
              <Check className="h-4 w-4 flex-shrink-0 text-emerald-400" />
              <span>{successNotice}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                Amount Transferred (₦) <span className="text-emerald-400">*</span>
              </label>
              <input
                type="number"
                value={amountClaimed}
                onChange={(e) => setAmountClaimed(e.target.value)}
                placeholder="e.g. 1500000"
                required
                min="1"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Required order total: ₦{order.totalAmount.toLocaleString()}
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                Sender's Bank Account Name <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g. Tunde Adebayo"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Name on the sending bank account
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                Transaction / Reference ID <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                placeholder="e.g. 0902672610011729013849102"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                The session ID or reference provided by your banking app
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                Payment Proof / Screenshot (Optional)
              </label>
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 cursor-pointer rounded-xl border border-dashed border-slate-700 bg-slate-950 px-4 py-2.5 text-xs font-medium text-slate-300 hover:border-emerald-500 transition-colors">
                  <Upload className="h-4 w-4 text-emerald-400" />
                  <span>{proofFileName ? 'Change receipt file' : 'Upload payment receipt / screenshot'}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {proofFileName && (
                  <span className="text-xs text-emerald-400 font-mono truncate max-w-xs">
                    ✓ {proofFileName}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800 pt-5">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Payments are held securely and verified by treasury before supplier payout</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Submitting Details...</span>
                </>
              ) : (
                <>
                  <span>Submit Payment for Verification</span>
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
