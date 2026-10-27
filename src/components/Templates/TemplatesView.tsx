import React, { useState } from 'react';
import { Customer, DestinationMaster, Itinerary, ItineraryDay, ItemType } from '../../types';
import { 
  FileText, 
  Copy, 
  Compass, 
  Calendar, 
  Users, 
  Sparkles, 
  PlusCircle, 
  Search, 
  Eye, 
  Edit3, 
  Trash2, 
  MapPin, 
  Tag, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Bed, 
  Plane, 
  Utensils, 
  X, 
  Clock, 
  ArrowRight,
  Layers,
  Info
} from 'lucide-react';

interface CloneCustomizationOptions {
  customerName: string;
  customerId: string;
  customerEmail?: string;
  startDate: string;
  adults: number;
  children: number;
  infants: number;
  singleRooms: number;
  doubleTwinRooms: number;
  tripleRooms: number;
  extraBeds: number;
  customTitle?: string;
}

interface TemplatesViewProps {
  itineraries: Itinerary[];
  customers?: Customer[];
  destinations?: DestinationMaster[];
  onCloneTemplate: (template: Itinerary, options?: CloneCustomizationOptions) => void;
  onEditTemplate?: (template: Itinerary) => void;
  onCreateTemplate?: (newTemplate: Itinerary) => void;
  onDeleteTemplate?: (id: string) => void;
  onPreviewTemplate?: (template: Itinerary) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  itineraries,
  customers = [],
  destinations = [],
  onCloneTemplate,
  onEditTemplate,
  onCreateTemplate,
  onDeleteTemplate,
  onPreviewTemplate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDestination, setSelectedDestination] = useState<string>('All');
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);

  // Modals
  const [templateToClone, setTemplateToClone] = useState<Itinerary | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Clone Form State
  const [cloneCustomerId, setCloneCustomerId] = useState<string>('');
  const [cloneCustomerName, setCloneCustomerName] = useState<string>('');
  const [cloneCustomerEmail, setCloneCustomerEmail] = useState<string>('');
  const [cloneStartDate, setCloneStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [cloneAdults, setCloneAdults] = useState<number>(2);
  const [cloneChildren, setCloneChildren] = useState<number>(0);
  const [cloneInfants, setCloneInfants] = useState<number>(0);
  const [cloneDoubleRooms, setCloneDoubleRooms] = useState<number>(1);
  const [cloneSingleRooms, setCloneSingleRooms] = useState<number>(0);
  const [cloneTripleRooms, setCloneTripleRooms] = useState<number>(0);
  const [cloneExtraBeds, setCloneExtraBeds] = useState<number>(0);
  const [cloneTitle, setCloneTitle] = useState<string>('');

  // Create Template Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState(`TPL-${Math.floor(100 + Math.random() * 900)}`);
  const [newCategory, setNewCategory] = useState('Luxury & Culture');
  const [newDestinations, setNewDestinations] = useState<string>('Dubai');
  const [newDurationDays, setNewDurationDays] = useState<number>(5);
  const [newCost, setNewCost] = useState<number>(85000);
  const [newSellingPrice, setNewSellingPrice] = useState<number>(105000);
  const [newTags, setNewTags] = useState<string>('Luxury, City Tour, 5-Star Resort');

  // Filter templates
  const allTemplates = itineraries.filter((i) => i.isTemplate);
  // Fallback if none flagged
  const templatesList = allTemplates.length > 0 ? allTemplates : itineraries;

  const categories = ['All', ...Array.from(new Set(templatesList.map((t) => t.templateCategory || 'General Package')))];
  
  const allDestNames = Array.from(new Set(templatesList.flatMap((t) => t.destinations || [])));
  const destinationOptions = ['All', ...allDestNames];

  const filteredTemplates = templatesList.filter((tpl) => {
    const matchSearch =
      tpl.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.itineraryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.destinations.join(' ').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tpl.tags && tpl.tags.join(' ').toLowerCase().includes(searchTerm.toLowerCase()));

    const matchCategory =
      selectedCategory === 'All' ||
      (tpl.templateCategory || 'General Package') === selectedCategory;

    const matchDest =
      selectedDestination === 'All' ||
      tpl.destinations.some((d) => d.toLowerCase().includes(selectedDestination.toLowerCase()));

    return matchSearch && matchCategory && matchDest;
  });

  const handleOpenCloneModal = (template: Itinerary) => {
    setTemplateToClone(template);
    setCloneAdults(template.adults || 2);
    setCloneChildren(template.children || 0);
    setCloneInfants(template.infants || 0);
    setCloneDoubleRooms(template.roomAllocations?.doubleTwin || 1);
    setCloneSingleRooms(template.roomAllocations?.single || 0);
    setCloneTripleRooms(template.roomAllocations?.triple || 0);
    setCloneExtraBeds(template.roomAllocations?.extraBeds || 0);
    setCloneTitle(`${template.durationDays}-Day Tour - ${template.title.replace(/Master|Package|Template/gi, '').trim()}`);
    
    if (customers.length > 0) {
      setCloneCustomerId(customers[0].id);
      setCloneCustomerName(customers[0].name);
      setCloneCustomerEmail(customers[0].email);
    } else {
      setCloneCustomerId('cust-new');
      setCloneCustomerName('Direct Customer');
      setCloneCustomerEmail('');
    }
  };

  const handleExecuteClone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateToClone) return;

    onCloneTemplate(templateToClone, {
      customerName: cloneCustomerName || 'Direct Customer',
      customerId: cloneCustomerId || `cust-${Date.now()}`,
      customerEmail: cloneCustomerEmail,
      startDate: cloneStartDate,
      adults: cloneAdults,
      children: cloneChildren,
      infants: cloneInfants,
      singleRooms: cloneSingleRooms,
      doubleTwinRooms: cloneDoubleRooms,
      tripleRooms: cloneTripleRooms,
      extraBeds: cloneExtraBeds,
      customTitle: cloneTitle || templateToClone.title,
    });

    setTemplateToClone(null);
  };

  const handleCreateNewTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const destList = newDestinations.split(',').map((s) => s.trim()).filter(Boolean);
    const tagsList = newTags.split(',').map((s) => s.trim()).filter(Boolean);

    const daysArr: ItineraryDay[] = [];
    const baseDate = new Date();
    for (let i = 1; i <= newDurationDays; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + (i - 1));
      daysArr.push({
        id: `tpl-day-${Date.now()}-${i}`,
        dayNumber: i,
        date: d.toISOString().split('T')[0],
        title: `Day ${i}: ${i === 1 ? 'Arrival & Welcome' : i === newDurationDays ? 'Departure' : 'Excursions & Sightseeing'}`,
        destination: destList[0] || 'Dubai',
        items: [],
      });
    }

    const created: Itinerary = {
      id: `tpl-${Date.now()}`,
      itineraryNumber: newCode.trim() || `TPL-${Math.floor(100 + Math.random() * 900)}`,
      title: newTitle.trim(),
      customerId: 'cust-template',
      customerName: 'Master Package Template',
      consultantId: 'usr-3',
      consultantName: 'Elena Rostova',
      startDate: baseDate.toISOString().split('T')[0],
      endDate: new Date(baseDate.getTime() + (newDurationDays - 1) * 86400000).toISOString().split('T')[0],
      durationDays: newDurationDays,
      adults: 2,
      children: 0,
      infants: 0,
      roomAllocations: { single: 0, doubleTwin: 1, triple: 0, extraBeds: 0 },
      destinations: destList.length > 0 ? destList : ['Dubai'],
      status: 'Approved',
      currentRevision: 1,
      isTemplate: true,
      templateCategory: newCategory,
      tags: tagsList,
      revisions: [
        {
          revisionNumber: 1,
          revisionCode: `${newCode}-R01`,
          createdAt: new Date().toISOString(),
          createdBy: 'Elena Rostova',
          summaryOfChanges: 'Created master tour template.',
          totalPrice: newSellingPrice,
          status: 'Approved',
        }
      ],
      days: daysArr,
      pricing: {
        baseCurrency: 'INR',
        sellingCurrency: 'INR',
        exchangeRate: 1.0,
        totalCost: newCost,
        markupType: 'percentage',
        markupValue: Math.round(((newSellingPrice - newCost) / (newCost || 1)) * 100),
        grossProfit: newSellingPrice - newCost,
        subtotalSellingPrice: newSellingPrice,
        discountType: 'percentage',
        discountValue: 0,
        discountAmount: 0,
        taxRatePercent: 5,
        taxInclusive: false,
        taxAmount: Math.round(newSellingPrice * 0.05),
        finalSellingPrice: Math.round(newSellingPrice * 1.05),
        perAdultPrice: Math.round((newSellingPrice * 1.05) / 2),
        perChildPrice: 0,
        perInfantPrice: 0,
        perPersonAveragePrice: Math.round((newSellingPrice * 1.05) / 2),
      },
      inclusions: [
        'Luxury accommodation with daily buffet breakfast',
        'Private airport arrival & departure chauffeur transfers',
        'All major sightseeing and monument admission tickets',
        '24/7 dedicated customer assistance during tour'
      ],
      exclusions: [
        'International airfare tickets',
        'Personal expenses, tips, and minibar charges',
        'Optional add-on excursions and activities'
      ],
      policies: [
        'Cancellation 30+ days prior to arrival: Full refund minus processing fees.',
        'Cancellation 15-29 days prior: 50% refund.'
      ],
      requiresApproval: false,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    if (onCreateTemplate) {
      onCreateTemplate(created);
    } else {
      onCloneTemplate(created);
    }

    setShowCreateModal(false);
    setNewTitle('');
  };

  const getItemTypeIcon = (type: ItemType) => {
    switch (type) {
      case 'hotel':
        return <Bed className="w-3.5 h-3.5 text-blue-500" />;
      case 'transport':
        return <Plane className="w-3.5 h-3.5 text-amber-500" />;
      case 'meal':
        return <Utensils className="w-3.5 h-3.5 text-rose-500" />;
      case 'activity':
      default:
        return <Compass className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Master Itinerary Packages & Templates
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Standardized tour packages with verified day-by-day itineraries, inclusions, and rates. Clone any template directly to generate a client proposal.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Create New Master Package
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by package name, code, destination, or tags (e.g., Desert Safari, Luxury, Bali)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 text-slate-800 text-xs font-medium rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> Destination:
            </div>
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {destinationOptions.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Destinations' : d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-sm space-y-3">
          <Compass className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700">No master templates matching your search criteria.</p>
          <p className="text-xs text-slate-400">Try resetting filters or click "Create New Master Package" above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTemplates.map((tpl) => {
            const isExpanded = expandedTemplateId === tpl.id;
            return (
              <div
                key={tpl.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition flex flex-col justify-between overflow-hidden"
              >
                {/* Header */}
                <div className="p-5 border-b border-slate-100 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-bold bg-slate-900 text-indigo-300 px-2 py-0.5 rounded-md border border-slate-800">
                          {tpl.itineraryNumber}
                        </span>
                        <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">
                          {tpl.templateCategory || 'Standard Package'}
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified Template
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base leading-snug">
                        {tpl.title}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleOpenCloneModal(tpl)}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition cursor-pointer shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" /> Clone as Proposal
                    </button>
                  </div>

                  {/* Destinations & Duration info */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      {tpl.durationDays} Days / {tpl.days.length} Daily Schedules
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-medium text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {tpl.destinations.join(', ')}
                    </span>
                  </div>

                  {/* Tags */}
                  {tpl.tags && tpl.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {tpl.tags.map((tg, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                        >
                          #{tg}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Day-by-Day Preview / Highlights */}
                <div className="p-5 space-y-3 text-xs flex-1 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900 text-xs flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-indigo-600" /> Day-by-Day Schedule Highlights:
                    </strong>
                    <button
                      onClick={() => setExpandedTemplateId(isExpanded ? null : tpl.id)}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          Collapse <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          View All {tpl.days.length} Days <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(isExpanded ? tpl.days : tpl.days.slice(0, 3)).map((d) => (
                      <div
                        key={d.id}
                        className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 text-[11px]">
                            Day {d.dayNumber}: {d.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">{d.destination}</span>
                        </div>

                        {d.summaryNote && (
                          <p className="text-[11px] text-slate-500 line-clamp-1">{d.summaryNote}</p>
                        )}

                        {d.items.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {d.items.map((item) => (
                              <span
                                key={item.id}
                                className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                              >
                                {getItemTypeIcon(item.type)}
                                <span className="truncate max-w-[150px]">{item.title}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Included features brief */}
                  {tpl.inclusions && tpl.inclusions.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="text-[11px] font-bold text-slate-700 block mb-1">Key Package Inclusions:</span>
                      <ul className="grid grid-cols-1 gap-1 text-[11px] text-slate-600">
                        {tpl.inclusions.slice(0, isExpanded ? 6 : 2).map((inc, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span className="line-clamp-1">{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Footer Commercial Rates & Actions */}
                <div className="p-5 border-t border-slate-100 bg-white space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                        Base Estimated Cost
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        ₹{(tpl.pricing?.totalCost || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                        Standard Selling Package Rate
                      </span>
                      <div className="text-lg font-bold text-slate-900">
                        ₹{(tpl.pricing?.finalSellingPrice || 0).toLocaleString()}{' '}
                        <span className="text-xs font-normal text-slate-500">
                          (₹{(tpl.pricing?.perPersonAveragePrice || 0).toLocaleString()}/pax)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      {onPreviewTemplate && (
                        <button
                          onClick={() => onPreviewTemplate(tpl)}
                          title="Preview full itinerary presentation"
                          className="p-2 text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                        >
                          <Eye className="w-4 h-4 text-indigo-600" /> Preview
                        </button>
                      )}

                      {onEditTemplate && (
                        <button
                          onClick={() => onEditTemplate(tpl)}
                          title="Edit master template details & day cards"
                          className="p-2 text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                        >
                          <Edit3 className="w-4 h-4 text-slate-600" /> Edit Template
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {onDeleteTemplate && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete template "${tpl.title}"?`)) {
                              onDeleteTemplate(tpl.id);
                            }
                          }}
                          title="Delete master template"
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenCloneModal(tpl)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Use Template
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Clone as Client Proposal */}
      {templateToClone && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-indigo-600 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-200" />
                <div>
                  <h3 className="font-bold text-base">Clone Template to Client Proposal</h3>
                  <p className="text-indigo-100 text-xs">
                    Instantly creates an editable proposal based on "{templateToClone.title}"
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTemplateToClone(null)}
                className="p-1 hover:bg-indigo-700 rounded-lg transition text-indigo-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteClone} className="p-6 space-y-4">
              {/* Proposal Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Proposal Title</label>
                <input
                  type="text"
                  required
                  value={cloneTitle}
                  onChange={(e) => setCloneTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Customer Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Customer</label>
                  {customers.length > 0 ? (
                    <select
                      value={cloneCustomerId}
                      onChange={(e) => {
                        const cid = e.target.value;
                        setCloneCustomerId(cid);
                        const c = customers.find((cust) => cust.id === cid);
                        if (c) {
                          setCloneCustomerName(c.name);
                          setCloneCustomerEmail(c.email);
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.type})
                        </option>
                      ))}
                      <option value="cust-new">+ New Customer Name</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="Customer Name"
                      value={cloneCustomerName}
                      onChange={(e) => setCloneCustomerName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Client Name / Contact</label>
                  <input
                    type="text"
                    required
                    value={cloneCustomerName}
                    onChange={(e) => setCloneCustomerName(e.target.value)}
                    placeholder="e.g., Jonathan Sterling"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Travel Start Date</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    required
                    value={cloneStartDate}
                    onChange={(e) => setCloneStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-500 shrink-0 font-medium">
                    Duration: {templateToClone.durationDays} Days
                  </span>
                </div>
              </div>

              {/* Passenger Numbers */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-600" /> Travelers & Pax Count
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium">Adults</label>
                    <input
                      type="number"
                      min={1}
                      value={cloneAdults}
                      onChange={(e) => setCloneAdults(parseInt(e.target.value) || 1)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium">Children (2-11)</label>
                    <input
                      type="number"
                      min={0}
                      value={cloneChildren}
                      onChange={(e) => setCloneChildren(parseInt(e.target.value) || 0)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-medium">Infants (0-2)</label>
                    <input
                      type="number"
                      min={0}
                      value={cloneInfants}
                      onChange={(e) => setCloneInfants(parseInt(e.target.value) || 0)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Room Allocation */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Bed className="w-4 h-4 text-indigo-600" /> Room Requirements
                </label>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">Double/Twin</label>
                    <input
                      type="number"
                      min={0}
                      value={cloneDoubleRooms}
                      onChange={(e) => setCloneDoubleRooms(parseInt(e.target.value) || 0)}
                      className="w-full mt-1 px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">Single</label>
                    <input
                      type="number"
                      min={0}
                      value={cloneSingleRooms}
                      onChange={(e) => setCloneSingleRooms(parseInt(e.target.value) || 0)}
                      className="w-full mt-1 px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">Triple</label>
                    <input
                      type="number"
                      min={0}
                      value={cloneTripleRooms}
                      onChange={(e) => setCloneTripleRooms(parseInt(e.target.value) || 0)}
                      className="w-full mt-1 px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">Extra Beds</label>
                    <input
                      type="number"
                      min={0}
                      value={cloneExtraBeds}
                      onChange={(e) => setCloneExtraBeds(parseInt(e.target.value) || 0)}
                      className="w-full mt-1 px-2 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTemplateToClone(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> Generate Client Proposal & Open Builder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Master Package Template */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-base">Create Master Package Template</h3>
                  <p className="text-slate-400 text-xs">Define a reusable standardized tour package</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTemplateSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Package Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 7-Day Golden Triangle Luxury Tour"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Package Code</label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Luxury & Culture">Luxury & Culture</option>
                    <option value="Wellness & Nature">Wellness & Nature</option>
                    <option value="Family & Adventure">Family & Adventure</option>
                    <option value="Beach & Islands">Beach & Islands</option>
                    <option value="Honeymoon & Romance">Honeymoon & Romance</option>
                    <option value="MICE & Corporate">MICE & Corporate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    required
                    value={newDurationDays}
                    onChange={(e) => setNewDurationDays(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Destinations (Comma separated)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Delhi, Agra, Jaipur"
                    value={newDestinations}
                    onChange={(e) => setNewDestinations(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tags (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g., Taj Mahal, Heritage, 5-Star"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Estimated Base Net Cost (INR)</label>
                  <input
                    type="number"
                    min={0}
                    value={newCost}
                    onChange={(e) => setNewCost(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Selling Package Price (INR)</label>
                  <input
                    type="number"
                    min={0}
                    value={newSellingPrice}
                    onChange={(e) => setNewSellingPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-indigo-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" /> Create & Open in Builder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
