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
  DialogContent,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Badge,
  Alert
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  ShoppingCart,
  WhatsApp,
  Phone,
  Store,
  MoreVert,
  Visibility,
  CheckCircle,
  AccessTime,
  LocalShipping,
  Cancel,
  Message
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Order, OrderStatus, OrderChannel } from '@bharatmesh/shared';
import OrderForm from './OrderForm';

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
      id={`orders-tabpanel-${index}`}
      aria-labelledby={`orders-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Orders = () => {
  const { t } = useTranslation();
  
  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [channelFilter, setChannelFilter] = useState<OrderChannel | 'all'>('all');
  const [tabValue, setTabValue] = useState(0);
  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // Load orders on mount
  useEffect(() => {
    // Mock data - in real app, load from API
    const mockOrders: Order[] = [
      {
        id: 'ORD-001',
        ts: Date.now() - 3600000,
        channel: 'whatsapp',
        customer: {
          phone: '9876543210',
          name: 'Rajesh Kumar',
          address: '123 Main St, City'
        },
        lines: [
          { productId: 'prod-1', name: 'Rice (1kg)', qty: 2, unitPrice: 50, total: 100 },
          { productId: 'prod-2', name: 'Dal (500g)', qty: 1, unitPrice: 80, total: 80 }
        ],
        subtotal: 180,
        gst: 32.4,
        total: 212.4,
        status: 'confirmed',
        notes: 'Please deliver by 6 PM',
        sync: 'synced',
        createdAt: Date.now() - 3600000,
        updatedAt: Date.now() - 1800000
      },
      {
        id: 'ORD-002',
        ts: Date.now() - 7200000,
        channel: 'counter',
        customer: {
          phone: '9876543211',
          name: 'Walk-in Customer'
        },
        lines: [
          { productId: 'prod-3', name: 'Oil (1L)', qty: 1, unitPrice: 120, total: 120 }
        ],
        subtotal: 120,
        gst: 21.6,
        total: 141.6,
        status: 'preparing',
        sync: 'pending',
        createdAt: Date.now() - 7200000,
        updatedAt: Date.now() - 3600000
      },
      {
        id: 'ORD-003',
        ts: Date.now() - 10800000,
        channel: 'phone',
        customer: {
          phone: '9876543212',
          name: 'Priya Sharma',
          address: '456 Oak Ave, City'
        },
        lines: [
          { productId: 'prod-4', name: 'Soap', qty: 5, unitPrice: 25, total: 125 }
        ],
        subtotal: 125,
        gst: 22.5,
        total: 147.5,
        status: 'delivered',
        sync: 'synced',
        createdAt: Date.now() - 10800000,
        updatedAt: Date.now() - 5400000
      }
    ];
    setOrders(mockOrders);
    setFilteredOrders(mockOrders);
  }, []);

  // Filter orders
  useEffect(() => {
    let filtered = orders;

    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.phone.includes(searchQuery)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (channelFilter !== 'all') {
      filtered = filtered.filter(order => order.channel === channelFilter);
    }

    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, channelFilter, orders]);

  const handleSaveOrder = (order: Order) => {
    if (selectedOrder) {
      // Update existing order
      setOrders(orders.map(o => o.id === order.id ? order : o));
    } else {
      // Add new order
      setOrders([order, ...orders]);
    }
    setOrderFormOpen(false);
    setSelectedOrder(null);
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setOrderFormOpen(true);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      setOrders(orders.filter(o => o.id !== orderId));
    }
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders(orders.map(order =>
      order.id === orderId
        ? { ...order, status: newStatus, updatedAt: Date.now() }
        : order
    ));
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'draft': return <Edit />;
      case 'confirmed': return <CheckCircle />;
      case 'preparing': return <AccessTime />;
      case 'out_for_delivery': return <LocalShipping />;
      case 'delivered': return <CheckCircle />;
      case 'cancelled': return <Cancel />;
      default: return <Edit />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'draft': return 'default';
      case 'confirmed': return 'success';
      case 'preparing': return 'warning';
      case 'out_for_delivery': return 'info';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getChannelIcon = (channel: OrderChannel) => {
    switch (channel) {
      case 'whatsapp': return <WhatsApp />;
      case 'phone': return <Phone />;
      case 'counter': return <Store />;
      case 'web': return <ShoppingCart />;
      default: return <ShoppingCart />;
    }
  };

  // Calculate stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => ['draft', 'confirmed', 'preparing'].includes(o.status)).length;
  const todayOrders = orders.filter(o => new Date(o.ts).toDateString() === new Date().toDateString()).length;
  const totalValue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={600}>
          {t('orders.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          size="large"
          onClick={() => setOrderFormOpen(true)}
        >
          New Order
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ShoppingCart color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{totalOrders}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Orders
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
                <AccessTime color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{pendingOrders}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending
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
                  <Typography variant="h6">{todayOrders}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Today
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
                <Message color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">₹{totalValue.toFixed(0)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Value
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* WhatsApp Integration Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          WhatsApp Integration
        </Typography>
        <Typography variant="body2">
          WhatsApp orders are automatically parsed and created. Customers receive status updates via WhatsApp messages.
        </Typography>
      </Alert>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="All Orders" />
            <Tab 
              label={
                <Badge badgeContent={pendingOrders} color="warning">
                  Pending
                </Badge>
              } 
            />
            <Tab label="WhatsApp" />
            <Tab label="Counter" />
          </Tabs>
        </Box>

        {/* Search and Filters */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search orders..."
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
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="preparing">Preparing</MenuItem>
                <MenuItem value="out_for_delivery">Out for Delivery</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Channel"
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value as OrderChannel | 'all')}
              >
                <MenuItem value="all">All Channels</MenuItem>
                <MenuItem value="whatsapp">WhatsApp</MenuItem>
                <MenuItem value="counter">Counter</MenuItem>
                <MenuItem value="phone">Phone</MenuItem>
                <MenuItem value="web">Web</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setChannelFilter('all');
                }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <OrderTable
            orders={filteredOrders}
            onEdit={handleEditOrder}
            onView={handleViewOrder}
            onDelete={handleDeleteOrder}
            onStatusChange={handleStatusChange}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <OrderTable
            orders={filteredOrders.filter(o => ['draft', 'confirmed', 'preparing'].includes(o.status))}
            onEdit={handleEditOrder}
            onView={handleViewOrder}
            onDelete={handleDeleteOrder}
            onStatusChange={handleStatusChange}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <OrderTable
            orders={filteredOrders.filter(o => o.channel === 'whatsapp')}
            onEdit={handleEditOrder}
            onView={handleViewOrder}
            onDelete={handleDeleteOrder}
            onStatusChange={handleStatusChange}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <OrderTable
            orders={filteredOrders.filter(o => o.channel === 'counter')}
            onEdit={handleEditOrder}
            onView={handleViewOrder}
            onDelete={handleDeleteOrder}
            onStatusChange={handleStatusChange}
          />
        </TabPanel>
      </Card>

      {/* Order Form Dialog */}
      <Dialog
        open={orderFormOpen}
        onClose={() => {
          setOrderFormOpen(false);
          setSelectedOrder(null);
        }}
        maxWidth="xl"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          <OrderForm
            order={selectedOrder || undefined}
            onSave={handleSaveOrder}
            onClose={() => {
              setOrderFormOpen(false);
              setSelectedOrder(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* View Order Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Order Details - {selectedOrder.id}
              </Typography>
              
              {/* Customer Info */}
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom>Customer Details</Typography>
                <Typography><strong>Name:</strong> {selectedOrder.customer.name || 'N/A'}</Typography>
                <Typography><strong>Phone:</strong> {selectedOrder.customer.phone}</Typography>
                {selectedOrder.customer.address && (
                  <Typography><strong>Address:</strong> {selectedOrder.customer.address}</Typography>
                )}
              </Box>

              {/* Order Items */}
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom>Items</Typography>
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
                      {selectedOrder.lines.map((line, index) => (
                        <TableRow key={index}>
                          <TableCell>{line.name}</TableCell>
                          <TableCell align="center">{line.qty}</TableCell>
                          <TableCell align="right">₹{line.unitPrice}</TableCell>
                          <TableCell align="right">₹{line.total}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Summary */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>Summary</Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Subtotal:</Typography>
                  <Typography>₹{selectedOrder.subtotal?.toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>GST:</Typography>
                  <Typography>₹{selectedOrder.gst?.toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6">₹{selectedOrder.total?.toFixed(2)}</Typography>
                </Box>
                <Typography><strong>Status:</strong> {selectedOrder.status}</Typography>
                <Typography><strong>Channel:</strong> {selectedOrder.channel}</Typography>
                {selectedOrder.notes && (
                  <Typography><strong>Notes:</strong> {selectedOrder.notes}</Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

// Order Table Component
const OrderTable: React.FC<{
  orders: Order[];
  onEdit: (order: Order) => void;
  onView: (order: Order) => void;
  onDelete: (orderId: string) => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
}> = ({ orders, onEdit, onView, onDelete, onStatusChange }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, order: Order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'draft': return <Edit />;
      case 'confirmed': return <CheckCircle />;
      case 'preparing': return <AccessTime />;
      case 'out_for_delivery': return <LocalShipping />;
      case 'delivered': return <CheckCircle />;
      case 'cancelled': return <Cancel />;
      default: return <Edit />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'draft': return 'default';
      case 'confirmed': return 'success';
      case 'preparing': return 'warning';
      case 'out_for_delivery': return 'info';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getChannelIcon = (channel: OrderChannel) => {
    switch (channel) {
      case 'whatsapp': return <WhatsApp />;
      case 'phone': return <Phone />;
      case 'counter': return <Store />;
      case 'web': return <ShoppingCart />;
      default: return <ShoppingCart />;
    }
  };

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Order ID</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Channel</TableCell>
            <TableCell align="right">Total</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                <ShoppingCart sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No orders found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {order.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {order.customer.name || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.customer.phone}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    {getChannelIcon(order.channel)}
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {order.channel}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={500}>
                    ₹{order.total?.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(order.status)}
                    label={order.status.replace('_', ' ')}
                    color={getStatusColor(order.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(order.ts).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(order.ts).toLocaleTimeString()}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, order)}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          onView(selectedOrder!);
          handleMenuClose();
        }}>
          <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          onEdit(selectedOrder!);
          handleMenuClose();
        }}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        {selectedOrder?.status === 'confirmed' && (
          <MenuItem onClick={() => {
            onStatusChange(selectedOrder.id, 'preparing');
            handleMenuClose();
          }}>
            <ListItemIcon><AccessTime fontSize="small" /></ListItemIcon>
            <ListItemText>Mark Preparing</ListItemText>
          </MenuItem>
        )}
        {selectedOrder?.status === 'preparing' && (
          <MenuItem onClick={() => {
            onStatusChange(selectedOrder.id, 'out_for_delivery');
            handleMenuClose();
          }}>
            <ListItemIcon><LocalShipping fontSize="small" /></ListItemIcon>
            <ListItemText>Out for Delivery</ListItemText>
          </MenuItem>
        )}
        {selectedOrder?.status === 'out_for_delivery' && (
          <MenuItem onClick={() => {
            onStatusChange(selectedOrder.id, 'delivered');
            handleMenuClose();
          }}>
            <ListItemIcon><CheckCircle fontSize="small" /></ListItemIcon>
            <ListItemText>Mark Delivered</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => {
          onDelete(selectedOrder!.id);
          handleMenuClose();
        }}>
          <ListItemIcon><Delete fontSize="small" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </TableContainer>
  );
};

export default Orders;

