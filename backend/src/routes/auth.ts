import { Router } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { validate } from '../middleware/validation';
import { authenticate, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import { hashPassword, verifyPassword } from '../utils/encryption';
import { generateId } from '../utils/ulid';
import logger from '../utils/logger';

const router = Router();

// Helper function to normalize phone numbers
function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // If it already starts with +, return as is
  if (cleanPhone.startsWith('+')) {
    return cleanPhone;
  }
  
  // If it starts with 91 and has 12 digits, add +
  if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
    return `+${cleanPhone}`;
  }
  
  // If it has 10 digits, assume it's Indian number and add +91
  if (cleanPhone.length === 10) {
    return `+91${cleanPhone}`;
  }
  
  // If it has 11 digits and starts with 1, assume US number
  if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
    return `+${cleanPhone}`;
  }
  
  // For other lengths, try to detect country code
  // This is a simplified version - in production, you'd use a proper library
  if (cleanPhone.length >= 10) {
    // Default to +91 for Indian numbers
    return `+91${cleanPhone}`;
  }
  
  // If all else fails, return as is
  return cleanPhone;
}

/**
 * POST /api/auth/register
 * Register new user (owner creates employees)
 */
router.post('/register',
  validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').trim().isLength({ min: 10, max: 15 }).withMessage('Valid phone number required'),
    body('role').isIn(['owner', 'manager', 'employee', 'auditor', 'family']),
    body('pin').isLength({ min: 4, max: 6 }).withMessage('PIN must be 4-6 digits'),
    body('preferredLang').optional().isIn(['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml'])
  ]),
  async (req, res) => {
    try {
      const { name, phone, email, role, pin, preferredLang, langs } = req.body;
      
      // Normalize phone number
      const normalizedPhone = normalizePhoneNumber(phone);
      
      // Check if user already exists
      const existingUser = await User.findOne({ phone: normalizedPhone });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: { code: 'USER_EXISTS', message: 'Phone number already registered' }
        });
      }
      
      // Hash PIN
      const hashedPin = hashPassword(pin);
      
      // Create user
      const user = new User({
        name,
        phone: normalizedPhone,
        email,
        role: role || 'employee',
        pin: hashedPin,
        preferredLang: preferredLang || 'hi',
        langs: langs || ['hi', 'en'],
        biometricEnabled: false,
        isActive: true
      });
      
      await user.save();
      
      logger.info('User registered', { userId: user._id, phone, role });
      
      // Generate tokens
      const userId = user._id?.toString() || user.id;
      const accessToken = jwt.sign(
        { userId, role: user.role },
        config.auth.jwtSecret as string,
        { expiresIn: config.auth.jwtExpiry } as jwt.SignOptions
      );
      
      const refreshToken = jwt.sign(
        { userId },
        config.auth.jwtRefreshSecret as string,
        { expiresIn: config.auth.jwtRefreshExpiry } as jwt.SignOptions
      );
      
      res.status(201).json({
        success: true,
        data: {
          user: user.toJSON(),
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: 900 // 15 minutes
          }
        }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Registration failed' }
      });
    }
  }
);

/**
 * POST /api/auth/login
 * Login with phone + PIN or biometric
 */
