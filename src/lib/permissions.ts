import { UserRole } from '../types';

export interface RolePermissionConfig {
  role: UserRole;
  title: string;
  badge: {
    bg: string;
    text: string;
    border: string;
  };
  description: string;
  allowedTabs: string[];
  defaultTab: string;
  capabilities: string[];
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissionConfig> = {
  'Administrator': {
    role: 'Administrator',
    title: 'System & Executive Administrator',
    badge: {
      bg: 'bg-purple-100 dark:bg-purple-950/50',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-300 dark:border-purple-800',
    },
    description: '',
    allowedTabs: [
      'dashboard',
      'customers',
      'itineraries',
      'builder',
      'approvals',
      'operations',
      'masters',
      'templates',
      'reports',
      'admin',
    ],
    defaultTab: 'dashboard',
    capabilities: [
      'Manage User Accounts & Assign Roles',
      'Full Itinerary Proposal Builder & Margin Overrides',
      'Authorize Commercial Discount Approvals',
      'Contract & Master Catalog Management',
      'Operations Voucher & Dispatch Execution',
      'Company Branding & Financial Tax Rules',
      'Security & Audit Log Inspection',
    ],
  },
  'Travel Consultant': {
    role: 'Travel Consultant',
    title: 'Leisure & Corporate Travel Consultant',
    badge: {
      bg: 'bg-indigo-100 dark:bg-indigo-950/50',
      text: 'text-indigo-700 dark:text-indigo-300',
      border: 'border-indigo-300 dark:border-indigo-800',
    },
    description: 'Create, customize, price, and export travel proposals. Submit proposals for manager approval when discounts exceed standard policy.',
    allowedTabs: [
      'dashboard',
      'customers',
      'itineraries',
      'builder',
      'templates',
      'reports',
    ],
    defaultTab: 'dashboard',
    capabilities: [
      'Manage Customers & Client Travel Enquiries',
      'Build Custom Day-by-Day Tour Itineraries',
      'Auto-Price Packages & Custom Markup Formulas',
      'Clone & Customize Master Tour Templates',
      'Submit Escalated Quotes for Manager Approval',
      'Export Branded Client PDFs & Proposals',
    ],
  },
  'Sales Manager': {
    role: 'Sales Manager',
    title: 'Sales & Commercial Approvals Manager',
    badge: {
      bg: 'bg-amber-100 dark:bg-amber-950/50',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-300 dark:border-amber-800',
    },
    description: 'Review consultant proposal pipelines, authorize commercial discount exceptions, manage margin health, and monitor team conversion metrics.',
    allowedTabs: [
      'dashboard',
      'customers',
      'itineraries',
      'builder',
      'approvals',
      'templates',
      'reports',
    ],
    defaultTab: 'approvals',
    capabilities: [
      'Review & Authorize Commercial Discount Requests',
      'Approve / Return High Discount Proposals',
      'Access Team-Wide Pipeline & Conversion Metrics',
      'Review Profit Margin Thresholds & Commission Splits',
      'Create & Edit Client Itinerary Proposals',
    ],
  },
  'Product Manager': {
    role: 'Product Manager',
    title: 'Product & Destination Catalog Manager',
    badge: {
      bg: 'bg-rose-100 dark:bg-rose-950/50',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-300 dark:border-rose-800',
    },
    description: 'Manage contracted supplier rates, hotel seasons, excursion pricing, vehicle fleets, tour packages, and master templates.',
    allowedTabs: [
      'dashboard',
      'masters',
      'templates',
      'itineraries',
      'builder',
      'reports',
    ],
    defaultTab: 'masters',
    capabilities: [
      'Full Master Catalog Read & Write Access',
      'Contract Hotel Rates, Meal Plans & Seasons',
      'Configure Activities, Sightseeing & Entry Tickets',
      'Manage Transport Fleets & Transfer Tariffs',
      'Build & Publish Pre-Packaged Master Templates',
    ],
  },
  'Operations Executive': {
    role: 'Operations Executive',
    title: 'Tour Operations & Logistics Executive',
    badge: {
      bg: 'bg-cyan-100 dark:bg-cyan-950/50',
      text: 'text-cyan-700 dark:text-cyan-300',
      border: 'border-cyan-300 dark:border-cyan-800',
    },
    description: 'Fulfill confirmed bookings, coordinate with local suppliers, update confirmation numbers, and issue operational travel vouchers.',
    allowedTabs: [
      'dashboard',
      'operations',
      'itineraries',
      'reports',
    ],
    defaultTab: 'operations',
    capabilities: [
      'Operations Board & Dispatch Management',
      'Record Supplier & Hotel Booking Confirmation Numbers',
      'Generate Supplier Vouchers & Driver Duty Slips',
      'Track Booking Statuses (Pending, Confirmed, Cancelled)',
      'Inspect Client Travel Schedules & Logistics',
    ],
  },
  'Finance User': {
    role: 'Finance User',
    title: 'Commercial Finance & Accounts Analyst',
    badge: {
      bg: 'bg-emerald-100 dark:bg-emerald-950/50',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-300 dark:border-emerald-800',
    },
    description: 'Audit profit margins, review tax regulations (TRN/GST/VAT), inspect master cost structures, and export revenue reports.',
    allowedTabs: [
      'dashboard',
      'approvals',
      'reports',
      'itineraries',
      'masters',
    ],
    defaultTab: 'reports',
    capabilities: [
      'Financial Revenue, Profit & Margin Analytics',
      'Commercial Margin & Tax Breakdown Inspection',
      'Audit Pending & Approved Discount Requests',
      'Inspect Master Supplier Cost Tariffs',
      'Financial Snapshot Export & Reconciliation',
    ],
  },
  'Read-only Viewer': {
    role: 'Read-only Viewer',
    title: 'Guest / Read-only Viewer',
    badge: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-300 dark:border-slate-700',
    },
    description: 'Restricted read-only observer account. Can inspect proposals, master templates, and high-level reports with creation and editing disabled.',
    allowedTabs: [
      'dashboard',
      'itineraries',
      'templates',
      'reports',
    ],
    defaultTab: 'dashboard',
    capabilities: [
      'View Itinerary Proposals & Day Schedules',
      'Preview Master Tour Templates',
      'Inspect High-Level Commercial Overview',
      'No Creation, Editing, Deletion or Approval Rights',
    ],
  },
};

