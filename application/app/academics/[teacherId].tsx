import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Printer, Users } from 'lucide-react-native';
import type { AppDispatch, RootState } from '@/state/store';
import { fetchAcademicModule } from '@/state/academicModuleSlice';
import FadeInView from '@/components/FadeInView';
import AnimatedButton from '@/components/AnimatedButton';

const DAY_COLORS = ['#f97316', '#ec4899', '#8b5cf6', '#10b981', '#3b82f6', '#f43f5e'];

export default function TeacherTimetableView() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useLocalSearchParams();
  const teacherId = params.teacherId as string;

  const { modules, loading } = useSelector((state: RootState) => state.academicModule);
  const periods = modules['timing'] || [];

  const [teacherData, setTeacherData] = useState<any>(null);

  useEffect(() => {
    if (teacherId) {
      dispatch(fetchAcademicModule('timing'));
      setTeacherData({ name: `TEACHER-ID: ${teacherId}` });
    }
  }, [dispatch, teacherId]);

  const handleBack = () => router.back();
  const handlePrint = () => alert('Print functionality would be implemented here');

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  return (
    <View style={styles.page}>
      <LinearGradient colors={['#f97316', '#ec4899', '#8b5cf6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <AnimatedButton style={styles.back} onPress={handleBack}>
          <ArrowLeft size={17} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </AnimatedButton>
        <Text style={styles.title}>Teacher's Time Table</Text>
        <Text style={styles.subtitle}>Academic module</Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#ec4899" size="large" />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <FadeInView style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                Time Table ({teacherData?.name || 'SELECTED TEACHER'})
              </Text>
              <AnimatedButton style={styles.printButton} onPress={handlePrint}>
                <Printer size={14} color="#fff" />
                <Text style={styles.printButtonText}>Print</Text>
              </AnimatedButton>
            </View>

            {periods.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.tableContainer}>
                  <View style={styles.tableHeader}>
                    <View style={[styles.headerCell, styles.firstCell, { backgroundColor: '#3b3f5c' }]}>
                      <Text style={styles.headerText}>PERIOD</Text>
                    </View>
                    {days.map((day, i) => (
                      <View key={day} style={[styles.headerCell, { backgroundColor: DAY_COLORS[i % DAY_COLORS.length] }]}>
                        <Text style={styles.headerText}>{day.slice(0, 3)}</Text>
                      </View>
                    ))}
                  </View>

                  {periods.map((period, index) => (
                    <FadeInView key={period._id} delay={index * 60}>
                      <View style={styles.tableRow}>
                        <View style={[styles.rowCell, styles.firstCell, styles.periodCell]}>
                          <Text style={styles.periodText}>
                            {period.period || `Period ${index + 1}`}
                          </Text>
                        </View>
                        {days.map((_, dayIndex) => (
                          <View
                            key={dayIndex}
                            style={[
                              styles.rowCell,
                              { backgroundColor: `${DAY_COLORS[dayIndex % DAY_COLORS.length]}12` },
                            ]}
                          >
                            <Text style={styles.cellText}>-</Text>
                          </View>
                        ))}
                      </View>
                    </FadeInView>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <View style={styles.emptyContainer}>
                <Users size={44} color="#a0aec0" />
                <Text style={styles.emptyText}>No timetable data available</Text>
              </View>
            )}
          </FadeInView>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f4f5f9',
  },
  header: {
    padding: 22,
    paddingTop: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 18,
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '800',
  },
  subtitle: {
    color: '#fde8f3',
    fontSize: 10,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 15,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    color: '#3b3f5c',
    fontWeight: '800',
    fontSize: 12.5,
    flexShrink: 1,
    paddingRight: 8,
  },
  printButton: {
    backgroundColor: '#ec4899',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
  },
  printButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  tableContainer: {
    minWidth: 600,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
  },
  headerCell: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.25)',
  },
  firstCell: {
    width: 100,
  },
  headerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eef0f4',
  },
  rowCell: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#eef0f4',
  },
  periodCell: {
    backgroundColor: '#eef0f4',
  },
  periodText: {
    color: '#2d3748',
    fontSize: 11,
    fontWeight: '700',
  },
  cellText: {
    color: '#4a5568',
    fontSize: 11,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 45,
    gap: 8,
  },
  emptyText: {
    color: '#a0aec0',
    fontSize: 12.5,
  },
});