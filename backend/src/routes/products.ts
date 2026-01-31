import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { collections, FieldValue } from '../config/firebase';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { validateProduct, validateProductUpdate, validateId, validatePagination } from '../middleware/validation';
import { Product } from '../types';
import { deleteCache } from '../services/cache';

const router = Router();

// Helper to invalidate user dashboard cache
const invalidateDashboardCache = (userId?: string) => {
  if (userId) {
    deleteCache(`overview_${userId}`);
    // We don't have an easy way to list all forecast variants by days, 
    // but we can invalidate the most common ones or use a more robust cache key system later.
    deleteCache(`forecast_${userId}_30`);
    deleteCache(`forecast_${userId}_7`);
  }
};

/**
 * GET /api/products
 * Get all products for the authenticated user
 */
router.get('/', authenticateToken, validatePagination, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { page = 1, limit = 50, search, category, sort = 'name' } = req.query;

    let query: FirebaseFirestore.Query = collections.products.where('userId', '==', userId);

    // Apply category filter
    if (category && category !== 'all') {
      query = query.where('category', '==', category);
    }

    // Get all products (filtering and pagination done in memory for complex queries)
    const snapshot = await query.get();

    let products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];

    // Apply search filter
    if (search) {
      const searchLower = (search as string).toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.sku.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    products.sort((a, b) => {
      switch (sort) {
        case 'quantity':
          return b.quantity - a.quantity;
        case 'velocity':
          return b.velocity - a.velocity;
        case 'expiry':
          return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        default:
          return a.name.localeCompare(b.name);
      }
    });

    // Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedProducts = products.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      data: {
        products: paginatedProducts,
        total: products.length,
        page: pageNum,
        pages: Math.ceil(products.length / limitNum)
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
});

/**
 * GET /api/products/categories
 * Get all unique categories
 */
router.get('/categories', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const snapshot = await collections.products.where('userId', '==', userId).get();

    const categories = [...new Set(snapshot.docs.map(doc => doc.data().category))];

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

/**
 * GET /api/products/low-stock
 * Get products with low stock
 */
router.get('/low-stock', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const threshold = Number(req.query.threshold) || 10;

    const snapshot = await collections.products
      .where('userId', '==', userId)
      .where('quantity', '<=', threshold)
      .get();

    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch low stock products'
    });
  }
});

/**
 * GET /api/products/expiring-soon
 * Get products expiring soon
 */
router.get('/expiring-soon', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const days = Number(req.query.days) || 7;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const snapshot = await collections.products.where('userId', '==', userId).get();

    const products = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Product))
      .filter(p => {
        if (!p.expiryDate) return false;
        const expiry = new Date(p.expiryDate);
        return expiry <= futureDate;
      })
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

    res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Get expiring products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch expiring products'
    });
  }
});

/**
 * GET /api/products/:id
 * Get a single product by ID
 */
router.get('/:id', authenticateToken, validateId, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;

    const doc = await collections.products.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const product = doc.data();

    // Verify ownership
    if (product?.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { id: doc.id, ...product }
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
});

/**
 * POST /api/products
 * Create a new product
 */
router.post('/', authenticateToken, validateProduct, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const { name, sku, category, quantity, costPrice, sellingPrice, expiryDate } = req.body;

    // Check for duplicate SKU
    const existingSku = await collections.products
      .where('userId', '==', userId)
      .where('sku', '==', sku)
      .get();

    if (!existingSku.empty) {
      return res.status(400).json({
        success: false,
        error: 'Product with this SKU already exists'
      });
    }

    const productId = uuidv4();
    const productData = {
      id: productId,
      name,
      sku,
      category,
      quantity: Number(quantity),
      costPrice: Number(costPrice),
      sellingPrice: Number(sellingPrice),
      expiryDate: expiryDate || null,
      velocity: 0,
      lastSold: new Date().toISOString().split('T')[0],
      userId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    await collections.products.doc(productId).set(productData);
    invalidateDashboardCache(userId);

    res.status(201).json({
      success: true,
      data: productData
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product'
    });
  }
});

/**
 * PUT /api/products/:id
 * Update a product
 */
