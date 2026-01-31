export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  expiryDate: string; // YYYY-MM-DD
  velocity: number; // units sold per day (7-day avg)
  lastSold: string;
}

export interface Insight {
  id: string;
  type: 'critical' | 'important' | 'info';
  title: string;
  description: string;
  action?: string;
  timestamp: number;
  relatedProductId?: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending';
}

export interface ForecastData {
  date: string;
  actual?: number;
  predicted: number;
  lowerBound: number;
  upperBound: number;
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface SpoilageRisk {
  productId: string;
  productName: string;
  daysToExpiry: number;
  riskScore: number;
  riskLevel: RiskLevel;
  potentialLoss: number;
  recommendation: string;
}