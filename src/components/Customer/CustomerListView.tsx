import React, { useState } from 'react';
import { Customer, Enquiry, UserRole } from '../../types';
import { Users, Plus, Search, Mail, Phone, Globe, Calendar, FilePlus, ChevronRight, Lock, Eye } from 'lucide-react';
import { canCreateCustomers, canCreateItinerary } from '../../lib/permissions';

interface CustomerListViewProps {
  customers: Customer[];
  enquiries: Enquiry[];
  currentUserRole?: UserRole;
  onAddCustomer: (customer: Customer) => void;
  onNewEnquiryForCustomer: (customer: Customer) => void;
  onCreateItineraryForEnquiry: (enquiry: Enquiry) => void;
}

export const CustomerListView: React.FC<CustomerListViewProps> = ({
  customers,
  enquiries,
  currentUserRole = 'Travel Consultant',
  onAddCustomer,
  onNewEnquiryForCustomer,
  onCreateItineraryForEnquiry,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const canCreateCust = canCreateCustomers(currentUserRole);
  const canCreateItn = canCreateItinerary(currentUserRole);

  // New Customer Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<'Individual' | 'Family' | 'Corporate' | 'Agent'>('Family');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('British');
  const [preferences, setPreferences] = useState('');
  const [dietaryNotes, setDietaryNotes] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nationality.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name,
      type,
      email,
      phone,
      nationality,
      language: 'English',
      preferences,
      dietaryNotes,
      createdAt: new Date().toISOString(),
    };

    onAddCustomer(newCust);
    setShowAddModal(false);
    setName('');
    setEmail('');
    setPhone('');
    setPreferences('');
    setDietaryNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" /> Customer & Enquiry Directory
            </h2>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
              Role: {currentUserRole}
            </span>
          </div>
        </div>

        {canCreateCust ? (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" /> Add New Customer Profile
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold border border-slate-200">
            <Eye className="w-3.5 h-3.5 text-slate-500" /> Read-Only Directory
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search customer by name, email, nationality..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white text-slate-800 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCustomers.map((customer) => {
          const custEnquiries = enquiries.filter((e) => e.customerId === customer.id);

          return (
            <div
              key={customer.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-slate-300 transition"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{customer.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        customer.type === 'Corporate'
                          ? 'bg-purple-100 text-purple-800'
                          : customer.type === 'Agent'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {customer.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {customer.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {customer.phone}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onNewEnquiryForCustomer(customer)}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <FilePlus className="w-3.5 h-3.5" /> New Trip Brief
                </button>
              </div>

              {/* Preferences & Notes */}
              <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <strong className="text-slate-800">Nationality:</strong> {customer.nationality} |{' '}
                  <strong className="text-slate-800">Language:</strong> {customer.language}
                </div>
                {customer.preferences && (
                  <div>
                    <strong className="text-slate-800">Preferences:</strong> {customer.preferences}
                  </div>
                )}
                {customer.dietaryNotes && (
                  <div className="text-indigo-800 font-medium">
                    <strong>Dietary Notes:</strong> {customer.dietaryNotes}
                  </div>
                )}
              </div>

              {/* Attached Enquiries */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Active Trip Enquiries ({custEnquiries.length})
                </div>

                {custEnquiries.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No trip briefs recorded yet.</p>
                ) : (
                  custEnquiries.map((enq) => (
                    <div
                      key={enq.id}
                      className="flex items-center justify-between p-3 bg-slate-900 text-white rounded-xl text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-400">{enq.id}</span>
                          <span className="font-medium text-slate-200">{enq.destination}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {enq.startDate} ({enq.durationDays} Days) • {enq.adults} Adults, {enq.children} Children • Budget: ${enq.budgetAmount.toLocaleString()}
                        </div>
                      </div>

                      <button
                        onClick={() => onCreateItineraryForEnquiry(enq)}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] rounded-lg flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        Build Proposal <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Create Customer Profile</h3>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Customer / Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jonathan & Claire Sterling"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Account Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Individual">Individual</option>
                    <option value="Family">Family</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Agent">Travel Agent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Nationality</label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="client@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+971 50 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Travel Preferences & Interests</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 5-star beach resort, private tours, luxury dining..."
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Dietary & Accessibility Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Vegetarian, Gluten Free, Wheelchair assistance"
                  value={dietaryNotes}
                  onChange={(e) => setDietaryNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
