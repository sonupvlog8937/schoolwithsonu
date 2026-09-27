import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  Divider,
  alpha,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Wc as GenderIcon,
  Class as ClassIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ApplicationSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { applicationData, schoolName } = location.state || {};

  const [countdown, setCountdown] = useState(3);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!applicationData) {
      navigate('/');
      return;
    }

    // Auto redirect after 30 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 10000); // 10 seconds per step

    return () => clearInterval(timer);
  }, [applicationData, navigate]);

  if (!applicationData) {
    return null;
  }

  const steps = ['Application Submitted', 'Under Review', 'Waiting for Call'];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: alpha('#ffffff', 0.1),
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-20px)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: alpha('#ffffff', 0.08),
          animation: 'float 8s ease-in-out infinite',
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Success Icon Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 80, color: '#4caf50' }} />
            </Box>
          </Box>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: 'white',
              textAlign: 'center',
              mb: 1,
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
          >
            Application Submitted Successfully!
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: alpha('#ffffff', 0.9),
              textAlign: 'center',
              mb: 4,
              fontWeight: 400,
            }}
          >
            Your request is under review
          </Typography>
        </motion.div>

        {/* Status Stepper */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Stepper activeStep={0} alternativeLabel>
              {steps.map((label, index) => (
                <Step key={label} completed={index === 0}>
                  <StepLabel
                    StepIconProps={{
                      sx: {
                        color: index === 0 ? '#4caf50' : '#e0e0e0',
                        '&.Mui-completed': { color: '#4caf50' },
                      },
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: index === 0 ? 700 : 500,
                        color: index === 0 ? '#4caf50' : 'text.secondary',
                      }}
                    >
                      {label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </motion.div>

        {/* Waiting Message Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card
            sx={{
              mb: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <PhoneIcon sx={{ fontSize: 50, mb: 2, opacity: 0.9 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                Waiting for Call
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                Our admission team will contact you within 2-3 business days
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
                <Chip
                  icon={<PhoneIcon />}
                  label="Call Expected"
                  sx={{
                    bgcolor: alpha('#ffffff', 0.2),
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
                <Chip
                  icon={<EmailIcon />}
                  label="Email Notification"
                  sx={{
                    bgcolor: alpha('#ffffff', 0.2),
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        {/* Application Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Paper sx={{ p: 4, borderRadius: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <SchoolIcon sx={{ color: '#6a1b9a', fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#6a1b9a' }}>
                Application Details
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* School Name */}
            <Box
              sx={{
                mb: 3,
                p: 2,
                bgcolor: alpha('#6a1b9a', 0.05),
                borderRadius: 2,
                borderLeft: '4px solid #6a1b9a',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Applied To
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#6a1b9a' }}>
                {schoolName}
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {/* Student Information */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: '#6a1b9a', mb: 2 }}
                >
                  📋 Student Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <PersonIcon sx={{ color: '#6a1b9a', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Student Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {applicationData.firstName} {applicationData.lastName}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <CalendarIcon sx={{ color: '#6a1b9a', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Date of Birth
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {new Date(applicationData.dateOfBirth).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <GenderIcon sx={{ color: '#6a1b9a', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Gender
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {applicationData.gender}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <ClassIcon sx={{ color: '#6a1b9a', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Class Applied For
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {applicationData.classApplied}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Contact Information */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: '#6a1b9a', mb: 2 }}
                >
                  📞 Contact Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <PhoneIcon sx={{ color: '#6a1b9a', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Mobile Number
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {applicationData.mobileNumber}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <PhoneIcon sx={{ color: '#6a1b9a', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Guardian Phone
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {applicationData.guardianPhone}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {applicationData.email && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <EmailIcon sx={{ color: '#6a1b9a', fontSize: 20 }} />
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        Email
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {applicationData.email}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}

              {/* Parent Information */}
              {(applicationData.fatherName || applicationData.motherName) && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, color: '#6a1b9a', mb: 2 }}
                    >
                      👨‍👩‍👧 Parent/Guardian Information
                    </Typography>
                  </Grid>

                  {applicationData.fatherName && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Father's Name
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {applicationData.fatherName}
                      </Typography>
                    </Grid>
                  )}

                  {applicationData.motherName && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Mother's Name
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {applicationData.motherName}
                      </Typography>
                    </Grid>
                  )}
                </>
              )}

              {applicationData.currentAddress && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <LocationIcon sx={{ color: '#6a1b9a', fontSize: 20, mt: 0.5 }} />
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          Current Address
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {applicationData.currentAddress}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
              sx={{
                bgcolor: 'white',
                color: '#6a1b9a',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                '&:hover': {
                  bgcolor: alpha('#ffffff', 0.9),
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Back to Home
            </Button>
          </Box>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              color: alpha('#ffffff', 0.7),
              mt: 2,
            }}
          >
            Auto redirecting to home in {countdown === 3 ? '30' : countdown === 2 ? '20' : '10'}{' '}
            seconds...
          </Typography>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ApplicationSuccessPage;
