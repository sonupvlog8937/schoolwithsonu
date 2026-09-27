import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
  Easing,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Users,
  Calendar,
  RefreshCw,
  CheckCircle,
  TrendingUp,
  BarChart3,
} from 'lucide-react-native';
import type { AppDispatch, RootState } from '@/state/store';
import { fetchSchoolDashboard } from '@/state/schoolDashboardsSlice';
import { useColors } from '@/hooks/useColors';

const { width } = Dimensions.get('window');
// 16px side padding x2 + two 10px gaps, three cards per row
const cardWidth = (width - 32 - 20) / 3;

type Grad = readonly [string, string];
type IconType = React.ComponentType<{ size?: number; color?: string }>;

const STAT_GRADS: Grad[] = [
  ['#6366f1', '#334155'],
  ['#a78bfa', '#7c3aed'],
  ['#fb923c', '#ea580c'],
  ['#34d399', '#059669'],
  ['#38bdf8', '#2563eb'],
  ['#fb7185', '#e11d48'],
];
const BAR_GRADS: Grad[] = [
  ['#818cf8', '#4f46e5'],
  ['#f472b6', '#db2777'],
  ['#34d399', '#059669'],
  ['#fbbf24', '#f59e0b'],
  ['#38bdf8', '#0284c7'],
  ['#a78bfa', '#7c3aed'],
  ['#fb7185', '#e11d48'],
];
const TYPE_COLORS: Record<string, string> = {
  Parent: '#ec4899',
  Vendor: '#f59e0b',
  Guest: '#3b82f6',
  'Interview Candidate': '#8b5cf6',
  Staff: '#14b8a6',
  Other: '#64748b',
};
const ACCENTS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#0ea5e9', '#8b5cf6'];
const pick = (str: string | undefined, list: string[]) =>
  list[[...String(str ?? '')].reduce((a, c) => a + c.charCodeAt(0), 0) % list.length];

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/* ---------- Animation helpers ---------- */

// Smooth fade + slide-up entrance
function AnimatedSection({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 500,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v,
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

// Springy press feedback
function PressScale({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (t: number) =>
    Animated.spring(scale, { toValue: t, useNativeDriver: true, speed: 40, bounciness: 6 }).start();

  return (
    <TouchableWithoutFeedback onPressIn={() => to(0.96)} onPressOut={() => to(1)} onPress={onPress}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </TouchableWithoutFeedback>
  );
}

// Number that counts up smoothly
function CountUp({ value, style }: { value: number; style?: any }) {
  const v = useRef(new Animated.Value(0)).current;
  const [n, setN] = useState(0);

  useEffect(() => {
    const id = v.addListener(({ value: x }) => setN(x));
    Animated.timing(v, {
      toValue: Number(value) || 0,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => v.removeListener(id);
  }, [value]);

  return <Text style={style}>{Math.round(n).toLocaleString('en-IN')}</Text>;
}

// Bar that grows from 0
function Bar({ h, colors, delay }: { h: number; colors: Grad; delay: number }) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 800,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.bar, { height: v.interpolate({ inputRange: [0, 1], outputRange: [0, h] }) }]}>
      <LinearGradient colors={colors} style={{ flex: 1 }} />
    </Animated.View>
  );
}

// Soft pulsing dot for the "In" status
function PulseDot({ color }: { color: string }) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(v, { toValue: 1, duration: 1400, easing: Easing.out(Easing.ease), useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={styles.pulseWrap}>
      <Animated.View
        style={[
          styles.pulseRing,
          {
            backgroundColor: color,
            opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
            transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.9] }) }],
          },
        ]}
      />
      <View style={[styles.pulseCore, { backgroundColor: color }]} />
    </View>
  );
}

/* ---------- Small components (outside main so they don't remount) ---------- */

function StatCard({
  label,
  value,
  icon: Icon,
  colors,
  delay,
}: {
  label: string;
  value: number;
  icon: IconType;
  colors: Grad;
  delay: number;
}) {
  return (
    <AnimatedSection delay={delay} style={{ width: cardWidth }}>
      <PressScale style={[styles.statCard, { shadowColor: colors[1] }]}>
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statGradient}>
          <View style={styles.bubbleBig} />
          <View style={styles.bubbleSmall} />
          <View style={styles.iconBox}>
            <Icon size={16} color="#fff" />
          </View>
          <CountUp value={value} style={styles.statValue} />
          <Text style={styles.statLabel} numberOfLines={1}>
            {label}
          </Text>
        </LinearGradient>
      </PressScale>
    </AnimatedSection>
  );
}

