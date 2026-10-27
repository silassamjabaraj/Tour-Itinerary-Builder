import React, { useState, useEffect } from 'react';
import { 
  DestinationMaster, 
  HotelMaster, 
  HotelRoomType,
  ActivityMaster, 
  TransportMaster, 
  MealMaster, 
  GuideMaster, 
  SupplierMaster, 
  TaxMaster, 
  CurrencyMaster, 
  PolicyMaster,
  RateBasis,
  MasterType
} from '../../types';
import { X, Plus, Trash2, Check, Sparkles, MapPin, Building2, Compass, Car, Utensils, Users, DollarSign, Percent, FileText } from 'lucide-react';

interface MasterEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  masterType: MasterType;
  item: any | null; // If null, we are creating a new item
  destinations: DestinationMaster[];
  suppliers: SupplierMaster[];
  onSave: (type: MasterType, updatedItem: any) => void;
}

const RATE_BASIS_OPTIONS: { value: RateBasis; label: string }[] = [
  { value: 'per_person', label: 'Per Person' },
  { value: 'per_adult', label: 'Per Adult' },
  { value: 'per_child', label: 'Per Child' },
  { value: 'per_infant', label: 'Per Infant' },
  { value: 'per_room_night', label: 'Per Room / Night' },
  { value: 'per_vehicle', label: 'Per Vehicle' },
  { value: 'per_group', label: 'Per Group' },
  { value: 'fixed', label: 'Fixed Total Package' },
];

