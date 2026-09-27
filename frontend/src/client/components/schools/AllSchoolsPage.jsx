import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  TextField,
  InputAdornment,
  Pagination,
  CircularProgress,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  School as SchoolIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { fetchAllSchools, clearMessages } from '../../../state/publicSchoolSlice';
import { baseUrl } from '../../../environment';

// Helper function to get school image URL
const getSchoolImageSrc = (imageValue) => {
  if (!imageValue) return "";
  if (/^https?:\/\//i.test(imageValue)) return imageValue;
  const apiOrigin = baseUrl.replace(/\/api\/?$/, "");
  return `${apiOrigin}/images/uploaded/school/${imageValue}`;
};

const AllSchoolsPage = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { allSchools, allSchoolsLoading, allSchoolsPagination } = useSelector(
    (state) => state.publicSchool
  );

  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchAllSchools({ page, limit: 12, search: searchInput }));
  }, [dispatch, page, searchInput]);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSchoolClick = (schoolId) => {
    navigate(`/school/${schoolId}`);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Chip
            icon={<SchoolIcon />}
            label="All Schools"
            sx={{
              bgcolor: alpha('#6a1b9a', 0.1),
              color: '#6a1b9a',
              fontWeight: 700,
              mb: 2,
              fontSize: '0.875rem',
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: '#6a1b9a',
              mb: 1,
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
          >
            Explore Our Schools
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Browse through our network of registered schools and find the perfect institution for your child
          </Typography>
        </Box>

        {/* Search Bar */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <TextField
            placeholder="Search schools by name or director..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            sx={{
              maxWidth: 600,
              width: '100%',
              bgcolor: 'white',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#6a1b9a' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Loading State */}
        {allSchoolsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#6a1b9a' }} />
          </Box>
        ) : allSchools.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <SchoolIcon sx={{ fontSize: 80, color: '#e0e0e0', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No schools found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search criteria
            </Typography>
          </Box>
        ) : (
          <>
            {/* Schools Grid */}
            <Grid container spacing={3}>
              {allSchools.map((school) => (
                <Grid item xs={12} sm={6} md={4} key={school._id}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 12px 24px ${alpha('#6a1b9a', 0.15)}`,
                        borderColor: '#6a1b9a',
                      },
                    }}
                  >
                    <CardActionArea onClick={() => handleSchoolClick(school._id)}>
                      <CardMedia
                        component="img"
                        height="180"
                        image={getSchoolImageSrc(school.school_image)}
                        alt={school.school_name}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent sx={{ p: 2.5 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: '#6a1b9a',
                            mb: 1,
                            fontSize: '1.1rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: '2.6em',
                          }}
                        >
                          {school.school_name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Director: {school.owner_name}
                          </Typography>
                        </Box>
                        <Chip
                          label="View Details"
                          size="small"
                          sx={{
                            bgcolor: alpha('#6a1b9a', 0.1),
                            color: '#6a1b9a',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            mt: 1,
                          }}
                        />
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {allSchoolsPagination.pages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <Pagination
                  count={allSchoolsPagination.pages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontWeight: 600,
                      '&.Mui-selected': {
                        bgcolor: '#6a1b9a',
                        color: 'white',
                        '&:hover': {
                          bgcolor: '#7b1fa2',
                        },
                      },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default AllSchoolsPage;
