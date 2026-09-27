import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useInventoryDashboard } from '@/context/InventoryDashboardContext';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

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

export default function InventoryDashboard() {
  const colors = useColors();
  const { dashboard, loading, error, fetchInventoryDashboard, refreshDashboard } = useInventoryDashboard();

  useEffect(() => {
    fetchInventoryDashboard();
  }, []);

  const onRefresh = async () => {
    await refreshDashboard();
  };

  const formatCurrency = (amount: number | string) => {
    const num = Number(amount) || 0;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)} K`;
    return `₹${num.toFixed(0)}`;
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    colors: gradientColors,
    delay = 0,
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    colors: [string, string];
    delay?: number;
  }) => (
    <AnimatedSection delay={delay} style={[styles.statCard, { width: cardWidth }]}>
      <PressScale style={{ borderRadius: 16, overflow: 'hidden' }}>
        <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statGradient}>
          <MaterialCommunityIcons name={icon} size={22} color="rgba(255, 255, 255, 0.9)" />
          <Text style={styles.statTitle}>{title}</Text>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statSubtitle}>{subtitle}</Text>
        </LinearGradient>
      </PressScale>
    </AnimatedSection>
  );

  const AmountRow = ({ label, value, accent }: { label: string; value: number; accent: string }) => (
    <View style={[styles.amountRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.amountLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.amountValue, { color: accent }]}>{formatCurrency(value)}</Text>
    </View>
  );

  const QuickActionButton = ({ icon, label, color }: { icon: any; label: string; color: string }) => (
    <PressScale style={[styles.actionButton, { borderColor: colors.border }]}>
      <View style={[styles.actionIcon, { backgroundColor: `${color}20` }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.actionLabel, { color: colors.text }]}>{label}</Text>
    </PressScale>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={['#667eea', '#ec4899']} tintColor="#667eea" />
      }
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header */}
      <AnimatedSection delay={0}>
        <LinearGradient
          colors={['#667eea', '#8b5cf6', '#ec4899']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.headerTitle}>Inventory & Stock</Text>
          <Text style={styles.headerSubtitle}>
            Complete overview of sales, purchases and stock management
          </Text>
        </LinearGradient>
      </AnimatedSection>

      {/* {error && (
        <AnimatedSection delay={40} style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorHint}>
            {error.includes('School ID')
              ? 'Try logging out and logging in again to refresh your session.'
              : 'Please check your internet connection and try again.'}
          </Text>
        </AnimatedSection>
      )} */}

      {loading && !dashboard ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
        </View>
      ) : (
        <>
          {/* Top Stats - 2x2 Grid */}
          <View style={styles.statsContainer}>
            <StatCard
              title="Customer Balance"
              value={formatCurrency(dashboard.customerBalance)}
              subtitle={`${dashboard.customerBalance || 0} balance`}
              icon="account-cash"
              colors={['#10b981', '#059669']}
              delay={60}
            />
            <StatCard
              title="Stock Value"
              value={formatCurrency(dashboard.stockValue)}
              subtitle="inventory value"
              icon="package-variant"
              colors={['#3b82f6', '#2563eb']}
              delay={120}
            />
            <StatCard
              title="Supplier Balance"
              value={formatCurrency(dashboard.supplierBalance)}
              subtitle="pending"
              icon="cart"
              colors={['#8b5cf6', '#7c3aed']}
              delay={180}
            />
            <StatCard
              title="Active Items"
              value={dashboard.activeItems}
              subtitle="items"
              icon="format-list-bulleted"
              colors={['#f43f5e', '#e11d48']}
              delay={240}
            />
          </View>

          {/* Sell Amount */}
          <AnimatedSection delay={280} style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBadge, { backgroundColor: '#fef3c7' }]}>
                <MaterialCommunityIcons name="trending-up" size={16} color="#f59e0b" />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Sell Amount</Text>
            </View>
            <AmountRow label="Today's Sell" value={dashboard.sellAmount.today} accent="#f59e0b" />
            <AmountRow label="Last Week Sell" value={dashboard.sellAmount.lastWeek} accent="#f59e0b" />
            <AmountRow label="Current Month Sell" value={dashboard.sellAmount.currentMonth} accent="#f59e0b" />
            <AmountRow label="Last 6 Month Sell" value={dashboard.sellAmount.last6Months} accent="#f59e0b" />
            <AmountRow label="Current Session Sell" value={dashboard.sellAmount.currentSession} accent="#f59e0b" />
          </AnimatedSection>

          {/* Received Amount */}
          <AnimatedSection delay={340} style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBadge, { backgroundColor: '#d1fae5' }]}>
                <MaterialCommunityIcons name="cash-check" size={16} color="#10b981" />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Received Amount</Text>
            </View>
            <AmountRow label="Today's Received" value={dashboard.receivedAmount.today} accent="#10b981" />
            <AmountRow label="Last Week Received" value={dashboard.receivedAmount.lastWeek} accent="#10b981" />
            <AmountRow label="Current Month Received" value={dashboard.receivedAmount.currentMonth} accent="#10b981" />
            <AmountRow label="Last 6 Month Received" value={dashboard.receivedAmount.last6Months} accent="#10b981" />
            <AmountRow label="Current Session Received" value={dashboard.receivedAmount.currentSession} accent="#10b981" />
          </AnimatedSection>

          {/* Purchase Amount */}
          <AnimatedSection delay={400} style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBadge, { backgroundColor: '#fee2e2' }]}>
                <MaterialCommunityIcons name="shopping" size={16} color="#ef4444" />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Purchased Amount</Text>
            </View>
            <AmountRow label="Today's Purchase" value={dashboard.purchaseAmount.today} accent="#ef4444" />
            <AmountRow label="Last Week Purchase" value={dashboard.purchaseAmount.lastWeek} accent="#ef4444" />
            <AmountRow label="Current Month Purchase" value={dashboard.purchaseAmount.currentMonth} accent="#ef4444" />
            <AmountRow label="Last 6 Month Purchase" value={dashboard.purchaseAmount.last6Months} accent="#ef4444" />
            <AmountRow label="Current Session Purchase" value={dashboard.purchaseAmount.currentSession} accent="#ef4444" />
          </AnimatedSection>

          {/* Quick Actions */}
          <AnimatedSection delay={460} style={[styles.section, { backgroundColor: colors.card, marginBottom: 24 }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBadge, { backgroundColor: '#fef3c7' }]}>
                <MaterialCommunityIcons name="lightning-bolt" size={16} color="#f59e0b" />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
            </View>
            <View style={styles.actionsGrid}>
              <QuickActionButton icon="plus-circle" label="New Sale" color="#10b981" />
              <QuickActionButton icon="cart-plus" label="New Purchase" color="#ef4444" />
              <QuickActionButton icon="chart-line" label="Sell Report" color="#3b82f6" />
              <QuickActionButton icon="file-document" label="Purchase Report" color="#8b5cf6" />
              <QuickActionButton icon="package" label="Stock Report" color="#f59e0b" />
              <QuickActionButton icon="format-list-bulleted" label="All Items" color="#6366f1" />
            </View>
          </AnimatedSection>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#764ba2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.92)',
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
    marginBottom: 6,
  },
  errorHint: {
    color: '#b91c1c',
    fontSize: 11,
    lineHeight: 16,
  },
  loadingContainer: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  statGradient: {
    padding: 14,
    alignItems: 'flex-start',
  },
  statTitle: {
    fontSize: 10.5,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 6,
  },
  statValue: {
    fontSize: 19,
    fontWeight: '800',
    color: '#fff',
    marginTop: 3,
  },
  statSubtitle: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
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
    gap: 8,
    marginBottom: 10,
  },
  sectionIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  amountLabel: {
    fontSize: 12.5,
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: (width - 64) / 3,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 7,
  },
  actionLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    textAlign: 'center',
  },
});