router.put('/:id', authenticateToken, validateId, validateProductUpdate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;
    const updates = req.body;

    const doc = await collections.products.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    if (doc.data()?.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Sanitize updates
    const allowedFields = ['name', 'sku', 'category', 'quantity', 'costPrice', 'sellingPrice', 'expiryDate', 'velocity', 'lastSold'];
    const sanitizedUpdates: any = { updatedAt: FieldValue.serverTimestamp() };

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        sanitizedUpdates[field] = updates[field];
      }
    }

    await collections.products.doc(id).update(sanitizedUpdates);
    invalidateDashboardCache(userId);

    const updated = await collections.products.doc(id).get();

    res.json({
      success: true,
      data: { id, ...updated.data() }
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product'
    });
  }
});

/**
 * PATCH /api/products/:id/stock
 * Update stock level
 */
router.patch('/:id/stock', authenticateToken, validateId, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;
    const { quantity, operation = 'set' } = req.body;

    const doc = await collections.products.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    if (doc.data()?.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const currentQuantity = doc.data()?.quantity || 0;
    let newQuantity;

    switch (operation) {
      case 'add':
        newQuantity = currentQuantity + Number(quantity);
        break;
      case 'subtract':
        newQuantity = Math.max(0, currentQuantity - Number(quantity));
        break;
      default:
        newQuantity = Number(quantity);
    }

    await collections.products.doc(id).update({
      quantity: newQuantity,
      updatedAt: FieldValue.serverTimestamp()
    });
    invalidateDashboardCache(userId);

    res.json({
      success: true,
      data: { id, quantity: newQuantity }
    });

  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update stock'
    });
  }
});

/**
 * DELETE /api/products/:id
 * Delete a product
 */
router.delete('/:id', authenticateToken, validateId, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;

    const doc = await collections.products.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    if (doc.data()?.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    await collections.products.doc(id).delete();
    invalidateDashboardCache(userId);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product'
    });
  }
});

/**
 * POST /api/products/seed
 * Seed demo products (for development)
 */
router.post('/seed', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;

    const demoProducts = [
      { name: 'Organic Milk 1L', sku: 'DAIRY-001', category: 'Dairy', quantity: 45, costPrice: 2.50, sellingPrice: 4.99, expiryDate: '2026-02-08', velocity: 12.5 },
      { name: 'Whole Wheat Bread', sku: 'BAKERY-001', category: 'Bakery', quantity: 30, costPrice: 1.20, sellingPrice: 3.49, expiryDate: '2026-02-05', velocity: 15.2 },
      { name: 'Fresh Spinach 250g', sku: 'PROD-001', category: 'Produce', quantity: 60, costPrice: 1.00, sellingPrice: 2.99, expiryDate: '2026-02-04', velocity: 8.1 },
      { name: 'Ground Beef 500g', sku: 'MEAT-001', category: 'Meat', quantity: 25, costPrice: 4.50, sellingPrice: 8.99, expiryDate: '2026-02-06', velocity: 5.5 },
      { name: 'Greek Yogurt 500g', sku: 'DAIRY-002', category: 'Dairy', quantity: 55, costPrice: 2.00, sellingPrice: 5.49, expiryDate: '2026-02-12', velocity: 9.8 },
      { name: 'Chicken Breast 1kg', sku: 'MEAT-002', category: 'Meat', quantity: 18, costPrice: 6.00, sellingPrice: 12.99, expiryDate: '2026-02-07', velocity: 7.2 },
      { name: 'Fresh Tomatoes 1kg', sku: 'PROD-002', category: 'Produce', quantity: 40, costPrice: 1.50, sellingPrice: 3.99, expiryDate: '2026-02-09', velocity: 11.3 },
      { name: 'Croissants 4-pack', sku: 'BAKERY-002', category: 'Bakery', quantity: 22, costPrice: 2.00, sellingPrice: 5.99, expiryDate: '2026-02-03', velocity: 6.8 },
    ];

    const batch = collections.products.firestore.batch();

    for (const product of demoProducts) {
      const productId = uuidv4();
      const productRef = collections.products.doc(productId);
      batch.set(productRef, {
        id: productId,
        ...product,
        lastSold: new Date().toISOString().split('T')[0],
        userId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
    }

    await batch.commit();
    invalidateDashboardCache(userId);

    res.json({
      success: true,
      message: `${demoProducts.length} demo products created`
    });

  } catch (error) {
    console.error('Seed products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed products'
    });
  }
});

export default router;
