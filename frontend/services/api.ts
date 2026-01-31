// API Client for Visionary ERP Backend
import { Product, Insight, Transaction, ForecastData, SpoilageRisk } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Token management
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
};

export const getAccessToken = (): string | null => {
  if (!accessToken) {
    accessToken = localStorage.getItem('accessToken');
  }
  return accessToken;
};

// API request helper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> => {
  const token = getAccessToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Request failed' };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error('API request error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
};

// ============ AUTH API ============

export const authApi = {
  register: async (email: string, password: string, name: string) => {
    const result = await apiRequest<{ user: any; accessToken: string; refreshToken: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ email, password, name })
      }
    );
    if (result.success && result.data?.accessToken) {
      setAccessToken(result.data.accessToken);
      localStorage.setItem('refreshToken', result.data.refreshToken);
    }
    return result;
  },

  login: async (email: string, password: string) => {
    const result = await apiRequest<{ user: any; accessToken: string; refreshToken: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }
    );
    if (result.success && result.data?.accessToken) {
      setAccessToken(result.data.accessToken);
      localStorage.setItem('refreshToken', result.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(result.data.user));
    }
    return result;
  },

  loginWithGoogle: async (email: string, name: string, photoURL?: string) => {
    const result = await apiRequest<{ user: any; accessToken: string; refreshToken: string }>(
      '/auth/login-google',
      {
        method: 'POST',
        body: JSON.stringify({ email, name, photoURL })
      }
    );
    if (result.success && result.data?.accessToken) {
      setAccessToken(result.data.accessToken);
      localStorage.setItem('refreshToken', result.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(result.data.user));
    }
    return result;
  },

  logout: async () => {
    await apiRequest('/auth/logout', { method: 'POST' });
    setAccessToken(null);
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getProfile: () => apiRequest<any>('/auth/profile'),

  updateProfile: (data: { name?: string; phone?: string; location?: string }) =>
    apiRequest<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest<any>('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    }),

  forgotPassword: (email: string) =>
    apiRequest<any>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  verifyEmail: (email: string, code: string) =>
    apiRequest<any>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code })
    }),

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return { success: false, error: 'No refresh token' };

    const result = await apiRequest<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    });

    if (result.success && result.data?.accessToken) {
      setAccessToken(result.data.accessToken);
    }
    return result;
  }
};

// ============ PRODUCTS API ============

export const productsApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; category?: string; sort?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.search) queryParams.set('search', params.search);
    if (params?.category) queryParams.set('category', params.category);
    if (params?.sort) queryParams.set('sort', params.sort);

    return apiRequest<{ products: Product[]; total: number; page: number; pages: number }>(
      `/products?${queryParams.toString()}`
    );
  },

  getById: (id: string) => apiRequest<Product>(`/products/${id}`),

  getCategories: () => apiRequest<string[]>('/products/categories'),

  getLowStock: (threshold?: number) =>
    apiRequest<Product[]>(`/products/low-stock${threshold ? `?threshold=${threshold}` : ''}`),

  getExpiringSoon: (days?: number) =>
    apiRequest<Product[]>(`/products/expiring-soon${days ? `?days=${days}` : ''}`),

  create: (product: Omit<Product, 'id' | 'velocity' | 'lastSold'>) =>
    apiRequest<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product)
    }),

  update: (id: string, updates: Partial<Product>) =>
    apiRequest<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  updateStock: (id: string, quantity: number, operation: 'add' | 'subtract' | 'set' = 'set') =>
    apiRequest<{ id: string; quantity: number }>(`/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity, operation })
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/products/${id}`, { method: 'DELETE' }),

  seed: () => apiRequest<{ message: string }>('/products/seed', { method: 'POST' })
};

// ============ FINANCIALS API ============

