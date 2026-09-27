import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchDataFromApi } from '@/utils/api';

// If your screen sits inside an expo-router / react-navigation bottom Tab
// Navigator, uncomment the two lines below and use `tabBarHeight` in the
// ScrollView's contentContainerStyle paddingBottom. This is what actually
// fixes content being hidden behind the tab bar (see FIX NOTE at bottom).
// import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Ticket = {
  ticketNumber?: string;
  status?: string;
  priority?: string;
  subject?: string;
  description?: string;
  student?: string;
  createdAt?: string;
  assignedTo?: string;
};

type DashboardData = {
  total?: number;
  open?: number;
  inProgress?: number;
  resolved?: number;
  closed?: number;
  reopened?: number;
  tickets?: Ticket[];
};

// ---------- Colors ----------
const COLORS = {
  bg: '#f4f6fb',
  card: '#ffffff',
  primary: '#6366f1',
  primaryDark: '#4338ca',
  pink: '#ec4899',
  orange: '#f97316',
  green: '#10b981',
  blue: '#3b82f6',
  gray: '#6b7280',
  slate: '#1f2937',
};

const STATUS_COLORS: Record<string, [string, string]> = {
  open: ['#f97316', '#fb923c'],
  'in progress': ['#3b82f6', '#60a5fa'],
  resolved: ['#10b981', '#34d399'],
  closed: ['#6b7280', '#9ca3af'],
};

const PRIORITY_COLORS: Record<string, [string, string]> = {
  high: ['#ef4444', '#f87171'],
  medium: ['#f59e0b', '#fbbf24'],
  low: ['#10b981', '#34d399'],
};

const getStatusColors = (status?: string): [string, string] =>
  STATUS_COLORS[status?.toLowerCase() ?? ''] || ['#6b7280', '#9ca3af'];

