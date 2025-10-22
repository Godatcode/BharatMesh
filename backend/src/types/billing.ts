/**
 * Billing Types - Invoice, Line Items, Tenders
 */

export type Tender = 'cash' | 'upi' | 'card' | 'credit';

export type SyncStatus = 'pending' | 'synced' | 'conflict';

export interface InvoiceItem {
  productId: string;
  name: string;
  hsn?: string; // HSN code for GST
  qty: number;
  unitPrice: number;
  gstRate?: number; // e.g., 5, 12, 18, 28
  total: number; // qty * unitPrice
}

export interface GSTBreakup {
  cgst: number; // Central GST
  sgst: number; // State GST
  igst: number; // Integrated GST (for inter-state)
  totalGst: number;
}

export interface PaymentDetails {
  upiRef?: string; // UPI transaction reference
  cashIn?: number; // Cash received
  change?: number; // Change given back
  cardLast4?: string; // Last 4 digits of card
  creditCustomerId?: string; // For credit sales
}

export interface Customer {
  name?: string;
  phone?: string;
  addr?: string;
  email?: string;
}

export interface Invoice {
  id: string; // DEVICEPREFIX-ULID
  ts: number; // Epoch milliseconds
  deviceId: string;
  userId: string; // Who created the invoice
  items: InvoiceItem[];
  subtotal: number; // Before GST
  gst?: GSTBreakup;
  discount?: number;
  total: number; // Final amount
  tender: Tender;
  payment?: PaymentDetails;
  customer?: Customer;
  notes?: string;
  sync: SyncStatus;
  syncedAt?: number;
  conflictReason?: string;
}

export interface BillingStats {
  todayCount: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  avgBillValue: number;
  topProducts: { productId: string; name: string; qty: number }[];
}

