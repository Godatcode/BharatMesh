import mongoose, { Schema, Document } from 'mongoose';
import { Business as IBusiness, BusinessType, BusinessSettings } from '@bharatmesh/shared';

export interface BusinessDocument extends Omit<IBusiness, 'id'>, Document {
  settings: BusinessSettings;
}

const AddressSchema = new Schema({
  line1: { type: String, required: true },
  line2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true }
}, { _id: false });

const BusinessSchema = new Schema<BusinessDocument>({
  name: { type: String, required: true, trim: true },
  type: { 
    type: String, 
    required: true,
    enum: ['kirana', 'coaching', 'manufacturing', 'restaurant', 'salon', 'medical', 'repair', 'wholesale', 'other']
  },
  gst: { type: String, trim: true },
  pan: { type: String, trim: true },
  phone: { type: String, required: true },
  email: { type: String, trim: true, lowercase: true },
  address: { type: AddressSchema, required: true },
  logo: { type: String },
  ownerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  enabledModules: [{ type: String, required: true }],
  languages: [{ type: String, required: true }],
  defaultLang: { type: String, required: true, default: 'hi' },
  timezone: { type: String, required: true, default: 'Asia/Kolkata' },
  currency: { type: String, required: true, default: 'INR' },
  fiscalYearStart: { type: String, required: true },
  settings: {
    billing: {
      invoicePrefix: { type: String, default: 'INV' },
      startingNumber: { type: Number, default: 1 },
      gstEnabled: { type: Boolean, default: false },
      defaultGstRate: { type: Number, default: 0 },
      printAfterSave: { type: Boolean, default: true },
      thermalPrinterEnabled: { type: Boolean, default: false },
      thermalPrinterAddress: { type: String }
    },
    inventory: {
      lowStockAlerts: { type: Boolean, default: true },
      lowStockThreshold: { type: Number, default: 7 },
      batchTrackingEnabled: { type: Boolean, default: false },
      expiryAlertsEnabled: { type: Boolean, default: false },
      expiryAlertDays: { type: Number, default: 30 }
    },
    attendance: {
      geofenceEnabled: { type: Boolean, default: false },
      geofenceRadiusM: { type: Number, default: 100 },
      geofenceCenter: {
        lat: { type: Number },
        lon: { type: Number }
      },
      selfieRequired: { type: Boolean, default: false },
      lateGraceMinutes: { type: Number, default: 15 },
      overtimeEnabled: { type: Boolean, default: false },
      overtimeRateMultiplier: { type: Number, default: 1.5 }
    },
    payments: {
      upiReconciliation: { type: Boolean, default: true },
      upiAmountTolerance: { type: Number, default: 1 },
      upiTimeWindowMinutes: { type: Number, default: 10 },
      cashRoundingEnabled: { type: Boolean, default: false }
    },
    sync: {
      autoSyncEnabled: { type: Boolean, default: true },
      syncIntervalMinutes: { type: Number, default: 5 },
      wifiOnlySync: { type: Boolean, default: false },
      cloudBackupEnabled: { type: Boolean, default: false },
      backupFrequency: { type: String, enum: ['daily', 'weekly', 'manual'], default: 'weekly' }
    }
  }
}, {
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

// Indexes
BusinessSchema.index({ ownerId: 1 });
BusinessSchema.index({ type: 1 });

export default mongoose.model<BusinessDocument>('Business', BusinessSchema);

