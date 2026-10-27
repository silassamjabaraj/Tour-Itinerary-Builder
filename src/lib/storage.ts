import { 
  initialCompanySettings, 
  initialCustomers, 
  initialDestinations, 
  initialEnquiries, 
  initialHotels, 
  initialActivities, 
  initialTransport, 
  initialMeals, 
  initialGuides, 
  initialSuppliers, 
  initialTaxes, 
  initialCurrencies, 
  initialPolicies, 
  initialUsers, 
  sampleUAEItinerary, 
  initialTemplates,
  initialItineraries,
  initialApprovals, 
  initialAuditLogs 
} from '../data/mockData';
import { 
  ApprovalRequest, 
  AuditLog, 
  CompanySettings, 
  Customer, 
  DestinationMaster, 
  Enquiry, 
  HotelMaster, 
  ActivityMaster, 
  TransportMaster, 
  MealMaster, 
  GuideMaster, 
  SupplierMaster, 
  TaxMaster, 
  CurrencyMaster, 
  PolicyMaster, 
  Itinerary, 
  User, 
  DocumentExport 
} from '../types';

const STORAGE_KEYS = {
  USERS: 'tour_builder_users',
  SETTINGS: 'tour_builder_settings',
  CUSTOMERS: 'tour_builder_customers',
  ENQUIRIES: 'tour_builder_enquiries',
  ITINERARIES: 'tour_builder_itineraries',
  MASTERS_DESTINATIONS: 'tour_builder_destinations',
  MASTERS_HOTELS: 'tour_builder_hotels',
  MASTERS_ACTIVITIES: 'tour_builder_activities',
  MASTERS_TRANSPORT: 'tour_builder_transport',
  MASTERS_MEALS: 'tour_builder_meals',
  MASTERS_GUIDES: 'tour_builder_guides',
  MASTERS_SUPPLIERS: 'tour_builder_suppliers',
  MASTERS_TAXES: 'tour_builder_taxes',
  MASTERS_CURRENCIES: 'tour_builder_currencies',
  MASTERS_POLICIES: 'tour_builder_policies',
  APPROVALS: 'tour_builder_approvals',
  EXPORTS: 'tour_builder_exports',
  AUDIT_LOGS: 'tour_builder_audit_logs',
};

