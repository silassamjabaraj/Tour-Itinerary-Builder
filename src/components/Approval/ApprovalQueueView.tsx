import React, { useState } from 'react';
import { ApprovalRequest, UserRole } from '../../types';
import { ShieldAlert, CheckCircle2, XCircle, MessageSquare, DollarSign, Calendar, Clock, Sparkles, Lock, Shield, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';
import { canApproveDiscounts } from '../../lib/permissions';

interface ApprovalQueueViewProps {
  approvals: ApprovalRequest[];
  currentUserRole?: UserRole;
  onDecideApproval: (id: string, decision: 'Approved' | 'Rejected', comments: string) => void;
}

export const ApprovalQueueView: React.FC<ApprovalQueueViewProps> = ({
  approvals,
  currentUserRole = 'Sales Manager',
  onDecideApproval,
}) => {
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(
    approvals.find((a) => a.status === 'Pending') || null
  );
  const [comments, setComments] = useState('');

  const isAuthorizedToDecide = canApproveDiscounts(currentUserRole);

  const pendingList = approvals.filter((a) => a.status === 'Pending');
  const historyList = approvals.filter((a) => a.status !== 'Pending');

  const handleAction = (decision: 'Approved' | 'Rejected') => {
    if (!selectedApproval || !isAuthorizedToDecide) return;
    if (decision === 'Approved') {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
    onDecideApproval(selectedApproval.id, decision, comments);
    setComments('');
    setSelectedApproval(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-red-500" /> Commercial Approval Queue
            </h2>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
              Role: {currentUserRole}
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            {isAuthorizedToDecide
              ? 'Sales Manager decision workspace for discount thresholds and low margin overrides.'
              : 'Viewing approval requests in read-only audit mode. Decision rights reserved for Sales Manager and Administrator.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isAuthorizedToDecide && (
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 px-3 py-1.5 rounded-xl border border-amber-200 text-xs font-medium">
              <Eye className="w-3.5 h-3.5 text-amber-600" /> Audit Mode Only
            </div>
          )}
          <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-xl border border-red-200 text-xs font-bold">
            <span>{pendingList.length} Pending Approval Requests</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Requests List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Pending Submissions
          </h3>

          {pendingList.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No pending approval requests. All quotes are within standard margins.
            </p>
          ) : (
            <div className="space-y-2">
              {pendingList.map((app) => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApproval(app)}
                  className={`p-3 rounded-xl border cursor-pointer transition text-xs space-y-1 ${
                    selectedApproval?.id === app.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold">{app.itineraryNumber}</span>
                    <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                      {app.discountPercent}% Disc
                    </span>
                  </div>
                  <div className="font-semibold text-indigo-400">{app.customerName}</div>
                  <div className="text-[11px] opacity-80">Consultant: {app.consultantName}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Decision Detail Inspector */}
        <div className="lg:col-span-2 space-y-6">
          {selectedApproval ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider block">
                    Approval Decision Detail
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                    {selectedApproval.itineraryNumber} — {selectedApproval.title || 'Proposal Review'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Submitted by {selectedApproval.consultantName} for client {selectedApproval.customerName}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Requested Price:</span>
                  <span className="text-2xl font-black text-slate-900">
                    ₹{selectedApproval.sellingPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Financial Metrics Comparison */}
              <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Total Cost:</span>
                  <strong className="text-slate-900 font-mono text-sm">₹{selectedApproval.totalCost.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Selling Price:</span>
                  <strong className="text-slate-900 font-mono text-sm">₹{selectedApproval.sellingPrice.toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Discount Applied:</span>
                  <strong className="text-red-600 font-mono text-sm">{selectedApproval.discountPercent}%</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Gross Margin %:</span>
                  <strong className="text-emerald-700 font-mono text-sm">{selectedApproval.marginPercent}%</strong>
                </div>
              </div>

              {/* Reason for Escalation */}
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 text-xs space-y-1">
                <strong className="text-indigo-900 block font-bold">Manager Approval Trigger Reason:</strong>
                <p className="text-indigo-800 leading-relaxed">{selectedApproval.reason}</p>
              </div>

              {/* Comments & Decision Buttons */}
              {isAuthorizedToDecide ? (
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Manager Review Notes & Decision Comments
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter approval rationale or requested adjustments..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleAction('Rejected')}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" /> Reject / Return Proposal
                    </button>

                    <button
                      onClick={() => handleAction('Approved')}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve Proposal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 text-xs space-y-1.5 mt-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold">
                    <Lock className="w-4 h-4 text-amber-700" />
                    <span>Decision Rights Restricted for {currentUserRole}</span>
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    You have access to audit commercial details and margin escalations. Authorizing or rejecting discounts requires an account with <strong>Sales Manager</strong> or <strong>Administrator</strong> role privileges.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              Select a pending proposal submission from the left list to review financial metrics and authorize discount.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
