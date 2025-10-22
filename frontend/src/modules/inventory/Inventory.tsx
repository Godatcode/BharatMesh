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
  Alert,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Inventory as InventoryIcon,
  Warning,
  TrendingDown,
  Assessment,
  FilterList,
  MoreVert,
  AddBox,
  Remove
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Product, InventoryStats, StockAdjustment } from '@bharatmesh/shared';
import ProductForm from './ProductForm';
import { inventoryApi } from '@services/api';
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
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Inventory = () => {
  const { t } = useTranslation();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [tabValue, setTabValue] = useState(0);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    totalValue: 0,
    lowStockCount: 0,
    expiryAlerts: [],
    slowMovers: []
  });

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading products from API...');
      
      // Try to load from API first
      const response = await inventoryApi.getProducts();
      
      if (response.success) {
        console.log('✅ Products loaded from API:', response.data.length);
        setProducts(response.data);
        setFilteredProducts(response.data);
        
        // Save to local storage for offline access
        await saveProductsToLocal(response.data);
      } else {
        throw new Error(response.error?.message || 'Failed to load products');
      }
    } catch (err) {
      console.log('⚠️ API failed, loading from local storage:', err);
      setError('Using offline data - ' + (err as Error).message);
      
      // Fallback to local storage
      await loadProductsFromLocal();
    } finally {
      setLoading(false);
    }
  };

  const loadProductsFromLocal = async () => {
    try {
      const localProducts = await db.products.toArray();
      console.log('📱 Products loaded from local storage:', localProducts.length);
      setProducts(localProducts);
      setFilteredProducts(localProducts);
    } catch (err) {
      console.log('❌ Local storage failed, using mock data');
      // Final fallback to mock data
      loadMockProducts();
    }
  };

  const saveProductsToLocal = async (products: Product[]) => {
    try {
      await db.products.clear();
      await db.products.bulkAdd(products);
      console.log('💾 Products saved to local storage');
    } catch (err) {
      console.log('⚠️ Failed to save to local storage:', err);
    }
  };

  const loadMockProducts = () => {
    // Fallback mock data
    const mockProducts: Product[] = [
      {
        id: 'prod-1',
        name: 'Rice (1kg)',
        category: 'Grocery',
        barcodes: ['8901234567890'],
        hsn: '1006',
        gstRate: 5,
        unitPrice: 50,
        costPrice: 40,
        stock: 25,
        reorderLevel: 10,
        maxStock: 100,
        unit: 'kg',
        supplierId: 'supp-1',
        batches: [],
        isActive: true,
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 3600000
      }
    ];
    setProducts(mockProducts);
    setFilteredProducts(mockProducts);
  };

  // Calculate stats
  useEffect(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);
    const lowStockCount = products.filter(p => p.stock <= p.reorderLevel).length;
    const expiryAlerts = products.flatMap(p => 
      p.batches
        .filter(b => b.expiry && new Date(b.expiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
        .map(b => ({
          productId: p.id,
          name: p.name,
          expiry: b.expiry!,
          qty: b.qty
        }))
    );
    const slowMovers = products
      .filter(p => p.updatedAt < Date.now() - 7 * 24 * 60 * 60 * 1000)
      .map(p => ({
        productId: p.id,
        name: p.name,
        lastSoldDays: Math.floor((Date.now() - p.updatedAt) / (24 * 60 * 60 * 1000))
      }));

    setStats({
      totalProducts,
      totalValue,
      lowStockCount,
      expiryAlerts,
      slowMovers
    });
  }, [products]);

  // Filter products
  useEffect(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcodes.some(b => b.includes(searchQuery))
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    if (stockFilter === 'low') {
      filtered = filtered.filter(p => p.stock <= p.reorderLevel && p.stock > 0);
    } else if (stockFilter === 'out') {
      filtered = filtered.filter(p => p.stock === 0);
    }

    setFilteredProducts(filtered);
  }, [searchQuery, categoryFilter, stockFilter, products]);

  const handleSaveProduct = async (product: Product) => {
    try {
      console.log('💾 Saving product:', product.name);
      
      let response: any;
      if (selectedProduct) {
        // Update existing product
        response = await inventoryApi.updateProduct(product.id, product);
        if (response.success) {
          setProducts(products.map(p => p.id === product.id ? response.data : p));
        }
      } else {
        // Create new product
        response = await inventoryApi.createProduct(product);
        if (response.success) {
          setProducts([response.data, ...products]);
        }
      }
      
      if (response.success) {
        // Save to local storage for offline access
        await db.products.put(response.data);
        console.log('✅ Product saved successfully');
      } else {
        throw new Error(response.error?.message || 'Failed to save product');
      }
    } catch (err) {
      console.log('⚠️ API failed, saving to offline queue:', err);
      
      // Save to offline queue for sync later
      await db.syncQueue.add({
        id: `sync-${Date.now()}`,
        collection: 'products',
        operation: selectedProduct ? 'update' : 'create',
        documentId: product.id,
        data: product,
        priority: 'medium',
        deviceId: 'device-001',
        userId: 'user-001',
        ts: Date.now(),
        vectorClock: { 'device-001': Date.now() },
        checksum: 'temp',
        retries: 0,
        status: 'queued'
      });
      
      // Update UI immediately for better UX
      if (selectedProduct) {
        setProducts(products.map(p => p.id === product.id ? product : p));
      } else {
        setProducts([product, ...products]);
      }
      
      setError('Product saved offline - will sync when online');
    }
    
    setProductFormOpen(false);
    setSelectedProduct(null);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductFormOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  const handleStockAdjustment = (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const newStock = Math.max(0, product.stock + delta);
      const updatedProduct = {
        ...product,
        stock: newStock,
        updatedAt: Date.now()
      };
      setProducts(products.map(p => p.id === productId ? updatedProduct : p));
    }
  };

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={600}>
          {t('inventory.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          size="large"
          onClick={() => setProductFormOpen(true)}
        >
          {t('inventory.addProduct')}
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <InventoryIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{stats.totalProducts}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Products
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
                <Assessment color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">₹{stats.totalValue.toFixed(0)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Value
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
                <Warning color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{stats.lowStockCount}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Low Stock
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
                <TrendingDown color="error" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{stats.slowMovers.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Slow Movers
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Loading and Error States */}
      {loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            🔄 Loading products from server...
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

      {/* Alerts */}
      {stats.expiryAlerts.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Expiry Alerts ({stats.expiryAlerts.length})
          </Typography>
          {stats.expiryAlerts.slice(0, 3).map((alert, index) => (
            <Typography key={index} variant="body2">
              {alert.name} - Expires: {new Date(alert.expiry).toLocaleDateString()} (Qty: {alert.qty})
            </Typography>
          ))}
          {stats.expiryAlerts.length > 3 && (
            <Typography variant="body2">
              ... and {stats.expiryAlerts.length - 3} more
            </Typography>
          )}
        </Alert>
      )}

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="All Products" />
            <Tab 
              label={
                <Badge badgeContent={stats.lowStockCount} color="warning">
                  Low Stock
                </Badge>
              } 
            />
            <Tab label="Categories" />
            <Tab label="Adjustments" />
          </Tabs>
        </Box>

        {/* Search and Filters */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search products..."
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
                label="Category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Stock Status"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="low">Low Stock</MenuItem>
                <MenuItem value="out">Out of Stock</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('');
                  setStockFilter('all');
                }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <ProductTable
            products={filteredProducts}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onAdjustStock={handleStockAdjustment}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ProductTable
            products={filteredProducts.filter(p => p.stock <= p.reorderLevel)}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onAdjustStock={handleStockAdjustment}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <CategoryView products={products} />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <AdjustmentHistory />
        </TabPanel>
      </Card>

      {/* Product Form Dialog */}
      <Dialog
        open={productFormOpen}
        onClose={() => {
          setProductFormOpen(false);
          setSelectedProduct(null);
        }}
        maxWidth="xl"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          <ProductForm
            product={selectedProduct || undefined}
            onSave={handleSaveProduct}
            onClose={() => {
              setProductFormOpen(false);
              setSelectedProduct(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

// Product Table Component
const ProductTable: React.FC<{
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onAdjustStock: (productId: string, delta: number) => void;
}> = ({ products, onEdit, onDelete, onAdjustStock }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, product: Product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProduct(null);
  };

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return { label: 'Out of Stock', color: 'error' as const };
    if (product.stock <= product.reorderLevel) return { label: 'Low Stock', color: 'warning' as const };
    return { label: 'In Stock', color: 'success' as const };
  };

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Product</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align="right">Stock</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell align="right">Value</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                <InventoryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No products found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => {
              const stockStatus = getStockStatus(product);
              return (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {product.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {product.barcodes[0] || 'No barcode'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={product.category || 'Uncategorized'} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={500}>
                      {product.stock} {product.unit}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Reorder: {product.reorderLevel}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      ₹{product.unitPrice}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Cost: ₹{product.costPrice}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={500}>
                      ₹{(product.stock * product.costPrice).toFixed(0)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={stockStatus.label}
                      color={stockStatus.color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, product)}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })
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
          onEdit(selectedProduct!);
          handleMenuClose();
        }}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          onAdjustStock(selectedProduct!.id, 10);
          handleMenuClose();
        }}>
          <ListItemIcon><AddBox fontSize="small" /></ListItemIcon>
          <ListItemText>Add Stock</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          onAdjustStock(selectedProduct!.id, -1);
          handleMenuClose();
        }}>
          <ListItemIcon><Remove fontSize="small" /></ListItemIcon>
          <ListItemText>Reduce Stock</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          onDelete(selectedProduct!.id);
          handleMenuClose();
        }}>
          <ListItemIcon><Delete fontSize="small" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </TableContainer>
  );
};

