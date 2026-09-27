import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Paper, Typography, TextField, MenuItem, Button,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, CircularProgress, InputAdornment,
  Grid, Stack, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Radio, RadioGroup,
  FormControlLabel, FormControl, FormLabel, Chip, Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LayersIcon from '@mui/icons-material/Layers';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { alpha, styled, keyframes } from '@mui/material/styles';
import {
  getAllFeeMasters, createFeeMaster, updateFeeMaster,
  deleteFeeMaster, getAllClasses, getFeeGroups,
  getAllFeeGroupsPaginated, getAllFeeTypesPaginated,
  assignFeeToStudents, clearFeeMessages,
} from '../../../state/feeCollectionSlice';
import CustomizedSnackbars from '../../../basic utility components/CustomizedSnackbars';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  p900: '#2E1065', p800: '#3B0764', p700: '#4C1D95', p600: '#5B21B6',
  p500: '#7C3AED', p400: '#8B5CF6', p300: '#A78BFA', p200: '#C4B5FD',
  p100: '#EDE9FE', p50: '#F5F3FF',
  white: '#FFFFFF',
  n900: '#0F172A', n800: '#1E293B', n700: '#334155', n600: '#475569',
  n500: '#64748B', n400: '#94A3B8', n300: '#CBD5E1', n200: '#E2E8F0',
  n100: '#F1F5F9', n50: '#F8FAFC',
  success: '#059669', successBg: '#D1FAE5',
  warning: '#D97706', warningBg: '#FEF3C7',
  danger: '#DC2626', dangerBg: '#FEE2E2',
};

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeUp = keyframes`from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}`;
const slideIn = keyframes`from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}`;

// ─── Styled Components ────────────────────────────────────────────────────────
const Root = styled(Box)({
  padding: 'clamp(12px, 2.5vw, 28px)',
  minHeight: '100vh',
  background: `linear-gradient(160deg, ${T.p50} 0%, ${T.white} 45%, ${T.p50} 100%)`,
});

const Surface = styled(Paper)({
  background: T.white,
  border: `1px solid ${alpha(T.p500, 0.12)}`,
  borderRadius: 12,
  boxShadow: `0 1px 3px ${alpha(T.p800, 0.06)}, 0 4px 16px ${alpha(T.p800, 0.04)}`,
});

const FieldInput = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8, fontSize: '0.78rem', background: T.white,
    '& fieldset': { borderColor: alpha(T.p500, 0.2) },
    '&:hover fieldset': { borderColor: alpha(T.p500, 0.4) },
    '&.Mui-focused fieldset': { borderColor: T.p500, borderWidth: 1.5 },
  },
  '& .MuiInputLabel-root': { fontSize: '0.78rem' },
  '& .MuiFormHelperText-root': { fontSize: '0.65rem', mt: 0.3 },
});

const PrimaryBtn = styled(Button)({
  borderRadius: 8, textTransform: 'none', fontWeight: 700,
  fontSize: '0.76rem', letterSpacing: 0.2, padding: '7px 18px',
  background: `linear-gradient(135deg, ${T.p500} 0%, ${T.p700} 100%)`,
  color: T.white, boxShadow: `0 2px 8px ${alpha(T.p500, 0.32)}`,
  '&:hover': { background: `linear-gradient(135deg, ${T.p600} 0%, ${T.p800} 100%)`, boxShadow: `0 4px 14px ${alpha(T.p500, 0.42)}` },
  '&:disabled': { opacity: 0.48 },
});

const GhostBtn = styled(IconButton)({
  borderRadius: 7, border: `1px solid ${alpha(T.p500, 0.18)}`,
  color: T.p500, padding: '5px',
  '&:hover': { background: alpha(T.p500, 0.07), borderColor: alpha(T.p500, 0.35) },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n || 0);
const fmtDate = (d) => { if (!d) return '—'; return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); };

