/**
 * Orders Types - WhatsApp & Counter Orders
 */
import { Unit } from './inventory';
export interface OrderLine {
    productId: string;
    name?: string;
    qty: number;
    unit?: Unit;
    unitPrice?: number;
    total?: number;
    confidence?: number;
}
export type OrderStatus = 'draft' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type OrderChannel = 'whatsapp' | 'counter' | 'phone' | 'web';
export interface OrderMessage {
    dir: 'in' | 'out';
    text: string;
    ts: number;
    sender?: string;
    mediaUrl?: string;
}
export interface Order {
    id: string;
    ts: number;
    channel: OrderChannel;
    customer: {
        phone: string;
        name?: string;
        address?: string;
    };
    lines: OrderLine[];
    subtotal?: number;
    gst?: number;
    discount?: number;
    total?: number;
    status: OrderStatus;
    messages?: OrderMessage[];
    assignedTo?: string;
    deliveryTime?: string;
    invoiceId?: string;
    notes?: string;
    sync: 'pending' | 'synced' | 'conflict';
    createdAt: number;
    updatedAt: number;
}
export interface WhatsAppConfig {
    businessNumber: string;
    webhookUrl?: string;
    apiKey?: string;
    autoReply: boolean;
    templates: {
        orderReceived: string;
        orderConfirmed: string;
        outForDelivery: string;
        delivered: string;
    };
}
//# sourceMappingURL=orders.d.ts.map