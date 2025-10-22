/**
 * Inventory Types - Products, Stock, Batches
 */

export type Unit = 'kg' | 'g' | 'l' | 'ml' | 'piece' | 'box' | 'packet';

export interface Batch {
  id: string;
  qty: number;
  expiry?: string; // ISO date
  received: string; // ISO date
  costPrice: number;
  supplierId: string;
}

export interface Product {
  id: string;
  name: string;
  vernacular?: Record<string, string>; // e.g., { 'hi': 'बासमती चावल', 'ta': 'பாசுமதி அரிசி' }
  category?: string;
  barcodes: string[]; // Multiple barcodes possible
  hsn?: string; // HSN code for GST
  gstRate?: number; // 0, 5, 12, 18, 28
  unitPrice: number; // Selling price
  costPrice: number; // Purchase price
  stock: number; // Current stock
  reorderLevel: number; // Alert when stock falls below
  maxStock?: number; // Optional max stock level
  unit: Unit;
  supplierId?: string;
  image?: string; // URL or base64
  batches: Batch[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export type AdjustmentReason = 
  | 'received' 
  | 'sold' 
  | 'damage' 
  | 'theft' 
  | 'return' 
  | 'adjustment' 
  | 'expired';

export interface StockAdjustment {
  id: string;
  productId: string;
  delta: number; // +ve for receive, -ve for sale/damage
  reason: AdjustmentReason;
  ts: number;
  deviceId: string;
  userId: string;
  batchId?: string;
  notes?: string;
  invoiceId?: string; // Link to invoice if sold
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
  totalValue: number; // Sum of (stock * costPrice)
  lowStockCount: number; // Products below reorderLevel
  expiryAlerts: { productId: string; name: string; expiry: string; qty: number }[];
  slowMovers: { productId: string; name: string; lastSoldDays: number }[];
}

