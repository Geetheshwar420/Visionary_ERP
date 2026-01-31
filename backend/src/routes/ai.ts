import { Router, Response } from 'express';
import { collections } from '../config/firebase';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { chatWithAI } from '../services/groqService';
import { Product, ChatMessage } from '../types';

const router = Router();

/**
 * POST /api/ai/chat
 * Chat with AI assistant (using Groq Llama 3.3 70B)
 */
router.post('/chat', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { message, chatHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Get user's products for context
    const productsSnapshot = await collections.products
      .where('userId', '==', userId)
      .get();

    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];

    // Convert chat history format
    const formattedHistory: ChatMessage[] = chatHistory.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text || msg.content,
      timestamp: msg.timestamp || Date.now()
    }));

    // Get AI response
    const response = await chatWithAI(message, products, formattedHistory);

    res.json({
      success: true,
      data: {
        response,
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get AI response'
    });
  }
});

/**
 * POST /api/ai/analyze
 * Analyze specific data with AI
 */
router.post('/analyze', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { analysisType, data } = req.body;

    // Get products if needed
    const productsSnapshot = await collections.products
      .where('userId', '==', userId)
      .get();

    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];

    let prompt = '';
    
    switch (analysisType) {
      case 'pricing':
        prompt = `Analyze pricing strategy for these products and suggest optimizations: ${JSON.stringify(products.slice(0, 10))}`;
        break;
      case 'inventory':
        prompt = `Analyze inventory levels and suggest reorder quantities: ${JSON.stringify(products.slice(0, 10))}`;
        break;
      case 'trends':
        prompt = `Identify sales trends and patterns from this data: ${JSON.stringify(data || products.slice(0, 10))}`;
        break;
      default:
        prompt = `Provide business insights for this retail store data: ${JSON.stringify(products.slice(0, 10))}`;
    }

    const response = await chatWithAI(prompt, products, []);

    res.json({
      success: true,
      data: {
        analysis: response,
        analysisType,
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('AI analyze error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform analysis'
    });
  }
});

/**
 * GET /api/ai/recommendations
 * Get AI-powered recommendations
 */
router.get('/recommendations', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const category = req.query.category as string;
    const count = Number(req.query.count) || 5;

    // Get user's products
    const productsSnapshot = await collections.products
      .where('userId', '==', userId)
      .get();

    let products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];

    if (category) {
      products = products.filter(p => p.category === category);
    }

    const prompt = `Based on these ${products.length} products, provide ${count} specific actionable recommendations to improve profitability. Focus on pricing, inventory management, and loss reduction.`;

    const response = await chatWithAI(prompt, products, []);

    // Parse recommendations from response
    const recommendations = response
      .split(/\d+\./)
      .filter(r => r.trim().length > 0)
      .slice(0, count)
      .map((r, i) => ({
        id: i + 1,
        text: r.trim(),
        category: category || 'general'
      }));

    res.json({
      success: true,
      data: recommendations
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendations'
    });
  }
});

export default router;
