/**
 * Attendance Types - Clock In/Out, Shifts, Leaves
 */

export interface GeoLocation {
  lat: number;
  lon: number;
  acc: number; // Accuracy in meters
}

export interface AttendanceRecord {
  id: string;
  userId: string; // Critical: Associate with user for data isolation
  employeeId: string;
  date: string; // YYYY-MM-DD
  clockIn?: number; // Epoch ms
  clockInPhotoEnc?: string; // Encrypted blob reference
  clockInGeo?: GeoLocation;
  clockOut?: number;
  clockOutPhotoEnc?: string;
  clockOutGeo?: GeoLocation;
  deviceId: string;
  shiftId?: string;
  isLate: boolean;
  isEarlyLeave: boolean;
  overtimeMinutes: number;
  status: 'present' | 'absent' | 'half_day' | 'leave';
  notes?: string;
  approvedBy?: string; // userId
  createdAt: number;
  updatedAt: number;
}

export interface Shift {
  id: string;
  name: string; // e.g., "Morning Shift"
  startTime: string; // HH:MM format (24-hour)
  endTime: string; // HH:MM
  lateGraceMinutes: number; // Allow 10 min late without marking
  halfDayThresholdMinutes: number; // If late by >2 hours = half day
  location: {
    lat: number;
    lon: number;
    radiusM: number; // Geofence radius
  };
  applicableDays: number[]; // 0=Sun, 1=Mon, ... 6=Sat
  isActive: boolean;
}

export type LeaveType = 'casual' | 'sick' | 'earned' | 'unpaid' | 'other';

export interface Leave {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  days: number; // Calculated days
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: number;
  reviewedBy?: string; // userId
  reviewedAt?: number;
  notes?: string;
}

export interface SalarySlip {
  id: string;
  employeeId: string;
  month: string; // YYYY-MM
  baseSalary: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  leaveDays: number;
  overtimeHours: number;
  overtimeRate: number;
  deductions: {
    reason: string;
    amount: number;
  }[];
  bonuses: {
    reason: string;
    amount: number;
  }[];
  gross: number;
  netSalary: number;
  generatedAt: number;
  paidAt?: number;
}

