import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  Tabs,
  Tab,
  TablePagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  HowToReg as OnlineIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import {
  fetchOnlineAdmissions,
  approveOnlineAdmission,
  rejectOnlineAdmission,
  clearMessages,
} from '../../../state/studentManagementSlice';
import CustomizedSnackbars from '../../../basic utility components/CustomizedSnackbars';

const OnlineAdmission = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    onlineAdmissions,
    onlineAdmissionsLoading,
    onlineAdmissionsPagination,
    loading,
    error,
    successMsg,
  } = useSelector((state) => state.studentManagement);

  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    dispatch(
      fetchOnlineAdmissions({
        status: statusFilter,
        page: page + 1,
        limit: rowsPerPage,
        search: searchInput,
      })
    );
  }, [dispatch, statusFilter, page, rowsPerPage, searchInput]);

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
        fetchOnlineAdmissions({
          status: statusFilter,
          page: 1,
          limit: rowsPerPage,
          search: searchInput,
        })
      );
    }
  }, [error, successMsg, dispatch, statusFilter, rowsPerPage, searchInput]);

  const filteredApplications = onlineAdmissions || [];

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setViewDialog(true);
  };

  const handleApprove = (applicationId) => {
    if (!window.confirm('Are you sure you want to approve this application?')) return;
    dispatch(approveOnlineAdmission(applicationId));
  };

  const handleReject = (applicationId) => {
    const reason = window.prompt('Please enter rejection reason:');
    if (!reason) return;
    dispatch(rejectOnlineAdmission({ applicationId, rejectionReason: reason }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'warning';
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
    const statuses = ['Pending', 'Approved', 'Rejected'];
    setStatusFilter(statuses[newValue]);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <OnlineIcon sx={{ color: '#6a1b9a', fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#6a1b9a' }}>
            Online Admission Applications
          </Typography>
        </Box>
        <Typography variant="body2" color="textSecondary">
          Review and manage online admission applications submitted by parents
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 2, borderTop: '3px solid #6a1b9a' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
            '& .Mui-selected': { color: '#6a1b9a' },
            '& .MuiTabs-indicator': { backgroundColor: '#6a1b9a' },
          }}
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PendingIcon fontSize="small" />
                Pending
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ApproveIcon fontSize="small" />
                Approved
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RejectIcon fontSize="small" />
                Rejected
              </Box>
            }
          />
        </Tabs>
      </Paper>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 2, borderTop: '3px solid #6a1b9a' }}>
        <TextField
          placeholder="Search by name, email, or application no..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#6a1b9a' }} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Table */}
      <Paper sx={{ borderTop: '3px solid #6a1b9a' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f3e5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#6a1b9a', fontSize: '0.813rem' }}>
                  Application No
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6a1b9a', fontSize: '0.813rem' }}>
                  Student Name
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6a1b9a', fontSize: '0.813rem' }}>
                  Email
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6a1b9a', fontSize: '0.813rem' }}>
                  Mobile
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6a1b9a', fontSize: '0.813rem' }}>
                  Class Applied
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6a1b9a', fontSize: '0.813rem' }}>
                  Date of Birth
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6a1b9a', fontSize: '0.813rem' }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#6a1b9a', fontSize: '0.813rem' }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {onlineAdmissionsLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <CircularProgress sx={{ color: '#6a1b9a' }} />
                  </TableCell>
                </TableRow>
              ) : filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <Typography variant="body1" color="textSecondary">
                      No applications found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((app) => (
                  <TableRow key={app._id} hover sx={{ '&:hover': { backgroundColor: '#f9f5fb' } }}>
                    <TableCell sx={{ fontSize: '0.813rem' }}>{app.applicationNo || '-'}</TableCell>
                    <TableCell sx={{ fontSize: '0.813rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          src={app.photo}
                          alt={app.firstName}
                          sx={{ bgcolor: '#6a1b9a', width: 32, height: 32 }}
                        >
                          {app.firstName?.charAt(0)}
                        </Avatar>
                        {app.firstName} {app.lastName}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.813rem' }}>{app.email || '-'}</TableCell>
                    <TableCell sx={{ fontSize: '0.813rem' }}>{app.mobileNumber || '-'}</TableCell>
                    <TableCell sx={{ fontSize: '0.813rem' }}>
                      {app.classApplied?.name || app.classApplied || '-'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.813rem' }}>
                      {app.dateOfBirth
                        ? new Date(app.dateOfBirth).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.813rem' }}>
                      <Chip
                        label={app.status || 'Pending'}
                        size="small"
                        color={getStatusColor(app.status)}
                        sx={{ fontSize: '0.75rem', height: '22px' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/school/students/online-admission/view/${app._id}`)}
                          sx={{ color: '#6a1b9a' }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      {app.status === 'Pending' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              onClick={() => handleApprove(app._id)}
                              sx={{ color: '#4caf50' }}
                            >
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              onClick={() => handleReject(app._id)}
                              sx={{ color: '#d32f2f' }}
                            >
                              <RejectIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={onlineAdmissionsPagination?.total || 0}
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
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <OnlineIcon sx={{ color: '#6a1b9a' }} />
            <Typography variant="h6">Application Details</Typography>
          </Box>
          <IconButton onClick={() => setViewDialog(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box>
              {/* Status Alert */}
              <Alert severity={getStatusColor(selectedApplication.status)} sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Status: {selectedApplication.status}
                </Typography>
                {selectedApplication.rejectionReason && (
                  <Typography variant="caption">
                    Reason: {selectedApplication.rejectionReason}
                  </Typography>
                )}
              </Alert>

              {/* Student Photo */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Avatar
                  src={selectedApplication.photo}
                  alt={selectedApplication.firstName}
                  sx={{ width: 100, height: 100, bgcolor: '#6a1b9a' }}
                >
                  {selectedApplication.firstName?.charAt(0)}
                </Avatar>
              </Box>

              {/* Details Grid */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Application No
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedApplication.applicationNo || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    First Name
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedApplication.firstName}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Last Name
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedApplication.lastName}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Date of Birth
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedApplication.dateOfBirth
                      ? new Date(selectedApplication.dateOfBirth).toLocaleDateString()
                      : '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Gender
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedApplication.gender || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Class Applied
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedApplication.classApplied?.name || selectedApplication.classApplied || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Email
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedApplication.email || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Mobile Number
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedApplication.mobileNumber || '-'}
                  </Typography>
                </Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="caption" color="textSecondary">
                    Address
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedApplication.currentAddress || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Father Name
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedApplication.fatherName || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Mother Name
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedApplication.motherName || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Guardian Phone
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedApplication.guardianPhone || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Submitted On
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedApplication.createdAt
                      ? new Date(selectedApplication.createdAt).toLocaleString()
                      : '-'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {selectedApplication?.status === 'Pending' && (
            <>
              <Button
                variant="outlined"
                color="error"
                startIcon={<RejectIcon />}
                onClick={() => handleReject(selectedApplication._id)}
                disabled={actionLoading}
                sx={{ textTransform: 'none' }}
              >
                Reject
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<ApproveIcon />}
                onClick={() => handleApprove(selectedApplication._id)}
                disabled={loading}
                sx={{ textTransform: 'none' }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Approve'}
              </Button>
            </>
          )}
          <Button onClick={() => setViewDialog(false)} sx={{ textTransform: 'none' }}>
            Close
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

export default OnlineAdmission;
