import React from 'react';
import { 
  Compass, 
  PlusCircle, 
  ShieldAlert, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  FileCheck2, 
  DollarSign, 
  Layers, 
  ArrowRight, 
  Sparkles,
  Building2,
  FolderKanban,
  Database,
  FileText,
  BarChart3,
  Shield,
  UserCheck
} from 'lucide-react';
import { Itinerary, ApprovalRequest, AuditLog, User, UserRole } from '../../types';
import { ROLE_PERMISSIONS, canCreateItinerary, canCreateCustomers } from '../../lib/permissions';
import { formatCurrency } from '../../lib/currency';

interface DashboardViewProps {
  itineraries: Itinerary[];
  approvals: ApprovalRequest[];
  auditLogs: AuditLog[];
  currentUser?: User | null;
  currentUserRole?: UserRole;
  onOpenItinerary: (id: string) => void;
  onNewItinerary: () => void;
  onNewEnquiry: () => void;
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  itineraries,
  approvals,
  auditLogs,
  currentUser,
  currentUserRole = 'Administrator',
  onOpenItinerary,
  onNewItinerary,
  onNewEnquiry,
  onNavigate,
}) => {
  const pendingApprovals = approvals.filter((a) => a.status === 'Pending');
  const draftCount = itineraries.filter((i) => i.status === 'Draft' || i.status === 'Internal Review').length;
  const sentCount = itineraries.filter((i) => i.status === 'Sent' || i.status === 'Approved').length;
  const wonCount = itineraries.filter((i) => i.status === 'Won').length;
  const confirmedCount = itineraries.filter((i) => i.status === 'Confirmed' || i.status === 'In Operation').length;

  const totalPipelineValue = itineraries.reduce(
    (acc, cur) => acc + (cur.pricing?.finalSellingPrice || 0),
    0
  );

  const avgMargin = Math.round(
    itineraries.reduce((acc, cur) => acc + (cur.pricing?.targetMarginPercent || 0), 0) /
      (itineraries.length || 1)
  );

  const roleConfig = ROLE_PERMISSIONS[currentUserRole];
  const canCreateItn = canCreateItinerary(currentUserRole);
  const canCreateCust = canCreateCustomers(currentUserRole);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1.5">
            <UserCheck className="w-4 h-4" />
            <span>{currentUser ? `Welcome back, ${currentUser.name}` : 'Tour Itinerary Workspace'}</span>
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/30 ml-1">
              {currentUserRole}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {currentUserRole === 'Sales Manager'
              ? 'Sales Leadership & Approval Command'
              : currentUserRole === 'Operations Executive'
              ? 'Tour Operations & Logistics Center'
              : currentUserRole === 'Product Manager'
              ? 'Master Data & Template Catalog'
              : currentUserRole === 'Finance User'
              ? 'Commercial Financial & Margin Dashboard'
              : currentUserRole === 'Read-only Viewer'
              ? 'Executive Proposal Overview'
              : 'Command Center & Proposal Pipeline'}
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
            {roleConfig?.description ||
              'Create, price, revise, approve, and export professional day-by-day itineraries for your travel agency clients.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 relative shrink-0">
          {canCreateCust && (
            <button
              onClick={onNewEnquiry}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl font-medium text-xs border border-slate-700 transition flex items-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4 text-indigo-400" /> New Enquiry
            </button>
          )}
          {canCreateItn && (
            <button
              onClick={onNewItinerary}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-600/25 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Create New Itinerary
            </button>
          )}
          {currentUserRole === 'Sales Manager' && pendingApprovals.length > 0 && (
            <button
              onClick={() => onNavigate('approvals')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-xs transition flex items-center gap-2 shadow-lg shadow-amber-600/25 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" /> {pendingApprovals.length} Pending Approvals
            </button>
          )}
          {currentUserRole === 'Operations Executive' && (
            <button
              onClick={() => onNavigate('operations')}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-xs transition flex items-center gap-2 shadow-lg shadow-cyan-600/25 cursor-pointer"
            >
              <FolderKanban className="w-4 h-4" /> Go to Operations Board
            </button>
          )}
          {currentUserRole === 'Product Manager' && (
            <button
              onClick={() => onNavigate('masters')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs transition flex items-center gap-2 shadow-lg shadow-rose-600/25 cursor-pointer"
            >
              <Database className="w-4 h-4" /> Manage Master Catalog
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Draft Proposals</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{draftCount}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">In preparation</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Pending Approvals</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{pendingApprovals.length}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Exceeds threshold</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Active Sent</span>
            <Compass className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{sentCount}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Shared with clients</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Won / Accepted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{wonCount}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Ready for booking</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Confirmed Operations</span>
            <FileCheck2 className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{confirmedCount}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Vouchers issued</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Pipeline Value</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-slate-900">₹{totalPipelineValue.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Avg Margin: {avgMargin}%</span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Itineraries List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Recent Itineraries</h3>
              <p className="text-xs text-slate-500">Active proposals and custom tour plans</p>
            </div>
            <button
              onClick={() => onNavigate('itineraries')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {itineraries.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No itineraries built yet. Click "Create New Itinerary" to begin.
              </div>
            ) : (
              itineraries.map((it) => (
                <div
                  key={it.id}
                  onClick={() => onOpenItinerary(it.id)}
                  className="p-4 hover:bg-slate-50/80 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm hover:text-indigo-600">
                        {it.title}
                      </span>
                      <span className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                        {it.itineraryNumber}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          it.status === 'Won' || it.status === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : it.status === 'Sent'
                            ? 'bg-blue-100 text-blue-800'
                            : it.status === 'Internal Review'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {it.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>Client: <strong className="text-slate-700">{it.customerName}</strong></span>
                      <span>•</span>
                      <span>Dates: <strong>{it.startDate}</strong> to <strong>{it.endDate}</strong> ({it.durationDays} Days)</span>
                      <span>•</span>
                      <span>PAX: <strong>{it.adults} Adults, {it.children} Children</strong></span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-base font-bold text-slate-900 font-mono">
                      {formatCurrency(it.pricing?.finalSellingPrice || 0, 'INR')}
                    </div>
                    <div className="text-[11px] text-emerald-600 font-medium">
                      Margin: {it.pricing?.targetMarginPercent || 0}% ({formatCurrency(it.pricing?.grossProfit || 0, 'INR')} profit)
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar: Approvals & Audit Log */}
        <div className="space-y-6">
          {/* Pending Approval Widget */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <h4 className="font-bold text-slate-900 text-sm">Approval Queue</h4>
              </div>
              <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                {pendingApprovals.length} Pending
              </span>
            </div>

            {pendingApprovals.length === 0 ? (
              <p className="text-xs text-slate-500 py-2 text-center">
                All pricing rules and discounts are within normal limits.
              </p>
            ) : (
              <div className="space-y-3">
                {pendingApprovals.map((app) => (
                  <div key={app.id} className="p-3 bg-red-50/50 rounded-xl border border-red-100 text-xs space-y-1.5">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-900">{app.itineraryNumber}</span>
                      <span className="text-[10px] text-red-600 font-semibold">{app.customerName}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{app.reason}</p>
                    <div className="pt-1 flex items-center justify-between">
                      <span className="font-bold text-slate-800">Selling: ₹{app.sellingPrice.toLocaleString()}</span>
                      <button
                        onClick={() => onNavigate('approvals')}
                        className="text-[11px] text-red-700 font-bold hover:underline cursor-pointer"
                      >
                        Review & Approve →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit Log Stream */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h4 className="font-bold text-slate-900 text-sm">System Audit Activity</h4>
              <button
                onClick={() => onNavigate('admin')}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Log History
              </button>
            </div>

            <div className="space-y-3">
              {auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div className="space-y-0.5">
                    <div className="text-slate-800 font-medium">{log.summary}</div>
                    <div className="text-[10px] text-slate-400">
                      {log.userName} ({log.userRole}) • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