const getPriorityColors = (priority?: string): [string, string] =>
  PRIORITY_COLORS[priority?.toLowerCase() ?? ''] || ['#6b7280', '#9ca3af'];

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

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
      duration: 380,
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
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default function ChatDashboard() {
  const router = useRouter();
  // const tabBarHeight = useBottomTabBarHeight(); // uncomment if inside a Tab Navigator

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<'recent' | 'priority'>('recent');

  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;

  const fetchDashboardData = async () => {
    try {
      const response = await fetchDataFromApi('/dashboard/chat');
      if (response?.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error fetching chat dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const switchTab = (tab: 'recent' | 'priority') => {
    setActiveTab(tab);
    Animated.timing(tabIndicatorAnim, {
      toValue: tab === 'recent' ? 0 : 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Chat Dashboard...</Text>
      </View>
    );
  }

  const tabIndicatorWidth = (SCREEN_WIDTH - 32 - 8) / 2; // container margin(16*2) + padding(4*2)

  return (
    <ScrollView
      style={styles.container}
      // FIX: bottom padding so content isn't hidden behind a bottom tab bar.
      // Swap the fixed 90 for `tabBarHeight + 24` if you enable the hook above.
      contentContainerStyle={{ paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.pink]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat Dashboard</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        {[
          { label: 'Total Chats', value: dashboardData?.total, colors: ['#6366f1', '#818cf8'] },
          { label: 'Open', value: dashboardData?.open, colors: ['#f97316', '#fb923c'] },
          { label: 'Resolved', value: dashboardData?.resolved, colors: ['#10b981', '#34d399'] },
          { label: 'Closed', value: dashboardData?.closed, colors: ['#64748b', '#94a3b8'] },
        ].map((stat, i) => (
          <FadeInView key={stat.label} delay={i * 80} style={styles.statCardWrapper}>
            <LinearGradient
              colors={stat.colors as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <Text style={styles.statValue}>{stat.value ?? 0}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </LinearGradient>
          </FadeInView>
        ))}
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              width: tabIndicatorWidth,
              transform: [
                {
                  translateX: tabIndicatorAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, tabIndicatorWidth],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.pink]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>

        <TouchableOpacity
          style={styles.tab}
          activeOpacity={0.8}
          onPress={() => switchTab('recent')}
        >
          <Text style={[styles.tabText, activeTab === 'recent' && styles.activeTabText]}>
            Recent Chats
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          activeOpacity={0.8}
          onPress={() => switchTab('priority')}
        >
          <Text style={[styles.tabText, activeTab === 'priority' && styles.activeTabText]}>
            Priority View
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content based on active tab */}
      {activeTab === 'recent' ? (
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Recent Chats</Text>
          {dashboardData?.tickets && dashboardData.tickets.length > 0 ? (
            dashboardData.tickets.map((ticket, index) => {
              const statusColors = getStatusColors(ticket.status);
              const priorityColors = getPriorityColors(ticket.priority);
              return (
                <FadeInView key={index} delay={index * 60} style={styles.ticketCard}>
                  <View style={styles.accentBar}>
                    <LinearGradient
                      colors={priorityColors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                  </View>
                  <View style={styles.ticketCardInner}>
                    <View style={styles.ticketHeader}>
                      <View style={styles.ticketHeaderLeft}>
                        <Text style={styles.ticketId}>#{ticket.ticketNumber || 'N/A'}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: `${statusColors[0]}22` }]}>
                          <View style={[styles.dot, { backgroundColor: statusColors[0] }]} />
                          <Text style={[styles.statusText, { color: statusColors[0] }]}>
                            {ticket.status || 'N/A'}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.priorityBadge, { backgroundColor: `${priorityColors[0]}22` }]}>
                        <Text style={[styles.priorityText, { color: priorityColors[0] }]}>
                          {ticket.priority || 'N/A'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.ticketSubject}>{ticket.subject || 'No Subject'}</Text>
                    <Text style={styles.ticketDescription} numberOfLines={2}>
                      {ticket.description || 'No description available'}
                    </Text>

                    <View style={styles.ticketFooter}>
                      <View style={styles.ticketFooterItem}>
                        <Ionicons name="person-outline" size={13} color={COLORS.gray} />
                        <Text style={styles.ticketFooterText}>{ticket.student || 'Unknown'}</Text>
                      </View>
                      <View style={styles.ticketFooterItem}>
                        <Ionicons name="calendar-outline" size={13} color={COLORS.gray} />
                        <Text style={styles.ticketFooterText}>{formatDate(ticket.createdAt)}</Text>
                      </View>
                    </View>

                    {ticket.assignedTo && (
                      <View style={styles.assignedSection}>
                        <Ionicons name="checkmark-circle" size={13} color={COLORS.green} />
                        <Text style={styles.assignedText}>
                          Assigned to: {ticket.assignedTo || 'Unassigned'}
                        </Text>
                      </View>
                    )}
                  </View>
                </FadeInView>
              );
            })
          ) : (
            <View style={styles.noDataContainer}>
              <Ionicons name="chatbubbles-outline" size={44} color="#cbd5e1" />
              <Text style={styles.noDataText}>No chat tickets found</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Priority View</Text>
          {(['High', 'Medium', 'Low'] as const).map((priority, pIndex) => {
            const priorityTickets =
              dashboardData?.tickets?.filter(
                (ticket) => ticket.priority?.toLowerCase() === priority.toLowerCase()
              ) || [];
            const colors = getPriorityColors(priority);

            return (
              <FadeInView key={priority} delay={pIndex * 90} style={styles.prioritySection}>
                <View style={styles.prioritySectionHeader}>
                  <LinearGradient
                    colors={colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.priorityIndicator}
                  />
                  <Text style={styles.prioritySectionTitle}>
                    {priority} Priority ({priorityTickets.length})
                  </Text>
                </View>
                {priorityTickets.length > 0 ? (
                  priorityTickets.map((ticket, index) => {
                    const statusColors = getStatusColors(ticket.status);
                    return (
                      <View key={index} style={styles.priorityTicketCard}>
                        <View style={styles.priorityTicketHeader}>
                          <Text style={styles.priorityTicketId}>#{ticket.ticketNumber || 'N/A'}</Text>
                          <View style={[styles.statusBadge, { backgroundColor: `${statusColors[0]}22` }]}>
                            <View style={[styles.dot, { backgroundColor: statusColors[0] }]} />
                            <Text style={[styles.statusText, { color: statusColors[0] }]}>
                              {ticket.status || 'N/A'}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.priorityTicketSubject}>{ticket.subject || 'No Subject'}</Text>
                        <Text style={styles.priorityTicketUser}>
                          {ticket.student || 'Unknown'} • {formatDate(ticket.createdAt)}
                        </Text>
                      </View>
                    );
                  })
                ) : (
                  <Text style={styles.noPriorityTickets}>
                    No {priority.toLowerCase()} priority tickets
                  </Text>
                )}
              </FadeInView>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.gray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
  placeholder: {
    width: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 10,
  },
  statCardWrapper: {
    flex: 1,
    minWidth: '45%',
  },
  statCard: {
    padding: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 6,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    borderRadius: 9,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.gray,
  },
  activeTabText: {
    color: '#ffffff',
  },
  contentContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.slate,
    marginBottom: 12,
  },
  ticketCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  accentBar: {
    width: 5,
  },
  ticketCardInner: {
    flex: 1,
    padding: 14,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ticketId: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.slate,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  ticketSubject: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.slate,
    marginBottom: 3,
  },
  ticketDescription: {
    fontSize: 12.5,
    color: COLORS.gray,
    marginBottom: 10,
    lineHeight: 17,
  },
  ticketFooter: {
    flexDirection: 'row',
    gap: 14,
  },
  ticketFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ticketFooterText: {
    fontSize: 11,
    color: COLORS.gray,
  },
  assignedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eef1f5',
  },
  assignedText: {
    fontSize: 11,
    color: COLORS.green,
    fontWeight: '600',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 44,
  },
  noDataText: {
    marginTop: 10,
    fontSize: 13,
    color: '#9ca3af',
  },
  prioritySection: {
    marginBottom: 22,
  },
  prioritySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  priorityIndicator: {
    width: 4,
    height: 18,
    borderRadius: 2,
    marginRight: 8,
  },
  prioritySectionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.slate,
  },
  priorityTicketCard: {
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  priorityTicketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  priorityTicketId: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.slate,
  },
  priorityTicketSubject: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.slate,
    marginBottom: 3,
  },
  priorityTicketUser: {
    fontSize: 11,
    color: COLORS.gray,
  },
  noPriorityTickets: {
    fontSize: 12.5,
    color: '#9ca3af',
    fontStyle: 'italic',
    paddingVertical: 10,
  },
});

/*
FIX NOTE — "tabs ke karan niche wala section hide ho jata hai":
This happens because a bottom Tab Navigator floats over your screen and the
ScrollView doesn't know how tall it is, so the last card(s) end up underneath it.
Two things fix it together:
1. contentContainerStyle={{ paddingBottom: 110 }} on the ScrollView (already added above)
   — a fixed safe buffer so content never sits under the tab bar.
2. For a pixel-perfect fix instead of a fixed number, import and use:
     import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
     const tabBarHeight = useBottomTabBarHeight();
   then set contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}.
   This only works if ChatDashboard is rendered *inside* a <Tabs.Screen> /
   bottom Tab Navigator route (expo-router's `app/(tabs)/...` folder counts).
   If it's a normal stacked screen (opened via router.push, not a tab itself),
   the fixed paddingBottom above is all you need.
*/