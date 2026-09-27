import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  alpha,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import {
  fetchSchoolDetails,
  submitOnlineAdmission,
  clearMessages,
} from '../../../state/publicSchoolSlice';
import CustomizedSnackbars from '../../../basic utility components/CustomizedSnackbars';

const steps = ['Personal Information', 'Parent/Guardian Details', 'Review & Submit'];

const ApplyAdmissionPage = () => {
  const { id: schoolId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { schoolDetails, applicationSubmitting, applicationSuccess, error } = useSelector(
    (state) => state.publicSchool
  );

  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    classApplied: '',
    email: '',
    mobileNumber: '',
    currentAddress: '',
    fatherName: '',
    motherName: '',
    guardianPhone: '',
  });

  useEffect(() => {
    if (schoolId) {
      dispatch(fetchSchoolDetails(schoolId));
    }
  }, [dispatch, schoolId]);

  useEffect(() => {
    if (error) {
      setSnackbar({ open: true, message: error, severity: 'error' });
      dispatch(clearMessages());
    }
    if (applicationSuccess) {
      // Scroll to top before navigation
      window.scrollTo({ top: 0, behavior: 'instant' });
      
      // Navigate to success page with application data
      navigate(`/application-success`, {
        state: {
          applicationData: formData,
          schoolName: schoolDetails?.school_name || 'School',
        },
      });
      dispatch(clearMessages());
    }
  }, [error, applicationSuccess, dispatch, navigate, formData, schoolDetails]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = (e) => {
    e.preventDefault();
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all required fields before submission
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || 
        !formData.gender || !formData.classApplied || !formData.guardianPhone) {
      setSnackbar({ 
        open: true, 
        message: 'Please fill all required fields', 
        severity: 'error' 
      });
      return;
    }

    // Validate guardian phone format (REQUIRED)
    if (!formData.guardianPhone || formData.guardianPhone.length !== 10) {
      setSnackbar({ 
        open: true, 
        message: 'Guardian phone number is required and must be 10 digits', 
        severity: 'error' 
      });
      return;
    }

    // Validate mobile number format (OPTIONAL but if provided must be 10 digits)
    if (formData.mobileNumber && formData.mobileNumber.length !== 10) {
      setSnackbar({ 
        open: true, 
        message: 'Mobile number must be 10 digits', 
        severity: 'error' 
      });
      return;
    }

    console.log('Submitting application:', {
      schoolId,
      ...formData,
    });

    dispatch(
      submitOnlineAdmission({
        schoolId,
        ...formData,
      })
    );
  };

  const isStepValid = () => {
    if (activeStep === 0) {
      return (
        formData.firstName.trim() !== '' &&
        formData.lastName.trim() !== '' &&
        formData.dateOfBirth !== '' &&
        formData.gender !== '' &&
        formData.classApplied.trim() !== ''
      );
    }
    if (activeStep === 1) {
      return (
        formData.guardianPhone.trim() !== '' &&
        formData.guardianPhone.length === 10 &&
        (formData.fatherName.trim() !== '' || formData.motherName.trim() !== '')
      );
    }
    if (activeStep === 2) {
      // Final validation before submit
      return (
        formData.firstName.trim() !== '' &&
        formData.lastName.trim() !== '' &&
        formData.dateOfBirth !== '' &&
        formData.gender !== '' &&
        formData.classApplied.trim() !== '' &&
        formData.guardianPhone.trim() !== '' &&
        formData.guardianPhone.length === 10
      );
    }
    return true;
  };

  if (!schoolDetails) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f5f5',
        }}
      >
        <CircularProgress sx={{ color: '#6a1b9a' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="md">
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/school/${schoolId}`)}
          sx={{
            mb: 3,
            color: '#6a1b9a',
            fontWeight: 600,
            '&:hover': {
              bgcolor: alpha('#6a1b9a', 0.08),
            },
          }}
        >
          Back to School Details
        </Button>

        {/* Header */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: '#6a1b9a', color: 'white' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Online Admission Application
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            {schoolDetails.school_name}
          </Typography>
        </Paper>

        {/* Stepper */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Form */}
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            {/* Step 0: Personal Information */}
            {activeStep === 0 && (
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#6a1b9a', mb: 2 }}>
                    Student Personal Information
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    type="date"
                    label="Date of Birth"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    select
                    label="Gender"
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                  >
                    {['Male', 'Female', 'Other'].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Class Applying For"
                    placeholder="e.g., Class 1, Class 5, Class 10, etc."
                    value={formData.classApplied}
                    onChange={(e) => handleChange('classApplied', e.target.value)}
                    helperText="Enter the class you want to apply for"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Email (Optional)"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mobile Number"
                    value={formData.mobileNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      handleChange('mobileNumber', value);
                    }}
                    inputProps={{ maxLength: 10 }}
                    helperText={formData.mobileNumber && formData.mobileNumber.length !== 10 ? 'Must be 10 digits' : ''}
                    error={formData.mobileNumber !== '' && formData.mobileNumber.length !== 10}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Current Address"
                    value={formData.currentAddress}
                    onChange={(e) => handleChange('currentAddress', e.target.value)}
                  />
                </Grid>
              </Grid>
            )}

            {/* Step 1: Parent/Guardian Details */}
            {activeStep === 1 && (
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#6a1b9a', mb: 2 }}>
                    Parent/Guardian Information
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Father's Name"
                    value={formData.fatherName}
                    onChange={(e) => handleChange('fatherName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mother's Name"
                    value={formData.motherName}
                    onChange={(e) => handleChange('motherName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Guardian Phone Number"
                    value={formData.guardianPhone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      handleChange('guardianPhone', value);
                    }}
                    inputProps={{ maxLength: 10 }}
                    helperText={formData.guardianPhone && formData.guardianPhone.length !== 10 ? 'Must be 10 digits' : 'Required field'}
                    error={formData.guardianPhone !== '' && formData.guardianPhone.length !== 10}
                  />
                </Grid>
              </Grid>
            )}

            {/* Step 2: Review & Submit */}
            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#6a1b9a', mb: 3 }}>
                  Review Your Application
                </Typography>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Please review all information carefully before submitting
                </Alert>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Student Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                      {formData.firstName} {formData.lastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Date of Birth
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                      {formData.dateOfBirth}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Gender
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                      {formData.gender}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Class Applied
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                      {formData.classApplied}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Mobile Number
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                      {formData.mobileNumber || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Guardian Phone
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                      {formData.guardianPhone}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Email
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                      {formData.email || 'Not provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Current Address
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                      {formData.currentAddress || 'Not provided'}
                    </Typography>
                  </Grid>
                  {formData.fatherName && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Father's Name
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                        {formData.fatherName}
                      </Typography>
                    </Grid>
                  )}
                  {formData.motherName && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Mother's Name
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                        {formData.motherName}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                type="button"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ fontWeight: 600 }}
              >
                Back
              </Button>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {activeStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    variant="contained"
                    onClick={handleNext}
                    disabled={!isStepValid()}
                    sx={{
                      bgcolor: '#6a1b9a',
                      fontWeight: 700,
                      px: 4,
                      '&:hover': {
                        bgcolor: '#7b1fa2',
                      },
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={applicationSubmitting || !isStepValid()}
                    startIcon={
                      applicationSubmitting ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <SendIcon />
                      )
                    }
                    sx={{
                      bgcolor: '#6a1b9a',
                      fontWeight: 700,
                      px: 4,
                      '&:hover': {
                        bgcolor: '#7b1fa2',
                      },
                    }}
                  >
                    {applicationSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>

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

export default ApplyAdmissionPage;
