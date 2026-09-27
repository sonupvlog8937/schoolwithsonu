import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  InputAdornment,
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import CategoryIcon from '@mui/icons-material/Category';
import { alpha, styled, keyframes } from '@mui/material/styles';
import {
  getAllFeeTypesPaginated,
  createFeeType,
  updateFeeType,
  deleteFeeType,
  clearFeeMessages,
} from '../../../state/feeCollectionSlice';
import CustomizedSnackbars from '../../../basic utility components/CustomizedSnackbars';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const BRAND = {
  primary: '#7C3AED',
  primaryLight: '#A78BFA',
  primaryDark: '#6D28D9',
  white: '#FFFFFF',
  purple50: '#FAF5FF',
  purple100: '#F3E8FF',
  gray: '#6B7280',
  grayDark: '#4B5563',
  grayLight: '#F3F4F6',
};

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ─── Styled Components ────────────────────────────────────────────────────────
const PageContainer = styled(Box)({
  padding: 'clamp(16px, 3vw, 32px)',
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${BRAND.purple50} 0%, ${BRAND.white} 50%, ${BRAND.purple50} 100%)`,
});

const GlassCard = styled(Paper)({
  background: 'rgba(255,255,255,0.95)',
  backdropFilter: 'blur(12px)',
  border: `1px solid ${alpha(BRAND.primary, 0.15)}`,
  borderRadius: 16,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeIn} 0.4s ease`,
});

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    background: BRAND.white,
    '& fieldset': {
      borderColor: alpha(BRAND.primary, 0.2),
    },
    '&:hover fieldset': {
      borderColor: alpha(BRAND.primary, 0.4),
    },
    '&.Mui-focused fieldset': {
      borderColor: BRAND.primary,
      borderWidth: 2,
    },
  },
});

