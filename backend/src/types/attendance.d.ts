/**
 * Attendance Types - Clock In/Out, Shifts, Leaves
 */
export interface GeoLocation {
    lat: number;
    lon: number;
    acc: number;
}
export interface AttendanceRecord {
    id: string;
    employeeId: string;
    date: string;
    clockIn?: number;
    clockInPhotoEnc?: string;
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
    approvedBy?: string;
    createdAt: number;
    updatedAt: number;
}
export interface Shift {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    lateGraceMinutes: number;
    halfDayThresholdMinutes: number;
    location: {
        lat: number;
        lon: number;
        radiusM: number;
    };
    applicableDays: number[];
    isActive: boolean;
}
export type LeaveType = 'casual' | 'sick' | 'earned' | 'unpaid' | 'other';
export interface Leave {
    id: string;
    employeeId: string;
    type: LeaveType;
    startDate: string;
    endDate: string;
    days: number;
    reason?: string;
    status: 'pending' | 'approved' | 'rejected';
    appliedAt: number;
    reviewedBy?: string;
    reviewedAt?: number;
    notes?: string;
}
export interface SalarySlip {
    id: string;
    employeeId: string;
    month: string;
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
//# sourceMappingURL=attendance.d.ts.map