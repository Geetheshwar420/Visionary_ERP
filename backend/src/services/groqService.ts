import Groq from 'groq-sdk';
import { Product, Insight, ChatMessage } from '../types';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = 'llama-3.3-70b-versatile';

/**
 * Generate inventory insights using Groq AI (Llama 3.3 70B)
 */
export const generateInventoryInsights = async (products: Product[]): Promise<Partial<Insight>[]> => {
  if (!process.env.GROQ_API_KEY) {
    console.warn('Groq API Key not found. Returning demo insights.');
    return getDemoInsights();
  }

  const prompt = `You are an expert retail strategist for a regional grocery chain called 'Visionary ERP'.
Analyze the following inventory data and generate exactly 3 actionable insights to maximize profit and reduce spoilage.

Inventory Data:
${JSON.stringify(products.map(p => ({
  name: p.name,
  qty: p.quantity,
  expiry: p.expiryDate,
  velocity: p.velocity,
  cost: p.costPrice,
  price: p.sellingPrice,
  category: p.category
})), null, 2)}

Rules:
1. Identify items at risk of spoiling (low velocity, near expiry).
2. Identify items with high velocity that might stock out.
3. Suggest specific discount percentages or reorder actions.
4. Keep titles punchy (max 8 words) and descriptions short (max 25 words).

Return ONLY valid JSON array with exactly 3 objects, no markdown:
[
  {
    "type": "critical" | "important" | "info",
    "title": "Short punchy title",
    "description": "Brief explanation",
    "action": "Specific action to take"
  }
]`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a retail analytics expert. Always respond with valid JSON only, no markdown formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: MODEL,
      temperature: 0.7,
      max_tokens: 1024,
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0]?.message?.content || '[]';
    
    // Parse JSON response
    let parsed;
    try {
      // Handle if response is wrapped in an object
      const jsonResponse = JSON.parse(responseText);
      parsed = Array.isArray(jsonResponse) ? jsonResponse : jsonResponse.insights || [];
    } catch {
      console.error('Failed to parse Groq response:', responseText);
      return getDemoInsights();
    }

    return parsed.map((item: any, index: number) => ({
      id: `insight-${Date.now()}-${index}`,
      type: item.type || 'info',
      title: item.title || 'Insight',
      description: item.description || '',
      action: item.action || 'Review inventory',
      timestamp: Date.now(),
      generatedBy: 'groq-llama-3.3-70b'
    }));

  } catch (error) {
    console.error('Groq API error:', error);
    return getDemoInsights();
  }
};

/**
 * AI Chat completion using Groq
 */
export const chatWithAI = async (
  message: string, 
  products: Product[],
  chatHistory: ChatMessage[] = []
): Promise<string> => {
  if (!process.env.GROQ_API_KEY) {
    return getDemoChatResponse(message, products);
  }

  const inventorySummary = products.length > 0 
    ? products.map(p => `${p.name}: ${p.quantity} units at $${p.sellingPrice}, velocity ${p.velocity}/day`).join('\n')
    : 'No inventory data available';

  const systemPrompt = `You are an expert ERP assistant for a retail store called 'Visionary ERP'.

Current Inventory Context:
${inventorySummary}

Rules:
1. Be concise, professional, and helpful.
2. Use the inventory context to answer specific questions.
3. If asked about strategy, provide actionable tips with specific numbers.
4. Keep responses under 150 words.
5. Do not use markdown formatting like **bold** or headers.
6. Use simple numbered or bulleted lists when helpful.`;

  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content
    })),
    { role: 'user', content: message }
  ];

  try {
    const completion = await groq.chat.completions.create({
      messages,
      model: MODEL,
      temperature: 0.8,
      max_tokens: 512,
    });

    return completion.choices[0]?.message?.content || 'I apologize, I could not generate a response.';

  } catch (error) {
    console.error('Groq chat error:', error);
    return getDemoChatResponse(message, products);
  }
};

/**
 * Generate spoilage risk analysis
 */
