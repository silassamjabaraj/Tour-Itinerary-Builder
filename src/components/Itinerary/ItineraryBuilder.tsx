import React, { useState, useEffect } from 'react';
import { 
  Itinerary, 
  ItineraryDay, 
  ItineraryItem, 
  ItemType, 
  RateBasis, 
  ItineraryStatus,
  DestinationMaster,
  HotelMaster,
  ActivityMaster,
  TransportMaster,
  MealMaster,
  GuideMaster,
  SupplierMaster,
  CurrencyMaster,
  MasterType,
  UserRole,
  ItineraryTask,
  TaskCategory,
  TaskPriority,
  TaskStatus
} from '../../types';
import { 
  recalculateItineraryPricing, 
  validateItinerary, 
  ValidationAlert 
} from '../../lib/pricingEngine';
import { formatCurrency } from '../../lib/currency';
import { StorageService } from '../../lib/storage';
import { MasterEditModal } from '../Masters/MasterEditModal';
import { 
  Compass, 
  Save, 
  Send, 
  Eye, 
  Plus, 
  Copy, 
  Trash2, 
  Clock, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Hotel, 
  Car, 
  Utensils, 
  UserCheck, 
  Sparkles, 
  ArrowUp, 
  ArrowDown, 
  Info, 
  Layers,
  ChevronRight,
  ShieldAlert,
  FileCheck2,
  Edit3,
  Sliders,
  Wand2,
  X,
  ListTodo,
  CheckSquare,
  Square,
  PlusCircle,
  CalendarClock,
  User,
  Filter,
  Tag,
  AlertCircle,
  Check
} from 'lucide-react';

interface ItineraryBuilderProps {
  itinerary: Itinerary;
  currentUserRole: UserRole;
  masterDestinations?: DestinationMaster[];
  masterHotels: HotelMaster[];
  masterActivities: ActivityMaster[];
  masterTransport: TransportMaster[];
  masterMeals: MealMaster[];
  masterGuides: GuideMaster[];
  masterCurrencies?: CurrencyMaster[];
  masterSuppliers?: SupplierMaster[];
  onUpdateDestinations?: (items: DestinationMaster[]) => void;
  onSave: (updated: Itinerary) => void;
  onPreview: (itinerary: Itinerary) => void;
  onSubmitApproval: (itinerary: Itinerary, reason: string) => void;
  onBack: () => void;
}

