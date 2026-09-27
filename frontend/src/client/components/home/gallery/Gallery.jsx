import React, { useEffect, useMemo, useState } from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Button,
  ImageListItemBar,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import axios from 'axios';
import { baseUrl } from '../../../../environment';

// const images = [
//   { id: 1, src: 'https://cdn.pixabay.com/photo/2023/08/09/15/06/child-8179655_1280.jpg', title: 'Beautiful Landscape' },
//   { id: 2, src: 'https://cdn.pixabay.com/photo/2022/05/24/04/38/study-7217599_1280.jpg', title: 'Mountain View' },
//   { id: 3, src: 'https://cdn.pixabay.com/photo/2020/11/19/08/03/college-5757815_1280.jpg', title: 'Ocean Sunset' },
//   { id: 4, src: 'https://cdn.pixabay.com/photo/2020/02/06/20/01/university-library-4825366_1280.jpg', title: 'City Lights' },
//   { id: 5, src: 'https://cdn.pixabay.com/photo/2024/08/23/11/55/building-8991569_1280.jpg', title: 'Forest Path' },
//   { id: 6, src: 'https://cdn.pixabay.com/photo/2021/08/20/14/53/monastery-6560623_1280.jpg', title: 'Desert Dunes' },
// ];

const Gallery = () => {
  const [open, setOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const cols = isXs ? 1 : isSm ? 2 : 3;

  const apiOrigin = useMemo(() => baseUrl.replace(/\/api\/?$/, ""), []);
  const getSchoolImageSrc = (imageValue) => {
    if (!imageValue) return "";
    if (/^https?:\/\//i.test(imageValue)) return imageValue;
    return `${apiOrigin}/images/uploaded/school/${imageValue}`;
  };

  const handleOpen = (school) => {
    setSelectedSchool(school);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedSchool(null);
  };


  useEffect(()=>{
    setLoading(true);
    setError("");

    axios.get(`${baseUrl}/school/all`).then(resp=>{
        setSchools(resp.data.data || []);
    }).catch(e=>{
        console.log("ERROR", e);
        setError("Registered schools could not be loaded right now.");
        setSchools([]);
    }).finally(() => {
      setLoading(false);
    });
  },[])

  const filteredSchools = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return schools;
    return (schools || []).filter((s) => (s.school_name || "").toLowerCase().includes(q));
  }, [schools, query]);

  return (
    <>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          size="small"
          placeholder="Search school name..."
          sx={{ width: { xs: "100%", sm: 320 } }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          {loading ? "Loading..." : `${filteredSchools.length} school${filteredSchools.length === 1 ? "" : "s"}`}
        </Typography>
      </Stack>

      {error ? <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert> : null}

      <ImageList variant="masonry" cols={cols} gap={10} sx={{ p: 0, m: 0 }}>
        {loading ? (
          Array.from({ length: cols * 2 }).map((_, idx) => (
            <ImageListItem key={`sk-${idx}`} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Skeleton variant="rectangular" height={260} />
            </ImageListItem>
          ))
        ) : null}

        {!loading && filteredSchools.map((school,i) => (
          <ImageListItem
            key={school._id || i}
            sx={{
              cursor: 'pointer',
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid rgba(15,23,42,0.10)',
              bgcolor: '#fff',
              boxShadow: '0 10px 30px rgba(2,6,23,0.06)',
              transition: 'transform 180ms ease, box-shadow 180ms ease',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 18px 48px rgba(2,6,23,0.10)' },
            }}
            onClick={() => handleOpen(school)}
          >
            {school.school_image ? (
              <img
                src={getSchoolImageSrc(school.school_image)}
                alt={school.school_name || "School"}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.style.display = "none";
                }}
                style={{ width: '100%', display: 'block' }}
              />
            ) : (
              <Box
                sx={{
                  height: 240,
                  background: 'linear-gradient(135deg, rgba(37,99,235,0.85), rgba(124,58,237,0.75), rgba(15,118,110,0.7))',
                }}
              />
            )}
            <ImageListItemBar
              title={
                <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
                  {school.school_name || "Unnamed school"}
                </Typography>
              }
              subtitle={
                <Typography sx={{ opacity: 0.85, fontSize: '0.8rem' }}>
                  Tap to view
                </Typography>
              }
              sx={{
                background: 'linear-gradient(180deg, rgba(2,6,23,0.00) 0%, rgba(2,6,23,0.78) 100%)',
                '& .MuiImageListItemBar-titleWrap': { pb: 1.25 },
              }}
            />
         
          </ImageListItem>
        ))}
      </ImageList>

      {!loading && !error && filteredSchools.length === 0 ? (
        <Box sx={{ mt: 2, p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
          <Typography sx={{ fontWeight: 800, color: '#0f172a' }}>No schools found</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Try a different search query.
          </Typography>
          <Button onClick={() => setQuery("")} sx={{ mt: 1.5, textTransform: "none", fontWeight: 700 }}>
            Clear search
          </Button>
        </Box>
      ) : null}

      {/* Lightbox Modal */}
      <Modal open={open} onClose={handleClose} closeAfterTransition>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            outline: 'none',
            p: { xs: 1.5, md: 2 },
            borderRadius: 3,
            width: { xs: 'calc(100% - 24px)', sm: 720 },
            maxHeight: '90vh',
            overflow: 'auto',
          }}
        >
          <Box position="relative">
            <IconButton
              onClick={handleClose}
              sx={{ position: 'absolute', top: 8, right: 8, color: 'grey.500', bgcolor: 'rgba(255,255,255,0.7)', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
            >
              <CloseIcon />
            </IconButton>
            <Typography variant='h4' sx={{ fontWeight: 900, letterSpacing: '-0.02em', pr: 6 }}>
              {selectedSchool && selectedSchool.school_name}
            </Typography>
            {selectedSchool?.school_image ? (
              <img
                src={getSchoolImageSrc(selectedSchool.school_image)}
                alt={selectedSchool.school_name || "School"}
                style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 14, marginTop: 12, display: 'block' }}
              />
            ) : (
              <Box sx={{ mt: 2 }}>
                <Alert severity="info">No image available for this school.</Alert>
              </Box>
            )}
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default Gallery;
