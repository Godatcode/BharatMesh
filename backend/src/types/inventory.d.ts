/**
 * Inventory Types - Products, Stock, Batches
 */
export type Unit = 'kg' | 'g' | 'l' | 'ml' | 'piece' | 'box' | 'packet';
export interface Batch {
    id: string;
    qty: number;
    expiry?: string;
    received: string;
    costPrice: number;
    supplierId: string;
}
export interface Product {
    id: string;
    name: string;
    vernacular?: Record<string, string>;
    category?: string;
    barcodes: string[];
    hsn?: string;
    gstRate?: number;
    unitPrice: number;
    costPrice: number;
    stock: number;
    reorderLevel: number;
    maxStock?: number;
    unit: Unit;
    supplierId?: string;
    image?: string;
    batches: Batch[];
    isActive: boolean;
    createdAt: number;
    updatedAt: number;
}
export type AdjustmentReason = 'received' | 'sold' | 'damage' | 'theft' | 'return' | 'adjustment' | 'expired';
export interface StockAdjustment {
    id: string;
    productId: string;
    delta: number;
    reason: AdjustmentReason;
    ts: number;
    deviceId: string;
    userId: string;
    batchId?: string;
    notes?: string;
    invoiceId?: string;
}
export interface Supplier {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    gst?: string;
    creditDays?: number;
    contactPerson?: string;
    whatsapp?: string;
}
export interface InventoryStats {
    totalProducts: number;
    totalValue: number;
    lowStockCount: number;
    expiryAlerts: {
        productId: string;
        name: string;
        expiry: string;
        qty: number;
    }[];
    slowMovers: {
        productId: string;
        name: string;
        lastSoldDays: number;
    }[];
}
//# sourceMappingURL=inventory.d.ts.map