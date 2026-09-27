import React, { useEffect, useRef, useState } from 'react';
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
  TouchableWithoutFeedback,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAccountsDashboard } from '@/context/AccountsDashboardContext';

const { width } = Dimensions.get('window');
const cardWidth = (width - 44) / 2;

type Grad = readonly [string, string];

const GRADS: Grad[] = [
  ['#34d399', '#059669'],
  ['#60a5fa', '#4f46e5'],
  ['#a78bfa', '#db2777'],
  ['#fb7185', '#f97316'],
  ['#fbbf24', '#f59e0b'],
  ['#22d3ee', '#0284c7'],
];

const formatCurrency = (amount: number): string => {
  const num = Number(amount) || 0;
  const abs = Math.abs(num);
  if (abs >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  if (abs >= 1000) return `₹${(num / 1000).toFixed(1)} K`;
  return `₹${Math.round(num)}`;
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

/* ---------- Animation helpers ---------- */

// Smooth fade + slide-up entrance, staggered by index
function FadeIn({
  index = 0,
  style,
  children,
}: {
  index?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 550,
      delay: index * 80,
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
  onPress,
  style,
  children,
}: {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const s = useRef(new Animated.Value(1)).current;
  const to = (t: number) =>
    Animated.spring(s, { toValue: t, speed: 40, bounciness: 6, useNativeDriver: true }).start();
  return (
    <TouchableWithoutFeedback onPressIn={() => to(0.94)} onPressOut={() => to(1)} onPress={onPress}>
      <Animated.View style={[style, { transform: [{ scale: s }] }]}>{children}</Animated.View>
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
  return <Text style={style}>{formatCurrency(n)}</Text>;
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
    <Animated.View
      style={[
        styles.bar,
        { height: v.interpolate({ inputRange: [0, 1], outputRange: [0, h] }) },
      ]}
    >
      <LinearGradient colors={colors} style={{ flex: 1 }} />
    </Animated.View>
  );
}

// Progress bar that fills smoothly
function ProgressBar({ percent, colors }: { percent: number; colors: readonly [string, string, ...string[]] }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: Math.min(Math.max(percent, 0), 100),
      duration: 1100,
      delay: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [percent]);
  return (
    <View style={styles.progressTrack}>
      <Animated.View
        style={{
          height: '100%',
          borderRadius: 4,
          overflow: 'hidden',
          width: v.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
        }}
      >
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
      </Animated.View>
    </View>
  );
}

/* ---------- Small components (outside main so they don't remount) ---------- */

function StatCard({
  title,
  amount,
  icon,
  colors,
  loading,
  index,
}: {
  title: string;
  amount: number;
  icon: string;
  colors: Grad;
  loading?: boolean;
  index: number;
}) {
  return (
    <FadeIn index={index + 1} style={[styles.statCard, { width: cardWidth, shadowColor: colors[1] }]}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statGradient}>
        <View style={styles.bubbleBig} />
        <View style={styles.bubbleSmall} />
        <View style={styles.statIconChip}>
          <MaterialCommunityIcons name={icon as any} size={18} color="#fff" />
        </View>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" style={{ alignSelf: 'flex-start' }} />
        ) : (
          <CountUp value={amount} style={styles.statAmount} />
        )}
        <Text style={styles.statTitle}>{title}</Text>
      </LinearGradient>
    </FadeIn>
  );
}

function SectionHeader({ icon, color, title }: { icon: string; color: string; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIcon, { backgroundColor: `${color}1F` }]}>
        <MaterialCommunityIcons name={icon as any} size={16} color={color} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function QuickActionButton({
  icon,
  label,
  color,
  onPress,
}: {
  icon: string;
  label: string;
  color: string;
  onPress?: () => void;
}) {
  return (
    <PressScale onPress={onPress} style={[styles.quickActionButton, { backgroundColor: `${color}12`, borderColor: `${color}30` }]}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon as any} size={20} color="#fff" />
      </View>
      <Text style={[styles.quickActionLabel, { color }]}>{label}</Text>
    </PressScale>
  );
}

/* ---------- Screen ---------- */

