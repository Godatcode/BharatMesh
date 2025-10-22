import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import logger from '../utils/logger';
import User from '../models/User';
import { Role, Permission, RolePermissions } from '@bharatmesh/shared';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: Role;
    permissions?: string[];
  };
}

/**
 * Verify JWT token and attach user to request
 */
export async function authenticate(
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ 
        success: false, 
        error: { code: 'NO_TOKEN', message: 'Authentication required' } 
      });
      return;
    }
    
    const decoded = jwt.verify(token, config.auth.jwtSecret) as { 
      userId: string; 
      role: Role;
      permissions?: string[];
    };
    
    // Verify user still exists and is active
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      res.status(401).json({ 
        success: false, 
        error: { code: 'INVALID_USER', message: 'User not found or inactive' } 
      });
      return;
    }
    
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      permissions: decoded.permissions
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ 
        success: false, 
        error: { code: 'TOKEN_EXPIRED', message: 'Token expired' } 
      });
    } else {
      logger.error('Authentication error:', error);
      res.status(401).json({ 
        success: false, 
        error: { code: 'INVALID_TOKEN', message: 'Invalid token' } 
      });
    }
  }
}

/**
 * Check if user has required role
 */
export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } 
      });
      return;
    }
    
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        error: { 
          code: 'FORBIDDEN', 
          message: `Requires one of: ${roles.join(', ')}` 
        } 
      });
      return;
    }
    
    next();
  };
}

/**
 * Check if user has permission for module and action
 */
export function requirePermission(module: string, action: 'read' | 'create' | 'update' | 'delete') {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } 
      });
      return;
    }
    
    // Owner has all permissions
    if (req.user.role === 'owner') {
      next();
      return;
    }
    
    // Get role permissions
    const rolePerms = RolePermissions[req.user.role];
    
    // Check wildcard permission
    const wildcardPerm = rolePerms.find(p => p.module === '*');
    if (wildcardPerm && wildcardPerm.actions.includes(action)) {
      next();
      return;
    }
    
    // Check specific module permission
    const modulePerm = rolePerms.find(p => p.module === module);
    if (modulePerm && modulePerm.actions.includes(action)) {
      next();
      return;
    }
    
    // Check custom permissions for 'family' role
    if (req.user.role === 'family' && req.user.permissions) {
      const customPerm = `${module}:${action}`;
      if (req.user.permissions.includes(customPerm)) {
        next();
        return;
      }
    }
    
    res.status(403).json({ 
      success: false, 
      error: { 
        code: 'FORBIDDEN', 
        message: `Permission denied: ${module}:${action}` 
      } 
    });
  };
}

