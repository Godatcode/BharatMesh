import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import Device from '../models/Device';
import logger from '../utils/logger';

const router = Router();

router.use(authenticate);

/**
 * POST /api/devices
 * Register new device
 */
router.post('/',
  validate([
    body('name').trim().notEmpty(),
    body('platform').isIn(['android', 'ios', 'web']),
    body('appVersion').notEmpty(),
    body('capabilities').isArray({ min: 1 })
  ]),
  async (req: AuthRequest, res) => {
    try {
      const device = new Device({
        ...req.body,
        ownerId: req.user!.id,
        role: 'secondary', // Owner can promote to primary later
        isActive: true,
        lastSeen: Date.now(),
        registeredAt: Date.now()
      });
      
      await device.save();
      
      logger.info('Device registered', { 
        deviceId: device._id, 
        name: device.name,
        ownerId: req.user!.id 
      });
      
      res.status(201).json({
        success: true,
        data: device.toJSON()
      });
    } catch (error) {
      logger.error('Register device error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to register device' }
      });
    }
  }
);

/**
 * GET /api/devices
 * List all devices for current user's business
 */
router.get('/', async (req: AuthRequest, res) => {
  try {
    const devices = await Device.find({ ownerId: req.user!.id })
      .sort({ lastSeen: -1 })
      .lean();
    
    res.json({
      success: true,
      data: devices.map(d => ({ ...d, id: d._id }))
    });
  } catch (error) {
    logger.error('List devices error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to list devices' }
    });
  }
});

/**
 * GET /api/devices/:id
 * Get single device
 */
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const device = await Device.findOne({
      _id: req.params.id,
      ownerId: req.user!.id
    });
    
    if (!device) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Device not found' }
      });
    }
    
    res.json({
      success: true,
      data: device.toJSON()
    });
  } catch (error) {
    logger.error('Get device error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get device' }
    });
  }
});

/**
 * PUT /api/devices/:id
 * Update device (name, capabilities, role, etc.)
 */
router.put('/:id',
  requireRole('owner', 'manager'),
  async (req: AuthRequest, res) => {
    try {
      const updates = req.body;
      delete updates._id;
      delete updates.ownerId;
      delete updates.registeredAt;
      
      const device = await Device.findOneAndUpdate(
        { _id: req.params.id, ownerId: req.user!.id },
        { $set: updates },
        { new: true, runValidators: true }
      );
      
      if (!device) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Device not found' }
        });
      }
      
      logger.info('Device updated', { deviceId: device._id });
      
      res.json({
        success: true,
        data: device.toJSON()
      });
    } catch (error) {
      logger.error('Update device error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to update device' }
      });
    }
  }
);

/**
 * POST /api/devices/:id/heartbeat
 * Update device last seen and status
 */
router.post('/:id/heartbeat',
  validate([
    body('battery').optional().isInt({ min: 0, max: 100 }),
    body('storageFree').optional().isInt({ min: 0 }),
    body('networkType').optional().isIn(['wifi', 'bluetooth', 'offline'])
  ]),
  async (req: AuthRequest, res) => {
    try {
      const { battery, storageFree, networkType, location } = req.body;
      
      const device = await Device.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            lastSeen: Date.now(),
            battery,
            storageFree,
            networkType,
            location
          }
        },
        { new: true }
      );
      
      if (!device) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Device not found' }
        });
      }
      
      res.json({
        success: true,
        data: { lastSeen: device.lastSeen }
      });
    } catch (error) {
      logger.error('Device heartbeat error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to update heartbeat' }
      });
    }
  }
);

/**
 * DELETE /api/devices/:id
 * Deactivate device (soft delete)
 */
router.delete('/:id',
  requireRole('owner', 'manager'),
  async (req: AuthRequest, res) => {
    try {
      const device = await Device.findOneAndUpdate(
        { _id: req.params.id, ownerId: req.user!.id },
        { $set: { isActive: false } },
        { new: true }
      );
      
      if (!device) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Device not found' }
        });
      }
      
      logger.info('Device deactivated', { deviceId: device._id });
      
      res.json({
        success: true,
        data: { message: 'Device deactivated successfully' }
      });
    } catch (error) {
      logger.error('Deactivate device error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to deactivate device' }
      });
    }
  }
);

export default router;