// Category View Component
const CategoryView: React.FC<{ products: Product[] }> = ({ products }) => {
  const categories = products.reduce((acc, product) => {
    const category = product.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <Grid container spacing={2}>
      {Object.entries(categories).map(([category, categoryProducts]) => (
        <Grid item xs={12} md={6} lg={4} key={category}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {category} ({categoryProducts.length})
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Value: ₹{categoryProducts.reduce((sum, p) => sum + (p.stock * p.costPrice), 0).toFixed(0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Low Stock: {categoryProducts.filter(p => p.stock <= p.reorderLevel).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

// Adjustment History Component
const AdjustmentHistory: React.FC = () => {
  // Mock adjustment history
  const adjustments: StockAdjustment[] = [
    {
      id: 'adj-1',
      productId: 'prod-1',
      delta: 10,
      reason: 'received',
      ts: Date.now() - 3600000,
      deviceId: 'device-1',
      userId: 'user-1',
      notes: 'New stock received'
    },
    {
      id: 'adj-2',
      productId: 'prod-2',
      delta: -2,
      reason: 'sold',
      ts: Date.now() - 7200000,
      deviceId: 'device-1',
      userId: 'user-1',
      invoiceId: 'INV-001'
    }
  ];

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Product</TableCell>
            <TableCell>Adjustment</TableCell>
            <TableCell>Reason</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Notes</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {adjustments.map((adj) => (
            <TableRow key={adj.id}>
              <TableCell>Product {adj.productId}</TableCell>
              <TableCell>
                <Chip
                  label={`${adj.delta > 0 ? '+' : ''}${adj.delta}`}
                  color={adj.delta > 0 ? 'success' : 'error'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip label={adj.reason} size="small" />
              </TableCell>
              <TableCell>
                {new Date(adj.ts).toLocaleString()}
              </TableCell>
              <TableCell>{adj.notes || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Inventory;

