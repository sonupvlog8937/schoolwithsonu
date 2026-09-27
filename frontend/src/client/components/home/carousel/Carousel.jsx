


// Carousel.js
import React, { useMemo, useRef, useState } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y } from 'swiper/modules';
import 'swiper/css';

const Carousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef(null);
  const carouselItems = useMemo(
    () => [
      {
        desktopImage: 'https://res.cloudinary.com/dn7ko6gut/image/upload/v1776553369/ChatGPT_Image_Apr_19_2026_04_32_27_AM_q8kxty.png',
        mobileImage: 'https://res.cloudinary.com/dn7ko6gut/image/upload/v1776552858/ChatGPT_Image_Apr_19_2026_04_23_54_AM_sxofft.png',
        title: 'Explore Our Classrooms',
        description: 'Engaging and inspiring environments for every student.',
      },
      {
        desktopImage: 'https://cdn.pixabay.com/photo/2017/10/10/00/03/child-2835430_1280.jpg',
        mobileImage: 'https://cdn.pixabay.com/photo/2017/10/10/00/03/child-2835430_1280.jpg',
        title: 'Empowering Students',
        description: 'We believe in fostering the potential of each child.',
      },
      {
        desktopImage: 'https://cdn.pixabay.com/photo/2019/09/03/01/51/child-4448370_1280.jpg',
        mobileImage: 'https://cdn.pixabay.com/photo/2019/09/03/01/51/child-4448370_1280.jpg',
        title: 'Learning Tools',
        description: 'Providing the right tools for effective learning.',
      },
    ],
    []
  );

  const handleNext = () => {
    swiperRef.current?.slideNext();
  };

  const handleBack = () => {
    swiperRef.current?.slidePrev();
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', borderBottom: '1px solid rgba(15,23,42,0.08)' }}>
      <Swiper
        modules={[A11y]}
        loop
        speed={420}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          setActiveIndex(swiper.realIndex);
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
      >
        {carouselItems.map((item, index) => (
          <SwiperSlide key={index}>
            <Box
              sx={{
                position: 'relative',
                textAlign: 'center',
                color: 'white',
              }}
            >
              <picture>
                <source media="(max-width: 768px)" srcSet={item.mobileImage || item.desktopImage} />
                <img
                  src={item.desktopImage}
                  alt={item.title}
                  style={{ width: '100%', height: '72vh', minHeight: '420px', objectFit: 'cover', display: 'block' }}
                />
              </picture>
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(180deg, rgba(15,23,42,0.65) 0%, rgba(15,23,42,0.10) 45%, rgba(15,23,42,0.75) 100%)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: '50%',
                  bottom: { xs: 22, md: 34 },
                  transform: 'translateX(-50%)',
                  width: { xs: 'calc(100% - 32px)', md: 760 },
                  maxWidth: '100%',
                  bgcolor: 'rgba(2,6,23,0.55)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  px: { xs: 2, md: 3 },
                  py: { xs: 1.6, md: 2.2 },
                  borderRadius: 3,
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: { xs: '1.35rem', md: '2rem' } }}>
                  {item.title}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.6, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
                  {item.description}
                </Typography>
              </Box>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Buttons */}
      <IconButton
        onClick={handleBack}
        aria-label="previous slide"
        sx={{
          position: 'absolute',
          top: '50%',
          left: { xs: 10, md: 18 },
          transform: 'translateY(-50%)',
          zIndex: 2,
          bgcolor: 'rgba(2,6,23,0.55)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.18)',
          backdropFilter: 'blur(10px)',
          '&:hover': { bgcolor: 'rgba(2,6,23,0.7)' },
        }}
      >
        <ArrowBackIosNewIcon fontSize="small" />
      </IconButton>
      <IconButton
        onClick={handleNext}
        aria-label="next slide"
        sx={{
          position: 'absolute',
          top: '50%',
          right: { xs: 10, md: 18 },
          transform: 'translateY(-50%)',
          zIndex: 2,
          bgcolor: 'rgba(2,6,23,0.55)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.18)',
          backdropFilter: 'blur(10px)',
          '&:hover': { bgcolor: 'rgba(2,6,23,0.7)' },
        }}
      >
        <ArrowForwardIosIcon fontSize="small" />
      </IconButton>

      {/* Dots */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 10, md: 14 },
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1,
          zIndex: 2,
        }}
      >
        {carouselItems.map((_, i) => (
          <Box
            key={i}
            onClick={() => swiperRef.current?.slideToLoop(i)}
            role="button"
            aria-label={`go to slide ${i + 1}`}
            tabIndex={0}
            sx={{
              width: i === activeIndex ? 26 : 10,
              height: 10,
              borderRadius: 999,
              bgcolor: i === activeIndex ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)',
              cursor: 'pointer',
              transition: 'all 160ms ease',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.85)' },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default Carousel;
