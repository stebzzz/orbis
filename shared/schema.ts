import { z } from "zod";

// User types and schemas
export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  businessName?: string;
  siret?: string;
  address?: string;
  phone?: string;
  vatNumber?: string;
  vatApplicable?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpsertUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  businessName?: string;
  siret?: string;
  address?: string;
  phone?: string;
  vatNumber?: string;
  vatApplicable?: boolean;
}

// Client types and schemas
export interface Client {
  id: string;
  userId: string;
  type: 'particulier' | 'professionnel';
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  siret?: string;
  vatNumber?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InsertClient {
  type: 'particulier' | 'professionnel';
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  siret?: string;
  vatNumber?: string;
  notes?: string;
}

// Project types and schemas
export interface Project {
  id: string;
  userId: string;
  clientId?: string;
  name: string;
  description?: string;
  status: 'planning' | 'en_cours' | 'termine' | 'suspendu';
  hourlyRate?: number;
  estimatedHours?: number;
  deadline?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InsertProject {
  clientId?: string;
  name: string;
  description?: string;
  status?: 'planning' | 'en_cours' | 'termine' | 'suspendu';
  hourlyRate?: number;
  estimatedHours?: number;
  deadline?: Date;
}

// Task types and schemas
export interface Task {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  completed?: boolean;
  createdAt?: Date;
}

export interface InsertTask {
  projectId: string;
  name: string;
  description?: string;
  completed?: boolean;
}

// Time entry types and schemas
export interface TimeEntry {
  id: string;
  userId: string;
  projectId?: string;
  taskId?: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  isRunning?: boolean;
  hourlyRate?: number;
  createdAt?: Date;
}

export interface InsertTimeEntry {
  projectId?: string;
  taskId?: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  isRunning?: boolean;
  hourlyRate?: number;
}

// Catalog item types and schemas
export interface CatalogItem {
  id: string;
  userId: string;
  name: string;
  description?: string;
  unitPrice: number;
  vatRate?: number;
  unit?: string;
  category?: string;
  createdAt?: Date;
}

export interface InsertCatalogItem {
  name: string;
  description?: string;
  unitPrice: number;
  vatRate?: number;
  unit?: string;
  category?: string;
}

// Quote types and schemas
export interface Quote {
  id: string;
  userId: string;
  clientId: string;
  number: string;
  status: 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'expire';
  issueDate: Date;
  validityDate: Date;
  subtotal: number;
  vatAmount: number;
  total: number;
  notes?: string;
  termsConditions?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InsertQuote {
  clientId: string;
  number: string;
  status?: 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'expire';
  issueDate: Date;
  validityDate: Date;
  subtotal: number;
  vatAmount?: number;
  total: number;
  notes?: string;
  termsConditions?: string;
}

// Invoice types and schemas
export interface Invoice {
  id: string;
  userId: string;
  clientId: string;
  quoteId?: string;
  number: string;
  status: 'brouillon' | 'envoye' | 'paye' | 'en_retard' | 'annule';
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  subtotal: number;
  vatAmount: number;
  total: number;
  notes?: string;
  paymentTerms?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InsertInvoice {
  clientId: string;
  quoteId?: string;
  number: string;
  status?: 'brouillon' | 'envoye' | 'paye' | 'en_retard' | 'annule';
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  subtotal: number;
  vatAmount?: number;
  total: number;
  notes?: string;
  paymentTerms?: string;
}

// Line item types and schemas
export interface LineItem {
  id: string;
  quoteId?: string;
  invoiceId?: string;
  catalogItemId?: string;
  product: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  amount: number;
  order?: number;
}

export interface InsertLineItem {
  quoteId?: string;
  invoiceId?: string;
  catalogItemId?: string;
  product: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  amount: number;
  order?: number;
}

// Expense types and schemas
export interface Expense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  category?: string;
  date: Date;
  receiptUrl?: string;
  vatAmount?: number;
  createdAt?: Date;
}

export interface InsertExpense {
  description: string;
  amount: number;
  category?: string;
  date: Date;
  receiptUrl?: string;
  vatAmount?: number;
}

// Zod validation schemas
export const insertClientSchema = z.object({
  type: z.enum(['particulier', 'professionnel']),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  siret: z.string().optional(),
  vatNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const insertProjectSchema = z.object({
  clientId: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['planning', 'en_cours', 'termine', 'suspendu']).optional(),
  hourlyRate: z.number().optional(),
  estimatedHours: z.number().optional(),
  deadline: z.date().optional(),
});

export const insertTaskSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  completed: z.boolean().optional(),
});

export const insertTimeEntrySchema = z.object({
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  description: z.string().optional(),
  startTime: z.date(),
  endTime: z.date().optional(),
  duration: z.number().optional(),
  isRunning: z.boolean().optional(),
  hourlyRate: z.number().optional(),
});

export const insertCatalogItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  unitPrice: z.number().min(0),
  vatRate: z.number().optional(),
  unit: z.string().optional(),
  category: z.string().optional(),
});

export const insertQuoteSchema = z.object({
  clientId: z.string(),
  number: z.string().min(1),
  status: z.enum(['brouillon', 'envoye', 'accepte', 'refuse', 'expire']).optional(),
  issueDate: z.date(),
  validityDate: z.date(),
  subtotal: z.number().min(0),
  vatAmount: z.number().optional(),
  total: z.number().min(0),
  notes: z.string().optional(),
  termsConditions: z.string().optional(),
});

export const insertInvoiceSchema = z.object({
  clientId: z.string(),
  quoteId: z.string().optional(),
  number: z.string().min(1),
  status: z.enum(['brouillon', 'envoye', 'paye', 'en_retard', 'annule']).optional(),
  issueDate: z.date(),
  dueDate: z.date(),
  paidDate: z.date().optional(),
  subtotal: z.number().min(0),
  vatAmount: z.number().optional(),
  total: z.number().min(0),
  notes: z.string().optional(),
  paymentTerms: z.string().optional(),
});

export const insertLineItemSchema = z.object({
  quoteId: z.string().optional(),
  invoiceId: z.string().optional(),
  catalogItemId: z.string().optional(),
  product: z.string().min(1),
  description: z.string().min(1),
  quantity: z.number().min(0),
  unitPrice: z.number().min(0),
  vatRate: z.number().min(0),
  amount: z.number().min(0),
  order: z.number().optional(),
});

export const insertExpenseSchema = z.object({
  description: z.string().min(1),
  amount: z.number().min(0),
  category: z.string().optional(),
  date: z.date(),
  receiptUrl: z.string().optional(),
  vatAmount: z.number().optional(),
});
