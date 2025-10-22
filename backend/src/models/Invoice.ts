import mongoose, { Schema, Document } from 'mongoose';
import { Invoice as IInvoice, InvoiceItem, GSTBreakup } from '../types/billing';

export interface InvoiceDocument extends Omit<IInvoice, 'id'>, Document {}

const InvoiceItemSchema = new Schema<InvoiceItem>({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  hsn: { type: String },
  qty: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  gstRate: { type: Number, min: 0, max: 100 },
  total: { type: Number, required: true, min: 0 }
}, { _id: false });

const GSTBreakupSchema = new Schema<GSTBreakup>({
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  totalGst: { type: Number, default: 0 }
}, { _id: false });

const InvoiceSchema = new Schema<InvoiceDocument>({
  // ULID with device prefix: DEVICEID-ULID
  _id: { type: String, required: true },
  ts: { type: Number, required: true, default: Date.now },
  deviceId: { type: String, required: true },
  userId: { type: String, required: true },
  items: [InvoiceItemSchema],
  subtotal: { type: Number, required: true, min: 0 },
  gst: { type: GSTBreakupSchema },
  discount: { type: Number, min: 0, default: 0 },
  total: { type: Number, required: true, min: 0 },
  tender: { 
    type: String, 
    required: true, 
    enum: ['cash', 'upi', 'card', 'credit'] 
  },
  payment: {
    upiRef: { type: String },
    cashIn: { type: Number },
    change: { type: Number },
    cardLast4: { type: String },
    creditCustomerId: { type: String }
  },
  customer: {
    name: { type: String },
    phone: { type: String },
    addr: { type: String },
    email: { type: String }
  },
  notes: { type: String },
  sync: { 
    type: String, 
    required: true, 
    enum: ['pending', 'synced', 'conflict'],
    default: 'pending'
  },
  syncedAt: { type: Number },
  conflictReason: { type: String }
}, {
  timestamps: false,
  _id: false,
  toJSON: {
    transform: (doc: any, ret: any) => {
      ret.id = ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes
InvoiceSchema.index({ deviceId: 1, ts: -1 });
InvoiceSchema.index({ userId: 1, ts: -1 });
InvoiceSchema.index({ ts: -1 });
InvoiceSchema.index({ 'customer.phone': 1 });
InvoiceSchema.index({ sync: 1 });
InvoiceSchema.index({ tender: 1 });

export default mongoose.model<InvoiceDocument>('Invoice', InvoiceSchema);