export const financialsApi = {
  getSummary: (period?: 'week' | 'month' | 'quarter') =>
    apiRequest<{
      totalRevenue: number;
      totalExpenses: number;
      netProfit: number;
      revenueChange: number;
      expenseChange: number;
      profitMargin: number;
    }>(`/financials/summary${period ? `?period=${period}` : ''}`),

  getIncomeExpense: (months?: number) =>
    apiRequest<{ month: string; income: number; expense: number }[]>(
      `/financials/income-expense${months ? `?months=${months}` : ''}`
    ),

  getExpenseBreakdown: (period?: 'month' | 'quarter') =>
    apiRequest<{ name: string; value: number }[]>(
      `/financials/expense-breakdown${period ? `?period=${period}` : ''}`
    ),

  getTransactions: (params?: { page?: number; limit?: number; type?: string; category?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.type) queryParams.set('type', params.type);
    if (params?.category) queryParams.set('category', params.category);

    return apiRequest<{ transactions: Transaction[]; total: number }>(`/financials/transactions?${queryParams.toString()}`);
  },

  createTransaction: (transaction: Omit<Transaction, 'id'>) =>
    apiRequest<Transaction>('/financials/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction)
    }),

  updateTransaction: (id: string, updates: Partial<Transaction>) =>
    apiRequest<Transaction>(`/financials/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  deleteTransaction: (id: string) =>
    apiRequest<{ message: string }>(`/financials/transactions/${id}`, { method: 'DELETE' }),

  seedTransactions: () =>
    apiRequest<{ message: string }>('/financials/transactions/seed', { method: 'POST' })
};

// ============ INSIGHTS API ============

export const insightsApi = {
  getAll: (params?: { type?: string; limit?: number; relatedProductId?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.set('type', params.type);
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.relatedProductId) queryParams.set('relatedProductId', params.relatedProductId);

    return apiRequest<Insight[]>(`/insights?${queryParams.toString()}`);
  },

  generate: (focusArea?: string) =>
    apiRequest<{ insights: Insight[]; generatedAt: number }>('/insights/generate', {
      method: 'POST',
      body: JSON.stringify({ focusArea })
    }),

  getSpoilageRisks: () => apiRequest<SpoilageRisk[]>('/insights/spoilage-risks'),

  recordAction: (id: string, action: string, result?: string) =>
    apiRequest<any>(`/insights/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, result })
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/insights/${id}`, { method: 'DELETE' }),

  clearAll: () =>
    apiRequest<{ message: string }>('/insights', { method: 'DELETE' })
};

// ============ DASHBOARD API ============

export const dashboardApi = {
  getOverview: () =>
    apiRequest<{
      stats: {
        inventoryValue: number;
        activeProducts: number;
        lowStock: number;
        predictedProfit: number;
        confidenceScore: number;
        netProfit: number;
      };
      spoilageRisks: SpoilageRisk[];
      recentInsights: Insight[];
      velocityMetrics: { category: string; avgVelocity: number; trend: string }[];
      lowStockProducts: { id: string; name: string; quantity: number; velocity: number }[];
    }>('/dashboard/overview'),

  getForecast: (days?: number) =>
    apiRequest<{
      forecast: ForecastData[];
      scenarios: {
        baseCase: { monthlyProfit: number; confidence: number };
        bestCase: { monthlyProfit: number; confidence: number };
        worstCase: { monthlyProfit: number; confidence: number };
      };
      drivers: { name: string; impact: string; direction: string }[];
    }>(`/dashboard/forecast${days ? `?days=${days}` : ''}`)
};

// ============ AI API ============

export const aiApi = {
  chat: (message: string, chatHistory?: { role: string; text: string; timestamp: number }[]) =>
    apiRequest<{ response: string; timestamp: number }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, chatHistory })
    }),

  analyze: (analysisType: 'pricing' | 'inventory' | 'trends', data?: any) =>
    apiRequest<{ analysis: string; timestamp: number }>('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({ analysisType, data })
    }),

  getRecommendations: (category?: string, count?: number) => {
    const queryParams = new URLSearchParams();
    if (category) queryParams.set('category', category);
    if (count) queryParams.set('count', count.toString());

    return apiRequest<{ id: number; text: string; category: string }[]>(
      `/ai/recommendations?${queryParams.toString()}`
    );
  }
};

export default {
  auth: authApi,
  products: productsApi,
  financials: financialsApi,
  insights: insightsApi,
  dashboard: dashboardApi,
  ai: aiApi
};
