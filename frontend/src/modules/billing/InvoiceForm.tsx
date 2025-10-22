import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Invoice, InvoiceItem, Tender, GSTBreakup, Customer } from '@bharatmesh/shared';
import { useAuthStore } from '@stores/authStore';

interface Product {
  id: string;
  name: string;
  hsn?: string;
  unitPrice: number;
  gstRate: number;
  stock: number;
  category: string;
}

const InvoiceForm: React.FC<{ onClose: () => void; onSave: (invoice: Invoice) => void }> = ({
  onClose,
  onSave
}) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  
  // Form state
  const [customer, setCustomer] = useState<Customer>({});
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [tender, setTender] = useState<Tender>('cash');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<any>({});
  
  // UI state
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const gstBreakup = calculateGST(items);
  const total = subtotal + gstBreakup.totalGst - discount;

  // Load products on mount
  useEffect(() => {
    // Mock products - in real app, load from API
    const mockProducts: Product[] = [
      { id: '1', name: 'Rice (1kg)', hsn: '1006', unitPrice: 50, gstRate: 5, stock: 100, category: 'Grocery' },
      { id: '2', name: 'Dal (500g)', hsn: '0713', unitPrice: 80, gstRate: 5, stock: 50, category: 'Grocery' },
      { id: '3', name: 'Oil (1L)', hsn: '1509', unitPrice: 120, gstRate: 12, stock: 30, category: 'Grocery' },
      { id: '4', name: 'Soap', hsn: '3401', unitPrice: 25, gstRate: 18, stock: 200, category: 'Personal Care' },
      { id: '5', name: 'Biscuits', hsn: '1905', unitPrice: 15, gstRate: 12, stock: 150, category: 'Snacks' }
    ];
    setProducts(mockProducts);
    setFilteredProducts(mockProducts);
  }, []);

  // Filter products based on search
  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const addItem = (product: Product) => {
    const existingItem = items.find(item => item.productId === product.id);
    
    if (existingItem) {
      // Update quantity
      const updatedItems = items.map(item =>
        item.productId === product.id
          ? { ...item, qty: item.qty + 1, total: (item.qty + 1) * item.unitPrice }
          : item
      );
      setItems(updatedItems);
    } else {
      // Add new item
      const newItem: InvoiceItem = {
        productId: product.id,
        name: product.name,
        hsn: product.hsn,
        qty: 1,
        unitPrice: product.unitPrice,
        gstRate: product.gstRate,
        total: product.unitPrice
      };
      setItems([...items, newItem]);
    }
    
    setProductDialogOpen(false);
    setSearchQuery('');
  };

  const updateItemQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeItem(productId);
      return;
    }
    
    const updatedItems = items.map(item =>
      item.productId === productId
        ? { ...item, qty, total: qty * item.unitPrice }
        : item
    );
    setItems(updatedItems);
  };

  const removeItem = (productId: string) => {
    setItems(items.filter(item => item.productId !== productId));
  };

  const handleSave = () => {
    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    const invoice: Invoice = {
      id: `INV-${Date.now()}`,
      ts: Date.now(),
      deviceId: 'device-1', // Get from device store
      userId: user?.id || '',
      items,
      subtotal,
      gst: gstBreakup,
      discount,
      total,
      tender,
      payment: paymentDetails,
      customer,
      notes,
      sync: 'pending'
    };

    onSave(invoice);
    onClose();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>
          {t('billing.newInvoice')}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            sx={{ mr: 1 }}
            disabled={items.length === 0}
          >
            {t('billing.printBill')}
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={items.length === 0}
          >
            {t('billing.saveBill')}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Customer Details */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('billing.customer')}
              </Typography>
              <TextField
                fullWidth
                label="Name"
                value={customer.name || ''}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Phone"
                value={customer.phone || ''}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={customer.addr || ''}
                onChange={(e) => setCustomer({ ...customer, addr: e.target.value })}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Items List */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  {t('billing.items')} ({items.length})
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setProductDialogOpen(true)}
                >
                  {t('billing.addItem')}
                </Button>
              </Box>

              {items.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <ReceiptIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    No items added yet
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell align="center">Qty</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">GST%</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.productId}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {item.name}
                              </Typography>
                              {item.hsn && (
                                <Typography variant="caption" color="text.secondary">
                                  HSN: {item.hsn}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <TextField
                              type="number"
                              value={item.qty}
                              onChange={(e) => updateItemQuantity(item.productId, parseInt(e.target.value) || 0)}
                              size="small"
                              sx={{ width: 80 }}
                              inputProps={{ min: 1 }}
                            />
                          </TableCell>
                          <TableCell align="right">₹{item.unitPrice}</TableCell>
                          <TableCell align="right">{item.gstRate}%</TableCell>
                          <TableCell align="right">₹{item.total}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeItem(item.productId)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Payment & Summary */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Payment Method
                  </Typography>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Tender</InputLabel>
                    <Select
                      value={tender}
                      onChange={(e) => setTender(e.target.value as Tender)}
                    >
                      <MenuItem value="cash">Cash</MenuItem>
                      <MenuItem value="upi">UPI</MenuItem>
                      <MenuItem value="card">Card</MenuItem>
                      <MenuItem value="credit">Credit</MenuItem>
                    </Select>
                  </FormControl>

                  {tender === 'cash' && (
                    <TextField
                      fullWidth
                      label="Cash Received"
                      type="number"
                      value={paymentDetails.cashIn || ''}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, cashIn: parseFloat(e.target.value) || 0 })}
                    />
                  )}

                  {tender === 'upi' && (
                    <TextField
                      fullWidth
                      label="UPI Reference"
                      value={paymentDetails.upiRef || ''}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, upiRef: e.target.value })}
                    />
                  )}

                  {tender === 'card' && (
                    <TextField
                      fullWidth
                      label="Last 4 digits"
                      value={paymentDetails.cardLast4 || ''}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, cardLast4: e.target.value })}
                    />
                  )}

                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    sx={{ mt: 2 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Bill Summary
                  </Typography>
                  
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Subtotal:</Typography>
                    <Typography>₹{subtotal.toFixed(2)}</Typography>
                  </Box>

                  {gstBreakup.cgst > 0 && (
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">CGST:</Typography>
                      <Typography variant="body2">₹{gstBreakup.cgst.toFixed(2)}</Typography>
                    </Box>
                  )}

                  {gstBreakup.sgst > 0 && (
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">SGST:</Typography>
                      <Typography variant="body2">₹{gstBreakup.sgst.toFixed(2)}</Typography>
                    </Box>
                  )}

                  {gstBreakup.igst > 0 && (
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">IGST:</Typography>
                      <Typography variant="body2">₹{gstBreakup.igst.toFixed(2)}</Typography>
                    </Box>
                  )}

                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Total GST:</Typography>
                    <Typography>₹{gstBreakup.totalGst.toFixed(2)}</Typography>
                  </Box>

                  <TextField
                    fullWidth
                    label="Discount"
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    sx={{ my: 2 }}
                  />

                  <Divider sx={{ my: 2 }} />

                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="h6">Total Amount:</Typography>
                    <Typography variant="h6" color="primary">
                      ₹{total.toFixed(2)}
                    </Typography>
                  </Box>

                  {tender === 'cash' && paymentDetails.cashIn > 0 && (
                    <Box display="flex" justifyContent="space-between">
                      <Typography>Change:</Typography>
                      <Typography color={paymentDetails.cashIn - total < 0 ? 'error' : 'success'}>
                        ₹{(paymentDetails.cashIn - total).toFixed(2)}
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Product Selection Dialog */}
      <Dialog
        open={productDialogOpen}
        onClose={() => setProductDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <SearchIcon />
            <TextField
              fullWidth
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">GST%</TableCell>
                  <TableCell align="center">Stock</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {product.name}
                        </Typography>
                        {product.hsn && (
                          <Typography variant="caption" color="text.secondary">
                            HSN: {product.hsn}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={product.category} size="small" />
                    </TableCell>
                    <TableCell align="right">₹{product.unitPrice}</TableCell>
                    <TableCell align="right">{product.gstRate}%</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={product.stock}
                        color={product.stock < 10 ? 'error' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => addItem(product)}
                        disabled={product.stock === 0}
                      >
                        Add
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Helper function to calculate GST
function calculateGST(items: InvoiceItem[]): GSTBreakup {
  const gstRates = items.reduce((acc, item) => {
    const rate = item.gstRate || 0;
    const taxableAmount = item.total;
    const gstAmount = (taxableAmount * rate) / 100;
    
    if (!acc[rate]) {
      acc[rate] = { taxable: 0, gst: 0 };
    }
    acc[rate].taxable += taxableAmount;
    acc[rate].gst += gstAmount;
    
    return acc;
  }, {} as Record<number, { taxable: number; gst: number }>);

  let totalGst = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  // For simplicity, assuming all sales are intra-state (CGST + SGST)
  // In real app, determine based on customer location
  Object.values(gstRates).forEach(({ gst }) => {
    totalGst += gst;
    cgst += gst / 2;
    sgst += gst / 2;
  });

  return { cgst, sgst, igst, totalGst };
}

export default InvoiceForm;
