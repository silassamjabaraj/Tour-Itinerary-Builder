import React, { useState } from 'react';
import { Itinerary, ItineraryItem, UserRole } from '../../types';
import { FolderKanban, CheckCircle2, Clock, FileText, Building2, UserCheck, Search, Filter, Eye, Lock } from 'lucide-react';
import { canManageOperations } from '../../lib/permissions';

interface OperationsBoardViewProps {
  itineraries: Itinerary[];
  currentUserRole?: UserRole;
  onOpenPreview: (itinerary: Itinerary) => void;
  onUpdateConfirmationRef: (itineraryId: string, itemId: string, status: any, refCode: string) => void;
}

export const OperationsBoardView: React.FC<OperationsBoardViewProps> = ({
  itineraries,
  currentUserRole = 'Operations Executive',
  onOpenPreview,
  onUpdateConfirmationRef,
}) => {
  const isAuthorized = canManageOperations(currentUserRole);

  const confirmedItineraries = itineraries.filter(
    (i) => i.status === 'Won' || i.status === 'Confirmed' || i.status === 'In Operation'
  );

  const [selectedItineraryId, setSelectedItineraryId] = useState<string>(
    confirmedItineraries[0]?.id || itineraries[0]?.id || ''
  );

  const activeItinerary = itineraries.find((i) => i.id === selectedItineraryId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FolderKanban className="w-6 h-6 text-purple-600" /> Operations Execution Board
            </h2>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
              Role: {currentUserRole}
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            {isAuthorized
              ? 'Supplier bookings, voucher issuance, driver/guide schedules, and rooming allocations.'
              : 'Viewing operations status in read-only audit mode.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isAuthorized && (
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 px-3 py-1.5 rounded-xl border border-amber-200 text-xs font-semibold">
              <Eye className="w-3.5 h-3.5 text-amber-600" /> Read-Only Mode
            </div>
          )}
          <div className="flex items-center gap-2 bg-purple-50 text-purple-800 px-3 py-1.5 rounded-xl border border-purple-200 text-xs font-bold">
            <span>{confirmedItineraries.length} Confirmed Operational Trips</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Confirmed Trips Selector List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Confirmed Bookings
          </h3>

          <div className="space-y-2">
            {confirmedItineraries.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No confirmed trips yet. Change proposal status to "Won" or "Confirmed" to manage operations.
              </p>
            ) : (
              confirmedItineraries.map((it) => (
                <div
                  key={it.id}
                  onClick={() => setSelectedItineraryId(it.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition text-xs space-y-1 ${
                    selectedItineraryId === it.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold">{it.itineraryNumber}</span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {it.status}
                    </span>
                  </div>
                  <div className="font-semibold text-indigo-400">{it.customerName}</div>
                  <div className="text-[11px] opacity-80">
                    {it.startDate} ({it.durationDays} Days) • {it.adults} Adults
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Trip Execution Checklist */}
        <div className="lg:col-span-2 space-y-6">
          {activeItinerary ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="text-xs font-mono font-bold text-indigo-600">{activeItinerary.itineraryNumber}</div>
                  <h3 className="text-xl font-bold text-slate-900">{activeItinerary.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Client: <strong>{activeItinerary.customerName}</strong> • Dates: {activeItinerary.startDate} to {activeItinerary.endDate}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenPreview(activeItinerary)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                  >
                    <FileText className="w-4 h-4" /> Issue Vouchers / Rooming List
                  </button>
                </div>
              </div>

              {/* Service Checklist per Day */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Supplier Booking & Confirmation Log
                </h4>

                {activeItinerary.days.map((day) => (
                  <div key={day.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                    <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex justify-between">
                      <span>Day {day.dayNumber}: {day.title}</span>
                      <span className="text-indigo-700">{day.destination}</span>
                    </div>

                    <div className="space-y-2">
                      {day.items.map((item) => (
                        <div key={item.id} className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold text-slate-900 text-xs block">{item.title}</span>
                              <span className="text-[11px] text-slate-500">
                                Supplier: {item.supplierName || 'Primary DMC'} • Type: {item.type}
                              </span>
                            </div>

                            <select
                              value={item.confirmationStatus || 'Pending'}
                              onChange={(e) =>
                                onUpdateConfirmationRef(
                                  activeItinerary.id,
                                  item.id,
                                  e.target.value,
                                  item.confirmationReference || ''
                                )
                              }
                              className={`text-[10px] font-bold rounded px-2 py-1 cursor-pointer ${
                                item.confirmationStatus === 'Confirmed' || item.confirmationStatus === 'Voucher Issued'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Voucher Issued">Voucher Issued</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                            <span className="text-[11px] text-slate-500 font-medium">Supplier Ref Code:</span>
                            <input
                              type="text"
                              placeholder="e.g. ECS-90812"
                              value={item.confirmationReference || ''}
                              onChange={(e) =>
                                onUpdateConfirmationRef(
                                  activeItinerary.id,
                                  item.id,
                                  item.confirmationStatus || 'Pending',
                                  e.target.value
                                )
                              }
                              className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono font-bold text-slate-800 focus:outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              Select a booking from the left list.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
