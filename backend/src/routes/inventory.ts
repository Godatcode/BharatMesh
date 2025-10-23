import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate, requirePermission, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import Product from '../models/Product';
import { generateId } from '../utils/ulid';
import logger from '../utils/logger';

const router = Router();

router.use(authenticate);

/**
 * POST /api/inventory/products
 * Create new product
 */
router.post('/products',
  requirePermission('inventory', 'create'),
  validate([
    body('name').trim().notEmpty(),
    body('unitPrice').isFloat({ min: 0 }),
    body('costPrice').isFloat({ min: 0 }),
    body('unit').isIn(['kg', 'g', 'l', 'ml', 'piece', 'box', 'packet']),
    body('stock').optional().isFloat({ min: 0 }),
    body('reorderLevel').optional().isFloat({ min: 0 })
  ]),
  async (req: AuthRequest, res) => {
    try {
      const product = new Product({
        _id: generateId(),
        userId: req.user!.id,  // Critical: Associate with logged-in user
        ...req.body,
        stock: req.body.stock || 0,
        reorderLevel: req.body.reorderLevel || 10,
        batches: [],
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      
      await product.save();
      
      logger.info('Product created', { productId: product._id, name: product.name });
      
      res.status(201).json({
        success: true,
        data: product.toJSON()
      });
    } catch (error) {
      logger.error('Create product error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to create product' }
      });
    }
  }
);

/**
 * GET /api/inventory/products
 * List products with search and pagination
 */
router.get('/products',
  requirePermission('inventory', 'read'),
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('category').optional().isString(),
    query('lowStock').optional().isBoolean()
  ]),
  async (req: AuthRequest, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 50;
      const skip = (page - 1) * pageSize;
      
      const filter: any = { 
        isActive: true,
        userId: req.user!.id  // Critical: Only show products for the logged-in user
      };
      
      if (req.query.search) {
        filter.$text = { $search: req.query.search as string };
      }
      
      if (req.query.category) {
        filter.category = req.query.category;
      }
      
      if (req.query.lowStock === 'true') {
        filter.$expr = { $lt: ['$stock', '$reorderLevel'] };
      }
      
      const [products, total] = await Promise.all([
        Product.find(filter)
          .sort({ name: 1 })
          .skip(skip)
          .limit(pageSize)
          .lean(),
        Product.countDocuments(filter)
      ]);
      
      res.json({
        success: true,
        data: products.map(p => ({ ...p, id: p._id })),
        meta: { page, pageSize, total, timestamp: Date.now() }
      });
    } catch (error) {
      logger.error('List products error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to list products' }
      });
    }
  }
);

/**
 * GET /api/inventory/products/:id
 * Get single product
 */
router.get('/products/:id',
  requirePermission('inventory', 'read'),
  async (req: AuthRequest, res) => {
    try {
      const product = await Product.findOne({ 
        _id: req.params.id, 
        userId: req.user!.id  // Only allow access to user's own products
      });
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Product not found' }
        });
      }
      
      res.json({
        success: true,
        data: product.toJSON()
      });
    } catch (error) {
      logger.error('Get product error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to get product' }
      });
    }
  }
);

/**
 * PUT /api/inventory/products/:id
 * Update product
 */
router.put('/products/:id',
  requirePermission('inventory', 'update'),
  async (req: AuthRequest, res) => {
    try {
      const updates = req.body;
      delete updates._id;
      delete updates.createdAt;
      updates.updatedAt = Date.now();
      
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
      );
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Product not found' }
        });
      }
      
      logger.info('Product updated', { productId: product._id });
      
      res.json({
        success: true,
        data: product.toJSON()
      });
    } catch (error) {
      logger.error('Update product error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to update product' }
      });
    }
  }
);

/**
 * POST /api/inventory/products/:id/adjust-stock
 * Adjust product stock
 */
router.post('/products/:id/adjust-stock',
  requirePermission('inventory', 'update'),
  validate([
    body('delta').isFloat(),
    body('reason').isIn(['received', 'sold', 'damage', 'theft', 'return', 'adjustment', 'expired']),
    body('notes').optional().isString()
  ]),
  async (req: AuthRequest, res) => {
    try {
      const { delta, reason, notes } = req.body;
      
      const product = await Product.findOne({ 
        _id: req.params.id, 
        userId: req.user!.id  // Only allow access to user's own products
      });
      if (!product) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Product not found' }
        });
      }
      
      const newStock = product.stock + delta;
      if (newStock < 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'INSUFFICIENT_STOCK', message: 'Insufficient stock' }
        });
      }
      
      product.stock = newStock;
      product.updatedAt = Date.now();
      await product.save();
      
      logger.info('Stock adjusted', { 
        productId: product._id, 
        delta, 
        newStock, 
        reason 
      });
      
      res.json({
        success: true,
        data: product.toJSON()
      });
    } catch (error) {
      logger.error('Adjust stock error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to adjust stock' }
      });
    }
  }
);

/**
 * GET /api/inventory/alerts
 * Get inventory alerts (low stock, expiring items)
 */
router.get('/alerts',
  requirePermission('inventory', 'read'),
  async (req: AuthRequest, res) => {
    try {
      // Low stock products
      const lowStockProducts = await Product.find({
        isActive: true,
        userId: req.user!.id,  // Only show user's own products
        $expr: { $lt: ['$stock', '$reorderLevel'] }
      }).limit(50).lean();
      
      // Expiring batches (next 30 days)
      const expiryThreshold = new Date();
      expiryThreshold.setDate(expiryThreshold.getDate() + 30);
      const expiryThresholdISO = expiryThreshold.toISOString();
      
      const expiringProducts = await Product.find({
        isActive: true,
        userId: req.user!.id,  // Only show user's own products
        'batches.expiry': { $lte: expiryThresholdISO }
      }).lean();
      
      const expiryAlerts = expiringProducts.flatMap(product => 
        product.batches
          .filter((batch: any) => batch.expiry && batch.expiry <= expiryThresholdISO)
          .map((batch: any) => ({
            productId: product._id,
            name: product.name,
            expiry: batch.expiry,
            qty: batch.qty
          }))
      );
      
      res.json({
        success: true,
        data: {
          lowStock: lowStockProducts.map(p => ({
            productId: p._id,
            name: p.name,
            stock: p.stock,
            reorderLevel: p.reorderLevel
          })),
          expiring: expiryAlerts
        }
      });
    } catch (error) {
      logger.error('Get inventory alerts error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to get alerts' }
      });
    }
  }
);

/**
 * GET /api/inventory/stats
 * Get inventory statistics
 */
router.get('/stats',
  requirePermission('inventory', 'read'),
  async (req: AuthRequest, res) => {
    try {
      const products = await Product.find({ 
        isActive: true,
        userId: req.user!.id  // Only show user's own products
      }).lean();
      
      const totalProducts = products.length;
      const totalValue = products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);
      const lowStockCount = products.filter(p => p.stock < p.reorderLevel).length;
      
      res.json({
        success: true,
        data: {
          totalProducts,
          totalValue,
          lowStockCount
        }
      });
    } catch (error) {
      logger.error('Get inventory stats error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to get stats' }
      });
    }
  }
);

export default router;

