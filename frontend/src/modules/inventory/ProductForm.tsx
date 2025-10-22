import React, { useState } from 'react';
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
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Product, Batch, Unit, AdjustmentReason } from '@bharatmesh/shared';

interface ProductFormProps {
  product?: Product;
  onSave: (product: Product) => void;
  onClose: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onClose }) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<Product>(product || {
    id: '',
    name: '',
    category: '',
    barcodes: [],
    hsn: '',
    gstRate: 0,
    unitPrice: 0,
    costPrice: 0,
    stock: 0,
    reorderLevel: 0,
    maxStock: 0,
    unit: 'piece',
    supplierId: '',
    image: '',
    batches: [],
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  const [newBarcode, setNewBarcode] = useState('');
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [newBatch, setNewBatch] = useState<Partial<Batch>>({
    qty: 0,
    costPrice: 0,
    supplierId: '',
    received: new Date().toISOString().split('T')[0]
  });

  const units: Unit[] = ['kg', 'g', 'l', 'ml', 'piece', 'box', 'packet'];
  const gstRates = [0, 5, 12, 18, 28];

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      updatedAt: Date.now()
    }));
  };

  const handleAddBarcode = () => {
    if (newBarcode.trim() && !formData.barcodes.includes(newBarcode.trim())) {
      handleInputChange('barcodes', [...formData.barcodes, newBarcode.trim()]);
      setNewBarcode('');
    }
  };

  const handleRemoveBarcode = (barcode: string) => {
    handleInputChange('barcodes', formData.barcodes.filter(b => b !== barcode));
  };

  const handleAddBatch = () => {
    if (newBatch.qty && newBatch.costPrice && newBatch.supplierId) {
      const batch: Batch = {
        id: `batch-${Date.now()}`,
        qty: newBatch.qty,
        expiry: newBatch.expiry,
        received: newBatch.received!,
        costPrice: newBatch.costPrice,
        supplierId: newBatch.supplierId
      };
      
      handleInputChange('batches', [...formData.batches, batch]);
      setNewBatch({
        qty: 0,
        costPrice: 0,
        supplierId: '',
        received: new Date().toISOString().split('T')[0]
      });
      setBatchDialogOpen(false);
    }
  };

  const handleRemoveBatch = (batchId: string) => {
    handleInputChange('batches', formData.batches.filter(b => b.id !== batchId));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Product name is required');
      return;
    }

    if (formData.unitPrice <= 0) {
      alert('Unit price must be greater than 0');
      return;
    }

    const productToSave: Product = {
      ...formData,
      id: product?.id || `prod-${Date.now()}`,
      createdAt: product?.createdAt || Date.now()
    };

    onSave(productToSave);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>
          {product ? 'Edit Product' : 'Add New Product'}
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
            Save Product
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              
              <TextField
                fullWidth
                label="Product Name *"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="HSN Code"
                value={formData.hsn}
                onChange={(e) => handleInputChange('hsn', e.target.value)}
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>GST Rate (%)</InputLabel>
                <Select
                  value={formData.gstRate}
                  onChange={(e) => handleInputChange('gstRate', e.target.value)}
                >
                  {gstRates.map(rate => (
                    <MenuItem key={rate} value={rate}>
                      {rate}%
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                >
                  {units.map(unit => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  />
                }
                label="Active"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Pricing & Stock */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pricing & Stock
              </Typography>
              
              <TextField
                fullWidth
                label="Selling Price *"
                type="number"
                value={formData.unitPrice}
                onChange={(e) => handleInputChange('unitPrice', parseFloat(e.target.value) || 0)}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Cost Price"
                type="number"
                value={formData.costPrice}
                onChange={(e) => handleInputChange('costPrice', parseFloat(e.target.value) || 0)}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Current Stock"
                type="number"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', parseFloat(e.target.value) || 0)}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Reorder Level"
                type="number"
                value={formData.reorderLevel}
                onChange={(e) => handleInputChange('reorderLevel', parseFloat(e.target.value) || 0)}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Max Stock (Optional)"
                type="number"
                value={formData.maxStock || ''}
                onChange={(e) => handleInputChange('maxStock', parseFloat(e.target.value) || 0)}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Supplier ID"
                value={formData.supplierId}
                onChange={(e) => handleInputChange('supplierId', e.target.value)}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Barcodes */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Barcodes
              </Typography>
              
              <Box display="flex" gap={2} mb={2}>
                <TextField
                  fullWidth
                  label="Add Barcode"
                  value={newBarcode}
                  onChange={(e) => setNewBarcode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddBarcode()}
                />
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddBarcode}
                  disabled={!newBarcode.trim()}
                >
                  Add
                </Button>
              </Box>

              <Box display="flex" flexWrap="wrap" gap={1}>
                {formData.barcodes.map((barcode) => (
                  <Chip
                    key={barcode}
                    label={barcode}
                    onDelete={() => handleRemoveBarcode(barcode)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Batches */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Batches ({formData.batches.length})
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setBatchDialogOpen(true)}
                >
                  Add Batch
                </Button>
              </Box>

              {formData.batches.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={2}>
                  No batches added yet
                </Typography>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Batch ID</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Cost Price</TableCell>
                        <TableCell>Received</TableCell>
                        <TableCell>Expiry</TableCell>
                        <TableCell>Supplier</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.batches.map((batch) => (
                        <TableRow key={batch.id}>
                          <TableCell>{batch.id}</TableCell>
                          <TableCell align="right">{batch.qty}</TableCell>
                          <TableCell align="right">₹{batch.costPrice}</TableCell>
                          <TableCell>{new Date(batch.received).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {batch.expiry ? new Date(batch.expiry).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>{batch.supplierId}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveBatch(batch.id)}
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

      {/* Add Batch Dialog */}
      <Dialog
        open={batchDialogOpen}
        onClose={() => setBatchDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Batch</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={newBatch.qty}
                onChange={(e) => setNewBatch({ ...newBatch, qty: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Cost Price"
                type="number"
                value={newBatch.costPrice}
                onChange={(e) => setNewBatch({ ...newBatch, costPrice: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Received Date"
                type="date"
                value={newBatch.received}
                onChange={(e) => setNewBatch({ ...newBatch, received: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                type="date"
                value={newBatch.expiry || ''}
                onChange={(e) => setNewBatch({ ...newBatch, expiry: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Supplier ID"
                value={newBatch.supplierId}
                onChange={(e) => setNewBatch({ ...newBatch, supplierId: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBatchDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddBatch}>
            Add Batch
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductForm;
