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
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { fetchDataFromApi } from '@/utils/api';
import { LoadingView } from '@/components/LoadingView';
import { EmptyView } from '@/components/EmptyView';
import Breadcrumb from '@/components/Breadcrumb';

interface ExamResult {
  _id: string;
  examName: string;
  examType: 'UNIT_TEST' | 'MIDTERM' | 'FINAL' | 'PRACTICAL' | 'ASSIGNMENT';
  subject: string;
  subjectCode?: string;
  className?: string;
  studentName?: string;
  maxMarks: number;
  marksObtained: number;
  grade?: string;
  percentage: number;
  rank?: number;
  totalStudents?: number;
  examDate: string;
  publishedDate?: string;
  remarks?: string;
  isPassed: boolean;
}

interface ExamStats {
  totalExams: number;
  avgPercentage: number;
  highestPercentage: number;
  lowestPercentage: number;
  passed: number;
  failed: number;
}

const EXAM_TYPES = ['All', 'Unit Test', 'Midterm', 'Final', 'Practical', 'Assignment'];

export default function ExamsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userData } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [selectedExam, setSelectedExam] = useState<ExamResult | null>(null);
  const [detailModal, setDetailModal] = useState(false);

  const s = styles(colors);
  const topPad = (Platform.OS === 'web' ? 12 : insets.top) + 8;

  const userRole = userData?.role ?? '';
  const isStudent = userRole === 'STUDENT';

  // Fetch exam results
  const { data, refetch, isLoading, isError } = useQuery({
    queryKey: ['exam-results', userRole],
    queryFn: () => {
      const endpoint = isStudent
        ? '/api/student/exams/results'
        : '/api/teacher/exams/results';
      return fetchDataFromApi(endpoint);
    },
  });

  const examResults: ExamResult[] = data?.results ?? data?.data ?? [];
  const stats: ExamStats = data?.stats ?? {
    totalExams: 0,
    avgPercentage: 0,
    highestPercentage: 0,
    lowestPercentage: 0,
    passed: 0,
    failed: 0,
  };

  const filtered = examResults.filter((exam) => {
    if (filter === 'All') return true;
    const filterKey = filter.toUpperCase().replace(/ /g, '_');
    return exam.examType === filterKey;
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const openExamDetail = (exam: ExamResult) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedExam(exam);
    setDetailModal(true);
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return '#10b981'; // A+
    if (percentage >= 80) return '#22c55e'; // A
    if (percentage >= 70) return '#3b82f6'; // B
    if (percentage >= 60) return '#f59e0b'; // C
    if (percentage >= 50) return '#f97316'; // D
    return '#ef4444'; // F
  };

  const getGradeLabel = (percentage: number) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case 'UNIT_TEST': return '#3b82f6';
      case 'MIDTERM': return '#8b5cf6';
      case 'FINAL': return '#ef4444';
      case 'PRACTICAL': return '#10b981';
      case 'ASSIGNMENT': return '#f59e0b';
      default: return colors.primary;
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderExamCard = ({ item }: { item: ExamResult }) => {
    const gradeColor = getGradeColor(item.percentage);
    const gradeLabel = item.grade || getGradeLabel(item.percentage);
    const typeColor = getExamTypeColor(item.examType);

    return (
      <Pressable onPress={() => openExamDetail(item)} style={s.examCard}>
        <View style={s.examHeader}>
          <View style={s.examLeft}>
            <View style={[s.gradeCircle, { borderColor: gradeColor }]}>
              <Text style={[s.gradeText, { color: gradeColor }]}>{gradeLabel}</Text>
            </View>
            <View style={s.examInfo}>
              <Text style={s.examName} numberOfLines={1}>
                {item.examName}
              </Text>
              <Text style={s.subjectName}>{item.subject}</Text>
            </View>
          </View>

          <View style={s.examRight}>
            <Text style={s.marksText}>
              {item.marksObtained}/{item.maxMarks}
            </Text>
            <Text style={[s.percentageText, { color: gradeColor }]}>
              {item.percentage.toFixed(1)}%
            </Text>
          </View>
        </View>

        <View style={s.examMeta}>
          <View style={[s.typeChip, { backgroundColor: typeColor + '15' }]}>
            <Text style={[s.typeText, { color: typeColor }]}>
              {item.examType.replace(/_/g, ' ')}
            </Text>
          </View>

          <View style={s.metaRow}>
            <Feather name="calendar" size={11} color={colors.mutedForeground} />
            <Text style={s.metaText}>{formatDate(item.examDate)}</Text>
          </View>

          {item.rank && item.totalStudents && (
            <View style={s.rankBadge}>
              <Feather name="award" size={11} color={colors.primary} />
              <Text style={s.rankText}>
                Rank {item.rank}/{item.totalStudents}
              </Text>
            </View>
          )}
        </View>

        {!item.isPassed && (
          <View style={s.failedBadge}>
            <Feather name="alert-circle" size={12} color="#ef4444" />
            <Text style={s.failedText}>Failed</Text>
          </View>
        )}
      </Pressable>
    );
  };

  if (isLoading && examResults.length === 0) {
    return <LoadingView message="Loading exam results..." />;
  }

  if (isError) {
    return (
      <EmptyView
        icon="wifi-off"
        title="Failed to load results"
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
        <Text style={s.headerTitle}>Exam Results</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Performance Card */}
      <LinearGradient
        colors={['#4f46e5', '#6366f1', '#818cf8']}
        style={s.statsCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={s.statsHeader}>
          <Feather name="trending-up" size={20} color="rgba(255,255,255,0.8)" />
          <Text style={s.statsTitle}>Overall Performance</Text>
        </View>

        <View style={s.avgRow}>
          <Text style={s.avgValue}>{stats.avgPercentage.toFixed(1)}%</Text>
          <Text style={s.avgLabel}>Average Score</Text>
        </View>

        <View style={s.statsGrid}>
          <View style={s.statItem}>
            <View style={[s.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.25)' }]}>
              <Feather name="trending-up" size={16} color="#10b981" />
            </View>
            <Text style={s.statValue}>{stats.highestPercentage.toFixed(0)}%</Text>
            <Text style={s.statLabel}>Highest</Text>
          </View>

          <View style={s.statItem}>
            <View style={[s.statIcon, { backgroundColor: 'rgba(239, 68, 68, 0.25)' }]}>
              <Feather name="trending-down" size={16} color="#ef4444" />
            </View>
            <Text style={s.statValue}>{stats.lowestPercentage.toFixed(0)}%</Text>
            <Text style={s.statLabel}>Lowest</Text>
          </View>

          <View style={s.statItem}>
            <View style={[s.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.25)' }]}>
              <Feather name="check-circle" size={16} color="#3b82f6" />
            </View>
            <Text style={s.statValue}>{stats.passed}</Text>
            <Text style={s.statLabel}>Passed</Text>
          </View>

          {stats.failed > 0 && (
            <View style={s.statItem}>
              <View style={[s.statIcon, { backgroundColor: 'rgba(239, 68, 68, 0.25)' }]}>
                <Feather name="x-circle" size={16} color="#ef4444" />
              </View>
              <Text style={s.statValue}>{stats.failed}</Text>
              <Text style={s.statLabel}>Failed</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterList}
      >
        {EXAM_TYPES.map((type) => {
          const isActive = filter === type;
          return (
            <Pressable
              key={type}
              onPress={() => {
                Haptics.selectionAsync();
                setFilter(type);
              }}
              style={[s.filterChip, isActive && { backgroundColor: colors.primary }]}
            >
              <Text style={[s.filterText, { color: isActive ? '#fff' : colors.mutedForeground }]}>
                {type}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Results List */}
      <Text style={s.sectionTitle}>
        {filtered.length} result{filtered.length !== 1 ? 's' : ''}
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={renderExamCard}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <EmptyView
            icon="file-text"
            title="No exam results"
            description={filter === 'All' ? 'No results available yet' : `No ${filter} results`}
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

          {selectedExam && (
            <ScrollView style={s.modalContent} showsVerticalScrollIndicator={false}>
              <View style={s.detailHeader}>
                <View
                  style={[
                    s.detailGradeCircle,
                    { borderColor: getGradeColor(selectedExam.percentage) },
                  ]}
                >
                  <Text
                    style={[
                      s.detailGradeText,
                      { color: getGradeColor(selectedExam.percentage) },
                    ]}
                  >
                    {selectedExam.grade || getGradeLabel(selectedExam.percentage)}
                  </Text>
                </View>

                <Text style={s.detailPercentage}>
                  {selectedExam.percentage.toFixed(1)}%
                </Text>

                <View
                  style={[
                    s.detailStatusBadge,
                    {
                      backgroundColor: selectedExam.isPassed ? '#10b981' + '15' : '#ef4444' + '15',
                    },
                  ]}
                >
                  <Feather
                    name={selectedExam.isPassed ? 'check-circle' : 'x-circle'}
                    size={14}
                    color={selectedExam.isPassed ? '#10b981' : '#ef4444'}
                  />
                  <Text
                    style={[
                      s.detailStatusText,
                      { color: selectedExam.isPassed ? '#10b981' : '#ef4444' },
                    ]}
                  >
                    {selectedExam.isPassed ? 'Passed' : 'Failed'}
                  </Text>
                </View>
              </View>

              <Text style={s.detailExamName}>{selectedExam.examName}</Text>

              <View style={s.detailInfoCard}>
                <View style={s.detailInfoRow}>
                  <Text style={s.detailInfoLabel}>Subject</Text>
                  <Text style={s.detailInfoValue}>{selectedExam.subject}</Text>
                </View>
                {selectedExam.subjectCode && (
                  <View style={s.detailInfoRow}>
                    <Text style={s.detailInfoLabel}>Subject Code</Text>
                    <Text style={s.detailInfoValue}>{selectedExam.subjectCode}</Text>
                  </View>
                )}
                {selectedExam.className && (
                  <View style={s.detailInfoRow}>
                    <Text style={s.detailInfoLabel}>Class</Text>
                    <Text style={s.detailInfoValue}>{selectedExam.className}</Text>
                  </View>
                )}
                <View style={s.detailInfoRow}>
                  <Text style={s.detailInfoLabel}>Exam Type</Text>
                  <Text style={s.detailInfoValue}>
                    {selectedExam.examType.replace(/_/g, ' ')}
                  </Text>
                </View>
              </View>

              <View style={s.marksCard}>
                <Text style={s.marksCardTitle}>Score Breakdown</Text>
                <View style={s.marksBreakdown}>
                  <View style={s.marksItem}>
                    <Text style={s.marksItemLabel}>Marks Obtained</Text>
                    <Text style={[s.marksItemValue, { color: getGradeColor(selectedExam.percentage) }]}>
                      {selectedExam.marksObtained}
                    </Text>
                  </View>
                  <View style={s.marksDivider} />
                  <View style={s.marksItem}>
                    <Text style={s.marksItemLabel}>Maximum Marks</Text>
                    <Text style={s.marksItemValue}>{selectedExam.maxMarks}</Text>
                  </View>
                  <View style={s.marksDivider} />
                  <View style={s.marksItem}>
                    <Text style={s.marksItemLabel}>Percentage</Text>
                    <Text style={[s.marksItemValue, { color: getGradeColor(selectedExam.percentage) }]}>
                      {selectedExam.percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </View>

              {selectedExam.rank && selectedExam.totalStudents && (
                <View style={s.rankCard}>
                  <Feather name="award" size={24} color={colors.primary} />
                  <View style={s.rankInfo}>
                    <Text style={s.rankLabel}>Your Rank</Text>
                    <Text style={s.rankValue}>
                      {selectedExam.rank} out of {selectedExam.totalStudents}
                    </Text>
                  </View>
                </View>
              )}

              <View style={s.dateSection}>
                <View style={s.dateRow}>
                  <Feather name="calendar" size={16} color={colors.mutedForeground} />
                  <Text style={s.dateLabel}>Exam Date:</Text>
                  <Text style={s.dateValue}>{formatDate(selectedExam.examDate)}</Text>
                </View>
                {selectedExam.publishedDate && (
                  <View style={s.dateRow}>
                    <Feather name="eye" size={16} color={colors.mutedForeground} />
                    <Text style={s.dateLabel}>Published:</Text>
                    <Text style={s.dateValue}>{formatDate(selectedExam.publishedDate)}</Text>
                  </View>
                )}
              </View>

              {selectedExam.remarks && (
                <View style={s.remarksSection}>
                  <Text style={s.remarksTitle}>Teacher's Remarks</Text>
                  <View style={s.remarksBox}>
                    <Text style={s.remarksText}>{selectedExam.remarks}</Text>
                  </View>
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
    avgRow: {
      alignItems: 'center',
      gap: 4,
    },
    avgValue: {
      fontSize: 48,
      fontWeight: '800',
      color: '#fff',
      letterSpacing: -2,
    },
    avgLabel: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.7)',
      fontWeight: '500',
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 12,
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
      fontSize: 18,
      fontWeight: '800',
      color: '#fff',
    },
    statLabel: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.7)',
      fontWeight: '500',
    },

    // Filters
    filterList: {
      paddingHorizontal: 16,
      paddingVertical: 16,
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

    // Results List
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
    examCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 10,
    },
    examHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    examLeft: {
      flexDirection: 'row',
      gap: 12,
      flex: 1,
    },
    gradeCircle: {
      width: 50,
      height: 50,
      borderRadius: 25,
      borderWidth: 3,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    gradeText: {
      fontSize: 20,
      fontWeight: '800',
    },
    examInfo: {
      flex: 1,
      gap: 2,
      justifyContent: 'center',
    },
    examName: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.foreground,
    },
    subjectName: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.mutedForeground,
    },
    examRight: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: 2,
    },
    marksText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.foreground,
    },
    percentageText: {
      fontSize: 14,
      fontWeight: '800',
    },
    examMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap',
    },
    typeChip: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    typeText: {
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
    metaText: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontWeight: '500',
    },
    rankBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      backgroundColor: colors.primary + '15',
      borderRadius: 8,
    },
    rankText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
    },
    failedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#ef4444' + '15',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      alignSelf: 'flex-start',
    },
    failedText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#ef4444',
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
    detailGradeCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    detailGradeText: {
      fontSize: 32,
      fontWeight: '800',
    },
    detailPercentage: {
      fontSize: 40,
      fontWeight: '800',
      color: colors.foreground,
      letterSpacing: -1,
    },
    detailStatusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    detailStatusText: {
      fontSize: 14,
      fontWeight: '700',
    },
    detailExamName: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.foreground,
      textAlign: 'center',
      marginBottom: 20,
    },
    detailInfoCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      gap: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    detailInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    detailInfoLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.mutedForeground,
    },
    detailInfoValue: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.foreground,
    },
    marksCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    marksCardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.foreground,
      marginBottom: 12,
    },
    marksBreakdown: {
      flexDirection: 'row',
      gap: 12,
    },
    marksItem: {
      flex: 1,
      alignItems: 'center',
      gap: 6,
    },
    marksItemLabel: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.mutedForeground,
      textAlign: 'center',
    },
    marksItemValue: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.foreground,
    },
    marksDivider: {
      width: 1,
      backgroundColor: colors.border,
    },
    rankCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      backgroundColor: colors.primary + '10',
      padding: 16,
      borderRadius: 16,
      marginBottom: 16,
    },
    rankInfo: {
      flex: 1,
    },
    rankLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.mutedForeground,
    },
    rankValue: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.primary,
    },
    dateSection: {
      gap: 10,
      marginBottom: 16,
    },
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    dateLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.mutedForeground,
    },
    dateValue: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.foreground,
    },
    remarksSection: {
      marginBottom: 32,
    },
    remarksTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.foreground,
      marginBottom: 10,
    },
    remarksBox: {
      backgroundColor: colors.muted,
      padding: 14,
      borderRadius: 12,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    remarksText: {
      fontSize: 14,
      color: colors.foreground,
      lineHeight: 20,
    },
  });
