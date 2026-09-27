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
  Checkbox,
  FormControlLabel,
  TablePagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  GroupAdd as GroupAddIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { fetchStudents, fetchDropdownOptions } from '../../../state/studentAdmissionSlice';
import {
  updateAdditionalClasses,
  checkMultiClassStatus,
  clearMessages,
} from '../../../state/studentManagementSlice';
import CustomizedSnackbars from '../../../basic utility components/CustomizedSnackbars';

const MultiClassStudent = () => {
  const dispatch = useDispatch();
  const { students, dropdownOptions, loading } = useSelector((state) => state.studentAdmission);
  const {
    multiClassDisabled,
    multiClassLoading,
    error,
    successMsg,
  } = useSelector((state) => state.studentManagement);

  const [searchInput, setSearchInput] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [assignDialog, setAssignDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [additionalClasses, setAdditionalClasses] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchDropdownOptions());
    dispatch(checkMultiClassStatus());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchStudents({
        search: searchInput,
        class: classFilter,
        page,
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
      setAssignDialog(false);
      dispatch(
        fetchStudents({
          search: searchInput,
          class: classFilter,
          page,
          limit: rowsPerPage,
        })
      );
    }
  }, [error, successMsg, dispatch, searchInput, classFilter, page, rowsPerPage]);

  const { students: studentsData, pagination } = useSelector((state) => state.studentAdmission);
  const filteredStudents = studentsData || [];

  const handleOpenAssignDialog = (student) => {
    if (multiClassDisabled) {
      setSnackbar({
        open: true,
        message: 'Multi-class assignment is currently disabled by administrator',
        severity: 'error',
      });
      return;
    }
    setSelectedStudent(student);
    setAdditionalClasses(student.additionalClasses || []);
    setAssignDialog(true);
  };

  const handleClassToggle = (classId) => {
    setAdditionalClasses((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  const handleSubmit = () => {
    dispatch(
      updateAdditionalClasses({
        studentId: selectedStudent._id,
        additionalClasses,
      })
    );
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleSearchSubmit = () => {
    setPage(1);
  };

  const availableClasses = dropdownOptions.classes?.filter(
    (cls) => cls._id !== selectedStudent?.class?._id
  ) || [];

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <GroupAddIcon sx={{ color: '#6a1b9a', fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#6a1b9a' }}>
            Multi Class Student
          </Typography>
        </Box>
        <Typography variant="body2" color="textSecondary">
          Assign students to multiple classes for cross-class subjects or activities
        </Typography>
      </Box>

      {multiClassDisabled && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon />
            <Typography variant="body2">
              Multi-class assignment is currently disabled by the administrator. Please contact admin to enable this feature.
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
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Class</InputLabel>
            <Select
              value={classFilter}
              label="Filter by Class"
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
                  Primary Class
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6a1b9a', fontSize: '0.813rem' }}>
                  Section
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6a1b9a', fontSize: '0.813rem' }}>
                  Additional Classes
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6a1b9a', fontSize: '0.813rem' }} align="center">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <CircularProgress sx={{ color: '#6a1b9a' }} />
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
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
                      {student.additionalClasses && student.additionalClasses.length > 0 ? (
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {student.additionalClasses.map((cls, idx) => (
                            <Chip
                              key={idx}
                              label={cls.name || cls}
                              size="small"
                              sx={{
                                backgroundColor: '#e1bee7',
                                color: '#6a1b9a',
                                fontSize: '0.7rem',
                                height: '20px',
                              }}
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="textSecondary">
                          None
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<SchoolIcon />}
                        onClick={() => handleOpenAssignDialog(student)}
                        disabled={multiClassDisabled}
                        sx={{
                          borderColor: '#6a1b9a',
                          color: '#6a1b9a',
                          textTransform: 'none',
                          fontSize: '0.75rem',
                          '&:hover': { borderColor: '#4a148c', backgroundColor: '#f3e5f5' },
                        }}
                      >
                        Assign Classes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={pagination?.total || 0}
          page={page - 1}
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

      {/* Assign Dialog */}
      <Dialog open={assignDialog} onClose={() => setAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupAddIcon sx={{ color: '#6a1b9a' }} />
            <Typography variant="h6">Assign Additional Classes</Typography>
          </Box>
          <IconButton onClick={() => setAssignDialog(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <>
              <Box sx={{ mb: 3, p: 2, backgroundColor: '#f3e5f5', borderRadius: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Student
                </Typography>
                <Typography variant="h6" sx={{ color: '#6a1b9a' }}>
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Primary Class: <strong>{selectedStudent.class?.class_text}</strong> | Section:{' '}
                  <strong>{selectedStudent.section?.name || selectedStudent.section}</strong>
                </Typography>
              </Box>

              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Select Additional Classes:
              </Typography>

              {availableClasses.length === 0 ? (
                <Alert severity="info">No other classes available</Alert>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {availableClasses.map((cls) => (
                    <FormControlLabel
                      key={cls._id}
                      control={
                        <Checkbox
                          checked={additionalClasses.includes(cls._id)}
                          onChange={() => handleClassToggle(cls._id)}
                          sx={{
                            color: '#6a1b9a',
                            '&.Mui-checked': { color: '#6a1b9a' },
                          }}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {cls.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {cls.class_text}
                          </Typography>
                        </Box>
                      }
                    />
                  ))}
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAssignDialog(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={multiClassLoading}
            sx={{
              textTransform: 'none',
              backgroundColor: '#6a1b9a',
              '&:hover': { backgroundColor: '#4a148c' },
            }}
          >
            {multiClassLoading ? <CircularProgress size={20} color="inherit" /> : 'Save'}
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

export default MultiClassStudent;
