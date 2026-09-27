import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  Grid,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import {
  Edit as EditIcon,
  Print as PrintIcon,
  QrCode as QrCodeIcon,
  History as HistoryIcon,
  MoreVert as MoreVertIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudentById, clearCurrentStudent, generateStudentLogin, clearLoginCredentials } from '../../../state/studentAdmissionSlice';
import ChangePasswordDialog from './ChangePasswordDialog';
import LoginDetailsDialog from './LoginDetailsDialog';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ paddingTop: 16 }}>
    {value === index && children}
  </div>
);

const InfoRow = ({ label, value }) => (
  <Box sx={{ display: 'flex', py: 1, borderBottom: '1px solid #f0f0f0' }}>
    <Typography sx={{ fontSize: '0.875rem', color: '#666', minWidth: '180px' }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#333' }}>
      {value || '-'}
    </Typography>
  </Box>
);

const PasswordRow = ({ label, value }) => (
  <Box sx={{ display: 'flex', py: 1, borderBottom: '1px solid #f0f0f0', alignItems: 'center' }}>
    <Typography sx={{ fontSize: '0.875rem', color: '#666', minWidth: '180px' }}>
      {label}
    </Typography>
    {value ? (
      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#6a1b9a', fontFamily: 'monospace', letterSpacing: 1 }}>
        {value}
      </Typography>
    ) : (
      <Typography sx={{ fontSize: '0.813rem', color: '#999', fontStyle: 'italic' }}>
        Not set (old record)
      </Typography>
    )}
  </Box>
);

const StudentDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentStudent, loading, error } = useSelector((state) => state.studentAdmission);
  const [tabValue, setTabValue] = useState(0);
  const [changePassOpen, setChangePassOpen] = useState(false);
  const [generatedCreds, setGeneratedCreds] = useState(null);
  const [genLoading, setGenLoading] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchStudentById(id));
    }
    
    // Cleanup function to clear current student when component unmounts
    return () => {
      dispatch(clearCurrentStudent());
    };
  }, [id, dispatch]);

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">Error: {error}</Typography>
        <Button onClick={() => navigate('/school/students/admission')} sx={{ mt: 2 }}>
          Back to List
        </Button>
      </Box>
    );
  }

  if (!currentStudent) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Student not found</Typography>
        <Button onClick={() => navigate('/school/students/admission')} sx={{ mt: 2 }}>
          Back to List
        </Button>
      </Box>
    );
  }

  const student = currentStudent;

  const handleEdit = () => {
    // Navigate back to list and trigger edit dialog
    navigate('/school/students/admission', { state: { editStudentId: id } });
  };

  const handleGenerateLogin = async () => {
    setGenLoading(true);
    const result = await dispatch(generateStudentLogin(id));
    setGenLoading(false);
    if (result.meta.requestStatus === 'fulfilled') {
      setGeneratedCreds({
        ...result.payload.loginCredentials,
        studentName: `${student.firstName} ${student.lastName}`,
      });
      dispatch(fetchStudentById(id));
    }
  };

  return (
    <>
      <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/school/students/admission')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#333', flex: 1 }}>
          Student Details
        </Typography>
        <IconButton onClick={handleEdit}>
          <EditIcon />
        </IconButton>
        <IconButton>
          <PrintIcon />
        </IconButton>
        <IconButton>
          <QrCodeIcon />
        </IconButton>
        <IconButton>
          <HistoryIcon />
        </IconButton>
        <IconButton>
          <MoreVertIcon />
        </IconButton>
      </Box>

      <Grid container spacing={2}>
        {/* Left Sidebar */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                src={student.photo}
                alt={student.firstName}
                sx={{ width: 120, height: 120, margin: '0 auto 16px', bgcolor: '#6a1b9a' }}
              >
                {student.firstName?.charAt(0)}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {student.firstName} {student.lastName}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Admission No: {student.admissionNo}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Roll Number: {student.rollNumber || '-'}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ textAlign: 'left' }}>
                <InfoRow label="Class" value={student.class?.class_text || student.class?.name} />
                <InfoRow label="Section" value={student.section} />
                <InfoRow label="RTE" value="No" />
                <InfoRow label="Gender" value={student.gender} />
                <InfoRow label="Barcode" value="-" />
                <InfoRow label="QR Code" value="-" />
              </Box>

              {/* Login Details Section */}
              {student.loginDetails && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#6a1b9a' }}>
                    Login Details
                  </Typography>
                  <Box sx={{ textAlign: 'left' }}>
                    <Box sx={{ mb: 2, p: 1.5, backgroundColor: '#f3e5f5', borderRadius: 1 }}>
                      <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                        Parent
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600, mb: 0.5 }}>
                        {student.loginDetails.parentUsername}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#6a1b9a' }}>
                        {student.loginDetails.parentPassword || 'Not set'}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1.5, backgroundColor: '#e8eaf6', borderRadius: 1 }}>
                      <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                        Student
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 600, mb: 0.5 }}>
                        {student.loginDetails.studentUsername}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#3f51b5' }}>
                        {student.loginDetails.studentPassword || 'Not set'}
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <Card>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': { textTransform: 'none', fontSize: '0.875rem' },
              }}
            >
              <Tab label="Profile" />
              <Tab label="Fees" />
              <Tab label="Exam" />
              <Tab label="Attendance" />
              <Tab label="Documents" />
              <Tab label="Timeline" />
            </Tabs>

            <CardContent>
              {/* Profile Tab */}
              <TabPanel value={tabValue} index={0}>
                <Box>
                  {/* Basic Information */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#6a1b9a' }}>
                    Basic Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <InfoRow label="Admission Date" value={student.admissionDate ? new Date(student.admissionDate).toLocaleDateString('en-GB') : '-'} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoRow label="Date of Birth" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-GB') : '-'} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoRow label="Category" value={student.category} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoRow label="Mobile Number" value={student.mobileNumber} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoRow label="Alternate Mobile" value={student.alternateMobileNumber} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoRow label="Caste" value={student.caste} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoRow label="Religion" value={student.religion} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoRow label="Email" value={student.email} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoRow label="Aadhar Number" value={student.aadharNumber} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoRow label="Blood Group" value={student.bloodGroup} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoRow label="House" value={student.house} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoRow label="Status" value={student.status} />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  {/* Address */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#6a1b9a' }}>
                    Address
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <InfoRow label="Current Address" value={student.address} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <InfoRow label="City" value={student.city} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <InfoRow label="State" value={student.state} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <InfoRow label="Pincode" value={student.pincode} />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  {/* Parent Guardian Detail */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#6a1b9a' }}>
                    Parent Guardian Detail
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <InfoRow label="Father Name" value={student.fatherName} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoRow label="Father Phone" value={student.mobileNumber} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoRow label="Mother Name" value={student.motherName} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoRow label="Mother Phone" value={student.alternateMobileNumber} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoRow label="Guardian Name" value={student.guardianName} />
                    </Grid>
                  </Grid>

                  {/* Transport Details */}
                  {student.transportEnabled && (
                    <>
                      <Divider sx={{ my: 3 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#6a1b9a' }}>
                        Transport Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <InfoRow label="Route" value={student.route?.name || student.route?.routeName || '-'} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoRow label="Pickup Point" value={student.pickupPoint} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoRow label="Fees Month" value={student.transportFeesMonth} />
                        </Grid>
                      </Grid>
                    </>
                  )}

                  {/* Hostel Details */}
                  {student.hostelEnabled && (
                    <>
                      <Divider sx={{ my: 3 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#6a1b9a' }}>
                        Hostel Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <InfoRow label="Hostel" value={student.hostel?.name || student.hostel?.hostelName || '-'} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <InfoRow label="Room Number" value={student.roomNumber} />
                        </Grid>
                      </Grid>
                    </>
                  )}

                  {/* Login Credentials */}
                  <Divider sx={{ my: 3 }} />
                  {student.loginDetails ? (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#6a1b9a' }}>
                          Login Credentials
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setChangePassOpen(true)}
                          sx={{
                            textTransform: 'none',
                            fontSize: '0.813rem',
                            borderColor: '#6a1b9a',
                            color: '#6a1b9a',
                            '&:hover': { backgroundColor: '#f3e5f5', borderColor: '#4a148c' },
                          }}
                        >
                          Change Password
                        </Button>
                      </Box>
                      <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f3e5f5', border: '1px solid #e1bee7' }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#6a1b9a' }}>
                                Parent Login
                              </Typography>
                              <InfoRow label="Username" value={student.loginDetails.parentUsername} />
                              <InfoRow label="Email" value={`${student.loginDetails.parentUsername}@school.com`} />
                              <PasswordRow label="Password" value={student.loginDetails.parentPassword} />
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#6a1b9a' }}>
                                Student Login
                              </Typography>
                              <InfoRow label="Username" value={student.loginDetails.studentUsername} />
                              <InfoRow label="Email" value={`${student.loginDetails.studentUsername}@school.com`} />
                              <PasswordRow label="Password" value={student.loginDetails.studentPassword} />
                            </Box>
                          </Grid>
                        </Grid>
                        <Box sx={{ mt: 2, p: 1.5, backgroundColor: '#fff3e0', borderRadius: 1 }}>
                          <Typography variant="caption" sx={{ color: '#e65100', fontSize: '0.75rem' }}>
                            <strong>Note:</strong> Please keep these credentials secure and share only with authorized users.
                          </Typography>
                        </Box>
                      </Paper>
                    </>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 3, backgroundColor: '#f9f9f9', borderRadius: 1, border: '1px dashed #ccc' }}>
                      <Typography variant="body2" sx={{ color: '#666', mb: 2, fontSize: '0.875rem' }}>
                        Login credentials not generated yet for this student.
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleGenerateLogin}
                        disabled={genLoading}
                        sx={{
                          textTransform: 'none',
                          backgroundColor: '#6a1b9a',
                          '&:hover': { backgroundColor: '#4a148c' },
                        }}
                      >
                        {genLoading ? 'Generating...' : 'Generate Login Credentials'}
                      </Button>
                    </Box>
                  )}
                </Box>
              </TabPanel>

              {/* Fees Tab */}
              <TabPanel value={tabValue} index={1}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#6a1b9a' }}>
                  Fees Details
                </Typography>
                {student.feesDetails && student.feesDetails.length > 0 ? (
                  student.feesDetails.map((feeClass, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {feeClass.className}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#6a1b9a' }}>
                          Total: ₹{feeClass.totalAmount?.toFixed(2)}
                        </Typography>
                      </Box>
                      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                        <Table size="small">
                          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableRow>
                              <TableCell sx={{ fontSize: '0.813rem', fontWeight: 600 }}>Fees Type</TableCell>
                              <TableCell sx={{ fontSize: '0.813rem', fontWeight: 600 }}>Due Date</TableCell>
                              <TableCell sx={{ fontSize: '0.813rem', fontWeight: 600 }} align="right">Amount (₹)</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {feeClass.feeItems?.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell sx={{ fontSize: '0.813rem' }}>{item.feesType}</TableCell>
                                <TableCell sx={{ fontSize: '0.813rem' }}>
                                  {item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-GB') : '-'}
                                </TableCell>
                                <TableCell sx={{ fontSize: '0.813rem' }} align="right">
                                  {item.amount?.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  ))
                ) : (
                  <Typography sx={{ fontSize: '0.875rem', color: '#999', textAlign: 'center', py: 4 }}>
                    No fees details available
                  </Typography>
                )}
              </TabPanel>

              {/* Exam Tab */}
              <TabPanel value={tabValue} index={2}>
                <Typography sx={{ fontSize: '0.875rem', color: '#999', textAlign: 'center', py: 4 }}>
                  Exam details will be displayed here
                </Typography>
              </TabPanel>

              {/* Attendance Tab */}
              <TabPanel value={tabValue} index={3}>
                <Typography sx={{ fontSize: '0.875rem', color: '#999', textAlign: 'center', py: 4 }}>
                  Attendance records will be displayed here
                </Typography>
              </TabPanel>

              {/* Documents Tab */}
              <TabPanel value={tabValue} index={4}>
                <Typography sx={{ fontSize: '0.875rem', color: '#999', textAlign: 'center', py: 4 }}>
                  Documents will be displayed here
                </Typography>
              </TabPanel>

              {/* Timeline Tab */}
              <TabPanel value={tabValue} index={5}>
                <Typography sx={{ fontSize: '0.875rem', color: '#999', textAlign: 'center', py: 4 }}>
                  Timeline will be displayed here
                </Typography>
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>

    {/* Change Password Dialog */}
    <ChangePasswordDialog
      open={changePassOpen}
      onClose={() => {
        setChangePassOpen(false);
        dispatch(fetchStudentById(id));
      }}
      studentId={id}
      studentName={`${student.firstName} ${student.lastName}`}
    />

    {/* Generated Login Credentials Dialog */}
    <LoginDetailsDialog
      open={!!generatedCreds}
      onClose={() => {
        setGeneratedCreds(null);
        dispatch(clearLoginCredentials());
      }}
      studentName={generatedCreds?.studentName || ''}
      loginCredentials={generatedCreds}
    />
    </>
  );
};

export default StudentDetailView;
