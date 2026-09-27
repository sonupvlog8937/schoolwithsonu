import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Paper, Typography, TextField, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  InputAdornment, Chip, CircularProgress, Alert,
} from '@mui/material';
import {
  Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon,
  Save as SaveIcon, Add as AddIcon, Home as HouseIcon,
} from '@mui/icons-material';
import {
  fetchHouses, addHouse, updateHouse, deleteHouse,
  clearSettingsMessages,
} from '../../../state/studentSettingsSlice';
import CustomizedSnackbars from '../../../basic utility components/CustomizedSnackbars';

const StudentHouse = () => {
  const dispatch = useDispatch();
  const { houses, loading, submitLoading, error, successMsg } = useSelector(s => s.studentSettings);

  const [form, setForm] = useState({ name: '', description: '' });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => { dispatch(fetchHouses()); }, [dispatch]);

  useEffect(() => {
    if (error) { setSnackbar({ open: true, message: error, severity: 'error' }); dispatch(clearSettingsMessages()); }
    if (successMsg) { setSnackbar({ open: true, message: successMsg, severity: 'success' }); dispatch(clearSettingsMessages()); setForm({ name: '', description: '' }); setEditId(null); }
  }, [error, successMsg, dispatch]);

  const handleSearch = (val) => { setSearch(val); dispatch(fetchHouses(val)); };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editId) dispatch(updateHouse({ id: editId, ...form }));
    else dispatch(addHouse(form));
  };

  const handleEdit = (house) => { setEditId(house._id); setForm({ name: house.name, description: house.description || '' }); };
  const handleDelete = (id) => { if (window.confirm('Delete this house?')) dispatch(deleteHouse(id)); };
  const handleCancel = () => { setEditId(null); setForm({ name: '', description: '' }); };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <HouseIcon sx={{ color: '#6a1b9a', fontSize: 28 }} />
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#6a1b9a' }}>
          Student House
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Form */}
        <Paper sx={{ p: 3, width: { xs: '100%', md: 320 }, flexShrink: 0, borderTop: '3px solid #6a1b9a', height: 'fit-content' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#6a1b9a' }}>
            {editId ? 'Edit School House' : 'Add School House'}
          </Typography>
          <TextField
            fullWidth label="Name *" value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            size="small" sx={{ mb: 2 }}
            inputProps={{ style: { fontSize: '0.875rem' } }}
            InputLabelProps={{ style: { fontSize: '0.875rem' } }}
          />
          <TextField
            fullWidth label="Description" value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            size="small" multiline rows={3} sx={{ mb: 2 }}
            inputProps={{ style: { fontSize: '0.875rem' } }}
            InputLabelProps={{ style: { fontSize: '0.875rem' } }}
          />
          {error && <Alert severity="error" sx={{ mb: 2, fontSize: '0.813rem' }}>{error}</Alert>}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained" onClick={handleSubmit}
              disabled={submitLoading || !form.name.trim()}
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
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#6a1b9a' }}>Student House List</Typography>
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
                  <TableCell sx={{ fontWeight: 600, color: '#6a1b9a', fontSize: '0.813rem' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#6a1b9a', fontSize: '0.813rem' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#6a1b9a', fontSize: '0.813rem' }}>House ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#6a1b9a', fontSize: '0.813rem' }} align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}><CircularProgress size={24} sx={{ color: '#6a1b9a' }} /></TableCell></TableRow>
                ) : houses.length === 0 ? (
                  <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: '#999', fontSize: '0.875rem' }}>No houses found</TableCell></TableRow>
                ) : houses.map(house => (
                  <TableRow key={house._id} hover sx={{ '&:hover': { backgroundColor: '#faf5ff' } }}>
                    <TableCell sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{house.name}</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem', color: '#666' }}>{house.description || '-'}</TableCell>
                    <TableCell>
                      <Chip label={house.houseId} size="small" sx={{ backgroundColor: '#e8eaf6', color: '#3f51b5', fontSize: '0.75rem', height: 22 }} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleEdit(house)} sx={{ color: '#6a1b9a', mr: 0.5 }}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(house._id)} sx={{ color: '#d32f2f' }}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ p: 1.5, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="caption" sx={{ color: '#666' }}>Records: {houses.length}</Typography>
          </Box>
        </Paper>
      </Box>

      {snackbar.open && (
        <CustomizedSnackbars type={snackbar.severity} message={snackbar.message} reset={() => setSnackbar({ ...snackbar, open: false })} />
      )}
    </Box>
  );
};

export default StudentHouse;
