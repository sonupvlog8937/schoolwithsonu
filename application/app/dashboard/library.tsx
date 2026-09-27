import { useCallback, useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Easing, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, BookOpen, ClipboardList, FileText, Grid2X2, Plus, RotateCcw } from 'lucide-react-native';
import type { AppDispatch, RootState } from '@/state/store';
import { fetchLibraryDashboard } from '@/state/libraryDashboardSlice';

const stats = [
  ['totalBooks', 'Total Books', BookOpen, '#10b981', '#e8f7ef'],
  ['issuedBooks', 'Books Issued', RotateCcw, '#3b82f6', '#e7f4fd'],
  ['returnedBooks', 'Books Returned', RotateCcw, '#8b5cf6', '#eee8f8'],
  ['availableBooks', 'Available Books', FileText, '#f43f5e', '#fdebed'],
] as const;

const quickActions = [
  ['Issue a Book', Plus, '#16a34a', 'Issue a book to a student or staff member'],
  ['Issue Log', ClipboardList, '#1597e5', 'View all issued and returned books'],
  ['Book Database', BookOpen, '#7042bb', 'Manage all books in the library'],
  ['Library Report', FileText, '#f97316', 'Generate and download reports'],
] as const;

/** Fades + slides a block up on mount, with an optional stagger delay. */
function AnimatedSection({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 440, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 440, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  return <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

/** Press-scale wrapper — smooth spring shrink/grow on touch, the mobile equivalent of a hover lift. */
function PressScale({ children, style, onPress, disabled }: { children: React.ReactNode; style?: any; onPress?: () => void; disabled?: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start();

  return (
    <TouchableOpacity activeOpacity={0.9} onPressIn={pressIn} onPressOut={pressOut} onPress={onPress} disabled={disabled}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </TouchableOpacity>
  );
}

export default function LibraryDashboard() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.libraryDashboard);
  const load = useCallback(() => dispatch(fetchLibraryDashboard()), [dispatch]);

  useEffect(() => { load(); }, [load]);

  const value = data || { totalBooks: 0, issuedBooks: 0, returnedBooks: 0, availableBooks: 0, overdueBooks: 0, titleCount: 0 };
  const goToBooks = () => router.push('/library');

  return (
    <ScrollView
      style={styles.page}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={load} colors={['#123c5a', '#087f8c']} tintColor="#123c5a" />
      }
    >
      <AnimatedSection delay={0}>
        <LinearGradient colors={['#123c5a', '#087f8c', '#0fb5a6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
          <PressScale onPress={() => router.back()} style={styles.back}>
            <ArrowLeft size={16} color="#fff" />
            <Text style={styles.backText}>Back to Dashboard</Text>
          </PressScale>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Library Management</Text>
              <Text style={styles.subtitle}>Overview of books, issues and returns</Text>
            </View>
            <PressScale style={styles.headerButton} onPress={goToBooks}>
              <Plus size={15} color="#123c5a" />
              <Text style={styles.headerButtonText}>Issue Book</Text>
            </PressScale>
          </View>
        </LinearGradient>
      </AnimatedSection>

      {loading && !data ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#16b981" />
        </View>
      ) : (
        <>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.statsGrid}>
            {stats.map(([key, label, Icon, color, tint], i) => (
              <AnimatedSection key={key} delay={60 + i * 50} style={{ width: '48%' }}>
                <PressScale style={[styles.statCard, { borderLeftColor: color }]}>
                  <View style={[styles.iconBox, { backgroundColor: tint }]}>
                    <Icon size={19} color={color} />
                  </View>
                  <View>
                    <Text style={[styles.statValue, { color }]}>{value[key]}</Text>
                    <Text style={styles.statLabel}>{label}</Text>
                  </View>
                </PressScale>
              </AnimatedSection>
            ))}
          </View>

          <AnimatedSection delay={280} style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionIconBadge, { backgroundColor: '#fdece6' }]}>
                <Grid2X2 size={15} color="#f15b3a" />
              </View>
              <Text style={styles.sectionTitle}>Library Overview</Text>
            </View>
            {stats.map(([key, label, Icon, color, tint], i) => (
              <PressScale key={key} style={styles.overviewRow}>
                <View style={[styles.smallIcon, { backgroundColor: tint }]}>
                  <Icon size={16} color={color} />
                </View>
                <View>
                  <Text style={styles.muted}>{label}</Text>
                  <Text style={[styles.overviewValue, { color }]}>{value[key]}</Text>
                </View>
              </PressScale>
            ))}
          </AnimatedSection>

          <AnimatedSection delay={340} style={[styles.section, { marginBottom: 120 }]}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionIconBadge, { backgroundColor: '#fdece6' }]}>
                <ClipboardList size={15} color="#f15b3a" />
              </View>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>
            {quickActions.map(([label, Icon, color, desc]) => (
              <PressScale key={label} onPress={goToBooks} style={styles.action}>
                <View style={[styles.smallIcon, { backgroundColor: `${color}18` }]}>
                  <Icon size={16} color={color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.muted, { color }]}>{label}</Text>
                  <Text style={styles.actionText}>{desc}</Text>
                </View>
              </PressScale>
            ))}
          </AnimatedSection>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f1f3f6' },
  header: { padding: 20, paddingTop: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 18 },
  backText: { color: '#d9f4f1', fontSize: 11 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 10 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#d9f4f1', fontSize: 11, marginTop: 4 },
  headerButton: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 11, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 5 },
  headerButtonText: { color: '#123c5a', fontWeight: '700', fontSize: 11 },
  loader: { padding: 50, alignItems: 'center' },
  error: { color: '#c53030', padding: 16, fontSize: 12.5 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 16 },
  statCard: { backgroundColor: '#fff', borderLeftWidth: 4, borderRadius: 13, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 9, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 19, fontWeight: '800' },
  statLabel: { color: '#718096', fontSize: 10, marginTop: 2 },
  section: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 16, borderRadius: 13, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionIconBadge: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { color: '#17233b', fontSize: 14.5, fontWeight: '800' },
  overviewRow: { backgroundColor: '#fafafa', borderRadius: 10, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 8 },
  smallIcon: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  muted: { color: '#718096', fontSize: 10.5 },
  overviewValue: { fontSize: 14.5, fontWeight: '800', marginTop: 2 },
  action: { backgroundColor: '#fafafa', borderRadius: 10, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  actionText: { color: '#17233b', fontSize: 10.5, fontWeight: '700', marginTop: 3 },
});