const FeesType = () => {
  const dispatch = useDispatch();

  const {
    feeTypesPaginated,
    feeTypesPagination,
    feeTypesLoading,
    submitLoading,
    error,
    successMsg,
  } = useSelector((state) => state.feeCollection);

  const [filters, setFilters] = useState({
    search: '',
    page: 1,
    limit: 10,
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentFeeType, setCurrentFeeType] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    feeCode: '',
    description: '',
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load fee types when filters change
  useEffect(() => {
    dispatch(getAllFeeTypesPaginated(filters));
  }, [dispatch, filters]);

  // Handle success/error messages
  useEffect(() => {
    if (successMsg) {
      setSnackbar({ open: true, message: successMsg, severity: 'success' });
      dispatch(clearFeeMessages());
      handleCloseDialog();
      dispatch(getAllFeeTypesPaginated(filters));
    }
    if (error) {
      setSnackbar({ open: true, message: error, severity: 'error' });
      dispatch(clearFeeMessages());
    }
  }, [successMsg, error, dispatch, filters]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      ...(field !== 'page' && field !== 'limit' ? { page: 1 } : {}),
    }));
  };

  const handlePageChange = (event, newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage + 1 }));
  };

  const handleRowsPerPageChange = (event) => {
    setFilters((prev) => ({
      ...prev,
      limit: parseInt(event.target.value, 10),
      page: 1,
    }));
  };

  const handleOpenDialog = (feeType = null) => {
    if (feeType) {
      setEditMode(true);
      setCurrentFeeType(feeType);
      setFormData({
        name: feeType.name || '',
        feeCode: feeType.feeCode || '',
        description: feeType.description || '',
      });
    } else {
      setEditMode(false);
      setCurrentFeeType(null);
      setFormData({
        name: '',
        feeCode: '',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentFeeType(null);
    setFormData({
      name: '',
      feeCode: '',
      description: '',
    });
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.name.trim()) {
      setSnackbar({ open: true, message: 'Please enter fee type name', severity: 'error' });
      return;
    }

    if (!formData.feeCode || !formData.feeCode.trim()) {
      setSnackbar({ open: true, message: 'Please enter fee code', severity: 'error' });
      return;
    }

    const payload = {
      name: formData.name.trim(),
      feeCode: formData.feeCode.trim(),
      description: formData.description.trim(),
    };

    if (editMode && currentFeeType) {
      dispatch(updateFeeType({ feeTypeId: currentFeeType._id, ...payload }));
    } else {
      dispatch(createFeeType(payload));
    }
  };

  const handleDelete = (feeTypeId) => {
    if (window.confirm('Are you sure you want to delete this fee type?')) {
      dispatch(deleteFeeType(feeTypeId));
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <PageContainer>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
              boxShadow: `0 4px 16px ${alpha(BRAND.primary, 0.3)}`,
            }}
          >
            <CategoryIcon sx={{ fontSize: 22, color: BRAND.white }} />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: BRAND.primary,
                letterSpacing: '-0.5px',
                fontSize: '1.25rem',
              }}
            >
              Fees Type
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              Manage fee type categories and codes
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${BRAND.primaryDark} 0%, ${BRAND.primary} 100%)`,
            },
          }}
        >
          Add Fees Type
        </Button>
      </Stack>

      {/* ── Fee Types List Card ───────────────────────────────────────────── */}
      <GlassCard elevation={0} sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ p: 2, bgcolor: alpha(BRAND.primary, 0.05), borderBottom: `1px solid ${alpha(BRAND.primary, 0.1)}` }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '0.95rem', color: BRAND.primary }}>
              Fees Type List
            </Typography>
            <Tooltip title="Refresh">
              <IconButton
                size="small"
                onClick={() => dispatch(getAllFeeTypesPaginated(filters))}
                sx={{
                  bgcolor: alpha(BRAND.primary, 0.1),
                  color: BRAND.primary,
                  '&:hover': { bgcolor: alpha(BRAND.primary, 0.2) },
                }}
              >
                <RefreshIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Search Field */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(BRAND.primary, 0.1)}` }}>
          <StyledTextField
            fullWidth
            size="small"
            placeholder="Search by name, code or description..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {feeTypesLoading ? (
                    <CircularProgress size={18} sx={{ color: BRAND.primary }} />
                  ) : (
                    <SearchIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                  )}
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Loading State */}
        {feeTypesLoading && feeTypesPaginated.length === 0 ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress sx={{ color: BRAND.primary }} />
          </Box>
        ) : feeTypesPaginated.length === 0 ? (
          // Empty State
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Box
              component="img"
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cg fill='%23E5E7EB'%3E%3Crect x='60' y='40' width='80' height='100' rx='4'/%3E%3Crect x='70' y='60' width='60' height='4' rx='2'/%3E%3Crect x='70' y='75' width='60' height='4' rx='2'/%3E%3Crect x='70' y='90' width='40' height='4' rx='2'/%3E%3C/g%3E%3C/svg%3E"
              sx={{ width: 120, height: 120, opacity: 0.5, mb: 2, mx: 'auto' }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontSize: '1rem' }}>
              No fee types found
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ fontSize: '0.85rem', mb: 2 }}>
              Click "Add Fees Type" to create a new fee type
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.75rem' }}>
              Records: 0 to 0 of 0
            </Typography>
          </Box>
        ) : (
          // Table with Data
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(BRAND.primary, 0.03) }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', py: 1.5 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', py: 1.5 }}>Fees Code</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', py: 1.5 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', py: 1.5 }}>Created Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', py: 1.5 }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feeTypesPaginated.map((feeType, i) => (
                    <TableRow
                      key={feeType._id}
                      hover
                      sx={{
                        '&:hover': { bgcolor: alpha(BRAND.primary, 0.03) },
                        animation: `${fadeIn} 0.3s ease ${i * 0.03}s both`,
                      }}
                    >
                      <TableCell sx={{ fontSize: '0.8rem', py: 1.5 }}>
                        <Chip
                          label={feeType.name}
                          size="small"
                          sx={{
                            bgcolor: alpha(BRAND.primary, 0.1),
                            color: BRAND.primary,
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 1.5, fontWeight: 600, color: BRAND.primaryDark }}>
                        {feeType.feeCode}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 1.5, color: BRAND.gray }}>
                        {feeType.description || 'No description'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 1.5 }}>
                        {formatDate(feeType.createdAt)}
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1.5 }}>
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(feeType)}
                              sx={{
                                color: BRAND.primary,
                                '&:hover': { bgcolor: alpha(BRAND.primary, 0.1) },
                              }}
                            >
                              <EditIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(feeType._id)}
                              sx={{
                                color: '#EF4444',
                                '&:hover': { bgcolor: alpha('#EF4444', 0.1) },
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Footer with Pagination */}
            <Box sx={{ p: 2, borderTop: `1px solid ${alpha(BRAND.primary, 0.1)}`, bgcolor: alpha(BRAND.purple50, 0.3) }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  Showing {((feeTypesPagination.page - 1) * feeTypesPagination.limit) + 1} to {Math.min(feeTypesPagination.page * feeTypesPagination.limit, feeTypesPagination.total)} of {feeTypesPagination.total} records
                </Typography>
                <TablePagination
                  component="div"
                  count={feeTypesPagination.total}
                  page={feeTypesPagination.page - 1}
                  onPageChange={handlePageChange}
                  rowsPerPage={feeTypesPagination.limit}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  rowsPerPageOptions={[5, 10, 25, 50, 100]}
                  sx={{
                    '& .MuiTablePagination-select': {
                      borderRadius: 2,
                      fontSize: '0.75rem',
                    },
                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                      fontSize: '0.75rem',
                    },
                  }}
                />
              </Stack>
            </Box>
          </>
        )}
      </GlassCard>

      {/* ── Add/Edit Dialog ───────────────────────────────────────────────── */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(12px)',
          },
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: alpha(BRAND.primary, 0.05),
          borderBottom: `1px solid ${alpha(BRAND.primary, 0.1)}`,
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: BRAND.primary }}>
            {editMode ? 'Edit Fees Type' : 'Add Fees Type'}
          </Typography>
          <IconButton size="small" onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                size="small"
                label="Name *"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                placeholder="e.g., April Tuition Fee, Admission Fee"
              />
            </Grid>

            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                size="small"
                label="Fees Code *"
                value={formData.feeCode}
                onChange={(e) => handleFormChange('feeCode', e.target.value)}
                placeholder="e.g., 001, 002, TF001"
              />
            </Grid>

            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                size="small"
                label="Description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Optional description"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: alpha(BRAND.purple50, 0.3) }}>
          <Button onClick={handleCloseDialog} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitLoading}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${BRAND.primaryDark} 0%, ${BRAND.primary} 100%)`,
              },
            }}
          >
            {submitLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : editMode ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ──────────────────────────────────────────────────────── */}
      <CustomizedSnackbars
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </PageContainer>
  );
};

export default FeesType;
