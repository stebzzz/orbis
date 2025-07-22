import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { 
  Client, 
  Project, 
  Quote, 
  Invoice, 
  TimeEntry, 
  CatalogItem,
  LineItem
} from '@shared/schema';

interface CompanySettings {
  id?: string;
  companyName: string;
  siret: string;
  address: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
  rib: string;
  iban: string;
  bic: string;
  userId: string;
  createdAt?: any;
  updatedAt?: any;
}

interface DashboardMetrics {
  revenue: {
    current: number;
    previous: number;
  };
  pendingQuotes: {
    amount: number;
    count: number;
  };
  unpaidInvoices: {
    amount: number;
    count: number;
    overdue: number;
  };
  urssafEstimate: number;
}

// Collections
const COLLECTIONS = {
  clients: 'clients',
  projects: 'projects',
  quotes: 'quotes',
  invoices: 'invoices',
  timeEntries: 'timeEntries',
  catalogItems: 'catalogItems',
  companySettings: 'companySettings',
  lineItems: 'lineItems'
};

// Clients
export const clientsService = {
  async getAll(): Promise<Client[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.clients));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Client));
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Client | null> {
    try {
      const docRef = doc(db, COLLECTIONS.clients, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Client : null;
    } catch (error) {
      console.error('Error fetching client:', error);
      return null;
    }
  },

  async create(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, COLLECTIONS.clients), {
      ...client,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
  },

  async update(id: string, client: Partial<Client>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.clients, id);
    await updateDoc(docRef, {
      ...client,
      updatedAt: Timestamp.now()
    });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.clients, id));
  }
};

// Projects
export const projectsService = {
  async getAll(): Promise<Project[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.projects));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Project));
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  },

  async getActive(): Promise<Project[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.projects),
        where('status', 'in', ['planning', 'en_cours'])
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Project));
    } catch (error) {
      console.error('Error fetching active projects:', error);
      return [];
    }
  },

  async create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, COLLECTIONS.projects), {
      ...project,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
  },

  async update(id: string, project: Partial<Project>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.projects, id);
    await updateDoc(docRef, {
      ...project,
      updatedAt: Timestamp.now()
    });
  }
};

// Quotes
export const quotesService = {
  async getAll(): Promise<Quote[]> {
    try {
      const q = query(collection(db, COLLECTIONS.quotes), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          issueDate: data.issueDate?.toDate ? data.issueDate.toDate() : new Date(data.issueDate),
          validityDate: data.validityDate?.toDate ? data.validityDate.toDate() : new Date(data.validityDate),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
        } as Quote;
      });
    } catch (error) {
      console.error('Error fetching quotes:', error);
      return [];
    }
  },

  async getRecent(limitCount: number = 5): Promise<Quote[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.quotes),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          issueDate: data.issueDate?.toDate ? data.issueDate.toDate() : new Date(data.issueDate),
          validityDate: data.validityDate?.toDate ? data.validityDate.toDate() : new Date(data.validityDate),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
        } as Quote;
      });
    } catch (error) {
      console.error('Error fetching recent quotes:', error);
      return [];
    }
  },

  async getPending(): Promise<Quote[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.quotes),
        where('status', '==', 'en_attente')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          issueDate: data.issueDate?.toDate ? data.issueDate.toDate() : new Date(data.issueDate),
          validityDate: data.validityDate?.toDate ? data.validityDate.toDate() : new Date(data.validityDate),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
        } as Quote;
      });
    } catch (error) {
      console.error('Error fetching pending quotes:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Quote | null> {
    try {
      const docRef = doc(db, COLLECTIONS.quotes, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        issueDate: data.issueDate?.toDate ? data.issueDate.toDate() : new Date(data.issueDate),
        validityDate: data.validityDate?.toDate ? data.validityDate.toDate() : new Date(data.validityDate),
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
      } as Quote;
    } catch (error) {
      console.error('Error fetching quote:', error);
      return null;
    }
  },

  async create(quote: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, COLLECTIONS.quotes), {
      ...quote,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
  },

  async update(id: string, quote: Partial<Quote>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.quotes, id);
    await updateDoc(docRef, {
      ...quote,
      updatedAt: Timestamp.now()
    });
  }
};

