// Product types
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  expiryDate: string;
  velocity: number;
  lastSold: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  location?: string;
  role: 'admin' | 'manager' | 'staff';
  mfaEnabled: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Insight types
export interface Insight {
  id: string;
  type: 'critical' | 'important' | 'info';
  title: string;
  description: string;
  action: string;
  timestamp: number;
  relatedProductId?: string;
  userId: string;
  generatedBy: string;
}

// Transaction types
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending';
  userId: string;
  createdAt: Date;
}

// Spoilage Risk types
export interface SpoilageRisk {
  productId: string;
  productName: string;
  daysToExpiry: number;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  potentialLoss: number;
  recommendation: string;
}

// Forecast types
export interface ForecastData {
  date: string;
  actual?: number;
  predicted: number;
  lowerBound?: number;
  upperBound?: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// Chat types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatRequest {
  message: string;
  context?: {
    products?: Product[];
    recentInsights?: Insight[];
  };
}
