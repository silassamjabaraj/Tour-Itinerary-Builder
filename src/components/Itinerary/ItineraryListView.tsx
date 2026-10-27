import React, { useState } from 'react';
import { Itinerary, ItineraryStatus, UserRole } from '../../types';
import { 
  Compass, 
  PlusCircle, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Copy, 
  Trash2, 
  FileText, 
  DollarSign, 
  Calendar, 
  UserCheck, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles,
  Lock,
  Coins
} from 'lucide-react';
import { canCreateItinerary, canDeleteItinerary, isReadOnlyRole } from '../../lib/permissions';
import { formatCurrency, getCurrencySymbol } from '../../lib/currency';

interface ItineraryListViewProps {
  itineraries: Itinerary[];
  currentUserRole?: UserRole;
  onOpenBuilder: (id: string) => void;
  onOpenPreview: (itinerary: Itinerary) => void;
  onNewItinerary: () => void;
  onCloneItinerary: (itinerary: Itinerary) => void;
  onDeleteItinerary: (id: string) => void;
}

export const ItineraryListView: React.FC<ItineraryListViewProps> = ({
  itineraries,
  currentUserRole = 'Travel Consultant',
  onOpenBuilder,
  onOpenPreview,
  onNewItinerary,
  onCloneItinerary,
  onDeleteItinerary,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const canCreate = canCreateItinerary(currentUserRole);
  const canDelete = canDeleteItinerary(currentUserRole);
  const isReadOnly = isReadOnlyRole(currentUserRole);

  const filtered = itineraries.filter((it) => {
    if (it.isTemplate) return false;
    const matchesSearch =
      it.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      it.itineraryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      it.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      it.destinations.join(' ').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || it.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses: (ItineraryStatus | 'All')[] = [
    'All',
    'Draft',
    'Internal Review',
    'Approved',
    'Sent',
    'Revised',
    'Won',
    'Confirmed',
    'In Operation',
    'Completed',
    'Cancelled',
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-6 h-6 text-indigo-600" /> Itinerary Proposals Hub
            </h2>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
              Role: {currentUserRole}
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Day-by-day tour schedules, pricing calculations, revision history, and client exports.
          </p>
        </div>

        {canCreate ? (
          <button
            onClick={onNewItinerary}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Create New Itinerary
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium border border-slate-200">
            <Lock className="w-3.5 h-3.5 text-slate-500" /> Read-Only Mode
          </div>
        )}
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ITN number, client name, title or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white text-slate-800 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 mr-1" />
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                statusFilter === s
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Itineraries List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-sm space-y-3">
            <Compass className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">No itineraries found matching criteria.</p>
            <p className="text-xs text-slate-400">Try adjusting your filters or create a new proposal from scratch.</p>
          </div>
        ) : (
          filtered.map((it) => (
            <div
              key={it.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-indigo-300 transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
            >
              {/* Main Information */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-slate-900 text-indigo-400 px-2.5 py-0.5 rounded-md border border-slate-800">
                    {it.itineraryNumber}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Rev {it.currentRevision} (R0{it.currentRevision})
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      it.status === 'Won' || it.status === 'Confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : it.status === 'Sent'
                        ? 'bg-blue-100 text-blue-800'
                        : it.status === 'Approved'
                        ? 'bg-purple-100 text-purple-800'
                        : it.status === 'Internal Review'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {it.status}
                  </span>

                  {it.requiresApproval && (
                    <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Approval Needed
                    </span>
                  )}
                </div>

                <h3
                  onClick={() => onOpenBuilder(it.id)}
                  className="text-base font-bold text-slate-900 hover:text-indigo-600 transition cursor-pointer"
                >
                  {it.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span>
                    Client: <strong className="text-slate-800">{it.customerName}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {it.startDate} to {it.endDate} ({it.durationDays} Days / {it.days.length} Daily Cards)
                  </span>
                  <span>•</span>
                  <span>
                    Pax: <strong className="text-slate-800">{it.adults} Adults, {it.children} Children</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Destinations: <strong className="text-indigo-700">{it.destinations.join(', ')}</strong>
                  </span>
                </div>
              </div>

              {/* Pricing Overview & Action Buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 lg:pt-0 lg:pl-6 w-full lg:w-auto justify-between">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Selling Price</div>
                  <div className="text-xl font-bold text-slate-900 flex items-baseline gap-1">
                    <span>{formatCurrency(it.pricing?.finalSellingPrice || 0, 'INR')}</span>
                  </div>
                  <div className="text-xs text-emerald-600 font-semibold mt-0.5">
                    Gross Profit: {formatCurrency(it.pricing?.grossProfit || 0, 'INR')} ({it.pricing?.targetMarginPercent || 0}% margin)
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenPreview(it)}
                    title="Branded PDF / DOCX Preview"
                    className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-semibold px-3"
                  >
                    <Eye className="w-4 h-4 text-indigo-600" /> Preview & Export
                  </button>

                  <button
                    onClick={() => onOpenBuilder(it.id)}
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition cursor-pointer flex items-center gap-1 text-xs px-3 shadow-sm"
                  >
                    <Edit3 className="w-4 h-4" /> {isReadOnly ? 'View Itinerary' : 'Open Builder'}
                  </button>

                  {!isReadOnly && (
                    <button
                      onClick={() => onCloneItinerary(it)}
                      title="Clone as New Proposal"
                      className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}

                  {canDelete && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete proposal ${it.itineraryNumber}?`)) {
                          onDeleteItinerary(it.id);
                        }
                      }}
                      title="Delete Proposal (Manager only)"
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
