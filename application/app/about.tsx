import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  School,
  Users,
  BookOpen,
  Target,
  Award,
  Heart,
  Zap,
  Shield,
  Globe,
  TrendingUp,
  CheckCircle,
  Sparkles,
} from 'lucide-react-native';
import { APP_NAME, APP_TAGLINE } from '@/constants/branding';
import Constants from 'expo-constants';

const THEME = {
  bg: '#FFFDF7',
  surface: '#FFFFFF',
  surfaceAlt: '#FFFBEB',
  border: '#F3E8C7',
  ink: '#1F2937',
  inkMuted: '#6B7280',
  inkFaint: '#9CA3AF',
  primary: '#F5B301',
  primaryDeep: '#D89400',
  primarySoft: '#FFE9A8',
  success: '#16A34A',
  gradientPrimary: ['#FFD65A', '#F5B301', '#E08E00'] as const,
};

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

const FEATURES = [
  {
    icon: Users,
    title: 'Multi-Role Support',
    description: 'Students, Teachers, Parents, Admins - everyone gets their own portal',
    color: '#2563EB',
  },
  {
    icon: BookOpen,
    title: 'Smart Learning',
    description: 'Assignments, homework, exams, and timetable management',
    color: '#059669',
  },
  {
    icon: Target,
    title: 'Attendance Tracking',
    description: 'Real-time attendance monitoring with analytics',
    color: '#7C3AED',
  },
  {
    icon: Award,
    title: 'Performance Reports',
    description: 'Detailed academic reports and progress tracking',
    color: '#DC2626',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built with React Native and Hermes for optimal performance',
    color: '#D89400',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: '30-day encrypted sessions with secure data storage',
    color: '#0891B2',
  },
];

const STATS = [
  { label: 'Schools', value: '500+', icon: School },
  { label: 'Students', value: '50K+', icon: Users },
  { label: 'Teachers', value: '5K+', icon: BookOpen },
  { label: 'Uptime', value: '99.9%', icon: TrendingUp },
];

export default function AboutScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" backgroundColor={THEME.bg} />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ArrowLeft color={THEME.ink} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={THEME.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGradient}
          >
            <School color="#fff" size={48} strokeWidth={2.2} />
            <View style={styles.logoSparkle}>
              <Sparkles color="#fff" size={18} />
            </View>
          </LinearGradient>
          <Text style={styles.appName}>{APP_NAME}</Text>
          <Text style={styles.tagline}>{APP_TAGLINE}</Text>
          <Text style={styles.version}>Version {APP_VERSION}</Text>
        </View>

        {/* Mission Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Heart color={THEME.primary} size={24} />
            <Text style={styles.sectionTitle}>Our Mission</Text>
          </View>
          <Text style={styles.missionText}>
            We're on a mission to transform education management by providing schools,
            teachers, students, and parents with powerful, easy-to-use tools that make
            learning more effective and administration more efficient.
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {STATS.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <View key={index} style={[styles.statCard, isCompact && styles.statCardCompact]}>
                <View style={styles.statIconWrap}>
                  <Icon color={THEME.primaryDeep} size={22} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            );
          })}
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Zap color={THEME.primary} size={24} />
            <Text style={styles.sectionTitle}>Key Features</Text>
          </View>
          <View style={styles.featuresGrid}>
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <View key={index} style={styles.featureCard}>
                  <View style={[styles.featureIconWrap, { backgroundColor: `${feature.color}15` }]}>
                    <Icon color={feature.color} size={24} />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Why Choose Us */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CheckCircle color={THEME.success} size={24} />
            <Text style={styles.sectionTitle}>Why Choose {APP_NAME}?</Text>
          </View>
          <View style={styles.whySection}>
            {[
              'Comprehensive school management solution',
              'User-friendly interface for all age groups',
              'Real-time notifications and updates',
              'Secure cloud-based data storage',
              'Mobile-first design for on-the-go access',
              'Dedicated customer support team',
            ].map((reason, index) => (
              <View key={index} style={styles.reasonRow}>
                <View style={styles.checkBadge}>
                  <CheckCircle color={THEME.success} size={16} strokeWidth={2.5} />
                </View>
                <Text style={styles.reasonText}>{reason}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contact CTA */}
        <View style={styles.ctaSection}>
          <Globe color={THEME.primaryDeep} size={32} />
          <Text style={styles.ctaTitle}>Have Questions?</Text>
          <Text style={styles.ctaSubtitle}>
            We'd love to hear from you. Get in touch with our team.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/contact')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={THEME.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaButton}
            >
              <Text style={styles.ctaButtonText}>Contact Us</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with <Heart color={THEME.primary} size={14} fill={THEME.primary} /> for education
          </Text>
          <Text style={styles.copyrightText}>
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    backgroundColor: THEME.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.ink,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
  },
  logoSparkle: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: THEME.primaryDeep,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: THEME.bg,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: THEME.inkMuted,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  version: {
    fontSize: 13,
    color: THEME.inkFaint,
    fontWeight: '600',
    backgroundColor: THEME.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: '#00000008',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardCompact: {
    minWidth: '100%',
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: THEME.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: THEME.inkMuted,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.ink,
  },
  missionText: {
    fontSize: 15,
    lineHeight: 24,
    color: THEME.inkMuted,
    fontWeight: '500',
  },
  featuresGrid: {
    gap: 14,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: THEME.surface,
    borderRadius: 14,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  featureIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.ink,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: THEME.inkMuted,
    fontWeight: '500',
  },
  whySection: {
    gap: 12,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkBadge: {
    width: 24,
    height: 24,
  },
  reasonText: {
    flex: 1,
    fontSize: 14,
    color: THEME.inkMuted,
    fontWeight: '500',
  },
  ctaSection: {
    marginHorizontal: 24,
    marginBottom: 32,
    backgroundColor: THEME.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME.ink,
    marginTop: 16,
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: THEME.inkMuted,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  ctaButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 13,
    color: THEME.inkMuted,
    fontWeight: '500',
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 11,
    color: THEME.inkFaint,
    fontWeight: '400',
  },
});
