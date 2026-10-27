export type UserRole = 
  | 'Administrator'
  | 'Travel Consultant'
  | 'Operations Executive'
  | 'Product Manager'
  | 'Sales Manager'
  | 'Finance User'
  | 'Read-only Viewer';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  active: boolean;
  phone?: string;
  department?: string;
  lastLogin?: string;
  createdAt?: string;
}

export type CustomerType = 'Individual' | 'Family' | 'Corporate' | 'Agent';

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  email: string;
  phone: string;
  nationality: string;
  language: string;
  preferences: string;
  dietaryNotes?: string;
  accessibilityNeeds?: string;
  internalNotes?: string;
  companyName?: string;
  createdAt: string;
}

export interface Enquiry {
  id: string; // ENQ-2026-000001
  customerId: string;
  customerName: string;
  consultantId: string;
  consultantName: string;
  destination: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  adults: number;
  children: number;
  infants: number;
  roomRequirements: {
    singleRooms: number;
    doubleTwinRooms: number;
    tripleRooms: number;
    extraBeds: number;
  };
  budgetCurrency: string;
  budgetAmount: number;
  interests: string[];
  deadline: string;
  source: string;
  status: 'Open' | 'Quoted' | 'Converted' | 'Lost';
  createdAt: string;
}

export type MasterType = 
  | 'destination' 
  | 'hotel' 
  | 'activity' 
  | 'transport' 
  | 'meal' 
  | 'guide' 
  | 'supplier' 
  | 'rate' 
  | 'tax' 
  | 'currency' 
  | 'policy';

export interface DestinationMaster {
  id: string;
  country: string;
  city: string;
  description: string;
  highlights: string[];
  imageUrl: string;
  tags: string[];
  active: boolean;
}

export interface HotelRoomType {
  id: string;
  name: string;
  capacity: number;
  defaultCost: number;
}

export interface HotelMaster {
  id: string;
  destinationId: string;
  destinationName: string;
  name: string;
  categoryStars: number;
  address: string;
  roomTypes: HotelRoomType[];
  mealPlans: ('BB' | 'HB' | 'FB' | 'AI' | 'RO')[];
  amenities: string[];
  checkInTime: string;
  checkOutTime: string;
  supplierId: string;
  supplierName: string;
  imageUrl: string;
  policies: string;
  active: boolean;
}

export type RateBasis = 
  | 'per_person'
  | 'per_adult'
  | 'per_child'
  | 'per_infant'
  | 'per_room_night'
  | 'per_vehicle'
  | 'per_group'
  | 'fixed';

export interface ActivityMaster {
  id: string;
  destinationId: string;
  destinationName: string;
  name: string;
  durationHours: number;
  scheduleTiming: string;
  inclusions: string[];
  exclusions: string[];
  ageLimits?: string;
  supplierId: string;
  supplierName: string;
  imageUrl: string;
  defaultCost: number;
  rateBasis: RateBasis;
  description: string;
  active: boolean;
}

export interface TransportMaster {
  id: string;
  type: 'Sedan' | 'SUV' | 'Minivan' | 'Luxury Coach' | 'Private Helicopter' | 'Speedboat';
  route: string;
  capacity: number;
  durationHours: number;
  rateBasis: RateBasis;
  supplierId: string;
  supplierName: string;
  defaultCost: number;
  active: boolean;
}

export interface MealMaster {
  id: string;
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Gourmet Cruise' | 'Traditional Feast';
  venue: string;
  menuHighlights: string;
  rateBasis: RateBasis;
  supplierId: string;
  supplierName: string;
  defaultCost: number;
  active: boolean;
}

export interface GuideMaster {
  id: string;
  name: string;
  language: string;
  category: 'Local City Guide' | 'Driver-Guide' | 'Tour Manager' | 'Specialist Naturalist';
  destinationId: string;
  rateBasis: RateBasis;
  supplierId: string;
  defaultCost: number;
  active: boolean;
}

export interface SupplierMaster {
  id: string;
  legalName: string;
  contactPerson: string;
  email: string;
  phone: string;
  currency: string;
  taxNumber: string;
  paymentTerms: string;
  status: 'Active' | 'Under Review' | 'Suspended';
}

export interface TaxMaster {
  id: string;
  name: string;
  ratePercent: number;
  inclusive: boolean;
  applicableCategories: string[];
}

export interface CurrencyMaster {
  id: string;
  code: string;
  symbol: string;
  exchangeRateToBase: number; // 1 Base (e.g. USD) = X Currency
  decimalPlaces: number;
}

export interface PolicyMaster {
  id: string;
  title: string;
  type: 'Cancellation' | 'Child Policy' | 'Payment Terms' | 'Visa & Entry' | 'General Terms';
  content: string;
}

