import { Product, Insight, ForecastData } from './types';

export const APP_NAME = "Visionary ERP";

// Generate some dates relative to today
const today = new Date();
const addDays = (days: number) => {
  const result = new Date(today);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
};

export const MOCK_PRODUCTS: Product[] = [];

export const INITIAL_INSIGHTS: Insight[] = [];

export const FORECAST_DATA: ForecastData[] = [];