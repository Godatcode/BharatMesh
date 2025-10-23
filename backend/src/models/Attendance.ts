import mongoose, { Schema, Document } from 'mongoose';
import { AttendanceRecord } from '../types/attendance';

export interface IAttendance extends Omit<AttendanceRecord, 'id'>, Document {
  id: string;
}

const AttendanceSchema = new Schema<IAttendance>({
  id: {
    type: String,
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: String,
    required: true // YYYY-MM-DD format
  },
  clockIn: {
    type: Number,
    required: false // Epoch ms
  },
  clockInPhotoEnc: {
    type: String,
    required: false // Encrypted blob reference
  },
  clockInGeo: {
    lat: {
      type: Number,
      required: false
    },
    lon: {
      type: Number,
      required: false
    },
    acc: {
      type: Number,
      required: false // Accuracy in meters
    }
  },
  clockOut: {
    type: Number,
    required: false // Epoch ms
  },
  clockOutPhotoEnc: {
    type: String,
    required: false
  },
  clockOutGeo: {
    lat: {
      type: Number,
      required: false
    },
    lon: {
      type: Number,
      required: false
    },
    acc: {
      type: Number,
      required: false
    }
  },
  isLate: {
    type: Boolean,
    required: false,
    default: false
  },
  isEarlyLeave: {
    type: Boolean,
    required: false,
    default: false
  },
  overtimeMinutes: {
    type: Number,
    required: false,
    default: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['present', 'absent', 'half_day', 'leave'],
    default: 'present'
  },
  notes: {
    type: String,
    required: false
  },
  approvedBy: {
    type: String,
    required: false // userId of approver
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

// Index for efficient queries
AttendanceSchema.index({ employeeId: 1, date: 1 });
AttendanceSchema.index({ businessId: 1, date: 1 });
AttendanceSchema.index({ status: 1, date: 1 });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
