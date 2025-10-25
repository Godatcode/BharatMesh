import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Snackbar
} from '@mui/material';
import {
  AccessTime,
  LocationOn,
  CheckCircle,
  Cancel,
  People,
  Schedule,
  Warning
} from '@mui/icons-material';
import { AttendanceRecord } from '@bharatmesh/shared';
import { attendanceApi } from '@services/api';
import { db } from '@services/db';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`attendance-tabpanel-${index}`}
      aria-labelledby={`attendance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Attendance = () => {
  
  // State
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clockInDialogOpen, setClockInDialogOpen] = useState(false);
  const [clockOutDialogOpen, setClockOutDialogOpen] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isClockingIn, setIsClockingIn] = useState(false);

  // Mock employee data (in real app, this would come from API)
  const currentEmployee = {
    id: 'emp-001',
    name: 'John Doe',
    employeeId: 'EMP001',
    role: 'employee'
  };

  // Load attendance records
  useEffect(() => {
    loadAttendanceRecords();
  }, []);

  const loadAttendanceRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await attendanceApi.getAttendance({
        employeeId: currentEmployee.employeeId,
        pageSize: 50
      });
      
      if (response.success) {
        setAttendanceRecords(response.data);
        setFilteredRecords(response.data);
      } else {
        throw new Error(response.error?.message || 'Failed to load attendance records');
      }
    } catch (err) {
      setError('Using offline data - ' + (err as Error).message);
      
      // Fallback to local storage
      try {
        const localRecords = await db.attendance.toArray();
        setAttendanceRecords(localRecords);
        setFilteredRecords(localRecords);
      } catch (localErr) {
        setError('Failed to load attendance data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get current location
  const getCurrentLocation = (): Promise<{latitude: number, longitude: number}> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(new Error(`Location error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  // Capture selfie
  const captureSelfie = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then((stream) => {
          const video = document.createElement('video');
          video.srcObject = stream;
          video.play();

          video.onloadedmetadata = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0);
              const dataURL = canvas.toDataURL('image/jpeg', 0.8);
              stream.getTracks().forEach(track => track.stop());
              resolve(dataURL);
            } else {
              reject(new Error('Failed to capture image'));
            }
          };
        })
        .catch((error) => {
          reject(new Error(`Camera error: ${error.message}`));
        });
    });
  };

  // Clock in
  const handleClockIn = async () => {
    try {
      setIsClockingIn(true);
      setLocationError(null);

      // Get location
      const location = await getCurrentLocation();

      // Capture selfie
      let selfieData = null;
      try {
        selfieData = await captureSelfie();
        setSelfie(selfieData);
      } catch (selfieError) {
        // Continue without selfie
      }

      // Clock in
      const requestData = {
        employeeId: currentEmployee.employeeId,
        location: location,
        selfie: selfieData,
        notes: notes
      };
      
      const response = await attendanceApi.clockIn(requestData);

      if (response.success) {
        setSnackbarMessage('Successfully clocked in!');
        setSnackbarOpen(true);
        setClockInDialogOpen(false);
        setNotes('');
        setSelfie(null);
        loadAttendanceRecords();
      } else {
        throw new Error(response.error?.message || 'Failed to clock in');
      }
    } catch (err) {
      setLocationError((err as Error).message);
    } finally {
      setIsClockingIn(false);
    }
  };

  // Clock out
  const handleClockOut = async () => {
    try {
      setIsClockingIn(true);
      setLocationError(null);

      // Get location
      const location = await getCurrentLocation();

      // Capture selfie
      let selfieData = null;
      try {
        selfieData = await captureSelfie();
        setSelfie(selfieData);
      } catch (selfieError) {
        // Continue without selfie
      }

      // Clock out
      const response = await attendanceApi.clockOut({
        employeeId: currentEmployee.employeeId,
        location: location,
        selfie: selfieData,
        notes: notes
      });

      if (response.success) {
        setSnackbarMessage('Successfully clocked out!');
        setSnackbarOpen(true);
        setClockOutDialogOpen(false);
        setNotes('');
        setSelfie(null);
        loadAttendanceRecords();
      } else {
        throw new Error(response.error?.message || 'Failed to clock out');
      }
    } catch (err) {
      setLocationError((err as Error).message);
    } finally {
      setIsClockingIn(false);
    }
  };

  // Check if already clocked in today
  const today = new Date().toISOString().split('T')[0];
  const todayRecord = attendanceRecords.find(record => record.date === today);
  const isClockedIn = todayRecord && todayRecord.clockIn && !todayRecord.clockOut;

  // Calculate stats
  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter(r => r.status === 'present').length;
  const absentDays = attendanceRecords.filter(r => r.status === 'absent').length;
  const totalHours = attendanceRecords.reduce((sum, r) => sum + (r.overtimeMinutes || 0) / 60, 0);

  return (
    <Box>
      {/* Loading and Error States */}
      {loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            🔄 Loading attendance records...
          </Typography>
        </Alert>
      )}
      
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            ⚠️ {error}
          </Typography>
        </Alert>
      )}

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={600}>
          Attendance
        </Typography>
        <Box display="flex" gap={2}>
          {!isClockedIn ? (
            <Button
              variant="contained"
              startIcon={<AccessTime />}
              onClick={() => setClockInDialogOpen(true)}
              color="success"
              size="large"
            >
              Clock In
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<AccessTime />}
              onClick={() => setClockOutDialogOpen(true)}
              color="error"
              size="large"
            >
              Clock Out
            </Button>
          )}
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <People color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{totalDays}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Days
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircle color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{presentDays}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Present Days
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Cancel color="error" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{absentDays}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Absent Days
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Schedule color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{totalHours.toFixed(1)}h</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Hours
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Current Status */}
      {isClockedIn && todayRecord && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Currently Clocked In
          </Typography>
          <Typography variant="body2">
            Clocked in at {todayRecord.clockIn ? new Date(todayRecord.clockIn).toLocaleTimeString() : 'Unknown'} from Workplace
          </Typography>
        </Alert>
      )}

      {/* Attendance Records */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="All Records" />
            <Tab label="This Month" />
            <Tab label="This Week" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <AttendanceTable records={filteredRecords} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <AttendanceTable records={filteredRecords.filter(r => 
            new Date(r.date).getMonth() === new Date().getMonth()
          )} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <AttendanceTable records={filteredRecords.filter(r => {
            const recordDate = new Date(r.date);
            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return recordDate >= weekAgo;
          })} />
        </TabPanel>
      </Card>

      {/* Clock In Dialog */}
      <Dialog
        open={clockInDialogOpen}
        onClose={() => setClockInDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AccessTime color="success" />
            <Typography variant="h6">Clock In</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Employee: {currentEmployee.name} ({currentEmployee.employeeId})
            </Typography>
            
            {locationError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {locationError}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Notes (Optional)"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{ mt: 2 }}
              placeholder="Add any notes about your clock in..."
            />

            {selfie && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Selfie Captured
                </Typography>
                <img 
                  src={selfie} 
                  alt="Selfie" 
                  style={{ 
                    width: '100%', 
                    maxWidth: 200, 
                    height: 'auto',
                    borderRadius: 8
                  }} 
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClockInDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleClockIn}
            disabled={isClockingIn}
            startIcon={isClockingIn ? <CircularProgress size={20} /> : <AccessTime />}
          >
            {isClockingIn ? 'Processing...' : 'Clock In'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clock Out Dialog */}
      <Dialog
        open={clockOutDialogOpen}
        onClose={() => setClockOutDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AccessTime color="error" />
            <Typography variant="h6">Clock Out</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Employee: {currentEmployee.name} ({currentEmployee.employeeId})
            </Typography>
            
            {todayRecord && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Clocked in at {todayRecord.clockIn ? new Date(todayRecord.clockIn).toLocaleTimeString() : 'Unknown'}
              </Alert>
            )}

            {locationError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {locationError}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Notes (Optional)"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{ mt: 2 }}
              placeholder="Add any notes about your clock out..."
            />

            {selfie && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Selfie Captured
                </Typography>
                <img 
                  src={selfie} 
                  alt="Selfie" 
                  style={{ 
                    width: '100%', 
                    maxWidth: 200, 
                    height: 'auto',
                    borderRadius: 8
                  }} 
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClockOutDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleClockOut}
            disabled={isClockingIn}
            startIcon={isClockingIn ? <CircularProgress size={20} /> : <AccessTime />}
          >
            {isClockingIn ? 'Processing...' : 'Clock Out'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

// Attendance Table Component
const AttendanceTable: React.FC<{ records: AttendanceRecord[] }> = ({ records }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle color="success" />;
      case 'absent': return <Cancel color="error" />;
      case 'late': return <Warning color="warning" />;
      default: return <AccessTime />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      default: return 'default';
    }
  };

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Clock In</TableCell>
            <TableCell>Clock Out</TableCell>
            <TableCell>Total Hours</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Location</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                <AccessTime sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No attendance records found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) => (
              <TableRow key={record.id} hover>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(record.date).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  {record.clockIn ? (
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {new Date(record.clockIn).toLocaleTimeString()}
                      </Typography>
                      {record.clockInGeo && (
                        <Typography variant="caption" color="text.secondary">
                          <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
                          Workplace
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {record.clockOut ? (
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {new Date(record.clockOut).toLocaleTimeString()}
                      </Typography>
                      {record.clockOutGeo && (
                        <Typography variant="caption" color="text.secondary">
                          <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
                          Workplace
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {record.overtimeMinutes ? `${(record.overtimeMinutes / 60).toFixed(1)}h` : '-'}
                  </Typography>
                  {record.overtimeMinutes && record.overtimeMinutes > 0 && (
                    <Typography variant="caption" color="warning.main">
                      +{(record.overtimeMinutes / 60).toFixed(1)}h OT
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(record.status)}
                    label={record.status.replace('-', ' ')}
                    color={getStatusColor(record.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="caption">
                      Workplace
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Attendance;