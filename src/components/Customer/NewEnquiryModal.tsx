import React, { useState } from 'react';
import { Customer, Enquiry } from '../../types';
import { FilePlus, Calendar, Users, DollarSign, MapPin, X } from 'lucide-react';

interface NewEnquiryModalProps {
  customer?: Customer;
  customers: Customer[];
  onClose: () => void;
  onSave: (enquiry: Enquiry) => void;
}

export const NewEnquiryModal: React.FC<NewEnquiryModalProps> = ({
  customer,
  customers,
  onClose,
  onSave,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState(customer?.id || (customers[0]?.id || ''));
  const [destination, setDestination] = useState('United Arab Emirates (Dubai & Abu Dhabi)');
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-11-07');
  const [durationDays, setDurationDays] = useState(6);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(1);
  const [infants, setInfants] = useState(0);

  const [doubleTwinRooms, setDoubleTwinRooms] = useState(1);
  const [extraBeds, setExtraBeds] = useState(1);
  const [singleRooms, setSingleRooms] = useState(0);
  const [tripleRooms, setTripleRooms] = useState(0);

  const [budgetCurrency, setBudgetCurrency] = useState('INR');
  const [budgetAmount, setBudgetAmount] = useState(500000);
  const [interests, setInterests] = useState('Desert Safari, 5-Star Beach Resort, Cultural Excursions');
  const [deadline, setDeadline] = useState('2026-08-20');

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      const d1 = new Date(start);
      const d2 = new Date(end);
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) setDurationDays(diffDays);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selCust = customers.find((c) => c.id === selectedCustomerId) || customer;
    if (!selCust) return;

    const enqNumber = `ENQ-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const newEnquiry: Enquiry = {
      id: enqNumber,
      customerId: selCust.id,
      customerName: selCust.name,
      consultantId: 'usr-1',
      consultantName: 'Sarah Jenkins',
      destination,
      startDate,
      endDate,
      durationDays,
      adults,
      children,
      infants,
      roomRequirements: {
        singleRooms,
        doubleTwinRooms,
        tripleRooms,
        extraBeds,
      },
      budgetCurrency,
      budgetAmount,
      interests: interests.split(',').map((s) => s.trim()),
      deadline,
      source: 'Direct Web Inquiry',
      status: 'Open',
      createdAt: new Date().toISOString(),
    };

    onSave(newEnquiry);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
              <FilePlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">New Trip Enquiry Brief</h3>
              <p className="text-xs text-slate-500">Capture travel dates, passenger count, and room occupancy</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Customer Selection */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Customer / Agency *</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type} - {c.email})
                </option>
              ))}
            </select>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-500" /> Destination(s) *
            </label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. United Arab Emirates (Dubai & Abu Dhabi)"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          {/* Travel Dates */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => handleDateChange(e.target.value, endDate)}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">End Date *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => handleDateChange(startDate, e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Duration (Days)</label>
              <input
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-bold text-amber-800"
              />
            </div>
          </div>

          {/* Passenger Breakdown */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-amber-500" /> Passenger Count (Pax)
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 text-[11px] mb-1">Adults (12+ yrs)</label>
                <input
                  type="number"
                  min="1"
                  value={adults}
                  onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-[11px] mb-1">Children (3-11 yrs)</label>
                <input
                  type="number"
                  min="0"
                  value={children}
                  onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 text-[11px] mb-1">Infants (0-2 yrs)</label>
                <input
                  type="number"
                  min="0"
                  value={infants}
                  onChange={(e) => setInfants(parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>
            </div>
          </div>

          {/* Room Requirements */}
          <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block text-slate-600 text-[10px] mb-1">Single Rooms</label>
              <input
                type="number"
                min="0"
                value={singleRooms}
                onChange={(e) => setSingleRooms(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-600 text-[10px] mb-1">Double/Twin</label>
              <input
                type="number"
                min="0"
                value={doubleTwinRooms}
                onChange={(e) => setDoubleTwinRooms(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-600 text-[10px] mb-1">Triple Rooms</label>
              <input
                type="number"
                min="0"
                value={tripleRooms}
                onChange={(e) => setTripleRooms(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-600 text-[10px] mb-1">Extra Beds</label>
              <input
                type="number"
                min="0"
                value={extraBeds}
                onChange={(e) => setExtraBeds(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white"
              />
            </div>
          </div>

          {/* Budget & Interests */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-500" /> Target Budget ({budgetCurrency})
              </label>
              <input
                type="number"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Quote Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Key Preferences & Interests</label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. Luxury Desert Safari, Private Transfers, Fine Dining"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              Save Trip Brief
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
