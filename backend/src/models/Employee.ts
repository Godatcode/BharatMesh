import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  id: string;
  name: string;
  phone: string;
  email?: string;
  employeeId: string; // Custom employee ID
  role: 'owner' | 'manager' | 'employee' | 'auditor' | 'family';
  department?: string;
  position?: string;
  salary: {
    monthly: number;
    hourly?: number;
    overtimeRate?: number;
  };
  workSchedule: {
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    workingDays: number[]; // 0-6 (Sunday-Saturday)
    breakDuration: number; // minutes
  };
  geofence: {
    center: {
      latitude: number;
      longitude: number;
    };
    radius: number; // meters
    address: string;
  };
  isActive: boolean;
  joinDate: string; // YYYY-MM-DD
  leaveDate?: string; // YYYY-MM-DD
  // Additional fields for backend
  businessId: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
}

const EmployeeSchema = new Schema<IEmployee>({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    required: true,
    enum: ['owner', 'manager', 'employee', 'auditor', 'family']
  },
  department: {
    type: String,
    required: false
  },
  position: {
    type: String,
    required: false
  },
  salary: {
    monthly: {
      type: Number,
      required: true,
      min: 0
    },
    hourly: {
      type: Number,
      required: false,
      min: 0
    },
    overtimeRate: {
      type: Number,
      required: false,
      min: 0
    }
  },
  workSchedule: {
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    workingDays: [{
      type: Number,
      min: 0,
      max: 6
    }],
    breakDuration: {
      type: Number,
      required: true,
      min: 0
    }
  },
  geofence: {
    center: {
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180
      }
    },
    radius: {
      type: Number,
      required: true,
      min: 10 // minimum 10 meters
    },
    address: {
      type: String,
      required: true
    }
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true
  },
  joinDate: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/
  },
  leaveDate: {
    type: String,
    required: false,
    match: /^\d{4}-\d{2}-\d{2}$/
  },
  // Additional fields for backend
  businessId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
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
EmployeeSchema.index({ businessId: 1, isActive: 1 });
EmployeeSchema.index({ employeeId: 1 });
EmployeeSchema.index({ phone: 1 });

export default mongoose.model<IEmployee>('Employee', EmployeeSchema);
