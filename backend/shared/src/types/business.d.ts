/**
 * Business Types - Templates, Settings, Configuration
 */
export type BusinessType = 'kirana' | 'coaching' | 'manufacturing' | 'restaurant' | 'salon' | 'medical' | 'repair' | 'wholesale' | 'other';
export interface Business {
    id: string;
    name: string;
    type: BusinessType;
    gst?: string;
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
    enabledModules: string[];
    languages: string[];
    defaultLang: string;
    timezone: string;
    currency: string;
    fiscalYearStart: string;
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
        products?: number;
        customers?: number;
    };
}
export interface BusinessSettings {
    billing: {
        invoicePrefix: string;
        startingNumber: number;
        gstEnabled: boolean;
        defaultGstRate: number;
        printAfterSave: boolean;
        thermalPrinterEnabled: boolean;
        thermalPrinterAddress?: string;
    };
    inventory: {
        lowStockAlerts: boolean;
        lowStockThreshold: number;
        batchTrackingEnabled: boolean;
        expiryAlertsEnabled: boolean;
        expiryAlertDays: number;
    };
    attendance: {
        geofenceEnabled: boolean;
        geofenceRadiusM: number;
        geofenceCenter?: {
            lat: number;
            lon: number;
        };
        selfieRequired: boolean;
        lateGraceMinutes: number;
        overtimeEnabled: boolean;
        overtimeRateMultiplier: number;
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
export declare const BusinessTemplates: BusinessTemplate[];
//# sourceMappingURL=business.d.ts.map