export class StorageService {
  static getUsers(): User[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) {
      this.saveUsers(initialUsers);
      return initialUsers;
    }
    try {
      const list: User[] = JSON.parse(data);
      // Ensure any missing seed users (e.g. newly added roles) are present
      let needsSave = false;
      initialUsers.forEach((seedUser) => {
        const found = list.some(
          (u) => u.id === seedUser.id || (u.email && u.email.toLowerCase() === seedUser.email.toLowerCase())
        );
        if (!found) {
          list.push(seedUser);
          needsSave = true;
        }
      });

      // Migrate missing username or password gracefully
      const migrated = list.map((u, idx) => {
        let updated = false;
        const copy = { ...u };
        if (!copy.username) {
          copy.username = copy.email ? copy.email.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '') : `user_${idx + 1}`;
          updated = true;
        }
        if (!copy.password) {
          copy.password = 'password123';
          updated = true;
        }
        if (updated) needsSave = true;
        return copy;
      });
      if (needsSave) {
        this.saveUsers(migrated);
      }
      return migrated;
    } catch {
      return initialUsers;
    }
  }

  static saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  static getCompanySettings(): CompanySettings {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : initialCompanySettings;
  }

  static saveCompanySettings(settings: CompanySettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  static getCustomers(): Customer[] {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : initialCustomers;
  }

  static saveCustomers(customers: Customer[]): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }

  static getEnquiries(): Enquiry[] {
    const data = localStorage.getItem(STORAGE_KEYS.ENQUIRIES);
    return data ? JSON.parse(data) : initialEnquiries;
  }

  static saveEnquiries(enquiries: Enquiry[]): void {
    localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(enquiries));
  }

  static getItineraries(): Itinerary[] {
    const data = localStorage.getItem(STORAGE_KEYS.ITINERARIES);
    if (!data) {
      this.saveItineraries(initialItineraries);
      return initialItineraries;
    }
    try {
      const parsed: Itinerary[] = JSON.parse(data);
      // If user has old storage without templates, seamlessly merge initialTemplates
      const hasTemplates = parsed.some((it) => it.isTemplate);
      if (!hasTemplates) {
        const merged = [...parsed, ...initialTemplates];
        this.saveItineraries(merged);
        return merged;
      }
      return parsed;
    } catch {
      return initialItineraries;
    }
  }

  static getTemplates(): Itinerary[] {
    const all = this.getItineraries();
    return all.filter((it) => it.isTemplate);
  }

  static saveItineraries(itineraries: Itinerary[]): void {
    localStorage.setItem(STORAGE_KEYS.ITINERARIES, JSON.stringify(itineraries));
  }

  static saveTemplate(template: Itinerary, userName = 'Elena Rostova', userRole = 'Product Manager'): void {
    const prepared: Itinerary = {
      ...template,
      isTemplate: true,
      updatedAt: new Date().toISOString(),
    };
    this.saveItinerary(prepared, userName, userRole);
  }

  static deleteTemplate(id: string): void {
    const list = this.getItineraries().filter((it) => it.id !== id);
    this.saveItineraries(list);
  }

  static getItineraryById(id: string): Itinerary | undefined {
    const list = this.getItineraries();
    return list.find((it) => it.id === id || it.itineraryNumber === id);
  }

  static saveItinerary(itinerary: Itinerary, userName = 'Sarah Jenkins', userRole = 'Travel Consultant'): void {
    const list = this.getItineraries();
    const index = list.findIndex((i) => i.id === itinerary.id);
    const updated = { ...itinerary, updatedAt: new Date().toISOString() };

    if (index >= 0) {
      list[index] = updated;
    } else {
      list.unshift(updated);
    }

    this.saveItineraries(list);
    this.addAuditLog({
      userName,
      userRole: userRole as any,
      action: index >= 0 ? 'Update Itinerary' : 'Create Itinerary',
      entityType: 'Itinerary',
      entityId: itinerary.itineraryNumber,
      summary: `Saved itinerary ${itinerary.itineraryNumber} (${itinerary.title}) with status ${itinerary.status}.`,
    });
  }

  static getDestinations(): DestinationMaster[] {
    const data = localStorage.getItem(STORAGE_KEYS.MASTERS_DESTINATIONS);
    return data ? JSON.parse(data) : initialDestinations;
  }

  static saveDestinations(items: DestinationMaster[]): void {
    localStorage.setItem(STORAGE_KEYS.MASTERS_DESTINATIONS, JSON.stringify(items));
  }

  static getHotels(): HotelMaster[] {
    const data = localStorage.getItem(STORAGE_KEYS.MASTERS_HOTELS);
    return data ? JSON.parse(data) : initialHotels;
  }

  static saveHotels(items: HotelMaster[]): void {
    localStorage.setItem(STORAGE_KEYS.MASTERS_HOTELS, JSON.stringify(items));
  }

  static getActivities(): ActivityMaster[] {
    const data = localStorage.getItem(STORAGE_KEYS.MASTERS_ACTIVITIES);
    return data ? JSON.parse(data) : initialActivities;
  }

  static saveActivities(items: ActivityMaster[]): void {
    localStorage.setItem(STORAGE_KEYS.MASTERS_ACTIVITIES, JSON.stringify(items));
  }

  static getTransport(): TransportMaster[] {
    const data = localStorage.getItem(STORAGE_KEYS.MASTERS_TRANSPORT);
    return data ? JSON.parse(data) : initialTransport;
  }

  static saveTransport(items: TransportMaster[]): void {
    localStorage.setItem(STORAGE_KEYS.MASTERS_TRANSPORT, JSON.stringify(items));
  }

  static getMeals(): MealMaster[] {
    const data = localStorage.getItem(STORAGE_KEYS.MASTERS_MEALS);
    return data ? JSON.parse(data) : initialMeals;
  }

  static saveMeals(items: MealMaster[]): void {
    localStorage.setItem(STORAGE_KEYS.MASTERS_MEALS, JSON.stringify(items));
  }

  static getGuides(): GuideMaster[] {
    const data = localStorage.getItem(STORAGE_KEYS.MASTERS_GUIDES);
    return data ? JSON.parse(data) : initialGuides;
  }

  static saveGuides(items: GuideMaster[]): void {
    localStorage.setItem(STORAGE_KEYS.MASTERS_GUIDES, JSON.stringify(items));
  }

  static getSuppliers(): SupplierMaster[] {
    const data = localStorage.getItem(STORAGE_KEYS.MASTERS_SUPPLIERS);
    return data ? JSON.parse(data) : initialSuppliers;
  }

  static saveSuppliers(items: SupplierMaster[]): void {
    localStorage.setItem(STORAGE_KEYS.MASTERS_SUPPLIERS, JSON.stringify(items));
  }

  static getTaxes(): TaxMaster[] {
    const data = localStorage.getItem(STORAGE_KEYS.MASTERS_TAXES);
    return data ? JSON.parse(data) : initialTaxes;
  }

  static saveTaxes(items: TaxMaster[]): void {
    localStorage.setItem(STORAGE_KEYS.MASTERS_TAXES, JSON.stringify(items));
  }

  static getCurrencies(): CurrencyMaster[] {
    const data = localStorage.getItem(STORAGE_KEYS.MASTERS_CURRENCIES);
    return data ? JSON.parse(data) : initialCurrencies;
  }

  static saveCurrencies(items: CurrencyMaster[]): void {
    localStorage.setItem(STORAGE_KEYS.MASTERS_CURRENCIES, JSON.stringify(items));
  }

  static getPolicies(): PolicyMaster[] {
    const data = localStorage.getItem(STORAGE_KEYS.MASTERS_POLICIES);
    return data ? JSON.parse(data) : initialPolicies;
  }

  static savePolicies(items: PolicyMaster[]): void {
    localStorage.setItem(STORAGE_KEYS.MASTERS_POLICIES, JSON.stringify(items));
  }

  static getApprovals(): ApprovalRequest[] {
    const data = localStorage.getItem(STORAGE_KEYS.APPROVALS);
    return data ? JSON.parse(data) : initialApprovals;
  }

  static saveApprovals(items: ApprovalRequest[]): void {
    localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify(items));
  }

  static getDocumentExports(): DocumentExport[] {
    const data = localStorage.getItem(STORAGE_KEYS.EXPORTS);
    return data ? JSON.parse(data) : [];
  }

  static saveDocumentExport(exp: DocumentExport): void {
    const list = this.getDocumentExports();
    list.unshift(exp);
    localStorage.setItem(STORAGE_KEYS.EXPORTS, JSON.stringify(list));
  }

  static getAuditLogs(): AuditLog[] {
    const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return data ? JSON.parse(data) : initialAuditLogs;
  }

  static addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const list = this.getAuditLogs();
    const newEntry: AuditLog = {
      ...log,
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    list.unshift(newEntry);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(list));
  }

  static resetToDefault(): void {
    localStorage.clear();
  }

  static exportBackupJSON(): string {
    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      users: this.getUsers(),
      settings: this.getCompanySettings(),
      customers: this.getCustomers(),
      enquiries: this.getEnquiries(),
      itineraries: this.getItineraries(),
      destinations: this.getDestinations(),
      hotels: this.getHotels(),
      activities: this.getActivities(),
      transport: this.getTransport(),
      meals: this.getMeals(),
      guides: this.getGuides(),
      suppliers: this.getSuppliers(),
      approvals: this.getApprovals(),
      auditLogs: this.getAuditLogs(),
    };
    return JSON.stringify(backupData, null, 2);
  }

  static restoreFromJSON(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.users) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
      if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      if (data.customers) localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(data.customers));
      if (data.enquiries) localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(data.enquiries));
      if (data.itineraries) localStorage.setItem(STORAGE_KEYS.ITINERARIES, JSON.stringify(data.itineraries));
      if (data.destinations) localStorage.setItem(STORAGE_KEYS.MASTERS_DESTINATIONS, JSON.stringify(data.destinations));
      if (data.hotels) localStorage.setItem(STORAGE_KEYS.MASTERS_HOTELS, JSON.stringify(data.hotels));
      if (data.activities) localStorage.setItem(STORAGE_KEYS.MASTERS_ACTIVITIES, JSON.stringify(data.activities));
      if (data.transport) localStorage.setItem(STORAGE_KEYS.MASTERS_TRANSPORT, JSON.stringify(data.transport));
      if (data.suppliers) localStorage.setItem(STORAGE_KEYS.MASTERS_SUPPLIERS, JSON.stringify(data.suppliers));
      if (data.approvals) localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify(data.approvals));
      if (data.auditLogs) localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(data.auditLogs));
      return true;
    } catch (e) {
      console.error('Failed to parse backup JSON', e);
      return false;
    }
  }
}
