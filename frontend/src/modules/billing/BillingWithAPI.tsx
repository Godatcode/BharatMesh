// Example: How to connect Billing module to real API data
// Replace the mock data in Billing.tsx with real API calls

import { useState, useEffect } from 'react';
import { billingApi } from '@services/api';
import { Invoice } from '@bharatmesh/shared';

const Billing = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load real data from API
  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await billingApi.getInvoices();
      if (response.success) {
        setInvoices(response.data);
      } else {
        setError(response.error?.message || 'Failed to load invoices');
      }
    } catch (err) {
      setError('Network error - using offline data');
      // Fallback to local storage or mock data
      loadOfflineData();
    } finally {
      setLoading(false);
    }
  };

  const loadOfflineData = async () => {
    // Load from IndexedDB (offline storage)
    try {
      const { db } = await import('@services/db');
      const offlineInvoices = await db.invoices.toArray();
      setInvoices(offlineInvoices);
    } catch (err) {
      // Final fallback to mock data
      setInvoices(mockInvoices);
    }
  };

  const handleSaveInvoice = async (newInvoice: Invoice) => {
    try {
      const response = await billingApi.createInvoice(newInvoice);
      if (response.success) {
        setInvoices([response.data, ...invoices]);
        // Also save to local storage for offline access
        const { db } = await import('@services/db');
        await db.invoices.add(response.data);
      }
    } catch (err) {
      // Save to offline queue
      const { db } = await import('@services/db');
      await db.syncQueue.add({
        id: `sync-${Date.now()}`,
        operation: 'create',
        entity: 'invoice',
        data: newInvoice,
        status: 'pending',
        timestamp: Date.now()
      });
      // Add to local state for immediate UI update
      setInvoices([newInvoice, ...invoices]);
    }
  };

  // Rest of component...
};
