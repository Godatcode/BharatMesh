/**
 * Orders Routes
 * Handles order management operations
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { Order } from '../types/orders';
import { authenticate, requireRole } from '../middleware/auth';
import logger from '../utils/logger';
import { generateId } from '../utils/ulid';
import OrderModel from '../models/Order';

const router = Router();

// Orders are now stored in MongoDB using OrderModel

// GET /api/orders - Get all orders
router.get('/', authenticate, async (req: any, res: any) => {
  try {
    const { page = 1, pageSize = 20, status, channel } = req.query;
    
    // Build MongoDB filter
    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (channel && channel !== 'all') {
      filter.channel = channel;
    }
    
    // Get orders from MongoDB
    const skip = (Number(page) - 1) * Number(pageSize);
    const orders = await OrderModel.find(filter)
      .sort({ ts: -1 })
      .skip(skip)
      .limit(Number(pageSize));
    
    const total = await OrderModel.countDocuments(filter);
    
    res.json({
      success: true,
      data: orders,
      meta: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    logger.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch orders'
      }
    });
  }
});

// GET /api/orders/:id - Get single order
router.get('/:id', authenticate, async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const order = await OrderModel.findOne({ id });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found'
        }
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    logger.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch order'
      }
    });
  }
});

// POST /api/orders - Create new order
router.post('/', 
  authenticate,
  async (req: any, res: any) => {
    try {
      const orderData = req.body;
      
      // Handle both frontend format and backend format
      let customer, lines, subtotal, gst, total, status;
      
      if (orderData.customerName) {
        // Frontend format
        customer = {
          phone: orderData.customerPhone || '',
          name: orderData.customerName || '',
          address: orderData.customerAddress || ''
        };
        lines = orderData.items || [];
        subtotal = orderData.subtotal || orderData.total || 0;
        gst = orderData.gst || 0;
        total = orderData.total || 0;
        status = orderData.status || 'pending';
      } else {
        // Backend format
        customer = {
          phone: orderData.customer?.phone || '',
          name: orderData.customer?.name || '',
          address: orderData.customer?.address || ''
        };
        lines = orderData.lines || [];
        subtotal = orderData.subtotal || 0;
        gst = orderData.gst || 0;
        total = orderData.total || 0;
        status = orderData.status || 'draft';
      }
      
      const newOrder = new OrderModel({
        id: generateId(),
        ts: Date.now(),
        channel: orderData.channel || 'web',
        customer,
        lines,
        subtotal,
        gst,
        total,
        status,
        notes: orderData.notes || '',
        deviceId: orderData.deviceId || 'device-001',
        userId: req.user.userId
      });
      
      const savedOrder = await newOrder.save();
      
      logger.info('Order created:', { orderId: savedOrder.id, customer: savedOrder.customer.name });
      
      res.status(201).json({
        success: true,
        data: savedOrder
      });
    } catch (error) {
      logger.error('Error creating order:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create order'
        }
      });
    }
  }
);

// PUT /api/orders/:id - Update order
router.put('/:id',
  authenticate,
  async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const updatedOrder = await OrderModel.findOneAndUpdate(
        { id },
        { ...updateData, updatedAt: Date.now() },
        { new: true }
      );
      
      if (!updatedOrder) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Order not found'
          }
        });
      }
      
      logger.info('Order updated:', { orderId: id, status: updateData.status });
      
      res.json({
        success: true,
        data: updatedOrder
      });
    } catch (error) {
      logger.error('Error updating order:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update order'
        }
      });
    }
  }
);

// DELETE /api/orders/:id - Delete order
router.delete('/:id',
  authenticate,
  requireRole('owner'),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const deletedOrder = await OrderModel.findOneAndDelete({ id });
      
      if (!deletedOrder) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Order not found'
          }
        });
      }
      
      logger.info('Order deleted:', { orderId: id });
      
      res.json({
        success: true,
        message: 'Order deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting order:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete order'
        }
      });
    }
  }
);

export default router;
