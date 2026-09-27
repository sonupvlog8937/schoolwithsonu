import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Paper, Typography, TextField, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  InputAdornment, CircularProgress, Alert,
} from '@mui/material';
import {
  Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon,
  Save as SaveIcon, Add as AddIcon, Block as BlockIcon,
} from '@mui/icons-material';
import {
  fetchDisableReasons, addDisableReason, updateDisableReason, deleteDisableReason,
  clearSettingsMessages,
} from '../../../state/studentSettingsSlice';
import CustomizedSnackbars from '../../../basic utility components/CustomizedSnackbars';

const DisableReason = () => {
  const dispatch = useDispatch();
  const { disableReasons, loading, submitLoading, error, successMsg } = useSelector(s => s.studentSettings);

  const [reason, setReason] = useState('');
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => { dispatch(fetchDisableReasons()); }, [dispatch]);

  useEffect(() => {
    if (error) { setSnackbar({ open: true, message: error, severity: 'error' }); dispatch(clearSettingsMessages()); }
    if (successMsg) { setSnackbar({ open: true, message: successMsg, severity: 'success' }); dispatch(clearSettingsMessages()); setReason(''); setEditId(null); }
  }, [error, successMsg, dispatch]);

  const handleSearch = (val) => { setSearch(val); dispatch(fetchDisableReasons(val)); };

  const handleSubmit = () => {
    if (!reason.trim()) return;
    if (editId) dispatch(updateDisableReason({ id: editId, reason }));
    else dispatch(addDisableReason(reason));
  };

  const handleEdit = (item) => { setEditId(item._id); setReason(item.reason); };
  const handleDelete = (id) => { if (window.confirm('Delete this disable reason?')) dispatch(deleteDisableReason(id)); };
  const handleCancel = () => { setEditId(null); setReason(''); };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <BlockIcon sx={{ color: '#6a1b9a', fontSize: 28 }} />
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#6a1b9a' }}>
          Disable Reason
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Form */}
        <Paper sx={{ p: 3, width: { xs: '100%', md: 320 }, flexShrink: 0, borderTop: '3px solid #6a1b9a', height: 'fit-content' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#6a1b9a' }}>
            {editId ? 'Edit Disable Reason' : 'Add Disable Reason'}
          </Typography>
          <TextField
            fullWidth label="Disable Reason *" value={reason}
            onChange={e => setReason(e.target.value)}
            size="small" sx={{ mb: 2 }}
            inputProps={{ style: { fontSize: '0.875rem' } }}
            InputLabelProps={{ style: { fontSize: '0.875rem' } }}
            onKeyPress={e => e.key === 'Enter' && handleSubmit()}
          />
          {error && <Alert severity="error" sx={{ mb: 2, fontSize: '0.813rem' }}>{error}</Alert>}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained" onClick={handleSubmit}
              disabled={submitLoading || !reason.trim()}
              startIcon={editId ? <SaveIcon /> : <AddIcon />}
              sx={{ textTransform: 'none', backgroundColor: '#6a1b9a', '&:hover': { backgroundColor: '#4a148c' }, fontSize: '0.813rem' }}
            >
              {submitLoading ? <CircularProgress size={16} color="inherit" /> : editId ? 'Update' : 'Save'}
            </Button>
            {editId && (
              <Button variant="outlined" onClick={handleCancel} sx={{ textTransform: 'none', borderColor: '#6a1b9a', color: '#6a1b9a', fontSize: '0.813rem' }}>
                Cancel
              </Button>
            )}
          </Box>
        </Paper>

        {/* List */}
        <Paper sx={{ flex: 1, borderTop: '3px solid #6a1b9a' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#6a1b9a' }}>Disable Reason List</Typography>
            <TextField
              size="small" placeholder="Search..."
              value={search} onChange={e => handleSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: '#999' }} /></InputAdornment> }}
              sx={{ width: 200, '& .MuiOutlinedInput-root': { fontSize: '0.813rem' } }}
            />
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f3e5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#6a1b9a', fontSize: '0.813rem' }}>Disable Reason</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#6a1b9a', fontSize: '0.813rem' }} align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={2} align="center" sx={{ py: 4 }}><CircularProgress size={24} sx={{ color: '#6a1b9a' }} /></TableCell></TableRow>
                ) : disableReasons.length === 0 ? (
                  <TableRow><TableCell colSpan={2} align="center" sx={{ py: 4, color: '#999', fontSize: '0.875rem' }}>No disable reasons found</TableCell></TableRow>
                ) : disableReasons.map(item => (
                  <TableRow key={item._id} hover sx={{ '&:hover': { backgroundColor: '#faf5ff' } }}>
                    <TableCell sx={{ fontSize: '0.875rem' }}>{item.reason}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleEdit(item)} sx={{ color: '#6a1b9a', mr: 0.5 }}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(item._id)} sx={{ color: '#d32f2f' }}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ p: 1.5, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="caption" sx={{ color: '#666' }}>Records: {disableReasons.length}</Typography>
          </Box>
        </Paper>
      </Box>

      {snackbar.open && (
        <CustomizedSnackbars type={snackbar.severity} message={snackbar.message} reset={() => setSnackbar({ ...snackbar, open: false })} />
      )}
    </Box>
  );
};

export default DisableReason;
