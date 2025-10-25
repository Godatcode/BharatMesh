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
  TextField,
  InputAdornment,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import { 
  Add, 
  Receipt, 
  Search, 
  Visibility, 
  Print, 
  Edit,
  Delete,
  TrendingUp,
  AttachMoney,
  ReceiptLong
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Invoice } from '@bharatmesh/shared';
import InvoiceForm from './InvoiceForm';
import { useAuthStore } from '@stores/authStore';
import { billingApi } from '@services/api';
import { db } from '@services/db';

const Billing = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [invoiceFormOpen, setInvoiceFormOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load invoices on mount
  useEffect(() => {
    loadInvoices();
  }, [user?.id]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      
      // Try to load from API first
      const response = await billingApi.getInvoices();
      
      if (response.success) {
        setInvoices(response.data);
        setFilteredInvoices(response.data);
        
        // Save to local storage for offline access
        await saveInvoicesToLocal(response.data);
      } else {
        throw new Error(response.error?.message || 'Failed to load invoices');
      }
    } catch (err) {
      setError('Using offline data - ' + (err as Error).message);
      
      // Fallback to local storage
      await loadInvoicesFromLocal();
    } finally {
      setLoading(false);
    }
  };

  const loadInvoicesFromLocal = async () => {
    try {
      const localInvoices = await db.invoices.toArray();
      setInvoices(localInvoices);
      setFilteredInvoices(localInvoices);
    } catch (err) {
      // Final fallback to mock data
      loadMockInvoices();
    }
  };

  const saveInvoicesToLocal = async (invoices: Invoice[]) => {
    try {
      // Use bulkPut instead of bulkAdd to handle duplicates
      await db.invoices.bulkPut(invoices);
    } catch (err) {
    }
  };

  const loadMockInvoices = () => {
    // Fallback mock data
    const mockInvoices: Invoice[] = [
      {
        id: 'INV-001',
        ts: Date.now() - 3600000,
        deviceId: 'device-1',
        userId: user?.id || '',
        items: [
          { productId: '1', name: 'Rice (1kg)', qty: 2, unitPrice: 50, gstRate: 5, total: 100 },
          { productId: '2', name: 'Dal (500g)', qty: 1, unitPrice: 80, gstRate: 5, total: 80 }
        ],
        subtotal: 180,
        gst: { cgst: 4.5, sgst: 4.5, igst: 0, totalGst: 9 },
        total: 189,
        tender: 'cash',
        customer: { name: 'Rajesh Kumar', phone: '9876543210' },
        sync: 'synced'
      }
    ];
    setInvoices(mockInvoices);
    setFilteredInvoices(mockInvoices);
  };

  // Filter invoices based on search
  useEffect(() => {
    if (searchQuery) {
      const filtered = invoices.filter(invoice =>
        invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.customer?.phone?.includes(searchQuery)
      );
      setFilteredInvoices(filtered);
    } else {
      setFilteredInvoices(invoices);
    }
  }, [searchQuery, invoices]);

  const handleSaveInvoice = async (newInvoice: Invoice) => {
    try {
      
      const response = await billingApi.createInvoice(newInvoice);
      
      if (response.success) {
        setInvoices([response.data, ...invoices]);
        
        // Save to local storage for offline access
        await db.invoices.put(response.data);
      } else {
        throw new Error(response.error?.message || 'Failed to save invoice');
      }
    } catch (err) {
      
      // Save to offline queue for sync later
      await db.syncQueue.add({
        id: `sync-${Date.now()}`,
        collection: 'invoices',
        operation: 'create',
        documentId: newInvoice.id,
        data: newInvoice,
        priority: 'high',
        deviceId: 'device-001',
        userId: user?.id || 'user-001',
        ts: Date.now(),
        vectorClock: { 'device-001': Date.now() },
        checksum: 'temp',
        retries: 0,
        status: 'queued'
      });
      
      // Update UI immediately for better UX
      setInvoices([newInvoice, ...invoices]);
      setError('Invoice saved offline - will sync when online');
    }
    
    setInvoiceFormOpen(false);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewDialogOpen(true);
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    // In real app, implement thermal printer integration
    alert('Print functionality will be implemented with thermal printer integration');
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setInvoices(invoices.filter(inv => inv.id !== invoiceId));
    }
  };

  // Calculate stats
  const today = new Date().toDateString();
  const todayInvoices = invoices.filter(inv => new Date(inv.ts).toDateString() === today);
  const todayRevenue = todayInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);

  return (
    <Box>
      {/* Header with Stats */}
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" fontWeight={600}>
            {t('billing.title')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            size="large"
            onClick={() => setInvoiceFormOpen(true)}
          >
            {t('billing.newInvoice')}
          </Button>
        </Box>

        {/* Loading and Error States */}
        {loading && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              🔄 Loading invoices from server...
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

        {/* Quick Stats */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <ReceiptLong color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">{invoices.length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Invoices
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
                  <TrendingUp color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">₹{todayRevenue.toFixed(0)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Today's Sales
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
                  <AttachMoney color="info" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">₹{totalRevenue.toFixed(0)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Revenue
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
                  <Receipt color="warning" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h6">
                      {invoices.filter(inv => inv.sync === 'pending').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Sync
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search invoices by ID, customer name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('billing.invoiceNumber')}</TableCell>
                  <TableCell>{t('billing.customer')}</TableCell>
                  <TableCell align="right">{t('billing.total')}</TableCell>
                  <TableCell>{t('billing.payment')}</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Receipt sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        {searchQuery ? 'No invoices found matching your search' : 'No invoices yet. Create your first invoice!'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {invoice.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {invoice.customer?.name || 'Walk-in'}
                          </Typography>
                          {invoice.customer?.phone && (
                            <Typography variant="caption" color="text.secondary">
                              {invoice.customer.phone}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={500}>
                          ₹{invoice.total.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={invoice.tender.toUpperCase()}
                          size="small"
                          color={invoice.tender === 'cash' ? 'default' : 'primary'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(invoice.ts).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(invoice.ts).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={invoice.sync}
                          color={invoice.sync === 'synced' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={1}>
                          <Tooltip title="View">
                            <IconButton
                              size="small"
                              onClick={() => handleViewInvoice(invoice)}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Print">
                            <IconButton
                              size="small"
                              onClick={() => handlePrintInvoice(invoice)}
                            >
                              <Print fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteInvoice(invoice.id)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Invoice Form Dialog */}
      <Dialog
        open={invoiceFormOpen}
        onClose={() => setInvoiceFormOpen(false)}
        maxWidth="xl"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          <InvoiceForm
            onClose={() => setInvoiceFormOpen(false)}
            onSave={handleSaveInvoice}
          />
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Invoice Details - {selectedInvoice?.id}
        </DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Box>
              {/* Customer Info */}
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>Customer Details</Typography>
                <Typography><strong>Name:</strong> {selectedInvoice.customer?.name || 'Walk-in'}</Typography>
                {selectedInvoice.customer?.phone && (
                  <Typography><strong>Phone:</strong> {selectedInvoice.customer.phone}</Typography>
                )}
                {selectedInvoice.customer?.addr && (
                  <Typography><strong>Address:</strong> {selectedInvoice.customer.addr}</Typography>
                )}
              </Box>

              {/* Items */}
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>Items</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell align="center">Qty</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedInvoice.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell align="center">{item.qty}</TableCell>
                          <TableCell align="right">₹{item.unitPrice}</TableCell>
                          <TableCell align="right">₹{item.total}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Summary */}
              <Box>
                <Typography variant="h6" gutterBottom>Summary</Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Subtotal:</Typography>
                  <Typography>₹{selectedInvoice.subtotal.toFixed(2)}</Typography>
                </Box>
                {selectedInvoice.gst && (
                  <>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography>CGST:</Typography>
                      <Typography>₹{selectedInvoice.gst.cgst.toFixed(2)}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography>SGST:</Typography>
                      <Typography>₹{selectedInvoice.gst.sgst.toFixed(2)}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography>Total GST:</Typography>
                      <Typography>₹{selectedInvoice.gst.totalGst.toFixed(2)}</Typography>
                    </Box>
                  </>
                )}
                {selectedInvoice.discount && selectedInvoice.discount > 0 && (
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Discount:</Typography>
                    <Typography>-₹{selectedInvoice.discount.toFixed(2)}</Typography>
                  </Box>
                )}
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6">₹{selectedInvoice.total.toFixed(2)}</Typography>
                </Box>
                <Typography><strong>Payment:</strong> {selectedInvoice.tender.toUpperCase()}</Typography>
                {selectedInvoice.notes && (
                  <Typography><strong>Notes:</strong> {selectedInvoice.notes}</Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<Print />}
            onClick={() => selectedInvoice && handlePrintInvoice(selectedInvoice)}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Billing;

