import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  Pressable, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { fetchDataFromApi, postData } from '@/utils/api';
import { LoadingView } from '@/components/LoadingView';
import { EmptyView } from '@/components/EmptyView';

interface AttendanceRecord {
  _id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HOLIDAY' | 'LEAVE';
  checkInTime?: string;
  checkOutTime?: string;
  remarks?: string;
  subject?: string;
  class?: string;
  createdAt?: string;
}

interface AttendanceStats {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  percentage: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AttendanceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  const toast = useToast();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear] = useState(new Date().getFullYear());
  const [markingAttendance, setMarkingAttendance] = useState(false);

  const s = styles(colors);
  const topPad = (Platform.OS === 'web' ? 12 : insets.top) + 8;

  const userRole = userData?.role ?? '';
  const isStudent = userRole === 'STUDENT';
  const isTeacher = userRole === 'TEACHER';

  // Fetch attendance records
  const { data, refetch, isLoading, isError } = useQuery({
    queryKey: ['attendance', userRole, selectedMonth, selectedYear],
    queryFn: () => {
      const endpoint = isStudent 
        ? `/api/student/attendance?month=${selectedMonth + 1}&year=${selectedYear}`
        : isTeacher
        ? `/api/teacher/attendance?month=${selectedMonth + 1}&year=${selectedYear}`
        : `/api/school/attendance?month=${selectedMonth + 1}&year=${selectedYear}`;
      return fetchDataFromApi(endpoint);
    },
  });

  const attendanceRecords: AttendanceRecord[] = data?.attendance ?? data?.data ?? [];
  const stats: AttendanceStats = data?.stats ?? {
    totalDays: 0,
    present: 0,
    absent: 0,
    late: 0,
    leave: 0,
    percentage: 0,
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Mark today's attendance (for students/teachers to check in)
  const markAttendance = async () => {
    if (markingAttendance) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMarkingAttendance(true);

    const endpoint = isStudent 
      ? '/api/student/attendance/mark'
      : '/api/teacher/attendance/mark';

    const res = await postData(endpoint, {
      date: new Date().toISOString(),
      status: 'PRESENT',
    });

    setMarkingAttendance(false);

    if (res?.success || res?.data?.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.show('Attendance marked successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    } else {
      toast.show(res?.message || 'Failed to mark attendance', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return '#10b981';
      case 'ABSENT': return '#ef4444';
      case 'LATE': return '#f59e0b';
      case 'LEAVE': return '#8b5cf6';
      case 'HOLIDAY': return '#6b7280';
      default: return colors.mutedForeground;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'check-circle';
      case 'ABSENT': return 'x-circle';
      case 'LATE': return 'clock';
      case 'LEAVE': return 'file-text';
      case 'HOLIDAY': return 'sun';
      default: return 'circle';
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '--:--';
    const d = new Date(timeStr);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const renderAttendanceCard = ({ item }: { item: AttendanceRecord }) => {
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);

    return (
      <View style={s.attendanceCard}>
        <View style={s.dateSection}>
          <Text style={s.dateDay}>{new Date(item.date).getDate()}</Text>
          <Text style={s.dateMonth}>{MONTHS[new Date(item.date).getMonth()]}</Text>
        </View>

        <View style={s.detailsSection}>
          <View style={s.statusRow}>
            <View style={[s.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[s.statusText, { color: statusColor }]}>
              {item.status}
            </Text>
          </View>
          
          {(item.checkInTime || item.checkOutTime) && (
            <View style={s.timeRow}>
              {item.checkInTime && (
                <View style={s.timeItem}>
                  <Feather name="log-in" size={12} color={colors.mutedForeground} />
                  <Text style={s.timeText}>{formatTime(item.checkInTime)}</Text>
                </View>
              )}
              {item.checkOutTime && (
                <View style={s.timeItem}>
                  <Feather name="log-out" size={12} color={colors.mutedForeground} />
                  <Text style={s.timeText}>{formatTime(item.checkOutTime)}</Text>
                </View>
              )}
            </View>
          )}

          {item.remarks && (
            <Text style={s.remarks} numberOfLines={2}>{item.remarks}</Text>
          )}
        </View>

        <Feather name={statusIcon as any} size={28} color={statusColor} style={{ opacity: 0.3 }} />
      </View>
    );
  };

  if (isLoading && attendanceRecords.length === 0) {
    return <LoadingView message="Loading attendance..." />;
  }

  if (isError) {
    return (
      <EmptyView
        icon="wifi-off"
        title="Failed to load attendance"
        description="Check your connection and try again"
        actionLabel="Retry"
        onAction={refetch}
      />
    );
  }

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Attendance</Text>
      </View>

      {/* Stats Card */}
      <LinearGradient
        colors={['#4f46e5', '#6366f1', '#818cf8']}
        style={s.statsCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={s.statsHeader}>
          <Text style={s.statsTitle}>This Month</Text>
          <Text style={s.statsMonth}>{MONTHS[selectedMonth]} {selectedYear}</Text>
        </View>
        
        <View style={s.percentageRow}>
          <Text style={s.percentageValue}>{stats.percentage.toFixed(1)}%</Text>
          <Text style={s.percentageLabel}>Attendance Rate</Text>
        </View>

        <View style={s.statsGrid}>
          <View style={s.statItem}>
            <View style={[s.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <Feather name="check" size={16} color="#10b981" />
            </View>
            <Text style={s.statValue}>{stats.present}</Text>
            <Text style={s.statLabel}>Present</Text>
          </View>

          <View style={s.statItem}>
            <View style={[s.statIcon, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
              <Feather name="x" size={16} color="#ef4444" />
            </View>
            <Text style={s.statValue}>{stats.absent}</Text>
            <Text style={s.statLabel}>Absent</Text>
          </View>

          <View style={s.statItem}>
            <View style={[s.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
              <Feather name="clock" size={16} color="#f59e0b" />
            </View>
            <Text style={s.statValue}>{stats.late}</Text>
            <Text style={s.statLabel}>Late</Text>
          </View>

          <View style={s.statItem}>
            <View style={[s.statIcon, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
              <Feather name="file-text" size={16} color="#8b5cf6" />
            </View>
            <Text style={s.statValue}>{stats.leave}</Text>
            <Text style={s.statLabel}>Leave</Text>
          </View>
        </View>

        {/* Mark Attendance Button */}
        {(isStudent || isTeacher) && (
          <Pressable
            style={s.markButton}
            onPress={markAttendance}
            disabled={markingAttendance}
          >
            {markingAttendance ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Feather name="check-square" size={18} color="#fff" />
                <Text style={s.markButtonText}>Mark Today's Attendance</Text>
              </>
            )}
          </Pressable>
        )}
      </LinearGradient>

      {/* Month Selector */}
      <View style={s.monthSelector}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.monthScroll}
        >
          {MONTHS.map((month, idx) => {
            const isSelected = idx === selectedMonth;
            return (
              <Pressable
                key={month}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedMonth(idx);
                }}
                style={[s.monthChip, isSelected && { backgroundColor: colors.primary }]}
              >
                <Text style={[s.monthText, { color: isSelected ? '#fff' : colors.mutedForeground }]}>
                  {month}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Attendance Records */}
      <Text style={s.sectionTitle}>
        {attendanceRecords.length} record{attendanceRecords.length !== 1 ? 's' : ''}
      </Text>

      <FlatList
        data={attendanceRecords}
        keyExtractor={(item) => item._id}
        renderItem={renderAttendanceCard}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <EmptyView
            icon="calendar"
            title="No attendance records"
            description={`No attendance data for ${MONTHS[selectedMonth]} ${selectedYear}`}
          />
        }
      />
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.foreground,
      letterSpacing: -0.6,
    },

    // Stats Card
    statsCard: {
      marginHorizontal: 16,
      borderRadius: 20,
      padding: 20,
      gap: 16,
      shadowColor: '#6366f1',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    statsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statsTitle: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.8)',
      fontWeight: '600',
    },
    statsMonth: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.7)',
      fontWeight: '500',
    },
    percentageRow: {
      alignItems: 'center',
      gap: 4,
    },
    percentageValue: {
      fontSize: 48,
      fontWeight: '800',
      color: '#fff',
      letterSpacing: -2,
    },
    percentageLabel: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.7)',
      fontWeight: '500',
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(255,255,255,0.15)',
      padding: 12,
      borderRadius: 12,
    },
    statIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statValue: {
      fontSize: 20,
      fontWeight: '800',
      color: '#fff',
    },
    statLabel: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.7)',
      fontWeight: '500',
    },
    markButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: 'rgba(255,255,255,0.25)',
      paddingVertical: 14,
      borderRadius: 12,
      marginTop: 4,
    },
    markButtonText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#fff',
    },

    // Month Selector
    monthSelector: {
      marginTop: 16,
      marginBottom: 8,
    },
    monthScroll: {
      paddingHorizontal: 16,
      gap: 8,
    },
    monthChip: {
      paddingHorizontal: 18,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.muted,
      borderWidth: 1,
      borderColor: colors.border,
    },
    monthText: {
      fontSize: 13,
      fontWeight: '600',
    },

    // Records List
    sectionTitle: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontWeight: '600',
      paddingHorizontal: 16,
      marginTop: 8,
      marginBottom: 4,
    },
    list: {
      padding: 16,
      paddingTop: 8,
      gap: 10,
      paddingBottom: 120,
    },
    attendanceCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 14,
      gap: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dateSection: {
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 50,
    },
    dateDay: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.foreground,
    },
    dateMonth: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.mutedForeground,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    detailsSection: {
      flex: 1,
      gap: 6,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    statusText: {
      fontSize: 14,
      fontWeight: '700',
      textTransform: 'capitalize',
    },
    timeRow: {
      flexDirection: 'row',
      gap: 16,
    },
    timeItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    timeText: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontWeight: '500',
    },
    remarks: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontStyle: 'italic',
      lineHeight: 16,
    },
  });
