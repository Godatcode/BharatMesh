import mongoose, { Schema, Document } from 'mongoose';
import { User as IUser, Role } from '../types/user';

export interface UserDocument extends Omit<IUser, 'id'>, Document {}

const UserSchema = new Schema<UserDocument>({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['owner', 'manager', 'employee', 'auditor', 'family'],
    default: 'employee'
  },
  langs: [{ type: String }],
  preferredLang: { type: String, required: true, default: 'hi' },
  permissions: [{ type: String }],
  avatar: { type: String },
  biometricEnabled: { type: Boolean, default: false },
  pin: { type: String }, // Hashed PIN
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Number }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc: any, ret: any) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.pin; // Never expose PIN
      ret.createdAt = new Date(ret.createdAt).getTime();
      ret.updatedAt = new Date(ret.updatedAt).getTime();
      return ret;
    }
  }
});

// Indexes
UserSchema.index({ phone: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });

export default mongoose.model<UserDocument>('User', UserSchema);

