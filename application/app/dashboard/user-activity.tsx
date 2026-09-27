import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  RefreshCw,
  TriangleAlert,
  Users,
} from 'lucide-react-native';
import type { AppDispatch, RootState } from '@/state/store';
import { fetchSchoolDashboard } from '@/state/schoolDashboardsSlice';

// If this screen lives inside an expo-router / react-navigation bottom
// Tab Navigator, uncomment these two lines and use `tabBarHeight` in the
// ScrollView's contentContainerStyle paddingBottom (see FIX NOTE at bottom).
// import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const cards = [
  ['totalUsers', 'TOTAL USERS', Users, ['#6366f1', '#818cf8']],
  ['active', 'ACTIVE', CheckCircle2, ['#10b981', '#34d399']],
  ['inactive', 'INACTIVE', TriangleAlert, ['#ef4444', '#f87171']],
  ['activeToday', 'ACTIVE TODAY', BarChart3, ['#3b82f6', '#60a5fa']],
  ['neverLoggedIn', 'NEVER LOGGED IN', TriangleAlert, ['#f97316', '#fb923c']],
] as const;

const date = (value: string) => (value ? new Date(value).toLocaleDateString() : '-');

// ---------- Small animated wrapper for staggered fade/slide-in ----------
const FadeInView: React.FC<{ delay?: number; style?: any; children: React.ReactNode }> = ({
  delay = 0,
  style,
  children,
}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 360,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default function UserActivityDashboard() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  // const tabBarHeight = useBottomTabBarHeight(); // uncomment if inside a Tab Navigator
  const screen = useSelector((state: RootState) => state.schoolDashboards['user-activity']);
  const data = screen.data || {};

  const [tab, setTab] = useState<'users' | 'roles'>('users');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [days, setDays] = useState(7);
  const [picker, setPicker] = useState<'role' | 'status' | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;
  const [tabsWidth, setTabsWidth] = useState(0);

  const load = useCallback(
    () => dispatch(fetchSchoolDashboard({ type: 'user-activity', days, page, limit, search, role, status })),
    [dispatch, days, page, search, role, status]
  );

  useEffect(() => {
    load();
  }, [load]);

  const switchTab = (next: 'users' | 'roles') => {
    setTab(next);
    Animated.timing(tabIndicatorAnim, {
      toValue: next === 'users' ? 0 : 1,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const roles = useMemo(
    () => data.roleOptions || [],
    [data.roleOptions]
  );

  const users = useMemo(
    () =>
      data.users || [],
    [data.users]
  );

  const max = Math.max(...(data.dailyActivity || []).map((item: any) => item.count), 1);
  const pagination = data.pagination || { page: 1, totalPages: 1, totalRecords: 0 };
  const pickerOptions = picker === 'role' ? ['all', ...roles] : ['all', ...(data.statusOptions || [])];
  const pickerTitle = picker === 'role' ? 'Select role' : 'Select status';

  const applyPicker = (value: string) => {
    if (picker === 'role') setRole(value);
    if (picker === 'status') setStatus(value);
    setPage(1);
    setPicker(null);
  };

  if (screen.loading && !screen.data) {
    return <ActivityIndicator style={styles.loader} size="large" color="#6366f1" />;
  }

  return (
    <ScrollView
      style={styles.page}
      // FIX: bottom padding so content isn't hidden behind a bottom tab bar.
      // Swap 100 for `tabBarHeight + 24` if you enable the hook above.
      contentContainerStyle={[styles.content, { paddingBottom: 100 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={screen.loading}
          onRefresh={load}
          colors={['#6366f1']}
          tintColor="#6366f1"
        />
      }
    >
      <LinearGradient
        colors={['#6366f1', '#ec4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.back} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={14} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>User Activity Dashboard</Text>
            <Text style={styles.subtitle}>Monitor user engagement and ERP utilization</Text>
          </View>
          <TouchableOpacity
            style={styles.range}
            activeOpacity={0.8}
            onPress={() => setDays(days === 7 ? 30 : days === 30 ? 90 : 7)}
          >
            <Text style={styles.rangeText}>Last {data.days || days} days</Text>
            <RefreshCw size={13} color="#6366f1" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {screen.error ? <Text style={styles.error}>{screen.error}</Text> : null}

      <View style={styles.cards}>
        {cards.map(([key, label, Icon, colors], i) => (
          <FadeInView key={key} delay={i * 70} style={styles.cardWrapper}>
            <View style={styles.card}>
              <LinearGradient
                colors={colors as unknown as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cardAccent}
              />
              <View style={styles.cardBody}>
                <View>
                  <Text style={styles.cardLabel}>{label}</Text>
                  <Text style={[styles.cardValue, { color: colors[0] }]}>{data[key] ?? '-'}</Text>
                </View>
                <View style={[styles.cardIconWrap, { backgroundColor: `${colors[0]}18` }]}>
                  <Icon size={16} color={colors[0]} />
                </View>
              </View>
            </View>
          </FadeInView>
        ))}
      </View>

      <FadeInView delay={cards.length * 70} style={styles.section}>
        <View style={styles.sectionRow}>
          <View style={styles.sectionTitleRow}>
            <BarChart3 size={14} color="#6366f1" />
            <Text style={styles.sectionTitle}>Daily Active Users</Text>
          </View>
          <Text style={styles.muted}>Last {data.days || 7} days</Text>
        </View>
        <View style={styles.chart}>
          {(data.dailyActivity || []).map((item: any, i: number) => (
            <View key={item._id} style={styles.barItem}>
              <Text style={styles.barCount}>{item.count}</Text>
              <View style={styles.barTrack}>
                <LinearGradient
                  colors={i % 2 === 0 ? ['#6366f1', '#818cf8'] : ['#ec4899', '#f472b6']}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0 }}
                  style={[styles.bar, { height: Math.max((item.count / max) * 100, 4) }]}
                />
              </View>
              <Text style={styles.axis}>{item._id.slice(5)}</Text>
            </View>
          ))}
        </View>
      </FadeInView>

      <FadeInView delay={cards.length * 70 + 80} style={styles.section}>
        <View style={styles.tabs} onLayout={(e) => setTabsWidth(e.nativeEvent.layout.width)}>
          {tabsWidth > 0 && (
            <Animated.View
              style={[
                styles.tabIndicator,
                {
                  width: tabsWidth / 2,
                  transform: [
                    {
                      translateX: tabIndicatorAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, tabsWidth / 2],
                      }),
                    },
                  ],
                },
              ]}
            />
          )}
          <TouchableOpacity style={styles.tabBtn} activeOpacity={0.8} onPress={() => switchTab('users')}>
            <Text style={[styles.tab, tab === 'users' && styles.activeTab]}>Users</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabBtn} activeOpacity={0.8} onPress={() => switchTab('roles')}>
            <Text style={[styles.tab, tab === 'roles' && styles.activeTab]}>
              Role-wise Utilization
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filters}>
          <TouchableOpacity
            style={styles.select}
            activeOpacity={0.8}
            onPress={() => setPicker('role')}
          >
            <Text style={styles.filterText}>{role === 'all' ? 'All roles' : role}</Text><Text style={styles.chevron}>⌄</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.select}
            activeOpacity={0.8}
            onPress={() => setPicker('status')}
          >
            <Text style={styles.filterText}>{status === 'all' ? 'All statuses' : status}</Text><Text style={styles.chevron}>⌄</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.search}
            placeholder="Search name / username"
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={(text: string) => { setSearch(text); setPage(1); }}
          />
        </View>

        {tab === 'users'
          ? users.map((item: any, index: number) => (
              <FadeInView key={item._id || index} delay={Math.min(index * 25, 300)} style={styles.row}>
                <Text style={[styles.cell, styles.cellStrong]}>{item.user || '-'}</Text>
                <View style={styles.roleChip}>
                  <Text style={styles.roleChipText}>{item.role || '-'}</Text>
                </View>
                <Text style={styles.cell}>{date(item.createdAt)}</Text>
                <View
                  style={[
                    styles.statusChip,
                    {
                      backgroundColor:
                        item.status === 'Active' ? '#10b98118' : item.status === 'Never' ? '#f59e0b18' : '#ef444418',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: item.status === 'Active' ? '#10b981' : item.status === 'Never' ? '#f59e0b' : '#ef4444' },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusChipText,
                      { color: item.status === 'Active' ? '#10b981' : item.status === 'Never' ? '#d97706' : '#dc2626' },
                    ]}
                  >
                    {item.status || '-'}
                  </Text>
                </View>
              </FadeInView>
            ))
          : (data.roleWiseUtilization || []).map((item: any, i: number) => (
              <FadeInView key={item.role} delay={i * 40} style={styles.row}>
                <Text style={[styles.cell, styles.cellStrong]}>{item.role}</Text>
                <Text style={styles.cell}>Total {item.total || 0}</Text>
                <Text style={styles.cell}>Active {item.active || 0}</Text>
                <View style={styles.percentChip}>
                  <Text style={styles.percentChipText}>
                    {item.total ? `${Math.round((item.active / item.total) * 100)}%` : '0%'}
                  </Text>
                </View>
              </FadeInView>
            ))}

        {tab === 'users' && <View style={styles.pagination}><Text style={styles.paginationText}>{pagination.totalRecords} users</Text><TouchableOpacity disabled={pagination.page <= 1 || screen.loading} onPress={() => setPage((value) => Math.max(value - 1, 1))}><Text style={[styles.pageButton, (pagination.page <= 1 || screen.loading) && styles.disabledButton]}>Previous</Text></TouchableOpacity><Text style={styles.paginationText}>{pagination.page} / {pagination.totalPages}</Text><TouchableOpacity disabled={pagination.page >= pagination.totalPages || screen.loading} onPress={() => setPage((value) => value + 1)}><Text style={[styles.pageButton, (pagination.page >= pagination.totalPages || screen.loading) && styles.disabledButton]}>Next</Text></TouchableOpacity></View>}

        {((tab === 'users' && !users.length) ||
          (tab === 'roles' && !(data.roleWiseUtilization || []).length)) && (
          <Text style={styles.empty}>No Data</Text>
        )}
      </FadeInView>
      <Modal visible={Boolean(picker)} transparent animationType="slide" onRequestClose={() => setPicker(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>{pickerTitle}</Text><TouchableOpacity onPress={() => setPicker(null)}><Text style={styles.modalClose}>Close</Text></TouchableOpacity></View>
            {pickerOptions.map((option) => <TouchableOpacity key={option} style={styles.optionRow} onPress={() => applyPicker(option)}><Text style={styles.optionText}>{option === 'all' ? (picker === 'role' ? 'All roles' : 'All statuses') : option}</Text>{(picker === 'role' ? role : status) === option && <Text style={styles.optionCheck}>✓</Text>}</TouchableOpacity>)}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f4f6fb' },
  content: { paddingBottom: 40 },
  loader: { flex: 1, padding: 50 },
  header: {
    padding: 18,
    paddingTop: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  back: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  backText: { color: '#fff', fontSize: 10.5, fontWeight: '600' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  title: { color: '#fff', fontSize: 17, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 10, marginTop: 4 },
  range: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rangeText: { color: '#6366f1', fontSize: 10, fontWeight: '600' },
  error: { color: '#dc2626', padding: 14, fontSize: 12 },
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, padding: 16 },
  cardWrapper: { width: '31.5%' },
  card: {
    minHeight: 96,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardAccent: { height: 3, width: '100%' },
  cardBody: {
    flex: 1,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardLabel: { color: '#94a3b8', fontSize: 7.5, fontWeight: '700', letterSpacing: 0.3 },
  cardValue: { fontSize: 19, fontWeight: '800', marginTop: 8 },
  cardIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { color: '#1f2937', fontWeight: '700', fontSize: 12.5 },
  muted: { color: '#94a3b8', fontSize: 9 },
  chart: {
    height: 135,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginTop: 12,
  },
  barItem: { alignItems: 'center', justifyContent: 'flex-end', height: 120 },
  barCount: { color: '#64748b', fontSize: 9, fontWeight: '600', marginBottom: 3 },
  barTrack: { justifyContent: 'flex-end', height: 100 },
  bar: { width: 22, borderRadius: 6 },
  axis: { color: '#94a3b8', fontSize: 8, marginTop: 4 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#f4f6fb',
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  tabIndicator: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    left: 3,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, zIndex: 1 },
  tab: { color: '#64748b', fontSize: 11, fontWeight: '600' },
  activeTab: { color: '#6366f1' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 8 },
  select: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterText: { color: '#64748b', fontSize: 10, fontWeight: '500' },
  chevron: { color: '#94a3b8', fontSize: 14, lineHeight: 10 },
  search: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    minWidth: 140,
    fontSize: 10,
    backgroundColor: '#f8fafc',
    color: '#1f2937',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingVertical: 10,
    gap: 6,
  },
  cell: { flex: 1, color: '#64748b', fontSize: 10 },
  cellStrong: { color: '#1f2937', fontWeight: '600' },
  roleChip: {
    backgroundColor: '#6366f118',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  roleChipText: { color: '#6366f1', fontSize: 9.5, fontWeight: '600' },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusChipText: { fontSize: 9.5, fontWeight: '600' },
  percentChip: {
    backgroundColor: '#10b98118',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  percentChipText: { color: '#10b981', fontSize: 10, fontWeight: '700' },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#eef2f7', paddingTop: 10, marginTop: 8 },
  paginationText: { color: '#64748b', fontSize: 10 },
  pageButton: { color: '#4f46e5', fontSize: 10, fontWeight: '700' },
  disabledButton: { color: '#cbd5e1' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,42,.35)' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16, paddingBottom: 28 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { color: '#1f2937', fontSize: 15, fontWeight: '800' },
  modalClose: { color: '#6366f1', fontSize: 12, fontWeight: '700' },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  optionText: { color: '#475569', fontSize: 13 },
  optionCheck: { color: '#6366f1', fontSize: 17, fontWeight: '800' },
  empty: { textAlign: 'center', color: '#a0aec0', padding: 32, fontSize: 12 },
});

/*
FIX NOTE — "tabs ke karan niche wala section hide ho jata hai":
Happens because a bottom Tab Navigator floats over the screen and the
ScrollView doesn't know its height, so the last row(s) end up underneath it.
1. contentContainerStyle paddingBottom: 100 (already added above) — a safe
   fixed buffer so content never sits under the tab bar.
2. For a pixel-perfect fix instead of a fixed number, import and use:
     import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
     const tabBarHeight = useBottomTabBarHeight();
   then set paddingBottom: tabBarHeight + 24.
   This only works when UserActivityDashboard is rendered *inside* a
   <Tabs.Screen> / bottom Tab Navigator route (e.g. expo-router's
   `app/(tabs)/...` folder). If it's a normal stacked screen opened via
   router.push (not itself a tab), the fixed paddingBottom above is enough.
*/