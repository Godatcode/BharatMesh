import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate, requirePermission, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import Invoice from '../models/Invoice';
import Product from '../models/Product';
import { generateId } from '../utils/ulid';
import logger from '../utils/logger';

const router = Router();

// All billing routes require authentication
router.use(authenticate);

/**
 * POST /api/billing/invoices
 * Create new invoice
 */
router.post('/invoices',
  requirePermission('billing', 'create'),
  validate([
    body('deviceId').notEmpty(),
    body('items').isArray({ min: 1 }),
    body('items.*.productId').notEmpty(),
    body('items.*.qty').isFloat({ min: 0.01 }),
    body('items.*.unitPrice').isFloat({ min: 0 }),
    body('tender').isIn(['cash', 'upi', 'card', 'credit'])
  ]),
  async (req: AuthRequest, res) => {
    try {
      const { deviceId, items, tender, payment, customer, notes, discount } = req.body;
      
      // Calculate totals
      let subtotal = 0;
      let totalGst = 0;
      let cgst = 0;
      let sgst = 0;
      let igst = 0;
      
      const enrichedItems = await Promise.all(items.map(async (item: any) => {
        const product = await Product.findById(item.productId);
        const name = product ? product.name : item.name || 'Unknown Product';
        const hsn = product?.hsn;
        const gstRate = product?.gstRate || 0;
        
        const itemTotal = item.qty * item.unitPrice;
        const itemGst = (itemTotal * gstRate) / 100;
        
        subtotal += itemTotal;
        totalGst += itemGst;
        
        // For simplicity, assume intra-state (CGST + SGST)
        // In production, check customer state vs business state
        cgst += itemGst / 2;
        sgst += itemGst / 2;
        
        return {
          productId: item.productId,
          name,
          hsn,
          qty: item.qty,
          unitPrice: item.unitPrice,
          gstRate,
          total: itemTotal
        };
      }));
      
      const total = subtotal + totalGst - (discount || 0);
      
      const invoice = new Invoice({
        _id: generateId(deviceId),
        ts: Date.now(),
        deviceId,
        userId: req.user!.id,
        items: enrichedItems,
        subtotal,
        gst: { cgst, sgst, igst, totalGst },
        discount: discount || 0,
        total,
        tender,
        payment,
        customer,
        notes,
        sync: 'pending'
      });
      
      await invoice.save();
      
      // Update product stock
      for (const item of items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.qty }, updatedAt: Date.now() }
        );
      }
      
      logger.info('Invoice created', { 
        invoiceId: invoice._id, 
        deviceId, 
        total,
        itemCount: items.length 
      });
      
      res.status(201).json({
        success: true,
        data: invoice.toJSON()
      });
    } catch (error) {
      logger.error('Create invoice error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to create invoice' }
      });
    }
  }
);

/**
 * GET /api/billing/invoices
 * List invoices with pagination
 */
router.get('/invoices',
  requirePermission('billing', 'read'),
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 100 }),
    query('from').optional().isISO8601(),
    query('to').optional().isISO8601(),
    query('deviceId').optional().isString()
  ]),
  async (req: AuthRequest, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      const skip = (page - 1) * pageSize;
      
      const filter: any = {
        userId: req.user!.id  // Critical: Only show invoices for the logged-in user
      };
      
      if (req.query.from || req.query.to) {
        filter.ts = {};
        if (req.query.from) filter.ts.$gte = new Date(req.query.from as string).getTime();
        if (req.query.to) filter.ts.$lte = new Date(req.query.to as string).getTime();
      }
      
      if (req.query.deviceId) {
        filter.deviceId = req.query.deviceId;
      }
      
      const [invoices, total] = await Promise.all([
        Invoice.find(filter)
          .sort({ ts: -1 })
          .skip(skip)
          .limit(pageSize)
          .lean(),
        Invoice.countDocuments(filter)
      ]);
      
      res.json({
        success: true,
        data: invoices.map(inv => ({ ...inv, id: inv._id })),
        meta: {
          page,
          pageSize,
          total,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      logger.error('List invoices error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to list invoices' }
      });
    }
  }
);

/**
 * GET /api/billing/invoices/:id
 * Get single invoice
 */
router.get('/invoices/:id',
  requirePermission('billing', 'read'),
  async (req: AuthRequest, res) => {
    try {
      const invoice = await Invoice.findOne({ 
        _id: req.params.id, 
        userId: req.user!.id  // Only allow access to user's own invoices
      });
      
      if (!invoice) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Invoice not found' }
        });
      }
      
      res.json({
        success: true,
        data: invoice.toJSON()
      });
    } catch (error) {
      logger.error('Get invoice error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to get invoice' }
      });
    }
  }
);

/**
 * GET /api/billing/stats
 * Get billing statistics
 */
router.get('/stats',
  requirePermission('billing', 'read'),
  async (req: AuthRequest, res) => {
    try {
      const now = Date.now();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStart = today.getTime();
      
      const weekStart = todayStart - (7 * 24 * 60 * 60 * 1000);
      const monthStart = todayStart - (30 * 24 * 60 * 60 * 1000);
      
      const [todayInvoices, weekInvoices, monthInvoices] = await Promise.all([
        Invoice.find({ ts: { $gte: todayStart }, userId: req.user!.id }).lean(),
        Invoice.find({ ts: { $gte: weekStart }, userId: req.user!.id }).lean(),
        Invoice.find({ ts: { $gte: monthStart }, userId: req.user!.id }).lean()
      ]);
      
      const todayRevenue = todayInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const weekRevenue = weekInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const monthRevenue = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);
      
      const avgBillValue = todayInvoices.length > 0 
        ? todayRevenue / todayInvoices.length 
        : 0;
      
      // Top products
      const productCounts: Record<string, { name: string; qty: number }> = {};
      todayInvoices.forEach(inv => {
        inv.items.forEach((item: any) => {
          if (!productCounts[item.productId]) {
            productCounts[item.productId] = { name: item.name, qty: 0 };
          }
          productCounts[item.productId].qty += item.qty;
        });
      });
      
      const topProducts = Object.entries(productCounts)
        .map(([productId, data]) => ({ productId, ...data }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 10);
      
      res.json({
        success: true,
        data: {
          todayCount: todayInvoices.length,
          todayRevenue,
          weekRevenue,
          monthRevenue,
          avgBillValue,
          topProducts
        }
      });
    } catch (error) {
      logger.error('Get billing stats error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to get stats' }
      });
    }
  }
);

export default router;