export default function AccountsDashboardScreen() {
  const {
    todayCollection,
    thisWeekCollection,
    thisMonthCollection,
    totalPending,
    collectionSummary,
    bankBalances,
    feeCollectionTrends,
    recentTransactions,
    loading,
    trendsLoading,
    transactionsLoading,
    bankBalancesLoading,
    fetchAccountsDashboard,
    fetchFeeCollectionTrends,
    fetchRecentTransactions,
    fetchBankBalances,
  } = useAccountsDashboard();

  const loadAll = () => {
    fetchAccountsDashboard();
    fetchFeeCollectionTrends(12);
    fetchRecentTransactions(5);
    fetchBankBalances();
  };

  useEffect(() => {
    loadAll();
  }, []);

  const trendItems = (Array.isArray(feeCollectionTrends) ? feeCollectionTrends : []).map((t: any) => ({
    label: String(t.month ?? t.label ?? t.name ?? '').slice(0, 3),
    value: Number(t.amount ?? t.total ?? t.collection ?? t.value ?? 0),
  }));
  const trendMax = Math.max(...trendItems.map((t: any) => t.value), 1);

  const summary = [
    { label: 'Quarterly Collection', icon: 'chart-arc', color: '#10b981', value: formatCurrency(collectionSummary?.quarterlyCollection || 0) },
    { label: 'Yearly Collection', icon: 'chart-line', color: '#3b82f6', value: formatCurrency(collectionSummary?.yearlyCollection || 0) },
    { label: 'Pending Collection', icon: 'alert-circle', color: '#ef4444', value: formatCurrency(collectionSummary?.pendingFees || 0) },
    { label: 'Collection Rate', icon: 'percent', color: '#8b5cf6', value: `${collectionSummary?.collectionRate?.toFixed(1) || 0}%` },
  ];

  const pettyTotal =
    bankBalances?.pettyCash?.reduce((sum: number, pc: any) => sum + (pc.balance || 0), 0) || 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={!!(loading || trendsLoading || transactionsLoading)}
          onRefresh={loadAll}
          tintColor="#667eea"
          colors={['#667eea', '#ec4899', '#10b981']}
        />
      }
    >
      {/* Header */}
      <FadeIn index={0}>
        <LinearGradient
          colors={['#6366f1', '#a855f7', '#ec4899']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.bubbleBig} />
          <View style={styles.bubbleSmall} />
          <Text style={styles.headerTitle}>Accounts Dashboard</Text>
          <Text style={styles.headerSubtitle}>Financial Overview & Summary</Text>
        </LinearGradient>
      </FadeIn>

      {/* Stats Cards Grid */}
      <View style={styles.statsContainer}>
        <StatCard index={0} title="Today's Collection" amount={todayCollection || 0} icon="cash-multiple" colors={GRADS[0]} loading={loading} />
        <StatCard index={1} title="This Week" amount={thisWeekCollection || 0} icon="calendar-week" colors={GRADS[1]} loading={loading} />
        <StatCard index={2} title="This Month" amount={thisMonthCollection || 0} icon="calendar-month" colors={GRADS[2]} loading={loading} />
        <StatCard index={3} title="Total Pending" amount={totalPending || 0} icon="alert-circle" colors={GRADS[3]} loading={loading} />
      </View>

      {/* Bank Balances */}
      <FadeIn index={5} style={styles.section}>
        <SectionHeader icon="bank" color="#6366f1" title="Bank Balances" />

        {bankBalancesLoading ? (
          <ActivityIndicator size="small" color="#667eea" />
        ) : (
          <>
            <View style={[styles.bankCard, { borderLeftColor: '#f59e0b', backgroundColor: '#fffbeb' }]}>
              <View style={styles.bankCardLeft}>
                <View style={[styles.bankIcon, { backgroundColor: '#f59e0b22' }]}>
                  <MaterialCommunityIcons name="cash" size={20} color="#f59e0b" />
                </View>
                <View style={styles.bankCardText}>
                  <Text style={styles.bankName}>Petty Cash</Text>
                  <Text style={styles.bankType}>Cash on Hand</Text>
                </View>
              </View>
              <Text style={styles.bankBalance}>{formatCurrency(pettyTotal)}</Text>
            </View>

            {bankBalances?.banks?.map((bank: any, index: number) => {
              const c = GRADS[(index + 1) % GRADS.length][1];
              return (
                <View key={index} style={[styles.bankCard, { borderLeftColor: c, backgroundColor: `${c}0F` }]}>
                  <View style={styles.bankCardLeft}>
                    <View style={[styles.bankIcon, { backgroundColor: `${c}22` }]}>
                      <MaterialCommunityIcons name="bank" size={20} color={c} />
                    </View>
                    <View style={styles.bankCardText}>
                      <Text style={styles.bankName}>{bank.name || 'Bank Account'}</Text>
                      <Text style={styles.bankType}>{bank.accountNumber || 'N/A'}</Text>
                    </View>
                  </View>
                  <Text style={styles.bankBalance}>{formatCurrency(bank.balance || 0)}</Text>
                </View>
              );
            })}
          </>
        )}
      </FadeIn>

      {/* Collection Summary */}
      <FadeIn index={6} style={styles.section}>
        <SectionHeader icon="chart-bar" color="#10b981" title="Collection Summary" />

        {loading ? (
          <ActivityIndicator size="small" color="#10b981" />
        ) : (
          <>
            <View style={styles.summaryGrid}>
              {summary.map((s) => (
                <View key={s.label} style={[styles.summaryItem, { backgroundColor: `${s.color}12` }]}>
                  <View style={[styles.summaryIcon, { backgroundColor: `${s.color}22` }]}>
                    <MaterialCommunityIcons name={s.icon as any} size={16} color={s.color} />
                  </View>
                  <Text style={styles.summaryLabel}>{s.label}</Text>
                  <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
                </View>
              ))}
            </View>
            <ProgressBar
              percent={Number(collectionSummary?.collectionRate) || 0}
              colors={['#8b5cf6', '#ec4899', '#f97316']}
            />
          </>
        )}
      </FadeIn>

      {/* Fee Collection Trend */}
      {trendItems.length > 0 && (
        <FadeIn index={7} style={styles.section}>
          <SectionHeader icon="chart-line" color="#0ea5e9" title="Fee Collection Trend" />
          <View style={styles.chartRow}>
            {trendItems.map((t: any, i: number) => (
              <View key={i} style={styles.chartCol}>
                <Bar h={Math.max((t.value / trendMax) * 100, 4)} colors={GRADS[i % GRADS.length]} delay={i * 60} />
                <Text style={styles.chartLabel} numberOfLines={1}>{t.label}</Text>
              </View>
            ))}
          </View>
        </FadeIn>
      )}

      {/* Recent Transactions */}
      <FadeIn index={8} style={styles.section}>
        <SectionHeader icon="history" color="#f43f5e" title="Recent Transactions" />

        {transactionsLoading ? (
          <ActivityIndicator size="small" color="#6366f1" />
        ) : recentTransactions?.length > 0 ? (
          recentTransactions.map((transaction: any, index: number) => {
            const g = GRADS[index % GRADS.length];
            return (
              <View key={index} style={styles.transactionCard}>
                <View style={styles.transactionLeft}>
                  <LinearGradient colors={g} style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {(transaction.studentName || '?').charAt(0).toUpperCase()}
                    </Text>
                  </LinearGradient>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionName} numberOfLines={1}>{transaction.studentName}</Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(transaction.date)} • {transaction.paymentMode || 'N/A'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.transactionAmount}>+{formatCurrency(transaction.amount)}</Text>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="history" size={36} color="#cbd5e1" />
            <Text style={styles.emptyText}>No recent transactions</Text>
          </View>
        )}
      </FadeIn>

      {/* Quick Actions */}
      <FadeIn index={9} style={styles.section}>
        <SectionHeader icon="lightning-bolt" color="#f59e0b" title="Quick Actions" />
        <View style={styles.quickActionsGrid}>
          <QuickActionButton icon="cash-plus" label="Collect Fee" color="#10b981" />
          <QuickActionButton icon="receipt" label="Fee Receipts" color="#3b82f6" />
          <QuickActionButton icon="file-document" label="Fee Reports" color="#8b5cf6" />
          <QuickActionButton icon="account-cash" label="Pending Fees" color="#ef4444" />
          <QuickActionButton icon="bank-transfer" label="Bank Transfer" color="#0ea5e9" />
          <QuickActionButton icon="currency-inr" label="Expenses" color="#f59e0b" />
        </View>
      </FadeIn>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7fb' },

  header: {
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    padding: 20,
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.3, marginBottom: 2 },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.88)' },

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

  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    borderRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 5,
  },
  statGradient: { padding: 14, borderRadius: 18, overflow: 'hidden' },
  statIconChip: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statAmount: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  statTitle: { fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,0.9)', marginTop: 2 },

  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
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
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionIcon: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginLeft: 8 },

  bankCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  bankCardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  bankIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  bankCardText: { marginLeft: 10, flex: 1 },
  bankName: { fontSize: 12.5, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
  bankType: { fontSize: 11, color: '#64748b' },
  bankBalance: { fontSize: 14, fontWeight: '700', color: '#1e293b' },

  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  summaryItem: {
    width: (width - 32 - 28 - 10) / 2,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  summaryIcon: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  summaryLabel: { fontSize: 11, color: '#64748b', marginBottom: 4, textAlign: 'center' },
  summaryValue: { fontSize: 16, fontWeight: '700' },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: '#ede9fe',
    marginTop: 14,
    overflow: 'hidden',
  },

  chartRow: { flexDirection: 'row', alignItems: 'flex-end', height: 130, gap: 4 },
  chartCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  bar: { width: '100%', maxWidth: 20, borderTopLeftRadius: 7, borderTopRightRadius: 7, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, overflow: 'hidden' },
  chartLabel: { fontSize: 8.5, color: '#94a3b8', marginTop: 4 },

  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  transactionInfo: { marginLeft: 10, flex: 1 },
  transactionName: { fontSize: 12.5, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
  transactionDate: { fontSize: 10.5, color: '#64748b' },
  transactionAmount: { fontSize: 13, fontWeight: '700', color: '#10b981', marginLeft: 8 },

  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickActionButton: {
    width: (width - 32 - 28 - 20) / 3,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
  },
  quickActionIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  quickActionLabel: { fontSize: 10.5, fontWeight: '600', textAlign: 'center' },

  emptyState: { alignItems: 'center', paddingVertical: 28 },
  emptyText: { fontSize: 12, color: '#94a3b8', marginTop: 6 },
});