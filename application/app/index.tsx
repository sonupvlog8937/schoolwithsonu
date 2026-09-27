import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  TouchableOpacity,
  Platform,
  Dimensions,
  Animated,
  StatusBar,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { fetchDataFromApi } from '@/utils/api';
import { getSchoolImageSrc } from '@/utils/imageHelpers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const { width } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ---------------------------------------------------------------------------
// Theme — White & Yellow, production palette
// ---------------------------------------------------------------------------
const THEME = {
  bg: '#FFFDF7',
  surface: '#FFFFFF',
  surfaceAlt: '#FFFBEB',
  border: '#F3E8C7',
  borderStrong: '#FDE68A',
  ink: '#1F2937',
  inkMuted: '#6B7280',
  inkFaint: '#9CA3AF',
  primary: '#F5B301',
  primaryDeep: '#B87A00',
  primarySoft: '#FFE9A8',
  dark: '#241C05',
  darkAlt: '#3A2C05',
  success: '#16A34A',
  gradientPrimary: ['#FFD65A', '#F5B301', '#E08E00'] as const,
  gradientDark: ['#241C05', '#3A2C05'] as const,
};

const FEATURE_COLORS = [
  { icon: '#B87A00', box: '#FFF6DC', border: '#FDE68A' },
  { icon: '#16A34A', box: '#F0FDF4', border: '#BBF7D0' },
  { icon: '#D97706', box: '#FFFBEB', border: '#FDE68A' },
  { icon: '#7C3AED', box: '#F5F3FF', border: '#E9D5FF' },
  { icon: '#DC2626', box: '#FEF2F2', border: '#FECACA' },
  { icon: '#0891B2', box: '#ECFEFF', border: '#CFFAFE' },
];

