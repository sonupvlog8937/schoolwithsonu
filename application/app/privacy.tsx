import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  Database,
  UserCheck,
  Bell,
  Cookie,
  FileText,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Mail,
} from 'lucide-react-native';
import { APP_NAME } from '@/constants/branding';

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
  info: '#2563EB',
  gradientPrimary: ['#FFD65A', '#F5B301', '#E08E00'] as const,
};

const LAST_UPDATED = 'January 15, 2026';

interface PolicySection {
  icon: any;
  title: string;
  content: string[];
  color: string;
}

const POLICY_SECTIONS: PolicySection[] = [
  {
    icon: Database,
    title: 'Information We Collect',
    color: '#2563EB',
    content: [
      'Personal information: Name, email, phone number, and school details',
      'Academic data: Grades, attendance records, and performance metrics',
      'Usage data: App interactions, features used, and session duration',
      'Device information: Device type, OS version, and unique identifiers',
      'Location data: Only when explicitly permitted for attendance tracking',
    ],
  },
  {
    icon: Lock,
    title: 'How We Use Your Information',
    color: '#059669',
    content: [
      'Provide and maintain our educational services',
      'Send important notifications about assignments, exams, and events',
      'Generate academic reports and performance analytics',
      'Improve app functionality and user experience',
      'Communicate with you about updates and support',
      'Ensure security and prevent fraudulent activities',
    ],
  },
  {
    icon: Eye,
    title: 'Information Sharing',
    color: '#7C3AED',
    content: [
      'We DO NOT sell your personal information to third parties',
      'School administrators can access student and teacher data within their institution',
      'Parents can view their children\'s academic information',
      'We may share data with service providers who assist in app operations',
      'Legal compliance: We may disclose information when required by law',
    ],
  },
  {
    icon: Shield,
    title: 'Data Security',
    color: '#DC2626',
    content: [
      'All data is encrypted during transmission using SSL/TLS protocols',
      'Passwords are securely hashed and never stored in plain text',
      '30-day encrypted session tokens with automatic expiration',
      'Regular security audits and vulnerability assessments',
      'Secure cloud infrastructure with backup and disaster recovery',
      'Access controls and authentication mechanisms',
    ],
  },
  {
    icon: Cookie,
    title: 'Cookies and Tracking',
    color: '#D89400',
    content: [
      'We use AsyncStorage for local session management',
      'No third-party advertising cookies are used',
      'Analytics cookies help us understand app usage patterns',
      'You can disable certain tracking through device settings',
      'Essential cookies are required for app functionality',
    ],
  },
  {
    icon: UserCheck,
    title: 'Your Rights',
    color: '#0891B2',
    content: [
      'Access: Request a copy of your personal data',
      'Correction: Update or correct inaccurate information',
      'Deletion: Request removal of your account and data',
      'Portability: Export your data in a machine-readable format',
      'Objection: Opt-out of certain data processing activities',
      'Withdraw consent: Revoke permissions at any time',
    ],
  },
  {
    icon: Bell,
    title: 'Notifications',
    color: '#DB2777',
    content: [
      'We send push notifications for assignments, exams, and announcements',
      'You can control notification preferences in app settings',
      'Email notifications for important account activities',
      'SMS alerts for critical updates (if phone number provided)',
      'You can opt-out of non-essential notifications',
    ],
  },
  {
    icon: FileText,
    title: 'Data Retention',
    color: '#0D9488',
    content: [
      'Active user data is retained while your account is active',
      'Academic records are kept for institutional requirements',
      'Deleted accounts: Data is permanently removed within 90 days',
      'Backup copies may be retained for up to 30 additional days',
      'Legal obligations may require longer retention periods',
    ],
  },
];

