import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  Pressable, Platform, Modal, TextInput, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/Toast';
import { fetchDataFromApi, postData } from '@/utils/api';
import { StatusBadge } from '@/components/StatusBadge';
import { LoadingView } from '@/components/LoadingView';
import { EmptyView } from '@/components/EmptyView';
import Breadcrumb from '@/components/Breadcrumb';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  subject: string;
  subjectCode?: string;
  className?: string;
  teacher: string;
  teacherId?: string;
  assignedDate: string;
  dueDate: string;
  maxMarks?: number;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'OVERDUE';
  submissionDate?: string;
  marksObtained?: number;
  feedback?: string;
  attachments?: Array<{ name: string; url: string }>;
  submissionFile?: string;
}

const STATUS_FILTERS = ['All', 'Pending', 'Submitted', 'Graded', 'Overdue'];

export default function HomeworkScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  const toast = useToast();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [submitModal, setSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const s = styles(colors);
  const topPad = (Platform.OS === 'web' ? 12 : insets.top) + 8;

  const userRole = userData?.role ?? '';
  const isStudent = userRole === 'STUDENT';

  // Fetch assignments
  const { data, refetch, isLoading, isError } = useQuery({
    queryKey: ['assignments', userRole],
    queryFn: () => {
      const endpoint = isStudent
        ? '/api/student/homework'
        : '/api/teacher/homework';
      return fetchDataFromApi(endpoint);
    },
  });

  const assignments: Assignment[] = data?.assignments ?? data?.data ?? [];

  const filtered = assignments.filter((assignment) => {
    if (filter === 'All') return true;
    return assignment.status.toLowerCase() === filter.toLowerCase();
  });

  const stats = {
    total: assignments.length,
    pending: assignments.filter((a) => a.status === 'PENDING').length,
    submitted: assignments.filter((a) => a.status === 'SUBMITTED').length,
    graded: assignments.filter((a) => a.status === 'GRADED').length,
    overdue: assignments.filter((a) => a.status === 'OVERDUE').length,
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const openSubmitModal = (assignment: Assignment) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAssignment(assignment);
    setSubmissionText('');
    setSubmitModal(true);
  };

  const submitAssignment = async () => {
    if (!selectedAssignment) return;

    if (!submissionText.trim()) {
      toast.show('Please enter your submission', 'error');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSubmitting(true);

    const res = await postData(`/api/student/homework/${selectedAssignment._id}/submit`, {
      submissionText,
      submissionDate: new Date().toISOString(),
    });

    setSubmitting(false);

    if (res?.success || res?.data?.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.show('Assignment submitted successfully!', 'success');
      setSubmitModal(false);
      setSelectedAssignment(null);
      setSubmissionText('');
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    } else {
      toast.show(res?.message || 'Submission failed', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#f59e0b';
      case 'SUBMITTED': return '#3b82f6';
      case 'GRADED': return '#10b981';
      case 'OVERDUE': return '#ef4444';
      default: return colors.mutedForeground;
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return { text: 'Overdue', color: '#ef4444' };
    if (days === 0) return { text: 'Due today', color: '#f59e0b' };
    if (days === 1) return { text: '1 day left', color: '#f59e0b' };
    if (days <= 3) return { text: `${days} days left`, color: '#f59e0b' };
    return { text: `${days} days left`, color: colors.mutedForeground };
  };

  const renderAssignmentCard = ({ item }: { item: Assignment }) => {
    const statusColor = getStatusColor(item.status);
    const daysInfo = getDaysRemaining(item.dueDate);
    const isPending = item.status === 'PENDING' || item.status === 'OVERDUE';

    return (
      <View style={s.assignmentCard}>
        <View style={s.cardHeader}>
          <View style={s.subjectBadge}>
            <Text style={s.subjectText}>{item.subject}</Text>
          </View>
          <StatusBadge status={item.status} small />
        </View>

        <Text style={s.assignmentTitle}>{item.title}</Text>
        <Text style={s.assignmentDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={s.metaGrid}>
          <View style={s.metaItem}>
            <Feather name="user" size={12} color={colors.mutedForeground} />
            <Text style={s.metaText}>{item.teacher}</Text>
          </View>
          {item.className && (
            <View style={s.metaItem}>
              <Feather name="users" size={12} color={colors.mutedForeground} />
              <Text style={s.metaText}>{item.className}</Text>
            </View>
          )}
          <View style={s.metaItem}>
            <Feather name="calendar" size={12} color={colors.mutedForeground} />
            <Text style={s.metaText}>Due: {formatDate(item.dueDate)}</Text>
          </View>
          {item.maxMarks && (
            <View style={s.metaItem}>
              <Feather name="award" size={12} color={colors.mutedForeground} />
              <Text style={s.metaText}>Max: {item.maxMarks} marks</Text>
            </View>
          )}
        </View>

        <View style={s.cardFooter}>
          <View style={[s.dueBadge, { backgroundColor: daysInfo.color + '15' }]}>
            <Feather name="clock" size={12} color={daysInfo.color} />
            <Text style={[s.dueText, { color: daysInfo.color }]}>{daysInfo.text}</Text>
          </View>

          {item.attachments && item.attachments.length > 0 && (
            <View style={s.attachmentBadge}>
              <Feather name="paperclip" size={12} color={colors.primary} />
              <Text style={s.attachmentCount}>{item.attachments.length}</Text>
            </View>
          )}
        </View>

        {item.status === 'GRADED' && item.marksObtained !== undefined && (
          <View style={s.gradeSection}>
            <View style={s.marksRow}>
              <Text style={s.marksLabel}>Marks Obtained:</Text>
              <Text style={s.marksValue}>
                {item.marksObtained} / {item.maxMarks}
              </Text>
            </View>
            {item.feedback && (
              <View style={s.feedbackBox}>
                <Text style={s.feedbackLabel}>Feedback:</Text>
                <Text style={s.feedbackText}>{item.feedback}</Text>
              </View>
            )}
          </View>
        )}

        {item.status === 'SUBMITTED' && item.submissionDate && (
          <View style={s.submittedInfo}>
            <Feather name="check-circle" size={14} color="#10b981" />
            <Text style={s.submittedText}>Submitted on {formatDate(item.submissionDate)}</Text>
          </View>
        )}

        {isPending && isStudent && (
          <Pressable
            style={[s.submitButton, { backgroundColor: colors.primary }]}
            onPress={() => openSubmitModal(item)}
          >
            <Feather name="upload" size={16} color="#fff" />
            <Text style={s.submitButtonText}>Submit Assignment</Text>
          </Pressable>
        )}
      </View>
    );
  };

  if (isLoading && assignments.length === 0) {
    return <LoadingView message="Loading homework..." />;
  }

  if (isError) {
    return (
      <EmptyView
        icon="wifi-off"
        title="Failed to load homework"
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
        <Text style={s.headerTitle}>Homework</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Stats Row */}
      <View style={s.statsRow}>
        <View style={s.statBox}>
          <Text style={s.statValue}>{stats.pending}</Text>
          <Text style={s.statLabel}>Pending</Text>
        </View>
        <View style={s.statBox}>
          <Text style={s.statValue}>{stats.submitted}</Text>
          <Text style={s.statLabel}>Submitted</Text>
        </View>
        <View style={s.statBox}>
          <Text style={s.statValue}>{stats.graded}</Text>
          <Text style={s.statLabel}>Graded</Text>
        </View>
        {stats.overdue > 0 && (
          <View style={[s.statBox, { borderColor: '#ef4444' }]}>
            <Text style={[s.statValue, { color: '#ef4444' }]}>{stats.overdue}</Text>
            <Text style={[s.statLabel, { color: '#ef4444' }]}>Overdue</Text>
          </View>
        )}
      </View>

      {/* Filter Tabs */}
      <FlatList
        data={STATUS_FILTERS}
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
                s.filterText,
                { color: filter === item ? '#fff' : colors.mutedForeground },
              ]}
            >
              {item}
            </Text>
          </Pressable>
        )}
      />

      {/* Assignments List */}
      <Text style={s.sectionTitle}>
        {filtered.length} assignment{filtered.length !== 1 ? 's' : ''}
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={renderAssignmentCard}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <EmptyView
            icon="file-text"
            title="No assignments"
            description={filter === 'All' ? 'No homework assigned yet' : `No ${filter.toLowerCase()} assignments`}
          />
        }
      />

      {/* Submit Modal */}
      <Modal
        visible={submitModal}
        transparent
        animationType="slide"
        onRequestClose={() => setSubmitModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { backgroundColor: colors.card }]}>
            <View style={s.modalHeader}>
              <View style={[s.modalIcon, { backgroundColor: colors.primary + '20' }]}>
                <Feather name="upload" size={24} color={colors.primary} />
              </View>
              <Text style={s.modalTitle}>Submit Assignment</Text>
              <Text style={s.modalSubtitle} numberOfLines={2}>
                {selectedAssignment?.title}
              </Text>
            </View>

            <View style={s.modalBody}>
              <Text style={s.inputLabel}>Your Submission</Text>
              <TextInput
                style={s.textArea}
                value={submissionText}
                onChangeText={setSubmissionText}
                placeholder="Write your answer or paste your submission link here..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
              <Text style={s.inputHint}>
                You can paste a link to your Google Drive, OneDrive, or GitHub file
              </Text>
            </View>

            <View style={s.modalActions}>
              <Pressable
                style={[s.modalButton, { backgroundColor: colors.muted }]}
                onPress={() => {
                  setSubmitModal(false);
                  setSelectedAssignment(null);
                  setSubmissionText('');
                }}
              >
                <Text style={[s.modalButtonText, { color: colors.foreground }]}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[
                  s.modalButton,
                  { backgroundColor: colors.primary },
                  submitting && { opacity: 0.6 },
                ]}
                onPress={submitAssignment}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Feather name="check" size={18} color="#fff" />
                    <Text style={[s.modalButtonText, { color: '#fff' }]}>Submit</Text>
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

    // Stats
    statsRow: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingBottom: 12,
      gap: 10,
    },
    statBox: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statValue: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.primary,
    },
    statLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.mutedForeground,
      marginTop: 2,
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

    // Assignments List
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
      paddingBottom: 32,
    },
    assignmentCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 10,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    subjectBadge: {
      backgroundColor: colors.primary + '15',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    subjectText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
    },
    assignmentTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.foreground,
      lineHeight: 24,
    },
    assignmentDescription: {
      fontSize: 14,
      color: colors.mutedForeground,
      lineHeight: 20,
    },
    metaGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginTop: 4,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontWeight: '500',
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 4,
    },
    dueBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
    },
    dueText: {
      fontSize: 12,
      fontWeight: '700',
    },
    attachmentBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    attachmentCount: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
    },
    gradeSection: {
      marginTop: 8,
      padding: 12,
      backgroundColor: colors.muted,
      borderRadius: 12,
      gap: 8,
    },
    marksRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    marksLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.foreground,
    },
    marksValue: {
      fontSize: 18,
      fontWeight: '800',
      color: '#10b981',
    },
    feedbackBox: {
      gap: 4,
    },
    feedbackLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.mutedForeground,
    },
    feedbackText: {
      fontSize: 13,
      color: colors.foreground,
      lineHeight: 18,
    },
    submittedInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 4,
      padding: 10,
      backgroundColor: '#10b981' + '15',
      borderRadius: 10,
    },
    submittedText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#10b981',
    },
    submitButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 4,
    },
    submitButtonText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#fff',
    },

    // Submit Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: Platform.OS === 'ios' ? 40 : 24,
      gap: 20,
      maxHeight: '85%',
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
      textAlign: 'center',
    },
    modalBody: {
      gap: 8,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.foreground,
    },
    textArea: {
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      fontSize: 14,
      color: colors.foreground,
      backgroundColor: colors.muted,
      minHeight: 140,
    },
    inputHint: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontStyle: 'italic',
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
