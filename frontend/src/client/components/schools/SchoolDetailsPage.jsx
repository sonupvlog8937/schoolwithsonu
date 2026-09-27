import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Avatar,
  Chip,
  CircularProgress,
  Divider,
  alpha,
  Card,
  CardContent,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn,
} from '@mui/icons-material';
import { fetchSchoolDetails, resetSchoolDetails } from '../../../state/publicSchoolSlice';
import { baseUrl } from '../../../environment';

// Helper function to get school image URL
const getSchoolImageSrc = (imageValue) => {
  if (!imageValue) return "";
  if (/^https?:\/\//i.test(imageValue)) return imageValue;
  const apiOrigin = baseUrl.replace(/\/api\/?$/, "");
  return `${apiOrigin}/images/uploaded/school/${imageValue}`;
};

const SchoolDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { schoolDetails, schoolDetailsLoading } = useSelector((state) => state.publicSchool);

  useEffect(() => {
    if (id) {
      dispatch(fetchSchoolDetails(id));
    }
    return () => {
      dispatch(resetSchoolDetails());
    };
  }, [dispatch, id]);

  const handleApplyClick = () => {
    navigate(`/school/${id}/apply`);
  };

  if (schoolDetailsLoading) {
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
        <CircularProgress sx={{ color: '#6a1b9a' }} size={60} />
      </Box>
    );
  }

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
        <Typography variant="h6" color="text.secondary">
          School not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="lg">
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/schools')}
          sx={{
            mb: 3,
            color: '#6a1b9a',
            fontWeight: 600,
            '&:hover': {
              bgcolor: alpha('#6a1b9a', 0.08),
            },
          }}
        >
          Back to All Schools
        </Button>

        <Grid container spacing={4}>
          {/* Left Column - School Image & Quick Info */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                textAlign: 'center',
                border: '2px solid',
                borderColor: '#6a1b9a',
              }}
            >
              <Avatar
                src={getSchoolImageSrc(schoolDetails.school_image)}
                alt={schoolDetails.school_name}
                sx={{
                  width: 180,
                  height: 180,
                  mx: 'auto',
                  mb: 2,
                  border: '4px solid',
                  borderColor: alpha('#6a1b9a', 0.2),
                }}
              />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: '#6a1b9a',
                  mb: 1,
                }}
              >
                {schoolDetails.school_name}
              </Typography>
              <Chip
                icon={<CheckCircleIcon />}
                label="Verified School"
                color="success"
                size="small"
                sx={{ mb: 2, fontWeight: 600 }}
              />
              <Divider sx={{ my: 2 }} />
              <Box sx={{ textAlign: 'left' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <PersonIcon sx={{ color: '#6a1b9a', fontSize: 22 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Director
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {schoolDetails.owner_name}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <EmailIcon sx={{ color: '#6a1b9a', fontSize: 22 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Email
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-all' }}>
                      {schoolDetails.email}
                    </Typography>
                  </Box>
                </Box>
                {schoolDetails.address && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                    <LocationOn sx={{ color: '#6a1b9a', fontSize: 22, mt: 0.5 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Address
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {schoolDetails.address}
                      </Typography>
                    </Box>
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CalendarIcon sx={{ color: '#6a1b9a', fontSize: 22 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Registered Since
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {new Date(schoolDetails.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                      })}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column - Details & Apply */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4, borderRadius: 3, mb: 3 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: '#6a1b9a',
                  mb: 3,
                  fontSize: { xs: '1.75rem', md: '2rem' },
                }}
              >
                About {schoolDetails.school_name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 3 }}>
                Welcome to {schoolDetails.school_name}, a distinguished educational institution committed to
                providing quality education and holistic development for students. Under the leadership of{' '}
                {schoolDetails.owner_name}, our school has been serving the community with excellence.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                We offer a comprehensive curriculum designed to nurture young minds and prepare them for future
                challenges. Our experienced faculty and modern facilities ensure that every student receives the
                best possible education in a supportive environment.
              </Typography>
            </Paper>

            {/* Features */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[
                { label: 'Quality Education', icon: '📚' },
                { label: 'Experienced Faculty', icon: '👨‍🏫' },
                { label: 'Modern Facilities', icon: '🏫' },
                { label: 'Holistic Development', icon: '🌟' },
              ].map((feature, index) => (
                <Grid item xs={6} sm={3} key={index}>
                  <Card
                    sx={{
                      textAlign: 'center',
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: '#6a1b9a',
                        bgcolor: alpha('#6a1b9a', 0.02),
                      },
                    }}
                  >
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      {feature.icon}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      {feature.label}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Apply CTA */}
            <Paper
              sx={{
                p: 4,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #6a1b9a 0%, #8e24aa 100%)',
                color: 'white',
                textAlign: 'center',
              }}
            >
              <SchoolIcon sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                Ready to Join Us?
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                Apply for online admission now and become part of our learning community
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleApplyClick}
                sx={{
                  bgcolor: 'white',
                  color: '#6a1b9a',
                  fontWeight: 700,
                  px: 5,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem',
                  '&:hover': {
                    bgcolor: alpha('#ffffff', 0.9),
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Apply for Admission
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default SchoolDetailsPage;
