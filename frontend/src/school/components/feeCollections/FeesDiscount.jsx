import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Chip,
  InputAdornment,
  Tooltip,
  Alert,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Percent as PercentIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import {
  createFeeDiscount,
  getFeeDiscounts,
  updateFeeDiscount,
  deleteFeeDiscount,
  setFilters,
  resetFilters,
  clearError
} from '../../../state/feeDiscountSlice';
import CustomizedSnackbars from '../../../basic utility components/CustomizedSnackbars';
import NoData from '../../../basic utility components/NoData';

const FeesDiscount = () => {
  const dispatch = useDispatch();
  const { discounts, loading, error, pagination, filters } = useSelector(state => state.feeDiscount);

  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentDiscountId, setCurrentDiscountId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({ open: false, id: null });

  const [formData, setFormData] = useState({
    name: '',
    discountCode: '',
    discountType: 'percentage',
    percentage: '',
    amount: '',
    description: '',
    validFrom: '',
    validTo: '',
    isActive: true
  });

  const [formErrors, setFormErrors] = useState({});
  const [localFilters, setLocalFilters] = useState({
    search: '',
    discountType: '',
    isActive: ''
  });

  useEffect(() => {
    loadDiscounts();
  }, [filters]);

  useEffect(() => {
    if (error) {
      setSnackbar({ open: true, message: error, severity: 'error' });
      dispatch(clearError());
    }
  }, [error]);

  const loadDiscounts = () => {
    dispatch(getFeeDiscounts({
      page: pagination.currentPage,
      limit: pagination.limit,
      ...filters
    }));
  };

  const handleOpenDialog = (discount = null) => {
    if (discount) {
      setEditMode(true);
      setCurrentDiscountId(discount._id);
      setFormData({
        name: discount.name,
        discountCode: discount.discountCode,
        discountType: discount.discountType,
        percentage: discount.percentage || '',
        amount: discount.amount || '',
        description: discount.description || '',
        validFrom: discount.validFrom ? new Date(discount.validFrom).toISOString().split('T')[0] : '',
        validTo: discount.validTo ? new Date(discount.validTo).toISOString().split('T')[0] : '',
        isActive: discount.isActive
      });
    } else {
      setEditMode(false);
      setCurrentDiscountId(null);
      setFormData({
        name: '',
        discountCode: '',
        discountType: 'percentage',
        percentage: '',
        amount: '',
        description: '',
        validFrom: '',
        validTo: '',
        isActive: true
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      name: '',
      discountCode: '',
      discountType: 'percentage',
      percentage: '',
      amount: '',
      description: '',
      validFrom: '',
      validTo: '',
      isActive: true
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.discountCode.trim()) {
      errors.discountCode = 'Discount code is required';
    }

    if (formData.discountType === 'percentage') {
      if (!formData.percentage || formData.percentage <= 0 || formData.percentage > 100) {
        errors.percentage = 'Valid percentage (1-100) is required';
      }
    } else if (formData.discountType === 'fixAmount') {
      if (!formData.amount || formData.amount <= 0) {
        errors.amount = 'Valid amount is required';
      }
    }

    if (formData.validFrom && formData.validTo && new Date(formData.validFrom) > new Date(formData.validTo)) {
      errors.validTo = 'Valid To date must be after Valid From date';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const discountData = {
      name: formData.name,
      discountCode: formData.discountCode.toUpperCase(),
      discountType: formData.discountType,
      percentage: formData.discountType === 'percentage' ? parseFloat(formData.percentage) : undefined,
      amount: formData.discountType === 'fixAmount' ? parseFloat(formData.amount) : undefined,
      description: formData.description,
      validFrom: formData.validFrom || undefined,
      validTo: formData.validTo || undefined,
      isActive: formData.isActive
    };

    try {
      if (editMode) {
        await dispatch(updateFeeDiscount({ id: currentDiscountId, discountData })).unwrap();
        setSnackbar({ open: true, message: 'Discount updated successfully', severity: 'success' });
      } else {
        await dispatch(createFeeDiscount(discountData)).unwrap();
        setSnackbar({ open: true, message: 'Discount created successfully', severity: 'success' });
      }
      handleCloseDialog();
      loadDiscounts();
    } catch (err) {
      setSnackbar({ open: true, message: err || 'Operation failed', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteFeeDiscount(deleteConfirmDialog.id)).unwrap();
      setSnackbar({ open: true, message: 'Discount deleted successfully', severity: 'success' });
      setDeleteConfirmDialog({ open: false, id: null });
      loadDiscounts();
    } catch (err) {
      setSnackbar({ open: true, message: err || 'Delete failed', severity: 'error' });
    }
  };

  const handleSearch = () => {
    dispatch(setFilters({ ...localFilters, page: 1 }));
  };

  const handleResetFilters = () => {
    setLocalFilters({ search: '', discountType: '', isActive: '' });
    dispatch(resetFilters());
  };

  const handlePageChange = (event, newPage) => {
    dispatch(getFeeDiscounts({
      page: newPage + 1,
      limit: pagination.limit,
      ...filters
    }));
  };

  const handleRowsPerPageChange = (event) => {
    dispatch(getFeeDiscounts({
      page: 1,
      limit: parseInt(event.target.value, 10),
      ...filters
    }));
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Fees Discount Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ textTransform: 'none' }}
        >
          Add Fees Discount
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Search"
                placeholder="Name, Code, Description"
                value={localFilters.search}
                onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Discount Type</InputLabel>
                <Select
                  value={localFilters.discountType}
                  label="Discount Type"
                  onChange={(e) => setLocalFilters({ ...localFilters, discountType: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="percentage">Percentage</MenuItem>
                  <MenuItem value="fixAmount">Fix Amount</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={localFilters.isActive}
                  label="Status"
                  onChange={(e) => setLocalFilters({ ...localFilters, isActive: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={5}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleSearch}
                  sx={{ textTransform: 'none' }}
                >
                  Search
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleResetFilters}
                  sx={{ textTransform: 'none' }}
                >
                  Reset
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
      <Paper elevation={2}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        ) : discounts.length === 0 ? (
          <NoData message="No discounts found. Add a new discount to get started." />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Discount Code</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Percentage (%)</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Amount (₹)</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Valid From</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Valid To</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {discounts.map((discount) => (
                    <TableRow key={discount._id} hover>
                      <TableCell>{discount.name}</TableCell>
                      <TableCell>
                        <Chip label={discount.discountCode} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={discount.discountType === 'percentage' ? <PercentIcon /> : <MoneyIcon />}
                          label={discount.discountType === 'percentage' ? 'Percentage' : 'Fix Amount'}
                          size="small"
                          color={discount.discountType === 'percentage' ? 'info' : 'success'}
                        />
                      </TableCell>
                      <TableCell>{discount.percentage ? `${discount.percentage}%` : '-'}</TableCell>
                      <TableCell>{discount.amount ? `₹${discount.amount}` : '-'}</TableCell>
                      <TableCell>{formatDate(discount.validFrom)}</TableCell>
                      <TableCell>{formatDate(discount.validTo)}</TableCell>
                      <TableCell>
                        <Chip
                          label={discount.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          color={discount.isActive ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(discount)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteConfirmDialog({ open: true, id: discount._id })}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={pagination.totalRecords}
              page={pagination.currentPage - 1}
              onPageChange={handlePageChange}
              rowsPerPage={pagination.limit}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{editMode ? 'Edit' : 'Add'} Fees Discount</Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Discount Code"
                value={formData.discountCode}
                onChange={(e) => setFormData({ ...formData, discountCode: e.target.value.toUpperCase() })}
                error={!!formErrors.discountCode}
                helperText={formErrors.discountCode}
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Discount Type *</FormLabel>
                <RadioGroup
                  row
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value, percentage: '', amount: '' })}
                >
                  <FormControlLabel value="percentage" control={<Radio />} label="Percentage" />
                  <FormControlLabel value="fixAmount" control={<Radio />} label="Fix Amount" />
                </RadioGroup>
              </FormControl>
            </Grid>
            {formData.discountType === 'percentage' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Percentage (%)"
                  value={formData.percentage}
                  onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                  error={!!formErrors.percentage}
                  helperText={formErrors.percentage}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>
                  }}
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                />
              </Grid>
            )}
            {formData.discountType === 'fixAmount' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Amount (₹)"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  error={!!formErrors.amount}
                  helperText={formErrors.amount}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>
                  }}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                * Amount discount will not be applicable on Multipayment Fees Collection
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Valid From"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Valid To"
                value={formData.validTo}
                onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                error={!!formErrors.validTo}
                helperText={formErrors.validTo}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Status</FormLabel>
                <RadioGroup
                  row
                  value={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                >
                  <FormControlLabel value={true} control={<Radio />} label="Active" />
                  <FormControlLabel value={false} control={<Radio />} label="Inactive" />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            {loading ? <CircularProgress size={24} /> : editMode ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmDialog.open} onClose={() => setDeleteConfirmDialog({ open: false, id: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this discount? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmDialog({ open: false, id: null })} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <CustomizedSnackbars
        type={snackbar.severity}
        message={snackbar.message}
        reset={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default FeesDiscount;
