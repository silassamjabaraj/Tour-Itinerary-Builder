import React, { useState, useEffect } from 'react';
import { StorageService } from './lib/storage';
import { 
  Customer, 
  Enquiry, 
  Itinerary, 
  UserRole, 
  ApprovalRequest, 
  CompanySettings, 
  AuditLog,
  User 
} from './types';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/Auth/LoginView';
import { DashboardView } from './components/Dashboard/DashboardView';
import { CustomerListView } from './components/Customer/CustomerListView';
import { NewEnquiryModal } from './components/Customer/NewEnquiryModal';
import { ItineraryListView } from './components/Itinerary/ItineraryListView';
import { ItineraryBuilder } from './components/Itinerary/ItineraryBuilder';
import { ItineraryPreviewModal } from './components/Itinerary/ItineraryPreviewModal';
import { ApprovalQueueView } from './components/Approval/ApprovalQueueView';
import { OperationsBoardView } from './components/Operations/OperationsBoardView';
import { MasterCatalogView } from './components/Masters/MasterCatalogView';
import { TemplatesView } from './components/Templates/TemplatesView';
import { ReportsView } from './components/Reports/ReportsView';
import { AdminSettingsView } from './components/Admin/AdminSettingsView';
import { AccessDeniedView } from './components/Auth/AccessDeniedView';
import { isTabAllowed, getRoleDefaultTab } from './lib/permissions';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('Travel Consultant');

  // Core Data State
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>(StorageService.getUsers());
  const [companySettings, setCompanySettings] = useState<CompanySettings>(StorageService.getCompanySettings());

  // Masters
  const [masterHotels, setMasterHotels] = useState(StorageService.getHotels());
  const [masterActivities, setMasterActivities] = useState(StorageService.getActivities());
  const [masterTransport, setMasterTransport] = useState(StorageService.getTransport());
  const [masterMeals, setMasterMeals] = useState(StorageService.getMeals());
  const [masterGuides, setMasterGuides] = useState(StorageService.getGuides());
  const [masterDestinations, setMasterDestinations] = useState(StorageService.getDestinations());
  const [masterSuppliers, setMasterSuppliers] = useState(StorageService.getSuppliers());
  const [masterTaxes, setMasterTaxes] = useState(StorageService.getTaxes());
  const [masterCurrencies, setMasterCurrencies] = useState(StorageService.getCurrencies());
  const [masterPolicies, setMasterPolicies] = useState(StorageService.getPolicies());

  // UI Modals & Active View Handles
  const [activeItineraryId, setActiveItineraryId] = useState<string | null>('itn-000001');
  const [previewItinerary, setPreviewItinerary] = useState<Itinerary | null>(null);
  const [showNewEnquiryModal, setShowNewEnquiryModal] = useState(false);
  const [selectedEnquiryCustomer, setSelectedEnquiryCustomer] = useState<Customer | undefined>(undefined);

  // Initialize Data on Mount
  useEffect(() => {
    setItineraries(StorageService.getItineraries());
    setCustomers(StorageService.getCustomers());
    setEnquiries(StorageService.getEnquiries());
    setApprovals(StorageService.getApprovals());
    setAuditLogs(StorageService.getAuditLogs());
    const storedUsers = StorageService.getUsers();
    setUsers(storedUsers);
    setCompanySettings(StorageService.getCompanySettings());

    // Validate and synchronize current user and assigned role on startup
    if (currentUser) {
      // Ensure we have latest role data if user was modified in user catalog
      const freshUser = storedUsers.find((u) => u.id === currentUser.id);
      const activeRole = freshUser ? freshUser.role : currentUser.role;
      setCurrentUserRole(activeRole);
      if (!isTabAllowed(activeRole, activeTab)) {
        setActiveTab(getRoleDefaultTab(activeRole));
      }
    }
  }, []);

  const handleSaveUsers = (updatedUsers: User[]) => {
    StorageService.saveUsers(updatedUsers);
    setUsers(updatedUsers);
    if (currentUser) {
      const fresh = updatedUsers.find((u) => u.id === currentUser.id);
      if (fresh) {
        setCurrentUser(fresh);
        setCurrentUserRole(fresh.role);
        localStorage.setItem('tour_builder_current_user', JSON.stringify(fresh));
      }
    }
    setAuditLogs(StorageService.getAuditLogs());
  };

  // Authentication Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentUserRole(user.role);
    localStorage.setItem('tour_builder_current_user', JSON.stringify(user));
    
    // Automatically route user to their assigned role's default landing workspace
    const defaultLandingTab = getRoleDefaultTab(user.role);
    setActiveTab(defaultLandingTab);

    StorageService.addAuditLog({
      userName: user.name,
      userRole: user.role,
      action: 'User Authentication',
      entityType: 'User Session',
      entityId: user.id,
      summary: `User ${user.name} logged in. Role synchronized to "${user.role}". Routed to ${defaultLandingTab} workspace.`,
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleLogout = () => {
    if (currentUser) {
      StorageService.addAuditLog({
        userName: currentUser.name,
        userRole: currentUserRole,
        action: 'User Logout',
        entityType: 'User Session',
        entityId: currentUser.id,
        summary: `User ${currentUser.name} signed out.`,
      });
      setAuditLogs(StorageService.getAuditLogs());
    }
    localStorage.removeItem('tour_builder_current_user');
    setCurrentUser(null);
  };

  // Handler Actions
  const handleSaveItinerary = (updated: Itinerary) => {
    const authorName = currentUser?.name || 'Sarah Jenkins';
    StorageService.saveItinerary(updated, authorName, currentUserRole);
    setItineraries(StorageService.getItineraries());
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleCreateNewItinerary = () => {
    const authorName = currentUser?.name || 'Sarah Jenkins';
    const authorId = currentUser?.id || 'usr-1';
    const nextNum = Math.floor(100000 + Math.random() * 900000);
    const newItn: Itinerary = {
      id: `itn-${Date.now()}`,
      itineraryNumber: `ITN-2026-${nextNum}`,
      title: 'New Custom Tour Itinerary Proposal',
      customerId: customers[0]?.id || 'cust-1',
      customerName: customers[0]?.name || 'Jonathan & Claire Sterling',
      consultantId: authorId,
      consultantName: authorName,
      startDate: '2026-11-10',
      endDate: '2026-11-16',
      durationDays: 6,
      adults: 2,
      children: 0,
      infants: 0,
      roomAllocations: { single: 0, doubleTwin: 1, triple: 0, extraBeds: 0 },
      destinations: ['Dubai'],
      status: 'Draft',
      currentRevision: 1,
      revisions: [
        {
          revisionNumber: 1,
          revisionCode: `ITN-2026-${nextNum}-R01`,
          createdAt: new Date().toISOString(),
          createdBy: 'Sarah Jenkins',
          summaryOfChanges: 'Initial itinerary created from workspace.',
          totalPrice: 63000,
          status: 'Draft',
        }
      ],
      days: [
        {
          id: `day-${Date.now()}-1`,
          dayNumber: 1,
          date: '2026-11-10',
          title: 'Arrival & Welcome Reception',
          destination: 'Dubai',
          items: [],
        }
      ],
      pricing: {
        baseCurrency: 'INR',
        sellingCurrency: 'INR',
        exchangeRate: 1,
        totalCost: 50000,
        markupType: 'percentage',
        markupValue: 20,
        grossProfit: 10000,
        subtotalSellingPrice: 60000,
        discountType: 'percentage',
        discountValue: 0,
        discountAmount: 0,
        taxRatePercent: 5,
        taxInclusive: false,
        taxAmount: 3000,
        finalSellingPrice: 63000,
        perAdultPrice: 31500,
        perChildPrice: 0,
        perInfantPrice: 0,
        perPersonAveragePrice: 31500,
      },
      inclusions: companySettings.defaultInclusions,
      exclusions: companySettings.defaultExclusions,
      policies: [companySettings.defaultTerms],
      requiresApproval: false,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    StorageService.saveItinerary(newItn, 'Sarah Jenkins', currentUserRole);
    setItineraries(StorageService.getItineraries());
    setActiveItineraryId(newItn.id);
    setActiveTab('builder');
  };

  const handleCloneItinerary = (source: Itinerary, options?: any) => {
    const nextNum = Math.floor(100000 + Math.random() * 900000);
    const baseDate = options?.startDate ? new Date(options.startDate) : new Date(source.startDate || new Date().toISOString());
    const duration = source.durationDays || source.days.length || 1;
    const endDate = new Date(baseDate.getTime() + (duration - 1) * 86400000).toISOString().split('T')[0];

    const clonedDays = source.days.map((d, idx) => {
      const dayDate = new Date(baseDate);
      dayDate.setDate(dayDate.getDate() + idx);
      return {
        ...d,
        id: `day-cloned-${Date.now()}-${idx}`,
        date: dayDate.toISOString().split('T')[0],
        items: d.items.map((i) => ({ ...i, id: `item-cloned-${Date.now()}-${Math.random().toString(36).substring(7)}` })),
      };
    });

    const custName = options?.customerName || (source.isTemplate ? 'Direct Client' : `${source.customerName}`);
    const proposalTitle = options?.customTitle || (source.isTemplate ? `${source.title} - ${custName}` : `${source.title} (Clone)`);

    const cloned: Itinerary = {
      ...source,
      id: `itn-${Date.now()}`,
      itineraryNumber: `ITN-2026-${nextNum}`,
      title: proposalTitle,
      customerId: options?.customerId || (source.isTemplate ? 'cust-1' : source.customerId),
      customerName: custName,
      startDate: baseDate.toISOString().split('T')[0],
      endDate: endDate,
      adults: options?.adults ?? source.adults ?? 2,
      children: options?.children ?? source.children ?? 0,
      infants: options?.infants ?? source.infants ?? 0,
      roomAllocations: {
        single: options?.singleRooms ?? source.roomAllocations?.single ?? 0,
        doubleTwin: options?.doubleTwinRooms ?? source.roomAllocations?.doubleTwin ?? 1,
        triple: options?.tripleRooms ?? source.roomAllocations?.triple ?? 0,
        extraBeds: options?.extraBeds ?? source.roomAllocations?.extraBeds ?? 0,
      },
      status: 'Draft',
      isTemplate: false, // Ensure cloned client proposals are proposals
      currentRevision: 1,
      revisions: [
        {
          revisionNumber: 1,
          revisionCode: `ITN-2026-${nextNum}-R01`,
          createdAt: new Date().toISOString(),
          createdBy: 'Sarah Jenkins',
          summaryOfChanges: source.isTemplate 
            ? `Created proposal from master template ${source.itineraryNumber} (${source.title})`
            : `Cloned from proposal ${source.itineraryNumber}`,
          totalPrice: source.pricing.finalSellingPrice,
          status: 'Draft',
        }
      ],
      days: clonedDays,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.saveItinerary(cloned, 'Sarah Jenkins', currentUserRole);
    setItineraries(StorageService.getItineraries());
    setActiveItineraryId(cloned.id);
    setActiveTab('builder');
  };

  const handleCreateTemplate = (newTemplate: Itinerary) => {
    StorageService.saveTemplate(newTemplate, 'Elena Rostova', currentUserRole);
    setItineraries(StorageService.getItineraries());
    setActiveItineraryId(newTemplate.id);
    setActiveTab('builder');
  };

  const handleEditTemplate = (template: Itinerary) => {
    setActiveItineraryId(template.id);
    setActiveTab('builder');
  };

  const handleDeleteTemplate = (id: string) => {
    StorageService.deleteTemplate(id);
    setItineraries(StorageService.getItineraries());
  };

  const handleDeleteItinerary = (id: string) => {
    const updated = itineraries.filter((i) => i.id !== id);
    StorageService.saveItineraries(updated);
    setItineraries(updated);
  };

  const handleAddCustomer = (newCustomer: Customer) => {
    const updated = [newCustomer, ...customers];
    StorageService.saveCustomers(updated);
    setCustomers(updated);
  };

  const handleSaveEnquiry = (newEnquiry: Enquiry) => {
    const updated = [newEnquiry, ...enquiries];
    StorageService.saveEnquiries(updated);
    setEnquiries(updated);
    setShowNewEnquiryModal(false);
  };

  const handleCreateItineraryFromEnquiry = (enquiry: Enquiry) => {
    const nextNum = Math.floor(100000 + Math.random() * 900000);
    const daysArr: any[] = [];
    for (let i = 1; i <= enquiry.durationDays; i++) {
      const d = new Date(enquiry.startDate);
      d.setDate(d.getDate() + (i - 1));
      daysArr.push({
        id: `day-enq-${Date.now()}-${i}`,
        dayNumber: i,
        date: d.toISOString().split('T')[0],
        title: `Day ${i} Schedule`,
        destination: enquiry.destination,
        items: [],
      });
    }

    const newItn: Itinerary = {
      id: `itn-${Date.now()}`,
      itineraryNumber: `ITN-2026-${nextNum}`,
      enquiryId: enquiry.id,
      title: `${enquiry.durationDays}-Day Tour for ${enquiry.customerName}`,
      customerId: enquiry.customerId,
      customerName: enquiry.customerName,
      consultantId: enquiry.consultantId,
      consultantName: enquiry.consultantName,
      startDate: enquiry.startDate,
      endDate: enquiry.endDate,
      durationDays: enquiry.durationDays,
      adults: enquiry.adults,
      children: enquiry.children,
      infants: enquiry.infants,
      roomAllocations: {
        single: enquiry.roomRequirements.singleRooms || 0,
        doubleTwin: enquiry.roomRequirements.doubleTwinRooms || 0,
        triple: enquiry.roomRequirements.tripleRooms || 0,
        extraBeds: enquiry.roomRequirements.extraBeds || 0,
      },
      destinations: [enquiry.destination],
      status: 'Draft',
      currentRevision: 1,
      revisions: [
        {
          revisionNumber: 1,
          revisionCode: `ITN-2026-${nextNum}-R01`,
          createdAt: new Date().toISOString(),
          createdBy: enquiry.consultantName,
          summaryOfChanges: `Created from enquiry brief ${enquiry.id}`,
          totalPrice: enquiry.budgetAmount,
          status: 'Draft',
        }
      ],
      days: daysArr,
      pricing: {
        baseCurrency: 'INR',
        sellingCurrency: enquiry.budgetCurrency || 'INR',
        exchangeRate: 1,
        totalCost: Math.round(enquiry.budgetAmount * 0.75),
        markupType: 'percentage',
        markupValue: 20,
        grossProfit: Math.round(enquiry.budgetAmount * 0.25),
        subtotalSellingPrice: enquiry.budgetAmount,
        discountType: 'percentage',
        discountValue: 0,
        discountAmount: 0,
        taxRatePercent: 5,
        taxInclusive: false,
        taxAmount: Math.round(enquiry.budgetAmount * 0.05),
        finalSellingPrice: Math.round(enquiry.budgetAmount * 1.05),
        perAdultPrice: Math.round(enquiry.budgetAmount / (enquiry.adults || 1)),
        perChildPrice: 0,
        perInfantPrice: 0,
        perPersonAveragePrice: Math.round(enquiry.budgetAmount / ((enquiry.adults + enquiry.children) || 1)),
      },
      inclusions: companySettings.defaultInclusions,
      exclusions: companySettings.defaultExclusions,
      policies: [companySettings.defaultTerms],
      requiresApproval: false,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    StorageService.saveItinerary(newItn, enquiry.consultantName, currentUserRole);
    setItineraries(StorageService.getItineraries());
    setActiveItineraryId(newItn.id);
    setActiveTab('builder');
  };

  const handleSubmitApproval = (itn: Itinerary, reason: string) => {
    const newReq: ApprovalRequest = {
      id: `app-${Date.now()}`,
      itineraryId: itn.id,
      itineraryNumber: itn.itineraryNumber,
      title: itn.title,
      customerName: itn.customerName,
      consultantName: itn.consultantName,
      totalCost: itn.pricing.totalCost,
      sellingPrice: itn.pricing.finalSellingPrice,
      discountPercent: itn.pricing.discountValue,
      marginPercent: itn.pricing.targetMarginPercent || 15,
      reason,
      status: 'Pending',
      requestedAt: new Date().toISOString(),
    };

    const updatedApprovals = [newReq, ...approvals];
    StorageService.saveApprovals(updatedApprovals);
    setApprovals(updatedApprovals);

    const updatedItn = { ...itn, status: 'Internal Review' as const };
    handleSaveItinerary(updatedItn);
    alert('Proposal submitted to Sales Manager Approval Queue.');
  };

  const handleDecideApproval = (appId: string, decision: 'Approved' | 'Rejected', comments: string) => {
    const updatedApprovals = approvals.map((a) => {
      if (a.id === appId) {
        return {
          ...a,
          status: decision,
          comments,
          decidedAt: new Date().toISOString(),
          decidedBy: 'Marcus Vance',
        };
      }
      return a;
    });

    StorageService.saveApprovals(updatedApprovals);
    setApprovals(updatedApprovals);

    const targetApp = approvals.find((a) => a.id === appId);
    if (targetApp) {
      const itn = itineraries.find((i) => i.id === targetApp.itineraryId);
      if (itn) {
        const updatedItn = {
          ...itn,
          status: decision === 'Approved' ? ('Approved' as const) : ('Draft' as const),
          requiresApproval: false,
        };
        handleSaveItinerary(updatedItn);
      }
    }
  };

  const handleUpdateConfirmationRef = (
    itineraryId: string,
    itemId: string,
    status: any,
    refCode: string
  ) => {
    const targetItn = itineraries.find((i) => i.id === itineraryId);
    if (!targetItn) return;

    const updatedDays = targetItn.days.map((d) => ({
      ...d,
      items: d.items.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            confirmationStatus: status,
            confirmationReference: refCode,
          };
        }
        return item;
      }),
    }));

    handleSaveItinerary({ ...targetItn, days: updatedDays });
  };

  // Master Data Update Handlers
  const handleUpdateDestinations = (items: typeof masterDestinations) => {
    StorageService.saveDestinations(items);
    setMasterDestinations(items);
    StorageService.addAuditLog({
      userName: currentUser?.name || 'Administrator',
      userRole: currentUserRole,
      action: 'Update Master Catalog',
      entityType: 'Destinations',
      entityId: 'MASTERS_DESTINATIONS',
      summary: `Updated destinations master catalog (${items.length} records).`,
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleUpdateHotels = (items: typeof masterHotels) => {
    StorageService.saveHotels(items);
    setMasterHotels(items);
    StorageService.addAuditLog({
      userName: currentUser?.name || 'Administrator',
      userRole: currentUserRole,
      action: 'Update Master Catalog',
      entityType: 'Hotels',
      entityId: 'MASTERS_HOTELS',
      summary: `Updated hotels master catalog (${items.length} records).`,
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleUpdateActivities = (items: typeof masterActivities) => {
    StorageService.saveActivities(items);
    setMasterActivities(items);
    StorageService.addAuditLog({
      userName: currentUser?.name || 'Administrator',
      userRole: currentUserRole,
      action: 'Update Master Catalog',
      entityType: 'Activities',
      entityId: 'MASTERS_ACTIVITIES',
      summary: `Updated activities master catalog (${items.length} records).`,
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleUpdateTransport = (items: typeof masterTransport) => {
    StorageService.saveTransport(items);
    setMasterTransport(items);
    StorageService.addAuditLog({
      userName: currentUser?.name || 'Administrator',
      userRole: currentUserRole,
      action: 'Update Master Catalog',
      entityType: 'Transport',
      entityId: 'MASTERS_TRANSPORT',
      summary: `Updated transport routes catalog (${items.length} records).`,
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleUpdateMeals = (items: typeof masterMeals) => {
    StorageService.saveMeals(items);
    setMasterMeals(items);
    StorageService.addAuditLog({
      userName: currentUser?.name || 'Administrator',
      userRole: currentUserRole,
      action: 'Update Master Catalog',
      entityType: 'Meals',
      entityId: 'MASTERS_MEALS',
      summary: `Updated dining master catalog (${items.length} records).`,
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleUpdateGuides = (items: typeof masterGuides) => {
    StorageService.saveGuides(items);
    setMasterGuides(items);
    StorageService.addAuditLog({
      userName: currentUser?.name || 'Administrator',
      userRole: currentUserRole,
      action: 'Update Master Catalog',
      entityType: 'Guides',
      entityId: 'MASTERS_GUIDES',
      summary: `Updated tour guides master catalog (${items.length} records).`,
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleUpdateSuppliers = (items: typeof masterSuppliers) => {
    StorageService.saveSuppliers(items);
    setMasterSuppliers(items);
    StorageService.addAuditLog({
      userName: currentUser?.name || 'Administrator',
      userRole: currentUserRole,
      action: 'Update Master Catalog',
      entityType: 'Suppliers',
      entityId: 'MASTERS_SUPPLIERS',
      summary: `Updated suppliers master catalog (${items.length} records).`,
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleUpdateTaxes = (items: typeof masterTaxes) => {
    StorageService.saveTaxes(items);
    setMasterTaxes(items);
    StorageService.addAuditLog({
      userName: currentUser?.name || 'Administrator',
      userRole: currentUserRole,
      action: 'Update Master Catalog',
      entityType: 'Taxes',
      entityId: 'MASTERS_TAXES',
      summary: `Updated tax rules catalog (${items.length} records).`,
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleUpdateCurrencies = (items: typeof masterCurrencies) => {
    StorageService.saveCurrencies(items);
    setMasterCurrencies(items);
    StorageService.addAuditLog({
      userName: currentUser?.name || 'Administrator',
      userRole: currentUserRole,
      action: 'Update Master Catalog',
      entityType: 'Currencies',
      entityId: 'MASTERS_CURRENCIES',
      summary: `Updated currencies catalog (${items.length} records).`,
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleUpdatePolicies = (items: typeof masterPolicies) => {
    StorageService.savePolicies(items);
    setMasterPolicies(items);
    StorageService.addAuditLog({
      userName: currentUser?.name || 'Administrator',
      userRole: currentUserRole,
      action: 'Update Master Catalog',
      entityType: 'Policies',
      entityId: 'MASTERS_POLICIES',
      summary: `Updated policy terms catalog (${items.length} records).`,
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const currentItineraryInBuilder = itineraries.find((i) => i.id === activeItineraryId) || itineraries[0];

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        currentUserRole={currentUserRole}
        setCurrentUserRole={setCurrentUserRole}
        pendingApprovalsCount={approvals.filter((a) => a.status === 'Pending').length}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {!isTabAllowed(currentUserRole, activeTab) ? (
          <AccessDeniedView
            role={currentUserRole}
            requestedTab={activeTab}
            onNavigateDefault={() => setActiveTab(getRoleDefaultTab(currentUserRole))}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                itineraries={itineraries}
                approvals={approvals}
                auditLogs={auditLogs}
                currentUser={currentUser}
                currentUserRole={currentUserRole}
                onOpenItinerary={(id) => {
                  setActiveItineraryId(id);
                  setActiveTab('builder');
                }}
                onNewItinerary={handleCreateNewItinerary}
                onNewEnquiry={() => {
                  setSelectedEnquiryCustomer(undefined);
                  setShowNewEnquiryModal(true);
                }}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'customers' && (
              <CustomerListView
                customers={customers}
                enquiries={enquiries}
                currentUserRole={currentUserRole}
                onAddCustomer={handleAddCustomer}
                onNewEnquiryForCustomer={(cust) => {
                  setSelectedEnquiryCustomer(cust);
                  setShowNewEnquiryModal(true);
                }}
                onCreateItineraryForEnquiry={handleCreateItineraryFromEnquiry}
              />
            )}

            {activeTab === 'itineraries' && (
              <ItineraryListView
                itineraries={itineraries}
                currentUserRole={currentUserRole}
                onOpenBuilder={(id) => {
                  setActiveItineraryId(id);
                  setActiveTab('builder');
                }}
                onOpenPreview={(itn) => setPreviewItinerary(itn)}
                onNewItinerary={handleCreateNewItinerary}
                onCloneItinerary={handleCloneItinerary}
                onDeleteItinerary={handleDeleteItinerary}
              />
            )}

            {activeTab === 'builder' && currentItineraryInBuilder && (
              <ItineraryBuilder
                itinerary={currentItineraryInBuilder}
                currentUserRole={currentUserRole}
                masterDestinations={masterDestinations}
                masterHotels={masterHotels}
                masterActivities={masterActivities}
                masterTransport={masterTransport}
                masterMeals={masterMeals}
                masterGuides={masterGuides}
                masterCurrencies={masterCurrencies}
                masterSuppliers={masterSuppliers}
                onUpdateDestinations={handleUpdateDestinations}
                onSave={handleSaveItinerary}
                onPreview={(itn) => setPreviewItinerary(itn)}
                onSubmitApproval={handleSubmitApproval}
                onBack={() => setActiveTab('itineraries')}
              />
            )}

            {activeTab === 'approvals' && (
              <ApprovalQueueView
                approvals={approvals}
                currentUserRole={currentUserRole}
                onDecideApproval={handleDecideApproval}
              />
            )}

            {activeTab === 'operations' && (
              <OperationsBoardView
                itineraries={itineraries}
                currentUserRole={currentUserRole}
                onOpenPreview={(itn) => setPreviewItinerary(itn)}
                onUpdateConfirmationRef={handleUpdateConfirmationRef}
              />
            )}

            {activeTab === 'masters' && (
              <MasterCatalogView
                destinations={masterDestinations}
                hotels={masterHotels}
                activities={masterActivities}
                transport={masterTransport}
                meals={masterMeals}
                guides={masterGuides}
                suppliers={masterSuppliers}
                taxes={masterTaxes}
                currencies={masterCurrencies}
                policies={masterPolicies}
                currentUserRole={currentUserRole}
                onUpdateDestinations={handleUpdateDestinations}
                onUpdateHotels={handleUpdateHotels}
                onUpdateActivities={handleUpdateActivities}
                onUpdateTransport={handleUpdateTransport}
                onUpdateMeals={handleUpdateMeals}
                onUpdateGuides={handleUpdateGuides}
                onUpdateSuppliers={handleUpdateSuppliers}
                onUpdateTaxes={handleUpdateTaxes}
                onUpdateCurrencies={handleUpdateCurrencies}
                onUpdatePolicies={handleUpdatePolicies}
              />
            )}

            {activeTab === 'templates' && (
              <TemplatesView
                itineraries={itineraries}
                customers={customers}
                destinations={masterDestinations}
                onCloneTemplate={handleCloneItinerary}
                onEditTemplate={handleEditTemplate}
                onCreateTemplate={handleCreateTemplate}
                onDeleteTemplate={handleDeleteTemplate}
                onPreviewTemplate={(tpl) => setPreviewItinerary(tpl)}
              />
            )}

            {activeTab === 'reports' && <ReportsView itineraries={itineraries} />}

            {activeTab === 'admin' && (
              <AdminSettingsView
                settings={companySettings}
                users={users}
                auditLogs={auditLogs}
                currentUser={currentUser}
                onSaveSettings={(s) => {
                  StorageService.saveCompanySettings(s);
                  setCompanySettings(s);
                }}
                onSaveUsers={handleSaveUsers}
                onResetData={() => {
                  StorageService.resetToDefault();
                  window.location.reload();
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {showNewEnquiryModal && (
        <NewEnquiryModal
          customer={selectedEnquiryCustomer}
          customers={customers}
          onClose={() => setShowNewEnquiryModal(false)}
          onSave={handleSaveEnquiry}
        />
      )}

      {previewItinerary && (
        <ItineraryPreviewModal
          itinerary={previewItinerary}
          companySettings={companySettings}
          onClose={() => setPreviewItinerary(null)}
          onRecordExport={(docType, format) => {
            StorageService.saveDocumentExport({
              id: `exp-${Date.now()}`,
              itineraryNumber: previewItinerary.itineraryNumber,
              revisionCode: previewItinerary.revisions[0]?.revisionCode || 'R01',
              documentType: docType as any,
              issuedAt: new Date().toISOString(),
              issuedBy: 'Sarah Jenkins',
              fileName: `${previewItinerary.itineraryNumber}-${docType}.pdf`,
              format,
            });
          }}
        />
      )}
    </div>
  );
}
