import React, { useState } from 'react';
import { Itinerary, CompanySettings } from '../../types';
import { exportElementToPdf, printElement } from '../../lib/pdfGenerator';
import { 
  FileText, 
  Download, 
  Printer, 
  X, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Calendar, 
  Users, 
  Sparkles, 
  Eye, 
  ShieldCheck, 
  Hotel, 
  Car, 
  Utensils,
  Check
} from 'lucide-react';
import { formatCurrency } from '../../lib/currency';

interface ItineraryPreviewModalProps {
  itinerary: Itinerary;
  companySettings: CompanySettings;
  onClose: () => void;
  onRecordExport: (docType: string, format: 'PDF' | 'DOCX') => void;
}

export const ItineraryPreviewModal: React.FC<ItineraryPreviewModalProps> = ({
  itinerary,
  companySettings,
  onClose,
  onRecordExport,
}) => {
  const [docType, setDocType] = useState<
    'Customer Proposal' | 'Brief Proposal' | 'Internal Costing Sheet' | 'Operations Sheet' | 'Service Voucher' | 'Rooming List'
  >('Customer Proposal');

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    const fileName = `${itinerary.itineraryNumber}-${itinerary.revisions[0]?.revisionCode || 'R01'}-${docType.replace(/\s+/g, '_')}`;
    const isLandscape = docType === 'Operations Sheet' || docType === 'Rooming List';
    
    const success = await exportElementToPdf(
      'export-document-canvas', 
      fileName, 
      isLandscape ? 'landscape' : 'portrait'
    );
    
    setIsExporting(false);
    if (success) {
      setExportSuccess(true);
      onRecordExport(docType, 'PDF');
      setTimeout(() => setExportSuccess(false), 3500);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    printElement('export-document-canvas');
    onRecordExport(docType, 'PDF');
    setTimeout(() => setIsPrinting(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">Document Generator & Preview Workspace</h3>
              <p className="text-xs text-slate-400">
                {itinerary.itineraryNumber} • {itinerary.customerName} • Rev {itinerary.currentRevision}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Document Type Picker */}
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as any)}
              className="bg-slate-800 text-indigo-300 text-xs font-bold rounded-xl px-3 py-1.5 border border-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Customer Proposal">Customer Proposal (Full Branded)</option>
              <option value="Brief Proposal">Brief Proposal (Compact Schedule)</option>
              <option value="Internal Costing Sheet">Internal Costing Sheet (Sales/Finance)</option>
              <option value="Operations Sheet">Operations Sheet (Chauffeur/Guides)</option>
              <option value="Service Voucher">Service Voucher (Supplier Copy)</option>
              <option value="Rooming List">Rooming List (Hotel Allocation)</option>
            </select>

            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
            >
              {isPrinting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-300/30 border-t-white rounded-full animate-spin" />
                  <span>Printing...</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4 text-slate-300" />
                  <span>Print</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 disabled:opacity-50 cursor-pointer transition-all"
            >
              {exportSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span className="text-emerald-200">Downloaded!</span>
                </>
              ) : isExporting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white cursor-pointer ml-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Canvas */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/80">
          <div
            id="export-document-canvas"
            className="max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-xl border border-slate-200 rounded-xl space-y-8 text-slate-900"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            {/* DOCUMENT HEADER */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{companySettings.companyName}</h1>
                <p className="text-xs text-slate-500 mt-1">{companySettings.address}</p>
                <p className="text-xs text-slate-500">Email: {companySettings.email} | Phone: {companySettings.phone}</p>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">TRN: {companySettings.taxRegistrationNumber}</p>
              </div>

              <div className="text-right space-y-1">
                <span className="inline-block text-xs font-black uppercase tracking-wider bg-slate-900 text-amber-400 px-3 py-1 rounded">
                  {docType}
                </span>
                <div className="text-xs text-slate-700 font-mono font-bold mt-2">
                  Ref: {itinerary.itineraryNumber}-R0{itinerary.currentRevision}
                </div>
                <div className="text-[11px] text-slate-500">Issued: {new Date().toLocaleDateString()}</div>
                <div className="text-[11px] text-slate-500">Prepared By: {itinerary.consultantName}</div>
              </div>
            </div>

            {/* DOCUMENT TYPE 1: CUSTOMER PROPOSAL */}
            {docType === 'Customer Proposal' && (
              <div className="space-y-8">
                {/* Title Banner */}
                <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-2">
                  <div className="text-amber-400 text-xs font-bold uppercase tracking-wider">
                    Custom Tour Proposal for {itinerary.customerName}
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">{itinerary.title}</h2>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    <span>
                      Travel Dates: <strong>{itinerary.startDate} to {itinerary.endDate}</strong> ({itinerary.durationDays} Days)
                    </span>
                    <span>•</span>
                    <span>
                      Guests: <strong>{itinerary.adults} Adults, {itinerary.children} Children</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Destinations: <strong>{itinerary.destinations.join(', ')}</strong>
                    </span>
                  </div>
                </div>

                {/* Day-by-Day Schedule */}
                <div className="space-y-6">
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
                    Day-by-Day Itinerary Schedule
                  </h3>

                  {itinerary.days.map((day) => (
                    <div key={day.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <h4 className="font-bold text-slate-900 text-sm">
                          Day {day.dayNumber} ({day.date}) — {day.title}
                        </h4>
                        <span className="text-xs font-semibold text-amber-700">{day.destination}</span>
                      </div>

                      {day.summaryNote && <p className="text-xs text-slate-600 italic">{day.summaryNote}</p>}

                      <div className="space-y-3">
                        {day.items.map((item) => (
                          <div key={item.id} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1.5">
                            <div className="flex justify-between font-bold text-slate-900">
                              <span>
                                {item.startTime && `${item.startTime} - `}
                                {item.title}
                              </span>
                              <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                {item.type}
                              </span>
                            </div>
                            <p className="text-slate-600 leading-relaxed">{item.customerDescription}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing Summary */}
                <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-amber-400 text-xs font-bold uppercase tracking-wider block">Total Commercial Investment</span>
                    <div className="text-2xl font-extrabold text-white flex items-baseline gap-2">
                      <span>{formatCurrency(itinerary.pricing.finalSellingPrice, 'INR')}</span>
                      <span className="text-xs font-semibold text-indigo-300 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 font-mono">
                        INR (₹)
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Includes all hotels, private transfers, guided excursions, activities, and taxes.
                    </p>
                  </div>

                  <div className="text-right text-xs text-slate-300 space-y-1 bg-slate-800 p-3 rounded-xl border border-slate-700/60">
                    <div>Per Adult: <strong className="text-white font-mono">{formatCurrency(itinerary.pricing.perAdultPrice, 'INR')}</strong></div>
                    {itinerary.children > 0 && <div>Per Child: <strong className="text-white font-mono">{formatCurrency(itinerary.pricing.perChildPrice, 'INR')}</strong></div>}
                  </div>
                </div>

                {/* Inclusions & Exclusions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
                    <h4 className="font-bold text-emerald-900 uppercase tracking-wider text-[11px]">Included in Proposal</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {itinerary.inclusions.map((inc, i) => (
                        <li key={i}>{inc}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-red-50/60 rounded-xl border border-red-200 space-y-2">
                    <h4 className="font-bold text-red-900 uppercase tracking-wider text-[11px]">Excluded from Proposal</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      {itinerary.exclusions.map((exc, i) => (
                        <li key={i}>{exc}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="text-xs text-slate-500 border-t border-slate-200 pt-4 space-y-1">
                  <strong className="text-slate-800">Booking Terms & Conditions:</strong>
                  <p>{companySettings.defaultTerms}</p>
                </div>
              </div>
            )}

            {/* DOCUMENT TYPE 2: BRIEF PROPOSAL */}
            {docType === 'Brief Proposal' && (
              <div className="space-y-6 text-xs">
                <div className="bg-slate-900 text-white p-4 rounded-xl">
                  <h2 className="font-bold text-lg">{itinerary.title}</h2>
                  <p className="text-slate-300 text-xs">Client: {itinerary.customerName} • {itinerary.startDate} to {itinerary.endDate}</p>
                </div>

                <table className="w-full text-left border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-200">
                      <th className="p-2">Day</th>
                      <th className="p-2">Date</th>
                      <th className="p-2">Highlights & Schedule</th>
                      <th className="p-2">Destination</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itinerary.days.map((d) => (
                      <tr key={d.id} className="border-b border-slate-100">
                        <td className="p-2 font-bold">Day {d.dayNumber}</td>
                        <td className="p-2">{d.date}</td>
                        <td className="p-2 font-semibold">{d.title}</td>
                        <td className="p-2">{d.destination}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-right">
                  <span className="text-xs text-slate-600 block">Total Package Quote:</span>
                  <strong className="text-xl text-slate-900 font-mono">
                    {formatCurrency(itinerary.pricing.finalSellingPrice, 'INR')}
                  </strong>
                </div>
              </div>
            )}

            {/* DOCUMENT TYPE 3: INTERNAL COSTING SHEET (Finance/Sales) */}
            {docType === 'Internal Costing Sheet' && (
              <div className="space-y-6 text-xs">
                <div className="p-3 bg-red-100 text-red-900 font-bold rounded-lg border border-red-200 text-center uppercase tracking-wider text-xs">
                  CONFIDENTIAL INTERNAL COSTING SHEET — DO NOT SHARE WITH CLIENT
                </div>

                <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 block">Supplier Cost:</span>
                    <strong className="text-slate-900 font-mono text-sm">
                      {formatCurrency(itinerary.pricing.totalCost, 'INR')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Selling Price:</span>
                    <strong className="text-slate-900 font-mono text-sm">
                      {formatCurrency(itinerary.pricing.finalSellingPrice, 'INR')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Gross Profit:</span>
                    <strong className="text-emerald-700 font-mono text-sm">
                      {formatCurrency(itinerary.pricing.grossProfit, 'INR')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Gross Margin %:</span>
                    <strong className="text-emerald-700 font-mono text-sm">{itinerary.pricing.targetMarginPercent}%</strong>
                  </div>
                </div>

                <table className="w-full text-left border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold text-[11px]">
                      <th className="p-2">Day</th>
                      <th className="p-2">Service Title</th>
                      <th className="p-2">Supplier</th>
                      <th className="p-2">Rate Basis</th>
                      <th className="p-2">Unit Cost (INR ₹)</th>
                      <th className="p-2">Total Cost (INR ₹)</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itinerary.days.flatMap((d) =>
                      d.items.map((i) => (
                        <tr key={i.id} className="border-b border-slate-100 text-xs">
                          <td className="p-2 font-bold">Day {d.dayNumber}</td>
                          <td className="p-2 font-semibold">{i.title}</td>
                          <td className="p-2 text-slate-600">{i.supplierName || 'DMC'}</td>
                          <td className="p-2">{i.rateBasis}</td>
                          <td className="p-2 font-mono">{formatCurrency(i.unitCost, 'INR')}</td>
                          <td className="p-2 font-mono font-bold">{formatCurrency(i.totalCost, 'INR')}</td>
                          <td className="p-2 font-semibold text-emerald-700">{i.confirmationStatus || 'Pending'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* DOCUMENT TYPE 4: OPERATIONS SHEET */}
            {docType === 'Operations Sheet' && (
              <div className="space-y-6 text-xs">
                <div className="p-4 bg-slate-900 text-white rounded-xl flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg text-amber-400">TOUR OPERATIONS & DISPATCH SHEET</h3>
                    <p className="text-xs text-slate-300">Operational Run Sheet for Chauffeurs, Guides & Local Coordinators</p>
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-bold text-slate-200">Pax: {itinerary.adults} Adults, {itinerary.children} Children</span>
                    <span className="block text-slate-400 text-[11px]">Status: Confirmed Run</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <strong className="text-slate-700 block">Lead Traveler:</strong>
                    <span className="font-bold text-slate-900">{itinerary.customerName}</span>
                  </div>
                  <div>
                    <strong className="text-slate-700 block">Emergency Dispatch:</strong>
                    <span className="font-mono text-slate-900">{companySettings.phone}</span>
                  </div>
                  <div>
                    <strong className="text-slate-700 block">Tour Dates:</strong>
                    <span>{itinerary.startDate} to {itinerary.endDate}</span>
                  </div>
                </div>

                <table className="w-full text-left border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold text-[11px]">
                      <th className="p-2">Day / Date</th>
                      <th className="p-2">Time</th>
                      <th className="p-2">Service / Activity</th>
                      <th className="p-2">Location / Pick-Up</th>
                      <th className="p-2">Supplier / Guide</th>
                      <th className="p-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itinerary.days.flatMap((d) =>
                      d.items.map((i, idx) => (
                        <tr key={i.id} className="border-b border-slate-100 text-xs">
                          {idx === 0 ? (
                            <td className="p-2 font-bold bg-slate-50 align-top" rowSpan={d.items.length}>
                              Day {d.dayNumber}<br/>
                              <span className="text-[10px] text-slate-500 font-normal">{d.date}</span>
                            </td>
                          ) : null}
                          <td className="p-2 font-mono font-semibold">{i.startTime || '09:00 AM'}</td>
                          <td className="p-2 font-semibold text-slate-900">{i.title}</td>
                          <td className="p-2 text-slate-600">{d.destination}</td>
                          <td className="p-2 font-medium text-indigo-700">{i.supplierName || 'Designated Driver'}</td>
                          <td className="p-2 text-slate-500 text-[11px]">{i.customerDescription?.slice(0, 60)}...</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* DOCUMENT TYPE 5: SERVICE VOUCHER */}
            {docType === 'Service Voucher' && (
              <div className="space-y-6 text-xs">
                <div className="p-4 bg-slate-900 text-white rounded-xl flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg text-amber-400">OFFICIAL SERVICE VOUCHER</h3>
                    <p className="text-xs text-slate-300">Present to supplier upon arrival</p>
                  </div>
                  <div className="text-right font-mono font-bold text-sm bg-slate-800 px-3 py-1 rounded">
                    VCH-{itinerary.itineraryNumber.slice(-6)}-01
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <strong className="text-slate-800 block mb-1">Lead Passenger Details:</strong>
                    <p>Name: <strong>{itinerary.customerName}</strong></p>
                    <p>Pax Count: {itinerary.adults} Adults, {itinerary.children} Children</p>
                  </div>
                  <div>
                    <strong className="text-slate-800 block mb-1">Confirmation Details:</strong>
                    <p>Confirmation Ref: ECS-{itinerary.id.slice(-5).toUpperCase()}</p>
                    <p>Service Date: {itinerary.startDate}</p>
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-slate-900">Services & Inclusions Covered:</h4>
                  <p className="text-slate-700 leading-relaxed">
                    {itinerary.title} — Full package handling including transfers, sightseeing tours, entry passes, and activities as scheduled.
                  </p>
                </div>
              </div>
            )}

            {/* DOCUMENT TYPE 6: ROOMING LIST */}
            {docType === 'Rooming List' && (
              <div className="space-y-6 text-xs">
                <div className="p-4 bg-slate-900 text-white rounded-xl flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg text-amber-400">HOTEL ROOMING & ALLOCATION MANIFEST</h3>
                    <p className="text-xs text-slate-300">Hotel Check-In & Guest Rooming Manifest</p>
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-bold text-slate-200">Total Rooms: 1 DBL / TWN</span>
                    <span className="block text-slate-400 text-[11px]">Total Guests: {itinerary.adults + itinerary.children}</span>
                  </div>
                </div>

                <table className="w-full text-left border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold text-[11px]">
                      <th className="p-2">Room #</th>
                      <th className="p-2">Guest Name(s)</th>
                      <th className="p-2">Room Category</th>
                      <th className="p-2">Meal Plan</th>
                      <th className="p-2">Check-In / Out</th>
                      <th className="p-2">Special Requests</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 font-bold">Room 101</td>
                      <td className="p-2 font-bold text-slate-900">{itinerary.customerName}</td>
                      <td className="p-2">Deluxe King / Twin Room</td>
                      <td className="p-2 font-semibold text-emerald-700">CP (Breakfast Included)</td>
                      <td className="p-2">{itinerary.startDate} to {itinerary.endDate}</td>
                      <td className="p-2 text-slate-500">Non-smoking, High Floor, Early Arrival</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* DOCUMENT FOOTER */}
            <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-[10px] text-slate-400">
              <span>{companySettings.companyName} • Confidential Tour Itinerary Document</span>
              <span>Generated on {new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