export const MasterEditModal: React.FC<MasterEditModalProps> = ({
  isOpen,
  onClose,
  masterType,
  item,
  destinations,
  suppliers,
  onSave,
}) => {
  const isEdit = Boolean(item && item.id);

  // Form state
  const [formData, setFormData] = useState<any>({});
  const [roomTypes, setRoomTypes] = useState<HotelRoomType[]>([]);
  const [inclusionsText, setInclusionsText] = useState('');
  const [exclusionsText, setExclusionsText] = useState('');
  const [highlightsText, setHighlightsText] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [amenitiesText, setAmenitiesText] = useState('');
  const [selectedMealPlans, setSelectedMealPlans] = useState<string[]>([]);
  const [applicableCategories, setApplicableCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    if (item) {
      setFormData({ ...item });
      if (masterType === 'hotel') {
        setRoomTypes(item.roomTypes ? [...item.roomTypes] : []);
        setAmenitiesText((item.amenities || []).join(', '));
        setSelectedMealPlans(item.mealPlans || ['BB']);
      } else if (masterType === 'destination') {
        setHighlightsText((item.highlights || []).join('\n'));
        setTagsText((item.tags || []).join(', '));
      } else if (masterType === 'activity') {
        setInclusionsText((item.inclusions || []).join('\n'));
        setExclusionsText((item.exclusions || []).join('\n'));
      } else if (masterType === 'tax') {
        setApplicableCategories(item.applicableCategories || ['Hotel', 'Activity', 'Transport', 'Meal', 'Guide']);
      }
    } else {
      // Defaults for new items
      const newId = `${masterType.substring(0, 3)}-${Date.now()}`;
      if (masterType === 'destination') {
        setFormData({
          id: newId,
          country: '',
          city: '',
          description: '',
          highlights: [],
          imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop',
          tags: ['Luxury', 'Sightseeing'],
          active: true,
        });
        setHighlightsText('City Skyline\nHistoric Quarter\nCultural Landmarks');
        setTagsText('Luxury, Culture, Sightseeing');
      } else if (masterType === 'hotel') {
        const dest = destinations[0] || { id: 'dest-1', city: 'Dubai' };
        const sup = suppliers[0] || { id: 'sup-1', legalName: 'Direct Contract' };
        setFormData({
          id: newId,
          destinationId: dest.id,
          destinationName: dest.city,
          name: '',
          categoryStars: 5,
          address: '',
          roomTypes: [],
          mealPlans: ['BB'],
          amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Restaurant'],
          checkInTime: '15:00',
          checkOutTime: '12:00',
          supplierId: sup.id,
          supplierName: sup.legalName,
          imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop',
          policies: 'Free cancellation up to 48 hours prior to arrival. Tourism tax payable at reception.',
          active: true,
        });
        setRoomTypes([
          { id: `rt-${Date.now()}-1`, name: 'Deluxe Room', capacity: 2, defaultCost: 15000 },
          { id: `rt-${Date.now()}-2`, name: 'Executive Suite', capacity: 3, defaultCost: 28000 },
        ]);
        setAmenitiesText('Free WiFi, Swimming Pool, Spa, Restaurant, Fitness Center');
        setSelectedMealPlans(['BB', 'HB']);
      } else if (masterType === 'activity') {
        const dest = destinations[0] || { id: 'dest-1', city: 'Dubai' };
        const sup = suppliers[0] || { id: 'sup-1', legalName: 'Direct Contract' };
        setFormData({
          id: newId,
          destinationId: dest.id,
          destinationName: dest.city,
          name: '',
          durationHours: 4,
          scheduleTiming: '09:00 - 13:00',
          inclusions: [],
          exclusions: [],
          ageLimits: 'All ages welcome',
          supplierId: sup.id,
          supplierName: sup.legalName,
          imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop',
          defaultCost: 3500,
          rateBasis: 'per_person',
          description: '',
          active: true,
        });
        setInclusionsText('Professional licensed guide\nEntry admissions & skip-the-line tickets\nRefreshments & bottled water');
        setExclusionsText('Gratuities and driver tips\nPersonal shopping');
      } else if (masterType === 'transport') {
        const sup = suppliers[0] || { id: 'sup-1', legalName: 'Direct Contract' };
        setFormData({
          id: newId,
          type: 'SUV',
          route: 'Airport -> City Center Hotel Private Transfer',
          capacity: 4,
          durationHours: 1,
          rateBasis: 'per_vehicle',
          supplierId: sup.id,
          supplierName: sup.legalName,
          defaultCost: 3500,
          active: true,
        });
      } else if (masterType === 'meal') {
        const sup = suppliers[0] || { id: 'sup-1', legalName: 'Direct Contract' };
        setFormData({
          id: newId,
          type: 'Lunch',
          venue: 'Fine Dining Gourmet Venue',
          menuHighlights: '3-course set menu with beverages & dessert',
          rateBasis: 'per_person',
          supplierId: sup.id,
          supplierName: sup.legalName,
          defaultCost: 2500,
          active: true,
        });
      } else if (masterType === 'guide') {
        const dest = destinations[0] || { id: 'dest-1', city: 'Dubai' };
        const sup = suppliers[0] || { id: 'sup-1', legalName: 'Direct Contract' };
        setFormData({
          id: newId,
          name: '',
          language: 'English',
          category: 'Local City Guide',
          destinationId: dest.id,
          rateBasis: 'per_group',
          supplierId: sup.id,
          defaultCost: 6000,
          active: true,
        });
      } else if (masterType === 'supplier') {
        setFormData({
          id: newId,
          legalName: '',
          contactPerson: '',
          email: '',
          phone: '',
          currency: 'INR',
          taxNumber: '',
          paymentTerms: '30 Days Net',
          status: 'Active',
        });
      } else if (masterType === 'tax') {
        setFormData({
          id: newId,
          name: '',
          ratePercent: 5,
          inclusive: false,
          applicableCategories: ['Hotel', 'Activity', 'Transport', 'Meal', 'Guide'],
        });
        setApplicableCategories(['Hotel', 'Activity', 'Transport', 'Meal', 'Guide']);
      } else if (masterType === 'currency') {
        setFormData({
          id: newId,
          code: '',
          symbol: '',
          exchangeRateToBase: 1,
          decimalPlaces: 2,
        });
      } else if (masterType === 'policy') {
        setFormData({
          id: newId,
          title: '',
          type: 'Cancellation',
          content: '',
        });
      }
    }
  }, [isOpen, masterType, item, destinations, suppliers]);

  if (!isOpen) return null;

  const handleDestinationChange = (destId: string) => {
    const dest = destinations.find((d) => d.id === destId);
    setFormData((prev: any) => ({
      ...prev,
      destinationId: destId,
      destinationName: dest ? dest.city : prev.destinationName,
    }));
  };

  const handleSupplierChange = (supId: string) => {
    const sup = suppliers.find((s) => s.id === supId);
    setFormData((prev: any) => ({
      ...prev,
      supplierId: supId,
      supplierName: sup ? sup.legalName : prev.supplierName,
    }));
  };

  const handleAddRoomType = () => {
    setRoomTypes([
      ...roomTypes,
      {
        id: `rt-${Date.now()}-${roomTypes.length + 1}`,
        name: 'Standard Room',
        capacity: 2,
        defaultCost: 10000,
      },
    ]);
  };

  const handleUpdateRoomType = (index: number, field: keyof HotelRoomType, value: any) => {
    const updated = [...roomTypes];
    updated[index] = { ...updated[index], [field]: value };
    setRoomTypes(updated);
  };

  const handleDeleteRoomType = (index: number) => {
    setRoomTypes(roomTypes.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = { ...formData };

    if (masterType === 'destination') {
      finalData.highlights = highlightsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      finalData.tags = tagsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (masterType === 'hotel') {
      finalData.roomTypes = roomTypes.length > 0 ? roomTypes : [
        { id: `rt-${Date.now()}`, name: 'Standard Room', capacity: 2, defaultCost: 10000 }
      ];
      finalData.amenities = amenitiesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      finalData.mealPlans = selectedMealPlans;
    } else if (masterType === 'activity') {
      finalData.inclusions = inclusionsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      finalData.exclusions = exclusionsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      finalData.defaultCost = Number(finalData.defaultCost) || 0;
      finalData.durationHours = Number(finalData.durationHours) || 1;
    } else if (masterType === 'transport') {
      finalData.capacity = Number(finalData.capacity) || 1;
      finalData.durationHours = Number(finalData.durationHours) || 1;
      finalData.defaultCost = Number(finalData.defaultCost) || 0;
    } else if (masterType === 'meal') {
      finalData.defaultCost = Number(finalData.defaultCost) || 0;
    } else if (masterType === 'guide') {
      finalData.defaultCost = Number(finalData.defaultCost) || 0;
    } else if (masterType === 'tax') {
      finalData.ratePercent = Number(finalData.ratePercent) || 0;
      finalData.applicableCategories = applicableCategories;
    } else if (masterType === 'currency') {
      finalData.exchangeRateToBase = Number(finalData.exchangeRateToBase) || 1;
      finalData.decimalPlaces = Number(finalData.decimalPlaces) || 2;
    }

    onSave(masterType, finalData);
    onClose();
  };

  const getTitle = () => {
    const action = isEdit ? 'Edit' : 'Add New';
    const names: Record<MasterType, string> = {
      destination: 'Destination',
      hotel: 'Hotel & Contract Rates',
      activity: 'Activity & Excursion',
      transport: 'Transport Route',
      meal: 'Meal & Dining Experience',
      guide: 'Tour Guide / Manager',
      supplier: 'Supplier Contract',
      tax: 'Tax Rule',
      currency: 'Currency Rate',
      policy: 'Standard Policy',
      rate: 'Rate Rule',
    };
    return `${action} ${names[masterType] || 'Master Record'}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              {masterType === 'destination' && <MapPin className="w-4 h-4" />}
              {masterType === 'hotel' && <Building2 className="w-4 h-4" />}
              {masterType === 'activity' && <Compass className="w-4 h-4" />}
              {masterType === 'transport' && <Car className="w-4 h-4" />}
              {masterType === 'meal' && <Utensils className="w-4 h-4" />}
              {masterType === 'guide' && <Users className="w-4 h-4" />}
              {masterType === 'supplier' && <Building2 className="w-4 h-4" />}
              {masterType === 'tax' && <Percent className="w-4 h-4" />}
              {masterType === 'currency' && <DollarSign className="w-4 h-4" />}
              {masterType === 'policy' && <FileText className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">{getTitle()}</h3>
              <p className="text-xs text-slate-500">Configure catalog properties and reusable rates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1 text-xs">
          
          {/* ===================== DESTINATION FORM ===================== */}
          {masterType === 'destination' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City / Region *</label>
                  <input
                    type="text"
                    required
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Dubai, Bali, Rome"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    value={formData.country || ''}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g. United Arab Emirates, Indonesia"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Destination Description</label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Overview of geography, culture, highlights and experience..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Key Highlights (1 per line)</label>
                  <textarea
                    rows={3}
                    value={highlightsText}
                    onChange={(e) => setHighlightsText(e.target.value)}
                    placeholder="Burj Khalifa&#10;Desert Safari&#10;Palm Jumeirah"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={tagsText}
                    onChange={(e) => setTagsText(e.target.value)}
                    placeholder="Luxury, Desert, Shopping, Family"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Useful for filtering in proposals.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="dest-active"
                  checked={formData.active ?? true}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="dest-active" className="font-semibold text-slate-700 cursor-pointer">
                  Active in Destination Catalog
                </label>
              </div>
            </div>
          )}

          {/* ===================== HOTEL FORM ===================== */}
          {masterType === 'hotel' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Hotel Property Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Jumeirah Al Naseem"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Star Category</label>
                  <select
                    value={formData.categoryStars || 5}
                    onChange={(e) => setFormData({ ...formData, categoryStars: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-semibold text-slate-800"
                  >
                    <option value={3}>3-Star Hotel</option>
                    <option value={4}>4-Star Deluxe</option>
                    <option value={5}>5-Star Luxury</option>
                    <option value={7}>7-Star Ultra Luxury</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Destination City *</label>
                  <select
                    value={formData.destinationId || ''}
                    onChange={(e) => handleDestinationChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.city} ({d.country})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Supplier / DMC Contractor</label>
                  <select
                    value={formData.supplierId || ''}
                    onChange={(e) => handleSupplierChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.legalName} ({s.currency})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address / Location</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Jumeirah Street, Um Suqeim, Dubai"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Room Types & Rates Table */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <strong className="font-bold text-slate-800 text-xs">Room Categories & Contract Cost Rates</strong>
                  <button
                    type="button"
                    onClick={handleAddRoomType}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Room Type
                  </button>
                </div>

                <div className="space-y-2">
                  {roomTypes.map((rt, idx) => (
                    <div key={rt.id || idx} className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className="col-span-5">
                        <input
                          type="text"
                          required
                          placeholder="Room Name (e.g. Deluxe Room)"
                          value={rt.name}
                          onChange={(e) => handleUpdateRoomType(idx, 'name', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                        />
                      </div>
                      <div className="col-span-3">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-500 font-medium">Pax:</span>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={rt.capacity}
                            onChange={(e) => handleUpdateRoomType(idx, 'capacity', Number(e.target.value))}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                          />
                        </div>
                      </div>
                      <div className="col-span-3">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-500 font-medium">Rate:</span>
                          <input
                            type="number"
                            min={0}
                            value={rt.defaultCost}
                            onChange={(e) => handleUpdateRoomType(idx, 'defaultCost', Number(e.target.value))}
                            className="w-full px-2 py-1 border border-slate-200 rounded text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteRoomType(idx)}
                          disabled={roomTypes.length <= 1}
                          className="text-slate-400 hover:text-red-600 disabled:opacity-30 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Meal Plans Supported</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {['RO', 'BB', 'HB', 'FB', 'AI'].map((plan) => (
                      <label key={plan} className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg cursor-pointer text-slate-800 font-medium">
                        <input
                          type="checkbox"
                          checked={selectedMealPlans.includes(plan)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMealPlans([...selectedMealPlans, plan]);
                            } else {
                              setSelectedMealPlans(selectedMealPlans.filter((p) => p !== plan));
                            }
                          }}
                          className="rounded text-indigo-600"
                        />
                        <span>{plan}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Check-in / Check-out</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.checkInTime || '15:00'}
                      onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                      placeholder="In: 15:00"
                      className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={formData.checkOutTime || '12:00'}
                      onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                      placeholder="Out: 12:00"
                      className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Amenities (Comma-separated)</label>
                <input
                  type="text"
                  value={amenitiesText}
                  onChange={(e) => setAmenitiesText(e.target.value)}
                  placeholder="Private Beach, Swimming Pool, Spa, Kids Club, Valet Parking"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hotel Policies / Notes</label>
                <textarea
                  rows={2}
                  value={formData.policies || ''}
                  onChange={(e) => setFormData({ ...formData, policies: e.target.value })}
                  placeholder="Cancellation policy, local tourism taxes, child surcharge policies..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hotel Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="hotel-active"
                  checked={formData.active ?? true}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="hotel-active" className="font-semibold text-slate-700 cursor-pointer">
                  Active in Hotel Catalog
                </label>
              </div>
            </div>
          )}

          {/* ===================== ACTIVITY FORM ===================== */}
          {masterType === 'activity' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Activity / Tour Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sunset Desert Safari with BBQ"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Destination City *</label>
                  <select
                    value={formData.destinationId || ''}
                    onChange={(e) => handleDestinationChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.city} ({d.country})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Default Unit Cost *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.defaultCost || 0}
                    onChange={(e) => setFormData({ ...formData, defaultCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rate Basis</label>
                  <select
                    value={formData.rateBasis || 'per_person'}
                    onChange={(e) => setFormData({ ...formData, rateBasis: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    {RATE_BASIS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={formData.durationHours || 4}
                    onChange={(e) => setFormData({ ...formData, durationHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Schedule Timing</label>
                  <input
                    type="text"
                    value={formData.scheduleTiming || ''}
                    onChange={(e) => setFormData({ ...formData, scheduleTiming: e.target.value })}
                    placeholder="e.g. 09:00 - 13:00 or 15:30 - 21:30"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Supplier / Operator</label>
                  <select
                    value={formData.supplierId || ''}
                    onChange={(e) => handleSupplierChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.legalName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed tour itinerary and experience highlights..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Inclusions (1 per line)</label>
                  <textarea
                    rows={3}
                    value={inclusionsText}
                    onChange={(e) => setInclusionsText(e.target.value)}
                    placeholder="4x4 Dune Bashing&#10;BBQ Dinner&#10;Camel Ride"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Exclusions (1 per line)</label>
                  <textarea
                    rows={3}
                    value={exclusionsText}
                    onChange={(e) => setExclusionsText(e.target.value)}
                    placeholder="Gratuities&#10;Alcoholic beverages"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="act-active"
                  checked={formData.active ?? true}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="act-active" className="font-semibold text-slate-700 cursor-pointer">
                  Active in Activity Catalog
                </label>
              </div>
            </div>
          )}

          {/* ===================== TRANSPORT FORM ===================== */}
          {masterType === 'transport' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vehicle Type *</label>
                  <select
                    value={formData.type || 'SUV'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-semibold text-slate-800"
                  >
                    <option value="Sedan">Sedan (1-3 Pax)</option>
                    <option value="SUV">SUV (1-4 Pax)</option>
                    <option value="Minivan">Minivan (1-7 Pax)</option>
                    <option value="Luxury Coach">Luxury Coach (8-30 Pax)</option>
                    <option value="Private Helicopter">Private Helicopter</option>
                    <option value="Speedboat">Speedboat / Yacht</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Passenger Capacity (Pax)</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.capacity || 4}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Route / Transfer Scope *</label>
                <input
                  type="text"
                  required
                  value={formData.route || ''}
                  onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                  placeholder="e.g. Dubai Airport (DXB) -> Downtown Hotel Arrival Transfer"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Default Cost *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.defaultCost || 0}
                    onChange={(e) => setFormData({ ...formData, defaultCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rate Basis</label>
                  <select
                    value={formData.rateBasis || 'per_vehicle'}
                    onChange={(e) => setFormData({ ...formData, rateBasis: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    {RATE_BASIS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={formData.durationHours || 1}
                    onChange={(e) => setFormData({ ...formData, durationHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Transport Supplier / Chauffeur Company</label>
                <select
                  value={formData.supplierId || ''}
                  onChange={(e) => handleSupplierChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.legalName} ({s.contactPerson})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="trans-active"
                  checked={formData.active ?? true}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="trans-active" className="font-semibold text-slate-700 cursor-pointer">
                  Active in Transport Catalog
                </label>
              </div>
            </div>
          )}

          {/* ===================== MEAL FORM ===================== */}
          {masterType === 'meal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Meal Experience Type *</label>
                  <select
                    value={formData.type || 'Lunch'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-semibold text-slate-800"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Gourmet Cruise">Gourmet Cruise</option>
                    <option value="Traditional Feast">Traditional Feast</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Venue / Restaurant Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.venue || ''}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g. Al Khayma Heritage Restaurant"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Menu Highlights & Cuisine</label>
                <textarea
                  rows={2}
                  value={formData.menuHighlights || ''}
                  onChange={(e) => setFormData({ ...formData, menuHighlights: e.target.value })}
                  placeholder="e.g. Authentic Emirati Lamb Ouzi, Fresh Seafood Grills, Mezze & Baklava"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Default Cost *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.defaultCost || 0}
                    onChange={(e) => setFormData({ ...formData, defaultCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rate Basis</label>
                  <select
                    value={formData.rateBasis || 'per_person'}
                    onChange={(e) => setFormData({ ...formData, rateBasis: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    {RATE_BASIS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Supplier Contractor</label>
                <select
                  value={formData.supplierId || ''}
                  onChange={(e) => handleSupplierChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.legalName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="meal-active"
                  checked={formData.active ?? true}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="meal-active" className="font-semibold text-slate-700 cursor-pointer">
                  Active in Dining Catalog
                </label>
              </div>
            </div>
          )}

          {/* ===================== GUIDE FORM ===================== */}
          {masterType === 'guide' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Guide Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rashid Al-Blooshi"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Language(s) Spoken *</label>
                  <input
                    type="text"
                    required
                    value={formData.language || ''}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    placeholder="e.g. English, French, Arabic, German"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Guide Category</label>
                  <select
                    value={formData.category || 'Local City Guide'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
                  >
                    <option value="Local City Guide">Local City Guide</option>
                    <option value="Driver-Guide">Driver-Guide</option>
                    <option value="Tour Manager">Tour Manager</option>
                    <option value="Specialist Naturalist">Specialist Naturalist / Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Destination Region</label>
                  <select
                    value={formData.destinationId || ''}
                    onChange={(e) => handleDestinationChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.city} ({d.country})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Daily / Service Cost *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.defaultCost || 0}
                    onChange={(e) => setFormData({ ...formData, defaultCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rate Basis</label>
                  <select
                    value={formData.rateBasis || 'per_group'}
                    onChange={(e) => setFormData({ ...formData, rateBasis: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    {RATE_BASIS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Supplier Agency</label>
                <select
                  value={formData.supplierId || ''}
                  onChange={(e) => handleSupplierChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.legalName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="guide-active"
                  checked={formData.active ?? true}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="guide-active" className="font-semibold text-slate-700 cursor-pointer">
                  Active in Guide Catalog
                </label>
              </div>
            </div>
          )}

          {/* ===================== SUPPLIER FORM ===================== */}
          {masterType === 'supplier' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Legal Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.legalName || ''}
                    onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                    placeholder="e.g. Arabian Adventures DMC LLC"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson || ''}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="e.g. Faisal Khan"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ops@supplier.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+971 4 303 4888"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contract Currency</label>
                  <select
                    value={formData.currency || 'INR'}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-mono font-bold"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="AED">AED (Emirati Dirham)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="IDR">IDR (Rp)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tax / Registration No.</label>
                  <input
                    type="text"
                    value={formData.taxNumber || ''}
                    onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                    placeholder="TRN-112233"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contract Status</label>
                  <select
                    value={formData.status || 'Active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Terms</label>
                <input
                  type="text"
                  value={formData.paymentTerms || ''}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  placeholder="e.g. 30 Days Net, Prepayment 7 Days, Immediate"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* ===================== TAX FORM ===================== */}
          {masterType === 'tax' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tax Name / Description *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. UAE VAT, GST, Tourism Dirham"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tax Rate (% Percentage) *</label>
                  <input
                    type="number"
                    step={0.1}
                    min={0}
                    max={100}
                    required
                    value={formData.ratePercent || 0}
                    onChange={(e) => setFormData({ ...formData, ratePercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="tax-inclusive"
                  checked={formData.inclusive || false}
                  onChange={(e) => setFormData({ ...formData, inclusive: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="tax-inclusive" className="font-semibold text-slate-700 cursor-pointer">
                  Inclusive (Tax is already included in published supplier rate)
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Applicable Item Categories</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['Hotel', 'Activity', 'Transport', 'Meal', 'Guide'].map((cat) => (
                    <label key={cat} className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg cursor-pointer text-slate-800 font-medium">
                      <input
                        type="checkbox"
                        checked={applicableCategories.includes(cat)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setApplicableCategories([...applicableCategories, cat]);
                          } else {
                            setApplicableCategories(applicableCategories.filter((c) => c !== cat));
                          }
                        }}
                        className="rounded text-indigo-600"
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================== CURRENCY FORM ===================== */}
          {masterType === 'currency' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Currency Code (3 Letters) *</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. USD, EUR, INR, AED, GBP"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Symbol *</label>
                  <input
                    type="text"
                    required
                    value={formData.symbol || ''}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    placeholder="e.g. $, €, ₹, £, AED"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Exchange Rate (1 Base = X) *</label>
                  <input
                    type="number"
                    step={0.0001}
                    min={0.000001}
                    required
                    value={formData.exchangeRateToBase || 1}
                    onChange={(e) => setFormData({ ...formData, exchangeRateToBase: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Relative conversion against Base Currency.</p>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Decimal Display Places</label>
                  <select
                    value={formData.decimalPlaces ?? 2}
                    onChange={(e) => setFormData({ ...formData, decimalPlaces: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value={0}>0 (e.g. 100)</option>
                    <option value={2}>2 (e.g. 100.00)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ===================== POLICY FORM ===================== */}
          {masterType === 'policy' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Policy Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Standard Cancellation Terms"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Policy Type</label>
                  <select
                    value={formData.type || 'Cancellation'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
                  >
                    <option value="Cancellation">Cancellation Policy</option>
                    <option value="Child Policy">Child Policy</option>
                    <option value="Payment Terms">Payment Terms</option>
                    <option value="Visa & Entry">Visa & Entry</option>
                    <option value="General Terms">General Terms</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Policy Text / Content *</label>
                <textarea
                  rows={5}
                  required
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Detailed clause text inserted into proposal documents and vouchers..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm shadow-indigo-200 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isEdit ? 'Save Changes' : 'Create Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
