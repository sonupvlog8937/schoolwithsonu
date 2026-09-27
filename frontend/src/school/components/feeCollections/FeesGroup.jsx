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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';
import { alpha, styled, keyframes } from '@mui/material/styles';
import {
  getAllFeeGroupsPaginated,
  createFeeGroup,
  updateFeeGroup,
  deleteFeeGroup,
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

const FeesGroup = () => {
  const dispatch = useDispatch();

  const {
    feeGroupsPaginated,
    feeGroupsPagination,
    feeGroupsLoading,
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
  const [currentFeeGroup, setCurrentFeeGroup] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load fee groups when filters change
  useEffect(() => {
    dispatch(getAllFeeGroupsPaginated(filters));
  }, [dispatch, filters]);

  // Handle success/error messages
  useEffect(() => {
    if (successMsg) {
      setSnackbar({ open: true, message: successMsg, severity: 'success' });
      dispatch(clearFeeMessages());
      handleCloseDialog();
      dispatch(getAllFeeGroupsPaginated(filters));
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

  const handleOpenDialog = (feeGroup = null) => {
    if (feeGroup) {
      setEditMode(true);
      setCurrentFeeGroup(feeGroup);
      setFormData({
        name: feeGroup.name || '',
        description: feeGroup.description || '',
      });
    } else {
      setEditMode(false);
      setCurrentFeeGroup(null);
      setFormData({
        name: '',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentFeeGroup(null);
    setFormData({
      name: '',
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
      setSnackbar({ open: true, message: 'Please enter fee group name', severity: 'error' });
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
    };

    if (editMode && currentFeeGroup) {
      dispatch(updateFeeGroup({ feeGroupId: currentFeeGroup._id, ...payload }));
    } else {
      dispatch(createFeeGroup(payload));
    }
  };

  const handleDelete = (feeGroupId) => {
    if (window.confirm('Are you sure you want to delete this fee group?')) {
      dispatch(deleteFeeGroup(feeGroupId));
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
            <GroupIcon sx={{ fontSize: 22, color: BRAND.white }} />
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
              Fees Group
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              Manage fee group categories
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
          Add Fees Group
        </Button>
      </Stack>

      {/* ── Fee Groups List Card ──────────────────────────────────────────── */}
      <GlassCard elevation={0} sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ p: 2, bgcolor: alpha(BRAND.primary, 0.05), borderBottom: `1px solid ${alpha(BRAND.primary, 0.1)}` }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '0.95rem', color: BRAND.primary }}>
              Fees Group List
            </Typography>
            <Tooltip title="Refresh">
              <IconButton
                size="small"
                onClick={() => dispatch(getAllFeeGroupsPaginated(filters))}
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
            placeholder="Search by name or description..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {feeGroupsLoading ? (
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
        {feeGroupsLoading && feeGroupsPaginated.length === 0 ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress sx={{ color: BRAND.primary }} />
          </Box>
        ) : feeGroupsPaginated.length === 0 ? (
          // Empty State
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontSize: '1rem' }}>
              No fee groups found
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ fontSize: '0.85rem', mb: 2 }}>
              Click "Add Fees Group" to create a new fee group
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
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', py: 1.5 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', py: 1.5 }}>Created Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', py: 1.5 }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feeGroupsPaginated.map((feeGroup, i) => (
                    <TableRow
                      key={feeGroup._id}
                      hover
                      sx={{
                        '&:hover': { bgcolor: alpha(BRAND.primary, 0.03) },
                        animation: `${fadeIn} 0.3s ease ${i * 0.03}s both`,
                      }}
                    >
                      <TableCell sx={{ fontSize: '0.8rem', py: 1.5 }}>
                        <Chip
                          label={feeGroup.name}
                          size="small"
                          sx={{
                            bgcolor: alpha(BRAND.primary, 0.1),
                            color: BRAND.primary,
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 1.5, color: BRAND.gray }}>
                        {feeGroup.description || 'No description'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 1.5 }}>
                        {formatDate(feeGroup.createdAt)}
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1.5 }}>
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(feeGroup)}
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
                              onClick={() => handleDelete(feeGroup._id)}
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
                  Showing {((feeGroupsPagination.page - 1) * feeGroupsPagination.limit) + 1} to {Math.min(feeGroupsPagination.page * feeGroupsPagination.limit, feeGroupsPagination.total)} of {feeGroupsPagination.total} records
                </Typography>
                <TablePagination
                  component="div"
                  count={feeGroupsPagination.total}
                  page={feeGroupsPagination.page - 1}
                  onPageChange={handlePageChange}
                  rowsPerPage={feeGroupsPagination.limit}
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
            {editMode ? 'Edit Fees Group' : 'Add Fees Group'}
          </Typography>
          <IconButton size="small" onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2}>
            <StyledTextField
              fullWidth
              size="small"
              label="Name *"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder="e.g., Play Group, Nursery, LKG"
            />

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
          </Stack>
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

export default FeesGroup;