// Invoices
export const invoicesService = {
  async getAll(): Promise<Invoice[]> {
    try {
      const q = query(collection(db, COLLECTIONS.invoices), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          issueDate: data.issueDate?.toDate ? data.issueDate.toDate() : new Date(data.issueDate),
          dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : new Date(data.dueDate),
          paidDate: data.paidDate ? (data.paidDate?.toDate ? data.paidDate.toDate() : new Date(data.paidDate)) : undefined,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
        } as Invoice;
      });
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  },

  async getRecent(limitCount: number = 5): Promise<Invoice[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.invoices),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          issueDate: data.issueDate?.toDate ? data.issueDate.toDate() : new Date(data.issueDate),
          dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : new Date(data.dueDate),
          paidDate: data.paidDate ? (data.paidDate?.toDate ? data.paidDate.toDate() : new Date(data.paidDate)) : undefined,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
        } as Invoice;
      });
    } catch (error) {
      console.error('Error fetching recent invoices:', error);
      return [];
    }
  },

  async getUnpaid(): Promise<Invoice[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.invoices),
        where('status', '==', 'en_attente')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          issueDate: data.issueDate?.toDate ? data.issueDate.toDate() : new Date(data.issueDate),
          dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : new Date(data.dueDate),
          paidDate: data.paidDate ? (data.paidDate?.toDate ? data.paidDate.toDate() : new Date(data.paidDate)) : undefined,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
        } as Invoice;
      });
    } catch (error) {
      console.error('Error fetching unpaid invoices:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Invoice | null> {
    try {
      const docRef = doc(db, COLLECTIONS.invoices, id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        issueDate: data.issueDate?.toDate ? data.issueDate.toDate() : new Date(data.issueDate),
        dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : new Date(data.dueDate),
        paidDate: data.paidDate ? (data.paidDate?.toDate ? data.paidDate.toDate() : new Date(data.paidDate)) : undefined,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
      } as Invoice;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      return null;
    }
  },

  async getNextInvoiceNumber(userId: string): Promise<string> {
    try {
      const q = query(
        collection(db, COLLECTIONS.invoices),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return 'INV-001';
      }
      
      const lastInvoice = querySnapshot.docs[0].data() as Invoice;
      const lastNumber = lastInvoice.number;
      
      // Extraire le numéro de la facture (ex: INV-001 -> 001)
      const match = lastNumber.match(/INV-(\d+)/);
      if (match) {
        const nextNumber = parseInt(match[1]) + 1;
        return `INV-${nextNumber.toString().padStart(3, '0')}`;
      }
      
      return 'INV-001';
    } catch (error) {
      console.error('Error getting next invoice number:', error);
      return `INV-${Date.now()}`; // Fallback
    }
  },

  async create(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, COLLECTIONS.invoices), {
      ...invoice,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
  },

  async update(id: string, invoice: Partial<Invoice>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.invoices, id);
    await updateDoc(docRef, {
      ...invoice,
      updatedAt: Timestamp.now()
    });
  }
};

// Time Entries
export const timeEntriesService = {
  async getAll(): Promise<TimeEntry[]> {
    try {
      const q = query(collection(db, COLLECTIONS.timeEntries), orderBy('startTime', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as TimeEntry));
    } catch (error) {
      console.error('Error fetching time entries:', error);
      return [];
    }
  },

  async getActiveEntry(): Promise<TimeEntry | null> {
    try {
      const q = query(
        collection(db, COLLECTIONS.timeEntries),
        where('endTime', '==', null),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.empty ? null : { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as unknown as TimeEntry;
    } catch (error) {
      console.error('Error fetching active time entry:', error);
      return null;
    }
  },

  async create(timeEntry: Omit<TimeEntry, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.timeEntries), timeEntry);
    return docRef.id;
  },

  async update(id: string, timeEntry: Partial<TimeEntry>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.timeEntries, id);
    await updateDoc(docRef, timeEntry);
  }
};

// Catalog Items
export const catalogItemsService = {
  async getAll(): Promise<CatalogItem[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.catalogItems));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as CatalogItem));
    } catch (error) {
      console.error('Error fetching catalog items:', error);
      return [];
    }
  },

  async create(item: Omit<CatalogItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, COLLECTIONS.catalogItems), {
      ...item,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
  }
};

// Line Items
export const lineItemsService = {
  async getByInvoiceId(invoiceId: string): Promise<LineItem[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.lineItems),
        where('invoiceId', '==', invoiceId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as LineItem));
    } catch (error) {
      console.error('Error fetching line items:', error);
      return [];
    }
  },

  async getByQuoteId(quoteId: string): Promise<LineItem[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.lineItems),
        where('quoteId', '==', quoteId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as LineItem));
    } catch (error) {
      console.error('Error fetching line items:', error);
      return [];
    }
  },

  async create(lineItem: Omit<LineItem, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.lineItems), lineItem);
    return docRef.id;
  },

  async createMultiple(lineItems: Omit<LineItem, 'id'>[]): Promise<string[]> {
    const promises = lineItems.map(item => this.create(item));
    return Promise.all(promises);
  },

  async deleteByInvoiceId(invoiceId: string): Promise<void> {
    try {
      const q = query(
        collection(db, COLLECTIONS.lineItems),
        where('invoiceId', '==', invoiceId)
      );
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting line items:', error);
      throw error;
    }
  }
};

