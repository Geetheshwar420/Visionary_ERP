// AI Service - Now proxied through backend for security (Groq Llama 3.3 70B)
import { Product, Insight } from '../types';
import { insightsApi } from './api';

/**
 * Generate inventory insights using backend API (Groq Llama 3.3 70B)
 */
export const generateInventoryInsights = async (products: Product[]): Promise<Insight[]> => {
  try {
    const result = await insightsApi.generate('general');
    
    if (result.success && result.data?.insights) {
      return result.data.insights;
    }
    
    // Fallback to demo insights if API fails
    return getDemoInsights();
  } catch (error) {
    console.error("Error generating insights:", error);
    return getDemoInsights();
  }
};

/**
 * Get spoilage risk analysis from backend
 */
export const getSpoilageRisks = async () => {
  try {
    const result = await insightsApi.getSpoilageRisks();
    
    if (result.success && result.data) {
      return result.data;
    }
    
    return [];
  } catch (error) {
    console.error("Error getting spoilage risks:", error);
    return [];
  }
};

// Demo fallback insights
function getDemoInsights(): Insight[] {
  return [
    {
      id: `demo-${Date.now()}-1`,
      type: 'critical',
      title: 'Dairy Products Expiring Soon',
      description: 'Multiple dairy items expire within 3 days. Consider promotional pricing.',
      action: 'Apply 40% discount to dairy section',
      timestamp: Date.now()
    },
    {
      id: `demo-${Date.now()}-2`,
      type: 'important',
      title: 'High Velocity: Bread Category',
      description: 'Bread products selling 3x faster than average. Risk of stockout.',
      action: 'Reorder 50 additional units today',
      timestamp: Date.now()
    },
    {
      id: `demo-${Date.now()}-3`,
      type: 'info',
      title: 'Margin Opportunity Detected',
      description: 'Premium items have room for 5% price increase based on velocity.',
      action: 'Review pricing for premium category',
      timestamp: Date.now()
    }
  ];
}

export default {
  generateInventoryInsights,
  getSpoilageRisks
};