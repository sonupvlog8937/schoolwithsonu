import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  Search,
  UserSearch,
} from 'lucide-react-native';
import type { AppDispatch, RootState } from '@/state/store';
import { fetchSchoolDashboard } from '@/state/schoolDashboardsSlice';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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

export default function FollowUpDashboard() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.schoolDashboards['follow-up']);
  const [activeTab, setActiveTab] = useState<'followups' | 'report'>('followups');
  const [search, setSearch] = useState('');
  const [viewFilter, setViewFilter] = useState<'all' | 'followup'>('all');

  const load = useCallback(() => dispatch(fetchSchoolDashboard('follow-up')), [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  // Animated indicator that slides between the two tabs
  const tabIndicator = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(tabIndicator, {
      toValue: activeTab === 'followups' ? 0 : 1,
      useNativeDriver: true,
      speed: 22,
      bounciness: 8,
    }).start();
  }, [activeTab]);

  const dashboard = data || {};
  const enquiries = dashboard.enquiries || [];
  const calls = dashboard.calls || [];
  const classWiseBreakdown = dashboard.classWiseBreakdown || [];
  const prmWisePerformance = dashboard.prmWisePerformance || [];

  // Stats configuration
  const stats = [
    { key: 'total', label: 'TOTAL QUERIES', value: dashboard.total || 0, icon: FileText, color: '#ec4899' },
    { key: 'active', label: 'ACTIVE', value: dashboard.active || 0, icon: CheckCircle2, color: '#10b981' },
    { key: 'converted', label: 'CONVERTED', value: dashboard.converted || 0, icon: RefreshCw, color: '#3b82f6' },
    { key: 'upcoming', label: 'PENDING FOLLOW-UPS', value: dashboard.upcoming || 0, icon: Clock3, color: '#f59e0b' },
    { key: 'todayFollowUps', label: "TODAY'S FOLLOW-UPS", value: dashboard.todayFollowUps || 0, icon: Bell, color: '#ef4444' },
    { key: 'unassigned', label: 'UNASSIGNED', value: dashboard.unassigned || 0, icon: UserSearch, color: '#8b5cf6' },
  ];

  // Combined records for table
  const records = [
    ...enquiries.map((e: any) => ({ ...e, type: 'Enquiry' })),
    ...calls.map((c: any) => ({ ...c, type: 'Call' })),
  ].filter((record) => {
    const normalizedSearch = String(search || '').toLowerCase();
    if (
      normalizedSearch &&
      !String(record.studentName || '').toLowerCase().includes(normalizedSearch) &&
      !String(record.name || '').toLowerCase().includes(normalizedSearch) &&
      !String(record.phone || '').toLowerCase().includes(normalizedSearch)
    ) {
      return false;
    }

    if (viewFilter === 'followup') {
      const statusText = String(record.status || '').toLowerCase();
      const hasFollowUp = Boolean(record.followUpDate) || statusText.includes('follow') || statusText.includes('pending');
      if (!hasFollowUp) return false;
    }

    return true;
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} colors={['#ec4899', '#8b5cf6']} tintColor="#ec4899" />}
    >
      {/* Header */}
      <AnimatedSection delay={0}>
        <LinearGradient colors={['#ec4899', '#db2777', '#7c3aed']} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <PressScale onPress={() => router.back()} style={styles.back}>
            <ArrowLeft size={16} color="#fff" />
            <Text style={styles.backText}>Back to Dashboard</Text>
          </PressScale>
          <Text style={styles.title}>Admission & Follow-up Dashboard</Text>
          <Text style={styles.subtitle}>Track admission queries, follow-ups, and PRM performance</Text>
        </LinearGradient>
      </AnimatedSection>

      {error && (
        <AnimatedSection delay={40} style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </AnimatedSection>
      )}

      {loading && !data ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ec4899" />
        </View>
      ) : (
        <>
          {/* Stats Grid - 6 Cards in 2 rows */}
          <View style={styles.statsContainer}>
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <AnimatedSection key={stat.key} delay={60 + i * 40} style={{ width: cardWidth }}>
                  <PressScale style={[styles.statCard, { borderLeftColor: stat.color }]}>
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

          {/* Class-wise Breakdown */}
          <AnimatedSection delay={340} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBadge, { backgroundColor: '#fdf2f8' }]}>
                <FileText size={15} color="#ec4899" />
              </View>
              <Text style={styles.sectionTitle}>Class-wise Breakdown</Text>
            </View>
            {classWiseBreakdown.length > 0 ? (
              <View>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Class</Text>
                  <Text style={styles.tableHeaderCell}>Total</Text>
                  <Text style={styles.tableHeaderCell}>Active</Text>
                  <Text style={styles.tableHeaderCell}>Converted</Text>
                </View>
                {classWiseBreakdown.map((item: any, index: number) => (
                  <AnimatedSection key={index} delay={Math.min(index, 5) * 30}>
                    <View style={styles.tableRow}>
                      <Text style={[styles.tableCell, { flex: 2, fontWeight: '600' }]}>{item._id || 'Not Specified'}</Text>
                      <Text style={styles.tableCell}>{item.total || 0}</Text>
                      <Text style={[styles.tableCell, { color: '#10b981' }]}>{item.active || 0}</Text>
                      <Text style={[styles.tableCell, { color: '#3b82f6' }]}>{item.converted || 0}</Text>
                    </View>
                  </AnimatedSection>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <FileText size={32} color="#cbd5e1" />
                <Text style={styles.emptyText}>No Data</Text>
              </View>
            )}
          </AnimatedSection>

          {/* PRM-wise Performance */}
          <AnimatedSection delay={380} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBadge, { backgroundColor: '#eef2ff' }]}>
                <FileText size={15} color="#6366f1" />
              </View>
              <Text style={styles.sectionTitle}>PRM-wise Performance</Text>
            </View>
            {prmWisePerformance.length > 0 ? (
              <View>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, { flex: 2 }]}>PRM</Text>
                  <Text style={styles.tableHeaderCell}>Assigned</Text>
                  <Text style={styles.tableHeaderCell}>Converted</Text>
                </View>
                {prmWisePerformance.map((item: any, index: number) => (
                  <AnimatedSection key={index} delay={Math.min(index, 5) * 30}>
                    <View style={styles.tableRow}>
                      <Text style={[styles.tableCell, { flex: 2, fontWeight: '600' }]}>{item.prmName || 'Unknown'}</Text>
                      <Text style={styles.tableCell}>{item.assigned || 0}</Text>
                      <Text style={[styles.tableCell, { color: '#3b82f6' }]}>{item.converted || 0}</Text>
                    </View>
                  </AnimatedSection>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <FileText size={28} color="#cbd5e1" />
                <Text style={styles.emptyText}>No Data</Text>
              </View>
            )}
          </AnimatedSection>

          {/* Tabs */}
          <AnimatedSection delay={420} style={styles.tabsContainer}>
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
            <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('followups')} activeOpacity={0.8}>
              <Text style={[styles.tabText, activeTab === 'followups' && styles.activeTabText]}>Follow-ups</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('report')} activeOpacity={0.8}>
              <Text style={[styles.tabText, activeTab === 'report' && styles.activeTabText]}>Admission Report</Text>
            </TouchableOpacity>
          </AnimatedSection>

          {/* Filters for Follow-ups tab */}
          {activeTab === 'followups' && (
            <AnimatedSection delay={440} style={styles.filtersSection}>
              <View style={styles.filterRow}>
                <TouchableOpacity
                  style={[
                    styles.filterButtonPrimary,
                    viewFilter === 'followup' ? { backgroundColor: '#ec4899' } : { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setViewFilter('followup');
                    load();
                  }}
                >
                  <Text style={[styles.filterButtonPrimaryText, viewFilter !== 'followup' && { color: '#64748b' }]}>Follow-ups</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterButtonSecondary,
                    viewFilter === 'all' ? { backgroundColor: '#6366f1', borderColor: '#6366f1' } : { backgroundColor: '#fff', borderColor: '#e2e8f0' },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setViewFilter('all');
                    setSearch('');
                    load();
                  }}
                >
                  <Text style={[styles.filterButtonSecondaryText, viewFilter === 'all' && { color: '#fff' }]}>All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.filterRow}>
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateLabel}>From</Text>
                  <MaterialCommunityIcons name="calendar" size={16} color="#94a3b8" />
                </View>
                
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateLabel}>To</Text>
                  <MaterialCommunityIcons name="calendar" size={16} color="#94a3b8" />
                </View>
              </View>
            </AnimatedSection>
          )}

          {/* Search */}
          <AnimatedSection delay={460} style={styles.searchContainer}>
            <Search size={15} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or phone"
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#94a3b8"
            />
          </AnimatedSection>

          {/* Table Content */}
          {activeTab === 'followups' && (
            <View style={styles.tableContainer}>
              {records.length > 0 ? (
                records.map((record, index) => (
                  <AnimatedSection key={index} delay={Math.min(index, 10) * 40} style={styles.recordCard}>
                    <PressScale style={{ padding: 0 }}>
                      <View style={styles.recordRow}>
                        <Text style={styles.recordLabel}>Student:</Text>
                        <Text style={styles.recordValue}>{record.studentName || record.name || '-'}</Text>
                      </View>
                      <View style={styles.recordRow}>
                        <Text style={styles.recordLabel}>Type:</Text>
                        <Text style={[styles.recordValue, { color: record.type === 'Enquiry' ? '#3b82f6' : '#10b981' }]}>
                          {record.type}
                        </Text>
                      </View>
                      <View style={styles.recordRow}>
                        <Text style={styles.recordLabel}>Follow-up Date:</Text>
                        <Text style={styles.recordValue}>{formatDate(record.followUpDate)}</Text>
                      </View>
                      {record.status && (
                        <View style={styles.recordRow}>
                          <Text style={styles.recordLabel}>Status:</Text>
                          <Text style={styles.recordValue}>{record.status}</Text>
                        </View>
                      )}
                    </PressScale>
                  </AnimatedSection>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <FileText size={44} color="#cbd5e1" />
                  <Text style={styles.emptyText}>No Data</Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'report' && (
            <View style={styles.tableContainer}>
              <View style={styles.emptyState}>
                <FileText size={44} color="#cbd5e1" />
                <Text style={styles.emptyText}>No Data</Text>
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    shadowColor: '#db2777',
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
    backgroundColor: '#fee2e2',
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
    borderLeftWidth: 4,
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
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 13,
    padding: 16,
    elevation: 2,
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f6',
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
    color: '#17233b',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f6',
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  tableCell: {
    flex: 1,
    fontSize: 11,
    color: '#17233b',
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    width: '50%',
    backgroundColor: '#ec4899',
    borderRadius: 8,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: '#17233b',
  },
  filtersSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  filterButtonPrimary: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonPrimaryText: {
    color: '#fff',
    fontSize: 12.5,
    fontWeight: '600',
  },
  filterButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  filterButtonSecondaryText: {
    color: '#64748b',
    fontSize: 12.5,
    fontWeight: '600',
  },
  dateInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  dateLabel: {
    color: '#94a3b8',
    fontSize: 12.5,
    fontWeight: '500',
  },
  tableContainer: {
    marginHorizontal: 16,
  },
  recordCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 13,
    marginBottom: 10,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#ec4899',
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  recordLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  recordValue: {
    fontSize: 11,
    color: '#17233b',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
});