router.post('/login',
  validate([
    body('phone').trim().isLength({ min: 10, max: 15 }).withMessage('Valid phone number required'),
    body('pin').optional().isLength({ min: 4, max: 6 }),
    body('biometricToken').optional().isString()
  ]),
  async (req, res) => {
    try {
      const { phone, pin, biometricToken } = req.body;
      
      // Normalize phone number
      const normalizedPhone = normalizePhoneNumber(phone);
      
      const user = await User.findOne({ phone: normalizedPhone, isActive: true });
      if (!user) {
        return res.status(401).json({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid phone or PIN' }
        });
      }
      
      // Verify PIN or biometric
      if (pin) {
        if (!user.pin || !verifyPassword(pin, user.pin)) {
          return res.status(401).json({
            success: false,
            error: { code: 'INVALID_CREDENTIALS', message: 'Invalid phone or PIN' }
          });
        }
      } else if (biometricToken) {
        // TODO: Verify biometric token (platform-specific)
        // For now, just check if biometric is enabled
        if (!user.biometricEnabled) {
          return res.status(401).json({
            success: false,
            error: { code: 'BIOMETRIC_NOT_ENABLED', message: 'Biometric not enabled for this user' }
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_CREDENTIALS', message: 'Either PIN or biometric token required' }
        });
      }
      
      // Update last login
      user.lastLoginAt = Date.now();
      await user.save();
      
      logger.info('User logged in', { userId: user._id, phone });
      
      // Generate tokens
      const userId = user._id?.toString() || user.id;
      const accessToken = jwt.sign(
        { userId, role: user.role, permissions: user.permissions },
        config.auth.jwtSecret as string,
        { expiresIn: config.auth.jwtExpiry } as jwt.SignOptions
      );
      
      const refreshToken = jwt.sign(
        { userId },
        config.auth.jwtRefreshSecret as string,
        { expiresIn: config.auth.jwtRefreshExpiry } as jwt.SignOptions
      );
      
      res.json({
        success: true,
        data: {
          user: user.toJSON(),
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: 900
          }
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Login failed' }
      });
    }
  }
);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh',
  validate([
    body('refreshToken').notEmpty()
  ]),
  async (req, res) => {
    try {
      const { refreshToken } = req.body;
      
      const decoded = jwt.verify(refreshToken, config.auth.jwtRefreshSecret) as { userId: string };
      
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          error: { code: 'INVALID_USER', message: 'User not found or inactive' }
        });
      }
      
      const userId = user._id?.toString() || user.id;
      const newAccessToken = jwt.sign(
        { userId, role: user.role, permissions: user.permissions },
        config.auth.jwtSecret as string,
        { expiresIn: config.auth.jwtExpiry } as jwt.SignOptions
      );
      
      res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
          expiresIn: 900
        }
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid refresh token' }
      });
    }
  }
);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      });
    }
    
    res.json({
      success: true,
      data: user.toJSON()
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get profile' }
    });
  }
});

/**
 * PUT /api/auth/me
 * Update current user profile
 */
router.put('/me', authenticate,
  validate([
    body('name').optional().trim().notEmpty(),
    body('email').optional().trim().isEmail(),
    body('preferredLang').optional().isIn(['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml']),
    body('langs').optional().isArray()
  ]),
  async (req: AuthRequest, res) => {
    try {
      const user = await User.findById(req.user!.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'User not found' }
        });
      }
      
      const { name, email, preferredLang, langs, avatar } = req.body;
      
      if (name) user.name = name;
      if (email !== undefined) user.email = email;
      if (preferredLang) user.preferredLang = preferredLang;
      if (langs) user.langs = langs;
      if (avatar !== undefined) user.avatar = avatar;
      
      await user.save();
      
      logger.info('User profile updated', { userId: user._id });
      
      res.json({
        success: true,
        data: user.toJSON()
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to update profile' }
      });
    }
  }
);

/**
 * POST /api/auth/change-pin
 * Change user PIN
 */
router.post('/change-pin', authenticate,
  validate([
    body('oldPin').isLength({ min: 4, max: 6 }),
    body('newPin').isLength({ min: 4, max: 6 })
  ]),
  async (req: AuthRequest, res) => {
    try {
      const { oldPin, newPin } = req.body;
      
      const user = await User.findById(req.user!.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'User not found' }
        });
      }
      
      // Verify old PIN
      if (!user.pin || !verifyPassword(oldPin, user.pin)) {
        return res.status(401).json({
          success: false,
          error: { code: 'INVALID_PIN', message: 'Invalid old PIN' }
        });
      }
      
      // Set new PIN
      user.pin = hashPassword(newPin);
      await user.save();
      
      logger.info('User PIN changed', { userId: user._id });
      
      res.json({
        success: true,
        data: { message: 'PIN changed successfully' }
      });
    } catch (error) {
      logger.error('Change PIN error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to change PIN' }
      });
    }
  }
);

export default router;

