/**
 * Attendance Routes
 * Handles employee attendance, geofencing, and selfie capture
 */

import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { AttendanceRecord } from '../types/attendance';
import { authenticate, requireRole } from '../middleware/auth';
import logger from '../utils/logger';
import { generateId } from '../utils/ulid';
import AttendanceModel from '../models/Attendance';
import EmployeeModel from '../models/Employee';

const router = Router();

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

// Helper function to validate geofence
async function validateGeofence(employeeId: string, latitude: number, longitude: number): Promise<{ valid: boolean; distance?: number; message?: string }> {
  try {
    const employee = await EmployeeModel.findOne({ employeeId });
    if (!employee) {
      console.log('Employee not found, allowing clock-in for testing');
      return { valid: true, message: 'Employee not found - allowing for testing' };
    }

    const distance = calculateDistance(
      latitude,
      longitude,
      employee.geofence.center.latitude,
      employee.geofence.center.longitude
    );

    const isValid = distance <= employee.geofence.radius;
    
    return {
      valid: isValid,
      distance: Math.round(distance),
      message: isValid 
        ? 'Location verified' 
        : `You are ${Math.round(distance)}m away from workplace (max: ${employee.geofence.radius}m)`
    };
  } catch (error) {
    console.log('Geofence validation error, allowing for testing:', error);
    return { valid: true, message: 'Geofence validation failed - allowing for testing' };
  }
}

// GET /api/attendance - Get attendance records
router.get('/', authenticate, async (req: any, res: any) => {
  try {
    const { 
      page = 1, 
      pageSize = 20, 
      employeeId, 
      date, 
      status,
      startDate,
      endDate 
    } = req.query;

    const filter: any = {};
    
    if (employeeId) filter.employeeId = employeeId;
    if (date) filter.date = date;
    if (status) filter.status = status;
    
    if (startDate && endDate) {
      filter.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const records = await AttendanceModel.find(filter)
      .sort({ date: -1, 'clockIn.time': -1 })
      .skip(skip)
      .limit(parseInt(pageSize));

    const total = await AttendanceModel.countDocuments(filter);

    res.json({
      success: true,
      data: records,
      meta: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    logger.error('Error fetching attendance records:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch attendance records'
      }
    });
  }
});

// POST /api/attendance/clock-in - Clock in
router.post('/clock-in', 
  authenticate,
  async (req: any, res: any) => {
    try {
      console.log('Clock-in request body:', req.body);
      const { employeeId, location, selfie, notes } = req.body;
      
      // Basic validation
      if (!employeeId) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Employee ID is required' }
        });
      }
      
      if (!location || !location.latitude || !location.longitude) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Valid location is required' }
        });
      }
      
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5); // HH:MM

      // Check if already clocked in today
      const existingRecord = await AttendanceModel.findOne({
        employeeId,
        date: today,
        clockIn: { $exists: true }
      });

      if (existingRecord) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ALREADY_CLOCKED_IN',
            message: 'Already clocked in today'
          }
        });
      }

      // Validate geofence
      console.log('Validating geofence for employee:', employeeId);
      const geofenceValidation = await validateGeofence(employeeId, location.latitude, location.longitude);
      console.log('Geofence validation result:', geofenceValidation);
      
      if (!geofenceValidation.valid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'GEOFENCE_VIOLATION',
            message: geofenceValidation.message
          },
          data: {
            distance: geofenceValidation.distance
          }
        });
      }

      // Get employee details for geocoding
      const employee = await EmployeeModel.findOne({ employeeId });
      const address = employee?.geofence?.address || 'Workplace';

      const attendanceRecord = new AttendanceModel({
        id: generateId(),
        employeeId,
        date: today,
        clockIn: Date.now(),
        clockInPhotoEnc: selfie || null,
        clockInGeo: {
          lat: location.latitude,
          lon: location.longitude,
          acc: 10 // Default accuracy
        },
        status: 'present',
        notes: notes || '',
        deviceId: req.headers['x-device-id'] || 'unknown'
      });

      const savedRecord = await attendanceRecord.save();

      logger.info('Employee clocked in:', { 
        employeeId, 
        date: today, 
        time: currentTime,
        location: geofenceValidation.distance ? `${geofenceValidation.distance}m from workplace` : 'unknown'
      });

      res.status(201).json({
        success: true,
        data: savedRecord,
        message: 'Successfully clocked in'
      });
    } catch (error) {
      logger.error('Error clocking in:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to clock in'
        }
      });
    }
  }
);

