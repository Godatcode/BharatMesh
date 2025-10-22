"use strict";
/**
 * Business Types - Templates, Settings, Configuration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessTemplates = void 0;
exports.BusinessTemplates = [
    {
        id: 'kirana',
        name: 'Kirana Store',
        type: 'kirana',
        description: 'Grocery & retail shops - billing, inventory, credit tracking',
        icon: '🛒',
        defaultModules: ['billing', 'inventory', 'orders', 'payments'],
        defaultSettings: {
            billing: {
                invoicePrefix: 'BILL',
                startingNumber: 1,
                gstEnabled: true,
                defaultGstRate: 5,
                printAfterSave: true,
                thermalPrinterEnabled: true
            },
            inventory: {
                lowStockAlerts: true,
                lowStockThreshold: 7,
                batchTrackingEnabled: true,
                expiryAlertsEnabled: true,
                expiryAlertDays: 30
            }
        },
        sampleData: {
            products: 50,
            customers: 10
        }
    },
    {
        id: 'coaching',
        name: 'Coaching Center',
        type: 'coaching',
        description: 'Education - attendance, fee collection, parent alerts',
        icon: '📚',
        defaultModules: ['attendance', 'payments', 'orders'],
        defaultSettings: {
            attendance: {
                geofenceEnabled: true,
                geofenceRadiusM: 150,
                selfieRequired: false,
                lateGraceMinutes: 15,
                overtimeEnabled: false,
                overtimeRateMultiplier: 1
            }
        },
        sampleData: {
            products: 0,
            customers: 50
        }
    },
    {
        id: 'manufacturing',
        name: 'Small Manufacturing',
        type: 'manufacturing',
        description: 'Production tracking, quality control, worker attendance',
        icon: '🏭',
        defaultModules: ['inventory', 'attendance', 'billing'],
        defaultSettings: {
            attendance: {
                geofenceEnabled: true,
                geofenceRadiusM: 200,
                selfieRequired: true,
                lateGraceMinutes: 10,
                overtimeEnabled: true,
                overtimeRateMultiplier: 1.5
            },
            inventory: {
                lowStockAlerts: true,
                lowStockThreshold: 5,
                batchTrackingEnabled: true,
                expiryAlertsEnabled: false,
                expiryAlertDays: 0
            }
        }
    }
];
//# sourceMappingURL=business.js.map