import { auth } from './firebase';

// Configuration de base pour les requêtes API
const API_BASE_URL = '/api';

// Fonction pour obtenir le token d'authentification
export async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    return null;
  }
}

// Fonction utilitaire pour faire des requêtes authentifiées
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
    throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
  }
  
  return response.json();
}

// Fonctions spécifiques pour les différentes entités
export const api = {
  // Utilisateur
  getUser: () => apiRequest('/auth/user'),
  
  // Dashboard
  getDashboardMetrics: () => apiRequest('/dashboard/metrics'),
  
  // Clients
  getClients: () => apiRequest('/clients'),
  getClient: (id: number) => apiRequest(`/clients/${id}`),
  createClient: (data: any) => apiRequest('/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateClient: (id: number, data: any) => apiRequest(`/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteClient: (id: number) => apiRequest(`/clients/${id}`, {
    method: 'DELETE',
  }),
  
  // Projets
  getProjects: () => apiRequest('/projects'),
  createProject: (data: any) => apiRequest('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateProject: (id: number, data: any) => apiRequest(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteProject: (id: number) => apiRequest(`/projects/${id}`, {
    method: 'DELETE',
  }),
  
  // Tâches
  getTasks: (projectId: number) => apiRequest(`/projects/${projectId}/tasks`),
  createTask: (data: any) => apiRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateTask: (id: number, data: any) => apiRequest(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Entrées de temps
  getTimeEntries: (projectId?: number) => {
    const params = projectId ? `?projectId=${projectId}` : '';
    return apiRequest(`/time-entries${params}`);
  },
  getActiveTimeEntry: () => apiRequest('/time-entries/active'),
  createTimeEntry: (data: any) => apiRequest('/time-entries', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateTimeEntry: (id: number, data: any) => apiRequest(`/time-entries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  stopTimeEntry: (id: number) => apiRequest(`/time-entries/${id}/stop`, {
    method: 'PUT',
  }),
  deleteTimeEntry: (id: number) => apiRequest(`/time-entries/${id}`, {
    method: 'DELETE',
  }),
  
  // Catalogue
  getCatalogItems: () => apiRequest('/catalog'),
  createCatalogItem: (data: any) => apiRequest('/catalog', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateCatalogItem: (id: number, data: any) => apiRequest(`/catalog/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteCatalogItem: (id: number) => apiRequest(`/catalog/${id}`, {
    method: 'DELETE',
  }),
  
  // Devis
  getQuotes: () => apiRequest('/quotes'),
  createQuote: (data: any) => apiRequest('/quotes', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateQuote: (id: number, data: any) => apiRequest(`/quotes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  convertQuoteToInvoice: (id: number) => apiRequest(`/quotes/${id}/convert`, {
    method: 'POST',
  }),
  
  // Factures
  getInvoices: () => apiRequest('/invoices'),
  createInvoice: (data: any) => apiRequest('/invoices', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateInvoice: (id: number, data: any) => apiRequest(`/invoices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Dépenses
  getExpenses: () => apiRequest('/expenses'),
  createExpense: (data: any) => apiRequest('/expenses', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateExpense: (id: number, data: any) => apiRequest(`/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteExpense: (id: number) => apiRequest(`/expenses/${id}`, {
    method: 'DELETE',
  }),
};