import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
  ActivityIndicator, Pressable, Animated, Easing, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { getData } from '@/utils/api';
import {
  Users, BookOpen, Calendar, TrendingUp, DollarSign, UserCheck, Award, Bell,
  AlertCircle, Cake, Bus, FileWarning, Library, UserX, School,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { SCHOOL_ROLES } from '@/constants/branding';

type Grad = [string, string];
const PAD = 16;
const GAP = 10;
const ease = Easing.out(Easing.cubic);

/* ================= Animation helpers ================= */

// Staggered fade + slide-up entrance
function Reveal({ index = 0, children }: { index?: number; children: React.ReactNode }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 500, delay: Math.min(index, 12) * 60, easing: ease, useNativeDriver: true }).start();
  }, [v, index]);
  return (
    <Animated.View style={{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }}>
      {children}
    </Animated.View>
  );
}

// Spring press feedback
function Tap({ style, contentStyle, onPress, children }: {
  style?: any; contentStyle?: any; onPress?: () => void; children: React.ReactNode;
}) {
  const s = useRef(new Animated.Value(1)).current;
  const to = (val: number) => Animated.spring(s, { toValue: val, friction: 6, tension: 230, useNativeDriver: true }).start();
  return (
    <Animated.View style={[style, { transform: [{ scale: s }] }]}>
      <Pressable onPress={onPress} onPressIn={() => to(0.96)} onPressOut={() => to(1)} style={contentStyle}>
        {children}
      </Pressable>
    </Animated.View>
  );
}

// Count-up number
function useCountUp(target: number, duration = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf: number;
    const t0 = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - t0) / duration, 1);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

function Num({ value, prefix = '', suffix = '', format, style }: {
  value: number | string; prefix?: string; suffix?: string; format?: (n: number) => string; style?: any;
}) {
  const n = Number(value) || 0;
  const v = useCountUp(n);
  const dec = Number.isInteger(n) ? 0 : 1;
  return <Text style={style}>{prefix}{format ? format(v) : v.toFixed(dec)}{suffix}</Text>;
}

// Animated gradient progress bar
function Bar({ pct, colors, track, height = 8, delay = 300 }: {
  pct: number; colors: Grad; track: string; height?: number; delay?: number;
}) {
  const w = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(w, { toValue: Math.max(0, Math.min(pct || 0, 100)), duration: 900, delay, easing: ease, useNativeDriver: false }).start();
  }, [pct, w, delay]);
  return (
    <View style={{ height, borderRadius: height, backgroundColor: track, overflow: 'hidden' }}>
      <Animated.View style={{ height: '100%', width: w.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }}>
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1, borderRadius: height }} />
      </Animated.View>
    </View>
  );
}

function PulseDot() {
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.timing(p, { toValue: 1, duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver: true }));
    a.start();
    return () => a.stop();
  }, [p]);
  return (
    <View style={styles.badgeWrap}>
      <Animated.View style={[styles.badgeRing, {
        opacity: p.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
        transform: [{ scale: p.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] }) }],
      }]} />
      <View style={styles.badgeDot} />
    </View>
  );
}

/* ================= Shared UI pieces ================= */

function Section({ title, color }: { title: string; color: string }) {
  return (
    <View style={styles.sectionRow}>
      <View style={[styles.sectionBar, { backgroundColor: color }]} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function StatTile({ icon: Icon, label, value, prefix, suffix, format, grad, width, onPress }: {
  icon: LucideIcon; label: string; value: number | string; prefix?: string; suffix?: string;
  format?: (n: number) => string; grad: Grad; width: number; onPress?: () => void;
}) {
  return (
    <Tap style={[styles.statShadow, { width, backgroundColor: grad[0], shadowColor: grad[0] }]} contentStyle={styles.statPress} onPress={onPress}>
      <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statInner}>
        <View style={styles.statCircle} />
        <View style={styles.statIcon}><Icon color="#fff" size={16} /></View>
        <Num value={value} prefix={prefix} suffix={suffix} format={format} style={styles.statValue} />
        <Text style={styles.statLabel}>{label}</Text>
      </LinearGradient>
    </Tap>
  );
}

function SummaryCard({ icon: Icon, label, value, color, width, format }: {
  icon: LucideIcon; label: string; value: number; color: string; width: number; format?: (n: number) => string;
}) {
  return (
    <View style={[styles.summaryCard, { width, backgroundColor: `${color}14`, borderColor: `${color}26` }]}>
      <View style={[styles.summaryIcon, { shadowColor: color }]}><Icon color={color} size={16} /></View>
      <Num value={value} format={format} style={[styles.summaryValue, { color: '#1e293b' }]} />
      <Text style={styles.summaryLabel} numberOfLines={2}>{label}</Text>
    </View>
  );
}

function MetricCard({ icon: Icon, label, value, suffix, subtitle, color }: {
  icon: LucideIcon; label: string; value: number; suffix?: string; subtitle?: string; color: string;
}) {
  return (
    <View style={styles.metricCard}>
      <LinearGradient colors={[color, `${color}aa`]} style={[styles.metricIcon, { shadowColor: color }]}>
        <Icon color="#fff" size={18} />
      </LinearGradient>
      <View style={{ flex: 1 }}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Num value={value} suffix={suffix} style={styles.metricValue} />
        {!!subtitle && <Text style={[styles.metricSub, { color }]}>{subtitle}</Text>}
      </View>
    </View>
  );
}

function PendingItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.pendingItem, { backgroundColor: `${color}14`, borderColor: `${color}26` }]}>
      <Num value={value} style={[styles.pendingValue, { color }]} />
      <Text style={styles.pendingLabel}>{label}</Text>
    </View>
  );
}