export const ItineraryBuilder: React.FC<ItineraryBuilderProps> = ({
  itinerary: initialItinerary,
  currentUserRole,
  masterDestinations = [],
  masterHotels,
  masterActivities,
  masterTransport,
  masterMeals,
  masterGuides,
  masterCurrencies = [],
  masterSuppliers = [],
  onUpdateDestinations,
  onSave,
  onPreview,
  onSubmitApproval,
  onBack,
}) => {
  const [itinerary, setItinerary] = useState<Itinerary>(initialItinerary);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [activeRightTab, setActiveRightTab] = useState<'catalog' | 'pricing' | 'tasks' | 'validation'>('catalog');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState<'all' | 'destination' | 'hotel' | 'activity' | 'transport' | 'meal' | 'guide'>('all');
  const [destinationsList, setDestinationsList] = useState<DestinationMaster[]>(
    masterDestinations && masterDestinations.length > 0
      ? masterDestinations
      : StorageService.getDestinations()
  );
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [masterModalItem, setMasterModalItem] = useState<any | null>(null);
  const [destinationSuccessMsg, setDestinationSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (masterDestinations && masterDestinations.length > 0) {
      setDestinationsList(masterDestinations);
    }
  }, [masterDestinations]);

  const handleSaveMasterItem = (type: MasterType, item: any) => {
    if (type === 'destination') {
      const exists = destinationsList.some((d) => d.id === item.id);
      const updated = exists
        ? destinationsList.map((d) => (d.id === item.id ? item : d))
        : [item, ...destinationsList];
      setDestinationsList(updated);
      StorageService.saveDestinations(updated);
      onUpdateDestinations?.(updated);
      setIsMasterModalOpen(false);
      setDestinationSuccessMsg(`Destination "${item.city}" ${exists ? 'updated' : 'added'} to catalog!`);
      setTimeout(() => setDestinationSuccessMsg(null), 3000);
    }
  };

  const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null);
  const [editingItemData, setEditingItemData] = useState<ItineraryItem | null>(null);

  // Task Management States
  const [taskFilterStatus, setTaskFilterStatus] = useState<string>('all');
  const [taskFilterCategory, setTaskFilterCategory] = useState<string>('all');
  const [taskFilterPriority, setTaskFilterPriority] = useState<string>('all');
  const [isAddingTask, setIsAddingTask] = useState<boolean>(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('Booking');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('Medium');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Operations Executive');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [newTaskItemId, setNewTaskItemId] = useState<string>('none');

  const currentTasks = itinerary.tasks || [];
  const pendingTasksCount = currentTasks.filter((t) => t.status !== 'Completed').length;

  const filteredTasks = currentTasks.filter((task) => {
    if (taskFilterStatus === 'Pending' && task.status === 'Completed') return false;
    if (taskFilterStatus === 'Completed' && task.status !== 'Completed') return false;

    if (taskFilterPriority === 'High' && task.priority !== 'High' && task.priority !== 'Urgent') return false;
    if (taskFilterPriority === 'Medium' && task.priority !== 'Medium') return false;
    if (taskFilterPriority === 'Low' && task.priority !== 'Low') return false;

    if (taskFilterCategory !== 'all') {
      if (task.category === taskFilterCategory) return true;
      if (task.itemId === taskFilterCategory) return true;
      return false;
    }

    return true;
  });

  const handleToggleTaskStatus = (taskId: string) => {
    const updatedTasks = currentTasks.map((t) => {
      if (t.id === taskId) {
        const isComp = t.status === 'Completed';
        return {
          ...t,
          status: (isComp ? 'Pending' : 'Completed') as TaskStatus,
          completedAt: isComp ? undefined : new Date().toISOString(),
        };
      }
      return t;
    });

    const updatedItn = { ...itinerary, tasks: updatedTasks };
    handleTriggerSave(updatedItn);
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = currentTasks.filter((t) => t.id !== taskId);
    const updatedItn = { ...itinerary, tasks: updatedTasks };
    handleTriggerSave(updatedItn);
  };

  const handleCreateTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTaskTitle.trim()) return;

    let selectedItemTitle = undefined;
    let selectedDayNum = undefined;

    if (newTaskItemId !== 'none') {
      for (const day of itinerary.days) {
        const found = day.items.find((i) => i.id === newTaskItemId);
        if (found) {
          selectedItemTitle = found.title;
          selectedDayNum = day.dayNumber;
          break;
        }
      }
    }

    const createdTask: ItineraryTask = {
      id: `tsk-${Date.now()}`,
      itineraryId: itinerary.id,
      itemId: newTaskItemId === 'none' ? undefined : newTaskItemId,
      itemTitle: selectedItemTitle,
      dayNumber: selectedDayNum,
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      assignedTo: newTaskAssignee || 'Operations Executive',
      dueDate: newTaskDueDate || undefined,
      priority: newTaskPriority,
      status: 'Pending',
      notes: newTaskNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const updatedItn = {
      ...itinerary,
      tasks: [...currentTasks, createdTask],
    };

    handleTriggerSave(updatedItn);

    // Reset form
    setNewTaskTitle('');
    setNewTaskNotes('');
    setNewTaskDueDate('');
    setIsAddingTask(false);
  };

  const handleAutoGenerateTasks = () => {
    const generated: ItineraryTask[] = [];
    const existingTitles = new Set(currentTasks.map((t) => t.title.toLowerCase()));

    itinerary.days.forEach((day) => {
      day.items.forEach((item) => {
        let taskTitle = '';
        let cat: TaskCategory = 'Booking';
        let priority: TaskPriority = 'Medium';

        if (item.type === 'hotel') {
          taskTitle = `Send booking request to ${item.title}`;
          cat = 'Booking';
          priority = 'High';
        } else if (item.type === 'transport') {
          taskTitle = `Confirm vehicle & driver assignment for ${item.title}`;
          cat = 'Confirmation';
          priority = 'High';
        } else if (item.type === 'activity') {
          taskTitle = `Issue entry voucher & reconfirm timing for ${item.title}`;
          cat = 'Voucher';
          priority = 'Medium';
        } else if (item.type === 'guide') {
          taskTitle = `Confirm language guide allocation for Day ${day.dayNumber}`;
          cat = 'Confirmation';
          priority = 'Medium';
        }

        if (taskTitle && !existingTitles.has(taskTitle.toLowerCase())) {
          existingTitles.add(taskTitle.toLowerCase());
          generated.push({
            id: `tsk-gen-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            itineraryId: itinerary.id,
            itemId: item.id,
            itemTitle: item.title,
            dayNumber: day.dayNumber,
            title: taskTitle,
            category: cat,
            assignedTo: 'Operations Executive',
            priority: priority,
            status: 'Pending',
            notes: `Auto-generated operational task for Day ${day.dayNumber} item.`,
            createdAt: new Date().toISOString(),
          });
        }
      });
    });

    if (generated.length === 0) {
      alert('Operational tasks have already been generated for all itinerary items!');
      return;
    }

    const updatedItn = {
      ...itinerary,
      tasks: [...currentTasks, ...generated],
    };
    handleTriggerSave(updatedItn);
  };

  // Recalculate pricing on any change
  useEffect(() => {
    const { pricing, requiresApproval, approvalReason } = recalculateItineraryPricing(
      itinerary.days,
      itinerary.adults,
      itinerary.children,
      itinerary.infants,
      itinerary.roomAllocations.doubleTwin + itinerary.roomAllocations.single + itinerary.roomAllocations.triple,
      itinerary.pricing
    );

    setItinerary((prev) => ({
      ...prev,
      pricing,
      requiresApproval,
      approvalReason,
    }));
  }, [itinerary.adults, itinerary.children, itinerary.infants, itinerary.roomAllocations]);

  // Autosave simulation
  const handleTriggerSave = (updated: Itinerary) => {
    setItinerary(updated);
    onSave(updated);
    const now = new Date();
    setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  const selectedDay = itinerary.days[selectedDayIndex] || itinerary.days[0];
  const validationAlerts = validateItinerary(itinerary);

  // Day Management
  const handleAddDay = () => {
    const nextDayNum = itinerary.days.length + 1;
    let nextDate = itinerary.startDate;
    if (itinerary.days.length > 0) {
      const lastDate = new Date(itinerary.days[itinerary.days.length - 1].date);
      lastDate.setDate(lastDate.getDate() + 1);
      nextDate = lastDate.toISOString().split('T')[0];
    }

    const newDay: ItineraryDay = {
      id: `day-${Date.now()}`,
      dayNumber: nextDayNum,
      date: nextDate,
      title: `Day ${nextDayNum} Schedule`,
      destination: itinerary.destinations[0] || 'Dubai',
      items: [],
    };

    const updatedDays = [...itinerary.days, newDay];
    const updatedItn = {
      ...itinerary,
      days: updatedDays,
      durationDays: updatedDays.length,
    };
    handleTriggerSave(updatedItn);
    setSelectedDayIndex(updatedDays.length - 1);
  };

  const handleDuplicateDay = (dayIndex: number) => {
    const targetDay = itinerary.days[dayIndex];
    const newDay: ItineraryDay = {
      ...targetDay,
      id: `day-${Date.now()}`,
      dayNumber: itinerary.days.length + 1,
      title: `${targetDay.title} (Copy)`,
      items: targetDay.items.map((item) => ({ ...item, id: `item-${Date.now()}-${Math.random()}` })),
    };

    const updatedDays = [...itinerary.days, newDay];
    const updatedItn = { ...itinerary, days: updatedDays, durationDays: updatedDays.length };
    handleTriggerSave(updatedItn);
    setSelectedDayIndex(updatedDays.length - 1);
  };

  const handleDeleteDay = (dayIndex: number) => {
    if (itinerary.days.length <= 1) {
      alert('An itinerary must contain at least one day.');
      return;
    }
    const updatedDays = itinerary.days
      .filter((_, idx) => idx !== dayIndex)
      .map((day, idx) => ({ ...day, dayNumber: idx + 1 }));

    const updatedItn = { ...itinerary, days: updatedDays, durationDays: updatedDays.length };
    handleTriggerSave(updatedItn);
    setSelectedDayIndex(Math.max(0, dayIndex - 1));
  };

  const handleMoveDay = (dayIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? dayIndex - 1 : dayIndex + 1;
    if (targetIndex < 0 || targetIndex >= itinerary.days.length) return;

    const newDays = [...itinerary.days];
    const temp = newDays[dayIndex];
    newDays[dayIndex] = newDays[targetIndex];
    newDays[targetIndex] = temp;

    const renumbered = newDays.map((d, idx) => ({ ...d, dayNumber: idx + 1 }));
    handleTriggerSave({ ...itinerary, days: renumbered });
    setSelectedDayIndex(targetIndex);
  };

  // Service Item Management inside current Day
  const handleAddItemToDay = (item: Partial<ItineraryItem>) => {
    if (!selectedDay) return;

    const newItem: ItineraryItem = {
      id: `item-${Date.now()}`,
      dayId: selectedDay.id,
      type: item.type || 'activity',
      title: item.title || 'New Service Item',
      masterId: item.masterId,
      supplierId: item.supplierId,
      supplierName: item.supplierName || 'Primary DMC',
      startTime: item.startTime || '09:00',
      endTime: item.endTime || '11:00',
      pickupLocation: item.pickupLocation || 'Hotel Lobby',
      dropoffLocation: item.dropoffLocation || 'Location Venue',
      customerDescription: item.customerDescription || 'Detailed client-facing description...',
      internalNotes: item.internalNotes || 'Internal operational notes & supplier confirmation code...',
      imageUrl: item.imageUrl,
      rateBasis: item.rateBasis || 'per_person',
      unitCost: item.unitCost || 0,
      quantity: item.quantity || 1,
      totalCost: item.unitCost || 0,
      isOptional: false,
      confirmationStatus: 'Pending',
    };

    const updatedDays = itinerary.days.map((d, idx) => {
      if (idx === selectedDayIndex) {
        return { ...d, items: [...d.items, newItem] };
      }
      return d;
    });

    const { pricing, requiresApproval, approvalReason } = recalculateItineraryPricing(
      updatedDays,
      itinerary.adults,
      itinerary.children,
      itinerary.infants,
      itinerary.roomAllocations.doubleTwin + itinerary.roomAllocations.single,
      itinerary.pricing
    );

    handleTriggerSave({
      ...itinerary,
      days: updatedDays,
      pricing,
      requiresApproval,
      approvalReason,
    });
  };

  const handleUpdateItem = (itemIndex: number, updatedItem: ItineraryItem) => {
    const updatedDays = itinerary.days.map((d, idx) => {
      if (idx === selectedDayIndex) {
        const items = [...d.items];
        items[itemIndex] = updatedItem;
        return { ...d, items };
      }
      return d;
    });

    const { pricing, requiresApproval, approvalReason } = recalculateItineraryPricing(
      updatedDays,
      itinerary.adults,
      itinerary.children,
      itinerary.infants,
      itinerary.roomAllocations.doubleTwin + itinerary.roomAllocations.single,
      itinerary.pricing
    );

    handleTriggerSave({
      ...itinerary,
      days: updatedDays,
      pricing,
      requiresApproval,
      approvalReason,
    });
  };

  const handleDeleteItem = (itemIndex: number) => {
    const updatedDays = itinerary.days.map((d, idx) => {
      if (idx === selectedDayIndex) {
        return { ...d, items: d.items.filter((_, i) => i !== itemIndex) };
      }
      return d;
    });

    const { pricing, requiresApproval, approvalReason } = recalculateItineraryPricing(
      updatedDays,
      itinerary.adults,
      itinerary.children,
      itinerary.infants,
      itinerary.roomAllocations.doubleTwin + itinerary.roomAllocations.single,
      itinerary.pricing
    );

    handleTriggerSave({
      ...itinerary,
      days: updatedDays,
      pricing,
      requiresApproval,
      approvalReason,
    });
  };

  const handleMoveItemInDay = (itemIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    if (targetIndex < 0 || targetIndex >= selectedDay.items.length) return;

    const updatedDays = itinerary.days.map((d, idx) => {
      if (idx === selectedDayIndex) {
        const items = [...d.items];
        const temp = items[itemIndex];
        items[itemIndex] = items[targetIndex];
        items[targetIndex] = temp;
        return { ...d, items };
      }
      return d;
    });

    handleTriggerSave({ ...itinerary, days: updatedDays });
  };

  // Pricing Adjustments
  const handlePricingChange = (key: string, value: any) => {
    const newPricing = { 
      ...itinerary.pricing, 
      baseCurrency: 'INR',
      sellingCurrency: 'INR',
      exchangeRate: 1,
      [key]: value 
    };

    const { pricing, requiresApproval, approvalReason } = recalculateItineraryPricing(
      itinerary.days,
      itinerary.adults,
      itinerary.children,
      itinerary.infants,
      itinerary.roomAllocations.doubleTwin + itinerary.roomAllocations.single,
      newPricing
    );

    handleTriggerSave({
      ...itinerary,
      pricing,
      requiresApproval,
      approvalReason,
    });
  };

  // Revision & Approval
  const handleCreateNewRevision = () => {
    const nextRevNum = itinerary.currentRevision + 1;
    const revCode = `${itinerary.itineraryNumber}-R0${nextRevNum}`;
    const newRev = {
      revisionNumber: nextRevNum,
      revisionCode: revCode,
      createdAt: new Date().toISOString(),
      createdBy: 'Sarah Jenkins',
      summaryOfChanges: `Revision R0${nextRevNum} updated and commercial pricing locked.`,
      totalPrice: itinerary.pricing.finalSellingPrice,
      status: itinerary.status,
    };

    const updated = {
      ...itinerary,
      currentRevision: nextRevNum,
      revisions: [newRev, ...itinerary.revisions],
    };
    handleTriggerSave(updated);
    alert(`Revision R0${nextRevNum} created and saved successfully!`);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Builder Top Bar Header */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
            >
              ← Hub
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-indigo-400 text-sm bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {itinerary.itineraryNumber}
                </span>
                <span className="text-xs font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  R0{itinerary.currentRevision}
                </span>
                <select
                  value={itinerary.status}
                  onChange={(e) => handleTriggerSave({ ...itinerary, status: e.target.value as ItineraryStatus })}
                  className="bg-slate-800 text-indigo-300 text-xs font-bold rounded px-2.5 py-1 border border-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Draft">Draft</option>
                  <option value="Internal Review">Internal Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Sent">Sent</option>
                  <option value="Revised">Revised</option>
                  <option value="Won">Won</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="In Operation">In Operation</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <h2 className="text-lg font-bold text-slate-100 mt-1">{itinerary.title}</h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> Autosaved: {lastSavedTime}
            </span>

            <button
              onClick={handleCreateNewRevision}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-indigo-400" /> Save Revision
            </button>

            {itinerary.requiresApproval && (
              <button
                onClick={() => onSubmitApproval(itinerary, itinerary.approvalReason || 'Requires manager approval')}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Submit Approval
              </button>
            )}

            <button
              onClick={() => onPreview(itinerary)}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 cursor-pointer"
            >
              <Eye className="w-4 h-4" /> Preview & Export Proposal
            </button>
          </div>
        </div>

        {/* Sub Header Specs */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300 pt-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <strong>{itinerary.customerName}</strong> ({itinerary.adults} Adults, {itinerary.children} Children)
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              {itinerary.startDate} to {itinerary.endDate} ({itinerary.durationDays} Days)
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 bg-slate-800/90 px-2 py-0.5 rounded-md border border-slate-700/60 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Destinations:</span>
              <strong className="text-white">
                {itinerary.destinations && itinerary.destinations.length > 0
                  ? itinerary.destinations.join(', ')
                  : 'None specified'}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-3 font-bold text-sm">
            <span className="text-slate-400 text-xs font-normal">Total Package Selling:</span>
            <span className="text-indigo-400 font-mono text-base">
              {formatCurrency(itinerary.pricing.finalSellingPrice, 'INR')}
            </span>
            <span className="text-emerald-400 text-xs font-semibold">({itinerary.pricing.targetMarginPercent}% Margin)</span>
          </div>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT RAIL (Day Navigator - 3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" /> Day Navigator ({itinerary.days.length})
            </h3>
            <button
              onClick={handleAddDay}
              className="p-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 px-2.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Day
            </button>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {itinerary.days.map((day, idx) => {
              const isSelected = idx === selectedDayIndex;
              return (
                <div
                  key={day.id}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-1 ring-indigo-500/30'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-xs ${isSelected ? 'text-indigo-400' : 'text-slate-900'}`}>
                        Day {day.dayNumber}
                      </span>
                      <span className={`text-[10px] ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                        {day.date}
                      </span>
                    </div>
                    <div className={`text-xs font-medium truncate max-w-[150px] ${isSelected ? 'text-slate-200' : 'text-slate-700'}`}>
                      {day.title}
                    </div>
                    <div className="text-[10px] text-indigo-600 font-semibold">
                      {day.items.length} Services Added
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleMoveDay(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMoveDay(idx, 'down')}
                        disabled={idx === itinerary.days.length - 1}
                        className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDuplicateDay(idx)}
                        title="Duplicate Day"
                        className="p-1 text-indigo-400 hover:text-indigo-300 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteDay(idx)}
                        title="Delete Day"
                        className="p-1 text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER CANVAS (Selected Day Schedule Cards - 6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {selectedDay ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              {/* Day Title & Details Editor */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-600 text-xs uppercase tracking-wider">
                      Day {selectedDay.dayNumber} ({selectedDay.date})
                    </span>
                  </div>
                  <input
                    type="text"
                    value={selectedDay.title}
                    onChange={(e) => {
                      const updatedDays = itinerary.days.map((d, i) =>
                        i === selectedDayIndex ? { ...d, title: e.target.value } : d
                      );
                      handleTriggerSave({ ...itinerary, days: updatedDays });
                    }}
                    className="w-full text-lg font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none py-0.5"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Destination:</span>
                  </span>
                  <div className="relative">
                    <input
                      type="text"
                      list="day-destination-catalog-options"
                      value={selectedDay.destination}
                      placeholder="Select or enter city..."
                      onChange={(e) => {
                        const val = e.target.value;
                        const updatedDays = itinerary.days.map((d, i) =>
                          i === selectedDayIndex ? { ...d, destination: val } : d
                        );
                        const updatedDestinations = val && !itinerary.destinations.includes(val)
                          ? [...itinerary.destinations, val]
                          : itinerary.destinations;
                        handleTriggerSave({ ...itinerary, days: updatedDays, destinations: updatedDestinations });
                      }}
                      className="text-xs font-semibold bg-slate-100 hover:bg-slate-50 focus:bg-white text-slate-800 rounded-lg px-2.5 py-1 border border-slate-200 focus:border-indigo-500 focus:outline-none w-44 transition"
                    />
                    <datalist id="day-destination-catalog-options">
                      {destinationsList.map((d) => (
                        <option key={d.id} value={d.city}>
                          {d.city} ({d.country})
                        </option>
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>

              {/* Service Cards Stream */}
              <div className="space-y-4">
                {selectedDay.items.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs space-y-2">
                    <Sparkles className="w-8 h-8 text-indigo-500 mx-auto" />
                    <p className="font-semibold text-slate-700">Day {selectedDay.dayNumber} is empty.</p>
                    <p>Select items from the Master Service Catalog on the right to insert instantly!</p>
                  </div>
                ) : (
                  selectedDay.items.map((item, itemIdx) => {
                    const itemTasks = currentTasks.filter(
                      (t) => t.itemId === item.id || (t.itemTitle === item.title && t.dayNumber === selectedDay.dayNumber)
                    );

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border transition space-y-3 ${
                          item.isOptional
                            ? 'bg-indigo-50/40 border-indigo-200'
                            : 'bg-white border-slate-200 shadow-xs'
                        }`}
                      >
                        {/* Item Top Bar */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                item.type === 'hotel'
                                  ? 'bg-purple-100 text-purple-800'
                                  : item.type === 'activity'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : item.type === 'transport'
                                  ? 'bg-blue-100 text-blue-800'
                                  : item.type === 'meal'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {item.type}
                            </span>

                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => handleUpdateItem(itemIdx, { ...item, title: e.target.value })}
                              className="font-bold text-slate-900 text-sm bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none"
                            />

                            {item.isOptional && (
                              <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                                OPTIONAL ADD-ON
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {/* To-Dos Quick Action Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveRightTab('tasks');
                                setTaskFilterCategory(item.id);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                                itemTasks.length > 0
                                  ? itemTasks.every((t) => t.status === 'Completed')
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                              }`}
                              title="Manage To-Dos & Internal Tasks"
                            >
                              <ListTodo className="w-3.5 h-3.5 text-indigo-600" />
                              <span>To-Dos</span>
                              {itemTasks.length > 0 ? (
                                <span
                                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                    itemTasks.every((t) => t.status === 'Completed')
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-amber-600 text-white'
                                  }`}
                                >
                                  {itemTasks.filter((t) => t.status === 'Completed').length}/{itemTasks.length}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-semibold">+ Add</span>
                              )}
                            </button>

                            <button
                              onClick={() => {
                                setEditingItemIdx(itemIdx);
                                setEditingItemData({ ...item });
                              }}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition border border-indigo-200"
                              title="Open Full Activity / Service Editor"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-indigo-600" /> Edit Activity
                            </button>
                            <button
                              onClick={() => handleMoveItemInDay(itemIdx, 'up')}
                              disabled={itemIdx === 0}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveItemInDay(itemIdx, 'down')}
                              disabled={itemIdx === selectedDay.items.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(itemIdx)}
                              className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Timings, Pickup, Rate Basis & Cost */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div>
                            <label className="block text-[10px] text-slate-500 font-medium">Start / End</label>
                            <div className="flex items-center gap-1">
                              <input
                                type="time"
                                value={item.startTime || '09:00'}
                                onChange={(e) => handleUpdateItem(itemIdx, { ...item, startTime: e.target.value })}
                                className="w-full px-1.5 py-1 border border-slate-200 rounded text-xs bg-slate-50"
                              />
                              <span>-</span>
                              <input
                                type="time"
                                value={item.endTime || '11:00'}
                                onChange={(e) => handleUpdateItem(itemIdx, { ...item, endTime: e.target.value })}
                                className="w-full px-1.5 py-1 border border-slate-200 rounded text-xs bg-slate-50"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-500 font-medium">Rate Basis</label>
                            <select
                              value={item.rateBasis}
                              onChange={(e) =>
                                handleUpdateItem(itemIdx, { ...item, rateBasis: e.target.value as RateBasis })
                              }
                              className="w-full px-1.5 py-1 border border-slate-200 rounded text-xs bg-white"
                            >
                              <option value="per_person">Per Person</option>
                              <option value="per_adult">Per Adult</option>
                              <option value="per_child">Per Child</option>
                              <option value="per_room_night">Per Room / Night</option>
                              <option value="per_vehicle">Per Vehicle</option>
                              <option value="per_group">Per Group</option>
                              <option value="fixed">Fixed</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-500 font-medium">
                              Unit Cost (₹)
                            </label>
                            <input
                              type="number"
                              value={item.unitCost}
                              onChange={(e) =>
                                handleUpdateItem(itemIdx, { ...item, unitCost: parseFloat(e.target.value) || 0 })
                              }
                              className="w-full px-1.5 py-1 border border-slate-200 rounded text-xs font-bold text-slate-900 bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-500 font-medium">
                              Total Cost (₹)
                            </label>
                            <div className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-900 truncate font-mono">
                              {formatCurrency(item.totalCost, 'INR')}
                            </div>
                          </div>
                        </div>

                        {/* Customer Facing Description */}
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                            Client Proposal Description (Public)
                          </label>
                          <textarea
                            rows={2}
                            value={item.customerDescription}
                            onChange={(e) =>
                              handleUpdateItem(itemIdx, { ...item, customerDescription: e.target.value })
                            }
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-800"
                          />
                        </div>

                        {/* Internal Notes & Optional Toggle */}
                        <div className="flex items-center justify-between gap-3 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Internal operational notes & supplier confirmation codes..."
                              value={item.internalNotes}
                              onChange={(e) => handleUpdateItem(itemIdx, { ...item, internalNotes: e.target.value })}
                              className="w-full px-2 py-1 text-slate-600 bg-transparent border-b border-transparent focus:border-slate-300 focus:outline-none text-[11px]"
                            />
                          </div>

                          <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer shrink-0">
                            <input
                              type="checkbox"
                              checked={item.isOptional}
                              onChange={(e) => handleUpdateItem(itemIdx, { ...item, isOptional: e.target.checked })}
                              className="rounded text-amber-500 focus:ring-amber-400"
                            />
                            Optional Add-on
                          </label>
                        </div>

                        {/* Mini Item Operational To-Dos List */}
                        {itemTasks.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-200/80 bg-slate-50/80 p-2.5 rounded-xl space-y-1.5 text-xs">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-0.5">
                              <span className="flex items-center gap-1">
                                <ListTodo className="w-3.5 h-3.5 text-indigo-600" /> Item Operational To-Dos ({itemTasks.filter(t => t.status === 'Completed').length}/{itemTasks.length})
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveRightTab('tasks');
                                  setTaskFilterCategory(item.id);
                                }}
                                className="text-[10px] text-indigo-600 hover:underline font-bold cursor-pointer"
                              >
                                View in To-Do Manager →
                              </button>
                            </div>
                            <div className="space-y-1">
                              {itemTasks.map((tsk) => (
                                <div
                                  key={tsk.id}
                                  className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleTaskStatus(tsk.id)}
                                      className="cursor-pointer text-slate-400 hover:text-emerald-600 transition"
                                    >
                                      {tsk.status === 'Completed' ? (
                                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                                      ) : (
                                        <Square className="w-4 h-4 text-slate-400" />
                                      )}
                                    </button>
                                    <span
                                      className={`font-medium text-xs ${
                                        tsk.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800'
                                      }`}
                                    >
                                      {tsk.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px]">
                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                                      {tsk.category}
                                    </span>
                                    <span className="text-slate-500 font-medium">{tsk.assignedTo}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">Select or add a day.</div>
          )}
        </div>

        {/* RIGHT PANEL INSPECTOR (4 Tabs - 3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
          {/* Tab Controls */}
          <div className="flex border-b border-slate-200 pb-1">
            <button
              onClick={() => setActiveRightTab('catalog')}
              className={`flex-1 py-1.5 text-xs font-bold text-center border-b-2 transition cursor-pointer ${
                activeRightTab === 'catalog'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Catalog
            </button>
            <button
              onClick={() => setActiveRightTab('pricing')}
              className={`flex-1 py-1.5 text-xs font-bold text-center border-b-2 transition cursor-pointer ${
                activeRightTab === 'pricing'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Pricing
            </button>
            <button
              onClick={() => setActiveRightTab('tasks')}
              className={`flex-1 py-1.5 text-xs font-bold text-center border-b-2 transition cursor-pointer relative ${
                activeRightTab === 'tasks'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              To-Dos
              {pendingTasksCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[9px] font-bold">
                  {pendingTasksCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveRightTab('validation')}
              className={`flex-1 py-1.5 text-xs font-bold text-center border-b-2 transition cursor-pointer relative ${
                activeRightTab === 'validation'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Alerts
              {validationAlerts.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[9px] font-bold">
                  {validationAlerts.length}
                </span>
              )}
            </button>
          </div>

          {/* TAB 1: MASTER SERVICE CATALOG INSPECTOR */}
          {activeRightTab === 'catalog' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search masters..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                {(['all', 'destination', 'hotel', 'activity', 'transport', 'meal', 'guide'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCatalogCategory(cat)}
                    className={`px-2 py-1 rounded font-semibold capitalize whitespace-nowrap cursor-pointer transition ${
                      catalogCategory === cat ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'destination' ? 'Destinations' : cat}
                  </button>
                ))}
              </div>

              {destinationSuccessMsg && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] font-medium flex items-center justify-between animate-fadeIn">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {destinationSuccessMsg}
                  </span>
                  <button
                    onClick={() => setDestinationSuccessMsg(null)}
                    className="text-emerald-500 hover:text-emerald-700 p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {/* Destinations */}
                {(catalogCategory === 'all' || catalogCategory === 'destination') && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pt-0.5 pb-1 px-1 border-b border-slate-100">
                      <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        Destinations ({destinationsList.length})
                      </span>
                      <button
                        onClick={() => {
                          setMasterModalItem(null);
                          setIsMasterModalOpen(true);
                        }}
                        className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1 cursor-pointer transition"
                      >
                        <Plus className="w-2.5 h-2.5" /> Add Destination
                      </button>
                    </div>

                    {destinationsList
                      .filter((dest) =>
                        dest.city.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                        dest.country.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                        (dest.tags && dest.tags.some((t) => t.toLowerCase().includes(catalogSearch.toLowerCase())))
                      )
                      .map((dest) => {
                        const isCurrentDayDest = selectedDay?.destination?.toLowerCase() === dest.city.toLowerCase();
                        const isInTour = (itinerary.destinations || []).some(
                          (d) => d.toLowerCase() === dest.city.toLowerCase()
                        );

                        return (
                          <div
                            key={dest.id}
                            className={`p-2.5 rounded-xl border text-xs space-y-1.5 transition ${
                              isCurrentDayDest
                                ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400'
                                : 'bg-slate-50 border-slate-200 hover:border-emerald-300'
                            }`}
                          >
                            {dest.imageUrl && (
                              <div className="relative h-20 w-full rounded-lg overflow-hidden mb-1">
                                <img
                                  src={dest.imageUrl}
                                  alt={dest.city}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
                                <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-white">
                                  <span className="font-bold text-xs drop-shadow-sm flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-emerald-400" /> {dest.city}
                                  </span>
                                  <span className="text-[10px] text-slate-200 drop-shadow-sm">{dest.country}</span>
                                </div>
                              </div>
                            )}

                            {!dest.imageUrl && (
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {dest.city}
                                  </span>
                                  <span className="text-[11px] text-slate-500">{dest.country}</span>
                                </div>
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                                  Destination
                                </span>
                              </div>
                            )}

                            {dest.description && (
                              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                                {dest.description}
                              </p>
                            )}

                            {dest.highlights && dest.highlights.length > 0 && (
                              <div className="text-[10px] text-slate-600 bg-white/80 p-1.5 rounded-lg border border-slate-200/70">
                                <span className="font-semibold text-slate-700">Highlights: </span>
                                {dest.highlights.slice(0, 3).join(' • ')}
                              </div>
                            )}

                            {dest.tags && dest.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {dest.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-[9px] bg-slate-200/80 text-slate-600 px-1.5 py-0.2 rounded font-medium"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Status tags */}
                            <div className="flex items-center gap-1 pt-0.5">
                              {isCurrentDayDest && (
                                <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                  <Check className="w-2.5 h-2.5" /> Day {selectedDay?.dayNumber} Destination
                                </span>
                              )}
                              {isInTour && !isCurrentDayDest && (
                                <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                  <Check className="w-2.5 h-2.5" /> In Tour Itinerary
                                </span>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="space-y-1 pt-1">
                              <button
                                onClick={() => {
                                  const updatedDays = itinerary.days.map((d, i) => {
                                    if (i === selectedDayIndex) {
                                      const newTitle =
                                        d.title.startsWith('Day ') && d.title.includes('Schedule')
                                          ? `Day ${d.dayNumber}: Explore ${dest.city}`
                                          : d.title;
                                      return { ...d, destination: dest.city, title: newTitle };
                                    }
                                    return d;
                                  });
                                  const updatedDestinations = (itinerary.destinations || []).includes(dest.city)
                                    ? itinerary.destinations
                                    : [...(itinerary.destinations || []), dest.city];

                                  handleTriggerSave({
                                    ...itinerary,
                                    days: updatedDays,
                                    destinations: updatedDestinations,
                                  });
                                  setDestinationSuccessMsg(`Set ${dest.city} as Day ${selectedDay?.dayNumber} destination!`);
                                  setTimeout(() => setDestinationSuccessMsg(null), 2500);
                                }}
                                className={`w-full py-1 font-bold text-[11px] rounded flex items-center justify-center gap-1 cursor-pointer transition ${
                                  isCurrentDayDest
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                                }`}
                              >
                                <MapPin className="w-3 h-3" />
                                {isCurrentDayDest
                                  ? `✓ Active Day ${selectedDay?.dayNumber} Destination`
                                  : `Set as Day ${selectedDay?.dayNumber} Destination`}
                              </button>

                              <div className="grid grid-cols-2 gap-1">
                                <button
                                  onClick={() => {
                                    handleAddItemToDay({
                                      type: 'activity',
                                      title: `${dest.city} Highlights & Sightseeing Tour`,
                                      masterId: dest.id,
                                      supplierName: 'Local Destination Provider',
                                      unitCost: 0,
                                      rateBasis: 'per_person',
                                      customerDescription: `${dest.description} Highlights included: ${(
                                        dest.highlights || []
                                      ).join(', ')}.`,
                                      pickupLocation: 'Hotel Lobby',
                                      dropoffLocation: `${dest.city} Center`,
                                      imageUrl: dest.imageUrl,
                                    });
                                    setDestinationSuccessMsg(`Added ${dest.city} Highlights to Day ${selectedDay?.dayNumber}!`);
                                    setTimeout(() => setDestinationSuccessMsg(null), 2500);
                                  }}
                                  className="py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[10px] rounded border border-slate-200 flex items-center justify-center gap-1 cursor-pointer transition"
                                  title="Add sightseeing highlight activity to this day"
                                >
                                  <Sparkles className="w-2.5 h-2.5 text-amber-500" /> + Add Highlights
                                </button>

                                <button
                                  onClick={() => {
                                    const current = itinerary.destinations || [];
                                    const exists = current.some((c) => c.toLowerCase() === dest.city.toLowerCase());
                                    const next = exists
                                      ? current.filter((c) => c.toLowerCase() !== dest.city.toLowerCase())
                                      : [...current, dest.city];
                                    handleTriggerSave({ ...itinerary, destinations: next });
                                    setDestinationSuccessMsg(
                                      exists ? `Removed ${dest.city} from tour` : `Added ${dest.city} to tour destinations!`
                                    );
                                    setTimeout(() => setDestinationSuccessMsg(null), 2000);
                                  }}
                                  className="py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[10px] rounded border border-slate-200 flex items-center justify-center gap-1 cursor-pointer transition"
                                >
                                  {isInTour ? 'Remove from Tour' : '+ Add to Tour'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* Hotels */}
                {(catalogCategory === 'all' || catalogCategory === 'hotel') &&
                  masterHotels
                    .filter((h) => h.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                    .map((hotel) => (
                      <div key={hotel.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 hover:border-indigo-400 transition">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-900">{hotel.name}</span>
                          <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded">
                            {hotel.categoryStars}★ Hotel
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{hotel.destinationName} • ₹{hotel.roomTypes[0]?.defaultCost}/night</p>
                        <button
                          onClick={() =>
                            handleAddItemToDay({
                              type: 'hotel',
                              title: `${hotel.name} (${hotel.roomTypes[0]?.name || 'Standard Room'})`,
                              masterId: hotel.id,
                              supplierId: hotel.supplierId,
                              supplierName: hotel.supplierName,
                              unitCost: hotel.roomTypes[0]?.defaultCost || 4000,
                              rateBasis: 'per_room_night',
                              customerDescription: `Overnight stay at ${hotel.name}. Includes daily breakfast and resort amenities.`,
                            })
                          }
                          className="w-full mt-1 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] rounded flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Hotel to Day {selectedDay?.dayNumber}
                        </button>
                      </div>
                    ))}

                {/* Activities */}
                {(catalogCategory === 'all' || catalogCategory === 'activity') &&
                  masterActivities
                    .filter((a) => a.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                    .map((act) => (
                      <div key={act.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 hover:border-indigo-400 transition">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-900">{act.name}</span>
                          <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.2 rounded">
                            Activity
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{act.destinationName} • ₹{act.defaultCost} / pax</p>
                        <button
                          onClick={() =>
                            handleAddItemToDay({
                              type: 'activity',
                              title: act.name,
                              masterId: act.id,
                              supplierId: act.supplierId,
                              supplierName: act.supplierName,
                              unitCost: act.defaultCost,
                              rateBasis: act.rateBasis,
                              customerDescription: act.description,
                            })
                          }
                          className="w-full mt-1 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] rounded flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Activity to Day {selectedDay?.dayNumber}
                        </button>
                      </div>
                    ))}

                {/* Transport */}
                {(catalogCategory === 'all' || catalogCategory === 'transport') &&
                  masterTransport
                    .filter((t) => t.route.toLowerCase().includes(catalogSearch.toLowerCase()))
                    .map((tr) => (
                      <div key={tr.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 hover:border-indigo-400 transition">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-900">{tr.type} - {tr.route}</span>
                          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded">
                            Transport
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">₹{tr.defaultCost} / vehicle</p>
                        <button
                          onClick={() =>
                            handleAddItemToDay({
                              type: 'transport',
                              title: `${tr.type} Transfer: ${tr.route}`,
                              masterId: tr.id,
                              supplierId: tr.supplierId,
                              supplierName: tr.supplierName,
                              unitCost: tr.defaultCost,
                              rateBasis: tr.rateBasis,
                              customerDescription: `Private transfer in a luxury ${tr.type} with professional chauffeur.`,
                            })
                          }
                          className="w-full mt-1 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] rounded flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Transport to Day {selectedDay?.dayNumber}
                        </button>
                      </div>
                    ))}

                {/* Meals */}
                {(catalogCategory === 'all' || catalogCategory === 'meal') &&
                  masterMeals
                    .filter(
                      (m) =>
                        m.venue.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                        m.type.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                        (m.menuHighlights && m.menuHighlights.toLowerCase().includes(catalogSearch.toLowerCase()))
                    )
                    .map((meal) => (
                      <div key={meal.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 hover:border-indigo-400 transition">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-900">{meal.type} - {meal.venue}</span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                            Meal
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{meal.menuHighlights || 'Fine Dining'} • ₹{meal.defaultCost} / {meal.rateBasis ? meal.rateBasis.replace('_', ' ') : 'person'}</p>
                        <button
                          onClick={() =>
                            handleAddItemToDay({
                              type: 'meal',
                              title: `${meal.type}: ${meal.venue}`,
                              masterId: meal.id,
                              supplierId: meal.supplierId,
                              supplierName: meal.supplierName,
                              unitCost: meal.defaultCost,
                              rateBasis: meal.rateBasis || 'per_person',
                              customerDescription: `${meal.type} dining experience at ${meal.venue}. Highlights: ${meal.menuHighlights || 'Curated culinary menu'}.`,
                            })
                          }
                          className="w-full mt-1 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] rounded flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Meal to Day {selectedDay?.dayNumber}
                        </button>
                      </div>
                    ))}

                {/* Guides */}
                {(catalogCategory === 'all' || catalogCategory === 'guide') &&
                  masterGuides
                    .filter(
                      (g) =>
                        g.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                        g.category.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                        g.language.toLowerCase().includes(catalogSearch.toLowerCase())
                    )
                    .map((guide) => (
                      <div key={guide.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 hover:border-indigo-400 transition">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-900">{guide.name}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                            Guide ({guide.language})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{guide.category} • ₹{guide.defaultCost} / {guide.rateBasis ? guide.rateBasis.replace('_', ' ') : 'group'}</p>
                        <button
                          onClick={() =>
                            handleAddItemToDay({
                              type: 'guide',
                              title: `${guide.category} (${guide.language}) - ${guide.name}`,
                              masterId: guide.id,
                              supplierId: guide.supplierId,
                              supplierName: guide.name,
                              unitCost: guide.defaultCost,
                              rateBasis: guide.rateBasis || 'per_group',
                              customerDescription: `Professional ${guide.language}-speaking ${guide.category} escort and guided tour.`,
                            })
                          }
                          className="w-full mt-1 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] rounded flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Guide to Day {selectedDay?.dayNumber}
                        </button>
                      </div>
                    ))}
              </div>
            </div>
          )}

          {/* TAB 2: LIVE PRICING & MARGIN ENGINE */}
          {activeRightTab === 'pricing' && (
            <div className="space-y-4 text-xs">
              {/* Commercial Summary Hero Box */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-3 shadow-md border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Commercial Overview
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-md border border-indigo-500/30">
                    INR (₹)
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Supplier Cost:</span>
                    <span className="font-bold text-slate-200 font-mono">
                      {formatCurrency(itinerary.pricing.totalCost, 'INR')}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal Selling:</span>
                    <span className="font-bold text-slate-200 font-mono">
                      {formatCurrency(itinerary.pricing.subtotalSellingPrice, 'INR')}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline text-indigo-400 font-bold border-t border-slate-800 pt-2.5 text-base">
                    <span>Final Selling Price:</span>
                    <span className="font-extrabold text-white text-lg font-mono">
                      {formatCurrency(itinerary.pricing.finalSellingPrice, 'INR')}
                    </span>
                  </div>

                  <div className="flex justify-between text-emerald-400 font-semibold text-xs pt-1">
                    <span>Gross Profit:</span>
                    <span className="font-mono">
                      {formatCurrency(itinerary.pricing.grossProfit, 'INR')} (
                      {itinerary.pricing.targetMarginPercent}% Margin)
                    </span>
                  </div>
                </div>
              </div>

              {/* COMMERCIAL MARGINS & DISCOUNTS SECTION */}
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-800 text-xs">Margins & Taxes</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-slate-700 font-semibold">Markup Percentage (%)</label>
                    <div className="flex items-center gap-1">
                      {[15, 20, 25, 30].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => handlePricingChange('markupValue', pct)}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold transition cursor-pointer ${
                            itinerary.pricing.markupValue === pct
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="number"
                    value={itinerary.pricing.markupValue}
                    onChange={(e) => handlePricingChange('markupValue', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Calculates Selling = Cost + (Cost × Markup%)
                  </p>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Discount (%)</label>
                  <input
                    type="number"
                    value={itinerary.pricing.discountValue}
                    onChange={(e) => handlePricingChange('discountValue', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs font-bold bg-white text-red-600"
                  />
                  {itinerary.pricing.discountValue > 10 && (
                    <span className="text-[10px] text-red-600 font-bold block mt-1">
                      ⚠️ Discount &gt; 10% requires Sales Manager approval.
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tax Rate (VAT / GST %)</label>
                  <input
                    type="number"
                    value={itinerary.pricing.taxRatePercent || 0}
                    onChange={(e) => handlePricingChange('taxRatePercent', parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                  />
                </div>
              </div>

              {/* PER PAX DISTRIBUTION */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 text-[11px] block uppercase tracking-wider">
                  Per Pax Distribution (INR ₹)
                </span>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Adult Price:</span>
                    <strong className="text-slate-900 font-mono">
                      {formatCurrency(itinerary.pricing.perAdultPrice, 'INR')} / adult
                    </strong>
                  </div>
                  {itinerary.children > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Child Price:</span>
                      <strong className="text-slate-900 font-mono">
                        {formatCurrency(itinerary.pricing.perChildPrice, 'INR')} / child
                      </strong>
                    </div>
                  )}
                  {itinerary.infants > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Infant Price:</span>
                      <strong className="text-slate-900 font-mono">
                        {formatCurrency(itinerary.pricing.perInfantPrice, 'INR')} / infant
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INTERNAL TASK & TO-DO MANAGEMENT MODULE */}
          {activeRightTab === 'tasks' && (
            <div className="space-y-3.5 text-xs">
              {/* Header & Quick Action */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <ListTodo className="w-4 h-4 text-indigo-600" /> Operational To-Dos
                  </h4>
                  <p className="text-[11px] text-slate-500">Track internal requests, vouchers & confirmations</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingTask(true)}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> New Task
                </button>
              </div>

              {/* Quick Auto-Generator Helper */}
              <div className="bg-indigo-50/80 p-2.5 rounded-xl border border-indigo-100 flex items-center justify-between gap-2">
                <div className="text-[11px] text-indigo-900 font-medium leading-tight">
                  Auto-generate standard booking requests & voucher tasks for all itinerary services?
                </div>
                <button
                  type="button"
                  onClick={handleAutoGenerateTasks}
                  className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-md shrink-0 cursor-pointer transition shadow-2xs"
                >
                  ⚡ Auto-Generate
                </button>
              </div>

              {/* Task Statistics Bar */}
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="block text-[10px] text-slate-500 font-medium">Total</span>
                  <span className="text-xs font-bold text-slate-800">{currentTasks.length}</span>
                </div>
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="block text-[10px] text-amber-700 font-medium">Pending</span>
                  <span className="text-xs font-bold text-amber-800">{pendingTasksCount}</span>
                </div>
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <span className="block text-[10px] text-emerald-700 font-medium">Done</span>
                  <span className="text-xs font-bold text-emerald-800">
                    {currentTasks.filter((t) => t.status === 'Completed').length}
                  </span>
                </div>
              </div>

              {/* Filters */}
              <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <select
                    value={taskFilterCategory}
                    onChange={(e) => setTaskFilterCategory(e.target.value)}
                    className="w-full px-2 py-1 border border-slate-200 rounded text-[11px] bg-white font-medium"
                  >
                    <option value="all">All Items & Categories</option>
                    <optgroup label="Categories">
                      <option value="Booking">Category: Booking</option>
                      <option value="Confirmation">Category: Confirmation</option>
                      <option value="Customer Communication">Category: Customer Communication</option>
                      <option value="Payment">Category: Payment</option>
                      <option value="Voucher">Category: Voucher</option>
                    </optgroup>
                    <optgroup label="Itinerary Day Items">
                      {itinerary.days.map((d) =>
                        d.items.map((it) => (
                          <option key={it.id} value={it.id}>
                            Day {d.dayNumber}: {it.title}
                          </option>
                        ))
                      )}
                    </optgroup>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <select
                    value={taskFilterPriority}
                    onChange={(e) => setTaskFilterPriority(e.target.value)}
                    className="w-1/2 px-2 py-1 border border-slate-200 rounded text-[11px] bg-white font-medium"
                  >
                    <option value="all">All Priorities</option>
                    <option value="High">High / Urgent</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>

                  <select
                    value={taskFilterStatus}
                    onChange={(e) => setTaskFilterStatus(e.target.value)}
                    className="w-1/2 px-2 py-1 border border-slate-200 rounded text-[11px] bg-white font-medium"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Pending">Pending Only</option>
                    <option value="Completed">Completed Only</option>
                  </select>
                </div>
              </div>

              {/* Task List */}
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {filteredTasks.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                    <ListTodo className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-600">No matching tasks found</p>
                    <p className="text-[11px]">Click "New Task" or "Auto-Generate" to create operational to-dos.</p>
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3 rounded-xl border text-xs transition space-y-2 ${
                        task.status === 'Completed'
                          ? 'bg-slate-50 border-slate-200 opacity-75'
                          : task.priority === 'Urgent' || task.priority === 'High'
                          ? 'bg-amber-50/40 border-amber-200'
                          : 'bg-white border-slate-200 shadow-2xs'
                      }`}
                    >
                      {/* Top Row: Checkbox, Title & Delete */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleTaskStatus(task.id)}
                            className="mt-0.5 cursor-pointer text-slate-400 hover:text-emerald-600 transition shrink-0"
                          >
                            {task.status === 'Completed' ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                          <div>
                            <span
                              className={`font-bold block leading-snug ${
                                task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800'
                              }`}
                            >
                              {task.title}
                            </span>
                            {task.itemTitle && (
                              <span className="text-[10px] text-indigo-600 font-semibold block mt-0.5">
                                📌 Day {task.dayNumber}: {task.itemTitle}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-slate-300 hover:text-red-600 cursor-pointer transition shrink-0"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Notes if available */}
                      {task.notes && (
                        <p className="text-[11px] text-slate-500 bg-slate-100/70 p-1.5 rounded-lg italic">
                          "{task.notes}"
                        </p>
                      )}

                      {/* Metadata Row */}
                      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                            {task.category}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold ${
                              task.priority === 'Urgent' || task.priority === 'High'
                                ? 'bg-red-100 text-red-700'
                                : task.priority === 'Medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span>👤 {task.assignedTo}</span>
                          <span>📅 {task.dueDate}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: VALIDATIONS & ALERTS */}
          {activeRightTab === 'validation' && (
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 text-xs">Itinerary Health Checks</h4>

              {validationAlerts.length === 0 ? (
                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                  <p className="font-bold">All validations passed!</p>
                  <p className="text-[11px] text-emerald-700">No date conflicts, missing rates, or occupancy errors.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {validationAlerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                        alert.type === 'error'
                          ? 'bg-red-50 border-red-200 text-red-800'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        {alert.dayNumber && <strong>Day {alert.dayNumber}: </strong>}
                        {alert.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ACTIVITY / SERVICE EDITOR MODAL */}
      {editingItemIdx !== null && editingItemData !== null && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    Activity & Service Editor
                    <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-md">
                      Day {selectedDay?.dayNumber}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Customize commercial pricing, activity description, timing, and operational supplier rules
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingItemIdx(null);
                  setEditingItemData(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Activity Preset Fillers */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Wand2 className="w-3.5 h-3.5 text-indigo-600" /> Quick Preset Ideas (Click to Auto-fill):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  {
                    title: 'Havelock Island Coral Reef Scuba Diving',
                    type: 'activity' as ItemType,
                    basis: 'per_person' as RateBasis,
                    cost: 4500,
                    desc: 'Guided scuba diving session at Nemo Reef with certified PADI dive master, underwater photography, and complete equipment.',
                  },
                  {
                    title: 'Radhanagar Sunset Beach Lounge Experience',
                    type: 'activity' as ItemType,
                    basis: 'per_person' as RateBasis,
                    cost: 1800,
                    desc: 'Relaxing afternoon at Asia’s best beach with complimentary beach chairs, tender coconut drinks, and sunset views.',
                  },
                  {
                    title: 'Elephant Beach Speedboat & Sea Walk Adventure',
                    type: 'activity' as ItemType,
                    basis: 'per_person' as RateBasis,
                    cost: 3800,
                    desc: '15-minute high-speed boat ride to Elephant Beach followed by a 30-minute underwater Sea Walk excursion with sea helmet.',
                  },
                  {
                    title: 'Baratang Island Mangrove Boat & Lime Caves Trek',
                    type: 'activity' as ItemType,
                    basis: 'per_person' as RateBasis,
                    cost: 3200,
                    desc: 'Boat safari through dense mangrove creeks followed by a guided nature walk into prehistoric limestone caves.',
                  },
                  {
                    title: 'Cellular Jail Light & Sound Show + Heritage Tour',
                    type: 'activity' as ItemType,
                    basis: 'per_person' as RateBasis,
                    cost: 1200,
                    desc: 'Entry ticket and reserved seating for the iconic Cellular Jail historical sound & light laser show in Port Blair.',
                  },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setEditingItemData((prev) =>
                        prev
                          ? {
                              ...prev,
                              title: preset.title,
                              type: preset.type,
                              rateBasis: preset.basis,
                              unitCost: preset.cost,
                              customerDescription: preset.desc,
                            }
                          : null
                      );
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-slate-700 font-medium transition cursor-pointer text-[11px]"
                  >
                    + {preset.title.split(' ')[0]} {preset.title.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Service / Activity Title *</label>
                  <input
                    type="text"
                    value={editingItemData.title}
                    onChange={(e) => setEditingItemData({ ...editingItemData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Service Type */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category Type *</label>
                  <select
                    value={editingItemData.type}
                    onChange={(e) => setEditingItemData({ ...editingItemData, type: e.target.value as ItemType })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold bg-white"
                  >
                    <option value="activity">Activity / Excursion</option>
                    <option value="hotel">Hotel / Accommodation</option>
                    <option value="transport">Transport / Transfer</option>
                    <option value="meal">Meal / Dining</option>
                    <option value="guide">Guide Service</option>
                    <option value="other">Other Extra</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {/* Start & End Time */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Start Time</label>
                  <input
                    type="time"
                    value={editingItemData.startTime || '09:00'}
                    onChange={(e) => setEditingItemData({ ...editingItemData, startTime: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">End Time</label>
                  <input
                    type="time"
                    value={editingItemData.endTime || '12:00'}
                    onChange={(e) => setEditingItemData({ ...editingItemData, endTime: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                {/* Rate Basis */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Rate Basis</label>
                  <select
                    value={editingItemData.rateBasis}
                    onChange={(e) =>
                      setEditingItemData({ ...editingItemData, rateBasis: e.target.value as RateBasis })
                    }
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white font-medium"
                  >
                    <option value="per_person">Per Person</option>
                    <option value="per_adult">Per Adult</option>
                    <option value="per_child">Per Child</option>
                    <option value="per_room_night">Per Room / Night</option>
                    <option value="per_vehicle">Per Vehicle</option>
                    <option value="per_group">Per Group</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>

                {/* Unit Cost in INR */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    value={editingItemData.unitCost}
                    onChange={(e) =>
                      setEditingItemData({ ...editingItemData, unitCost: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Supplier Name */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Supplier / Operator Name</label>
                  <input
                    type="text"
                    value={editingItemData.supplierName || 'Andaman Watersports DMC'}
                    onChange={(e) => setEditingItemData({ ...editingItemData, supplierName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Confirmation Status</label>
                  <select
                    value={editingItemData.confirmationStatus || 'Pending'}
                    onChange={(e) => setEditingItemData({ ...editingItemData, confirmationStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold text-emerald-800"
                  >
                    <option value="Pending">Pending Booking</option>
                    <option value="Confirmed">Confirmed with Supplier</option>
                    <option value="Voucher Issued">Voucher Issued</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
              </div>

              {/* Proposal Customer Description */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Public Client Proposal Description (Appears on PDF Export)
                </label>
                <textarea
                  rows={3}
                  value={editingItemData.customerDescription}
                  onChange={(e) => setEditingItemData({ ...editingItemData, customerDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl leading-relaxed text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Internal Notes & Optional */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-0.5">Internal Operations & Driver Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Driver contact: +91-9876543210, Vessel name: SeaLink Express"
                    value={editingItemData.internalNotes || ''}
                    onChange={(e) => setEditingItemData({ ...editingItemData, internalNotes: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-700 bg-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4 sm:pt-0 justify-end">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer bg-white px-3 py-2 rounded-lg border border-slate-200">
                    <input
                      type="checkbox"
                      checked={editingItemData.isOptional || false}
                      onChange={(e) => setEditingItemData({ ...editingItemData, isOptional: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    Optional Add-on
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                Calculated Item Total: <strong className="text-slate-900 font-mono text-sm">₹{editingItemData.totalCost?.toLocaleString() || editingItemData.unitCost?.toLocaleString()}</strong>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItemIdx(null);
                    setEditingItemData(null);
                  }}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateItem(editingItemIdx, editingItemData);
                    setEditingItemIdx(null);
                    setEditingItemData(null);
                  }}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 cursor-pointer transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save Activity Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW TASK CREATION MODAL */}
      {isAddingTask && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20">
                  <ListTodo className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Add Operational To-Do / Task</h3>
                  <p className="text-[11px] text-slate-500">Track internal action items for travel consultants & ops executives</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddingTask(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              {/* Preset Buttons */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                  Quick Action Presets (Click to autofill):
                </span>
                <div className="flex flex-wrap gap-1">
                  {[
                    { title: 'Send booking request to hotel', cat: 'Booking' as TaskCategory, priority: 'High' as TaskPriority },
                    { title: 'Confirm flight details & driver pickup', cat: 'Confirmation' as TaskCategory, priority: 'High' as TaskPriority },
                    { title: 'Verify dietary requirements with caterer', cat: 'Customer Communication' as TaskCategory, priority: 'Medium' as TaskPriority },
                    { title: 'Issue supplier vouchers & dispatch orders', cat: 'Voucher' as TaskCategory, priority: 'Medium' as TaskPriority },
                    { title: 'Collect deposit payment & confirm receipt', cat: 'Payment' as TaskCategory, priority: 'High' as TaskPriority },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setNewTaskTitle(preset.title);
                        setNewTaskCategory(preset.cat);
                        setNewTaskPriority(preset.priority);
                      }}
                      className="px-2 py-0.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded text-[10px] font-medium text-slate-700 transition cursor-pointer"
                    >
                      + {preset.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task Title */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Send booking request to hotel / driver"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Link to Itinerary Item */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Associate with Itinerary Item</label>
                <select
                  value={newTaskItemId}
                  onChange={(e) => setNewTaskItemId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium"
                >
                  <option value="none">-- General Itinerary Task (No specific item) --</option>
                  {itinerary.days.map((day) =>
                    day.items.map((item) => (
                      <option key={item.id} value={item.id}>
                        Day {day.dayNumber}: {item.title} ({item.type})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Category */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as TaskCategory)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium"
                  >
                    <option value="Booking">Booking</option>
                    <option value="Confirmation">Confirmation</option>
                    <option value="Customer Communication">Customer Communication</option>
                    <option value="Payment">Payment</option>
                    <option value="Voucher">Voucher</option>
                    <option value="General">General</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Assigned To */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Assignee</label>
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium"
                  >
                    <option value="Operations Executive">Operations Executive</option>
                    <option value="Travel Consultant">Travel Consultant ({itinerary.consultantName})</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="Finance User">Finance User</option>
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium"
                  />
                </div>
              </div>

              {/* Operational Notes */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Operational Notes / Context</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Include voucher reference codes or special dietary requests..."
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl leading-relaxed"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 cursor-pointer transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Create To-Do
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Master Destination Modal */}
      {isMasterModalOpen && (
        <MasterEditModal
          isOpen={isMasterModalOpen}
          onClose={() => setIsMasterModalOpen(false)}
          masterType="destination"
          item={masterModalItem}
          destinations={destinationsList}
          suppliers={masterSuppliers}
          onSave={handleSaveMasterItem}
        />
      )}
    </div>
  );
};
