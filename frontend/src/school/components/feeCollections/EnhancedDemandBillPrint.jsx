import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Chip,
  Avatar,
  Badge,
} from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FileDownload as FileDownloadIcon,
  Send as SendIcon,
  Print as PrintIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon,
  School as SchoolIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { alpha, styled, keyframes } from '@mui/material/styles';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useReactToPrint } from 'react-to-print';
import './print.css';
import {
  getDemandBills,
  getAllClasses,
  getFeeGroups,
} from '../../../state/feeCollectionSlice';
import { fetchSchoolData } from '../../../state/schoolSlice';
import DemandBillTemplate from './DemandBillTemplate';
import CustomizedSnackbars from '../../../basic utility components/CustomizedSnackbars';

// ─── Design Tokens ─────────────────────────────────────────────────────────
const BRAND = {
  primary:      '#7C3AED',
  primaryLight: '#A78BFA',
  primaryDark:  '#6D28D9',
  primaryXDark: '#4C1D95',
  white:        '#FFFFFF',
  purple50:     '#FAF5FF',
  purple100:    '#F3E8FF',
  purple200:    '#DDD6FE',
  gray:         '#6B7280',
  grayDark:     '#374151',
  grayLight:    '#F3F4F6',
  success:      '#10B981',
  danger:       '#EF4444',
};

// ─── Animations ────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

// ─── Styled Components ──────────────────────────────────────────────────────
const PageContainer = styled(Box)({
  padding: 'clamp(16px, 3vw, 32px)',
  minHeight: '100vh',
  background: `linear-gradient(160deg, ${BRAND.purple50} 0%, ${BRAND.white} 60%, ${BRAND.purple50} 100%)`,
});

const GlassCard = styled(Paper)({
  background: 'rgba(255,255,255,0.97)',
  backdropFilter: 'blur(12px)',
  border: `1px solid ${alpha(BRAND.primary, 0.14)}`,
  borderRadius: 16,
  transition: 'box-shadow 0.25s ease',
  animation: `${fadeIn} 0.35s ease`,
  '&:hover': {
    boxShadow: `0 8px 32px ${alpha(BRAND.primary, 0.1)}`,
  },
});

const SearchField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    background: BRAND.white,
    '& fieldset':             { borderColor: alpha(BRAND.primary, 0.2) },
    '&:hover fieldset':       { borderColor: alpha(BRAND.primary, 0.45) },
    '&.Mui-focused fieldset': { borderColor: BRAND.primary, borderWidth: 2 },
  },
});

const SelectField = styled(FormControl)({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    background: BRAND.white,
    '& fieldset':             { borderColor: alpha(BRAND.primary, 0.2) },
    '&:hover fieldset':       { borderColor: alpha(BRAND.primary, 0.45) },
    '&.Mui-focused fieldset': { borderColor: BRAND.primary, borderWidth: 2 },
  },
});

const GradientButton = styled(Button)({
  borderRadius: 12,
  textTransform: 'none',
  fontWeight: 700,
  background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
  boxShadow: `0 4px 14px ${alpha(BRAND.primary, 0.35)}`,
  '&:hover': {
    background: `linear-gradient(135deg, ${BRAND.primaryDark} 0%, ${BRAND.primaryXDark} 100%)`,
    boxShadow: `0 6px 20px ${alpha(BRAND.primary, 0.45)}`,
    transform: 'translateY(-1px)',
  },
  transition: 'all 0.2s ease',
});

const StatCard = styled(Box)(({ color = BRAND.primary }) => ({
  padding: '12px 18px',
  borderRadius: 12,
  background: `linear-gradient(135deg, ${alpha(color, 0.12)} 0%, ${alpha(color, 0.06)} 100%)`,
  border: `1px solid ${alpha(color, 0.2)}`,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
}));

// ─── Helpers ───────────────────────────────────────────────────────────────
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);

