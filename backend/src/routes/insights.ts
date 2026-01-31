import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { collections, FieldValue } from '../config/firebase';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { generateInventoryInsights, analyzeSpoilageRisk } from '../services/groqService';
import { Product, Insight } from '../types';

const router = Router();

/**
 * GET /api/insights
 * Get all insights for the authenticated user
 */
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { type, limit = 20, relatedProductId } = req.query;

    let query: FirebaseFirestore.Query = collections.insights
      .where('userId', '==', userId);

    if (type && type !== 'all') {
      query = query.where('type', '==', type);
    }

    const snapshot = await query.limit(Number(limit)).get();

    let insights = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Insight[];

    // Filter by related product if specified
    if (relatedProductId) {
      insights = insights.filter(i => i.relatedProductId === relatedProductId);
    }

    res.json({
      success: true,
      data: insights
    });

  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch insights'
    });
  }
});

/**
 * POST /api/insights/generate
 * Generate new AI insights based on current inventory
 */
router.post('/generate', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { focusArea = 'general' } = req.body;

    // Get user's products
    const productsSnapshot = await collections.products
      .where('userId', '==', userId)
      .get();

    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];

    if (products.length === 0) {
      return res.json({
        success: true,
        data: {
          insights: [],
          message: 'No products found. Add products to generate insights.'
        }
      });
    }

    // Generate insights using Groq AI
    const generatedInsights = await generateInventoryInsights(products);

    // Save insights to database
    const batch = collections.insights.firestore.batch();
    const savedInsights: Insight[] = [];

    for (const insight of generatedInsights) {
      const insightId = uuidv4();
      const insightData: Insight = {
        id: insightId,
        type: insight.type as 'critical' | 'important' | 'info',
        title: insight.title || 'Insight',
        description: insight.description || '',
        action: insight.action || '',
        timestamp: Date.now(),
        userId: userId!,
        generatedBy: insight.generatedBy || 'groq-llama-3.3-70b'
      };

      batch.set(collections.insights.doc(insightId), insightData);
      savedInsights.push(insightData);
    }

    await batch.commit();

    res.json({
      success: true,
      data: {
        insights: savedInsights,
        generatedAt: Date.now()
      }
    });

  } catch (error) {
    console.error('Generate insights error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate insights'
    });
  }
});

/**
 * GET /api/insights/spoilage-risks
 * Get spoilage risk analysis for all products
 */
router.get('/spoilage-risks', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;

    // Get user's products
    const productsSnapshot = await collections.products
      .where('userId', '==', userId)
      .get();

    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];

    // Analyze spoilage risks
    const risks = await analyzeSpoilageRisk(products);

    res.json({
      success: true,
      data: risks
    });

  } catch (error) {
    console.error('Get spoilage risks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze spoilage risks'
    });
  }
});

/**
 * POST /api/insights/:id/action
 * Mark an insight action as taken
 */
router.post('/:id/action', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;
    const { action, result } = req.body;

    const doc = await collections.insights.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Insight not found'
      });
    }

    if (doc.data()?.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    await collections.insights.doc(id).update({
      actionTaken: action,
      actionResult: result,
      actionTimestamp: Date.now()
    });

    res.json({
      success: true,
      message: 'Action recorded'
    });

  } catch (error) {
    console.error('Record action error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record action'
    });
  }
});

/**
 * DELETE /api/insights/:id
 * Delete an insight
 */
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;

    const doc = await collections.insights.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Insight not found'
      });
    }

    if (doc.data()?.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    await collections.insights.doc(id).delete();

    res.json({
      success: true,
      message: 'Insight deleted'
    });

  } catch (error) {
    console.error('Delete insight error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete insight'
    });
  }
});

/**
 * DELETE /api/insights
 * Clear all insights for the user
 */
router.delete('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;

    const snapshot = await collections.insights
      .where('userId', '==', userId)
      .get();

    const batch = collections.insights.firestore.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    res.json({
      success: true,
      message: `${snapshot.size} insights deleted`
    });

  } catch (error) {
    console.error('Clear insights error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear insights'
    });
  }
});

export default router;
