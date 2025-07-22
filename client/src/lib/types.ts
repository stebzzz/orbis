import type {
  User,
  Client,
  Project,
  Task,
  TimeEntry,
  CatalogItem,
  Quote,
  Invoice,
  LineItem,
  Expense,
} from "@shared/schema";

export type {
  User,
  Client,
  Project,
  Task,
  TimeEntry,
  CatalogItem,
  Quote,
  Invoice,
  LineItem,
  Expense,
};

export interface DashboardMetrics {
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

export interface TimerState {
  isRunning: boolean;
  timeEntry?: TimeEntry;
  elapsed: number;
}

export type DocumentStatus = 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'paye' | 'en_retard' | 'expire' | 'annule';
export type ProjectStatus = 'planning' | 'en_cours' | 'termine' | 'suspendu';
export type ClientType = 'particulier' | 'professionnel';