function QuickActionButton({ icon: Icon, label, color, width }: { icon: LucideIcon; label: string; color: string; width: number }) {
  return (
    <Tap style={[styles.qaShadow, { width }]} contentStyle={styles.qaPress}>
      <View style={[styles.qaIcon, { backgroundColor: `${color}1f` }]}><Icon color={color} size={20} /></View>
      <Text style={styles.qaLabel} numberOfLines={1}>{label}</Text>
    </Tap>
  );
}

/* ================= Top bar (replaces the old gradient header) ================= */

function TopBar({ insets }: { insets: { top: number } }) {
  const { userData } = useAuth();
  const name = userData?.owner_name || userData?.school_name || userData?.name || 'Admin';

  return (
    <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.topGreeting}>{userData?.school_name}</Text>
        <Text style={styles.topName} numberOfLines={1}>{name}</Text>
      </View>
      {!!userData?.role && (
        <View style={styles.topRoleChip}><Text style={styles.topRoleText}>{userData.role}</Text></View>
      )}
      <TouchableOpacity style={styles.bellButton} activeOpacity={0.7}>
        <Bell color="#475569" size={18} />
        <PulseDot />
      </TouchableOpacity>
    </View>
  );
}

/* ================= Screen ================= */

export default function DashboardScreen() {
  const { userData } = useAuth();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const renderRoleDashboard = () => {
    switch (userData?.role) {
      case SCHOOL_ROLES.SCHOOL: return <SchoolAdminDashboard onRefresh={onRefresh} refreshing={refreshing} />;
      case SCHOOL_ROLES.STUDENT: return <StudentDashboard />;
      case SCHOOL_ROLES.TEACHER: return <TeacherDashboard />;
      case SCHOOL_ROLES.PARENT: return <ParentDashboard />;
      default: return <DefaultDashboard />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <TopBar insets={insets} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" colors={['#6366f1']} />}
        showsVerticalScrollIndicator={false}
      >
        {renderRoleDashboard()}
      </ScrollView>
    </View>
  );
}

/* ================= School Admin ================= */

function SchoolAdminDashboard({ onRefresh, refreshing }: { onRefresh: () => void; refreshing: boolean }) {
  const router = useRouter();
  const { width: W } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const w2 = (W - PAD * 2 - GAP) / 2;
  const w4 = (W - PAD * 2 - GAP * 3) / 4;

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getData('/dashboard/stats');
      if (response.success) setDashboardData(response.data);
      else setError('Failed to load dashboard data');
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);
  useEffect(() => { if (refreshing) fetchDashboardData(); }, [refreshing]);

  if (loading && !dashboardData) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.centerText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error && !dashboardData) {
    return (
      <View style={styles.centerBox}>
        <View style={styles.errorCircle}><AlertCircle color="#ef4444" size={32} /></View>
        <Text style={[styles.centerText, { color: '#ef4444' }]}>{error}</Text>
        <TouchableOpacity activeOpacity={0.8} onPress={fetchDashboardData}>
          <LinearGradient colors={['#6366f1', '#ec4899']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  const data = dashboardData || {};
  const total = Number(data.totalStudents) || 0;
  const share = (n?: number) => (total ? Math.min(((n || 0) / total) * 100, 100) : 0);

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${Math.round(amount || 0)}`;
  };

  const mainStats = [
    { icon: Users, label: 'Total Students', value: data.totalStudents || 0, grad: ['#ff6b6b', '#ff9a56'] as Grad, route: '/students' },
    { icon: UserCheck, label: "Today's Attendance", value: data.todayAttendancePercentage || 0, suffix: '%', grad: ['#10b981', '#34d399'] as Grad, route: '/attendance' },
    { icon: DollarSign, label: "Today's Collection", value: data.todayCollection || 0, format: formatCurrency, grad: ['#f59e0b', '#fcd34d'] as Grad, route: '/fees' },
    { icon: UserX, label: 'Absent Today', value: data.absentToday || 0, grad: ['#f43f5e', '#fb7185'] as Grad, route: '/attendance' },
  ];

  const staffPresent = data.staffPresent || 0;
  const staffAbsent = data.staffAbsent || 0;
  const staffLeave = data.staffLeave || 0;

  return (
    <View>
      {/* Date */}
      <Reveal index={0}>
        <LinearGradient colors={['#eef2ff', '#fdf2f8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.dateCard}>
          <View style={styles.dateIcon}><Calendar color="#6366f1" size={15} /></View>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
        </LinearGradient>
      </Reveal>

      {/* Overview */}
      <Reveal index={1}><Section title="Overview" color="#ff6b6b" /></Reveal>
      <View style={styles.wrapRow}>
        {mainStats.map((s, i) => (
          <Reveal key={s.label} index={i + 2}>
            <StatTile {...s} width={w2} onPress={() => router.push(s.route as any)} />
          </Reveal>
        ))}
      </View>

      {/* Today's Summary */}
      <Reveal index={6}><Section title="Today's Summary" color="#10b981" /></Reveal>
      <Reveal index={7}>
        <View style={styles.row}>
          <SummaryCard icon={DollarSign} label="Fee Collected" value={data.todayCollection || 0} format={formatCurrency} color="#10b981" width={w4} />
          <SummaryCard icon={Users} label="New Admissions" value={data.newAdmissions || 0} color="#3b82f6" width={w4} />
          <SummaryCard icon={AlertCircle} label="Complaints" value={data.complaints || 0} color="#f59e0b" width={w4} />
          <SummaryCard icon={Cake} label="Birthdays" value={data.birthdays || 0} color="#ec4899" width={w4} />
        </View>
      </Reveal>

      {/* Quick Metrics */}
      <Reveal index={8}><Section title="Quick Metrics" color="#8b5cf6" /></Reveal>
      <Reveal index={9}>
        <View style={styles.row}>
          <MetricCard icon={Users} label="Total Staff" value={data.totalStaff || 0} subtitle={`${data.totalTeachers || 0} Teachers`} color="#10b981" />
          <MetricCard icon={Library} label="Library Books" value={data.libraryBooks || 0} subtitle={`${data.issuedBooks || 0} Issued`} color="#f59e0b" />
        </View>
      </Reveal>
      <Reveal index={10}>
        <View style={[styles.row, { marginTop: GAP }]}>
          <MetricCard icon={Bus} label="Transport" value={data.vehicles?.routes || 0} suffix=" Routes" subtitle={`${data.vehicles?.students || 0} Students`} color="#06b6d4" />
          <MetricCard icon={FileWarning} label="Fee Due" value={data.feeDueStudents || 0} subtitle="Students" color="#ef4444" />
        </View>
      </Reveal>

      {/* Gender */}
      <Reveal index={11}><Section title="Gender Distribution" color="#3b82f6" /></Reveal>
      <Reveal index={12}>
        <View style={styles.card}>
          {[
            { label: 'Boys', count: data.genderRatio?.boys || 0, color: '#3b82f6', light: '#dbeafe' },
            { label: 'Girls', count: data.genderRatio?.girls || 0, color: '#ec4899', light: '#fce7f3' },
          ].map((g, i) => (
            <View key={g.label} style={{ marginTop: i ? 12 : 0 }}>
              <View style={styles.spaceRow}>
                <View style={styles.inline}>
                  <View style={[styles.dot, { backgroundColor: g.color }]} />
                  <Text style={styles.rowLabel}>{g.label}</Text>
                </View>
                <View style={styles.inline}>
                  <Num value={g.count} style={styles.rowValue} />
                  <Text style={[styles.pctText, { color: g.color }]}>{share(g.count).toFixed(0)}%</Text>
                </View>
              </View>
              <Bar pct={share(g.count)} colors={[g.color, `${g.color}99`]} track={g.light} />
            </View>
          ))}
        </View>
      </Reveal>

      {/* Fee Collection */}
      <Reveal index={13}><Section title="Fee Collection" color="#f59e0b" /></Reveal>
      <Reveal index={14}>
        <View style={styles.card}>
          <View style={styles.spaceRow}>
            <Text style={styles.rowLabel}>Collected</Text>
            <Text style={[styles.rowValue, { color: '#10b981' }]}>{(Number(data.feeCollected) || 0).toFixed(1)}%</Text>
          </View>
          <Bar pct={Number(data.feeCollected) || 0} colors={['#10b981', '#34d399']} track="#fee2e2" height={10} />
          <View style={[styles.spaceRow, { marginTop: 10, marginBottom: 0 }]}>
            <Text style={styles.rowLabel}>Pending</Text>
            <Text style={[styles.rowValue, { color: '#ef4444' }]}>{(Number(data.feePending) || 0).toFixed(1)}%</Text>
          </View>
        </View>
      </Reveal>

      {/* Pending */}
      <Reveal index={15}><Section title="Pending Items" color="#ef4444" /></Reveal>
      <Reveal index={16}>
        <View style={styles.row}>
          <PendingItem label="Fee Dues" value={data.pendingItems?.feeDues || 0} color="#8b5cf6" />
          <PendingItem label="Complaints" value={data.pendingItems?.complaints || 0} color="#f59e0b" />
          <PendingItem label="Overdue Docs" value={data.pendingItems?.overdueDocs || 0} color="#ef4444" />
        </View>
      </Reveal>

      {/* Staff Today */}
      <Reveal index={17}><Section title="Staff Today" color="#14b8a6" /></Reveal>
      <Reveal index={18}>
        <View style={styles.card}>
          <View style={styles.stack}>
            {[[staffPresent, '#10b981'], [staffAbsent, '#ef4444'], [staffLeave, '#f59e0b']].map(([n, c], i) => (
              <View key={i} style={{ flex: Math.max(Number(n), 0.0001), backgroundColor: c as string }} />
            ))}
          </View>
          <View style={styles.staffRow}>
            {[['Present', staffPresent, '#10b981'], ['Absent', staffAbsent, '#ef4444'], ['Leave', staffLeave, '#f59e0b']].map(([l, v, c]) => (
              <View key={l as string} style={styles.staffItem}>
                <View style={styles.inline}>
                  <View style={[styles.dot, { backgroundColor: c as string }]} />
                  <Text style={styles.staffLabel}>{l}</Text>
                </View>
                <Num value={v as number} style={[styles.staffValue, { color: c as string }]} />
              </View>
            ))}
          </View>
        </View>
      </Reveal>
    </View>
  );
}

/* ================= Student ================= */

function StudentDashboard() {
  const { width: W } = useWindowDimensions();
  const w2 = (W - PAD * 2 - GAP) / 2;
  const w4 = (W - PAD * 2 - GAP * 3) / 4;
  const stats = [
    { icon: BookOpen, label: 'Subjects', value: 8, grad: ['#3b82f6', '#60a5fa'] as Grad },
    { icon: Calendar, label: 'Attendance', value: 92, suffix: '%', grad: ['#10b981', '#34d399'] as Grad },
    { icon: Award, label: 'Marks', value: 88, suffix: '%', grad: ['#8b5cf6', '#a78bfa'] as Grad },
    { icon: TrendingUp, label: 'Rank', value: 12, prefix: '#', grad: ['#f59e0b', '#fcd34d'] as Grad },
  ];
  return (
    <View>
      <Reveal index={0}><Section title="Your Performance" color="#3b82f6" /></Reveal>
      <View style={styles.wrapRow}>
        {stats.map((s, i) => <Reveal key={s.label} index={i + 1}><StatTile {...s} width={w2} /></Reveal>)}
      </View>
      <Reveal index={5}><Section title="Quick Access" color="#ec4899" /></Reveal>
      <Reveal index={6}>
        <View style={styles.row}>
          <QuickActionButton icon={Calendar} label="Timetable" color="#3b82f6" width={w4} />
          <QuickActionButton icon={BookOpen} label="Homework" color="#10b981" width={w4} />
          <QuickActionButton icon={Award} label="Results" color="#8b5cf6" width={w4} />
          <QuickActionButton icon={Bell} label="Notices" color="#f59e0b" width={w4} />
        </View>
      </Reveal>
    </View>
  );
}

/* ================= Teacher ================= */

function TeacherDashboard() {
  const { width: W } = useWindowDimensions();
  const w4 = (W - PAD * 2 - GAP * 3) / 4;
  const schedule = [
    { cls: 'Class 10-A', subject: 'Mathematics', time: '9:00 AM', color: '#6366f1' },
    { cls: 'Class 9-B', subject: 'Physics', time: '11:00 AM', color: '#ec4899' },
    { cls: 'Class 10-C', subject: 'Mathematics', time: '2:00 PM', color: '#10b981' },
  ];
  return (
    <View>
      <Reveal index={0}><Section title="Today's Schedule" color="#6366f1" /></Reveal>
      {schedule.map((s, i) => (
        <Reveal key={s.cls} index={i + 1}>
          <View style={[styles.card, styles.scheduleRow]}>
            <View style={[styles.timeChip, { backgroundColor: `${s.color}1f` }]}>
              <Text style={[styles.timeText, { color: s.color }]}>{s.time}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{s.cls}</Text>
              <Text style={styles.metricLabel}>{s.subject}</Text>
            </View>
            <View style={[styles.sideBar, { backgroundColor: s.color }]} />
          </View>
        </Reveal>
      ))}
      <Reveal index={5}><Section title="Quick Actions" color="#f59e0b" /></Reveal>
      <Reveal index={6}>
        <View style={styles.row}>
          <QuickActionButton icon={UserCheck} label="Attendance" color="#3b82f6" width={w4} />
          <QuickActionButton icon={BookOpen} label="Homework" color="#10b981" width={w4} />
          <QuickActionButton icon={Award} label="Marks" color="#8b5cf6" width={w4} />
          <QuickActionButton icon={Calendar} label="Schedule" color="#f59e0b" width={w4} />
        </View>
      </Reveal>
    </View>
  );
}

/* ================= Parent ================= */

function ParentDashboard() {
  const { width: W } = useWindowDimensions();
  const w4 = (W - PAD * 2 - GAP * 3) / 4;
  return (
    <View>
      <Reveal index={0}><Section title="Your Children" color="#8b5cf6" /></Reveal>
      <Reveal index={1}>
        <LinearGradient colors={['#8b5cf6', '#ec4899']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.childCard}>
          <View style={styles.childAvatar}><Text style={styles.childInitial}>R</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.childName}>Rahul Kumar</Text>
            <Text style={styles.childMeta}>Class 10-A</Text>
          </View>
          <View style={styles.childPills}>
            <View style={styles.childPill}><Text style={styles.childPillText}>Attendance 95%</Text></View>
            <View style={styles.childPill}><Text style={styles.childPillText}>Marks 88%</Text></View>
          </View>
        </LinearGradient>
      </Reveal>
      <Reveal index={2}><Section title="Quick Access" color="#ec4899" /></Reveal>
      <Reveal index={3}>
        <View style={styles.row}>
          <QuickActionButton icon={TrendingUp} label="Performance" color="#3b82f6" width={w4} />
          <QuickActionButton icon={Calendar} label="Attendance" color="#10b981" width={w4} />
          <QuickActionButton icon={DollarSign} label="Fees" color="#8b5cf6" width={w4} />
          <QuickActionButton icon={Bell} label="Notices" color="#f59e0b" width={w4} />
        </View>
      </Reveal>
    </View>
  );
}

/* ================= Default ================= */

function DefaultDashboard() {
  return (
    <Reveal>
      <View style={styles.centerBox}>
        <LinearGradient colors={['#6366f1', '#ec4899']} style={styles.defaultIcon}><School color="#fff" size={28} /></LinearGradient>
        <Text style={styles.defaultTitle}>Dashboard</Text>
        <Text style={styles.centerText}>Welcome to OurSchool Management System</Text>
      </View>
    </Reveal>
  );
}

/* ================= Styles ================= */

const softShadow = {
  shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 2,
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6ff' },
  scrollContent: { padding: PAD, paddingBottom: 100 },

  // Top bar (replaces old gradient header — flat, light, integrated with the page)
  topBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: PAD, paddingBottom: 14,
    backgroundColor: '#f5f6ff',
  },
  topGreeting: { fontSize: 11.5, color: '#64748b', fontWeight: '700' },
  topName: { fontSize: 19, fontWeight: '800', color: '#1e293b', marginTop: 2 },
  topRoleChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: '#e0e7ff' },
  topRoleText: { fontSize: 10, fontWeight: '700', color: '#4f46e5' },
  bellButton: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', ...softShadow,
  },
  badgeWrap: { position: 'absolute', top: 7, right: 8, width: 8, height: 8, alignItems: 'center', justifyContent: 'center' },
  badgeRing: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: '#f43f5e' },
  badgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#f43f5e', borderWidth: 1, borderColor: '#fff' },

  // Layout helpers
  row: { flexDirection: 'row', gap: GAP },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  spaceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },

  // Section titles
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 22, marginBottom: 10 },
  sectionBar: { width: 4, height: 14, borderRadius: 2 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#1e293b' },

  // Date
  dateCard: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 14, borderWidth: 1, borderColor: '#e0e7ff' },
  dateIcon: { width: 28, height: 28, borderRadius: 9, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  dateText: { fontSize: 11.5, color: '#334155', fontWeight: '600' },

  // Stat tiles
  statShadow: { borderRadius: 16, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 10, elevation: 4 },
  statPress: { borderRadius: 16, overflow: 'hidden' },
  statInner: { padding: 12 },
  statCircle: { position: 'absolute', right: -22, top: -22, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.18)' },
  statIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 10.5, color: 'rgba(255,255,255,0.92)', marginTop: 2, fontWeight: '500' },

  // Summary
  summaryCard: { borderRadius: 14, paddingVertical: 10, paddingHorizontal: 4, alignItems: 'center', borderWidth: 1 },
  summaryIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 6, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3 },
  summaryValue: { fontSize: 14, fontWeight: '800' },
  summaryLabel: { fontSize: 9, color: '#64748b', fontWeight: '500', textAlign: 'center', marginTop: 2, minHeight: 22 },

  // Metric
  metricCard: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 14, padding: 10, ...softShadow },
  metricIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 3 },
  metricLabel: { fontSize: 10, color: '#64748b', fontWeight: '500' },
  metricValue: { fontSize: 15, fontWeight: '800', color: '#1e293b', marginVertical: 1 },
  metricSub: { fontSize: 9.5, fontWeight: '600' },

  // Cards / rows
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, ...softShadow },
  rowLabel: { fontSize: 12, fontWeight: '600', color: '#1e293b' },
  rowValue: { fontSize: 13, fontWeight: '800', color: '#1e293b' },
  pctText: { fontSize: 11, fontWeight: '800', marginLeft: 6 },

  // Pending
  pendingItem: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1 },
  pendingValue: { fontSize: 22, fontWeight: '800' },
  pendingLabel: { fontSize: 10, color: '#64748b', fontWeight: '500', marginTop: 2 },

  // Staff
  stack: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 14, gap: 2 },
  staffRow: { flexDirection: 'row', justifyContent: 'space-around' },
  staffItem: { alignItems: 'center', gap: 4 },
  staffLabel: { fontSize: 10.5, color: '#64748b', fontWeight: '500' },
  staffValue: { fontSize: 17, fontWeight: '800' },

  // Quick actions
  qaShadow: { backgroundColor: '#fff', borderRadius: 14, ...softShadow },
  qaPress: { paddingVertical: 12, paddingHorizontal: 4, alignItems: 'center' },
  qaIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  qaLabel: { fontSize: 10, fontWeight: '600', color: '#334155' },

  // Teacher
  scheduleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: GAP, overflow: 'hidden', paddingVertical: 12 },
  timeChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  timeText: { fontSize: 10.5, fontWeight: '800' },
  sideBar: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 4 },

  // Parent
  childCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
  childAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.28)', alignItems: 'center', justifyContent: 'center' },
  childInitial: { fontSize: 17, fontWeight: '800', color: '#fff' },
  childName: { fontSize: 14, fontWeight: '800', color: '#fff' },
  childMeta: { fontSize: 10.5, color: 'rgba(255,255,255,0.88)', marginTop: 2 },
  childPills: { gap: 5, alignItems: 'flex-end' },
  childPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.22)' },
  childPillText: { fontSize: 9.5, fontWeight: '700', color: '#fff' },

  // Loading / error / default
  centerBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  centerText: { marginTop: 12, fontSize: 12, color: '#64748b', fontWeight: '500', textAlign: 'center' },
  errorCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' },
  retryButton: { marginTop: 16, paddingHorizontal: 26, paddingVertical: 10, borderRadius: 12 },
  retryText: { color: '#fff', fontSize: 12.5, fontWeight: '700' },
  defaultIcon: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  defaultTitle: { fontSize: 15, fontWeight: '800', color: '#1e293b', marginTop: 14 },
});