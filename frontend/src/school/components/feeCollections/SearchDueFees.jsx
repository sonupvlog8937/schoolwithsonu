import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
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
  Grid,
  Chip,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { alpha, styled, keyframes } from '@mui/material/styles';
import { searchDueFees, getAllClasses, getFeeGroups } from '../../../state/feeCollectionSlice';

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

const SearchDueFees = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    dueFees,
    dueFeesPagination,
    dueFeesLoading,
    classes,
    feeGroups,
  } = useSelector((state) => state.feeCollection);

  const [filters, setFilters] = useState({
    search: '',
    classId: '',
    section: '',
    feesGroup: '',
    page: 1,
    limit: 10,
  });

  const [sections, setSections] = useState([]);

  // Load classes and fee groups on mount
  useEffect(() => {
    dispatch(getAllClasses());
    dispatch(getFeeGroups());
  }, [dispatch]);

  // Load due fees when filters change
  useEffect(() => {
    dispatch(searchDueFees(filters));
  }, [dispatch, filters]);

  // Update sections when class changes
  useEffect(() => {
    if (filters.classId) {
      const selectedClass = classes.find((c) => c._id === filters.classId);
      setSections(selectedClass?.sections || []);
    } else {
      setSections([]);
    }
  }, [filters.classId, classes]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'classId' ? { section: '' } : {}),
      ...(field !== 'page' && field !== 'limit' ? { page: 1 } : {}),
    }));
  };

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, page: 1 }));
    dispatch(searchDueFees(filters));
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

  const handlePrintDemandBill = (studentId) => {
    navigate(`/school/fee-collection/demand-bill/${studentId}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleExportCSV = () => {
    if (dueFees.length === 0) return;
    
    const csvData = dueFees.map((row) => ({
      Class: `${row.student.class?.class_text || 'N/A'} - ${row.student.section || 'N/A'}`,
      'Admission No': row.student.admissionNo,
      'Student Name': `${row.student.firstName} ${row.student.lastName || ''}`,
      'Father Name': row.student.fatherName || 'N/A',
      Phone: row.student.mobileNumber || 'N/A',
      'Fees Group': row.feesGroup,
      Amount: row.totalAmount.toFixed(2),
      Paid: row.totalPaid.toFixed(2),
      Discount: row.totalDiscount.toFixed(2),
      Fine: row.totalFine.toFixed(2),
      Balance: row.totalBalance.toFixed(2),
    }));
    
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map((row) => Object.values(row).join(',')),
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `due_fees_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <PageContainer>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
            boxShadow: `0 4px 16px ${alpha(BRAND.primary, 0.3)}`,
          }}
        >
          <SearchIcon sx={{ fontSize: 22, color: BRAND.white }} />
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
            Search Due Fees
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            Find students with outstanding fee balances
          </Typography>
        </Box>
      </Stack>

      {/* ── Select Criteria Card ──────────────────────────────────────────── */}
      <GlassCard elevation={0} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '0.95rem', color: BRAND.primary, mb: 2 }}>
          Select Criteria
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <StyledTextField
              select
              fullWidth
              size="small"
              label="Fees Group"
              value={filters.feesGroup}
              onChange={(e) => handleFilterChange('feesGroup', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {feeGroups.map((group) => (
                <MenuItem key={group} value={group}>
                  {group}
                </MenuItem>
              ))}
            </StyledTextField>
          </Grid>

          <Grid item xs={12} md={3}>
            <StyledTextField
              select
              fullWidth
              size="small"
              label="Class"
              value={filters.classId}
              onChange={(e) => handleFilterChange('classId', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls._id} value={cls._id}>
                  {cls.class_text}
                </MenuItem>
              ))}
            </StyledTextField>
          </Grid>

          <Grid item xs={12} md={3}>
            <StyledTextField
              select
              fullWidth
              size="small"
              label="Section"
              value={filters.section}
              onChange={(e) => handleFilterChange('section', e.target.value)}
              disabled={!filters.classId}
            >
              <MenuItem value="">All</MenuItem>
              {sections.map((section) => (
                <MenuItem key={section} value={section}>
                  {section}
                </MenuItem>
              ))}
            </StyledTextField>
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              startIcon={<SearchIcon />}
              sx={{
                height: '40px',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${BRAND.primaryDark} 0%, ${BRAND.primary} 100%)`,
                },
              }}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </GlassCard>

      {/* ── Student List Card ─────────────────────────────────────────────── */}
      <GlassCard elevation={0} sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ p: 2, bgcolor: alpha(BRAND.primary, 0.05), borderBottom: `1px solid ${alpha(BRAND.primary, 0.1)}` }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '0.95rem', color: BRAND.primary }}>
              Student List
            </Typography>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh">
                <IconButton
                  size="small"
                  onClick={handleSearch}
                  sx={{
                    bgcolor: alpha(BRAND.primary, 0.1),
                    color: BRAND.primary,
                    '&:hover': { bgcolor: alpha(BRAND.primary, 0.2) },
                  }}
                >
                  <RefreshIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export CSV">
                <IconButton
                  size="small"
                  onClick={handleExportCSV}
                  disabled={dueFees.length === 0}
                  sx={{
                    bgcolor: alpha(BRAND.primary, 0.1),
                    color: BRAND.primary,
                    '&:hover': { bgcolor: alpha(BRAND.primary, 0.2) },
                    '&.Mui-disabled': { opacity: 0.5 },
                  }}
                >
                  <FileDownloadIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>

        {/* Search Field */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(BRAND.primary, 0.1)}` }}>
          <StyledTextField
            fullWidth
            size="small"
            placeholder="Search by name, admission no, father name..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {dueFeesLoading ? (
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
        {dueFeesLoading && dueFees.length === 0 ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress sx={{ color: BRAND.primary }} />
          </Box>
        ) : dueFees.length === 0 ? (
          // Empty State
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Box
              component="img"
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cg fill='%23E5E7EB'%3E%3Crect x='60' y='40' width='80' height='100' rx='4'/%3E%3Crect x='70' y='60' width='60' height='4' rx='2'/%3E%3Crect x='70' y='75' width='60' height='4' rx='2'/%3E%3Crect x='70' y='90' width='40' height='4' rx='2'/%3E%3C/g%3E%3C/svg%3E"
              sx={{ width: 120, height: 120, opacity: 0.5, mb: 2, mx: 'auto' }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontSize: '1rem' }}>
              No due fees found
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ fontSize: '0.85rem', mb: 2 }}>
              ← Try different search criteria or filters
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
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', py: 1.5 }}>Class</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', py: 1.5 }}>Admission No</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', py: 1.5 }}>Student Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', py: 1.5 }}>Father Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', py: 1.5 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', py: 1.5 }}>Fees Group</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', py: 1.5 }} align="right">Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', py: 1.5 }} align="right">Paid</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', py: 1.5 }} align="right">Discount</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', py: 1.5 }} align="right">Fine</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', py: 1.5 }} align="right">Balance</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', py: 1.5 }} align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dueFees.map((row, i) => (
                    <TableRow
                      key={row.student._id}
                      hover
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { bgcolor: alpha(BRAND.primary, 0.03) },
                        animation: `${fadeIn} 0.3s ease ${i * 0.03}s both`,
                      }}
                    >
                      <TableCell sx={{ fontSize: '0.8rem', py: 1.5 }}>
                        {row.student.class?.class_text || 'N/A'} - {row.student.section || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 1.5 }}>
                        {row.student.admissionNo}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 1.5, fontWeight: 600, color: BRAND.primary }}>
                        {row.student.firstName} {row.student.lastName || ''}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 1.5 }}>
                        {row.student.fatherName || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 1.5 }}>
                        {row.student.mobileNumber || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', py: 1.5 }}>
                        <Chip
                          label={row.feesGroup}
                          size="small"
                          sx={{
                            bgcolor: alpha(BRAND.primary, 0.1),
                            color: BRAND.primary,
                            fontWeight: 600,
                            fontSize: '0.7rem',
                          }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.8rem', py: 1.5, fontWeight: 600 }}>
                        {formatCurrency(row.totalAmount)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.8rem', py: 1.5, color: '#10B981', fontWeight: 600 }}>
                        {formatCurrency(row.totalPaid)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.8rem', py: 1.5 }}>
                        {formatCurrency(row.totalDiscount)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.8rem', py: 1.5 }}>
                        {formatCurrency(row.totalFine)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.8rem', py: 1.5 }}>
                        <Chip
                          label={formatCurrency(row.totalBalance)}
                          size="small"
                          sx={{
                            bgcolor: row.totalBalance > 0 ? alpha('#EF4444', 0.1) : alpha('#10B981', 0.1),
                            color: row.totalBalance > 0 ? '#EF4444' : '#10B981',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1.5 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PrintIcon sx={{ fontSize: 16 }} />}
                          onClick={() => handlePrintDemandBill(row.student._id)}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            borderColor: alpha(BRAND.primary, 0.3),
                            color: BRAND.primary,
                            '&:hover': {
                              borderColor: BRAND.primary,
                              bgcolor: alpha(BRAND.primary, 0.05),
                            },
                          }}
                        >
                          Print
                        </Button>
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
                  Showing {((dueFeesPagination.page - 1) * dueFeesPagination.limit) + 1} to {Math.min(dueFeesPagination.page * dueFeesPagination.limit, dueFeesPagination.total)} of {dueFeesPagination.total} records
                </Typography>
                <TablePagination
                  component="div"
                  count={dueFeesPagination.total}
                  page={dueFeesPagination.page - 1}
                  onPageChange={handlePageChange}
                  rowsPerPage={dueFeesPagination.limit}
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
    </PageContainer>
  );
};

export default SearchDueFees;