// POST /api/attendance/clock-out - Clock out
router.post('/clock-out', 
  authenticate,
  async (req: any, res: any) => {
    try {
      const { employeeId, location, selfie, notes } = req.body;
      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5);

      // Find today's record
      const attendanceRecord = await AttendanceModel.findOne({
        employeeId,
        date: today,
        clockIn: { $exists: true },
        clockOut: { $exists: false }
      });

      if (!attendanceRecord) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NOT_CLOCKED_IN',
            message: 'Must clock in before clocking out'
          }
        });
      }

      // Validate geofence
      const geofenceValidation = await validateGeofence(employeeId, location.latitude, location.longitude);
      if (!geofenceValidation.valid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'GEOFENCE_VIOLATION',
            message: geofenceValidation.message
          }
        });
      }

      // Calculate total hours
      const clockInTime = new Date(attendanceRecord.clockIn!);
      const clockOutTime = new Date();
      const totalMs = clockOutTime.getTime() - clockInTime.getTime();
      const totalMinutes = Math.round(totalMs / (1000 * 60));
      const totalHours = totalMinutes / 60;

      // Get employee for overtime calculation
      const employee = await EmployeeModel.findOne({ employeeId });
      const expectedHours = 8; // Default 8 hours
      const overtimeMinutes = Math.max(0, totalMinutes - (expectedHours * 60));

      // Update record
      attendanceRecord.clockOut = Date.now();
      attendanceRecord.clockOutPhotoEnc = selfie || null;
      attendanceRecord.clockOutGeo = {
        lat: location.latitude,
        lon: location.longitude,
        acc: 10
      };
      attendanceRecord.overtimeMinutes = overtimeMinutes;
      attendanceRecord.notes = notes || attendanceRecord.notes;

      const updatedRecord = await attendanceRecord.save();

      logger.info('Employee clocked out:', { 
        employeeId, 
        date: today, 
        time: currentTime,
        totalHours,
        overtimeMinutes
      });

      res.json({
        success: true,
        data: updatedRecord,
        message: 'Successfully clocked out'
      });
    } catch (error) {
      logger.error('Error clocking out:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to clock out'
        }
      });
    }
  }
);

// GET /api/attendance/stats - Get attendance statistics
router.get('/stats', authenticate, async (req: any, res: any) => {
  try {
    const { employeeId, startDate, endDate } = req.query;
    const filter: any = {};
    if (employeeId) filter.employeeId = employeeId;
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const records = await AttendanceModel.find(filter);
    
    const stats = {
      totalDays: records.length,
      presentDays: records.filter(r => r.status === 'present').length,
      absentDays: records.filter(r => r.status === 'absent').length,
      lateDays: records.filter(r => r.isLate).length,
      totalHours: records.reduce((sum, r) => sum + (r.overtimeMinutes || 0) / 60, 0),
      overtimeHours: records.reduce((sum, r) => sum + (r.overtimeMinutes || 0) / 60, 0),
      averageHoursPerDay: records.length > 0 
        ? records.reduce((sum, r) => sum + (r.overtimeMinutes || 0) / 60, 0) / records.length 
        : 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error fetching attendance stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch attendance statistics'
      }
    });
  }
});

// POST /api/attendance/create-test-employee - Create a test employee
router.post('/create-test-employee', authenticate, async (req: any, res: any) => {
  try {
    console.log('Creating test employee...');
    const testEmployee = new EmployeeModel({
      id: generateId(),
      name: 'John Doe',
      phone: '9999999999',
      employeeId: 'EMP001',
      role: 'employee',
      salary: {
        monthly: 25000
      },
      workSchedule: {
        startTime: '09:00',
        endTime: '18:00',
        workingDays: [1, 2, 3, 4, 5], // Monday to Friday
        breakDuration: 60 // 1 hour
      },
      geofence: {
        center: {
          latitude: 12.848172425998547,
          longitude: 77.65675506736932
        },
        radius: 100, // 100 meters
        address: 'Workplace Office'
      },
      isActive: true,
      joinDate: '2024-01-01'
    });

    console.log('Saving test employee...');
    const savedEmployee = await testEmployee.save();
    console.log('Test employee saved successfully:', savedEmployee.id);
    
    res.json({
      success: true,
      data: savedEmployee,
      message: 'Test employee created successfully'
    });
  } catch (error) {
    console.error('Error creating test employee:', error);
    logger.error('Error creating test employee:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create test employee'
      }
    });
  }
});

export default router;
