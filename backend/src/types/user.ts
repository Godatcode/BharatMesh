/**
 * User & Device Types - Authentication, RBAC, Devices
 */

export type Role = 'owner' | 'manager' | 'employee' | 'auditor' | 'family';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  langs: string[]; // e.g., ['hi', 'en']
  preferredLang: string; // Primary language
  permissions?: string[]; // Custom permissions for 'family' role
  avatar?: string;
  biometricEnabled: boolean;
  pin?: string; // Hashed PIN
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  lastLoginAt?: number;
}

export type DeviceRole = 'primary' | 'secondary';

export interface Device {
  id: string;
  name: string; // e.g., 'Counter 1 Tablet'
  role: DeviceRole;
  capabilities: string[]; // ['billing', 'inventory', 'attendance']
  platform: 'android' | 'ios' | 'web';
  osVersion?: string;
  appVersion: string;
  lastSeen: number;
  battery?: number; // 0-100
  storageFree?: number; // MB
  networkType?: 'wifi' | 'bluetooth' | 'offline';
  ip?: string;
  location?: {
    name: string; // e.g., 'Main Counter'
    lat?: number;
    lon?: number;
  };
  ownerId: string; // User who owns/registered this device
  isActive: boolean;
  registeredAt: number;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export interface Session {
  userId: string;
  deviceId: string;
  token: string;
  createdAt: number;
  expiresAt: number;
  lastActivity: number;
}

export interface Permission {
  module: string; // 'billing', 'inventory', etc.
  actions: ('read' | 'create' | 'update' | 'delete')[]; 
}

export const RolePermissions: Record<Role, Permission[]> = {
  owner: [
    { module: '*', actions: ['read', 'create', 'update', 'delete'] }
  ],
  manager: [
    { module: 'billing', actions: ['read', 'create', 'update'] },
    { module: 'inventory', actions: ['read', 'create', 'update'] },
    { module: 'orders', actions: ['read', 'create', 'update'] },
    { module: 'attendance', actions: ['read', 'create', 'update'] },
    { module: 'reports', actions: ['read'] }
  ],
  employee: [
    { module: 'billing', actions: ['read', 'create'] },
    { module: 'inventory', actions: ['read'] },
    { module: 'orders', actions: ['read', 'update'] },
    { module: 'attendance', actions: ['create'] }
  ],
  auditor: [
    { module: 'billing', actions: ['read'] },
    { module: 'inventory', actions: ['read'] },
    { module: 'reports', actions: ['read'] },
    { module: 'attendance', actions: ['read'] }
  ],
  family: [] // Custom permissions set per user
};

