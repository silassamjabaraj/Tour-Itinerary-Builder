import React, { useState } from 'react';
import { 
  DestinationMaster, 
  HotelMaster, 
  ActivityMaster, 
  TransportMaster, 
  MealMaster, 
  GuideMaster, 
  SupplierMaster, 
  TaxMaster, 
  CurrencyMaster, 
  PolicyMaster,
  MasterType 
} from '../../types';
import { 
  Database, 
  Plus, 
  Search, 
  Building2, 
  Compass, 
  Car, 
  Utensils, 
  Users, 
  DollarSign, 
  FileText, 
  Percent, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  MapPin, 
  Tag, 
  Clock, 
  Star, 
  Filter, 
  ShieldCheck, 
  Power,
  SlidersHorizontal,
  ChevronDown,
  Lock,
  Eye
} from 'lucide-react';
import { UserRole } from '../../types';
import { canManageMasters } from '../../lib/permissions';
import { MasterEditModal } from './MasterEditModal';

interface MasterCatalogViewProps {
  destinations: DestinationMaster[];
  hotels: HotelMaster[];
  activities: ActivityMaster[];
  transport: TransportMaster[];
  meals: MealMaster[];
  guides: GuideMaster[];
  suppliers: SupplierMaster[];
  taxes: TaxMaster[];
  currencies: CurrencyMaster[];
  policies: PolicyMaster[];
  currentUserRole?: UserRole;
  onUpdateDestinations?: (items: DestinationMaster[]) => void;
  onUpdateHotels?: (items: HotelMaster[]) => void;
  onUpdateActivities?: (items: ActivityMaster[]) => void;
  onUpdateTransport?: (items: TransportMaster[]) => void;
  onUpdateMeals?: (items: MealMaster[]) => void;
  onUpdateGuides?: (items: GuideMaster[]) => void;
  onUpdateSuppliers?: (items: SupplierMaster[]) => void;
  onUpdateTaxes?: (items: TaxMaster[]) => void;
  onUpdateCurrencies?: (items: CurrencyMaster[]) => void;
  onUpdatePolicies?: (items: PolicyMaster[]) => void;
}

