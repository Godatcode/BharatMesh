/**
 * Business Types - Templates, Settings, Configuration
 */

export type BusinessType = 
  | 'kirana' 
  | 'coaching' 
  | 'manufacturing' 
  | 'restaurant' 
  | 'salon' 
  | 'medical' 
  | 'repair' 
  | 'wholesale' 
  | 'other';

export interface Business {
  id: string;
  name: string;
  type: BusinessType;
  gst?: string; // GST number
  pan?: string;
  phone: string;
  email?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  logo?: string;
  ownerId: string;
  enabledModules: string[]; // ['billing', 'inventory', 'attendance']
  languages: string[]; // Enabled languages
  defaultLang: string;
  timezone: string; // e.g., 'Asia/Kolkata'
  currency: string; // 'INR'
  fiscalYearStart: string; // 'YYYY-MM-DD'
  createdAt: number;
  updatedAt: number;
}

export interface BusinessTemplate {
  id: string;
  name: string;
  type: BusinessType;
  description: string;
  icon: string;
  defaultModules: string[];
  defaultSettings: Partial<BusinessSettings>;
  sampleData?: {
    products?: number; // Number of sample products
    customers?: number;
  };
}

export interface BusinessSettings {
  billing: {
    invoicePrefix: string; // e.g., 'INV'
    startingNumber: number;
    gstEnabled: boolean;
    defaultGstRate: number;
    printAfterSave: boolean;
    thermalPrinterEnabled: boolean;
    thermalPrinterAddress?: string; // Bluetooth MAC
  };
  inventory: {
    lowStockAlerts: boolean;
    lowStockThreshold: number; // Days of stock
    batchTrackingEnabled: boolean;
    expiryAlertsEnabled: boolean;
    expiryAlertDays: number; // Alert N days before expiry
  };
  attendance: {
    geofenceEnabled: boolean;
    geofenceRadiusM: number;
    geofenceCenter?: { lat: number; lon: number };
    selfieRequired: boolean;
    lateGraceMinutes: number;
    overtimeEnabled: boolean;
    overtimeRateMultiplier: number; // e.g., 1.5x
  };
  payments: {
    upiReconciliation: boolean;
    upiAmountTolerance: number;
    upiTimeWindowMinutes: number;
    cashRoundingEnabled: boolean;
  };
  sync: {
    autoSyncEnabled: boolean;
    syncIntervalMinutes: number;
    wifiOnlySync: boolean;
    cloudBackupEnabled: boolean;
    backupFrequency: 'daily' | 'weekly' | 'manual';
  };
}

export const BusinessTemplates: BusinessTemplate[] = [
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

