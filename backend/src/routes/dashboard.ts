import { Router, Response } from 'express';
import { collections } from '../config/firebase';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { analyzeSpoilageRisk, generateForecast } from '../services/groqService';
import { Product, Transaction } from '../types';

const router = Router();

/**
 * GET /api/dashboard/overview
 * Get dashboard overview with key metrics
 */
router.get('/overview', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;

    // Get products
    const productsSnapshot = await collections.products
      .where('userId', '==', userId)
      .get();

    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];

    // Calculate metrics
    const inventoryValue = products.reduce((sum, p) => sum + (p.quantity * p.costPrice), 0);
    const activeProducts = products.length;
    const lowStockProducts = products.filter(p => p.quantity < 10);

    // Calculate spoilage risks
    const spoilageRisks = await analyzeSpoilageRisk(products);
    const criticalRisks = spoilageRisks.filter(r => r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH');

    // Get recent transactions for profit calculation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactionsSnapshot = await collections.transactions
      .where('userId', '==', userId)
      .get();

    const allTransactions = transactionsSnapshot.docs.map(doc => doc.data() as Transaction);

    // Filter by date and calculate totals in memory to avoid composite index requirements
    const thirtyDaysAgoIso = thirtyDaysAgo.toISOString().split('T')[0];
    const transactions = allTransactions.filter(t => t.date >= thirtyDaysAgoIso);

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpenses;

    // Get recent insights
    const insightsSnapshot = await collections.insights
      .where('userId', '==', userId)
      .limit(5)
      .get();

    const recentInsights = insightsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate velocity metrics by category
    const velocityByCategory: Record<string, { total: number; count: number; trend: string }> = {};

    products.forEach(p => {
      if (!velocityByCategory[p.category]) {
        velocityByCategory[p.category] = { total: 0, count: 0, trend: 'stable' };
      }
      velocityByCategory[p.category].total += p.velocity;
      velocityByCategory[p.category].count += 1;
    });

    const velocityMetrics = Object.entries(velocityByCategory).map(([category, data]) => ({
      category,
      avgVelocity: Math.round((data.total / data.count) * 10) / 10,
      trend: data.total / data.count > 8 ? 'up' : data.total / data.count < 4 ? 'down' : 'stable'
    }));

    // Predict next month profit (simple projection)
    const predictedProfit = netProfit > 0 ? netProfit * 1.05 : netProfit * 0.95;
    const confidenceScore = Math.min(95, Math.max(60, 75 + (products.length * 2)));

    res.json({
      success: true,
      data: {
        stats: {
          inventoryValue: Math.round(inventoryValue * 100) / 100,
          activeProducts,
          lowStock: lowStockProducts.length,
          predictedProfit: Math.round(predictedProfit * 100) / 100,
          confidenceScore,
          netProfit: Math.round(netProfit * 100) / 100
        },
        spoilageRisks: criticalRisks.slice(0, 5),
        recentInsights,
        velocityMetrics,
        lowStockProducts: lowStockProducts.slice(0, 5).map(p => ({
          id: p.id,
          name: p.name,
          quantity: p.quantity,
          velocity: p.velocity
        }))
      }
    });

  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    });
  }
});

/**
 * GET /api/dashboard/forecast
 * Get profit forecast
 */
router.get('/forecast', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const days = Number(req.query.days) || 30;

    // Get historical transaction data
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const transactionsSnapshot = await collections.transactions
      .where('userId', '==', userId)
      .where('date', '>=', sixtyDaysAgo.toISOString().split('T')[0])
      .get();

    const transactions = transactionsSnapshot.docs.map(doc => doc.data() as Transaction);

    // Group by date and calculate daily profit
    const dailyProfit: Record<string, number> = {};

    transactions.forEach(t => {
      if (!dailyProfit[t.date]) {
        dailyProfit[t.date] = 0;
      }
      dailyProfit[t.date] += t.type === 'income' ? t.amount : -t.amount;
    });

    const historicalData = Object.entries(dailyProfit)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Generate forecast
    const forecast = await generateForecast(historicalData, days);

    // Combine historical and forecast data
    const combinedData = [
      ...historicalData.slice(-15).map(d => ({
        date: d.date,
        actual: d.amount,
        predicted: null
      })),
      ...forecast.map(f => ({
        date: f.date,
        actual: null,
        predicted: f.predicted,
        lowerBound: f.lowerBound,
        upperBound: f.upperBound
      }))
    ];

    // Calculate scenario projections
    const avgDailyProfit = historicalData.length > 0
      ? historicalData.reduce((sum, d) => sum + d.amount, 0) / historicalData.length
      : 0;

    res.json({
      success: true,
      data: {
        forecast: combinedData,
        scenarios: {
          baseCase: {
            monthlyProfit: Math.round(avgDailyProfit * 30),
            confidence: 0.75
          },
          bestCase: {
            monthlyProfit: Math.round(avgDailyProfit * 30 * 1.25),
            confidence: 0.60
          },
          worstCase: {
            monthlyProfit: Math.round(avgDailyProfit * 30 * 0.75),
            confidence: 0.60
          }
        },
        drivers: [
          { name: 'Seasonal demand increase', impact: '+8%', direction: 'up' },
          { name: 'Utility costs rising', impact: '-3%', direction: 'down' },
          { name: 'New supplier discount', impact: '+5%', direction: 'up' },
          { name: 'Competitor pricing', impact: '-2%', direction: 'down' }
        ]
      }
    });

  } catch (error) {
    console.error('Get forecast error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate forecast'
    });
  }
});

export default router;
