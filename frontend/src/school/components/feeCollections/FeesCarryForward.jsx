import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Checkbox,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Alert,
  Divider,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  PendingActions as PendingActionsIcon,
  Done as DoneIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import {
  getPendingStudents,
  createCarryForward,
  getCarryForwardRecords,
  updateCarryForward,
  deleteCarryForward,
  processCarryForward,
  getCarryForwardSummary,
  setFilters,
  resetFilters,
  clearError,
  updateStudentBalance,
  saveStudentBalance
} from '../../../state/feeCarryForwardSlice';
import { getAllClasses } from '../../../state/feeCollectionSlice';
import CustomizedSnackbars from '../../../basic utility components/CustomizedSnackbars';
import NoData from '../../../basic utility components/NoData';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';

const FeesCarryForward = () => {
  useDocumentTitle('Fees Carry Forward');
  const dispatch = useDispatch();

  const {
    pendingStudents,
    pendingStudentsPagination,
    carryForwardRecords,
    recordsPagination,
    summary,
    loading,
    error,
    filters
  } = useSelector(state => state.feeCarryForward);

  const { classes } = useSelector(state => state.feeCollection);

  const [activeTab, setActiveTab] = useState(0);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editDialog, setEditDialog] = useState({ open: false, record: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [bulkEditDialog, setBulkEditDialog] = useState({ open: false });
  const [viewDetailsDialog, setViewDetailsDialog] = useState({ open: false, student: null });

  // Editable balance state for each student
  const [editableBalances, setEditableBalances] = useState({});

  const [searchFilters, setSearchFilters] = useState({
    search: '',
    classId: '',
    section: '',
    session: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
  });

  const [recordFilters, setRecordFilters] = useState({
    search: '',
    classId: '',
    section: '',
    status: '',
    fromSession: '',
    toSession: ''
  });

  const [carryForwardData, setCarryForwardData] = useState({
    fromSession: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    toSession: (new Date().getFullYear() + 1) + '-' + (new Date().getFullYear() + 2),
    dueDate: ''
  });

  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    dispatch(getAllClasses());
    dispatch(getCarryForwardSummary());
  }, [dispatch]);

  useEffect(() => {
    if (activeTab === 0) {
      loadPendingStudents();
    } else {
      loadCarryForwardRecords();
    }
  }, [activeTab]);

  useEffect(() => {
    if (error) {
      setSnackbar({ open: true, message: error, severity: 'error' });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Initialize editable balances when students load
  useEffect(() => {
    const balances = {};
    pendingStudents.forEach(student => {
      balances[student._id] = student.pendingBalance;
    });
    setEditableBalances(balances);
  }, [pendingStudents]);

  const loadPendingStudents = () => {
    dispatch(getPendingStudents({
      page: pendingStudentsPagination.currentPage,
      limit: pendingStudentsPagination.limit,
      ...searchFilters
    }));
  };

  const loadCarryForwardRecords = () => {
    dispatch(getCarryForwardRecords({
      page: recordsPagination.currentPage,
      limit: recordsPagination.limit,
      ...recordFilters
    }));
  };

  const handleSearchPendingStudents = () => {
    loadPendingStudents();
  };

  const handleSearchRecords = () => {
    loadCarryForwardRecords();
  };

  const handleResetFilters = () => {
    if (activeTab === 0) {
      setSearchFilters({
        search: '',
        classId: '',
        section: '',
        session: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
      });
    } else {
      setRecordFilters({
        search: '',
        classId: '',
        section: '',
        status: '',
        fromSession: '',
        toSession: ''
      });
    }
    setTimeout(() => {
      if (activeTab === 0) {
        loadPendingStudents();
      } else {
        loadCarryForwardRecords();
      }
    }, 100);
  };

  const handleBalanceChange = (studentId, newBalance) => {
    const parsedBalance = parseFloat(newBalance) || 0;
    
    // Update editable balances
    setEditableBalances(prev => ({
      ...prev,
      [studentId]: parsedBalance
    }));
    
    // If student is already selected, update their balance in selectedStudents array
    setSelectedStudents(prev => 
      prev.map(s => 
        s.studentId === studentId 
          ? { ...s, previousBalance: parsedBalance, carriedAmount: parsedBalance }
          : s
      )
    );
  };

  const handleSelectStudent = (student) => {
    setSelectedStudents(prev => {
      const exists = prev.find(s => s.studentId === student._id);
      if (exists) {
        return prev.filter(s => s.studentId !== student._id);
      } else {
        // Use the edited balance if available, otherwise use pending balance
        const currentBalance = editableBalances[student._id] !== undefined 
          ? editableBalances[student._id] 
          : student.pendingBalance;
          
        return [...prev, {
          studentId: student._id,
          classId: student.class?._id,
          section: student.section,
          previousBalance: currentBalance,
          carriedAmount: currentBalance,
          adjustmentAmount: 0
        }];
      }
    });
  };

  const handleSelectAllStudents = (event) => {
    if (event.target.checked) {
      setSelectedStudents(pendingStudents.map(student => {
        // Use the edited balance if available, otherwise use pending balance
        const currentBalance = editableBalances[student._id] !== undefined 
          ? editableBalances[student._id] 
          : student.pendingBalance;
          
        return {
          studentId: student._id,
          classId: student.class?._id,
          section: student.section,
          previousBalance: currentBalance,
          carriedAmount: currentBalance,
          adjustmentAmount: 0
        };
      }));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSaveBalance = async (studentId) => {
    const newBalance = editableBalances[studentId];
    
    try {
      // Save to backend
      await dispatch(saveStudentBalance({ studentId, balance: newBalance })).unwrap();
      
      // Update local Redux state
      dispatch(updateStudentBalance({ studentId, newBalance }));
      
      // Update the selected students array if this student is selected
      setSelectedStudents(prev => 
        prev.map(s => 
          s.studentId === studentId 
            ? { ...s, previousBalance: newBalance, carriedAmount: newBalance }
            : s
        )
      );
      
      setSnackbar({ open: true, message: `Balance saved: ${formatCurrency(newBalance)}`, severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err || 'Failed to save balance', severity: 'error' });
    }
  };

  const handleCreateCarryForward = async () => {
    if (selectedStudents.length === 0) {
      setSnackbar({ open: true, message: 'Please select at least one student', severity: 'warning' });
      return;
    }

    if (!carryForwardData.fromSession || !carryForwardData.toSession) {
      setSnackbar({ open: true, message: 'Please select from and to session', severity: 'warning' });
      return;
    }

    try {
      await dispatch(createCarryForward({
        students: selectedStudents,
        fromSession: carryForwardData.fromSession,
        toSession: carryForwardData.toSession,
        dueDate: carryForwardData.dueDate
      })).unwrap();

      setSnackbar({ open: true, message: 'Carry forward created successfully', severity: 'success' });
      setSelectedStudents([]);
      setActiveTab(1);
      loadCarryForwardRecords();
      dispatch(getCarryForwardSummary());
    } catch (err) {
      setSnackbar({ open: true, message: err || 'Failed to create carry forward', severity: 'error' });
    }
  };

  const handleSelectRecord = (recordId) => {
    setSelectedRecords(prev =>
      prev.includes(recordId)
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const handleSelectAllRecords = (event) => {
    if (event.target.checked) {
      setSelectedRecords(carryForwardRecords.map(r => r._id));
    } else {
      setSelectedRecords([]);
    }
  };

  const handleProcessRecords = async () => {
    if (selectedRecords.length === 0) {
      setSnackbar({ open: true, message: 'Please select at least one record', severity: 'warning' });
      return;
    }

    try {
      await dispatch(processCarryForward(selectedRecords)).unwrap();
      setSnackbar({ open: true, message: 'Records processed successfully', severity: 'success' });
      setSelectedRecords([]);
      loadCarryForwardRecords();
      dispatch(getCarryForwardSummary());
    } catch (err) {
      setSnackbar({ open: true, message: err || 'Failed to process records', severity: 'error' });
    }
  };

  const handleDeleteRecord = async () => {
    try {
      await dispatch(deleteCarryForward(deleteDialog.id)).unwrap();
      setSnackbar({ open: true, message: 'Record deleted successfully', severity: 'success' });
      setDeleteDialog({ open: false, id: null });
      loadCarryForwardRecords();
      dispatch(getCarryForwardSummary());
    } catch (err) {
      setSnackbar({ open: true, message: err || 'Failed to delete record', severity: 'error' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Export to CSV
    const headers = ['Student Name', 'Admission No', 'Father Name', 'Class', 'Section', 'Balance'];
    const data = pendingStudents.map(s => [
      `${s.firstName} ${s.lastName || ''}`,
      s.admissionNo,
      s.fatherName,
      s.class?.class_text,
      s.section,
      editableBalances[s._id] || s.pendingBalance
    ]);
    
    const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fee-carry-forward-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    setSnackbar({ open: true, message: 'Data exported successfully', severity: 'success' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN');
  };

  const isStudentSelected = (studentId) => {
    return selectedStudents.some(s => s.studentId === studentId);
  };

  const getTotalSelectedBalance = () => {
    return selectedStudents.reduce((sum, s) => sum + (s.previousBalance || 0), 0);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Previous Session Balance Fees
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ textTransform: 'none' }}
          >
            Print
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            sx={{ textTransform: 'none' }}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => activeTab === 0 ? loadPendingStudents() : loadCarryForwardRecords()}
            sx={{ textTransform: 'none' }}
          >
            Refresh
          </Button>
        </Stack>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Pending Records
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {summary.pending.count}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {formatCurrency(summary.pending.totalAmount)}
                  </Typography>
                </Box>
                <PendingActionsIcon sx={{ fontSize: 50, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Processed Records
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {summary.processed.count}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {formatCurrency(summary.processed.totalAmount)}
                  </Typography>
                </Box>
                <DoneIcon sx={{ fontSize: 50, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Amount
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {formatCurrency(summary.pending.totalAmount + summary.processed.totalAmount)}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    All Sessions
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 50, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper elevation={3}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 }
          }}
        >
          <Tab label="Select Criteria & Carry Forward" />
          <Tab label="Carry Forward Records" />
        </Tabs>

        {/* Tab 1: Select Criteria & Pending Students */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            {/* Select Criteria Section */}
            <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Select Criteria
                </Typography>
                <IconButton size="small" onClick={() => setShowFilters(!showFilters)}>
                  <FilterListIcon />
                </IconButton>
              </Box>
              
              {showFilters && (
                <>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Class *</InputLabel>
                        <Select
                          value={searchFilters.classId}
                          label="Class *"
                          onChange={(e) => setSearchFilters({ ...searchFilters, classId: e.target.value })}
                        >
                          <MenuItem value="">All Classes</MenuItem>
                          {classes.map(cls => (
                            <MenuItem key={cls._id} value={cls._id}>{cls.class_text}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Section *</InputLabel>
                        <Select
                          value={searchFilters.section}
                          label="Section *"
                          onChange={(e) => setSearchFilters({ ...searchFilters, section: e.target.value })}
                        >
                          <MenuItem value="">All Sections</MenuItem>
                          <MenuItem value="A">A</MenuItem>
                          <MenuItem value="B">B</MenuItem>
                          <MenuItem value="C">C</MenuItem>
                          <MenuItem value="D">D</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Session"
                        value={searchFilters.session}
                        onChange={(e) => setSearchFilters({ ...searchFilters, session: e.target.value })}
                        placeholder="2024-2025"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<SearchIcon />}
                        onClick={handleSearchPendingStudents}
                        sx={{ textTransform: 'none', height: '40px' }}
                      >
                        Search
                      </Button>
                    </Grid>
                  </Grid>
                </>
              )}
            </Paper>

            {/* Info Alert */}
            {selectedStudents.length > 0 && (
              <Alert 
                severity="info" 
                sx={{ mb: 2 }}
                icon={<InfoIcon />}
              >
                <Typography variant="body2">
                  <strong>{selectedStudents.length}</strong> student(s) selected with total balance of <strong>{formatCurrency(getTotalSelectedBalance())}</strong>
                </Typography>
              </Alert>
            )}

            {/* Previous Balance Already Forwarded Alert */}
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" color="primary">
                Previous Balance Already Forwarded, You Can Only Update Now
              </Typography>
            </Alert>

            {/* Due Date Section */}
            <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: '#fff3cd', borderLeft: '4px solid #ffc107' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Due Date: <span style={{ color: '#d32f2f' }}>{carryForwardData.dueDate || '06/26/2026'}</span>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Set Due Date"
                    value={carryForwardData.dueDate}
                    onChange={(e) => setCarryForwardData({ ...carryForwardData, dueDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="From Session"
                    value={carryForwardData.fromSession}
                    onChange={(e) => setCarryForwardData({ ...carryForwardData, fromSession: e.target.value })}
                    placeholder="2024-2025"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="To Session"
                    value={carryForwardData.toSession}
                    onChange={(e) => setCarryForwardData({ ...carryForwardData, toSession: e.target.value })}
                    placeholder="2025-2026"
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Search Box */}
            <TextField
              fullWidth
              size="small"
              placeholder="Search..."
              value={searchFilters.search}
              onChange={(e) => setSearchFilters({ ...searchFilters, search: e.target.value })}
              sx={{ mb: 2, maxWidth: 400 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchFilters.search && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchFilters({ ...searchFilters, search: '' })}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            {/* Students Table */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : pendingStudents.length === 0 ? (
              <NoData message="No pending students found" />
            ) : (
              <>
                <TableContainer sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedStudents.length === pendingStudents.length && pendingStudents.length > 0}
                            onChange={handleSelectAllStudents}
                            indeterminate={selectedStudents.length > 0 && selectedStudents.length < pendingStudents.length}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Student Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Admission No</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Admission Date</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Roll Number</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Father Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }} align="right">Balance (₹)</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.875rem' }} align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingStudents.map((student, index) => (
                        <TableRow 
                          key={student._id} 
                          hover
                          sx={{ 
                            '&:nth-of-type(odd)': { bgcolor: '#fafafa' },
                            '&:hover': { bgcolor: '#f0f7ff' }
                          }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isStudentSelected(student._id)}
                              onChange={() => handleSelectStudent(student)}
                            />
                          </TableCell>
                          <TableCell>{`${student.firstName} ${student.lastName || ''}`}</TableCell>
                          <TableCell>{student.admissionNo}</TableCell>
                          <TableCell>{formatDate(student.admissionDate)}</TableCell>
                          <TableCell>{student.rollNumber || '-'}</TableCell>
                          <TableCell>{student.fatherName}</TableCell>
                          <TableCell align="right">
                            <TextField
                              size="small"
                              type="number"
                              value={editableBalances[student._id] !== undefined ? editableBalances[student._id] : student.pendingBalance}
                              onChange={(e) => handleBalanceChange(student._id, e.target.value)}
                              sx={{ 
                                width: 120,
                                '& input': { 
                                  textAlign: 'right',
                                  fontWeight: 'bold',
                                  color: editableBalances[student._id] !== student.pendingBalance ? '#1976d2' : '#d32f2f'
                                },
                                '& .MuiOutlinedInput-root': {
                                  '& fieldset': {
                                    borderColor: editableBalances[student._id] !== student.pendingBalance ? '#1976d2' : undefined,
                                    borderWidth: editableBalances[student._id] !== student.pendingBalance ? 2 : 1
                                  }
                                }
                              }}
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title={editableBalances[student._id] !== student.pendingBalance ? "Save Updated Balance" : "Save Balance"}>
                              <IconButton
                                size="small"
                                color={editableBalances[student._id] !== student.pendingBalance ? "primary" : "default"}
                                onClick={() => handleSaveBalance(student._id)}
                                disabled={editableBalances[student._id] === undefined}
                              >
                                <SaveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <TablePagination
                    component="div"
                    count={pendingStudentsPagination.totalRecords}
                    page={pendingStudentsPagination.currentPage - 1}
                    onPageChange={(e, page) => {
                      dispatch(getPendingStudents({
                        page: page + 1,
                        limit: pendingStudentsPagination.limit,
                        ...searchFilters
                      }));
                    }}
                    rowsPerPage={pendingStudentsPagination.limit}
                    onRowsPerPageChange={(e) => {
                      dispatch(getPendingStudents({
                        page: 1,
                        limit: parseInt(e.target.value),
                        ...searchFilters
                      }));
                    }}
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
                  />
                  
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    startIcon={<SaveIcon />}
                    onClick={handleCreateCarryForward}
                    disabled={selectedStudents.length === 0 || loading}
                    sx={{ textTransform: 'none', minWidth: 200 }}
                  >
                    Save ({selectedStudents.length})
                  </Button>
                </Box>
              </>
            )}
          </Box>
        )}

        {/* Tab 2: Carry Forward Records */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            {/* Filters */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search"
                  placeholder="Name, Admission No"
                  value={recordFilters.search}
                  onChange={(e) => setRecordFilters({ ...recordFilters, search: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={recordFilters.status}
                    label="Status"
                    onChange={(e) => setRecordFilters({ ...recordFilters, status: e.target.value })}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="processed">Processed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="From Session"
                  value={recordFilters.fromSession}
                  onChange={(e) => setRecordFilters({ ...recordFilters, fromSession: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="To Session"
                  value={recordFilters.toSession}
                  onChange={(e) => setRecordFilters({ ...recordFilters, toSession: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleSearchRecords}
                  sx={{ textTransform: 'none' }}
                >
                  Search
                </Button>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            {selectedRecords.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={handleProcessRecords}
                  sx={{ textTransform: 'none', mr: 1 }}
                >
                  Process Selected ({selectedRecords.length})
                </Button>
              </Box>
            )}

            {/* Records Table */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : carryForwardRecords.length === 0 ? (
              <NoData message="No carry forward records found" />
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'primary.main' }}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedRecords.length === carryForwardRecords.length}
                            onChange={handleSelectAllRecords}
                            sx={{ color: 'white' }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Student Name</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Admission No</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Class</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>From Session</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>To Session</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Carried Amount (₹)</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {carryForwardRecords.map((record) => (
                        <TableRow key={record._id} hover>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedRecords.includes(record._id)}
                              onChange={() => handleSelectRecord(record._id)}
                              disabled={record.status !== 'pending'}
                            />
                          </TableCell>
                          <TableCell>{record.studentName}</TableCell>
                          <TableCell>{record.admissionNo}</TableCell>
                          <TableCell>{record.className}</TableCell>
                          <TableCell>{record.fromSession}</TableCell>
                          <TableCell>{record.toSession}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(record.finalCarriedAmount)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={record.status}
                              size="small"
                              color={
                                record.status === 'processed' ? 'success' :
                                record.status === 'pending' ? 'warning' : 'error'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {record.status === 'pending' && (
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => setDeleteDialog({ open: true, id: record._id })}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={recordsPagination.totalRecords}
                  page={recordsPagination.currentPage - 1}
                  onPageChange={(e, page) => {
                    dispatch(getCarryForwardRecords({
                      page: page + 1,
                      limit: recordsPagination.limit,
                      ...recordFilters
                    }));
                  }}
                  rowsPerPage={recordsPagination.limit}
                  onRowsPerPageChange={(e) => {
                    dispatch(getCarryForwardRecords({
                      page: 1,
                      limit: parseInt(e.target.value),
                      ...recordFilters
                    }));
                  }}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                />
              </>
            )}
          </Box>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, id: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this record?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteRecord}
            sx={{ textTransform: 'none' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <CustomizedSnackbars
        type={snackbar.severity}
        message={snackbar.message}
        reset={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default FeesCarryForward;