export default function PrivacyScreen() {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<number[]>([0]);

  const toggleSection = (index: number) => {
    setExpandedSections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
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
            style={styles.iconGradient}
          >
            <Shield color="#fff" size={40} strokeWidth={2.2} />
          </LinearGradient>
          <Text style={styles.title}>Your Privacy Matters</Text>
          <Text style={styles.subtitle}>
            We're committed to protecting your personal information and being transparent
            about how we collect, use, and secure your data.
          </Text>
          <View style={styles.updateBadge}>
            <Text style={styles.updateText}>Last updated: {LAST_UPDATED}</Text>
          </View>
        </View>

        {/* Quick Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <AlertCircle color={THEME.info} size={22} />
            <Text style={styles.summaryTitle}>Quick Summary</Text>
          </View>
          <View style={styles.summaryContent}>
            <View style={styles.summaryRow}>
              <CheckCircle color={THEME.success} size={16} />
              <Text style={styles.summaryText}>We never sell your data</Text>
            </View>
            <View style={styles.summaryRow}>
              <CheckCircle color={THEME.success} size={16} />
              <Text style={styles.summaryText}>All data is encrypted</Text>
            </View>
            <View style={styles.summaryRow}>
              <CheckCircle color={THEME.success} size={16} />
              <Text style={styles.summaryText}>You control your information</Text>
            </View>
            <View style={styles.summaryRow}>
              <CheckCircle color={THEME.success} size={16} />
              <Text style={styles.summaryText}>30-day secure sessions</Text>
            </View>
          </View>
        </View>

        {/* Policy Sections */}
        <View style={styles.sectionsContainer}>
          {POLICY_SECTIONS.map((section, index) => {
            const Icon = section.icon;
            const isExpanded = expandedSections.includes(index);

            return (
              <View key={index} style={styles.sectionCard}>
                <TouchableOpacity
                  onPress={() => toggleSection(index)}
                  activeOpacity={0.7}
                  style={styles.sectionHeader}
                >
                  <View style={styles.sectionHeaderLeft}>
                    <View style={[styles.sectionIconWrap, { backgroundColor: `${section.color}15` }]}>
                      <Icon color={section.color} size={22} />
                    </View>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                  </View>
                  {isExpanded ? (
                    <ChevronUp color={THEME.inkFaint} size={20} />
                  ) : (
                    <ChevronDown color={THEME.inkFaint} size={20} />
                  )}
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.sectionContent}>
                    {section.content.map((item, itemIndex) => (
                      <View key={itemIndex} style={styles.contentRow}>
                        <View style={styles.bullet} />
                        <Text style={styles.contentText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Children's Privacy */}
        <View style={styles.childrenSection}>
          <View style={styles.childrenHeader}>
            <UserCheck color={THEME.primary} size={24} />
            <Text style={styles.childrenTitle}>Children's Privacy</Text>
          </View>
          <Text style={styles.childrenText}>
            {APP_NAME} is designed for educational institutions serving students of all ages.
            For users under 13 years old, we require parental consent before collecting personal
            information. Parents can review, modify, or delete their child's information at any time.
          </Text>
        </View>

        {/* Contact Section */}
        <View style={styles.contactCard}>
          <Mail color={THEME.primaryDeep} size={28} />
          <Text style={styles.contactTitle}>Questions About Privacy?</Text>
          <Text style={styles.contactSubtitle}>
            If you have any questions or concerns about our privacy practices, we're here to help.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/contact')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={THEME.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.contactButton}
            >
              <Text style={styles.contactButtonText}>Contact Privacy Team</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using {APP_NAME}, you agree to this Privacy Policy.
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
    paddingVertical: 36,
    paddingHorizontal: 24,
  },
  iconGradient: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 12,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: THEME.inkMuted,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
  },
  updateBadge: {
    backgroundColor: THEME.surfaceAlt,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  updateText: {
    fontSize: 12,
    color: THEME.inkMuted,
    fontWeight: '600',
  },
  summaryCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: '#00000008',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.ink,
  },
  summaryContent: {
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryText: {
    fontSize: 14,
    color: THEME.inkMuted,
    fontWeight: '500',
    flex: 1,
  },
  sectionsContainer: {
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  sectionCard: {
    backgroundColor: THEME.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sectionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.ink,
    flex: 1,
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  contentRow: {
    flexDirection: 'row',
    gap: 10,
    paddingLeft: 4,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.primaryDeep,
    marginTop: 6,
  },
  contentText: {
    fontSize: 13,
    lineHeight: 20,
    color: THEME.inkMuted,
    fontWeight: '500',
    flex: 1,
  },
  childrenSection: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: THEME.surfaceAlt,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  childrenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  childrenTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.ink,
  },
  childrenText: {
    fontSize: 14,
    lineHeight: 21,
    color: THEME.inkMuted,
    fontWeight: '500',
  },
  contactCard: {
    marginHorizontal: 24,
    marginBottom: 32,
    backgroundColor: THEME.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.ink,
    marginTop: 16,
    marginBottom: 8,
  },
  contactSubtitle: {
    fontSize: 14,
    color: THEME.inkMuted,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  contactButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  contactButtonText: {
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
    textAlign: 'center',
  },
  copyrightText: {
    fontSize: 11,
    color: THEME.inkFaint,
    fontWeight: '400',
  },
});
