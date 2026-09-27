import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  Pressable, Platform, Modal, TextInput, ActivityIndicator,
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
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingView } from '@/components/LoadingView';
import { EmptyView } from '@/components/EmptyView';

interface FeeRecord {
  _id: string;
  studentId?: string;
  studentName?: string;
  className?: string;
  feeType: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL';
  paidAmount?: number;
  paidDate?: string;
  paymentMethod?: string;
  transactionId?: string;
  remarks?: string;
  createdAt?: string;
}

interface FeeStats {
  totalFees: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
}

const FEE_TYPES = ['All', 'Tuition', 'Transport', 'Library', 'Exam', 'Other'];

export default function FeesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  const toast = useToast();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [paymentModal, setPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const s = styles(colors);
  const topPad = (Platform.OS === 'web' ? 12 : insets.top) + 8;

  const userRole = userData?.role ?? '';
  const isStudent = userRole === 'STUDENT';
  const isParent = userRole === 'PARENT';
  const isAccountant = userRole === 'ACCOUNTANT';

  // Fetch fee records
  const { data, refetch, isLoading, isError } = useQuery({
    queryKey: ['fees', userRole],
    queryFn: () => {
      const endpoint = isStudent
        ? '/api/student/fees'
        : isParent
        ? '/api/parent/fees'
        : isAccountant
        ? '/api/accountant/fees'
        : '/api/school/fees';
      return fetchDataFromApi(endpoint);
    },
  });

  const feeRecords: FeeRecord[] = data?.fees ?? data?.data ?? [];
  const stats: FeeStats = data?.stats ?? {
    totalFees: 0,
    paidAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0,
  };

  const filtered = feeRecords.filter((fee) => {
    if (filter === 'All') return true;
    return fee.feeType.toLowerCase() === filter.toLowerCase();
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const openPaymentModal = (fee: FeeRecord) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFee(fee);
    setPaymentAmount(fee.amount.toString());
    setPaymentModal(true);
  };

  const processPayment = async () => {
    if (!selectedFee) return;
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.show('Enter a valid amount', 'error');
      return;
    }

    if (amount > selectedFee.amount) {
      toast.show('Amount exceeds fee amount', 'error');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setProcessing(true);

    const res = await postData('/api/fees/payment', {
      feeId: selectedFee._id,
      amount,
      paymentMethod: 'ONLINE',
    });

    setProcessing(false);

    if (res?.success || res?.data?.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.show('Payment processed successfully!', 'success');
      setPaymentModal(false);
      setSelectedFee(null);
      setPaymentAmount('');
      queryClient.invalidateQueries({ queryKey: ['fees'] });
    } else {
      toast.show(res?.message || 'Payment failed', 'error');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatMoney = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return '#10b981';
      case 'PENDING': return '#f59e0b';
      case 'OVERDUE': return '#ef4444';
      case 'PARTIAL': return '#3b82f6';
      default: return colors.mutedForeground;
    }
  };

  const renderFeeCard = ({ item }: { item: FeeRecord }) => {
    const statusColor = getStatusColor(item.status);
    const isPending = item.status === 'PENDING' || item.status === 'OVERDUE';
    const isOverdue = item.status === 'OVERDUE';

    return (
      <View style={[s.feeCard, isOverdue && { borderColor: '#ef4444', borderWidth: 2 }]}>
        <View style={s.feeHeader}>
          <View style={s.feeLeft}>
            <View style={s.feeTypeRow}>
              <View style={[s.feeIcon, { backgroundColor: statusColor + '20' }]}>
                <Feather name="file-text" size={18} color={statusColor} />
              </View>
              <View>
                <Text style={s.feeType}>{item.feeType}</Text>
                {item.className && (
                  <Text style={s.feeClass}>Class: {item.className}</Text>
                )}
              </View>
            </View>
            {item.studentName && (
              <Text style={s.studentName}>{item.studentName}</Text>
            )}
          </View>
          <View style={s.feeRight}>
            <Text style={s.feeAmount}>{formatMoney(item.amount)}</Text>
            <StatusBadge status={item.status} small />
          </View>
        </View>

        <View style={s.feeDetails}>
          <View style={s.detailRow}>
            <View style={s.detailItem}>
              <Feather name="calendar" size={12} color={colors.mutedForeground} />
              <Text style={s.detailText}>Due: {formatDate(item.dueDate)}</Text>
            </View>
            {item.paidDate && (
              <View style={s.detailItem}>
                <Feather name="check" size={12} color="#10b981" />
                <Text style={s.detailText}>Paid: {formatDate(item.paidDate)}</Text>
              </View>
            )}
          </View>

          {item.paidAmount && item.paidAmount < item.amount && (
            <View style={s.partialRow}>
              <Text style={s.partialText}>
                Paid: {formatMoney(item.paidAmount)} / {formatMoney(item.amount)}
              </Text>
              <Text style={s.balanceText}>
                Balance: {formatMoney(item.amount - item.paidAmount)}
              </Text>
            </View>
          )}

          {item.transactionId && (
            <View style={s.detailItem}>
              <Feather name="hash" size={12} color={colors.mutedForeground} />
              <Text style={s.detailText}>{item.transactionId}</Text>
            </View>
          )}
        </View>

        {isPending && (isStudent || isParent) && (
          <Pressable
            style={[s.payButton, { backgroundColor: colors.primary }]}
            onPress={() => openPaymentModal(item)}
          >
            <Feather name="credit-card" size={16} color="#fff" />
            <Text style={s.payButtonText}>Pay Now</Text>
          </Pressable>
        )}
      </View>
    );
  };

  if (isLoading && feeRecords.length === 0) {
    return <LoadingView message="Loading fees..." />;
  }

  if (isError) {
    return (
      <EmptyView
        icon="wifi-off"
        title="Failed to load fees"
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
        <Text style={s.headerTitle}>Fee Management</Text>
      </View>

      {/* Stats Card */}
      <LinearGradient
        colors={['#4f46e5', '#6366f1', '#818cf8']}
        style={s.statsCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={s.statsHeader}>
          <Feather name="credit-card" size={20} color="rgba(255,255,255,0.7)" />
          <Text style={s.statsTitle}>Fee Summary</Text>
        </View>

        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Total Fees</Text>
          <Text style={s.totalAmount}>{formatMoney(stats.totalFees)}</Text>
        </View>

        <View style={s.statsGrid}>
          <View style={s.statBox}>
            <View style={[s.statIndicator, { backgroundColor: '#10b981' }]} />
            <Text style={s.statLabel}>Paid</Text>
            <Text style={s.statValue}>{formatMoney(stats.paidAmount)}</Text>
          </View>

          <View style={s.statBox}>
            <View style={[s.statIndicator, { backgroundColor: '#f59e0b' }]} />
            <Text style={s.statLabel}>Pending</Text>
            <Text style={s.statValue}>{formatMoney(stats.pendingAmount)}</Text>
          </View>

          {stats.overdueAmount > 0 && (
            <View style={s.statBox}>
              <View style={[s.statIndicator, { backgroundColor: '#ef4444' }]} />
              <Text style={s.statLabel}>Overdue</Text>
              <Text style={s.statValue}>{formatMoney(stats.overdueAmount)}</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <FlatList
        data={FEE_TYPES}
        horizontal
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterList}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setFilter(item);
            }}
            style={[s.filterChip, filter === item && { backgroundColor: colors.primary }]}
          >
            <Text
              style={[
                s.filterChipText,
                { color: filter === item ? '#fff' : colors.mutedForeground },
              ]}
            >
              {item}
            </Text>
          </Pressable>
        )}
      />

      {/* Fee Records List */}
      <Text style={s.sectionTitle}>
        {filtered.length} fee record{filtered.length !== 1 ? 's' : ''}
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={renderFeeCard}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <EmptyView
            icon="file-text"
            title="No fee records"
            description="Fee records will appear here"
          />
        }
      />

      {/* Payment Modal */}
      <Modal
        visible={paymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setPaymentModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { backgroundColor: colors.card }]}>
            <View style={s.modalHeader}>
              <View style={[s.modalIcon, { backgroundColor: colors.primary + '20' }]}>
                <Feather name="credit-card" size={24} color={colors.primary} />
              </View>
              <Text style={s.modalTitle}>Process Payment</Text>
              <Text style={s.modalSubtitle}>
                {selectedFee?.feeType} - {selectedFee?.className}
              </Text>
            </View>

            <View style={s.modalBody}>
              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>Amount to Pay</Text>
                <View style={s.inputWrapper}>
                  <Text style={s.currencySymbol}>₹</Text>
                  <TextInput
                    style={s.input}
                    value={paymentAmount}
                    onChangeText={setPaymentAmount}
                    placeholder="0.00"
                    keyboardType="numeric"
                    placeholderTextColor={colors.mutedForeground}
                  />
                </View>
                <Text style={s.inputHint}>
                  Total: {selectedFee ? formatMoney(selectedFee.amount) : ''}
                </Text>
              </View>
            </View>

            <View style={s.modalActions}>
              <Pressable
                style={[s.modalButton, { backgroundColor: colors.muted }]}
                onPress={() => {
                  setPaymentModal(false);
                  setSelectedFee(null);
                  setPaymentAmount('');
                }}
              >
                <Text style={[s.modalButtonText, { color: colors.foreground }]}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[
                  s.modalButton,
                  { backgroundColor: colors.primary },
                  processing && { opacity: 0.6 },
                ]}
                onPress={processPayment}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Feather name="check" size={18} color="#fff" />
                    <Text style={[s.modalButtonText, { color: '#fff' }]}>Pay</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
      alignItems: 'center',
      gap: 8,
    },
    statsTitle: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.8)',
      fontWeight: '600',
    },
    totalRow: {
      gap: 4,
    },
    totalLabel: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.7)',
      fontWeight: '500',
    },
    totalAmount: {
      fontSize: 36,
      fontWeight: '800',
      color: '#fff',
      letterSpacing: -1,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    statBox: {
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.15)',
      padding: 12,
      borderRadius: 12,
      gap: 6,
    },
    statIndicator: {
      width: 24,
      height: 4,
      borderRadius: 2,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.7)',
      fontWeight: '500',
    },
    statValue: {
      fontSize: 16,
      fontWeight: '800',
      color: '#fff',
    },

    // Filters
    filterList: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.muted,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipText: {
      fontSize: 13,
      fontWeight: '600',
    },

    // Fee Records
    sectionTitle: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontWeight: '600',
      paddingHorizontal: 16,
      marginBottom: 4,
    },
    list: {
      padding: 16,
      paddingTop: 8,
      gap: 12,
      paddingBottom: 120,
    },
    feeCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
    },
    feeHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    feeLeft: {
      flex: 1,
      gap: 6,
    },
    feeTypeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    feeIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    feeType: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.foreground,
    },
    feeClass: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontWeight: '500',
    },
    studentName: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontWeight: '500',
      marginLeft: 50,
    },
    feeRight: {
      alignItems: 'flex-end',
      gap: 6,
    },
    feeAmount: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.foreground,
    },
    feeDetails: {
      gap: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    detailRow: {
      flexDirection: 'row',
      gap: 16,
      flexWrap: 'wrap',
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    detailText: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontWeight: '500',
    },
    partialRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 6,
      paddingHorizontal: 10,
      backgroundColor: colors.muted,
      borderRadius: 8,
    },
    partialText: {
      fontSize: 12,
      color: colors.foreground,
      fontWeight: '600',
    },
    balanceText: {
      fontSize: 12,
      color: '#ef4444',
      fontWeight: '700',
    },
    payButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 4,
    },
    payButtonText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#fff',
    },

    // Payment Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      padding: 20,
    },
    modalContent: {
      borderRadius: 20,
      padding: 24,
      gap: 20,
    },
    modalHeader: {
      alignItems: 'center',
      gap: 8,
    },
    modalIcon: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.foreground,
    },
    modalSubtitle: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontWeight: '500',
    },
    modalBody: {
      gap: 16,
    },
    inputGroup: {
      gap: 8,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.foreground,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      backgroundColor: colors.muted,
    },
    currencySymbol: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.foreground,
      marginRight: 4,
    },
    input: {
      flex: 1,
      fontSize: 24,
      fontWeight: '700',
      color: colors.foreground,
      paddingVertical: 12,
    },
    inputHint: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontWeight: '500',
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 12,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: '700',
    },
  });
