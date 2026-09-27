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
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Alert,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  LockOutlined as DisabledIcon,
  LockOpen as EnableIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  RestartAlt as RestoreIcon,
} from '@mui/icons-material';
import {
  fetchDisabledStudents,
  enableStudent,
  clearMessages,
} from '../../../state/studentManagementSlice';
import { fetchDropdownOptions } from '../../../state/studentAdmissionSlice';
import CustomizedSnackbars from '../../../basic utility components/CustomizedSnackbars';

const DisabledStudents = () => {
  const dispatch = useDispatch();
  const {
    disabledStudents,
    disabledStudentsLoading,
    disabledStudentsPagination,
    loading,
    error,
    successMsg,
  } = useSelector((state) => state.studentManagement);
  
  const { dropdownOptions } = useSelector((state) => state.studentAdmission);

  const [searchInput, setSearchInput] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    dispatch(fetchDropdownOptions());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchDisabledStudents({
        search: searchInput,
        class: classFilter,
        page: page + 1,
        limit: rowsPerPage,
      })
    );
  }, [dispatch, searchInput, classFilter, page, rowsPerPage]);

  useEffect(() => {
    if (error) {
      setSnackbar({ open: true, message: error, severity: 'error' });
      dispatch(clearMessages());
    }
    if (successMsg) {
      setSnackbar({ open: true, message: successMsg, severity: 'success' });
      dispatch(clearMessages());
      setViewDialog(false);
      setPage(0);
      dispatch(
        fetchDisabledStudents({
          search: searchInput,
          class: classFilter,
          page: 1,
          limit: rowsPerPage,
        })
      );
    }
  }, [error, successMsg, dispatch, searchInput, classFilter, rowsPerPage]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setViewDialog(true);
  };

  const handleEnableStudent = (student) => {
    if (!window.confirm(`Are you sure you want to enable ${student.firstName} ${student.lastName}?`)) {
      return;
    }
    dispatch(enableStudent(student._id));
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <DisabledIcon sx={{ color: '#6a1b9a', fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#6a1b9a' }}>
            Disabled Students
          </Typography>
        </Box>
        <Typography variant="body2" color="textSecondary">
          Manage and restore disabled student accounts
        </Typography>
      </Box>

      {/* Info Alert */}
      {disabledStudents.length === 0 && !disabledStudentsLoading && (
        <Alert
          severity="info"
          sx={{ mb: 2, backgroundColor: '#e3f2fd', borderLeft: '4px solid #1976d2' }}
          icon={<InfoIcon />}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            No disabled students found. All students are currently active.
          </Typography>
        </Alert>
      )}

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 2, borderTop: '3px solid #6a1b9a' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by name, email, or admission no..."
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
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Class</InputLabel>
            <Select
              value={classFilter}
              label="Filter by Class"
              onChange={(e) => {
                setClassFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All Classes</MenuItem>
              {dropdownOptions.classes?.map((cls) => (
                <MenuItem key={cls._id} value={cls._id}>
                  {cls.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Table */}
      <Paper sx={{ borderTop: '3px solid #6a1b9a' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f3e5f5' }}>
              <TableRow>
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
                  Email
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6a1b9a', fontSize: '0.813rem' }}>
                  Class
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6a1b9a', fontSize: '0.813rem' }}>
                  Disable Reason
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6a1b9a', fontSize: '0.813rem' }}>
                  Disabled On
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6a1b9a', fontSize: '0.813rem' }} align="center">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {disabledStudentsLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <CircularProgress sx={{ color: '#6a1b9a' }} />
                  </TableCell>
                </TableRow>
              ) : disabledStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <Typography variant="body1" color="textSecondary">
                      No disabled students found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                disabledStudents.map((student) => (
                  <TableRow
                    key={student._id}
                    hover
                    sx={{ '&:hover': { backgroundColor: '#f9f5fb' } }}
                  >
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
                    <TableCell sx={{ fontSize: '0.813rem', fontWeight: 500 }}>
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.813rem' }}>{student.email || '-'}</TableCell>
                    <TableCell sx={{ fontSize: '0.813rem' }}>
                      {student.class?.name || student.class?.class_text || '-'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.813rem' }}>
                      <Chip
                        label={student.disableReason || 'No Reason'}
                        size="small"
                        sx={{
                          backgroundColor: '#ffebee',
                          color: '#c62828',
                          fontSize: '0.7rem',
                          height: '20px',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.813rem' }}>
                      {student.disabledAt
                        ? new Date(student.disabledAt).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewStudent(student)}
                          sx={{ color: '#6a1b9a' }}
                        >
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Enable Student">
                        <IconButton
                          size="small"
                          onClick={() => handleEnableStudent(student)}
                          disabled={loading}
                          sx={{ color: '#4caf50' }}
                        >
                          {loading ? (
                            <CircularProgress size={16} />
                          ) : (
                            <EnableIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={disabledStudentsPagination?.total || 0}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            borderTop: '1px solid #e0e0e0',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              margin: 0,
            },
          }}
        />
      </Paper>

      {/* View Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f3e5f5' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DisabledIcon sx={{ color: '#6a1b9a' }} />
            <Typography variant="h6">Disabled Student Details</Typography>
          </Box>
          <IconButton onClick={() => setViewDialog(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedStudent && (
            <Box>
              {/* Status Alert */}
              <Alert severity="warning" sx={{ mb: 3, backgroundColor: '#fff3e0', borderLeft: '4px solid #ff6f00' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Status: DISABLED
                </Typography>
                <Typography variant="caption">
                  Disabled on: {selectedStudent.disabledAt ? new Date(selectedStudent.disabledAt).toLocaleString() : '-'}
                </Typography>
              </Alert>

              {/* Student Photo */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Avatar
                  src={selectedStudent.photo}
                  alt={selectedStudent.firstName}
                  sx={{ width: 100, height: 100, bgcolor: '#6a1b9a' }}
                >
                  {selectedStudent.firstName?.charAt(0)}
                </Avatar>
              </Box>

              {/* Details Grid */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                    Admission No
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {selectedStudent.admissionNo}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                    First Name
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {selectedStudent.firstName}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                    Last Name
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {selectedStudent.lastName}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                    Email
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {selectedStudent.email || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                    Class
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {selectedStudent.class?.name || selectedStudent.class?.class_text || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                    Section
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {selectedStudent.section?.name || '-'}
                  </Typography>
                </Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                    Disable Reason
                  </Typography>
                  <Box
                    sx={{
                      mt: 0.5,
                      p: 1.5,
                      backgroundColor: '#ffebee',
                      borderLeft: '3px solid #c62828',
                      borderRadius: '4px',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#c62828' }}>
                      {selectedStudent.disableReason || 'No reason provided'}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                    Date of Birth
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {selectedStudent.dateOfBirth
                      ? new Date(selectedStudent.dateOfBirth).toLocaleDateString()
                      : '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                    Gender
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {selectedStudent.gender || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                    Mobile
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                    {selectedStudent.mobileNumber || '-'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<RestoreIcon />}
            onClick={() => handleEnableStudent(selectedStudent)}
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Enable Student'}
          </Button>
          <Button
            onClick={() => setViewDialog(false)}
            sx={{ textTransform: 'none' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default DisabledStudents;
