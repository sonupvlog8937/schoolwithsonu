import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Typography,
  Grid2,
  Card,
  CardContent,
  Box,
  Container,
  Button,
  Avatar,
  Chip,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fab,
  Zoom,
  Link,
  alpha,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import Carousel from './carousel/Carousel';
import { fetchTopSchools } from '../../../state/publicSchoolSlice';
import { baseUrl } from '../../../environment';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import SchoolIcon from '@mui/icons-material/School';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import GroupsIcon from '@mui/icons-material/Groups';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PaymentIcon from '@mui/icons-material/Payment';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import DevicesIcon from '@mui/icons-material/Devices';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VerifiedIcon from '@mui/icons-material/Verified';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChatIcon from '@mui/icons-material/Chat';
import LoginIcon from '@mui/icons-material/Login';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { APP_NAME, LOGO_URL } from '../../../branding';

// ─── Fixed light / colourful design tokens (theme stays white, regardless of app dark-mode) ───
const C = {
  page: '#ffffff',
  paper: '#ffffff',
  sectionAlt: '#f8fafc',
  border: '#e6e9f0',
  heading: '#0f172a',
  body: '#5b6472',
  muted: '#94a3b8',
  primary: '#4f46e5',
  primaryDark: '#3730a3',
  primarySoft: '#eef2ff',
  navy: '#0f172a',
};