export const MasterCatalogView: React.FC<MasterCatalogViewProps> = ({
  destinations,
  hotels,
  activities,
  transport,
  meals,
  guides,
  suppliers,
  taxes,
  currencies,
  policies,
  currentUserRole = 'Product Manager',
  onUpdateDestinations,
  onUpdateHotels,
  onUpdateActivities,
  onUpdateTransport,
  onUpdateMeals,
  onUpdateGuides,
  onUpdateSuppliers,
  onUpdateTaxes,
  onUpdateCurrencies,
  onUpdatePolicies,
}) => {
  const isAuthorizedToEdit = canManageMasters(currentUserRole);

  const [activeTab, setActiveTab] = useState<
    'destinations' | 'hotels' | 'activities' | 'transport' | 'meals' | 'guides' | 'suppliers' | 'taxes' | 'currencies' | 'policies'
  >('destinations');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDestinationFilter, setSelectedDestinationFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [modalType, setModalType] = useState<MasterType>('destination');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Open modal to add new
  const handleAddNew = (type?: MasterType) => {
    const targetType = type || (activeTab === 'destinations' ? 'destination' :
      activeTab === 'hotels' ? 'hotel' :
      activeTab === 'activities' ? 'activity' :
      activeTab === 'transport' ? 'transport' :
      activeTab === 'meals' ? 'meal' :
      activeTab === 'guides' ? 'guide' :
      activeTab === 'suppliers' ? 'supplier' :
      activeTab === 'taxes' ? 'tax' :
      activeTab === 'currencies' ? 'currency' : 'policy');

    setModalType(targetType);
    setEditingItem(null);
    setIsModalOpen(true);
  };

  // Open modal to edit
  const handleEdit = (type: MasterType, item: any) => {
    setModalType(type);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // Duplicate an existing record
  const handleDuplicate = (type: MasterType, item: any) => {
    const newItem = {
      ...item,
      id: `${type.substring(0, 3)}-${Date.now()}`,
      name: item.name ? `${item.name} (Copy)` : undefined,
      city: item.city ? `${item.city} (Copy)` : undefined,
      legalName: item.legalName ? `${item.legalName} (Copy)` : undefined,
      title: item.title ? `${item.title} (Copy)` : undefined,
      code: item.code ? `${item.code}2` : undefined,
      route: item.route ? `${item.route} (Copy)` : undefined,
      venue: item.venue ? `${item.venue} (Copy)` : undefined,
    };
    handleSave(type, newItem);
    showToast(`Duplicated record successfully!`);
  };

  // Delete a record
  const handleDelete = (type: MasterType, id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from master catalog?`)) {
      return;
    }

    if (type === 'destination') {
      onUpdateDestinations?.(destinations.filter((d) => d.id !== id));
    } else if (type === 'hotel') {
      onUpdateHotels?.(hotels.filter((h) => h.id !== id));
    } else if (type === 'activity') {
      onUpdateActivities?.(activities.filter((a) => a.id !== id));
    } else if (type === 'transport') {
      onUpdateTransport?.(transport.filter((t) => t.id !== id));
    } else if (type === 'meal') {
      onUpdateMeals?.(meals.filter((m) => m.id !== id));
    } else if (type === 'guide') {
      onUpdateGuides?.(guides.filter((g) => g.id !== id));
    } else if (type === 'supplier') {
      onUpdateSuppliers?.(suppliers.filter((s) => s.id !== id));
    } else if (type === 'tax') {
      onUpdateTaxes?.(taxes.filter((t) => t.id !== id));
    } else if (type === 'currency') {
      onUpdateCurrencies?.(currencies.filter((c) => c.id !== id));
    } else if (type === 'policy') {
      onUpdatePolicies?.(policies.filter((p) => p.id !== id));
    }

    showToast(`Deleted "${name}"`);
  };

  // Toggle active status
  const handleToggleActive = (type: MasterType, item: any) => {
    const updated = { ...item, active: !item.active };
    handleSave(type, updated);
  };

  // Save handler called by modal
  const handleSave = (type: MasterType, updatedItem: any) => {
    if (type === 'destination') {
      const exists = destinations.some((d) => d.id === updatedItem.id);
      const list = exists
        ? destinations.map((d) => (d.id === updatedItem.id ? updatedItem : d))
        : [updatedItem, ...destinations];
      onUpdateDestinations?.(list);
    } else if (type === 'hotel') {
      const exists = hotels.some((h) => h.id === updatedItem.id);
      const list = exists
        ? hotels.map((h) => (h.id === updatedItem.id ? updatedItem : h))
        : [updatedItem, ...hotels];
      onUpdateHotels?.(list);
    } else if (type === 'activity') {
      const exists = activities.some((a) => a.id === updatedItem.id);
      const list = exists
        ? activities.map((a) => (a.id === updatedItem.id ? updatedItem : a))
        : [updatedItem, ...activities];
      onUpdateActivities?.(list);
    } else if (type === 'transport') {
      const exists = transport.some((t) => t.id === updatedItem.id);
      const list = exists
        ? transport.map((t) => (t.id === updatedItem.id ? updatedItem : t))
        : [updatedItem, ...transport];
      onUpdateTransport?.(list);
    } else if (type === 'meal') {
      const exists = meals.some((m) => m.id === updatedItem.id);
      const list = exists
        ? meals.map((m) => (m.id === updatedItem.id ? updatedItem : m))
        : [updatedItem, ...meals];
      onUpdateMeals?.(list);
    } else if (type === 'guide') {
      const exists = guides.some((g) => g.id === updatedItem.id);
      const list = exists
        ? guides.map((g) => (g.id === updatedItem.id ? updatedItem : g))
        : [updatedItem, ...guides];
      onUpdateGuides?.(list);
    } else if (type === 'supplier') {
      const exists = suppliers.some((s) => s.id === updatedItem.id);
      const list = exists
        ? suppliers.map((s) => (s.id === updatedItem.id ? updatedItem : s))
        : [updatedItem, ...suppliers];
      onUpdateSuppliers?.(list);
    } else if (type === 'tax') {
      const exists = taxes.some((t) => t.id === updatedItem.id);
      const list = exists
        ? taxes.map((t) => (t.id === updatedItem.id ? updatedItem : t))
        : [updatedItem, ...taxes];
      onUpdateTaxes?.(list);
    } else if (type === 'currency') {
      const exists = currencies.some((c) => c.id === updatedItem.id);
      const list = exists
        ? currencies.map((c) => (c.id === updatedItem.id ? updatedItem : c))
        : [updatedItem, ...currencies];
      onUpdateCurrencies?.(list);
    } else if (type === 'policy') {
      const exists = policies.some((p) => p.id === updatedItem.id);
      const list = exists
        ? policies.map((p) => (p.id === updatedItem.id ? updatedItem : p))
        : [updatedItem, ...policies];
      onUpdatePolicies?.(list);
    }

    showToast(`Saved ${type} record successfully!`);
  };

  const getAddButtonLabel = () => {
    switch (activeTab) {
      case 'destinations': return 'Add Destination';
      case 'hotels': return 'Add Hotel';
      case 'activities': return 'Add Activity';
      case 'transport': return 'Add Transport Route';
      case 'meals': return 'Add Meal / Dining';
      case 'guides': return 'Add Guide';
      case 'suppliers': return 'Add Supplier Contract';
      case 'taxes': return 'Add Tax Rule';
      case 'currencies': return 'Add Currency';
      case 'policies': return 'Add Policy';
      default: return 'Add Master Record';
    }
  };

  // Filtering helpers
  const matchesStatus = (itemActive?: boolean) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') return itemActive !== false;
    if (statusFilter === 'INACTIVE') return itemActive === false;
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 text-xs font-semibold animate-in fade-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Master Data Catalog & Rate Records</h2>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                  Role: {currentUserRole}
                </span>
              </div>
              <p className="text-slate-500 text-xs">
                {isAuthorizedToEdit
                  ? 'Maintain reusable destinations, hotels, activities, supplier contracts, rates, and policies.'
                  : 'Catalog viewing mode. Modifying supplier contracts and rates requires Product Manager or Administrator role.'}
              </p>
            </div>
          </div>
        </div>

        {isAuthorizedToEdit ? (
          <button
            onClick={() => handleAddNew()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm shadow-indigo-200 transition cursor-pointer self-stretch sm:self-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>{getAddButtonLabel()}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 rounded-xl text-xs font-semibold border border-amber-200">
            <Eye className="w-4 h-4 text-amber-600" />
            <span>Read-Only Catalog Mode</span>
          </div>
        )}
      </div>

      {/* Navigation Master Tabs */}
      <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        {[
          { id: 'destinations', label: 'Destinations', count: destinations.length, icon: MapPin },
          { id: 'hotels', label: 'Hotels', count: hotels.length, icon: Building2 },
          { id: 'activities', label: 'Activities', count: activities.length, icon: Compass },
          { id: 'transport', label: 'Transport', count: transport.length, icon: Car },
          { id: 'meals', label: 'Meals', count: meals.length, icon: Utensils },
          { id: 'guides', label: 'Guides', count: guides.length, icon: Users },
          { id: 'suppliers', label: 'Suppliers', count: suppliers.length, icon: Building2 },
          { id: 'taxes', label: 'Taxes', count: taxes.length, icon: Percent },
          { id: 'currencies', label: 'Currencies', count: currencies.length, icon: DollarSign },
          { id: 'policies', label: 'Policies', count: policies.length, icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchTerm('');
              }}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-100' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-800 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Destination Filter (for relevant tabs) */}
          {['hotels', 'activities', 'guides'].includes(activeTab) && (
            <select
              value={selectedDestinationFilter}
              onChange={(e) => setSelectedDestinationFilter(e.target.value)}
              className="px-3 py-2 bg-white text-slate-700 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs cursor-pointer"
            >
              <option value="ALL">All Destinations</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.city}
                </option>
              ))}
            </select>
          )}

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-white text-slate-700 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Content Panels */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm min-h-[360px]">
        
        {/* ======================= DESTINATIONS TAB ======================= */}
        {activeTab === 'destinations' && (
          <div>
            {destinations.filter((d) => 
              (d.city.toLowerCase().includes(searchTerm.toLowerCase()) || d.country.toLowerCase().includes(searchTerm.toLowerCase())) &&
              matchesStatus(d.active)
            ).length === 0 ? (
              <EmptyState 
                label="Destinations" 
                onAdd={() => handleAddNew('destination')} 
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinations
                  .filter((d) => 
                    (d.city.toLowerCase().includes(searchTerm.toLowerCase()) || d.country.toLowerCase().includes(searchTerm.toLowerCase())) &&
                    matchesStatus(d.active)
                  )
                  .map((dest) => (
                    <div 
                      key={dest.id} 
                      className={`rounded-2xl border transition overflow-hidden shadow-xs flex flex-col justify-between ${
                        dest.active === false ? 'opacity-60 bg-slate-50 border-slate-200' : 'border-slate-200 hover:border-amber-400 bg-white'
                      }`}
                    >
                      <div>
                        <div className="relative">
                          <img 
                            src={dest.imageUrl || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800'} 
                            alt={dest.city} 
                            className="w-full h-40 object-cover" 
                          />
                          <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                              dest.active !== false ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                            }`}>
                              {dest.active !== false ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 space-y-2.5">
                          <div>
                            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">{dest.country}</span>
                            <h3 className="font-bold text-slate-900 text-base">{dest.city}</h3>
                          </div>
                          
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{dest.description || 'No description provided.'}</p>

                          {dest.highlights && dest.highlights.length > 0 && (
                            <div className="pt-2 border-t border-slate-100">
                              <strong className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Highlights:</strong>
                              <div className="flex flex-wrap gap-1">
                                {dest.highlights.slice(0, 3).map((h, i) => (
                                  <span key={i} className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200/60 px-1.5 py-0.5 rounded font-medium">
                                    {h}
                                  </span>
                                ))}
                                {dest.highlights.length > 3 && (
                                  <span className="text-[10px] text-slate-400 font-medium">+{dest.highlights.length - 3} more</span>
                                )}
                              </div>
                            </div>
                          )}

                          {dest.tags && dest.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {dest.tags.map((tag, i) => (
                                <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleToggleActive('destination', dest)}
                          className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                          title="Toggle Active Status"
                        >
                          <Power className={`w-3.5 h-3.5 ${dest.active !== false ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span>{dest.active !== false ? 'Active' : 'Inactive'}</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDuplicate('destination', dest)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
                            title="Duplicate Destination"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit('destination', dest)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete('destination', dest.id, `${dest.city}, ${dest.country}`)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ======================= HOTELS TAB ======================= */}
        {activeTab === 'hotels' && (
          <div>
            {hotels.filter((h) => 
              (h.name.toLowerCase().includes(searchTerm.toLowerCase()) || h.destinationName.toLowerCase().includes(searchTerm.toLowerCase())) &&
              (selectedDestinationFilter === 'ALL' || h.destinationId === selectedDestinationFilter) &&
              matchesStatus(h.active)
            ).length === 0 ? (
              <EmptyState 
                label="Hotels" 
                onAdd={() => handleAddNew('hotel')} 
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hotels
                  .filter((h) => 
                    (h.name.toLowerCase().includes(searchTerm.toLowerCase()) || h.destinationName.toLowerCase().includes(searchTerm.toLowerCase())) &&
                    (selectedDestinationFilter === 'ALL' || h.destinationId === selectedDestinationFilter) &&
                    matchesStatus(h.active)
                  )
                  .map((hotel) => (
                    <div 
                      key={hotel.id} 
                      className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                        hotel.active === false ? 'opacity-60 bg-slate-50 border-slate-200' : 'bg-slate-50/70 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-slate-900 text-base">{hotel.name}</h3>
                              {hotel.active === false && (
                                <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{hotel.address || 'Address not listed'} • <strong className="text-slate-700">{hotel.destinationName}</strong></span>
                            </p>
                          </div>
                          <span className="text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {hotel.categoryStars}★ Stars
                          </span>
                        </div>

                        {/* Room Types & Contract Rates */}
                        <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs text-xs">
                          <strong className="text-slate-800 text-xs font-bold block mb-1">Contract Room Rates & Capacity:</strong>
                          {hotel.roomTypes && hotel.roomTypes.length > 0 ? (
                            hotel.roomTypes.map((rt) => (
                              <div key={rt.id} className="flex justify-between items-center text-slate-700 py-1 border-b border-slate-100 last:border-0">
                                <span>{rt.name} <span className="text-slate-400 text-[11px]">({rt.capacity} Pax)</span></span>
                                <strong className="font-mono text-slate-900 font-bold">₹{rt.defaultCost?.toLocaleString()} / night</strong>
                              </div>
                            ))
                          ) : (
                            <p className="text-slate-400 italic text-[11px]">No room types configured.</p>
                          )}
                        </div>

                        {/* Meal plans & amenities */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="font-bold text-slate-500">Meal Plans:</span>
                          {(hotel.mealPlans || ['BB']).map((p) => (
                            <span key={p} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">
                              {p}
                            </span>
                          ))}
                          {hotel.supplierName && (
                            <span className="text-slate-400 ml-auto">Contract: {hotel.supplierName}</span>
                          )}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleToggleActive('hotel', hotel)}
                          className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                        >
                          <Power className={`w-3.5 h-3.5 ${hotel.active !== false ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span>{hotel.active !== false ? 'Active' : 'Inactive'}</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDuplicate('hotel', hotel)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
                            title="Duplicate Hotel"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit('hotel', hotel)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete('hotel', hotel.id, hotel.name)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ======================= ACTIVITIES TAB ======================= */}
        {activeTab === 'activities' && (
          <div>
            {activities.filter((a) => 
              (a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.destinationName.toLowerCase().includes(searchTerm.toLowerCase())) &&
              (selectedDestinationFilter === 'ALL' || a.destinationId === selectedDestinationFilter) &&
              matchesStatus(a.active)
            ).length === 0 ? (
              <EmptyState 
                label="Activities" 
                onAdd={() => handleAddNew('activity')} 
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activities
                  .filter((a) => 
                    (a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.destinationName.toLowerCase().includes(searchTerm.toLowerCase())) &&
                    (selectedDestinationFilter === 'ALL' || a.destinationId === selectedDestinationFilter) &&
                    matchesStatus(a.active)
                  )
                  .map((act) => (
                    <div 
                      key={act.id} 
                      className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                        act.active === false ? 'opacity-60 bg-slate-50 border-slate-200' : 'bg-slate-50/70 border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h3 className="font-bold text-slate-900 text-base">{act.name}</h3>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{act.destinationName} • <Clock className="w-3 h-3 inline text-slate-400" /> {act.durationHours}h ({act.scheduleTiming || 'Flexible'})</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold font-mono text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg text-xs block">
                              ₹{act.defaultCost?.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-500 uppercase">{act.rateBasis?.replace('_', ' ')}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{act.description || 'No detailed description.'}</p>

                        {act.inclusions && act.inclusions.length > 0 && (
                          <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                            <strong className="text-[11px] font-bold text-slate-700 block mb-1">Inclusions:</strong>
                            <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                              {act.inclusions.slice(0, 2).map((inc, i) => (
                                <li key={i}>{inc}</li>
                              ))}
                              {act.inclusions.length > 2 && (
                                <li className="text-slate-400 list-none">+{act.inclusions.length - 2} more items</li>
                              )}
                            </ul>
                          </div>
                        )}

                        <div className="text-[11px] text-slate-500 font-medium">
                          Supplier: <strong className="text-slate-700">{act.supplierName || 'Direct'}</strong>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleToggleActive('activity', act)}
                          className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                        >
                          <Power className={`w-3.5 h-3.5 ${act.active !== false ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span>{act.active !== false ? 'Active' : 'Inactive'}</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDuplicate('activity', act)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
                            title="Duplicate Activity"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit('activity', act)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete('activity', act.id, act.name)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ======================= TRANSPORT TAB ======================= */}
        {activeTab === 'transport' && (
          <div>
            {transport.filter((t) => 
              (t.route.toLowerCase().includes(searchTerm.toLowerCase()) || t.type.toLowerCase().includes(searchTerm.toLowerCase()) || t.supplierName.toLowerCase().includes(searchTerm.toLowerCase())) &&
              matchesStatus(t.active)
            ).length === 0 ? (
              <EmptyState 
                label="Transport Routes" 
                onAdd={() => handleAddNew('transport')} 
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {transport
                  .filter((t) => 
                    (t.route.toLowerCase().includes(searchTerm.toLowerCase()) || t.type.toLowerCase().includes(searchTerm.toLowerCase()) || t.supplierName.toLowerCase().includes(searchTerm.toLowerCase())) &&
                    matchesStatus(t.active)
                  )
                  .map((tr) => (
                    <div 
                      key={tr.id} 
                      className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                        tr.active === false ? 'opacity-60 bg-slate-50 border-slate-200' : 'bg-slate-50/70 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Car className="w-3 h-3" />
                            {tr.type}
                          </span>
                          <span className="text-xs font-bold font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                            ₹{tr.defaultCost?.toLocaleString()}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-snug">{tr.route}</h4>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Max Capacity: <strong className="text-slate-700">{tr.capacity} Pax</strong> • Est. Duration: <strong className="text-slate-700">{tr.durationHours}h</strong>
                          </p>
                        </div>

                        <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200">
                          <div>Supplier: <strong className="text-slate-700">{tr.supplierName || 'Chauffeur Fleet'}</strong></div>
                          <div>Rate Basis: <span className="uppercase text-slate-600 font-mono">{tr.rateBasis?.replace('_', ' ')}</span></div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleToggleActive('transport', tr)}
                          className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                        >
                          <Power className={`w-3.5 h-3.5 ${tr.active !== false ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span>{tr.active !== false ? 'Active' : 'Inactive'}</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDuplicate('transport', tr)}
                            className="p-1 text-slate-500 hover:text-indigo-600 rounded cursor-pointer"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit('transport', tr)}
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete('transport', tr.id, `${tr.type} - ${tr.route}`)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ======================= MEALS TAB ======================= */}
        {activeTab === 'meals' && (
          <div>
            {meals.filter((m) => 
              (m.venue.toLowerCase().includes(searchTerm.toLowerCase()) || m.type.toLowerCase().includes(searchTerm.toLowerCase()) || m.menuHighlights.toLowerCase().includes(searchTerm.toLowerCase())) &&
              matchesStatus(m.active)
            ).length === 0 ? (
              <EmptyState 
                label="Meal & Dining Options" 
                onAdd={() => handleAddNew('meal')} 
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {meals
                  .filter((m) => 
                    (m.venue.toLowerCase().includes(searchTerm.toLowerCase()) || m.type.toLowerCase().includes(searchTerm.toLowerCase()) || m.menuHighlights.toLowerCase().includes(searchTerm.toLowerCase())) &&
                    matchesStatus(m.active)
                  )
                  .map((meal) => (
                    <div 
                      key={meal.id} 
                      className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                        meal.active === false ? 'opacity-60 bg-slate-50 border-slate-200' : 'bg-slate-50/70 border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Utensils className="w-3 h-3" />
                            {meal.type}
                          </span>
                          <span className="text-xs font-bold font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                            ₹{meal.defaultCost?.toLocaleString()}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-snug">{meal.venue}</h4>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">{meal.menuHighlights || 'No cuisine details.'}</p>
                        </div>

                        <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200">
                          <div>Supplier: <strong className="text-slate-700">{meal.supplierName || 'Restaurant'}</strong></div>
                          <div>Basis: <span className="uppercase text-slate-600 font-mono">{meal.rateBasis?.replace('_', ' ')}</span></div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleToggleActive('meal', meal)}
                          className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                        >
                          <Power className={`w-3.5 h-3.5 ${meal.active !== false ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span>{meal.active !== false ? 'Active' : 'Inactive'}</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDuplicate('meal', meal)}
                            className="p-1 text-slate-500 hover:text-indigo-600 rounded cursor-pointer"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit('meal', meal)}
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete('meal', meal.id, meal.venue)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ======================= GUIDES TAB ======================= */}
        {activeTab === 'guides' && (
          <div>
            {guides.filter((g) => 
              (g.name.toLowerCase().includes(searchTerm.toLowerCase()) || g.language.toLowerCase().includes(searchTerm.toLowerCase()) || g.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
              (selectedDestinationFilter === 'ALL' || g.destinationId === selectedDestinationFilter) &&
              matchesStatus(g.active)
            ).length === 0 ? (
              <EmptyState 
                label="Guides & Tour Managers" 
                onAdd={() => handleAddNew('guide')} 
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {guides
                  .filter((g) => 
                    (g.name.toLowerCase().includes(searchTerm.toLowerCase()) || g.language.toLowerCase().includes(searchTerm.toLowerCase()) || g.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
                    (selectedDestinationFilter === 'ALL' || g.destinationId === selectedDestinationFilter) &&
                    matchesStatus(g.active)
                  )
                  .map((guide) => (
                    <div 
                      key={guide.id} 
                      className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                        guide.active === false ? 'opacity-60 bg-slate-50 border-slate-200' : 'bg-slate-50/70 border-slate-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {guide.category}
                          </span>
                          <span className="text-xs font-bold font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                            ₹{guide.defaultCost?.toLocaleString()}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 text-base">{guide.name}</h4>
                          <p className="text-xs text-slate-600 mt-1">
                            Languages: <strong className="text-indigo-600">{guide.language}</strong>
                          </p>
                        </div>

                        <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200">
                          <div>Rate Basis: <span className="uppercase text-slate-600 font-mono">{guide.rateBasis?.replace('_', ' ')}</span></div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleToggleActive('guide', guide)}
                          className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                        >
                          <Power className={`w-3.5 h-3.5 ${guide.active !== false ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span>{guide.active !== false ? 'Active' : 'Inactive'}</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDuplicate('guide', guide)}
                            className="p-1 text-slate-500 hover:text-indigo-600 rounded cursor-pointer"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit('guide', guide)}
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete('guide', guide.id, guide.name)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ======================= SUPPLIERS TAB ======================= */}
        {activeTab === 'suppliers' && (
          <div>
            {suppliers.filter((s) => 
              s.legalName.toLowerCase().includes(searchTerm.toLowerCase()) || 
              s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
              s.email.toLowerCase().includes(searchTerm.toLowerCase())
            ).length === 0 ? (
              <EmptyState 
                label="Suppliers" 
                onAdd={() => handleAddNew('supplier')} 
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {suppliers
                  .filter((s) => 
                    s.legalName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.email.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((sup) => (
                    <div key={sup.id} className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200 text-xs flex flex-col justify-between hover:border-slate-300 transition">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-slate-900 text-base">{sup.legalName}</h3>
                            <p className="text-slate-500 text-xs mt-0.5">Contact: <strong className="text-slate-700">{sup.contactPerson}</strong></p>
                          </div>
                          <span className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                            sup.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                            sup.status === 'Under Review' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {sup.status}
                          </span>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 text-slate-600">
                          <div>Email: <a href={`mailto:${sup.email}`} className="text-indigo-600 hover:underline">{sup.email}</a></div>
                          <div>Phone: <span>{sup.phone || 'N/A'}</span></div>
                          {sup.taxNumber && <div>Tax/TRN: <span className="font-mono">{sup.taxNumber}</span></div>}
                        </div>

                        <div className="flex gap-4 text-slate-600 font-medium pt-1 text-[11px]">
                          <span>Currency: <strong className="text-slate-900 font-mono">{sup.currency}</strong></span>
                          <span>Terms: <strong className="text-slate-900">{sup.paymentTerms}</strong></span>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDuplicate('supplier', sup)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 rounded cursor-pointer"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit('supplier', sup)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete('supplier', sup.id, sup.legalName)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ======================= TAXES TAB ======================= */}
        {activeTab === 'taxes' && (
          <div>
            {taxes.filter((t) => t.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
              <EmptyState 
                label="Tax Rules" 
                onAdd={() => handleAddNew('tax')} 
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {taxes
                  .filter((t) => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((tax) => (
                    <div key={tax.id} className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition">
                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-900 text-sm">{tax.name}</h4>
                          <span className="font-bold font-mono text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg text-xs">
                            {tax.ratePercent}%
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tax.inclusive ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {tax.inclusive ? 'Inclusive Tax' : 'Exclusive (Added to Subtotal)'}
                          </span>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                          <strong className="text-[11px] text-slate-500 block mb-1">Applies To:</strong>
                          <div className="flex flex-wrap gap-1">
                            {tax.applicableCategories.map((c, i) => (
                              <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit('tax', tax)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete('tax', tax.id, tax.name)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ======================= CURRENCIES TAB ======================= */}
        {activeTab === 'currencies' && (
          <div>
            {currencies.filter((c) => c.code.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
              <EmptyState 
                label="Currencies" 
                onAdd={() => handleAddNew('currency')} 
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {currencies
                  .filter((c) => c.code.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((cur) => (
                    <div key={cur.id} className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 flex flex-col justify-between hover:border-indigo-300 transition">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-lg text-slate-900">{cur.code}</span>
                          <span className="text-sm font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-lg">
                            {cur.symbol}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                          <div className="text-slate-500 text-[11px]">Exchange Rate (1 Base):</div>
                          <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">{cur.exchangeRateToBase}</div>
                          <div className="text-slate-400 text-[10px] mt-1">Decimals: {cur.decimalPlaces}</div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit('currency', cur)}
                          className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete('currency', cur.id, cur.code)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ======================= POLICIES TAB ======================= */}
        {activeTab === 'policies' && (
          <div>
            {policies.filter((p) => 
              p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
              p.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
              p.type.toLowerCase().includes(searchTerm.toLowerCase())
            ).length === 0 ? (
              <EmptyState 
                label="Policies" 
                onAdd={() => handleAddNew('policy')} 
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {policies
                  .filter((p) => 
                    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    p.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.type.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((pol) => (
                    <div key={pol.id} className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-slate-900 text-base">{pol.title}</h3>
                          <span className="text-xs font-bold bg-slate-200 text-slate-800 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                            {pol.type}
                          </span>
                        </div>
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto">
                          {pol.content}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDuplicate('policy', pol)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 rounded cursor-pointer"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit('policy', pol)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete('policy', pol.id, pol.title)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      <MasterEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        masterType={modalType}
        item={editingItem}
        destinations={destinations}
        suppliers={suppliers}
        onSave={handleSave}
      />
    </div>
  );
};

interface EmptyStateProps {
  label: string;
  onAdd: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ label, onAdd }) => (
  <div className="text-center py-12 px-4 space-y-3">
    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
      <Database className="w-6 h-6" />
    </div>
    <h3 className="font-bold text-slate-900 text-base">No {label} Found</h3>
    <p className="text-slate-500 text-xs max-w-sm mx-auto">
      There are no records matching your current filter. Add your first record to populate the master catalog.
    </p>
    <button
      onClick={onAdd}
      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition cursor-pointer shadow-sm shadow-indigo-200"
    >
      <Plus className="w-4 h-4" />
      <span>Add New {label.replace(/s$/, '')}</span>
    </button>
  </div>
);
