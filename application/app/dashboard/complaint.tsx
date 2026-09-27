import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  AlertCircle,
  Clock,
  RefreshCw,
  CheckCircle,
  Calendar,
  FileText,
  BarChart3,
} from 'lucide-react-native';
import type { AppDispatch, RootState } from '@/state/store';
import { fetchSchoolDashboard } from '@/state/schoolDashboardsSlice';
import { useColors } from '@/hooks/useColors';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 3;

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/** Fades + slides a block up on mount, with an optional stagger delay. */
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
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 440,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 440,
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

/** Press-scale wrapper — smooth spring shrink/grow on touch, the mobile equivalent of a hover lift. */
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
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start();

  return (
    <TouchableOpacity activeOpacity={0.9} onPressIn={pressIn} onPressOut={pressOut} onPress={onPress}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </TouchableOpacity>
  );
}

export default function ComplaintDashboard() {
  const router = useRouter();
  const colors = useColors();
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.schoolDashboards['complaint']);
  const [activeTab, setActiveTab] = useState<'complaints' | 'breakdown'>('complaints');

  const load = useCallback(() => dispatch(fetchSchoolDashboard('complaint')), [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const dashboard = data || {};
  const complaints = dashboard.complaints || [];
  const priority = dashboard.priority || {};
  const actionBreakdown = dashboard.actionBreakdown || [];

  const stats = [
    { key: 'total', label: 'TOTAL', value: dashboard.total || 0, icon: FileText, color: '#f97316' },
    { key: 'pending', label: 'PENDING', value: dashboard.pending || 0, icon: Clock, color: '#f59e0b' },
    { key: 'inProgress', label: 'IN PROGRESS', value: dashboard.inProgress || 0, icon: RefreshCw, color: '#3b82f6' },
    { key: 'resolved', label: 'RESOLVED', value: dashboard.resolved || 0, icon: CheckCircle, color: '#10b981' },
    { key: 'unresolved', label: 'UNRESOLVED', value: dashboard.unresolved || 0, icon: AlertCircle, color: '#ef4444' },
    { key: 'todays', label: "TODAY'S", value: dashboard.todays || 0, icon: Calendar, color: '#8b5cf6' },
  ];

  // Animated indicator for tabs
  const tabIndicator = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(tabIndicator, {
      toValue: activeTab === 'complaints' ? 0 : 1,
      useNativeDriver: true,
      speed: 22,
      bounciness: 8,
    }).start();
  }, [activeTab]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} colors={['#ef4444', '#f97316']} tintColor="#ef4444" />}
    >
      {/* Header */}
      <AnimatedSection delay={0}>
        <LinearGradient colors={['#f97316', '#ef4444', '#b91c1c']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <PressScale onPress={() => router.back()} style={styles.back}>
            <ArrowLeft size={16} color="#fff" />
            <Text style={styles.backText}>Back to Dashboard</Text>
          </PressScale>
          <Text style={styles.title}>Complaint Dashboard</Text>
          <Text style={styles.subtitle}>Track complaints, priorities, and resolution progress</Text>
        </LinearGradient>
      </AnimatedSection>

      {error && (
        <AnimatedSection delay={40} style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </AnimatedSection>
      )}

      {loading && !data ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ef4444" />
        </View>
      ) : (
        <>
          {/* Stats Grid */}
          <View style={styles.statsContainer}>
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <AnimatedSection key={stat.key} delay={60 + i * 40} style={{ width: cardWidth }}>
                  <PressScale style={[styles.statCard, { borderTopColor: stat.color }]}>
                    <View style={[styles.iconBox, { backgroundColor: `${stat.color}20` }]}>
                      <Icon size={17} color={stat.color} />
                    </View>
                    <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </PressScale>
                </AnimatedSection>
              );
            })}
          </View>

          {/* Priority Breakdown */}
          <AnimatedSection delay={340} style={[styles.section, { backgroundColor: colors.card, zIndex: 0 }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBadge, { backgroundColor: '#fef2f2' }]}>
                <AlertCircle size={15} color="#ef4444" />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Priority Breakdown</Text>
            </View>
            <View style={styles.priorityGrid}>
              {Object.entries(priority).map(([key, value]) => (
                <View
                  key={key}
                  style={[
                    styles.priorityItem,
                    {
                      backgroundColor:
                        key === 'Low' ? '#ecfdf5' : key === 'Medium' ? '#fffbeb' : key === 'High' ? '#fef2f2' : '#fee2e2',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityLabel,
                      {
                        color:
                          key === 'Low' ? '#10b981' : key === 'Medium' ? '#f59e0b' : key === 'High' ? '#ef4444' : '#dc2626',
                      },
                    ]}
                  >
                    {key}
                  </Text>
                  <Text
                    style={[
                      styles.priorityValue,
                      {
                        color:
                          key === 'Low' ? '#059669' : key === 'Medium' ? '#d97706' : key === 'High' ? '#dc2626' : '#b91c1c',
                      },
                    ]}
                  >
                    {value as number}
                  </Text>
                </View>
              ))}
            </View>
          </AnimatedSection>

          {/* Tabs */}
          <AnimatedSection delay={420} style={[styles.tabsContainer, { backgroundColor: colors.card }]}>
            <Animated.View
              style={[
                styles.tabIndicator,
                {
                  transform: [
                    {
                      translateX: tabIndicator.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, (width - 32 - 8) / 2],
                      }),
                    },
                  ],
                },
              ]}
            />
            <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('complaints')} activeOpacity={0.8}>
              <Text style={[styles.tabText, { color: colors.text }, activeTab === 'complaints' && styles.activeTabText]}>
                Complaints
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('breakdown')} activeOpacity={0.8}>
              <Text style={[styles.tabText, { color: colors.text }, activeTab === 'breakdown' && styles.activeTabText]}>
                Action Breakdown
              </Text>
            </TouchableOpacity>
          </AnimatedSection>

          {/* Table Content */}
          {activeTab === 'complaints' ? (
            <View style={[styles.tableContainer, { zIndex: 1 }]}>
              {complaints.length > 0 ? (
                complaints.slice(0, 20).map((complaint: any, index: number) => (
                  <AnimatedSection key={index} delay={Math.min(index, 10) * 40} style={[styles.recordCard, { backgroundColor: colors.card, borderLeftColor: '#ef4444' }]}>
                    <PressScale style={{ padding: 0 }}>
                      <View style={styles.recordRow}>
                        <Text style={[styles.recordLabel, { color: colors.mutedForeground }]}>Name:</Text>
                        <Text style={[styles.recordValue, { color: colors.text }]}>{complaint.complaintBy || '-'}</Text>
                      </View>
                      <View style={styles.recordRow}>
                        <Text style={[styles.recordLabel, { color: colors.mutedForeground }]}>Type:</Text>
                        <Text style={[styles.recordValue, { color: colors.text }]}>{complaint.complaintType || '-'}</Text>
                      </View>
                      <View style={styles.recordRow}>
                        <Text style={[styles.recordLabel, { color: colors.mutedForeground }]}>Priority:</Text>
                        <Text
                          style={[
                            styles.recordValue,
                            {
                              color:
                                complaint.priority === 'Low'
                                  ? '#10b981'
                                  : complaint.priority === 'Medium'
                                  ? '#f59e0b'
                                  : complaint.priority === 'High'
                                  ? '#ef4444'
                                  : '#dc2626',
                            },
                          ]}
                        >
                          {complaint.priority || '-'}
                        </Text>
                      </View>
                      <View style={styles.recordRow}>
                        <Text style={[styles.recordLabel, { color: colors.mutedForeground }]}>Status:</Text>
                        <Text style={[styles.recordValue, { color: colors.text }]}>{complaint.status || '-'}</Text>
                      </View>
                      <View style={styles.recordRow}>
                        <Text style={[styles.recordLabel, { color: colors.mutedForeground }]}>Date:</Text>
                        <Text style={[styles.recordValue, { color: colors.mutedForeground }]}>{formatDate(complaint.date)}</Text>
                      </View>
                    </PressScale>
                  </AnimatedSection>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <FileText size={44} color="#cbd5e1" />
                  <Text style={styles.emptyText}>No complaints found</Text>
                </View>
              )}
            </View>
          ) : (
            <AnimatedSection delay={0} style={[styles.section, { backgroundColor: colors.card, zIndex: 1 }]}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>Action Status Breakdown</Text>
              {actionBreakdown.length > 0 ? (
                <View style={styles.breakdownGrid}>
                  {actionBreakdown.map((item: any) => (
                    <View key={item.label} style={styles.breakdownCard}>
                      <Text style={styles.breakdownLabel}>{item.label}</Text>
                      <Text style={[styles.breakdownValue, { color: colors.text }]}>{item.value}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <BarChart3 size={44} color="#cbd5e1" />
                  <Text style={styles.emptyText}>No breakdown data available</Text>
                </View>
              )}
            </AnimatedSection>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    padding: 18,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 8,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  backText: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 11,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.88)',
  },
  errorContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12.5,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    borderTopWidth: 3,
    borderRadius: 12,
    padding: 11,
    alignItems: 'center',
    minHeight: 98,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },
  statValue: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#718096',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 13,
    padding: 16,
    // No elevation on sections that sit next to the animated tabs row —
    // see the tabsContainer comment below for why.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  priorityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityItem: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  priorityValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#f1f3f6',
    position: 'relative',
    zIndex: 0,
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    width: '50%',
    backgroundColor: '#ef4444',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    zIndex: 1,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748b',
  },
  activeTabText: {
    color: '#fff',
  },
  tableContainer: {
    marginHorizontal: 16,
  },
  recordCard: {
    borderRadius: 12,
    padding: 13,
    marginBottom: 10,
    elevation: 2,
    borderLeftWidth: 3,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  recordLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  recordValue: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  breakdownCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#f4f6f9',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#718096',
    marginBottom: 4,
    textAlign: 'center',
  },
  breakdownValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  emptyText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 10,
  },
});