import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Animated,
  Easing,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useStaffDashboard } from '@/context/StaffDashboardContext';

const { width } = Dimensions.get('window');

/**
 * Small helper component: fades + slides a section up on mount, with an
 * optional stagger delay. Keeps entrance animation logic out of the main
 * render so each section can animate independently.
 */
function AnimatedSection({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: any;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 480,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 480,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

/**
 * Press-scale wrapper for list rows — the mobile equivalent of a "hover
 * lift": a quick, smooth spring shrink/grow on touch for tactile feedback.
 */
function PressScale({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();

  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={onPress}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function StaffDashboardScreen() {
  const { userData } = useAuth();
  const {
    user,
    attendance,
    events,
    holidays,
    notices,
    loading,
    attendanceLoading,
    eventsLoading,
    holidaysLoading,
    noticesLoading,
    fetchAllDashboardData,
  } = useStaffDashboard();

  // Gentle infinite float for the avatar, and a slow pulsing glow behind
  // the attendance ring, both driven by looping native-driver animations.
  const avatarFloat = useRef(new Animated.Value(0)).current;
  const ringGlow = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    fetchAllDashboardData();

    Animated.loop(
      Animated.sequence([
        Animated.timing(avatarFloat, {
          toValue: -4,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(avatarFloat, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(ringGlow, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ringGlow, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.spring(ringScale, {
      toValue: 1,
      friction: 6,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, []);

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const onRefresh = () => {
    fetchAllDashboardData();
  };

  const ringGlowOpacity = ringGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.55],
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={onRefresh}
          colors={['#667eea', '#ec4899']}
          tintColor="#667eea"
        />
      }
    >
      {/* Header Card */}
      <AnimatedSection delay={0}>
        <LinearGradient
          colors={['#667eea', '#8b5cf6', '#ec4899']}
          style={styles.headerCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Animated.View
              style={[
                styles.avatar,
                { transform: [{ translateY: avatarFloat }] },
              ]}
            >
              <Text style={styles.avatarText}>
                {getInitials(
                  user?.firstName || userData?.name?.split(' ')[0],
                  user?.lastName || userData?.name?.split(' ')[1]
                )}
              </Text>
            </Animated.View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerGreeting}>
                Hello, {user?.firstName || user?.name || userData?.name || 'User'}
              </Text>
              <Text style={styles.headerRole}>
                {user?.role || userData?.role || 'STAFF'} | {user?.designation || 'TEACHING'}
              </Text>
              <Text style={styles.headerSchool}>
                {user?.school_name || userData?.school_name || 'WISDOM WORLD PUBLIC SCHOOL'}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </AnimatedSection>

      {/* Attendance Section */}
      <AnimatedSection delay={80} style={styles.section}>
        <Text style={styles.sectionTitle}>This Month's Attendance</Text>

        {attendanceLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
          </View>
        ) : (
          <>
            {/* Circular Progress */}
            <View style={styles.attendanceCircleContainer}>
              <Animated.View
                style={[
                  styles.attendanceGlow,
                  { opacity: ringGlowOpacity, transform: [{ scale: ringScale }] },
                ]}
              />
              <Animated.View
                style={[
                  styles.attendanceCircle,
                  { transform: [{ scale: ringScale }] },
                ]}
              >
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={styles.attendanceCircleBorder}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.attendanceCircleInner}>
                    <Text style={styles.attendancePercentage}>
                      {attendance.percentage}%
                    </Text>
                    <Text style={styles.attendanceLabel}>ATTENDANCE</Text>
                  </View>
                </LinearGradient>
              </Animated.View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, styles.statPresent]}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={32}
                  color="#10b981"
                />
                <Text style={[styles.statValue, { color: '#10b981' }]}>
                  {attendance.present}
                </Text>
                <Text style={[styles.statLabel, { color: '#059669' }]}>
                  PRESENT
                </Text>
              </View>

              <View style={[styles.statCard, styles.statAbsent]}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={32}
                  color="#ef4444"
                />
                <Text style={[styles.statValue, { color: '#ef4444' }]}>
                  {attendance.absent}
                </Text>
                <Text style={[styles.statLabel, { color: '#dc2626' }]}>
                  ABSENT
                </Text>
              </View>

              <View style={[styles.statCard, styles.statLeave]}>
                <MaterialCommunityIcons name="umbrella-beach" size={32} color="#f59e0b" />
                <Text style={[styles.statValue, { color: '#f59e0b' }]}>
                  {attendance.leave}
                </Text>
                <Text style={[styles.statLabel, { color: '#d97706' }]}>
                  LEAVE
                </Text>
              </View>
            </View>
          </>
        )}
      </AnimatedSection>

      {/* Upcoming Events */}
      <AnimatedSection delay={160} style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconBadge, { backgroundColor: '#eef0ff' }]}>
            <MaterialCommunityIcons name="calendar" size={16} color="#6366f1" />
          </View>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
        </View>

        {eventsLoading ? (
          <ActivityIndicator size="small" color="#6366f1" />
        ) : events.length > 0 ? (
          events.map((event, index) => (
            <PressScale key={index} style={[styles.listCard, styles.eventCard]}>
              <Text style={styles.listTitle}>{event.title}</Text>
              <Text style={styles.listDate}>{formatDate(event.date)}</Text>
            </PressScale>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="calendar-blank"
              size={32}
              color="#94a3b8"
            />
            <Text style={styles.emptyText}>No upcoming events</Text>
          </View>
        )}
      </AnimatedSection>

      {/* Upcoming Holidays */}
      <AnimatedSection delay={240} style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconBadge, { backgroundColor: '#fffbeb' }]}>
            <MaterialCommunityIcons name="beach" size={16} color="#f59e0b" />
          </View>
          <Text style={styles.sectionTitle}>Upcoming Holidays</Text>
        </View>

        {holidaysLoading ? (
          <ActivityIndicator size="small" color="#f59e0b" />
        ) : holidays.length > 0 ? (
          holidays.map((holiday, index) => (
            <PressScale key={index} style={[styles.listCard, styles.holidayCard]}>
              <Text style={styles.listTitle}>{holiday.title}</Text>
              <Text style={styles.listDate}>{formatDate(holiday.date)}</Text>
            </PressScale>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="beach" size={32} color="#94a3b8" />
            <Text style={styles.emptyText}>No upcoming holidays</Text>
          </View>
        )}
      </AnimatedSection>

      {/* Notices & Circulars */}
      <AnimatedSection delay={320} style={[styles.section, { marginBottom: 32 }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconBadge, { backgroundColor: '#fdf2f8' }]}>
            <MaterialCommunityIcons name="bell-ring" size={16} color="#ec4899" />
          </View>
          <Text style={styles.sectionTitle}>Notices & Circulars</Text>
        </View>

        {noticesLoading ? (
          <ActivityIndicator size="small" color="#ec4899" />
        ) : notices.length > 0 ? (
          notices.map((notice, index) => (
            <PressScale key={index} style={[styles.listCard, styles.noticeCard]}>
              <Text style={styles.listTitle}>{notice.title}</Text>
              {notice.description && (
                <Text style={styles.listDescription}>{notice.description}</Text>
              )}
              <Text style={styles.listDate}>{formatDate(notice.createdAt)}</Text>
            </PressScale>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="bell-outline" size={32} color="#94a3b8" />
            <Text style={styles.emptyText}>No notices</Text>
          </View>
        )}
      </AnimatedSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom tabs
  },
  headerCard: {
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    padding: 18,
    shadowColor: '#764ba2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerTextContainer: {
    marginLeft: 14,
    flex: 1,
  },
  headerGreeting: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 3,
  },
  headerRole: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  headerSchool: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  attendanceCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  attendanceGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#10b981',
  },
  attendanceCircle: {
    width: 132,
    height: 132,
    borderRadius: 66,
  },
  attendanceCircleBorder: {
    width: 132,
    height: 132,
    borderRadius: 66,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendanceCircleInner: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendancePercentage: {
    fontSize: 30,
    fontWeight: '800',
    color: '#10b981',
  },
  attendanceLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statPresent: {
    backgroundColor: '#d1fae5',
  },
  statAbsent: {
    backgroundColor: '#fecaca',
  },
  statLeave: {
    backgroundColor: '#fde68a',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  listCard: {
    borderRadius: 10,
    padding: 13,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  eventCard: {
    backgroundColor: '#f5f6ff',
    borderLeftColor: '#6366f1',
  },
  holidayCard: {
    backgroundColor: '#fffbeb',
    borderLeftColor: '#f59e0b',
  },
  noticeCard: {
    backgroundColor: '#fef2f2',
    borderLeftColor: '#ec4899',
  },
  listTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 3,
  },
  listDescription: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 3,
  },
  listDate: {
    fontSize: 11,
    color: '#64748b',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 26,
  },
  emptyText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 6,
  },
});