export const isTabAllowed = (role?: UserRole | string, tabId?: string): boolean => {
  if (!role || !tabId) return false;
  const config = ROLE_PERMISSIONS[role as UserRole];
  if (!config) return false;
  return config.allowedTabs.includes(tabId);
};

export const getRoleDefaultTab = (role?: UserRole | string): string => {
  if (!role) return 'dashboard';
  const config = ROLE_PERMISSIONS[role as UserRole];
  return config?.defaultTab || 'dashboard';
};

export const canCreateItinerary = (role?: UserRole | string): boolean => {
  return role === 'Administrator' || role === 'Travel Consultant' || role === 'Sales Manager';
};

export const canEditItinerary = (role?: UserRole | string): boolean => {
  return role === 'Administrator' || role === 'Travel Consultant' || role === 'Sales Manager' || role === 'Product Manager';
};

export const canDeleteItinerary = (role?: UserRole | string): boolean => {
  return role === 'Administrator' || role === 'Sales Manager';
};

export const canApproveDiscounts = (role?: UserRole | string): boolean => {
  return role === 'Administrator' || role === 'Sales Manager';
};

export const canManageMasters = (role?: UserRole | string): boolean => {
  return role === 'Administrator' || role === 'Product Manager';
};

export const canManageOperations = (role?: UserRole | string): boolean => {
  return role === 'Administrator' || role === 'Operations Executive';
};

export const canManageUsers = (role?: UserRole | string): boolean => {
  return role === 'Administrator';
};

export const canManageSettings = (role?: UserRole | string): boolean => {
  return role === 'Administrator';
};

export const canCreateCustomers = (role?: UserRole | string): boolean => {
  return role === 'Administrator' || role === 'Travel Consultant' || role === 'Sales Manager';
};

export const canCreateTemplates = (role?: UserRole | string): boolean => {
  return role === 'Administrator' || role === 'Product Manager' || role === 'Travel Consultant';
};

export const canManageTemplates = (role?: UserRole | string): boolean => {
  return role === 'Administrator' || role === 'Product Manager';
};

export const isReadOnlyRole = (role?: UserRole | string): boolean => {
  return role === 'Read-only Viewer';
};

export const TAB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  customers: 'Customers & Enquiries',
  itineraries: 'Itineraries',
  builder: 'Itinerary Builder',
  approvals: 'Approval Queue',
  operations: 'Operations Execution',
  masters: 'Master Data Catalog',
  templates: 'Master Templates',
  reports: 'Reports & Analytics',
  admin: 'Admin & Settings',
};

export const TAB_REQUIRED_ROLES: Record<string, UserRole[]> = {
  dashboard: ['Administrator', 'Travel Consultant', 'Sales Manager', 'Product Manager', 'Operations Executive', 'Finance User', 'Read-only Viewer'],
  customers: ['Administrator', 'Travel Consultant', 'Sales Manager'],
  itineraries: ['Administrator', 'Travel Consultant', 'Sales Manager', 'Product Manager', 'Operations Executive', 'Finance User', 'Read-only Viewer'],
  builder: ['Administrator', 'Travel Consultant', 'Sales Manager', 'Product Manager'],
  approvals: ['Administrator', 'Sales Manager', 'Finance User'],
  operations: ['Administrator', 'Operations Executive'],
  masters: ['Administrator', 'Product Manager', 'Finance User'],
  templates: ['Administrator', 'Product Manager', 'Travel Consultant', 'Read-only Viewer'],
  reports: ['Administrator', 'Travel Consultant', 'Sales Manager', 'Product Manager', 'Operations Executive', 'Finance User', 'Read-only Viewer'],
  admin: ['Administrator'],
};