// ─── Main Component ─────────────────────────────────────────────────────────
export default function EnhancedDemandBillPrint() {
  useDocumentTitle('Demand Bill Print');
  const dispatch = useDispatch();

  const { demandBills, demandBillsPagination, demandBillsLoading, classes, feeGroups } =
    useSelector((s) => s.feeCollection);
  
  const schoolData = useSelector((s) => s.school.data);

  const [filters, setFilters]         = useState({ search: '', classId: '', section: '', feesGroup: '', page: 1, limit: 10 });
  const [searchInput, setSearchInput] = useState('');
  const [selectedBills, setSelectedBills] = useState([]);
  const [previewDialog, setPreviewDialog] = useState({ open: false, bill: null });
  const [snackbar, setSnackbar]           = useState({ open: false, message: '', severity: 'success' });
  const [sections, setSections]           = useState([]);

  const debounceRef = useRef(null);
  const printRef    = useRef();

  // Get school info from Redux state or localStorage
  const getSchoolInfo = () => {
    // First try Redux state
    if (schoolData) {
      return {
        name:    schoolData.school_name || 'School Name',
        address: [
          schoolData.address,
          schoolData.city,
          schoolData.state,
          schoolData.pincode
        ].filter(Boolean).join(', ') || 'School Address, City, State - PIN',
        phone:   schoolData.phone || '+91 XXXXXXXXXX',
        email:   schoolData.email || 'info@school.com',
        website: schoolData.website || 'www.school.com',
      };
    }

    // Fallback to localStorage
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return {
          name:    user.school_name || user.schoolName || 'School Name',
          address: user.address || user.schoolAddress || 'School Address, City, State - PIN',
          phone:   user.phone || user.schoolPhone || '+91 XXXXXXXXXX',
          email:   user.email || user.schoolEmail || 'info@school.com',
          website: user.website || user.schoolWebsite || 'www.school.com',
        };
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }

    // Default fallback
    return {
      name:    'School Name',
      address: 'School Address, City, State - PIN',
      phone:   '+91 XXXXXXXXXX',
      email:   'info@school.com',
      website: 'www.school.com',
    };
  };

  const schoolInfo = getSchoolInfo();

  // ─── Init ────────────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(getAllClasses());
    dispatch(getFeeGroups());
    dispatch(fetchSchoolData()); // Fetch school data on mount
  }, [dispatch]);

  useEffect(() => {
    if (filters.classId) {
      const cls = classes.find((c) => c._id === filters.classId);
      setSections(cls?.sections || []);
    } else {
      setSections([]);
    }
  }, [filters.classId, classes]);

  const fetchData = useCallback(() => {
    dispatch(getDemandBills(filters));
  }, [dispatch, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleSearchChange = (value) => {
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((f) => ({ ...f, search: value, page: 1 }));
    }, 400);
  };

  const handleFilterChange = (key, value) =>
    setFilters((f) => ({
      ...f,
      [key]: value,
      ...(key === 'classId' ? { section: '' } : {}),
      page: 1,
    }));

  const handlePageChange = (newPage) =>
    setFilters((f) => ({ ...f, page: newPage }));

  const handleSelectAll = (e) =>
    setSelectedBills(
      e.target.checked ? demandBills.map((b) => b._id || b.student?._id) : []
    );

  const handleSelectOne = (id) =>
    setSelectedBills((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // ─── Print ───────────────────────────────────────────────────────────────
  // window.print() is used directly — print.css handles hiding dialog chrome
  // and stretching the bill content to full A4 page automatically.
  const handlePrintClick = () => {
    window.print();
    setTimeout(() => {
      setSnackbar({ open: true, message: 'Bill printed successfully', severity: 'success' });
    }, 500);
  };

  const handleBulkAction = (action) => {
    if (!selectedBills.length) {
      setSnackbar({ open: true, message: 'Please select at least one bill', severity: 'warning' });
      return;
    }
    setSnackbar({ open: true, message: `${action} ${selectedBills.length} bills...`, severity: 'info' });
  };

  const isAllSelected  = demandBills.length > 0 && selectedBills.length === demandBills.length;
  const isSomeSelected = selectedBills.length > 0 && selectedBills.length < demandBills.length;

  // ─── Aggregate stats from current page ───────────────────────────────────
  const pageTotal   = demandBills.reduce((s, b) => s + (b.totalAmount   || 0), 0);
  const pageBalance = demandBills.reduce((s, b) => s + (b.totalBalance  || 0), 0);

  return (
    <PageContainer>

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
              boxShadow: `0 6px 20px ${alpha(BRAND.primary, 0.4)}`,
            }}
          >
            <ReceiptIcon sx={{ fontSize: 28, color: BRAND.white }} />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: BRAND.primary, letterSpacing: '-0.5px', fontSize: '1.35rem' }}
            >
              Demand Bill Print
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
              Generate, preview and print fee demand bills for students
            </Typography>
          </Box>
        </Stack>

        {/* Bulk action bar */}
        {selectedBills.length > 0 && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={`${selectedBills.length} selected`}
              color="primary"
              size="small"
              onDelete={() => setSelectedBills([])}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            />
            {[
              { icon: <PrintIcon sx={{ fontSize: 17 }} />, tip: 'Bulk Print',    fn: () => handleBulkAction('Printing') },
              { icon: <FileDownloadIcon sx={{ fontSize: 17 }} />, tip: 'Download', fn: () => handleBulkAction('Downloading') },
              { icon: <SendIcon sx={{ fontSize: 17 }} />, tip: 'Send Email',    fn: () => handleBulkAction('Sending') },
            ].map(({ icon, tip, fn }) => (
              <Tooltip title={tip} key={tip}>
                <IconButton
                  size="small"
                  onClick={fn}
                  sx={{
                    bgcolor: alpha(BRAND.primary, 0.1),
                    color: BRAND.primary,
                    borderRadius: 2,
                    '&:hover': { bgcolor: alpha(BRAND.primary, 0.2), transform: 'scale(1.08)' },
                    transition: 'all 0.2s',
                  }}
                >
                  {icon}
                </IconButton>
              </Tooltip>
            ))}
          </Stack>
        )}
      </Stack>

      {/* ── Stats Row ────────────────────────────────────────────────────── */}
      {demandBills.length > 0 && (
        <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
          <StatCard color={BRAND.primary}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Total Records
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: BRAND.primary, lineHeight: 1 }}>
              {demandBillsPagination.total || 0}
            </Typography>
          </StatCard>
          <StatCard color="#1D4ED8">
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Page Amount
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1D4ED8', lineHeight: 1 }}>
              {formatCurrency(pageTotal)}
            </Typography>
          </StatCard>
          <StatCard color={BRAND.danger}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Page Balance Due
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: BRAND.danger, lineHeight: 1 }}>
              {formatCurrency(pageBalance)}
            </Typography>
          </StatCard>
        </Stack>
      )}

      {/* ── Filter Card ──────────────────────────────────────────────────── */}
      <GlassCard elevation={0} sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={2.5}>
          <FilterListIcon sx={{ color: BRAND.primary, fontSize: 20 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '0.95rem', color: BRAND.primary }}>
            Filter Criteria
          </Typography>
        </Stack>

        <Grid2 container spacing={2} alignItems="flex-end">
          <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
            <SelectField fullWidth size="small">
              <InputLabel>Class</InputLabel>
              <Select
                value={filters.classId || ''}
                label="Class"
                onChange={(e) => handleFilterChange('classId', e.target.value)}
              >
                <MenuItem value="">All Classes</MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls._id} value={cls._id}>{cls.class_text}</MenuItem>
                ))}
              </Select>
            </SelectField>
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
            <SelectField fullWidth size="small" disabled={!filters.classId}>
              <InputLabel>Section</InputLabel>
              <Select
                value={filters.section || ''}
                label="Section"
                onChange={(e) => handleFilterChange('section', e.target.value)}
              >
                <MenuItem value="">All Sections</MenuItem>
                {sections.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </Select>
            </SelectField>
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
            <SelectField fullWidth size="small">
              <InputLabel>Fees Group</InputLabel>
              <Select
                value={filters.feesGroup || ''}
                label="Fees Group"
                onChange={(e) => handleFilterChange('feesGroup', e.target.value)}
              >
                <MenuItem value="">All Groups</MenuItem>
                {feeGroups.map((g) => (
                  <MenuItem key={g} value={g}>{g}</MenuItem>
                ))}
              </Select>
            </SelectField>
          </Grid2>

          <Grid2 size={{ xs: 12, md: 3 }}>
            <GradientButton
              fullWidth
              variant="contained"
              onClick={fetchData}
              startIcon={<SearchIcon />}
              size="medium"
            >
              Search
            </GradientButton>
          </Grid2>
        </Grid2>
      </GlassCard>

      {/* ── Student List Card ─────────────────────────────────────────────── */}
      <GlassCard elevation={0} sx={{ p: 0, overflow: 'hidden' }}>

        {/* Card header */}
        <Box
          sx={{
            px: 3,
            py: 2,
            background: `linear-gradient(135deg, ${alpha(BRAND.primary, 0.07)} 0%, ${alpha(BRAND.primaryLight, 0.04)} 100%)`,
            borderBottom: `1px solid ${alpha(BRAND.primary, 0.1)}`,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={1}>
              <SchoolIcon sx={{ color: BRAND.primary, fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '0.95rem', color: BRAND.primary }}>
                Student List
              </Typography>
            </Stack>
            {selectedBills.length > 0 && (
              <Typography variant="caption" sx={{ color: BRAND.primary, fontWeight: 600 }}>
                {selectedBills.length} of {demandBills.length} selected
              </Typography>
            )}
          </Stack>
        </Box>

        {/* Search */}
        <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${alpha(BRAND.primary, 0.08)}` }}>
          <SearchField
            fullWidth
            size="small"
            placeholder="Search by student name or admission number…"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    {demandBillsLoading
                      ? <CircularProgress size={18} sx={{ color: BRAND.primary }} />
                      : <SearchIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                    }
                  </InputAdornment>
                ),
                endAdornment: searchInput ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => handleSearchChange('')}>
                      <ClearIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />
        </Box>

        {/* States */}
        {demandBillsLoading && demandBills.length === 0 ? (
          <Box sx={{ p: 8, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress sx={{ color: BRAND.primary }} />
          </Box>
        ) : demandBills.length === 0 ? (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
                borderRadius: '50%',
                bgcolor: BRAND.purple100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ReceiptIcon sx={{ fontSize: 40, color: alpha(BRAND.primary, 0.4) }} />
            </Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No records found
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Try selecting a different class, section or fee group.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(BRAND.primary, 0.04) }}>
                    <TableCell padding="checkbox" sx={{ pl: 2 }}>
                      <Checkbox
                        checked={isAllSelected}
                        indeterminate={isSomeSelected}
                        onChange={handleSelectAll}
                        size="small"
                        sx={{ color: BRAND.primary, '&.Mui-checked': { color: BRAND.primary } }}
                      />
                    </TableCell>
                    {['Class', 'Admission No', 'Student Name', 'Fees Group', 'Amount (₹)', 'Balance (₹)', 'Action'].map((h) => (
                      <TableCell
                        key={h}
                        align={['Amount (₹)', 'Balance (₹)'].includes(h) ? 'right' : h === 'Action' ? 'center' : 'left'}
                        sx={{ fontWeight: 700, fontSize: '0.75rem', color: BRAND.grayDark, py: 1.5, letterSpacing: 0.3 }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {demandBills.map((bill, i) => {
                    const fullName = bill.student?.firstName
                      ? `${bill.student.firstName} ${bill.student.lastName || ''}`.trim()
                      : 'Unknown';
                    const billId   = bill._id || bill.student?._id;
                    const selected = selectedBills.includes(billId);

                    return (
                      <TableRow
                        key={i}
                        hover
                        selected={selected}
                        sx={{
                          cursor: 'pointer',
                          animation: `${fadeIn} 0.3s ease ${i * 0.025}s both`,
                          '&.Mui-selected': { bgcolor: alpha(BRAND.primary, 0.05) },
                          '&.Mui-selected:hover': { bgcolor: alpha(BRAND.primary, 0.08) },
                          '&:hover': { bgcolor: alpha(BRAND.primary, 0.03) },
                        }}
                      >
                        <TableCell padding="checkbox" sx={{ pl: 2 }}>
                          <Checkbox
                            checked={selected}
                            onChange={() => handleSelectOne(billId)}
                            size="small"
                            sx={{ color: BRAND.primary, '&.Mui-checked': { color: BRAND.primary } }}
                          />
                        </TableCell>

                        {/* Class */}
                        <TableCell sx={{ fontSize: '0.82rem', py: 1.5 }}>
                          <Chip
                            label={bill.student?.class?.class_text || 'N/A'}
                            size="small"
                            sx={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              bgcolor: BRAND.purple100,
                              color: BRAND.primaryDark,
                              borderRadius: 1.5,
                            }}
                          />
                        </TableCell>

                        {/* Admission No */}
                        <TableCell sx={{ fontSize: '0.82rem', py: 1.5, color: BRAND.gray }}>
                          {bill.student?.admissionNo || 'N/A'}
                        </TableCell>

                        {/* Name */}
                        <TableCell sx={{ py: 1.5 }}>
                          <Stack direction="row" alignItems="center" spacing={1.25}>
                            <Avatar
                              sx={{
                                width: 30,
                                height: 30,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryLight} 100%)`,
                              }}
                            >
                              {fullName.charAt(0)}
                            </Avatar>
                            <Typography sx={{ fontSize: '0.83rem', fontWeight: 700, color: BRAND.primary }}>
                              {fullName}
                            </Typography>
                          </Stack>
                        </TableCell>

                        {/* Fee Group */}
                        <TableCell sx={{ fontSize: '0.82rem', py: 1.5 }}>
                          {bill.feesGroup || '—'}
                        </TableCell>

                        {/* Amount */}
                        <TableCell align="right" sx={{ fontSize: '0.83rem', py: 1.5, fontWeight: 700, color: BRAND.grayDark }}>
                          {formatCurrency(bill.totalAmount)}
                        </TableCell>

                        {/* Balance */}
                        <TableCell align="right" sx={{ py: 1.5 }}>
                          <Typography
                            sx={{
                              fontSize: '0.83rem',
                              fontWeight: 800,
                              color: bill.totalBalance > 0 ? BRAND.danger : BRAND.success,
                            }}
                          >
                            {formatCurrency(bill.totalBalance)}
                          </Typography>
                        </TableCell>

                        {/* Action */}
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <Tooltip title="Preview & Print">
                            <IconButton
                              size="small"
                              onClick={() => setPreviewDialog({ open: true, bill })}
                              sx={{
                                bgcolor: alpha(BRAND.primary, 0.1),
                                color: BRAND.primary,
                                borderRadius: 2,
                                '&:hover': {
                                  bgcolor: BRAND.primary,
                                  color: BRAND.white,
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <VisibilityIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Record count footer */}
            <Box
              sx={{
                px: 3,
                py: 1.5,
                borderTop: `1px solid ${alpha(BRAND.primary, 0.08)}`,
                bgcolor: alpha(BRAND.purple50, 0.5),
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                Records:{' '}
                {((demandBillsPagination.page - 1) * demandBillsPagination.limit) + 1}
                {' '}to{' '}
                {Math.min(
                  demandBillsPagination.page * demandBillsPagination.limit,
                  demandBillsPagination.total
                )}
                {' '}of{' '}
                {demandBillsPagination.total}
              </Typography>
            </Box>
          </>
        )}
      </GlassCard>

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {demandBills.length > 0 && demandBillsPagination.pages > 1 && (
        <GlassCard elevation={0} sx={{ p: 2, mt: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Page {demandBillsPagination.page} of {demandBillsPagination.pages || 1}
              &nbsp;&nbsp;·&nbsp;&nbsp;Total: {demandBillsPagination.total} records
            </Typography>
            <Pagination
              count={demandBillsPagination.pages}
              page={demandBillsPagination.page}
              onChange={(_, page) => handlePageChange(page)}
              color="primary"
              size="small"
              sx={{
                '& .MuiPaginationItem-root': { borderRadius: 2, fontWeight: 600, fontSize: '0.75rem' },
                '& .Mui-selected': {
                  background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%) !important`,
                  color: 'white !important',
                },
              }}
            />
          </Stack>
        </GlassCard>
      )}

      {/* ── Preview & Print Dialog ────────────────────────────────────────── */}
      <Dialog
        open={previewDialog.open}
        onClose={() => setPreviewDialog({ open: false, bill: null })}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: `2px solid ${alpha(BRAND.primary, 0.2)}`,
            overflow: 'hidden',
          },
        }}
      >
        {/* Dialog title */}
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
            color: BRAND.white,
            py: 2,
            px: 3,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <ReceiptIcon sx={{ fontSize: 22 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  Demand Bill Preview
                </Typography>
                {previewDialog.bill?.student && (
                  <Typography variant="caption" sx={{ opacity: 0.85 }}>
                    {previewDialog.bill.student.firstName} {previewDialog.bill.student.lastName || ''} 
                    &nbsp;·&nbsp; {previewDialog.bill.student.admissionNo}
                  </Typography>
                )}
              </Box>
            </Stack>
            <IconButton
              size="small"
              onClick={() => setPreviewDialog({ open: false, bill: null })}
              sx={{
                color: BRAND.white,
                bgcolor: alpha(BRAND.white, 0.15),
                '&:hover': { bgcolor: alpha(BRAND.white, 0.25) },
                borderRadius: 2,
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </DialogTitle>

        {/* Bill content */}
        <DialogContent dividers sx={{ p: 0, bgcolor: '#f8f8f8' }}>
          <DemandBillTemplate
            billData={previewDialog.bill}
            schoolInfo={schoolInfo}
          />
        </DialogContent>

        {/* Actions */}
        <DialogActions sx={{ px: 3, py: 2, gap: 1, bgcolor: BRAND.purple50 }}>
          <Button
            onClick={() => setPreviewDialog({ open: false, bill: null })}
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              borderColor: alpha(BRAND.primary, 0.4),
              color: BRAND.primary,
              '&:hover': { borderColor: BRAND.primary, bgcolor: alpha(BRAND.primary, 0.05) },
            }}
          >
            Cancel
          </Button>
          <GradientButton
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrintClick}
          >
            Print Bill
          </GradientButton>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <CustomizedSnackbars
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      />
    </PageContainer>
  );
}