export default function HomeScreen() {
  const router = useRouter();
  const mainScrollRef = useRef<ScrollView>(null);
  const heroCarouselRef = useRef<ScrollView>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Fetch top schools
  const { data: schoolsData, isLoading: schoolsLoading } = useQuery({
    queryKey: ['top-schools'],
    queryFn: () => fetchDataFromApi('/api/public/schools/top'),
  });

  const topSchools = schoolsData?.schools ?? [];

  const heroSlides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
      title: 'Explore Our Classrooms',
      subtitle: 'Engaging and inspiring environments for every student.',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
      title: 'Smart Learning Experience',
      subtitle: "Technology-driven education for tomorrow's leaders.",
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80',
      title: 'Building Future Leaders',
      subtitle: 'Comprehensive programs designed for success.',
    },
  ];

  // Auto-play hero carousel
  useEffect(() => {
    const timer = setInterval(() => {
      const next = (currentSlide + 1) % heroSlides.length;
      scrollToSlide(next);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const handleScroll = (event: any) => {
    const slideSize = width;
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / slideSize);
    if (index !== currentSlide) {
      setCurrentSlide(index);
    }
  };

  const handleMainScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (e: any) => {
        setShowBackToTop(e.nativeEvent.contentOffset.y > 600);
      },
    }
  );

  const scrollToSlide = (index: number) => {
    if (heroCarouselRef.current) {
      heroCarouselRef.current.scrollTo({ x: index * width, y: 0, animated: true });
      setCurrentSlide(index);
    }
  };

  const toggleFaq = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollToTop = () => {
    mainScrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const faqData = [
    {
      q: 'How quickly can we get started?',
      a: 'Most schools are fully onboarded within 24 hours. Our team handles data migration, staff training, and setup end-to-end.',
    },
    {
      q: 'Is my data secure?',
      a: 'Yes — we use 256-bit SSL encryption, daily automated backups, and follow GDPR-compliant data handling practices.',
    },
    {
      q: 'Can parents access the system?',
      a: 'Absolutely. Parents get a dedicated app and web portal to track attendance, fees, results, and announcements in real time.',
    },
    {
      q: 'Do you offer training for staff?',
      a: 'Every plan includes free onboarding training for your administrative and teaching staff, plus ongoing support.',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.bg} />
      <Header />

      <ScrollView
        ref={mainScrollRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={handleMainScroll}
        scrollEventThrottle={16}
      >
        {/* Hero Section with Image Slider */}
        <View style={styles.heroSection}>
          <ScrollView
            ref={heroCarouselRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            snapToInterval={width}
            snapToAlignment="center"
          >
            {heroSlides.map((slide) => (
              <View key={slide.id} style={[styles.heroSlide, { width }]}>
                <Image source={{ uri: slide.image }} style={styles.heroImage} resizeMode="cover" />
                <LinearGradient
                  colors={['rgba(36,28,5,0.15)', 'rgba(36,28,5,0.75)', 'rgba(36,28,5,0.92)']}
                  style={styles.heroOverlay}
                  locations={[0, 0.55, 1]}
                >
                  <View style={styles.heroContent}>
                    <View style={styles.heroBadge}>
                      <Feather name="zap" size={12} color={THEME.dark} />
                      <Text style={styles.heroBadgeText}>SMART SCHOOL PLATFORM</Text>
                    </View>
                    <Text style={styles.heroTitle}>{slide.title}</Text>
                    <Text style={styles.heroSubtitle}>{slide.subtitle}</Text>
                  </View>
                </LinearGradient>
              </View>
            ))}
          </ScrollView>

          {/* <Pressable
            style={[styles.heroNavButton, styles.heroNavLeft]}
            onPress={() => scrollToSlide(currentSlide > 0 ? currentSlide - 1 : heroSlides.length - 1)}
          >
            <Feather name="chevron-left" size={22} color={THEME.dark} />
          </Pressable>
          <Pressable
            style={[styles.heroNavButton, styles.heroNavRight]}
            onPress={() => scrollToSlide(currentSlide < heroSlides.length - 1 ? currentSlide + 1 : 0)}
          >
            <Feather name="chevron-right" size={22} color={THEME.dark} />
          </Pressable> */}

          <View style={styles.heroPagination}>
            {heroSlides.map((_, index) => (
              <Pressable
                key={index}
                onPress={() => scrollToSlide(index)}
                style={[styles.heroDot, currentSlide === index && styles.heroDotActive]}
              />
            ))}
          </View>
        </View>

        {/* Trust Badge */}
        <View style={styles.trustBadge}>
          <View style={styles.trustAvatarsRow}>
            {['#F5B301', '#16A34A', '#0891B2'].map((color, i) => (
              <View key={i} style={[styles.trustAvatar, { backgroundColor: color, marginLeft: i > 0 ? -10 : 0 }]}>
                <Text style={styles.trustAvatarText}>{['R', 'P', 'S'][i]}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.trustText}>Trusted by 500+ schools across India</Text>
          <View style={styles.trustStars}>
            {[...Array(5)].map((_, i) => (
              <Feather key={i} name="star" size={13} color={THEME.primary} style={{ marginRight: 2 }} />
            ))}
          </View>
        </View>

        {/* Stats Cards - 2x2 Grid */}
        <View style={styles.section}>
          <View style={styles.statsGrid}>
            {[
              { icon: 'home', num: '500+', label: 'Registered Schools', pill: '+12% this year' },
              { icon: 'users', num: '10000+', label: 'Happy Parents', pill: '98% satisfaction' },
              { icon: 'award', num: '25+', label: 'Awards Won', pill: 'National recognition' },
              { icon: 'shield', num: '8+', label: 'Years of Trust', pill: 'Established 2016' },
            ].map((stat, i) => (
              <View key={i} style={styles.statCard}>
                <View style={styles.statIconCircle}>
                  <Feather name={stat.icon as any} size={26} color={THEME.primaryDeep} />
                </View>
                <Text style={styles.statNumber}>{stat.num}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <View style={styles.statPill}>
                  <Text style={styles.statPillText}>{stat.pill}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Trust Badges Bar */}
        <LinearGradient colors={THEME.gradientDark} style={styles.trustBar}>
          <View style={styles.trustBarRow}>
            {['CBSE AFFILIATED', 'ICSE BOARD', 'STATE BOARD', 'ISO 9001:2015'].map((badge, i) => (
              <View key={i} style={styles.trustBarItem}>
                <Feather name="check-circle" size={15} color={THEME.primary} />
                <Text style={styles.trustBarText}>{badge}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Platform Features Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>PLATFORM FEATURES</Text>
            </View>
            <Text style={styles.sectionTitle}>Everything your school needs</Text>
            <Text style={styles.sectionSubtitle}>
              A complete digital ecosystem designed to streamline school administration and enhance parent-teacher
              collaboration.
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            {[
              {
                icon: 'bar-chart-2',
                title: 'Smart Attendance',
                desc: 'Biometric & app-based tracking for students and staff, with automated daily reports for parents.',
                checks: ['Face recognition', 'SMS alerts', 'Monthly reports'],
              },
              {
                icon: 'credit-card',
                title: 'Fee Management',
                desc: 'Secure online payments, automated reminders, and instant GST-compliant receipt generation.',
                checks: ['UPI & cards', 'Auto reminders', 'Instant receipts'],
              },
              {
                icon: 'bell',
                title: 'Instant Notifications',
                desc: 'Real-time alerts for exams, holidays, results, and announcements sent directly to parents.',
                checks: ['Push & SMS', 'Multi-language', 'Scheduled alerts'],
              },
              {
                icon: 'trending-up',
                title: 'Academic Reports',
                desc: 'Digital report cards, grade tracking, and subject-wise performance analytics.',
                checks: ['Grade analytics', 'PDF export', 'Parent portal'],
              },
              {
                icon: 'shield',
                title: 'Data Security',
                desc: 'Enterprise-grade 256-bit SSL encryption with regular backups and compliant data handling.',
                checks: ['SSL encrypted', 'GDPR compliant', 'Daily backups'],
              },
              {
                icon: 'headphones',
                title: '24/7 Support',
                desc: 'Dedicated customer success team available round-the-clock via chat, call, and remote assistance.',
                checks: ['Live chat', 'Phone support', 'Remote access'],
              },
            ].map((feature, i) => {
              const c = FEATURE_COLORS[i % FEATURE_COLORS.length];
              return (
                <View key={i} style={[styles.featureCardFull, { borderColor: c.border }]}>
                  <View style={[styles.featureIconBox, { backgroundColor: c.box }]}>
                    <Feather name={feature.icon as any} size={24} color={c.icon} />
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.desc}</Text>
                  <View style={styles.featureChecks}>
                    {feature.checks.map((chk, j) => (
                      <View key={j} style={styles.featureCheckRow}>
                        <Feather name="check-circle" size={15} color={c.icon} />
                        <Text style={styles.featureCheckText}>{chk}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Cross-Platform Section */}
        <View style={styles.crossPlatformSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>CROSS-PLATFORM</Text>
            </View>
            <Text style={styles.sectionTitle}>Works on every device, anytime, anywhere</Text>
            <Text style={styles.sectionSubtitle}>
              Access your school dashboard from any browser, Android or iOS app. Optimized for a mobile-first
              experience with offline sync.
            </Text>
          </View>

          <View style={styles.platformChecksGrid}>
            {['Android App', 'iOS App', 'Web Dashboard', 'Admin Panel'].map((item, i) => (
              <View key={i} style={styles.platformCheckItem}>
                <Feather name="check-circle" size={17} color={THEME.primaryDeep} />
                <Text style={styles.platformCheckText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.platformStatsBox}>
            {[
              { icon: 'zap', label: 'Average Setup Time', value: '< 24 hours' },
              { icon: 'shield', label: 'Uptime Guarantee', value: '99.9% SLA' },
              { icon: 'database', label: 'Data Migration', value: 'Free & Assisted' },
              { icon: 'headphones', label: 'Dedicated Support', value: '24 × 7 × 365' },
            ].map((stat, i) => (
              <View key={i} style={styles.platformStatRow}>
                <View style={styles.platformStatLeft}>
                  <Feather name={stat.icon as any} size={19} color={THEME.primaryDeep} />
                  <Text style={styles.platformStatLabel}>{stat.label}</Text>
                </View>
                <Text style={styles.platformStatValue}>{stat.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* How to Get Started */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>SIMPLE PROCESS</Text>
            </View>
            <Text style={styles.sectionTitle}>How to get started in 3 easy steps</Text>
            <Text style={styles.sectionSubtitle}>From signup to full deployment — we handle everything for you.</Text>
          </View>

          <View style={styles.stepsContainer}>
            {[
              { num: '01', title: 'Book a Demo', desc: 'Schedule a 30-minute call with our education specialist to understand your needs.' },
              { num: '02', title: 'Personalized Setup', desc: 'We migrate your data, configure the system, and train your staff — all for free.' },
              { num: '03', title: 'Go Live & Succeed', desc: 'Launch within 24 hours and enjoy ongoing 24/7 support and regular updates.' },
            ].map((step, i) => (
              <View key={i} style={styles.stepItem}>
                <Text style={styles.stepNumber}>{step.num}</Text>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Registered Schools */}
        {schoolsLoading ? (
          <View style={styles.section}>
            <View style={styles.skeletonRow}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.skeletonCard} />
              ))}
            </View>
          </View>
        ) : topSchools.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>OUR NETWORK</Text>
              </View>
              <Text style={styles.sectionTitle}>Registered Schools</Text>
              <Text style={styles.sectionSubtitle}>Growing network of digitally empowered institutions</Text>
              <Pressable onPress={() => router.push('/schools/' as any)} style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All Schools</Text>
                <Feather name="arrow-right" size={16} color={THEME.primaryDeep} />
              </Pressable>
            </View>

            <View style={styles.schoolsGrid}>
              {topSchools.slice(0, 3).map((school: any) => (
                <Pressable
                  key={school._id}
                  style={styles.schoolCardWide}
                  onPress={() => router.push(`/schools/${school._id}` as any)}
                >
                  <Image source={{ uri: getSchoolImageSrc(school.schoolImage) }} style={styles.schoolAvatar} />
                  <View style={styles.schoolInfo}>
                    <Text style={styles.schoolName} numberOfLines={1}>
                      {school.schoolName}
                    </Text>
                    <Text style={styles.schoolOwner} numberOfLines={1}>
                      {school.ownerName || 'Owner'}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={THEME.inkFaint} />
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {/* Testimonials */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>TESTIMONIALS</Text>
            </View>
            <Text style={styles.sectionTitle}>Loved by schools across India</Text>
            <Text style={styles.sectionSubtitle}>
              Real stories from principals, admins, and parents who transformed their school experience.
            </Text>
          </View>

          <View style={styles.testimonialsContainer}>
            {[
              {
                name: 'Rajesh Kumar Sharma',
                role: 'Principal, Delhi Public School',
                text: 'Our administrative workload dropped by 60% in the first month. Fee collection alone saved 30+ hours weekly.',
                avatar: 'R',
                color: '#F5B301',
              },
              {
                name: 'Priya Verma',
                role: 'Parent & PTA Chairperson',
                text: "I can track my son's attendance, see his marks, and pay fees in under 2 minutes — all from my phone.",
                avatar: 'P',
                color: '#16A34A',
              },
            ].map((item, i) => (
              <View key={i} style={styles.testimonialCard}>
                <View style={styles.testimonialStars}>
                  {[...Array(5)].map((_, j) => (
                    <Feather key={j} name="star" size={13} color={THEME.primary} style={{ marginRight: 2 }} />
                  ))}
                </View>
                <Text style={styles.testimonialQuote}>"{item.text}"</Text>
                <View style={styles.testimonialAuthor}>
                  <View style={[styles.testimonialAvatar, { backgroundColor: item.color }]}>
                    <Text style={styles.testimonialAvatarText}>{item.avatar}</Text>
                  </View>
                  <View style={styles.testimonialAuthorInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={styles.testimonialName}>{item.name}</Text>
                      <Feather name="check-circle" size={14} color={THEME.primaryDeep} />
                    </View>
                    <Text style={styles.testimonialRole}>{item.role}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Pricing Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>PRICING</Text>
            </View>
            <Text style={styles.sectionTitle}>Simple, transparent pricing</Text>
            <Text style={styles.sectionSubtitle}>No hidden fees. No long-term contracts. Cancel anytime.</Text>
          </View>

          <View style={styles.pricingContainer}>
            {/* Starter Plan */}
            <View style={styles.pricingCard}>
              <Text style={styles.pricingPlanName}>STARTER</Text>
              <View style={styles.pricingPriceRow}>
                <Text style={styles.pricingPrice}>₹4,999</Text>
                <Text style={styles.pricingPeriod}>/month</Text>
              </View>
              <Text style={styles.pricingDesc}>Perfect for small schools</Text>
              <View style={styles.pricingFeatures}>
                {['Up to 500 students', 'Attendance tracking', 'Basic fee management', 'Email support'].map(
                  (feature, i) => (
                    <View key={i} style={styles.pricingFeatureRow}>
                      <Feather name="check" size={17} color={THEME.inkMuted} />
                      <Text style={styles.pricingFeatureText}>{feature}</Text>
                    </View>
                  )
                )}
              </View>
              <TouchableOpacity style={styles.pricingButton} onPress={() => router.push('/register')} activeOpacity={0.8}>
                <Text style={styles.pricingButtonText}>Get Started Free</Text>
              </TouchableOpacity>
            </View>

            {/* Professional Plan */}
            <View style={[styles.pricingCard, styles.pricingCardHighlight]}>
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>Most Popular</Text>
              </View>
              <Text style={styles.pricingPlanName}>PROFESSIONAL</Text>
              <View style={styles.pricingPriceRow}>
                <Text style={styles.pricingPrice}>₹9,999</Text>
                <Text style={styles.pricingPeriod}>/month</Text>
              </View>
              <Text style={styles.pricingDesc}>Most popular for growing schools</Text>
              <View style={styles.pricingFeatures}>
                {[
                  'Up to 2000 students',
                  'All Starter features',
                  'Analytics dashboard',
                  'SMS notifications',
                  'Priority support',
                  'Custom branding',
                ].map((feature, i) => (
                  <View key={i} style={styles.pricingFeatureRow}>
                    <Feather name="check" size={17} color={THEME.primaryDeep} />
                    <Text style={[styles.pricingFeatureText, { color: THEME.ink }]}>{feature}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.pricingButton, styles.pricingButtonPrimary]}
                onPress={() => router.push('/register')}
                activeOpacity={0.8}
              >
                <Text style={styles.pricingButtonPrimaryText}>Get Started Free</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.pricingNote}>
            All plans include a <Text style={styles.pricingNoteBold}>14-day free trial</Text>. No credit card required.
          </Text>
        </View>

        {/* FAQ Section — now expandable */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>FAQ</Text>
            </View>
            <Text style={styles.sectionTitle}>Frequently asked questions</Text>
            <Text style={styles.sectionSubtitle}>Can't find what you're looking for? Contact our support team.</Text>
          </View>

          <View style={styles.faqContainer}>
            {faqData.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <Pressable key={i} style={[styles.faqItem, isOpen && styles.faqItemOpen]} onPress={() => toggleFaq(i)}>
                  <View style={styles.faqQuestionRow}>
                    <Text style={styles.faqQuestion}>{item.q}</Text>
                    <View style={[styles.faqIconWrap, isOpen && styles.faqIconWrapOpen]}>
                      <Feather name={isOpen ? 'minus' : 'plus'} size={16} color={isOpen ? '#fff' : THEME.primaryDeep} />
                    </View>
                  </View>
                  {isOpen && <Text style={styles.faqAnswer}>{item.a}</Text>}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <LinearGradient colors={THEME.gradientDark} style={styles.ctaGradient}>
            <View style={styles.ctaBadge}>
              <Feather name="zap" size={12} color={THEME.primary} />
              <Text style={styles.ctaBadgeText}>GET STARTED TODAY</Text>
            </View>
            <Text style={styles.ctaTitle}>Ready to digitize your school?</Text>
            <Text style={styles.ctaSubtitle}>
              Join 500+ smart schools. Full setup in under 24 hours with free data migration and onboarding support.
            </Text>
            <View style={styles.ctaButtons}>
              <TouchableOpacity style={styles.ctaButtonPrimary} onPress={() => router.push('/register')} activeOpacity={0.85}>
                <Text style={styles.ctaButtonPrimaryText}>Request a Free Demo</Text>
                <Feather name="arrow-right" size={18} color={THEME.dark} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.ctaButtonSecondary} onPress={() => router.push('/contact')} activeOpacity={0.8}>
                <Text style={styles.ctaButtonSecondaryText}>Contact Sales</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.ctaFeatures}>
              {['No credit card required', 'Free data migration', '14-day free trial'].map((item, i) => (
                <View key={i} style={styles.ctaFeatureItem}>
                  <Feather name="check-circle" size={15} color={THEME.primary} />
                  <Text style={styles.ctaFeatureText}>{item}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>

        <Footer />
      </ScrollView>

      {/* Back to top FAB */}
      {showBackToTop && (
        <TouchableOpacity style={styles.fab} onPress={scrollToTop} activeOpacity={0.85}>
          <Feather name="arrow-up" size={20} color={THEME.dark} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.bg },
  scrollView: { flex: 1 },

  // Hero Section
  heroSection: { position: 'relative', height: 420 },
  heroSlide: { height: 420, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65%',
    justifyContent: 'flex-end',
    paddingBottom: 50,
    paddingHorizontal: 24,
  },
  heroContent: { alignItems: 'center' },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 14,
  },
  heroBadgeText: { fontSize: 10, fontWeight: '800', color: THEME.dark, letterSpacing: 0.8 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 10, lineHeight: 34 },
  heroSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.92)', textAlign: 'center', lineHeight: 22 },
  heroNavButton: {
    position: 'absolute',
    top: '45%',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  heroNavLeft: { left: 16 },
  heroNavRight: { right: 16 },
  heroPagination: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    zIndex: 10,
  },
  heroDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)' },
  heroDotActive: { width: 24, backgroundColor: THEME.primary },

  // Trust Badge
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: THEME.surface,
    marginHorizontal: 20,
    marginTop: -20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: THEME.border,
    ...Platform.select({
      ios: { shadowColor: THEME.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
      android: { elevation: 5 },
    }),
    zIndex: 10,
  },
  trustAvatarsRow: { flexDirection: 'row' },
  trustAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  trustAvatarText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  trustText: { fontSize: 13, fontWeight: '700', color: THEME.ink },
  trustStars: { flexDirection: 'row' },

  // Stats Grid (2x2)
  section: { marginTop: 40, paddingHorizontal: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  statCard: {
    width: '47.5%',
    backgroundColor: THEME.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: THEME.border,
    alignItems: 'center',
  },
  statIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    backgroundColor: THEME.surfaceAlt,
  },
  statNumber: { fontSize: 30, fontWeight: '800', color: THEME.ink, marginBottom: 6 },
  statLabel: { fontSize: 13, fontWeight: '600', color: THEME.inkMuted, textAlign: 'center', marginBottom: 10 },
  statPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, backgroundColor: THEME.primarySoft },
  statPillText: { fontSize: 10, fontWeight: '700', color: THEME.primaryDeep },

  // Trust Bar
  trustBar: { marginTop: 24, paddingVertical: 16 },
  trustBarRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, paddingHorizontal: 20 },
  trustBarItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trustBarText: { fontSize: 10, color: 'rgba(255,255,255,0.92)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Section Headers
  sectionHeader: { marginBottom: 24, alignItems: 'center' },
  badge: { backgroundColor: THEME.primarySoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 12 },
  badgeText: { fontSize: 10, fontWeight: '700', color: THEME.primaryDeep, letterSpacing: 1 },
  sectionTitle: { fontSize: 26, fontWeight: '800', color: THEME.ink, textAlign: 'center', marginBottom: 10, lineHeight: 32 },
  sectionSubtitle: { fontSize: 15, color: THEME.inkMuted, textAlign: 'center', lineHeight: 22 },

  // Features - Full Width Cards
  featuresContainer: { gap: 16 },
  featureCardFull: { backgroundColor: THEME.surface, borderRadius: 20, padding: 24, borderWidth: 1.5 },
  featureIconBox: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  featureTitle: { fontSize: 19, fontWeight: '700', color: THEME.ink, marginBottom: 10 },
  featureDesc: { fontSize: 14, color: THEME.inkMuted, lineHeight: 21, marginBottom: 16 },
  featureChecks: { gap: 10 },
  featureCheckRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureCheckText: { fontSize: 14, color: THEME.ink, fontWeight: '600' },

  // Cross-Platform Section
  crossPlatformSection: { marginTop: 40, paddingHorizontal: 20, backgroundColor: THEME.surfaceAlt, paddingVertical: 40, marginHorizontal: -20 },
  platformChecksGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 20, paddingHorizontal: 20 },
  platformCheckItem: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '45%' },
  platformCheckText: { fontSize: 14, fontWeight: '600', color: THEME.ink },
  platformStatsBox: { backgroundColor: THEME.surface, borderRadius: 20, padding: 20, gap: 14, marginHorizontal: 20, borderWidth: 1, borderColor: THEME.border },
  platformStatRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  platformStatLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  platformStatLabel: { fontSize: 13, color: THEME.inkMuted, fontWeight: '600', flex: 1 },
  platformStatValue: { fontSize: 14, fontWeight: '800', color: THEME.ink },

  // Steps
  stepsContainer: { gap: 28 },
  stepItem: { alignItems: 'center' },
  stepNumber: { fontSize: 68, fontWeight: '800', color: THEME.primarySoft, lineHeight: 76, marginBottom: -8 },
  stepContent: { alignItems: 'center' },
  stepTitle: { fontSize: 19, fontWeight: '700', color: THEME.ink, marginBottom: 8 },
  stepDesc: { fontSize: 14, color: THEME.inkMuted, textAlign: 'center', lineHeight: 21 },

  // Schools
  viewAllButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  viewAllText: { fontSize: 14, fontWeight: '700', color: THEME.primaryDeep },
  schoolsGrid: { gap: 14 },
  schoolCardWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  schoolAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: THEME.surfaceAlt },
  schoolInfo: { flex: 1 },
  schoolName: { fontSize: 16, fontWeight: '700', color: THEME.ink, marginBottom: 4 },
  schoolOwner: { fontSize: 13, color: THEME.inkMuted },
  skeletonRow: { gap: 14 },
  skeletonCard: { height: 88, borderRadius: 16, backgroundColor: THEME.surfaceAlt, borderWidth: 1, borderColor: THEME.border },

  // Testimonials
  testimonialsContainer: { gap: 16 },
  testimonialCard: { backgroundColor: THEME.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: THEME.border },
  testimonialStars: { flexDirection: 'row', marginBottom: 14 },
  testimonialQuote: { fontSize: 15, color: '#475569', lineHeight: 24, fontStyle: 'italic', marginBottom: 16 },
  testimonialAuthor: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  testimonialAvatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  testimonialAvatarText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  testimonialAuthorInfo: { flex: 1 },
  testimonialName: { fontSize: 15, fontWeight: '700', color: THEME.ink },
  testimonialRole: { fontSize: 12, color: THEME.inkMuted, marginTop: 2 },

  // Pricing
  pricingContainer: { gap: 16 },
  pricingCard: { backgroundColor: THEME.surface, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: THEME.border },
  pricingCardHighlight: { borderWidth: 2.5, borderColor: THEME.primary, position: 'relative' },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: [{ translateX: -55 }],
    backgroundColor: THEME.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  popularBadgeText: { fontSize: 10, fontWeight: '800', color: THEME.dark, letterSpacing: 0.8 },
  pricingPlanName: { fontSize: 12, fontWeight: '800', color: THEME.inkMuted, letterSpacing: 1, marginBottom: 12 },
  pricingPriceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 6 },
  pricingPrice: { fontSize: 34, fontWeight: '800', color: THEME.ink },
  pricingPeriod: { fontSize: 16, color: THEME.inkMuted, marginLeft: 4 },
  pricingDesc: { fontSize: 14, color: THEME.inkMuted, marginBottom: 20 },
  pricingFeatures: { gap: 12, marginBottom: 24 },
  pricingFeatureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pricingFeatureText: { fontSize: 14, color: '#475569' },
  pricingButton: { backgroundColor: THEME.surfaceAlt, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: THEME.border },
  pricingButtonText: { fontSize: 15, fontWeight: '700', color: THEME.ink },
  pricingButtonPrimary: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  pricingButtonPrimaryText: { fontSize: 15, fontWeight: '700', color: THEME.dark },
  pricingNote: { fontSize: 13, color: THEME.inkMuted, textAlign: 'center', marginTop: 16 },
  pricingNoteBold: { fontWeight: '700', color: THEME.ink },

  // FAQ (expandable)
  faqContainer: { gap: 12 },
  faqItem: { backgroundColor: THEME.surface, borderRadius: 14, padding: 18, borderWidth: 1, borderColor: THEME.border },
  faqItemOpen: { borderColor: THEME.borderStrong, backgroundColor: THEME.surfaceAlt },
  faqQuestionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { fontSize: 15, fontWeight: '600', color: THEME.ink, flex: 1, marginRight: 12 },
  faqIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqIconWrapOpen: { backgroundColor: THEME.primary },
  faqAnswer: { fontSize: 14, color: THEME.inkMuted, lineHeight: 21, marginTop: 12 },

  // CTA Section
  ctaSection: { marginTop: 40, marginHorizontal: 20, marginBottom: 0 },
  ctaGradient: { borderRadius: 24, padding: 32, alignItems: 'center' },
  ctaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245,179,1,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  ctaBadgeText: { fontSize: 10, fontWeight: '700', color: THEME.primary, letterSpacing: 1 },
  ctaTitle: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 12, lineHeight: 34 },
  ctaSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 28, lineHeight: 24 },
  ctaButtons: { gap: 12, width: '100%' },
  ctaButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.primary,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
  },
  ctaButtonPrimaryText: { fontSize: 16, fontWeight: '700', color: THEME.dark },
  ctaButtonSecondary: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    width: '100%',
    alignItems: 'center',
  },
  ctaButtonSecondaryText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  ctaFeatures: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 24, justifyContent: 'center' },
  ctaFeatureItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ctaFeatureText: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },

  // Back to top FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
});