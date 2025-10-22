/**
 * Billing Types - Invoice, Line Items, Tenders
 */
export type Tender = 'cash' | 'upi' | 'card' | 'credit';
export type SyncStatus = 'pending' | 'synced' | 'conflict';
export interface InvoiceItem {
    productId: string;
    name: string;
    hsn?: string;
    qty: number;
    unitPrice: number;
    gstRate?: number;
    total: number;
}
export interface GSTBreakup {
    cgst: number;
    sgst: number;
    igst: number;
    totalGst: number;
}
export interface PaymentDetails {
    upiRef?: string;
    cashIn?: number;
    change?: number;
    cardLast4?: string;
    creditCustomerId?: string;
}
export interface Customer {
    name?: string;
    phone?: string;
    addr?: string;
    email?: string;
}
export interface Invoice {
    id: string;
    ts: number;
    deviceId: string;
    userId: string;
    items: InvoiceItem[];
    subtotal: number;
    gst?: GSTBreakup;
    discount?: number;
    total: number;
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
    topProducts: {
        productId: string;
        name: string;
        qty: number;
    }[];
}
//# sourceMappingURL=billing.d.ts.map