export type ItemType = 'hotel' | 'activity' | 'transport' | 'meal' | 'guide' | 'free_time' | 'custom';

export interface ItineraryItem {
  id: string;
  dayId: string;
  type: ItemType;
  title: string;
  masterId?: string;
  supplierId?: string;
  supplierName?: string;
  startTime?: string;
  endTime?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  customerDescription: string;
  internalNotes: string;
  imageUrl?: string;
  rateBasis: RateBasis;
  unitCost: number;
  quantity: number;
  totalCost: number;
  isOptional: boolean; // Optional add-on, excluded from default package total
  confirmationStatus?: 'Pending' | 'Confirmed' | 'Voucher Issued' | 'Cancelled';
  confirmationReference?: string;
  tasks?: ItineraryTask[];
}

export type TaskCategory = 
  | 'Booking' 
  | 'Confirmation' 
  | 'Customer Communication' 
  | 'Payment' 
  | 'Voucher' 
  | 'General';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface ItineraryTask {
  id: string;
  itineraryId: string;
  itemId?: string;
  itemTitle?: string;
  dayNumber?: number;
  title: string;
  category: TaskCategory;
  assignedTo: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ItineraryDay {
  id: string;
  dayNumber: number;
  date: string; // YYYY-MM-DD
  title: string;
  destination: string;
  summaryNote?: string;
  items: ItineraryItem[];
}

export type ItineraryStatus = 
  | 'Draft'
  | 'Internal Review'
  | 'Approved'
  | 'Sent'
  | 'Revised'
  | 'Won'
  | 'Lost'
  | 'Confirmed'
  | 'In Operation'
  | 'Completed'
  | 'Cancelled'
  | 'Archived';

export interface ItineraryPricing {
  baseCurrency: string;
  sellingCurrency: string;
  exchangeRate: number;
  totalCost: number;
  markupType: 'percentage' | 'fixed';
  markupValue: number; // e.g. 20 for 20% markup
  targetMarginPercent?: number; // calculated or specified
  grossProfit: number;
  subtotalSellingPrice: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  taxId?: string;
  taxRatePercent: number;
  taxInclusive: boolean;
  taxAmount: number;
  finalSellingPrice: number;
  perAdultPrice: number;
  perChildPrice: number;
  perInfantPrice: number;
  perPersonAveragePrice: number;
}

export interface ItineraryRevision {
  revisionNumber: number; // 1, 2, 3...
  revisionCode: string; // ITN-2026-000001-R01
  createdAt: string;
  createdBy: string;
  summaryOfChanges: string;
  totalPrice: number;
  status: ItineraryStatus;
}

export interface Itinerary {
  id: string; // UUID internal
  itineraryNumber: string; // ITN-2026-000001
  enquiryId?: string;
  title: string;
  customerId: string;
  customerName: string;
  consultantId: string;
  consultantName: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  adults: number;
  children: number;
  infants: number;
  roomAllocations: {
    single: number;
    doubleTwin: number;
    triple: number;
    extraBeds: number;
  };
  destinations: string[];
  status: ItineraryStatus;
  currentRevision: number;
  revisions: ItineraryRevision[];
  days: ItineraryDay[];
  pricing: ItineraryPricing;
  inclusions: string[];
  exclusions: string[];
  policies: string[];
  tasks?: ItineraryTask[];
  requiresApproval: boolean;
  approvalReason?: string;
  approvalStatus?: 'Pending' | 'Approved' | 'Rejected';
  approverComments?: string;
  isTemplate?: boolean;
  templateCategory?: string;
  tags?: string[];
  updatedAt: string;
  createdAt: string;
}

export interface ApprovalRequest {
  id: string;
  itineraryId: string;
  itineraryNumber: string;
  title: string;
  customerName: string;
  consultantName: string;
  totalCost: number;
  sellingPrice: number;
  discountPercent: number;
  marginPercent: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  comments?: string;
  requestedAt: string;
  decidedAt?: string;
  decidedBy?: string;
}

export interface DocumentExport {
  id: string;
  itineraryNumber: string;
  revisionCode: string;
  documentType: 'Customer Proposal' | 'Brief Proposal' | 'Internal Costing Sheet' | 'Operations Sheet' | 'Service Voucher' | 'Rooming List';
  issuedAt: string;
  issuedBy: string;
  fileName: string;
  format: 'PDF' | 'DOCX';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  beforeValue?: string;
  afterValue?: string;
}

export interface CompanySettings {
  companyName: string;
  legalName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  taxRegistrationNumber: string;
  defaultBaseCurrency: string;
  approvalDiscountThreshold: number; // e.g. 10%
  approvalMarginThreshold: number; // e.g. 15%
  defaultInclusions: string[];
  defaultExclusions: string[];
  defaultTerms: string;
}
