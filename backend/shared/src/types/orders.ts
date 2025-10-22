/**
 * Orders Types - WhatsApp & Counter Orders
 */

import { Unit } from './inventory';

export interface OrderLine {
  productId: string;
  name?: string; // May be parsed from WhatsApp, not yet matched
  qty: number;
  unit?: Unit;
  unitPrice?: number;
  total?: number;
  confidence?: number; // NLP confidence score (0-1) for WhatsApp orders
}

export type OrderStatus = 
  | 'draft' 
  | 'confirmed' 
  | 'preparing' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'cancelled';

export type OrderChannel = 'whatsapp' | 'counter' | 'phone' | 'web';

export interface OrderMessage {
  dir: 'in' | 'out'; // inbound or outbound
  text: string;
  ts: number;
  sender?: string; // phone number
  mediaUrl?: string; // voice note or image
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
  assignedTo?: string; // userId of employee preparing order
  deliveryTime?: string; // Estimated delivery time
  invoiceId?: string; // Linked invoice when order is billed
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

