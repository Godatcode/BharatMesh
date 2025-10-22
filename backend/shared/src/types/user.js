"use strict";
/**
 * User & Device Types - Authentication, RBAC, Devices
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermissions = void 0;
exports.RolePermissions = {
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
//# sourceMappingURL=user.js.map