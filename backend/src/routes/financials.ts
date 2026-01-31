import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { collections, FieldValue } from '../config/firebase';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { validateTransaction, validateId, validatePagination } from '../middleware/validation';
import { Transaction } from '../types';
import { deleteCache } from '../services/cache';

const router = Router();

// Helper to invalidate user dashboard cache
const invalidateDashboardCache = (userId?: string) => {
  if (userId) {
    deleteCache(`overview_${userId}`);
    deleteCache(`forecast_${userId}_30`);
    deleteCache(`forecast_${userId}_7`);
  }
};

/**
 * GET /api/financials/summary
 * Get financial summary for the authenticated user
 */
router.get('/summary', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const period = req.query.period as string || 'month';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      default: // month
        startDate.setMonth(now.getMonth() - 1);
    }

    const startDateStr = startDate.toISOString().split('T')[0];

    // Get transactions in date range
    const snapshot = await collections.transactions
      .where('userId', '==', userId)
      .where('date', '>=', startDateStr)
      .get();

    const transactions = snapshot.docs.map(doc => doc.data() as Transaction);

    // Calculate totals
    const totalRevenue = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netProfit = totalRevenue - totalExpenses;

    // Calculate percentage changes (compare to previous period)
    const prevStartDate = new Date(startDate);
    prevStartDate.setMonth(prevStartDate.getMonth() - 1);

    const prevSnapshot = await collections.transactions
      .where('userId', '==', userId)
      .where('date', '>=', prevStartDate.toISOString().split('T')[0])
      .where('date', '<', startDateStr)
      .get();

    const prevTransactions = prevSnapshot.docs.map(doc => doc.data() as Transaction);
    const prevRevenue = prevTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const prevExpenses = prevTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const expenseChange = prevExpenses > 0 ? ((totalExpenses - prevExpenses) / prevExpenses) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
        revenueChange: Math.round(revenueChange * 10) / 10,
        expenseChange: Math.round(expenseChange * 10) / 10,
        profitMargin: totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 1000) / 10 : 0,
        period
      }
    });

  } catch (error) {
    console.error('Get financial summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch financial summary'
    });
  }
});

/**
 * GET /api/financials/income-expense
 * Get income vs expense data for charts
 */
router.get('/income-expense', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const months = Number(req.query.months) || 6;

    // Get transactions for the past X months
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const snapshot = await collections.transactions
      .where('userId', '==', userId)
      .where('date', '>=', startDate.toISOString().split('T')[0])
      .get();

    const transactions = snapshot.docs.map(doc => doc.data() as Transaction);

    // Group by month
    const monthlyData: Record<string, { income: number; expense: number }> = {};

    transactions.forEach(t => {
      const month = t.date.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        monthlyData[month].income += t.amount;
      } else {
        monthlyData[month].expense += t.amount;
      }
    });

    // Convert to array and sort
    const data = Object.entries(monthlyData)
      .map(([month, values]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        income: Math.round(values.income),
        expense: Math.round(values.expense)
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Get income/expense error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch income/expense data'
    });
  }
});

/**
 * GET /api/financials/expense-breakdown
 * Get expense breakdown by category for pie chart
 */
router.get('/expense-breakdown', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const period = req.query.period as string || 'month';

    // Calculate date range
    const startDate = new Date();
    if (period === 'quarter') {
      startDate.setMonth(startDate.getMonth() - 3);
    } else {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    const snapshot = await collections.transactions
      .where('userId', '==', userId)
      .where('type', '==', 'expense')
      .where('date', '>=', startDate.toISOString().split('T')[0])
      .get();

    const transactions = snapshot.docs.map(doc => doc.data() as Transaction);

    // Group by category
    const categoryData: Record<string, number> = {};

    transactions.forEach(t => {
      if (!categoryData[t.category]) {
        categoryData[t.category] = 0;
      }
      categoryData[t.category] += t.amount;
    });

    const breakdown = Object.entries(categoryData)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);

    res.json({
      success: true,
      data: breakdown
    });

  } catch (error) {
    console.error('Get expense breakdown error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch expense breakdown'
    });
  }
});

/**
 * GET /api/financials/transactions
 * Get all transactions
 */
