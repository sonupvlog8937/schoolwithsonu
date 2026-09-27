import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  Pressable, Platform, ScrollView, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { fetchDataFromApi } from '@/utils/api';
import { LoadingView } from '@/components/LoadingView';
import { EmptyView } from '@/components/EmptyView';
import Breadcrumb from '@/components/Breadcrumb';

interface Notice {
  _id: string;
  title: string;
  description: string;
  content?: string;
  category: 'GENERAL' | 'URGENT' | 'EVENT' | 'EXAM' | 'HOLIDAY' | 'ACADEMIC';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  targetAudience: string[];
  publishedDate: string;
  expiryDate?: string;
  attachments?: Array<{ name: string; url: string }>;
  postedBy?: { name?: string; role?: string };
  isRead?: boolean;
  createdAt?: string;
}

const CATEGORIES = ['All', 'General', 'Urgent', 'Event', 'Exam', 'Holiday', 'Academic'];

export default function NoticesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userData } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [detailModal, setDetailModal] = useState(false);

  const s = styles(colors);
  const topPad = (Platform.OS === 'web' ? 12 : insets.top) + 8;

  const userRole = userData?.role ?? '';

  // Fetch notices
  const { data, refetch, isLoading, isError } = useQuery({
    queryKey: ['notices', userRole],
    queryFn: () => {
      const endpoint = '/api/notices';
      return fetchDataFromApi(endpoint);
    },
  });

  const notices: Notice[] = data?.notices ?? data?.data ?? [];

  const filtered = notices.filter((notice) => {
    if (filter === 'All') return true;
    return notice.category.toLowerCase() === filter.toLowerCase();
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const openNoticeDetail = (notice: Notice) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedNotice(notice);
    setDetailModal(true);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'URGENT': return '#ef4444';
      case 'EVENT': return '#8b5cf6';
      case 'EXAM': return '#f59e0b';
      case 'HOLIDAY': return '#10b981';
      case 'ACADEMIC': return '#3b82f6';
      default: return colors.mutedForeground;
    }
  };

  const getCategoryIcon = (category: string): React.ComponentProps<typeof Feather>['name'] => {
    switch (category) {
      case 'URGENT': return 'alert-circle';
      case 'EVENT': return 'calendar';
      case 'EXAM': return 'file-text';
      case 'HOLIDAY': return 'sun';
      case 'ACADEMIC': return 'book';
      default: return 'bell';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH': return { color: '#ef4444', label: 'High Priority' };
      case 'MEDIUM': return { color: '#f59e0b', label: 'Medium' };
      case 'LOW': return { color: '#10b981', label: 'Low' };
      default: return { color: colors.mutedForeground, label: priority };
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderNoticeCard = ({ item }: { item: Notice }) => {
    const categoryColor = getCategoryColor(item.category);
    const categoryIcon = getCategoryIcon(item.category);
    const priorityInfo = getPriorityBadge(item.priority);
    const isUnread = !item.isRead;

    return (
      <Pressable
        onPress={() => openNoticeDetail(item)}
        style={[s.noticeCard, isUnread && s.unreadCard]}
      >
        {isUnread && <View style={s.unreadIndicator} />}
        
        <View style={s.noticeHeader}>
          <View style={[s.categoryIcon, { backgroundColor: categoryColor + '20' }]}>
            <Feather name={categoryIcon} size={20} color={categoryColor} />
          </View>
          
          <View style={s.noticeInfo}>
            <View style={s.titleRow}>
              <Text style={s.noticeTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {item.priority === 'HIGH' && (
                <View style={[s.priorityBadge, { backgroundColor: priorityInfo.color }]}>
                  <Feather name="alert-triangle" size={10} color="#fff" />
                </View>
              )}
            </View>
            
            <Text style={s.noticeDescription} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={s.noticeFooter}>
              <View style={s.categoryChip}>
                <Text style={[s.categoryText, { color: categoryColor }]}>
                  {item.category}
                </Text>
              </View>
              
              <View style={s.metaRow}>
                <Feather name="clock" size={11} color={colors.mutedForeground} />
                <Text style={s.dateText}>{formatDate(item.publishedDate)}</Text>
              </View>
            </View>

            {item.postedBy?.name && (
              <View style={s.postedByRow}>
                <Feather name="user" size={11} color={colors.mutedForeground} />
                <Text style={s.postedByText}>
                  {item.postedBy.name}
                  {item.postedBy.role && ` • ${item.postedBy.role}`}
                </Text>
              </View>
            )}
          </View>
        </View>

        {item.attachments && item.attachments.length > 0 && (
          <View style={s.attachmentRow}>
            <Feather name="paperclip" size={12} color={colors.primary} />
            <Text style={s.attachmentText}>
              {item.attachments.length} attachment{item.attachments.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  if (isLoading && notices.length === 0) {
    return <LoadingView message="Loading notices..." />;
  }

  if (isError) {
    return (
      <EmptyView
        icon="wifi-off"
        title="Failed to load notices"
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
        <Pressable onPress={() => router.back()} style={s.backButton}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={s.headerTitle}>Notice Board</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterList}
      >
        {CATEGORIES.map((cat) => {
          const isActive = filter === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => {
                Haptics.selectionAsync();
                setFilter(cat);
              }}
              style={[s.filterChip, isActive && { backgroundColor: colors.primary }]}
            >
              <Text style={[s.filterText, { color: isActive ? '#fff' : colors.mutedForeground }]}>
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Stats Row */}
      <View style={s.statsRow}>
        <View style={s.statBadge}>
          <Text style={s.statNumber}>{filtered.length}</Text>
          <Text style={s.statLabel}>Total</Text>
        </View>
        <View style={s.statBadge}>
          <Text style={s.statNumber}>
            {filtered.filter((n) => !n.isRead).length}
          </Text>
          <Text style={s.statLabel}>Unread</Text>
        </View>
        <View style={s.statBadge}>
          <Text style={s.statNumber}>
            {filtered.filter((n) => n.priority === 'HIGH').length}
          </Text>
          <Text style={s.statLabel}>High Priority</Text>
        </View>
      </View>

      {/* Notices List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={renderNoticeCard}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <EmptyView
            icon="bell"
            title="No notices"
            description={filter === 'All' ? 'No notices available' : `No ${filter.toLowerCase()} notices`}
          />
        }
      />

      {/* Detail Modal */}
      <Modal
        visible={detailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetailModal(false)}
      >
        <View style={[s.modalContainer, { backgroundColor: colors.background }]}>
          <View style={s.modalHeader}>
            <Pressable onPress={() => setDetailModal(false)} style={s.closeButton}>
              <Feather name="x" size={24} color={colors.foreground} />
            </Pressable>
          </View>

          {selectedNotice && (
            <ScrollView style={s.modalContent} showsVerticalScrollIndicator={false}>
              <View style={s.detailHeader}>
                <View
                  style={[
                    s.detailCategoryIcon,
                    { backgroundColor: getCategoryColor(selectedNotice.category) + '20' },
                  ]}
                >
                  <Feather
                    name={getCategoryIcon(selectedNotice.category)}
                    size={28}
                    color={getCategoryColor(selectedNotice.category)}
                  />
                </View>

                <View style={s.detailCategoryChip}>
                  <Text
                    style={[
                      s.detailCategoryText,
                      { color: getCategoryColor(selectedNotice.category) },
                    ]}
                  >
                    {selectedNotice.category}
                  </Text>
                </View>

                {selectedNotice.priority === 'HIGH' && (
                  <View style={[s.detailPriorityBadge, { backgroundColor: '#ef4444' }]}>
                    <Feather name="alert-triangle" size={12} color="#fff" />
                    <Text style={s.detailPriorityText}>High Priority</Text>
                  </View>
                )}
              </View>

              <Text style={s.detailTitle}>{selectedNotice.title}</Text>
              <Text style={s.detailDescription}>{selectedNotice.description}</Text>

              {selectedNotice.content && (
                <View style={s.contentSection}>
                  <Text style={s.contentText}>{selectedNotice.content}</Text>
                </View>
              )}

              <View style={s.detailMetaSection}>
                <View style={s.detailMetaRow}>
                  <Feather name="calendar" size={16} color={colors.mutedForeground} />
                  <Text style={s.detailMetaText}>
                    Published: {formatDate(selectedNotice.publishedDate)}
                  </Text>
                </View>

                {selectedNotice.expiryDate && (
                  <View style={s.detailMetaRow}>
                    <Feather name="clock" size={16} color={colors.mutedForeground} />
                    <Text style={s.detailMetaText}>
                      Expires: {formatDate(selectedNotice.expiryDate)}
                    </Text>
                  </View>
                )}

                {selectedNotice.postedBy?.name && (
                  <View style={s.detailMetaRow}>
                    <Feather name="user" size={16} color={colors.mutedForeground} />
                    <Text style={s.detailMetaText}>
                      Posted by: {selectedNotice.postedBy.name}
                      {selectedNotice.postedBy.role && ` (${selectedNotice.postedBy.role})`}
                    </Text>
                  </View>
                )}
              </View>

              {selectedNotice.attachments && selectedNotice.attachments.length > 0 && (
                <View style={s.attachmentsSection}>
                  <Text style={s.attachmentsSectionTitle}>Attachments</Text>
                  {selectedNotice.attachments.map((att, idx) => (
                    <Pressable key={idx} style={s.attachmentItem}>
                      <Feather name="file" size={18} color={colors.primary} />
                      <Text style={s.attachmentName} numberOfLines={1}>
                        {att.name}
                      </Text>
                      <Feather name="download" size={16} color={colors.primary} />
                    </Pressable>
                  ))}
                </View>
              )}
            </ScrollView>
          )}
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
    backButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.foreground,
      letterSpacing: -0.4,
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
    filterText: {
      fontSize: 13,
      fontWeight: '600',
    },

    // Stats
    statsRow: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingBottom: 12,
      gap: 10,
    },
    statBadge: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statNumber: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.primary,
    },
    statLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.mutedForeground,
      marginTop: 2,
    },

    // Notice Cards
    list: {
      padding: 16,
      paddingTop: 8,
      gap: 12,
      paddingBottom: 32,
    },
    noticeCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      position: 'relative',
    },
    unreadCard: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    unreadIndicator: {
      position: 'absolute',
      top: 14,
      right: 14,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
    },
    noticeHeader: {
      flexDirection: 'row',
      gap: 12,
    },
    categoryIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    noticeInfo: {
      flex: 1,
      gap: 6,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    noticeTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: '700',
      color: colors.foreground,
      lineHeight: 22,
    },
    priorityBadge: {
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noticeDescription: {
      fontSize: 13,
      color: colors.mutedForeground,
      lineHeight: 18,
    },
    noticeFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    categoryChip: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: colors.muted,
    },
    categoryText: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    dateText: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontWeight: '500',
    },
    postedByRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 2,
    },
    postedByText: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontStyle: 'italic',
    },
    attachmentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    attachmentText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '600',
    },

    // Detail Modal
    modalContainer: {
      flex: 1,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      padding: 16,
      paddingTop: Platform.OS === 'ios' ? 60 : 16,
    },
    closeButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      backgroundColor: colors.muted,
    },
    modalContent: {
      flex: 1,
      paddingHorizontal: 20,
    },
    detailHeader: {
      alignItems: 'center',
      gap: 12,
      marginBottom: 20,
    },
    detailCategoryIcon: {
      width: 64,
      height: 64,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    detailCategoryChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: colors.muted,
    },
    detailCategoryText: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    detailPriorityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
    },
    detailPriorityText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#fff',
    },
    detailTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.foreground,
      lineHeight: 32,
      marginBottom: 12,
    },
    detailDescription: {
      fontSize: 16,
      color: colors.mutedForeground,
      lineHeight: 24,
      marginBottom: 20,
    },
    contentSection: {
      backgroundColor: colors.muted,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    contentText: {
      fontSize: 14,
      color: colors.foreground,
      lineHeight: 22,
    },
    detailMetaSection: {
      gap: 12,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
      marginBottom: 20,
    },
    detailMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    detailMetaText: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontWeight: '500',
    },
    attachmentsSection: {
      gap: 10,
      marginBottom: 32,
    },
    attachmentsSectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.foreground,
      marginBottom: 6,
    },
    attachmentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.card,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    attachmentName: {
      flex: 1,
      fontSize: 14,
      color: colors.foreground,
      fontWeight: '500',
    },
  });