// Dashboard Metrics
export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    try {
      // Get all data in parallel
      const [quotes, invoices] = await Promise.all([
        quotesService.getPending(),
        invoicesService.getUnpaid()
      ]);

      // Calculate revenue (sum of paid invoices from current month)
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);
      
      const previousMonth = new Date(currentMonth);
      previousMonth.setMonth(previousMonth.getMonth() - 1);

      // Calculate revenue from paid invoices
      const allInvoices = await invoicesService.getAll();
      
      const currentRevenue = allInvoices
        .filter(invoice => {
          if (!invoice.createdAt) return false;
          const invoiceDate = invoice.createdAt instanceof Timestamp ? invoice.createdAt.toDate() : new Date(invoice.createdAt);
          return invoiceDate >= currentMonth && invoice.status === 'paye';
        })
        .reduce((sum, invoice) => sum + (invoice.total || 0), 0);
      
      const previousRevenue = allInvoices
        .filter(invoice => {
          if (!invoice.createdAt) return false;
          const invoiceDate = invoice.createdAt instanceof Timestamp ? invoice.createdAt.toDate() : new Date(invoice.createdAt);
          return invoiceDate >= previousMonth && invoiceDate < currentMonth && invoice.status === 'paye';
        })
        .reduce((sum, invoice) => sum + (invoice.total || 0), 0);

      // Calculate pending quotes
      const pendingQuotesAmount = quotes.reduce((sum, quote) => sum + (quote.total || 0), 0);
      
      // Calculate unpaid invoices
      const unpaidInvoicesAmount = invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
      const overdueInvoices = invoices.filter(invoice => {
        const dueDate = invoice.dueDate instanceof Timestamp ? invoice.dueDate.toDate() : new Date(invoice.dueDate);
        return dueDate < new Date();
      }).length;

      // URSSAF estimate (simplified calculation)
      const urssafEstimate = currentRevenue * 0.22; // Approximate rate

      return {
        revenue: {
          current: currentRevenue,
          previous: previousRevenue
        },
        pendingQuotes: {
          amount: pendingQuotesAmount,
          count: quotes.length
        },
        unpaidInvoices: {
          amount: unpaidInvoicesAmount,
          count: invoices.length,
          overdue: overdueInvoices
        },
        urssafEstimate
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      // Return default values in case of error
      return {
        revenue: { current: 0, previous: 0 },
        pendingQuotes: { amount: 0, count: 0 },
        unpaidInvoices: { amount: 0, count: 0, overdue: 0 },
        urssafEstimate: 0
      };
    }
  }
};

// Company Settings
export const companySettingsService = {
  async get(userId: string): Promise<CompanySettings | null> {
    try {
      const q = query(
        collection(db, COLLECTIONS.companySettings),
        where('userId', '==', userId),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.empty ? null : { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as CompanySettings;
    } catch (error) {
      console.error('Error fetching company settings:', error);
      return null;
    }
  },

  async createOrUpdate(settings: Omit<CompanySettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Check if settings already exist for this user
      const existing = await this.get(settings.userId);
      
      if (existing && existing.id) {
        // Update existing settings
        const docRef = doc(db, COLLECTIONS.companySettings, existing.id);
        await updateDoc(docRef, {
          ...settings,
          updatedAt: Timestamp.now()
        });
        return existing.id;
      } else {
        // Create new settings
        const now = Timestamp.now();
        const docRef = await addDoc(collection(db, COLLECTIONS.companySettings), {
          ...settings,
          createdAt: now,
          updatedAt: now
        });
        return docRef.id;
      }
    } catch (error) {
      console.error('Error saving company settings:', error);
      throw error;
    }
  }
};

// Real-time listeners
export const createRealtimeListener = {
  clients: (callback: (clients: Client[]) => void) => {
    return onSnapshot(collection(db, COLLECTIONS.clients), (snapshot) => {
      const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Client));
      callback(clients);
    });
  },

  projects: (callback: (projects: Project[]) => void) => {
    return onSnapshot(collection(db, COLLECTIONS.projects), (snapshot) => {
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as Project));
      callback(projects);
    });
  },

  activeTimeEntry: (callback: (timeEntry: TimeEntry | null) => void) => {
    const q = query(
      collection(db, COLLECTIONS.timeEntries),
      where('endTime', '==', null),
      limit(1)
    );
    return onSnapshot(q, (snapshot) => {
      const timeEntry = snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as unknown as TimeEntry;
      callback(timeEntry);
    });
  }
};