// Helper function to get school image URL
const getSchoolImageSrc = (imageValue) => {
  if (!imageValue) return '';
  if (/^https?:\/\//i.test(imageValue)) return imageValue;
  const apiOrigin = baseUrl.replace(/\/api\/?$/, '');
  return `${apiOrigin}/images/uploaded/school/${imageValue}`;
};

// ─── Animated Counter ────────────────────────────────────────────────
const AnimatedCounter = ({ target, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const numTarget = parseInt(target.replace(/\D/g, ''), 10) || 0;
    let current = 0;
    const step = Math.max(1, Math.ceil(numTarget / 60));
    const timer = setInterval(() => {
      current = Math.min(current + step, numTarget);
      setCount(current);
      if (current >= numTarget) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [started, target]);

  return <span ref={ref}>{count}{suffix}</span>;
};

// ─── Section Heading ─────────────────────────────────────────────────
const SectionHeading = ({ badge, title, subtitle, align = 'center' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.5 }}
  >
    {badge && (
      <Box sx={{ display: 'flex', justifyContent: align === 'center' ? 'center' : 'flex-start', mb: 1.5 }}>
        <Chip
          label={badge}
          size="small"
          sx={{
            bgcolor: C.primarySoft,
            color: C.primary,
            fontWeight: 700,
            fontSize: '0.66rem',
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            border: `1px solid ${alpha(C.primary, 0.25)}`,
            px: 1,
            height: 24,
          }}
        />
      </Box>
    )}
    <Typography
      variant="h2"
      textAlign={align}
      sx={{
        fontWeight: 800,
        color: C.heading,
        fontSize: { xs: '1.5rem', md: '1.95rem' },
        lineHeight: 1.25,
        letterSpacing: '-0.01em',
        mb: subtitle ? 1.5 : 0,
      }}
    >
      {title}
    </Typography>
    {subtitle && (
      <Typography
        variant="body2"
        textAlign={align}
        sx={{ color: C.body, maxWidth: 560, mx: align === 'center' ? 'auto' : 0, lineHeight: 1.7, fontSize: '0.92rem' }}
      >
        {subtitle}
      </Typography>
    )}
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────
const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { topSchools, topSchoolsLoading } = useSelector((state) => state.publicSchool);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [showFab, setShowFab] = useState(false);
  const [newsletterOpen, setNewsletterOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);
  const handleScroll = () => setShowFab(window.scrollY > 400);
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    dispatch(fetchTopSchools());
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dispatch]);

  useEffect(() => {
    const onHashNavigate = () => {
      const id = window.location.hash?.replace('#', '');
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    onHashNavigate();
    window.addEventListener('hashchange', onHashNavigate);
    return () => window.removeEventListener('hashchange', onHashNavigate);
  }, []);

  const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  };

  const STATS = useMemo(() => [
    { label: 'Registered Schools', value: '500', suffix: '+', icon: <SchoolIcon sx={{ fontSize: 26 }} />, color: '#3b82f6', bg: '#eff6ff', growth: '+12% this year' },
    { label: 'Happy Parents', value: '10000', suffix: '+', icon: <GroupsIcon sx={{ fontSize: 26 }} />, color: '#10b981', bg: '#ecfdf5', growth: '98% satisfaction rate' },
    { label: 'Awards Won', value: '25', suffix: '+', icon: <WorkspacePremiumIcon sx={{ fontSize: 26 }} />, color: '#f59e0b', bg: '#fffbeb', growth: 'National recognition' },
    { label: 'Years of Trust', value: '8', suffix: '+', icon: <VerifiedIcon sx={{ fontSize: 26 }} />, color: '#8b5cf6', bg: '#f5f3ff', growth: 'Established 2016' },
  ], []);

  const FEATURES = useMemo(() => [
    { title: 'Smart Attendance', desc: 'Biometric & app-based tracking for students and staff, with automated daily reports for parents.', icon: <AssessmentIcon sx={{ fontSize: 24 }} />, color: '#3b82f6', bg: '#eff6ff', highlights: ['Face recognition', 'SMS alerts', 'Monthly reports'] },
    { title: 'Fee Management', desc: 'Secure online payments, automated reminders, and instant GST-compliant receipt generation.', icon: <PaymentIcon sx={{ fontSize: 24 }} />, color: '#10b981', bg: '#ecfdf5', highlights: ['UPI & cards', 'Auto reminders', 'Instant receipts'] },
    { title: 'Instant Notifications', desc: 'Real-time alerts for exams, holidays, results, and announcements sent directly to parents.', icon: <NotificationsActiveIcon sx={{ fontSize: 24 }} />, color: '#f59e0b', bg: '#fffbeb', highlights: ['Push & SMS', 'Multi-language', 'Scheduled alerts'] },
    { title: 'Academic Reports', desc: 'Digital report cards, grade tracking, and subject-wise performance analytics.', icon: <TrendingUpIcon sx={{ fontSize: 24 }} />, color: '#8b5cf6', bg: '#f5f3ff', highlights: ['Grade analytics', 'PDF export', 'Parent portal'] },
    { title: 'Data Security', desc: 'Enterprise-grade 256-bit SSL encryption with regular backups and compliant data handling.', icon: <SecurityIcon sx={{ fontSize: 24 }} />, color: '#ef4444', bg: '#fef2f2', highlights: ['SSL encrypted', 'GDPR compliant', 'Daily backups'] },
    { title: '24/7 Support', desc: 'Dedicated customer success team available round-the-clock via chat, call, and remote assistance.', icon: <SupportAgentIcon sx={{ fontSize: 24 }} />, color: '#06b6d4', bg: '#ecfeff', highlights: ['Live chat', 'Phone support', 'Remote access'] },
  ], []);

  const TESTIMONIALS = useMemo(() => [
    { name: 'Rajesh Kumar Sharma', role: 'Principal, Delhi Public School', text: 'Our administrative workload dropped by 60% in the first month. Fee collection alone saved 30+ hours weekly.', rating: 5, avatar: 'R', avatarColor: '#3b82f6', verified: true },
    { name: 'Priya Verma', role: 'Parent & PTA Chairperson', text: "I can track my son's attendance, see his marks, and pay fees in under 2 minutes — all from my phone.", rating: 5, avatar: 'P', avatarColor: '#10b981', verified: true },
    { name: 'Suresh Agarwal', role: 'School Owner, 3 Branches', text: 'Managing three schools from one dashboard is a game-changer. ROI was visible within the first quarter.', rating: 5, avatar: 'S', avatarColor: '#8b5cf6', verified: true },
  ], []);

  const PLANS = useMemo(() => [
    { name: 'Starter', price: '₹4,999', period: '/month', desc: 'Perfect for small schools', features: ['Up to 500 students', 'Attendance tracking', 'Basic fee management', 'Email support'], color: '#64748b', highlight: false },
    { name: 'Professional', price: '₹9,999', period: '/month', desc: 'Most popular for growing schools', features: ['Up to 2000 students', 'All Starter features', 'Analytics dashboard', 'SMS notifications', 'Priority support', 'Custom branding'], color: C.primary, highlight: true },
    { name: 'Enterprise', price: 'Custom', period: 'pricing', desc: 'For large school chains', features: ['Unlimited students', 'Multi-branch management', 'API access', 'Dedicated manager', 'SLA guarantee', 'On-site training'], color: '#8b5cf6', highlight: false },
  ], []);

  const TRUST_LOGOS = useMemo(() => ['CBSE Affiliated', 'ICSE Board', 'State Board', 'ISO 9001:2015', 'NASSCOM Member'], []);

  const FAQ_ITEMS = useMemo(() => [
    { question: 'How quickly can we get started?', answer: 'Setup takes less than 24 hours. We provide free data migration and a dedicated onboarding specialist to ensure a smooth transition.' },
    { question: 'Is my data secure?', answer: 'Absolutely. We use 256-bit SSL encryption, regular backups, and comply with GDPR and Indian data protection laws.' },
    { question: 'Can parents access the system?', answer: 'Yes, parents get their own portal and mobile app to view attendance, grades, fees, and receive instant notifications.' },
    { question: 'Do you offer training for staff?', answer: 'We provide free live training sessions, video tutorials, and 24/7 support to help your staff become proficient quickly.' },
  ], []);

  const navItems = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', to: '/contact', isRoute: true },
  ];

  const drawer = (
    <Box sx={{ textAlign: 'center', py: 2, bgcolor: C.paper }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: C.heading }}>{APP_NAME}</Typography>
        <IconButton onClick={handleDrawerToggle} aria-label="close menu" size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Divider sx={{ my: 2, borderColor: C.border }} />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.isRoute ? item.to : item.href} disablePadding>
            <ListItemButton
              component={item.isRoute ? RouterLink : 'a'}
              href={item.isRoute ? undefined : item.href}
              to={item.isRoute ? item.to : undefined}
              onClick={() => setMobileOpen(false)}
              sx={{ textAlign: 'center' }}
            >
              <ListItemText primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/login" sx={{ textAlign: 'center' }}>
            <ListItemText
              primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 700, color: C.primary }}
              primary="Login"
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ width: '100%', overflowX: 'hidden', bgcolor: C.page }}>
      {/* ─── Navigation Bar ───────────────────────────────────────────── */}
      <AppBar
        position="sticky"
        color="default"
        elevation={0}
        sx={{ bgcolor: alpha('#ffffff', 0.92), backdropFilter: 'blur(8px)', borderBottom: `1px solid ${C.border}` }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 0 }, minHeight: { xs: 60, md: 68 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="img" src={LOGO_URL} alt={`${APP_NAME} logo`} sx={{ width: 30, height: 30, borderRadius: 1.5, objectFit: 'cover' }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: C.heading, letterSpacing: '-0.01em', fontSize: '1.15rem' }}>
                {APP_NAME}
              </Typography>
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, alignItems: 'center' }}>
              {navItems.map((item) =>
                item.isRoute ? (
                  <Link key={item.to} component={RouterLink} to={item.to} underline="none" sx={{ fontWeight: 600, fontSize: '0.88rem', color: C.body, '&:hover': { color: C.primary } }}>
                    {item.label}
                  </Link>
                ) : (
                  <Link key={item.href} href={item.href} underline="none" sx={{ fontWeight: 600, fontSize: '0.88rem', color: C.body, '&:hover': { color: C.primary } }}>
                    {item.label}
                  </Link>
                )
              )}
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                size="small"
                disableElevation
                sx={{ borderRadius: 2, fontWeight: 700, px: 2.5, fontSize: '0.85rem', bgcolor: C.primary, '&:hover': { bgcolor: C.primaryDark } }}
              >
                Login
              </Button>
            </Box>
            {/* Mobile actions: Login (left) + Menu (right) */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                size="small"
                disableElevation
                startIcon={<LoginIcon sx={{ fontSize: 16 }} />}
                sx={{ borderRadius: 999, fontWeight: 700, textTransform: 'none', px: 1.5, fontSize: '0.8rem', minHeight: 34, bgcolor: C.primary }}
              >
                Login
              </Button>
              <IconButton
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
                size="small"
                sx={{ borderRadius: 2, border: `1px solid ${C.border}`, bgcolor: '#f8fafc' }}
              >
                <MenuIcon fontSize="small" />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 } }}
      >
        {drawer}
      </Drawer>

      {/* ── 1. Hero / Carousel ── */}
      <Box sx={{ position: 'relative', mb: { xs: 4, md: 6 } }}>
        <Carousel />
        <Box sx={{
          position: 'absolute', bottom: { xs: -16, md: -20 }, left: '50%', transform: 'translateX(-50%)',
          bgcolor: C.paper, borderRadius: 100, px: 2.5, py: 1,
          boxShadow: `0 8px 28px ${alpha('#0f172a', 0.12)}`,
          display: 'flex', alignItems: 'center', gap: 1.2,
          border: `1px solid ${C.border}`, zIndex: 10, whiteSpace: 'nowrap',
        }}>
          <Box sx={{ display: 'flex' }}>
            {['#ef4444', '#f59e0b', '#10b981'].map((c, i) => (
              <Avatar key={i} sx={{ width: 24, height: 24, bgcolor: c, fontSize: 10, ml: i > 0 ? -0.8 : 0, border: `2px solid ${C.paper}`, fontWeight: 700 }}>
                {['R', 'P', 'S'][i]}
              </Avatar>
            ))}
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: C.heading, fontSize: '0.72rem' }}>
            Trusted by 500+ schools across India
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.2 }}>
            {[...Array(5)].map((_, i) => <StarIcon key={i} sx={{ fontSize: 12, color: '#f59e0b' }} />)}
          </Box>
        </Box>
      </Box>

      {/* ── 2. Stats ── */}
      <Container maxWidth="lg" sx={{ pt: { xs: 5, md: 7 }, pb: { xs: 6, md: 9 } }}>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <Grid2 container spacing={2.5}>
            {STATS.map((stat, i) => (
              <Grid2 size={{ xs: 6, md: 3 }} key={i}>
                <motion.div variants={itemUp}>
                  <Box sx={{
                    p: { xs: 2, md: 3 }, borderRadius: 3, bgcolor: C.paper,
                    border: `1px solid ${C.border}`,
                    transition: 'all 0.25s ease',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 16px 32px ${alpha('#0f172a', 0.08)}`, borderColor: stat.color },
                  }}>
                    <Box sx={{ width: 46, height: 46, borderRadius: 2, bgcolor: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, mb: 1.5 }}>
                      {stat.icon}
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: C.heading, fontSize: { xs: '1.3rem', md: '1.6rem' }, lineHeight: 1 }}>
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    </Typography>
                    <Typography variant="body2" sx={{ color: C.body, fontWeight: 600, mt: 0.5, mb: 1, fontSize: '0.82rem' }}>{stat.label}</Typography>
                    <Typography variant="caption" sx={{ color: stat.color, fontWeight: 700, fontSize: '0.66rem', bgcolor: stat.bg, px: 1, py: 0.35, borderRadius: 1 }}>
                      {stat.growth}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid2>
            ))}
          </Grid2>
        </motion.div>
      </Container>

      {/* ── 3. Trust Bar ── */}
      <Box sx={{ py: 2, overflow: 'hidden', bgcolor: C.navy, borderBlock: `1px solid ${alpha(C.primary, 0.3)}` }}>
        <Box sx={{ display: 'flex', gap: 5, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
          {TRUST_LOGOS.map((logo, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <VerifiedIcon sx={{ fontSize: 14, color: '#93c5fd' }} />
              <Typography variant="caption" sx={{ color: alpha('#e2e8f0', 0.92), fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.64rem' }}>
                {logo}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── 4. Features ── */}
      <Box id="features" sx={{ scrollMarginTop: 92, py: { xs: 7, md: 10 }, bgcolor: C.sectionAlt }}>
        <Container maxWidth="lg">
          <SectionHeading
            badge="Platform Features"
            title="Everything your school needs"
            subtitle="A complete digital ecosystem designed to streamline school administration and enhance parent-teacher collaboration."
          />
          <Box sx={{ height: { xs: 32, md: 44 } }} />
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <Grid2 container spacing={2.5}>
              {FEATURES.map((f, i) => (
                <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                  <motion.div variants={itemUp} style={{ height: '100%' }}>
                    <Box sx={{
                      p: 3, borderRadius: 3, border: `1px solid ${C.border}`, bgcolor: C.paper,
                      height: '100%', display: 'flex', flexDirection: 'column',
                      transition: 'all 0.25s ease',
                      '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 12px 32px ${f.color}1f`, borderColor: f.color },
                    }}>
                      <Box sx={{ width: 46, height: 46, borderRadius: 2, bgcolor: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, mb: 2 }}>
                        {f.icon}
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: C.heading, mb: 0.75, fontSize: '0.95rem' }}>{f.title}</Typography>
                      <Typography variant="body2" sx={{ color: C.body, lineHeight: 1.65, mb: 2, flex: 1, fontSize: '0.84rem' }}>{f.desc}</Typography>
                      <Divider sx={{ mb: 1.5, borderColor: C.border }} />
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {f.highlights.map((h, j) => (
                          <Box key={j} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CheckCircleIcon sx={{ fontSize: 13, color: f.color }} />
                            <Typography variant="caption" sx={{ fontWeight: 600, color: C.body, fontSize: '0.68rem' }}>{h}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </motion.div>
                </Grid2>
              ))}
            </Grid2>
          </motion.div>
        </Container>
      </Box>

      {/* ── 5. Platform Highlight Banner ── */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: C.primarySoft, borderTop: `1px solid ${alpha(C.primary, 0.15)}`, borderBottom: `1px solid ${alpha(C.primary, 0.15)}` }}>
        <Container maxWidth="lg">
          <Grid2 container spacing={4} alignItems="center">
            <Grid2 size={{ xs: 12, md: 6 }}>
              <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                <Chip label="Cross-Platform" size="small" sx={{ bgcolor: alpha(C.primary, 0.14), color: C.primary, fontWeight: 700, mb: 1.5, fontSize: '0.64rem', height: 22 }} />
                <Typography variant="h5" sx={{ fontWeight: 800, color: C.heading, mb: 1.5, lineHeight: 1.3, fontSize: { xs: '1.35rem', md: '1.55rem' } }}>
                  Works on every device, anytime, anywhere
                </Typography>
                <Typography variant="body2" sx={{ color: C.body, lineHeight: 1.7, mb: 2.5, fontSize: '0.88rem' }}>
                  Access your school dashboard from any browser, Android or iOS app. Optimized for a mobile-first experience with offline sync.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {['Android App', 'iOS App', 'Web Dashboard', 'Admin Panel'].map((item) => (
                    <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <CheckCircleIcon sx={{ fontSize: 14, color: '#3b82f6' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: C.heading, fontSize: '0.82rem' }}>{item}</Typography>
                    </Box>
                  ))}
                </Box>
              </motion.div>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                <Box sx={{ bgcolor: C.paper, borderRadius: 4, p: 3, boxShadow: `0 8px 28px ${alpha(C.primary, 0.1)}`, border: `1px solid ${alpha(C.primary, 0.2)}`, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[
                    { label: 'Average Setup Time', value: '< 24 hours', icon: <SpeedIcon sx={{ fontSize: 18, color: '#3b82f6' }} /> },
                    { label: 'Uptime Guarantee', value: '99.9% SLA', icon: <SecurityIcon sx={{ fontSize: 18, color: '#10b981' }} /> },
                    { label: 'Data Migration', value: 'Free & Assisted', icon: <DevicesIcon sx={{ fontSize: 18, color: '#f59e0b' }} /> },
                    { label: 'Dedicated Support', value: '24 × 7 × 365', icon: <SupportAgentIcon sx={{ fontSize: 18, color: '#8b5cf6' }} /> },
                  ].map((item, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: C.sectionAlt, borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        {item.icon}
                        <Typography variant="body2" sx={{ color: C.body, fontWeight: 600, fontSize: '0.82rem' }}>{item.label}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: C.heading, fontSize: '0.82rem' }}>{item.value}</Typography>
                    </Box>
                  ))}
                </Box>
              </motion.div>
            </Grid2>
          </Grid2>
        </Container>
      </Box>

      {/* ── 6. How It Works ── */}
      <Box sx={{ py: { xs: 7, md: 10 }, bgcolor: C.paper }}>
        <Container maxWidth="lg">
          <SectionHeading badge="Simple Process" title="How to get started in 3 easy steps" subtitle="From signup to full deployment — we handle everything for you." />
          <Box sx={{ height: { xs: 32, md: 44 } }} />
          <Grid2 container spacing={3} justifyContent="center">
            {[
              { step: '01', title: 'Book a Demo', desc: 'Schedule a 30-minute call with our education specialist to understand your needs.' },
              { step: '02', title: 'Personalized Setup', desc: 'We migrate your data, configure the system, and train your staff — all for free.' },
              { step: '03', title: 'Go Live & Succeed', desc: 'Launch within 24 hours and enjoy ongoing 24/7 support and regular updates.' },
            ].map((item, idx) => (
              <Grid2 size={{ xs: 12, md: 4 }} key={idx}>
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}>
                  <Box sx={{ textAlign: 'center', p: 2.5 }}>
                    <Typography sx={{ fontWeight: 800, color: alpha(C.primary, 0.2), fontSize: '3.4rem', lineHeight: 1 }}>
                      {item.step}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: -1.5, mb: 0.75, fontSize: '1.05rem', color: C.heading }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: C.body, fontSize: '0.85rem' }}>
                      {item.desc}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid2>
            ))}
          </Grid2>
        </Container>
      </Box>

      {/* ── 7. Top 10 Registered Schools ── */}
      <Box id="gallery" sx={{ scrollMarginTop: 92, py: { xs: 7, md: 10 }, bgcolor: C.sectionAlt }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Chip label="Our Network" size="small" sx={{ bgcolor: '#ecfdf5', color: '#059669', fontWeight: 700, mb: 1, fontSize: '0.64rem', height: 22 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: C.heading, lineHeight: 1.25, fontSize: '1.4rem' }}>Registered Schools</Typography>
              <Typography variant="body2" sx={{ color: C.body, mt: 0.5, fontSize: '0.85rem' }}>Growing network of digitally empowered institutions</Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
              onClick={() => navigate('/schools')}
              sx={{ borderRadius: 2, borderColor: C.border, color: C.heading, fontWeight: 700, fontSize: '0.82rem', '&:hover': { borderColor: C.primary, color: C.primary, bgcolor: C.primarySoft } }}
            >
              View All Schools
            </Button>
          </Box>

          {topSchoolsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={32} sx={{ color: C.primary }} />
            </Box>
          ) : topSchools && topSchools.length > 0 ? (
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <Grid2 container spacing={2.5}>
                {topSchools.slice(0, 10).map((school) => (
                  <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={school._id}>
                    <motion.div variants={itemUp}>
                      <Card
                        sx={{
                          height: '100%',
                          borderRadius: 3,
                          border: `1px solid ${C.border}`,
                          boxShadow: 'none',
                          transition: 'all 0.25s ease',
                          cursor: 'pointer',
                          '&:hover': { transform: 'translateY(-6px)', boxShadow: `0 12px 24px ${alpha(C.primary, 0.14)}`, borderColor: C.primary },
                        }}
                        onClick={() => navigate(`/school/${school._id}`)}
                      >
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                          <Avatar
                            src={getSchoolImageSrc(school.school_image)}
                            alt={school.school_name}
                            sx={{ width: 68, height: 68, mx: 'auto', mb: 1.25, border: `3px solid ${C.primarySoft}` }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700, color: C.heading, mb: 0.5, fontSize: '0.82rem',
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                              overflow: 'hidden', minHeight: '2.4em',
                            }}
                          >
                            {school.school_name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: C.muted, fontSize: '0.68rem' }}>
                            {school.owner_name}
                          </Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid2>
                ))}
              </Grid2>
            </motion.div>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <SchoolIcon sx={{ fontSize: 64, color: '#e2e8f0', mb: 1.5 }} />
              <Typography variant="body1" sx={{ color: C.muted, fontSize: '0.95rem' }}>
                No schools registered yet
              </Typography>
            </Box>
          )}
        </Container>
      </Box>

      {/* ── 8. Testimonials ── */}
      <Box sx={{ py: { xs: 7, md: 10 }, bgcolor: C.paper }}>
        <Container maxWidth="lg">
          <SectionHeading badge="Testimonials" title="Loved by schools across India" subtitle="Real stories from principals, admins, and parents who transformed their school experience." />
          <Box sx={{ height: { xs: 32, md: 44 } }} />
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <Grid2 container spacing={2.5}>
              {TESTIMONIALS.map((t, i) => (
                <Grid2 size={{ xs: 12, md: 4 }} key={i}>
                  <motion.div variants={itemUp} style={{ height: '100%' }}>
                    <Card sx={{ borderRadius: 3, border: `1px solid ${C.border}`, boxShadow: 'none', height: '100%', transition: 'all 0.25s ease', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 14px 32px rgba(15,23,42,0.07)' } }}>
                      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', gap: 0.3, mb: 2 }}>
                          {[...Array(t.rating)].map((_, j) => <StarIcon key={j} sx={{ fontSize: 14, color: '#f59e0b' }} />)}
                        </Box>
                        <FormatQuoteIcon sx={{ fontSize: 26, color: C.border, mb: 0.5 }} />
                        <Typography variant="body2" sx={{ color: C.body, lineHeight: 1.7, mb: 2.5, flex: 1, fontStyle: 'italic', fontSize: '0.85rem' }}>
                          {t.text}
                        </Typography>
                        <Divider sx={{ mb: 2, borderColor: C.border }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <Avatar sx={{ bgcolor: t.avatarColor, width: 38, height: 38, fontWeight: 700, fontSize: '0.9rem' }}>{t.avatar}</Avatar>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: C.heading, fontSize: '0.85rem' }}>{t.name}</Typography>
                              {t.verified && <VerifiedIcon sx={{ fontSize: 13, color: '#3b82f6' }} />}
                            </Box>
                            <Typography variant="caption" sx={{ color: C.muted, fontWeight: 500, fontSize: '0.72rem' }}>{t.role}</Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid2>
              ))}
            </Grid2>
          </motion.div>
        </Container>
      </Box>

      {/* ── 9. Pricing ── */}
      <Box id="pricing" sx={{ scrollMarginTop: 92, py: { xs: 7, md: 10 }, bgcolor: C.sectionAlt }}>
        <Container maxWidth="lg">
          <SectionHeading badge="Pricing" title="Simple, transparent pricing" subtitle="No hidden fees. No long-term contracts. Cancel anytime." />
          <Box sx={{ height: { xs: 32, md: 44 } }} />
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <Grid2 container spacing={2.5} alignItems="stretch">
              {PLANS.map((plan, i) => (
                <Grid2 size={{ xs: 12, md: 4 }} key={i}>
                  <motion.div variants={itemUp} style={{ height: '100%' }}>
                    <Box sx={{
                      p: 3.5, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column',
                      bgcolor: plan.highlight ? plan.color : C.paper,
                      border: `2px solid ${plan.highlight ? plan.color : C.border}`,
                      position: 'relative', overflow: 'hidden',
                      transition: 'all 0.25s ease',
                      '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 16px 40px ${plan.color}2b` },
                    }}>
                      {plan.highlight && (
                        <Chip label="Most Popular" size="small" sx={{ position: 'absolute', top: 16, right: 16, bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, fontSize: '0.62rem', height: 20 }} />
                      )}
                      <Typography variant="overline" sx={{ fontWeight: 800, color: plan.highlight ? 'rgba(255,255,255,0.75)' : plan.color, letterSpacing: '0.08em', fontSize: '0.66rem' }}>
                        {plan.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, my: 1.25 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: plan.highlight ? '#fff' : C.heading, lineHeight: 1, fontSize: '1.9rem' }}>{plan.price}</Typography>
                        <Typography variant="body2" sx={{ color: plan.highlight ? 'rgba(255,255,255,0.75)' : C.muted, fontWeight: 600, fontSize: '0.8rem' }}>{plan.period}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: plan.highlight ? 'rgba(255,255,255,0.85)' : C.body, mb: 2.5, fontWeight: 500, fontSize: '0.85rem' }}>{plan.desc}</Typography>
                      <Divider sx={{ mb: 2.5, borderColor: plan.highlight ? 'rgba(255,255,255,0.2)' : C.border }} />
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.25, mb: 3 }}>
                        {plan.features.map((feat, j) => (
                          <Box key={j} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                            <CheckCircleIcon sx={{ fontSize: 16, color: plan.highlight ? 'rgba(255,255,255,0.9)' : plan.color, flexShrink: 0 }} />
                            <Typography variant="body2" sx={{ color: plan.highlight ? 'rgba(255,255,255,0.92)' : '#475569', fontWeight: 500, fontSize: '0.83rem' }}>{feat}</Typography>
                          </Box>
                        ))}
                      </Box>
                      <Button
                        fullWidth
                        variant={plan.highlight ? 'contained' : 'outlined'}
                        disableElevation
                        sx={{
                          borderRadius: 2, py: 1.2, fontWeight: 700, fontSize: '0.85rem',
                          bgcolor: plan.highlight ? '#fff' : 'transparent',
                          color: plan.color,
                          borderColor: plan.highlight ? 'transparent' : plan.color,
                          '&:hover': { bgcolor: plan.highlight ? 'rgba(255,255,255,0.9)' : `${plan.color}11`, borderColor: plan.color },
                        }}
                      >
                        {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started Free'}
                      </Button>
                    </Box>
                  </motion.div>
                </Grid2>
              ))}
            </Grid2>
          </motion.div>
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" sx={{ color: C.body, fontSize: '0.85rem' }}>
              All plans include a <strong>14-day free trial</strong>. No credit card required.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* ── 10. FAQ Section ── */}
      <Box id="faq" sx={{ scrollMarginTop: 92, py: { xs: 7, md: 10 }, bgcolor: C.paper }}>
        <Container maxWidth="md">
          <SectionHeading badge="FAQ" title="Frequently asked questions" subtitle="Can't find what you're looking for? Contact our support team." />
          <Box sx={{ height: 32 }} />
          {FAQ_ITEMS.map((faq, index) => (
            <Accordion key={index} elevation={0} sx={{ border: `1px solid ${C.border}`, borderRadius: '12px !important', mb: 1.5, '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon fontSize="small" />}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: C.heading }}>{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography sx={{ color: C.body, fontSize: '0.85rem', lineHeight: 1.7 }}>{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Container>
      </Box>

      {/* ── 11. CTA Section ── */}
      <Box sx={{ py: { xs: 8, md: 11 }, background: `linear-gradient(135deg, ${C.navy} 0%, #1e3a5f 50%, ${C.navy} 100%)`, color: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', bgcolor: 'rgba(79,70,229,0.12)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', bgcolor: 'rgba(139,92,246,0.1)', pointerEvents: 'none' }} />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ scale: 0.94, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
            <Chip label="Get Started Today" size="small" sx={{ bgcolor: 'rgba(79,70,229,0.22)', color: '#a5b4fc', fontWeight: 700, mb: 2.5, border: '1px solid rgba(99,102,241,0.35)', fontSize: '0.64rem', height: 22 }} />
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, fontSize: { xs: '1.6rem', md: '2.2rem' }, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
              Ready to digitize your school?
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.78, fontWeight: 400, lineHeight: 1.65, maxWidth: 480, mx: 'auto', fontSize: '0.95rem' }}>
              Join 500+ smart schools. Full setup in under 24 hours with free data migration and onboarding support.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
                disableElevation
                sx={{
                  px: 4, py: 1.35, borderRadius: 2.5, fontSize: '0.92rem', fontWeight: 700,
                  bgcolor: C.primary, boxShadow: '0 8px 22px rgba(79,70,229,0.4)',
                  '&:hover': { bgcolor: C.primaryDark, boxShadow: '0 12px 28px rgba(79,70,229,0.5)', transform: 'translateY(-2px)' },
                  transition: 'all 0.2s ease',
                }}
              >
                Request a Free Demo
              </Button>
              <Button
                variant="outlined"
                sx={{
                  px: 4, py: 1.35, borderRadius: 2.5, fontSize: '0.92rem', fontWeight: 700,
                  color: '#fff', borderColor: 'rgba(255,255,255,0.3)',
                  '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)', transform: 'translateY(-2px)' },
                  transition: 'all 0.2s ease',
                }}
              >
                Contact Sales
              </Button>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
              {['No credit card required', 'Free data migration', '14-day free trial'].map((item) => (
                <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                  <CheckCircleIcon sx={{ fontSize: 15, color: '#4ade80' }} />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: '0.74rem' }}>{item}</Typography>
                </Box>
              ))}
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* ─── Footer ───────────────────────────────────────────────────── */}
      <Box sx={{ py: 5, color: 'rgba(255,255,255,0.75)', background: `linear-gradient(180deg, ${C.navy} 0%, #111827 100%)` }}>
        <Container maxWidth="lg">
          <Grid2 container spacing={4}>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Box component="img" src={LOGO_URL} alt={`${APP_NAME} logo`} sx={{ width: 30, height: 30, borderRadius: 1.5, objectFit: 'cover' }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', fontSize: '1.1rem' }}>{APP_NAME}</Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 2, maxWidth: 300, color: alpha('#e2e8f0', 0.85), fontSize: '0.83rem', lineHeight: 1.65 }}>
                Empowering schools with cutting-edge digital solutions. Trusted by 500+ institutions across India.
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {[FacebookIcon, TwitterIcon, LinkedInIcon, YouTubeIcon].map((Icon, i) => (
                  <IconButton key={i} aria-label="social link" size="small" sx={{ color: alpha('#e2e8f0', 0.8), '&:hover': { color: '#fff' } }}>
                    <Icon fontSize="small" />
                  </IconButton>
                ))}
              </Box>
            </Grid2>
            <Grid2 size={{ xs: 6, md: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, mb: 1.5, fontSize: '0.85rem' }}>Product</Typography>
              {[
                { label: 'Features', href: '#features' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'Contact', to: '/contact', route: true },
              ].map((item) => (
                <Link
                  key={item.label}
                  component={item.route ? RouterLink : 'a'}
                  href={item.route ? undefined : item.href}
                  to={item.route ? item.to : undefined}
                  underline="none"
                  sx={{ display: 'block', color: alpha('#e2e8f0', 0.8), fontSize: '0.82rem', mb: 1, '&:hover': { color: '#fff' } }}
                >
                  {item.label}
                </Link>
              ))}
            </Grid2>
            <Grid2 size={{ xs: 6, md: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, mb: 1.5, fontSize: '0.85rem' }}>Company</Typography>
              {['About', 'Blog', 'Careers', 'Press'].map((text) => (
                <Link key={text} href="#" underline="none" sx={{ display: 'block', color: alpha('#e2e8f0', 0.8), fontSize: '0.82rem', mb: 1, '&:hover': { color: '#fff' } }}>
                  {text}
                </Link>
              ))}
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, mb: 1.5, fontSize: '0.85rem' }}>Subscribe to our newsletter</Typography>
              <Box component="form" onSubmit={(e) => { e.preventDefault(); setNewsletterOpen(true); }} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Your email"
                  style={{
                    flex: 1, minWidth: 180, padding: '10px 14px', borderRadius: 10,
                    border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', fontSize: '0.85rem',
                  }}
                />
                <Button type="submit" variant="contained" disableElevation sx={{ bgcolor: C.primary, fontSize: '0.83rem', '&:hover': { bgcolor: C.primaryDark } }}>
                  Subscribe
                </Button>
              </Box>
            </Grid2>
          </Grid2>
          <Divider sx={{ borderColor: '#1e293b', my: 3.5 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="caption" sx={{ color: alpha('#e2e8f0', 0.7), fontSize: '0.75rem' }}>
              © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2.5 }}>
              <Link href="#" underline="hover" sx={{ color: alpha('#e2e8f0', 0.7), fontSize: '0.75rem' }}>Privacy Policy</Link>
              <Link href="#" underline="hover" sx={{ color: alpha('#e2e8f0', 0.7), fontSize: '0.75rem' }}>Terms of Service</Link>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ─── Scroll to top & chat ─────────────────────────────────────── */}
      <Zoom in={showFab}>
        <Fab
          size="small"
          aria-label="Back to top"
          onClick={scrollToTop}
          sx={{
            position: 'fixed', bottom: 90, right: 20, zIndex: 1200,
            boxShadow: `0 8px 20px ${alpha('#0f172a', 0.18)}`,
            bgcolor: C.paper, color: C.primary, border: `1px solid ${C.border}`,
            '&:hover': { bgcolor: C.primarySoft },
          }}
        >
          <KeyboardArrowUpIcon fontSize="small" />
        </Fab>
      </Zoom>
      <Zoom in={showFab}>
        <Fab
          size="small"
          aria-label="Open chat"
          sx={{
            position: 'fixed', bottom: 24, right: 20, zIndex: 1200,
            bgcolor: C.primary, color: '#fff',
            boxShadow: `0 8px 20px ${alpha(C.primary, 0.4)}`,
            '&:hover': { bgcolor: C.primaryDark },
          }}
        >
          <ChatIcon fontSize="small" />
        </Fab>
      </Zoom>

      <Snackbar open={newsletterOpen} autoHideDuration={5000} onClose={() => setNewsletterOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setNewsletterOpen(false)} severity="success" variant="filled" sx={{ width: '100%' }}>
          Thanks — you are on the list. We will send updates to your inbox.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Home;