import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Chip,
  Divider,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  WhatsApp as WhatsAppIcon,
  Phone as PhoneIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Order, OrderLine, OrderChannel, OrderStatus, Unit } from '@bharatmesh/shared';
import { inventoryApi } from '@services/api';

interface Product {
  id: string;
  name: string;
  unitPrice: number;
  unit: Unit;
  stock: number;
}

interface OrderFormProps {
  order?: Order;
  onSave: (order: Order) => void;
  onClose: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ order, onSave, onClose }) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<Order>(order || {
    id: '',
    ts: Date.now(),
    channel: 'counter',
    customer: {
      phone: '',
      name: '',
      address: ''
    },
    lines: [],
    status: 'draft',
    notes: '',
    sync: 'pending',
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Mock products
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await inventoryApi.getProducts();
      
      if (response.success) {
        setProducts(response.data);
        setFilteredProducts(response.data);
      } else {
        throw new Error(response.error?.message || 'Failed to load products');
      }
    } catch (err) {
      // Fallback to mock products
      const mockProducts: Product[] = [
        { id: 'prod-1', name: 'Rice (1kg)', unitPrice: 50, unit: 'kg', stock: 25 },
        { id: 'prod-2', name: 'Dal (500g)', unitPrice: 80, unit: 'g', stock: 5 },
        { id: 'prod-3', name: 'Oil (1L)', unitPrice: 120, unit: 'l', stock: 0 },
        { id: 'prod-4', name: 'Soap', unitPrice: 25, unit: 'piece', stock: 200 },
        { id: 'prod-5', name: 'Biscuits', unitPrice: 15, unit: 'packet', stock: 150 }
      ];
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
    }
  };

  // Filter products
  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const handleInputChange = (field: keyof Order, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      updatedAt: Date.now()
    }));
  };

  const handleCustomerChange = (field: keyof Order['customer'], value: string) => {
    setFormData(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        [field]: value
      },
      updatedAt: Date.now()
    }));
  };

  const addLine = (product: Product) => {
    const existingLine = formData.lines.find(line => line.productId === product.id);
    
    if (existingLine) {
      const updatedLines = formData.lines.map(line =>
        line.productId === product.id
          ? { ...line, qty: line.qty + 1, total: (line.qty + 1) * product.unitPrice }
          : line
      );
      handleInputChange('lines', updatedLines);
    } else {
      const newLine: OrderLine = {
        productId: product.id,
        name: product.name,
        qty: 1,
        unit: product.unit,
        unitPrice: product.unitPrice,
        total: product.unitPrice
      };
      handleInputChange('lines', [...formData.lines, newLine]);
    }
    
    setProductDialogOpen(false);
    setSearchQuery('');
  };

  const updateLineQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeLine(productId);
      return;
    }
    
    const updatedLines = formData.lines.map(line =>
      line.productId === productId
        ? { ...line, qty, total: qty * (line.unitPrice || 0) }
        : line
    );
    handleInputChange('lines', updatedLines);
  };

  const removeLine = (productId: string) => {
    handleInputChange('lines', formData.lines.filter(line => line.productId !== productId));
  };

  const calculateTotals = () => {
    const subtotal = formData.lines.reduce((sum, line) => sum + (line.total || 0), 0);
    const gst = subtotal * 0.18; // 18% GST for simplicity
    const total = subtotal + gst;
    
    return { subtotal, gst, total };
  };

  const handleSave = () => {
    if (!formData.customer.phone.trim()) {
      alert('Customer phone number is required');
      return;
    }

    if (formData.lines.length === 0) {
      alert('Please add at least one item');
      return;
    }

    const totals = calculateTotals();
    const orderToSave: Order = {
      ...formData,
      id: order?.id || `ORD-${Date.now()}`,
      subtotal: totals.subtotal,
      gst: totals.gst,
      total: totals.total,
      createdAt: order?.createdAt || Date.now()
    };

    onSave(orderToSave);
  };

  const totals = calculateTotals();

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>
          {order ? 'Edit Order' : 'New Order'}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<CloseIcon />}
            onClick={onClose}
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            Save Order
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Order Details */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Details
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Channel</InputLabel>
                <Select
                  value={formData.channel}
                  onChange={(e) => handleInputChange('channel', e.target.value)}
                >
                  <MenuItem value="counter">
                    <Box display="flex" alignItems="center">
                      <StoreIcon sx={{ mr: 1 }} />
                      Counter
                    </Box>
                  </MenuItem>
                  <MenuItem value="whatsapp">
                    <Box display="flex" alignItems="center">
                      <WhatsAppIcon sx={{ mr: 1 }} />
                      WhatsApp
                    </Box>
                  </MenuItem>
                  <MenuItem value="phone">
                    <Box display="flex" alignItems="center">
                      <PhoneIcon sx={{ mr: 1 }} />
                      Phone
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="preparing">Preparing</MenuItem>
                  <MenuItem value="out_for_delivery">Out for Delivery</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Details */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Customer Details
              </Typography>
              
              <TextField
                fullWidth
                label="Phone Number *"
                value={formData.customer.phone}
                onChange={(e) => handleCustomerChange('phone', e.target.value)}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Name"
                value={formData.customer.name}
                onChange={(e) => handleCustomerChange('name', e.target.value)}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Address"
                multiline
                rows={3}
                value={formData.customer.address}
                onChange={(e) => handleCustomerChange('address', e.target.value)}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Items:</Typography>
                <Typography>{formData.lines.length}</Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>Subtotal:</Typography>
                <Typography>₹{totals.subtotal.toFixed(2)}</Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography>GST (18%):</Typography>
                <Typography>₹{totals.gst.toFixed(2)}</Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6">₹{totals.total.toFixed(2)}</Typography>
              </Box>

              {formData.channel === 'whatsapp' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  WhatsApp orders will be automatically sent to customer
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Order Items */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Order Items ({formData.lines.length})
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setProductDialogOpen(true)}
                >
                  Add Item
                </Button>
              </Box>

              {formData.lines.length === 0 ? (
                <Box textAlign="center" py={4}>
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
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.lines.map((line) => (
                        <TableRow key={line.productId}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {line.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {line.unit}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <TextField
                              type="number"
                              value={line.qty}
                              onChange={(e) => updateLineQuantity(line.productId, parseInt(e.target.value) || 0)}
                              size="small"
                              sx={{ width: 80 }}
                              inputProps={{ min: 1 }}
                            />
                          </TableCell>
                          <TableCell align="right">₹{line.unitPrice}</TableCell>
                          <TableCell align="right">₹{line.total}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeLine(line.productId)}
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
                  <TableCell align="right">Price</TableCell>
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
                        <Typography variant="caption" color="text.secondary">
                          {product.unit}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">₹{product.unitPrice}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={product.stock}
                        color={product.stock === 0 ? 'error' : product.stock < 10 ? 'warning' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => addLine(product)}
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

export default OrderForm;
