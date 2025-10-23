import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuthStore } from '@stores/authStore';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import { initializeDatabase } from '@services/db';
import { initializeSync } from '@services/sync';

// Layouts
import MainLayout from '@components/layouts/MainLayout';
import AuthLayout from '@components/layouts/AuthLayout';

// Pages
import Login from '@modules/auth/Login';
import Register from '@modules/auth/Register';
import Dashboard from '@modules/dashboard/Dashboard';
import Billing from '@modules/billing/Billing';
import Inventory from '@modules/inventory/Inventory';
import Orders from '@modules/orders/Orders';
import Attendance from '@modules/attendance/Attendance';
import Settings from '@modules/settings/Settings';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { isAuthenticated, initialize } = useAuthStore();
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    async function init() {
      try {
        // Initialize IndexedDB
        await initializeDatabase();
        
        // Restore auth state from localStorage
        await initialize();
        
        // Initialize P2P sync
        if (isAuthenticated) {
          await initializeSync();
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Initialization error:', error);
        setIsInitialized(true); // Continue even if init fails
      }
    }
    
    init();
  }, [initialize, isAuthenticated]);

  if (!isInitialized) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <>
      {!isOnline && (
        <div className="offline-banner">
          ⚠️ Working Offline - Changes will sync when connection is restored
        </div>
      )}
      
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Route>
            <Route path="*" element={<Navigate to="/auth/login" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="billing" element={<Billing />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="orders" element={<Orders />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </>
  );
}

export default App;