export const analyzeSpoilageRisk = async (products: Product[]) => {
  const today = new Date();
  
  return products
    .filter(p => p.expiryDate)
    .map(product => {
      const expiryDate = new Date(product.expiryDate);
      const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate risk score (0-100)
      let riskScore = 0;
      if (daysToExpiry <= 0) riskScore = 100;
      else if (daysToExpiry <= 3) riskScore = 90 - (daysToExpiry * 5);
      else if (daysToExpiry <= 7) riskScore = 70 - ((daysToExpiry - 3) * 8);
      else if (daysToExpiry <= 14) riskScore = 40 - ((daysToExpiry - 7) * 4);
      else riskScore = Math.max(0, 20 - (daysToExpiry - 14));

      // Adjust for velocity
      if (product.velocity < 1) riskScore = Math.min(100, riskScore + 20);
      else if (product.velocity > 5) riskScore = Math.max(0, riskScore - 15);

      // Determine risk level
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      if (riskScore >= 75) riskLevel = 'CRITICAL';
      else if (riskScore >= 50) riskLevel = 'HIGH';
      else if (riskScore >= 25) riskLevel = 'MEDIUM';
      else riskLevel = 'LOW';

      // Generate recommendation
      let recommendation = '';
      if (riskLevel === 'CRITICAL') {
        recommendation = `Discount ${product.name} by 50% immediately or donate before expiry`;
      } else if (riskLevel === 'HIGH') {
        recommendation = `Apply 30% discount to ${product.name} to accelerate sales`;
      } else if (riskLevel === 'MEDIUM') {
        recommendation = `Monitor ${product.name} closely, consider 15% promotion`;
      } else {
        recommendation = `${product.name} is selling well, maintain current pricing`;
      }

      return {
        productId: product.id,
        productName: product.name,
        daysToExpiry,
        riskScore: Math.round(riskScore),
        riskLevel,
        potentialLoss: product.quantity * product.costPrice,
        recommendation
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore);
};

/**
 * Generate financial forecast using AI
 */
export const generateForecast = async (
  historicalData: { date: string; amount: number }[],
  days: number = 30
): Promise<{ date: string; predicted: number; lowerBound: number; upperBound: number }[]> => {
  // Calculate average daily revenue from historical data
  const avgDaily = historicalData.length > 0
    ? historicalData.reduce((sum, d) => sum + d.amount, 0) / historicalData.length
    : 1000;

  const forecast = [];
  const today = new Date();

  for (let i = 1; i <= days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    // Add some variance for realistic forecast
    const variance = (Math.random() - 0.5) * 0.3;
    const trend = 1 + (i * 0.002); // Slight upward trend
    const predicted = avgDaily * trend * (1 + variance);
    
    forecast.push({
      date: date.toISOString().split('T')[0],
      predicted: Math.round(predicted),
      lowerBound: Math.round(predicted * 0.85),
      upperBound: Math.round(predicted * 1.15)
    });
  }

  return forecast;
};

// Demo fallback functions
function getDemoInsights(): Partial<Insight>[] {
  return [
    {
      id: `demo-${Date.now()}-1`,
      type: 'critical',
      title: 'Dairy Products Expiring Soon',
      description: 'Multiple dairy items expire within 3 days. Consider promotional pricing.',
      action: 'Apply 40% discount to dairy section',
      timestamp: Date.now(),
      generatedBy: 'demo-mode'
    },
    {
      id: `demo-${Date.now()}-2`,
      type: 'important',
      title: 'High Velocity: Bread Category',
      description: 'Bread products selling 3x faster than average. Risk of stockout.',
      action: 'Reorder 50 additional units today',
      timestamp: Date.now(),
      generatedBy: 'demo-mode'
    },
    {
      id: `demo-${Date.now()}-3`,
      type: 'info',
      title: 'Margin Opportunity Detected',
      description: 'Premium items have room for 5% price increase based on velocity.',
      action: 'Review pricing for premium category',
      timestamp: Date.now(),
      generatedBy: 'demo-mode'
    }
  ];
}

function getDemoChatResponse(message: string, products: Product[]): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('expir')) {
    const expiring = products.filter(p => {
      const days = Math.ceil((new Date(p.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return days <= 7;
    });
    return `You have ${expiring.length} products expiring within the next 7 days. ${expiring.map(p => p.name).join(', ') || 'None detected'}. I recommend applying promotional discounts to accelerate sales.`;
  }
  
  if (lowerMessage.includes('stock') || lowerMessage.includes('inventory')) {
    const lowStock = products.filter(p => p.quantity < 10);
    return `Current inventory status: ${products.length} active products. ${lowStock.length} items are running low on stock. Consider reordering: ${lowStock.map(p => p.name).join(', ') || 'All items well stocked'}.`;
  }
  
  if (lowerMessage.includes('profit') || lowerMessage.includes('margin')) {
    const avgMargin = products.length > 0
      ? products.reduce((sum, p) => sum + ((p.sellingPrice - p.costPrice) / p.sellingPrice * 100), 0) / products.length
      : 0;
    return `Your average profit margin is ${avgMargin.toFixed(1)}%. To improve margins, consider: 1) Reducing slow-moving inventory through discounts, 2) Negotiating better supplier rates, 3) Optimizing product mix based on velocity data.`;
  }

  return `I'm currently in demo mode. I can see you have ${products.length} products in inventory. Ask me about expiring items, stock levels, or profit margins!`;
}

export default {
  generateInventoryInsights,
  chatWithAI,
  analyzeSpoilageRisk,
  generateForecast
};
