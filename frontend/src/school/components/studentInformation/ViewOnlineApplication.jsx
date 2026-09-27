import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  Grid,
  Divider,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  Wc as GenderIcon,
  School as SchoolIcon,
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import axios from 'axios';
import CustomizedSnackbars from '../../../basic utility components/CustomizedSnackbars';
import {
  approveOnlineAdmission,
  rejectOnlineAdmission,
  clearMessages,
} from '../../../state/studentManagementSlice';

const ViewOnlineApplication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, successMsg } = useSelector((state) => state.studentManagement);

  const [application, setApplication] = useState(null);
  const [loadingApp, setLoadingApp] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  useEffect(() => {
    if (error) {
      setSnackbar({ open: true, message: error, severity: 'error' });
      dispatch(clearMessages());
    }
    if (successMsg) {
      setSnackbar({ open: true, message: successMsg, severity: 'success' });
      dispatch(clearMessages());
      setTimeout(() => {
        navigate('/school/students/online-admission');
      }, 1500);
    }
  }, [error, successMsg, dispatch, navigate]);

  const fetchApplicationDetails = async () => {
    try {
      setLoadingApp(true);
      const res = await axios.get(`/api/school/online-admissions/${id}`);
      setApplication(res.data.data);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to load application',
        severity: 'error',
      });
    } finally {
      setLoadingApp(false);
    }
  };

  const handleApprove = () => {
    if (!window.confirm('Are you sure you want to approve this application?')) return;
    dispatch(approveOnlineAdmission(id));
  };

  const handleReject = () => {
    const reason = window.prompt('Please enter rejection reason:');
    if (!reason) return;
    dispatch(rejectOnlineAdmission({ applicationId: id, rejectionReason: reason }));
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

  if (loadingApp) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: '#f5f5f5',
        }}
      >
        <CircularProgress sx={{ color: '#6a1b9a' }} />
      </Box>
    );
  }

  if (!application) {
    return (
      <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <Alert severity="error">Application not found</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/school/students/online-admission')}
          sx={{ mt: 2 }}
        >
          Back to Applications
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/school/students/online-admission')}
          sx={{ mb: 2, color: '#6a1b9a', fontWeight: 600 }}
        >
          Back to Applications
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchoolIcon sx={{ color: '#6a1b9a', fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#6a1b9a' }}>
            Online Admission Application Details
          </Typography>
        </Box>
      </Box>

      {/* Status Alert */}
      <Alert severity={getStatusColor(application.status)} sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Status: {application.status}
        </Typography>
        {application.rejectionReason && (
          <Typography variant="caption">Reason: {application.rejectionReason}</Typography>
        )}
      </Alert>

      {/* Main Content */}
      <Paper sx={{ p: 4, borderRadius: 3, borderTop: '4px solid #6a1b9a' }}>
        {/* Student Photo */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Avatar
            src={application.photo}
            alt={application.firstName}
            sx={{ width: 120, height: 120, bgcolor: '#6a1b9a', fontSize: '3rem' }}
          >
            {application.firstName?.charAt(0)}
          </Avatar>
        </Box>

        {/* Application Number */}
        <Box
          sx={{
            mb: 4,
            p: 2,
            bgcolor: '#f3e5f5',
            borderRadius: 2,
            textAlign: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Application Number
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#6a1b9a' }}>
            {application.applicationNo || 'N/A'}
          </Typography>
        </Box>

        {/* Personal Information */}
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#6a1b9a', mb: 3 }}>
          📋 Personal Information
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PersonIcon sx={{ color: '#6a1b9a', fontSize: 24 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  First Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {application.firstName}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PersonIcon sx={{ color: '#6a1b9a', fontSize: 24 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Last Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {application.lastName}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CakeIcon sx={{ color: '#6a1b9a', fontSize: 24 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Date of Birth
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {application.dateOfBirth
                    ? new Date(application.dateOfBirth).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <GenderIcon sx={{ color: '#6a1b9a', fontSize: 24 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Gender
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {application.gender || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <SchoolIcon sx={{ color: '#6a1b9a', fontSize: 24 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Class Applied For
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {application.classApplied?.name || application.classApplied || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Contact Information */}
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#6a1b9a', mb: 3 }}>
          📞 Contact Information
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <EmailIcon sx={{ color: '#6a1b9a', fontSize: 24 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Email
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {application.email || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PhoneIcon sx={{ color: '#6a1b9a', fontSize: 24 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Mobile Number
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {application.mobileNumber || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <HomeIcon sx={{ color: '#6a1b9a', fontSize: 24, mt: 0.5 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Current Address
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {application.currentAddress || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Parent/Guardian Information */}
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#6a1b9a', mb: 3 }}>
          👨‍👩‍👧 Parent/Guardian Information
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PersonIcon sx={{ color: '#6a1b9a', fontSize: 24 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Father's Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {application.fatherName || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PersonIcon sx={{ color: '#6a1b9a', fontSize: 24 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Mother's Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {application.motherName || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PhoneIcon sx={{ color: '#6a1b9a', fontSize: 24 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Guardian Phone
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {application.guardianPhone || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Submission Details */}
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#6a1b9a', mb: 3 }}>
          📅 Submission Details
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CalendarIcon sx={{ color: '#6a1b9a', fontSize: 24 }} />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Submitted On
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {application.createdAt
                    ? new Date(application.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          {application.approvedAt && (
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CalendarIcon sx={{ color: '#4caf50', fontSize: 24 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Approved On
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {new Date(application.approvedAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
          {application.rejectedAt && (
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CalendarIcon sx={{ color: '#d32f2f', fontSize: 24 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Rejected On
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {new Date(application.rejectedAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Action Buttons */}
        {application.status === 'Pending' && (
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<RejectIcon />}
              onClick={handleReject}
              disabled={loading}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Reject Application
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<ApproveIcon />}
              onClick={handleApprove}
              disabled={loading}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Approve Application'}
            </Button>
          </Box>
        )}
      </Paper>

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

export default ViewOnlineApplication;
