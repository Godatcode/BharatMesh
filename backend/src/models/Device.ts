import mongoose, { Schema, Document } from 'mongoose';
import { Device as IDevice, DeviceRole } from '@bharatmesh/shared';

export interface DeviceDocument extends Omit<IDevice, 'id'>, Document {}

const DeviceSchema = new Schema<DeviceDocument>({
  name: { type: String, required: true, trim: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['primary', 'secondary'],
    default: 'secondary'
  },
  capabilities: [{ type: String, required: true }],
  platform: { 
    type: String, 
    required: true, 
    enum: ['android', 'ios', 'web'] 
  },
  osVersion: { type: String },
  appVersion: { type: String, required: true },
  lastSeen: { type: Number, required: true, default: Date.now },
  battery: { type: Number, min: 0, max: 100 },
  storageFree: { type: Number },
  networkType: { 
    type: String, 
    enum: ['wifi', 'bluetooth', 'offline'] 
  },
  ip: { type: String },
  location: {
    name: { type: String },
    lat: { type: Number },
    lon: { type: Number }
  },
  ownerId: { 
    type: String, 
    required: true 
  },
  isActive: { type: Boolean, default: true },
  registeredAt: { type: Number, default: Date.now }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc: any, ret: any) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes
DeviceSchema.index({ ownerId: 1 });
DeviceSchema.index({ role: 1 });
DeviceSchema.index({ isActive: 1 });
DeviceSchema.index({ lastSeen: -1 });

// Update lastSeen on every query
DeviceSchema.pre('save', function(next) {
  (this as any).lastSeen = Date.now();
  next();
});

export default mongoose.model<DeviceDocument>('Device', DeviceSchema);

