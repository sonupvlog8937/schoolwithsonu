import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  DeleteSweep as DeleteSweepIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { fetchStudents, fetchDropdownOptions } from '../../../state/studentAdmissionSlice';
import {
  bulkDeleteStudents,
  checkBulkDeleteStatus,
  clearMessages,
} from '../../../state/studentManagementSlice';
import CustomizedSnackbars from '../../../basic utility components/CustomizedSnackbars';

const StudentBulkDelete = () => {
  const dispatch = useDispatch();
  const { students, dropdownOptions, loading } = useSelector((state) => state.studentAdmission);
  const {
    bulkDeleteDisabled,
    bulkDeleteLoading,
    error,
    successMsg,
  } = useSelector((state) => state.studentManagement);

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchDropdownOptions());
    dispatch(checkBulkDeleteStatus());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchStudents({
        search: searchInput,
        class: classFilter,
        section: sectionFilter,
        page,
        limit: rowsPerPage,
      })
    );
  }, [dispatch, searchInput, classFilter, sectionFilter, page, rowsPerPage]);

  useEffect(() => {
    if (error) {
      setSnackbar({ open: true, message: error, severity: 'error' });
      dispatch(clearMessages());
    }
    if (successMsg) {
      setSnackbar({ open: true, message: successMsg, severity: 'success' });
      dispatch(clearMessages());
      setSelectedStudents([]);
      setConfirmDialog(false);
      dispatch(
        fetchStudents({
          search: searchInput,
          class: classFilter,
          section: sectionFilter,
          page,
          limit: rowsPerPage,
        })
      );
    }
  }, [error, successMsg, dispatch, searchInput, classFilter, sectionFilter, page, rowsPerPage]);

  const { students: studentsData, pagination } = useSelector((state) => state.studentAdmission);
  const filteredStudents = studentsData || [];

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedStudents(filteredStudents.map((s) => s._id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (bulkDeleteDisabled) {
      setSnackbar({
        open: true,
        message: 'Bulk delete is currently disabled by administrator',
        severity: 'error',
      });
      return;
    }
    dispatch(bulkDeleteStudents(selectedStudents));
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage + 1);
    setSelectedStudents([]);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
    setSelectedStudents([]);
  };

  const handleSearchSubmit = () => {
    setPage(1);
    setSelectedStudents([]);
  };

  const isAllSelected = filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length;
  const isIndeterminate = selectedStudents.length > 0 && selectedStudents.length < filteredStudents.length;

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteSweepIcon sx={{ color: '#6a1b9a', fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#6a1b9a' }}>
            Student Bulk Delete
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setConfirmDialog(true)}
          disabled={selectedStudents.length === 0 || bulkDeleteDisabled}
          sx={{ textTransform: 'none', px: 3 }}
        >
          Delete Selected ({selectedStudents.length})
        </Button>
      </Box>

      {bulkDeleteDisabled && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon />
            <Typography variant="body2">
              Bulk delete functionality is currently disabled by the administrator. Please contact admin to enable this feature.
            </Typography>
          </Box>
        </Alert>
      )}

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 2, borderTop: '3px solid #6a1b9a' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by name or admission no..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#6a1b9a' }} />
                </InputAdornment>
              ),
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
          />
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{
              borderColor: '#6a1b9a',
              color: '#6a1b9a',
              textTransform: 'none',
            }}
          >
            Filters
          </Button>
        </Box>

        {showFilters && (
          <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Class</InputLabel>
              <Select
                value={classFilter}
                label="Class"
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <MenuItem value="">All Classes</MenuItem>
                {dropdownOptions.classes?.map((cls) => (
                  <MenuItem key={cls._id} value={cls._id}>
                    {cls.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Section</InputLabel>
              <Select
                value={sectionFilter}
                label="Section"
                onChange={(e) => setSectionFilter(e.target.value)}
              >
                <MenuItem value="">All Sections</MenuItem>
                {['A', 'B', 'C', 'D', 'E'].map((s) => (
                  <MenuItem key={s} value={s}>
                    Section {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="text"
              onClick={() => {
                setClassFilter('');
                setSectionFilter('');
                setSearchInput('');
              }}
              sx={{ color: '#6a1b9a', textTransform: 'none' }}
            >
              Clear Filters
            </Button>
          </Box>
        )}
      </Paper>

      {/* Table */}
      <Paper sx={{ borderTop: '3px solid #6a1b9a' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f3e5f5' }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={handleSelectAll}
                    disabled={bulkDeleteDisabled}
                    sx={{
                      color: '#6a1b9a',
                      '&.Mui-checked': { color: '#6a1b9a' },
                      '&.MuiCheckbox-indeterminate': { color: '#6a1b9a' },
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6a1b9a', fontSize: '0.813rem' }}>
                  Photo
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6a1b9a', fontSize: '0.813rem' }}>
                  Admission No
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6a1b9a', fontSize: '0.813rem' }}>
                  Student Name
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6a1b9a', fontSize: '0.813rem' }}>
                  Class
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6a1b9a', fontSize: '0.813rem' }}>
                  Section
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6a1b9a', fontSize: '0.813rem' }}>
                  Gender
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6a1b9a', fontSize: '0.813rem' }}>
                  Mobile
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <CircularProgress sx={{ color: '#6a1b9a' }} />
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <Typography variant="body1" color="textSecondary">
                      No students found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow
                    key={student._id}
                    hover
                    selected={selectedStudents.includes(student._id)}
                    sx={{ '&:hover': { backgroundColor: '#f9f5fb' } }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedStudents.includes(student._id)}
                        onChange={() => handleSelectOne(student._id)}
                        disabled={bulkDeleteDisabled}
                        sx={{
                          color: '#6a1b9a',
                          '&.Mui-checked': { color: '#6a1b9a' },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.813rem' }}>
                      <Avatar
                        src={student.photo}
                        alt={student.firstName}
                        sx={{ bgcolor: '#6a1b9a', width: 32, height: 32 }}
                      >
                        {student.firstName?.charAt(0)}
                      </Avatar>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.813rem' }}>{student.admissionNo}</TableCell>
                    <TableCell sx={{ fontSize: '0.813rem' }}>
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.813rem' }}>
                      {student.class?.class_text || '-'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.813rem' }}>
                      {student.section?.name || student.section || '-'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.813rem' }}>
                      <Chip
                        label={student.gender || '-'}
                        size="small"
                        sx={{
                          backgroundColor: student.gender === 'Male' ? '#e1bee7' : '#f3e5f5',
                          color: '#6a1b9a',
                          fontSize: '0.75rem',
                          height: '22px',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.813rem' }}>
                      {student.mobileNumber || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="caption" sx={{ color: '#666' }}>
            Total Students: {pagination?.total || 0} | Selected: {selectedStudents.length}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="caption" sx={{ color: '#666' }}>
              Rows per page:
            </Typography>
            <Select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              size="small"
              sx={{ minWidth: 70 }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
            <Typography variant="caption" sx={{ color: '#666' }}>
              Page {pagination?.page || 1} of {pagination?.pages || 1}
            </Typography>
            <Box>
              <IconButton
                onClick={(e) => handlePageChange(e, page - 2)}
                disabled={page === 1}
                size="small"
              >
                <ChevronLeftIcon />
              </IconButton>
              <IconButton
                onClick={(e) => handlePageChange(e, page)}
                disabled={page >= (pagination?.pages || 1)}
                size="small"
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon sx={{ color: '#d32f2f' }} />
            <Typography variant="h6">Confirm Bulk Delete</Typography>
          </Box>
          <IconButton onClick={() => setConfirmDialog(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Warning: This action cannot be undone!
            </Typography>
          </Alert>
          <Typography variant="body1">
            Are you sure you want to delete <strong>{selectedStudents.length}</strong> student(s)?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            All associated data including attendance, fees, and academic records will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmDialog(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleBulkDelete}
            disabled={bulkDeleteLoading}
            sx={{ textTransform: 'none' }}
          >
            {bulkDeleteLoading ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {snackbar.open && (
        <CustomizedSnackbars
          type={snackbar.severity}
          message={snackbar.message}
          reset={() => setSnackbar({ ...snackbar, open: false })}
        />
      )}
    </Box>
  );
};

export default StudentBulkDelete;
