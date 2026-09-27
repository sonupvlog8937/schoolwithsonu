import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Divider,
  Grid2,
  IconButton,
  Link,
  Typography,
  Button,
  Snackbar,
  Alert,
  alpha,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { APP_NAME, LOGO_URL } from '../../../branding';

// ─── Design tokens: white + orange (same family used across the site) ───
const C = {
  navy: '#1c1917',
  orange: '#f97316',
  orangeDark: '#ea580c',
};

const PRODUCT_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', to: '/contact', route: true },
];

const COMPANY_LINKS = ['About', 'Blog', 'Careers', 'Press'];

const SOCIALS = [FacebookIcon, TwitterIcon, LinkedInIcon, YouTubeIcon];

export default function Footer() {
  const [newsletterOpen, setNewsletterOpen] = useState(false);

  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        color: 'rgba(255,255,255,0.75)',
        background: `linear-gradient(180deg, ${C.navy} 0%, #111827 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <Grid2 container spacing={4}>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box
                component="img"
                src={LOGO_URL}
                alt={`${APP_NAME} logo`}
                sx={{ width: 34, height: 34, borderRadius: 1.5, objectFit: 'cover' }}
              />
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#ffffff', fontSize: '1.25rem' }}>
                {APP_NAME}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2, maxWidth: 300, color: alpha('#f5f5f4', 0.85), fontSize: '0.85rem', lineHeight: 1.7 }}>
              Empowering schools with cutting-edge digital solutions. Trusted by 500+ institutions across India.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {SOCIALS.map((Icon, i) => (
                <IconButton
                  key={i}
                  aria-label="social link"
                  sx={{
                    color: alpha('#f5f5f4', 0.8),
                    '&:hover': { color: '#ffffff', bgcolor: alpha(C.orange, 0.18) },
                  }}
                >
                  <Icon fontSize="small" />
                </IconButton>
              ))}
            </Box>
          </Grid2>

          <Grid2 size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 700, mb: 2 }}>
              Product
            </Typography>
            {PRODUCT_LINKS.map((item) => (
              <Link
                key={item.label}
                component={item.route ? RouterLink : 'a'}
                href={item.route ? undefined : item.href}
                to={item.route ? item.to : undefined}
                underline="none"
                sx={{
                  display: 'block',
                  color: alpha('#f5f5f4', 0.85),
                  fontSize: '0.9rem',
                  mb: 1,
                  '&:hover': { color: C.orange },
                }}
              >
                {item.label}
              </Link>
            ))}
          </Grid2>

          <Grid2 size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 700, mb: 2 }}>
              Company
            </Typography>
            {COMPANY_LINKS.map((text) => (
              <Link
                key={text}
                href="#"
                underline="none"
                sx={{
                  display: 'block',
                  color: alpha('#f5f5f4', 0.85),
                  fontSize: '0.9rem',
                  mb: 1,
                  '&:hover': { color: C.orange },
                }}
              >
                {text}
              </Link>
            ))}
          </Grid2>

          <Grid2 size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 700, mb: 2 }}>
              Subscribe to our newsletter
            </Typography>
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                setNewsletterOpen(true);
              }}
              sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}
            >
              <input
                type="email"
                name="email"
                required
                placeholder="Your email"
                style={{
                  flex: 1,
                  minWidth: 200,
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '1px solid #334155',
                  backgroundColor: '#1e293b',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                }}
              />
              <Button
                type="submit"
                variant="contained"
                disableElevation
                sx={{
                  bgcolor: C.orange,
                  fontWeight: 700,
                  '&:hover': { bgcolor: C.orangeDark },
                }}
              >
                Subscribe
              </Button>
            </Box>
          </Grid2>
        </Grid2>

        <Divider sx={{ borderColor: '#1e293b', my: 4 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="caption" sx={{ color: alpha('#f5f5f4', 0.75) }}>
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="#" underline="hover" sx={{ color: alpha('#f5f5f4', 0.75), fontSize: '0.8rem', '&:hover': { color: C.orange } }}>
              Privacy Policy
            </Link>
            <Link href="#" underline="hover" sx={{ color: alpha('#f5f5f4', 0.75), fontSize: '0.8rem', '&:hover': { color: C.orange } }}>
              Terms of Service
            </Link>
          </Box>
        </Box>
      </Container>

      <Snackbar
        open={newsletterOpen}
        autoHideDuration={5000}
        onClose={() => setNewsletterOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setNewsletterOpen(false)} severity="success" variant="filled" sx={{ width: '100%' }}>
          Thanks — you are on the list. We will send updates to your inbox.
        </Alert>
      </Snackbar>
    </Box>
  );
}