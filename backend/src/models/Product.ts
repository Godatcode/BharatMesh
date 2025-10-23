import mongoose, { Schema, Document } from 'mongoose';
import { Product as IProduct, Batch, Unit } from '../types/inventory';

export interface ProductDocument extends Omit<IProduct, 'id'>, Document {}

const BatchSchema = new Schema<Batch>({
  id: { type: String, required: true },
  qty: { type: Number, required: true, min: 0 },
  expiry: { type: String }, // ISO date
  received: { type: String, required: true }, // ISO date
  costPrice: { type: Number, required: true, min: 0 },
  supplierId: { type: String, required: true }
}, { _id: false });

const ProductSchema = new Schema<ProductDocument>({
  _id: { type: String, required: true }, // ULID
  userId: { type: String, required: true, index: true }, // Critical: Associate with user
  name: { type: String, required: true, trim: true },
  vernacular: { 
    type: Map, 
    of: String 
  },
  category: { type: String, trim: true },
  barcodes: [{ type: String }],
  hsn: { type: String },
  gstRate: { type: Number, min: 0, max: 100 },
  unitPrice: { type: Number, required: true, min: 0 },
  costPrice: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, default: 0, min: 0 },
  reorderLevel: { type: Number, default: 10, min: 0 },
  maxStock: { type: Number, min: 0 },
  unit: { 
    type: String, 
    required: true,
    enum: ['kg', 'g', 'l', 'ml', 'piece', 'box', 'packet']
  },
  supplierId: { type: String },
  image: { type: String },
  batches: [BatchSchema],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Number, default: Date.now },
  updatedAt: { type: Number, default: Date.now }
}, {
  timestamps: false,
  _id: false,
  toJSON: {
    transform: (doc: any, ret: any) => {
      ret.id = ret._id;
      delete ret.__v;
      if (ret.vernacular) {
        ret.vernacular = Object.fromEntries(ret.vernacular);
      }
      return ret;
    }
  }
});

// Indexes
ProductSchema.index({ name: 'text', 'vernacular.$**': 'text' });
ProductSchema.index({ barcodes: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ stock: 1 });
ProductSchema.index({ isActive: 1 });

// Update timestamp on save
ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model<ProductDocument>('Product', ProductSchema);