// ─── Fine Badge ───────────────────────────────────────────────────────────────
function FineBadge({ type, pct, amt }) {
  if (type === 'None' || !type) return <Typography sx={{ fontSize: '0.7rem', color: T.n400 }}>—</Typography>;
  return (
    <Chip
      label={type === 'Percentage' ? `${pct}% fine` : `${fmt(amt)} fine`}
      size="small"
      sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700, bgcolor: alpha(T.warning, 0.1), color: T.warning, border: `1px solid ${alpha(T.warning, 0.25)}` }}
    />
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────
function SummaryCard({ label, value, sub, color, delay }) {
  return (
    <Box sx={{ p: 1.75, borderRadius: 2.5, background: `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`,
      border: `1px solid ${alpha(color, 0.2)}`, animation: `${slideIn} 0.4s ease ${delay}s both` }}>
      <Typography sx={{ fontSize: '0.62rem', color: T.n500, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.3 }}>{label}</Typography>
      <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color, lineHeight: 1.1 }}>{value}</Typography>
      {sub && <Typography sx={{ fontSize: '0.62rem', color: T.n400, mt: 0.2 }}>{sub}</Typography>}
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const FeesMaster = () => {
  const dispatch = useDispatch();
  const { feeMasters, feeMastersPagination, feeMastersLoading, classes, feeGroups,
    feeGroupsPaginated, feeTypesPaginated, submitLoading, error, successMsg } = useSelector(s => s.feeCollection);

  const [filters, setFilters] = useState({ search: '', feesGroup: '', classId: '', page: 1, limit: 10 });
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentFeeMaster, setCurrentFeeMaster] = useState(null);
  const [formData, setFormData] = useState({ feesGroup: '', feesCode: '', amount: '', dueDate: '', classId: '', section: '', category: '', fineType: 'None', finePercentage: '', fineAmount: '' });
  const [sections, setSections] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [assignConfirm, setAssignConfirm] = useState(null);

  useEffect(() => {
    dispatch(getAllClasses());
    dispatch(getFeeGroups());
    dispatch(getAllFeeGroupsPaginated({ limit: 100 }));
    dispatch(getAllFeeTypesPaginated({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => { dispatch(getAllFeeMasters(filters)); }, [dispatch, filters]);

  useEffect(() => {
    if (formData.classId) {
      const cls = classes.find(c => c._id === formData.classId);
      setSections(cls?.sections || []);
    } else setSections([]);
  }, [formData.classId, classes]);

  useEffect(() => {
    if (successMsg) {
      setSnackbar({ open: true, message: successMsg, severity: 'success' });
      dispatch(clearFeeMessages());
      handleCloseDialog();
      dispatch(getAllFeeMasters(filters));
    }
    if (error) {
      setSnackbar({ open: true, message: error, severity: 'error' });
      dispatch(clearFeeMessages());
    }
  }, [successMsg, error]);

  const handleFilterChange = (field, value) => {
    setFilters(p => ({ ...p, [field]: value, ...(field !== 'page' && field !== 'limit' ? { page: 1 } : {}) }));
  };

  const handleOpenDialog = (fm = null) => {
    if (fm) {
      setEditMode(true); setCurrentFeeMaster(fm);
      setFormData({ feesGroup: fm.feesGroup || '', feesCode: fm.feesCode || '', amount: fm.amount || '', dueDate: fm.dueDate ? new Date(fm.dueDate).toISOString().split('T')[0] : '', classId: fm.class?._id || '', section: fm.section || '', category: fm.category || '', fineType: fm.fineType || 'None', finePercentage: fm.finePercentage || '', fineAmount: fm.fineAmount || '' });
      if (fm.class?._id) { const cls = classes.find(c => c._id === fm.class._id); setSections(cls?.sections || []); }
    } else {
      setEditMode(false); setCurrentFeeMaster(null);
      setFormData({ feesGroup: '', feesCode: '', amount: '', dueDate: '', classId: '', section: '', category: '', fineType: 'None', finePercentage: '', fineAmount: '' });
      setSections([]);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false); setEditMode(false); setCurrentFeeMaster(null);
    setFormData({ feesGroup: '', feesCode: '', amount: '', dueDate: '', classId: '', section: '', category: '', fineType: 'None', finePercentage: '', fineAmount: '' });
  };

  const handleFormChange = (field, value) => {
    setFormData(p => ({ ...p, [field]: value, ...(field === 'classId' ? { section: '' } : {}), ...(field === 'fineType' && value === 'None' ? { finePercentage: '', fineAmount: '' } : {}) }));
  };

  const handleSubmit = () => {
    if (!formData.feesGroup || !formData.feesCode || !formData.amount) {
      setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' }); return;
    }
    const payload = { feesGroup: formData.feesGroup, feesCode: formData.feesCode, amount: parseFloat(formData.amount), dueDate: formData.dueDate || null, classId: formData.classId || null, section: formData.section || null, category: formData.category || null, fineType: formData.fineType, finePercentage: formData.fineType === 'Percentage' ? parseFloat(formData.finePercentage || 0) : 0, fineAmount: formData.fineType === 'Fix Amount' ? parseFloat(formData.fineAmount || 0) : 0 };
    if (editMode && currentFeeMaster) dispatch(updateFeeMaster({ feeMasterId: currentFeeMaster._id, ...payload }));
    else dispatch(createFeeMaster(payload));
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm) { dispatch(deleteFeeMaster(deleteConfirm._id)); setDeleteConfirm(null); }
  };

  const handleAssignConfirm = async () => {
    if (!assignConfirm) return;
    const result = await dispatch(assignFeeToStudents({ feeMasterId: assignConfirm._id, classId: assignConfirm.class?._id || null, section: assignConfirm.section || null }));
    if (assignFeeToStudents.fulfilled.match(result)) setSnackbar({ open: true, message: result.payload.message, severity: 'success' });
    setAssignConfirm(null);
  };

  // Summary stats
  const totalAmount = feeMasters.reduce((s, f) => s + (f.amount || 0), 0);
  const withFine = feeMasters.filter(f => f.fineType !== 'None').length;

  return (
    <Root>
      {/* ── Header ── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2.5}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ p: 0.9, borderRadius: 2, background: `linear-gradient(135deg, ${T.p500} 0%, ${T.p700} 100%)`, boxShadow: `0 3px 12px ${alpha(T.p500, 0.35)}` }}>
            <LayersIcon sx={{ fontSize: 20, color: T.white }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, color: T.p600, fontSize: '1.05rem', letterSpacing: '-0.3px' }}>
              Fees Master
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: T.n500 }}>Manage fee structures and assignments</Typography>
          </Box>
        </Stack>
        <PrimaryBtn startIcon={<AddIcon sx={{ fontSize: 16 }} />} onClick={() => handleOpenDialog()}>
          Add Fee Master
        </PrimaryBtn>
      </Stack>

      {/* ── Summary Strips ── */}
      <Grid container spacing={1.5} mb={2.5}>
        {[
          ['Total Records', feeMastersPagination.total || 0, undefined, T.p500, 0],
          ['Total Amount', fmt(totalAmount), 'across all fee masters', T.success, 0.06],
          ['With Fine', withFine, `of ${feeMasters.length} shown`, T.warning, 0.12],
          ['Showing', feeMasters.length, `Page ${feeMastersPagination.page || 1}`, T.info || '#0284C7', 0.18],
        ].map(([label, val, sub, color, delay]) => (
          <Grid key={label} item xs={6} sm={3}>
            <SummaryCard label={label} value={val} sub={sub} color={color} delay={delay} />
          </Grid>
        ))}
      </Grid>

      {/* ── Filters ── */}
      <Surface elevation={0} sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
          <FilterAltIcon sx={{ fontSize: 16, color: T.p500 }} />
          <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: T.p600, letterSpacing: 0.4, textTransform: 'uppercase' }}>Filters</Typography>
        </Stack>
        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={4}>
            <FieldInput select fullWidth size="small" label="Fees Group" value={filters.feesGroup} onChange={e => handleFilterChange('feesGroup', e.target.value)}>
              <MenuItem value="" sx={{ fontSize: '0.76rem' }}>All Groups</MenuItem>
              {feeGroups.map(g => <MenuItem key={g} value={g} sx={{ fontSize: '0.76rem' }}>{g}</MenuItem>)}
            </FieldInput>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FieldInput select fullWidth size="small" label="Class" value={filters.classId} onChange={e => handleFilterChange('classId', e.target.value)}>
              <MenuItem value="" sx={{ fontSize: '0.76rem' }}>All Classes</MenuItem>
              {classes.map(c => <MenuItem key={c._id} value={c._id} sx={{ fontSize: '0.76rem' }}>{c.class_text}</MenuItem>)}
            </FieldInput>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FieldInput fullWidth size="small" placeholder="Search by group or code…" value={filters.search} onChange={e => handleFilterChange('search', e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: T.n400 }} /></InputAdornment> }} />
          </Grid>
        </Grid>
      </Surface>

      {/* ── Table Card ── */}
      <Surface elevation={0} sx={{ overflow: 'hidden' }}>
        <Box sx={{ px: 2, py: 1.25, borderBottom: `1px solid ${alpha(T.p500, 0.09)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: T.p600, letterSpacing: 0.4, textTransform: 'uppercase' }}>Fee Masters List</Typography>
          <Tooltip title="Refresh">
            <GhostBtn size="small" onClick={() => dispatch(getAllFeeMasters(filters))}>
              <RefreshIcon sx={{ fontSize: 16 }} />
            </GhostBtn>
          </Tooltip>
        </Box>

        {feeMastersLoading && feeMasters.length === 0 ? (
          <Box sx={{ p: 5, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={30} sx={{ color: T.p500 }} />
          </Box>
        ) : feeMasters.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: T.p100, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5 }}>
              <LayersIcon sx={{ fontSize: 24, color: T.p300 }} />
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: T.n600, mb: 0.5 }}>No fee masters found</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: T.n400 }}>Click "Add Fee Master" to create a new fee structure</Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(T.p500, 0.03) }}>
                    {['Fees Group', 'Fees Code', 'Class / Section', 'Category', 'Amount', 'Due Date', 'Fine', 'Actions'].map((h, i) => (
                      <TableCell key={h} align={i === 4 ? 'right' : i === 7 ? 'center' : 'left'}
                        sx={{ fontWeight: 700, fontSize: '0.62rem', color: T.n500, py: 1.1, letterSpacing: 0.5, textTransform: 'uppercase', borderBottom: `1px solid ${alpha(T.p500, 0.09)}`, whiteSpace: 'nowrap' }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feeMasters.map((fm, i) => (
                    <TableRow key={fm._id} hover
                      sx={{ '&:hover': { bgcolor: alpha(T.p500, 0.025) }, animation: `${fadeUp} 0.22s ease ${i * 0.025}s both`, borderBottom: `1px solid ${alpha(T.n300, 0.45)}` }}>
                      <TableCell sx={{ py: 1.1 }}>
                        <Chip label={fm.feesGroup} size="small"
                          sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: alpha(T.p500, 0.1), color: T.p600, border: `1px solid ${alpha(T.p500, 0.2)}` }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', py: 1.1, fontWeight: 600, color: T.p600 }}>{fm.feesCode}</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem', py: 1.1, color: T.n700 }}>
                        {fm.class?.class_text ? (
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 600 }}>{fm.class.class_text}</Typography>
                            {fm.section && <Chip label={fm.section} size="small" sx={{ height: 17, fontSize: '0.6rem', fontWeight: 600, bgcolor: T.p100, color: T.p700 }} />}
                          </Stack>
                        ) : <Typography sx={{ fontSize: '0.7rem', color: T.n400 }}>All Classes</Typography>}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.72rem', py: 1.1, color: T.n600 }}>{fm.category || <Typography sx={{ fontSize: '0.7rem', color: T.n400 }}>—</Typography>}</TableCell>
                      <TableCell align="right" sx={{ fontSize: '0.75rem', py: 1.1, fontWeight: 700, color: T.n900 }}>{fmt(fm.amount)}</TableCell>
                      <TableCell sx={{ fontSize: '0.72rem', py: 1.1, color: T.n600 }}>{fmtDate(fm.dueDate)}</TableCell>
                      <TableCell sx={{ py: 1.1 }}><FineBadge type={fm.fineType} pct={fm.finePercentage} amt={fm.fineAmount} /></TableCell>
                      <TableCell align="center" sx={{ py: 1.1 }}>
                        <Stack direction="row" spacing={0.4} justifyContent="center">
                          <Tooltip title="Assign to Students">
                            <IconButton size="small" onClick={() => setAssignConfirm(fm)}
                              sx={{ bgcolor: alpha(T.success, 0.08), color: T.success, borderRadius: 1.5, p: 0.5, '&:hover': { bgcolor: alpha(T.success, 0.16) } }}>
                              <AssignmentIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleOpenDialog(fm)}
                              sx={{ bgcolor: alpha(T.p500, 0.08), color: T.p500, borderRadius: 1.5, p: 0.5, '&:hover': { bgcolor: alpha(T.p500, 0.16) } }}>
                              <EditIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => setDeleteConfirm(fm)}
                              sx={{ bgcolor: alpha(T.danger, 0.08), color: T.danger, borderRadius: 1.5, p: 0.5, '&:hover': { bgcolor: alpha(T.danger, 0.16) } }}>
                              <DeleteIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ px: 2, py: 0.5, borderTop: `1px solid ${alpha(T.p500, 0.09)}`, bgcolor: alpha(T.p50, 0.5), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.68rem', color: T.n500 }}>
                {((feeMastersPagination.page - 1) * feeMastersPagination.limit) + 1}–{Math.min(feeMastersPagination.page * feeMastersPagination.limit, feeMastersPagination.total)} of {feeMastersPagination.total} records
              </Typography>
              <TablePagination component="div"
                count={feeMastersPagination.total} page={feeMastersPagination.page - 1}
                onPageChange={(_, p) => handleFilterChange('page', p + 1)}
                rowsPerPage={feeMastersPagination.limit}
                onRowsPerPageChange={e => handleFilterChange('limit', parseInt(e.target.value, 10))}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={{ '& *': { fontSize: '0.7rem !important' }, '& .MuiTablePagination-toolbar': { minHeight: 40 } }} />
            </Box>
          </>
        )}
      </Surface>

      {/* ── Add/Edit Dialog ── */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <DialogTitle sx={{ background: `linear-gradient(135deg, ${T.p500} 0%, ${T.p700} 100%)`, color: T.white, py: 1.75 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{editMode ? 'Edit Fee Master' : 'Add Fee Master'}</Typography>
              <Typography sx={{ fontSize: '0.68rem', opacity: 0.82 }}>Fill in the fee structure details below</Typography>
            </Box>
            <IconButton size="small" onClick={handleCloseDialog} sx={{ color: T.white, p: 0.5, '&:hover': { bgcolor: alpha(T.white, 0.15) } }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 2.5 }}>
          <Grid container spacing={1.75}>
            {/* Row 1 */}
            <Grid item xs={12} md={6}>
              <FieldInput select fullWidth size="small" label="Fees Group *" value={formData.feesGroup}
                onChange={e => handleFormChange('feesGroup', e.target.value)}
                helperText={feeGroupsPaginated.length === 0 ? 'No fee groups found — create one first' : ''}>
                <MenuItem value="" sx={{ fontSize: '0.76rem' }}>Select Fees Group</MenuItem>
                {feeGroupsPaginated.map(g => <MenuItem key={g._id} value={g.name} sx={{ fontSize: '0.76rem' }}>{g.name}</MenuItem>)}
              </FieldInput>
            </Grid>
            <Grid item xs={12} md={6}>
              <FieldInput select fullWidth size="small" label="Fees Code *" value={formData.feesCode}
                onChange={e => handleFormChange('feesCode', e.target.value)}
                helperText={feeTypesPaginated.length === 0 ? 'No fee types found — create one first' : ''}>
                <MenuItem value="" sx={{ fontSize: '0.76rem' }}>Select Fees Code</MenuItem>
                {feeTypesPaginated.map(t => <MenuItem key={t._id} value={t.name} sx={{ fontSize: '0.76rem' }}>{t.name} ({t.feeCode})</MenuItem>)}
              </FieldInput>
            </Grid>

            {/* Row 2 */}
            <Grid item xs={12} md={6}>
              <FieldInput fullWidth size="small" type="number" label="Amount (₹) *" value={formData.amount} onChange={e => handleFormChange('amount', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FieldInput fullWidth size="small" type="date" label="Due Date" value={formData.dueDate}
                onChange={e => handleFormChange('dueDate', e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>

            {/* Row 3 */}
            <Grid item xs={12} md={6}>
              <FieldInput select fullWidth size="small" label="Class" value={formData.classId} onChange={e => handleFormChange('classId', e.target.value)}>
                <MenuItem value="" sx={{ fontSize: '0.76rem' }}>All Classes</MenuItem>
                {classes.map(c => <MenuItem key={c._id} value={c._id} sx={{ fontSize: '0.76rem' }}>{c.class_text}</MenuItem>)}
              </FieldInput>
            </Grid>
            <Grid item xs={12} md={6}>
              <FieldInput select fullWidth size="small" label="Section" value={formData.section}
                onChange={e => handleFormChange('section', e.target.value)} disabled={!formData.classId}
                helperText={!formData.classId ? 'Select a class first' : sections.length === 0 ? 'No sections available' : `${sections.length} section(s) available`}>
                <MenuItem value="" sx={{ fontSize: '0.76rem' }}>All Sections</MenuItem>
                {sections.map(s => <MenuItem key={s} value={s} sx={{ fontSize: '0.76rem' }}>{s}</MenuItem>)}
              </FieldInput>
            </Grid>

            {/* Category */}
            <Grid item xs={12} md={6}>
              <FieldInput select fullWidth size="small" label="Category" value={formData.category} onChange={e => handleFormChange('category', e.target.value)}>
                <MenuItem value="" sx={{ fontSize: '0.76rem' }}>All Categories</MenuItem>
                {['General', 'OBC', 'SC', 'ST', 'EWS', 'RTE'].map(c => <MenuItem key={c} value={c} sx={{ fontSize: '0.76rem' }}>{c}</MenuItem>)}
              </FieldInput>
            </Grid>

            {/* Fine Section */}
            <Grid item xs={12}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(T.warning, 0.04), border: `1px solid ${alpha(T.warning, 0.15)}` }}>
                <FormControl component="fieldset">
                  <FormLabel sx={{ fontSize: '0.72rem', fontWeight: 700, color: T.warning, textTransform: 'uppercase', letterSpacing: 0.4, mb: 0.75 }}>
                    Fine Configuration
                  </FormLabel>
                  <RadioGroup row value={formData.fineType} onChange={e => handleFormChange('fineType', e.target.value)}>
                    {['None', 'Percentage', 'Fix Amount'].map(opt => (
                      <FormControlLabel key={opt} value={opt}
                        control={<Radio size="small" sx={{ color: T.p400, '&.Mui-checked': { color: T.p500 }, p: 0.4 }} />}
                        label={<Typography sx={{ fontSize: '0.75rem' }}>{opt}</Typography>} sx={{ mr: 2 }} />
                    ))}
                  </RadioGroup>
                </FormControl>

                {formData.fineType === 'Percentage' && (
                  <Box sx={{ mt: 1.25 }}>
                    <FieldInput fullWidth size="small" type="number" label="Fine Percentage (%)" value={formData.finePercentage} onChange={e => handleFormChange('finePercentage', e.target.value)} />
                  </Box>
                )}
                {formData.fineType === 'Fix Amount' && (
                  <Box sx={{ mt: 1.25 }}>
                    <FieldInput fullWidth size="small" type="number" label="Fine Amount (₹)" value={formData.fineAmount} onChange={e => handleFormChange('fineAmount', e.target.value)} />
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 2.5, py: 1.75, borderTop: `1px solid ${alpha(T.p500, 0.1)}`, bgcolor: alpha(T.p50, 0.5) }}>
          <Button onClick={handleCloseDialog} sx={{ textTransform: 'none', fontSize: '0.76rem', color: T.n600, fontWeight: 600 }}>Cancel</Button>
          <PrimaryBtn onClick={handleSubmit} disabled={submitLoading} sx={{ minWidth: 88 }}>
            {submitLoading ? <CircularProgress size={16} color="inherit" /> : editMode ? 'Update' : 'Save'}
          </PrimaryBtn>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1, pt: 2, px: 2.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: T.danger }}>Delete Fee Master</Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 2.5 }}>
          <Alert severity="error" sx={{ fontSize: '0.75rem', py: 0.75, mb: 1.5 }}>This action cannot be undone.</Alert>
          {deleteConfirm && (
            <Box sx={{ p: 1.5, bgcolor: T.n50, borderRadius: 2 }}>
              <Typography sx={{ fontSize: '0.75rem', color: T.n700 }}>
                Delete <strong>{deleteConfirm.feesGroup} — {deleteConfirm.feesCode}</strong> ({fmt(deleteConfirm.amount)})?
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.75 }}>
          <Button onClick={() => setDeleteConfirm(null)} sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained" onClick={handleDeleteConfirm}
            sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, bgcolor: T.danger, '&:hover': { bgcolor: '#B91C1C' }, borderRadius: 2 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Assign Confirm Dialog ── */}
      <Dialog open={!!assignConfirm} onClose={() => setAssignConfirm(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1, pt: 2, px: 2.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: T.success }}>Assign Fee to Students</Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 2.5 }}>
          {assignConfirm && (
            <Stack spacing={1}>
              <Box sx={{ p: 1.5, bgcolor: alpha(T.success, 0.05), borderRadius: 2, border: `1px solid ${alpha(T.success, 0.2)}` }}>
                <Typography sx={{ fontSize: '0.72rem', color: T.n700, mb: 0.5 }}>Fee: <strong>{assignConfirm.feesGroup} — {assignConfirm.feesCode}</strong></Typography>
                <Typography sx={{ fontSize: '0.72rem', color: T.n700, mb: 0.5 }}>Amount: <strong>{fmt(assignConfirm.amount)}</strong></Typography>
                <Typography sx={{ fontSize: '0.72rem', color: T.n700 }}>Target: <strong>{assignConfirm.class ? `${assignConfirm.class.class_text}${assignConfirm.section ? ` - ${assignConfirm.section}` : ''}` : 'All Classes'}</strong></Typography>
              </Box>
              <Typography sx={{ fontSize: '0.72rem', color: T.n500 }}>
                This will assign the fee to all matching students. Existing assignments will not be duplicated.
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, py: 1.75 }}>
          <Button onClick={() => setAssignConfirm(null)} sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignConfirm}
            sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, bgcolor: T.success, '&:hover': { bgcolor: '#047857' }, borderRadius: 2 }}>
            Confirm Assign
          </Button>
        </DialogActions>
      </Dialog>

      <CustomizedSnackbars open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))} />
    </Root>
  );
};

export default FeesMaster;