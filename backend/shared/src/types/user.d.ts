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
    langs: string[];
    preferredLang: string;
    permissions?: string[];
    avatar?: string;
    biometricEnabled: boolean;
    pin?: string;
    isActive: boolean;
    createdAt: number;
    updatedAt: number;
    lastLoginAt?: number;
}
export type DeviceRole = 'primary' | 'secondary';
export interface Device {
    id: string;
    name: string;
    role: DeviceRole;
    capabilities: string[];
    platform: 'android' | 'ios' | 'web';
    osVersion?: string;
    appVersion: string;
    lastSeen: number;
    battery?: number;
    storageFree?: number;
    networkType?: 'wifi' | 'bluetooth' | 'offline';
    ip?: string;
    location?: {
        name: string;
        lat?: number;
        lon?: number;
    };
    ownerId: string;
    isActive: boolean;
    registeredAt: number;
}
export interface AuthToken {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
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
    module: string;
    actions: ('read' | 'create' | 'update' | 'delete')[];
}
export declare const RolePermissions: Record<Role, Permission[]>;
//# sourceMappingURL=user.d.ts.map