router.get('/transactions', authenticateToken, validatePagination, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { page = 1, limit = 20, type, category, dateFrom, dateTo } = req.query;

    let query: FirebaseFirestore.Query = collections.transactions.where('userId', '==', userId);

    if (type && type !== 'all') {
      query = query.where('type', '==', type);
    }

    const snapshot = await query.orderBy('date', 'desc').get();

    let transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Transaction[];

    // Apply additional filters
    if (category) {
      transactions = transactions.filter(t => t.category === category);
    }
    if (dateFrom) {
      transactions = transactions.filter(t => t.date >= dateFrom);
    }
    if (dateTo) {
      transactions = transactions.filter(t => t.date <= dateTo);
    }

    // Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedTransactions = transactions.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        total: transactions.length,
        page: pageNum,
        pages: Math.ceil(transactions.length / limitNum)
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions'
    });
  }
});

/**
 * POST /api/financials/transactions
 * Create a new transaction
 */
router.post('/transactions', authenticateToken, validateTransaction, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { type, category, description, amount, date, status = 'completed' } = req.body;

    const transactionId = uuidv4();
    const transactionData = {
      id: transactionId,
      type,
      category,
      description: description || '',
      amount: Number(amount),
      date,
      status,
      userId,
      createdAt: FieldValue.serverTimestamp()
    };

    await collections.transactions.doc(transactionId).set(transactionData);
    invalidateDashboardCache(userId);

    res.status(201).json({
      success: true,
      data: transactionData
    });

  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create transaction'
    });
  }
});

/**
 * PUT /api/financials/transactions/:id
 * Update a transaction
 */
router.put('/transactions/:id', authenticateToken, validateId, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;
    const updates = req.body;

    const doc = await collections.transactions.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    if (doc.data()?.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const allowedFields = ['type', 'category', 'description', 'amount', 'date', 'status'];
    const sanitizedUpdates: any = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        sanitizedUpdates[field] = updates[field];
      }
    }

    await collections.transactions.doc(id).update(sanitizedUpdates);
    invalidateDashboardCache(userId);

    const updated = await collections.transactions.doc(id).get();

    res.json({
      success: true,
      data: { id, ...updated.data() }
    });

  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update transaction'
    });
  }
});

/**
 * DELETE /api/financials/transactions/:id
 * Delete a transaction
 */
router.delete('/transactions/:id', authenticateToken, validateId, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;

    const doc = await collections.transactions.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    if (doc.data()?.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    await collections.transactions.doc(id).delete();
    invalidateDashboardCache(userId);

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });

  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete transaction'
    });
  }
});

/**
 * POST /api/financials/transactions/seed
 * Seed demo transactions (for development)
 */
router.post('/transactions/seed', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const today = new Date();

    const demoTransactions = [
      { type: 'income', category: 'Sales', description: 'Daily retail sales', amount: 2450.00, date: today.toISOString().split('T')[0], status: 'completed' },
      { type: 'income', category: 'Sales', description: 'Wholesale order', amount: 1800.00, date: new Date(today.setDate(today.getDate() - 1)).toISOString().split('T')[0], status: 'completed' },
      { type: 'expense', category: 'Inventory', description: 'Stock replenishment', amount: 1200.00, date: new Date(today.setDate(today.getDate() - 1)).toISOString().split('T')[0], status: 'completed' },
      { type: 'expense', category: 'Utilities', description: 'Electricity bill', amount: 450.00, date: new Date(today.setDate(today.getDate() - 2)).toISOString().split('T')[0], status: 'completed' },
      { type: 'expense', category: 'Rent', description: 'Monthly store rent', amount: 2500.00, date: new Date(today.setDate(today.getDate() - 3)).toISOString().split('T')[0], status: 'completed' },
      { type: 'income', category: 'Sales', description: 'Weekend sales', amount: 3200.00, date: new Date(today.setDate(today.getDate() - 1)).toISOString().split('T')[0], status: 'completed' },
      { type: 'expense', category: 'Salaries', description: 'Staff wages', amount: 4500.00, date: new Date(today.setDate(today.getDate() - 5)).toISOString().split('T')[0], status: 'pending' },
    ];

    const batch = collections.transactions.firestore.batch();

    for (const transaction of demoTransactions) {
      const transactionId = uuidv4();
      const transactionRef = collections.transactions.doc(transactionId);
      batch.set(transactionRef, {
        id: transactionId,
        ...transaction,
        userId,
        createdAt: FieldValue.serverTimestamp()
      });
    }

    await batch.commit();
    invalidateDashboardCache(userId);

    res.json({
      success: true,
      message: `${demoTransactions.length} demo transactions created`
    });

  } catch (error) {
    console.error('Seed transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed transactions'
    });
  }
});

export default router;
