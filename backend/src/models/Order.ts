import mongoose, { Schema, Document } from 'mongoose';
import { Order } from '../types/orders';

export interface IOrder extends Omit<Order, 'id'>, Document {
  // Additional fields for backend storage
  deviceId: string;
  userId: string;
}

const OrderSchema = new Schema<IOrder>({
  id: {
    type: String,
    required: true,
    unique: true
  },
  ts: {
    type: Number,
    required: true,
    default: Date.now
  },
  channel: {
    type: String,
    required: true,
    enum: ['whatsapp', 'counter', 'phone', 'web']
  },
  customer: {
    phone: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: false
    }
  },
  lines: [{
    productId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: false
    },
    qty: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      required: false
    },
    unitPrice: {
      type: Number,
      required: false,
      min: 0
    },
    total: {
      type: Number,
      required: false,
      min: 0
    },
    confidence: {
      type: Number,
      required: false,
      min: 0,
      max: 1
    }
  }],
  subtotal: {
    type: Number,
    required: false,
    min: 0
  },
  gst: {
    type: Number,
    required: false,
    min: 0
  },
  discount: {
    type: Number,
    required: false,
    min: 0
  },
  total: {
    type: Number,
    required: false,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'draft'
  },
  messages: [{
    dir: {
      type: String,
      required: true,
      enum: ['in', 'out']
    },
    text: {
      type: String,
      required: true
    },
    ts: {
      type: Number,
      required: true
    },
    sender: {
      type: String,
      required: false
    },
    mediaUrl: {
      type: String,
      required: false
    }
  }],
  assignedTo: {
    type: String,
    required: false
  },
  deliveryTime: {
    type: String,
    required: false
  },
  invoiceId: {
    type: String,
    required: false
  },
  notes: {
    type: String,
    required: false
  },
  // Additional fields for backend storage
  deviceId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  }
}, {
  id: false,
  timestamps: true,
  toJSON: {
    transform: (doc: any, ret: any) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.__v;
      ret.createdAt = new Date(ret.createdAt).getTime();
      ret.updatedAt = new Date(ret.updatedAt).getTime();
      return ret;
    }
  }
});

export default mongoose.model<IOrder>('Order', OrderSchema);