function SectionHeader({ icon: Icon, color, title, textColor }: { icon: IconType; color: string; title: string; textColor: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIconBadge, { backgroundColor: `${color}22` }]}>
        <Icon size={15} color={color} />
      </View>
      <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
    </View>
  );
}

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: `${color}1A` }]}>
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

function StatusPill({ status }: { status?: string }) {
  if (!status) return null;
  const isIn = status === 'In';
  const c = isIn ? '#2563eb' : '#059669';
  return (
    <View style={[styles.statusPill, { backgroundColor: isIn ? '#3b82f61A' : '#10b9811F' }]}>
      {isIn ? <PulseDot color={c} /> : <View style={[styles.pulseCore, { backgroundColor: c }]} />}
      <Text style={[styles.pillText, { color: c }]}>{status}</Text>
    </View>
  );
}

export default function VisitorDashboard() {
  const router = useRouter();
  const colors = useColors();
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.schoolDashboards['visitor']);

  const load = useCallback(() => dispatch(fetchSchoolDashboard('visitor')), [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const dashboard: any = data || {};
  const visitors = dashboard.visitors || [];
  const dailyVisitors = dashboard.dailyVisitors || [];

  const stats: { key: string; label: string; value: number; icon: IconType }[] = [
    { key: 'total', label: 'Total', value: dashboard.total || 0, icon: Users },
    { key: 'todaysVisitors', label: "Today's", value: dashboard.todaysVisitors || 0, icon: Calendar },
    { key: 'currentlyInside', label: 'Inside', value: dashboard.currentlyInside || 0, icon: RefreshCw },
    { key: 'checkedOutToday', label: 'Checked out', value: dashboard.checkedOutToday || 0, icon: CheckCircle },
    { key: 'thisWeek', label: 'This week', value: dashboard.thisWeek || 0, icon: TrendingUp },
    { key: 'thisMonth', label: 'This month', value: dashboard.thisMonth || 0, icon: Calendar },
  ];

  const maxCount = Math.max(...dailyVisitors.map((d: any) => d.count), 1);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={load} colors={['#6366f1', '#ec4899', '#10b981']} tintColor="#6366f1" />
      }
    >
      {/* Header */}
      <AnimatedSection delay={0}>
        <LinearGradient
          colors={['#334155', '#4f46e5', '#a855f7', '#ec4899']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.bubbleBig} />
          <View style={styles.bubbleSmall} />
          <PressScale onPress={() => router.back()} style={styles.back}>
            <ArrowLeft size={14} color="#fff" />
            <Text style={styles.backText}>Back to Dashboard</Text>
          </PressScale>
          <Text style={styles.title}>Visitor Dashboard</Text>
          <Text style={styles.subtitle}>Track visitor check-ins, purposes, and footfall trends</Text>
        </LinearGradient>
      </AnimatedSection>

      {error && (
        <AnimatedSection delay={40} style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </AnimatedSection>
      )}

      {loading && !data ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <>
          {/* Stats Grid */}
          <View style={styles.statsContainer}>
            {stats.map((stat, i) => (
              <StatCard
                key={stat.key}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                colors={STAT_GRADS[i]}
                delay={60 + i * 50}
              />
            ))}
          </View>

          {/* Last 7 Days Chart */}
          <AnimatedSection delay={380} style={[styles.section, { backgroundColor: colors.card }]}>
            <SectionHeader icon={BarChart3} color="#6366f1" title="Last 7 Days" textColor={colors.text} />
            <View style={styles.chartContainer}>
              {dailyVisitors.length > 0 ? (
                dailyVisitors.map((point: any, index: number) => {
                  const g = BAR_GRADS[index % BAR_GRADS.length];
                  return (
                    <View key={index} style={styles.barItem}>
                      <Text style={[styles.barCount, { color: g[1] }]}>{point.count}</Text>
                      <Bar h={Math.max((point.count / maxCount) * 90, 4)} colors={g} delay={450 + index * 80} />
                      <Text style={styles.barLabel}>{String(point._id || '').slice(5)}</Text>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.emptyText}>No data available</Text>
              )}
            </View>
          </AnimatedSection>

          {/* Recent Visitors */}
          <AnimatedSection delay={460} style={[styles.section, { backgroundColor: colors.card }]}>
            <SectionHeader icon={Users} color="#ec4899" title="Recent Visitors" textColor={colors.text} />
            <View style={styles.tableContainer}>
              {visitors.length > 0 ? (
                visitors.slice(0, 20).map((visitor: any, index: number) => {
                  const accent = pick(visitor.visitorName, ACCENTS);
                  const typeColor = TYPE_COLORS[visitor.visitorType] || '#64748b';
                  return (
                    <AnimatedSection key={index} delay={Math.min(index, 10) * 50}>
                      <PressScale
                        style={[
                          styles.recordCard,
                          { backgroundColor: `${accent}0D`, borderColor: `${accent}26`, borderLeftColor: accent },
                        ]}
                      >
                        <View style={styles.recordTop}>
                          <LinearGradient colors={[accent, `${accent}aa`]} style={styles.avatar}>
                            <Text style={styles.avatarText}>{String(visitor.visitorName || '?').charAt(0).toUpperCase()}</Text>
                          </LinearGradient>
                          <View style={{ flex: 1, marginHorizontal: 10 }}>
                            <Text style={[styles.recordName, { color: colors.text }]} numberOfLines={1}>
                              {visitor.visitorName || '-'}
                            </Text>
                            {visitor.visitorType ? (
                              <View style={{ alignSelf: 'flex-start', marginTop: 3 }}>
                                <Pill label={visitor.visitorType} color={typeColor} />
                              </View>
                            ) : null}
                          </View>
                          <StatusPill status={visitor.status} />
                        </View>

                        <View style={styles.recordRow}>
                          <Text style={[styles.recordLabel, { color: colors.mutedForeground }]}>Purpose</Text>
                          <Text style={[styles.recordValue, { color: colors.text }]} numberOfLines={1}>
                            {visitor.purpose || '-'}
                          </Text>
                        </View>
                        <View style={styles.recordRow}>
                          <Text style={[styles.recordLabel, { color: colors.mutedForeground }]}>Meeting with</Text>
                          <Text style={[styles.recordValue, { color: '#7c3aed' }]} numberOfLines={1}>
                            {visitor.meetingWith || '-'}
                          </Text>
                        </View>
                        <View style={styles.recordRow}>
                          <Text style={[styles.recordLabel, { color: colors.mutedForeground }]}>Date</Text>
                          <Text style={[styles.recordValue, { color: colors.mutedForeground }]}>{formatDate(visitor.date)}</Text>
                        </View>
                      </PressScale>
                    </AnimatedSection>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <Users size={40} color="#cbd5e1" />
                  <Text style={styles.emptyText}>No visitors found</Text>
                </View>
              )}
            </View>
          </AnimatedSection>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  header: {
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    padding: 18,
    overflow: 'hidden',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  bubbleBig: {
    position: 'absolute',
    top: -30,
    right: -24,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  bubbleSmall: {
    position: 'absolute',
    bottom: -28,
    right: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  backText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.3, marginBottom: 3 },
  subtitle: { fontSize: 11.5, color: 'rgba(255,255,255,0.9)' },

  errorContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#ef44441A',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: { color: '#dc2626', fontSize: 12, fontWeight: '600' },
  loadingContainer: { paddingVertical: 36, alignItems: 'center' },

  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    borderRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 4,
  },
  statGradient: { borderRadius: 16, padding: 11, minHeight: 96, overflow: 'hidden' },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 19, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  statLabel: { fontSize: 9.5, fontWeight: '600', color: 'rgba(255,255,255,0.92)', marginTop: 1 },

  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.15)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionIconBadge: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: '700' },

  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    minHeight: 130,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148,163,184,0.25)',
  },
  barItem: { alignItems: 'center', justifyContent: 'flex-end', flex: 1 },
  barCount: { fontSize: 10.5, fontWeight: '700', marginBottom: 4 },
  bar: {
    width: '100%',
    maxWidth: 30,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    overflow: 'hidden',
  },
  barLabel: { fontSize: 9.5, color: '#64748b', marginTop: 5, marginBottom: 3 },

  tableContainer: { gap: 10 },
  recordCard: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  recordTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  recordName: { fontSize: 12.5, fontWeight: '700' },
  recordRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2.5 },
  recordLabel: { fontSize: 10.5, fontWeight: '500' },
  recordValue: { fontSize: 11, fontWeight: '600', flex: 1, textAlign: 'right', marginLeft: 12 },

  pill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  pillText: { fontSize: 10, fontWeight: '700' },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  pulseWrap: { width: 10, height: 10, alignItems: 'center', justifyContent: 'center' },
  pulseRing: { position: 'absolute', width: 10, height: 10, borderRadius: 5 },
  pulseCore: { width: 6, height: 6, borderRadius: 3 },

  emptyState: { alignItems: 'center', paddingVertical: 28 },
  emptyText: { fontSize: 12, color: '#94a3b8', marginTop: 8 },
});