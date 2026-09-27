import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar } from 'lucide-react-native';
import type { AppDispatch, RootState } from '@/state/store';
import { fetchClassesForDropdown } from '@/state/academicModuleSlice';
import FadeInView from '@/components/FadeInView';
import AnimatedButton from '@/components/AnimatedButton';

const PALETTE = ['#fb542d', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e'];

export default function StudentTimetable() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { dropdownData, loading } = useSelector((state: RootState) => state.academicModule);
  const classes = dropdownData.classes || [];

  const [selectedClass, setSelectedClass] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchClassesForDropdown());
  }, [dispatch]);

  const handleClassSelect = (classItem: any) => {
    setSelectedClass(classItem);
    router.push(`/academics/${classItem._id}` as any);
  };

  return (
    <View style={styles.page}>
      <LinearGradient colors={['#4f46e5', '#7c3aed', '#c026d3']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <AnimatedButton style={styles.back} onPress={() => router.back()}>
          <ArrowLeft size={17} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </AnimatedButton>
        <Text style={styles.title}>Student Time Table</Text>
        <Text style={styles.subtitle}>Academic module</Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#7c3aed" size="large" />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <FadeInView style={styles.card}>
            <View style={styles.cardHeader}>
              <Calendar size={18} color="#7c3aed" />
              <Text style={styles.cardTitle}>Select Class</Text>
            </View>

            <View style={styles.classGrid}>
              {classes.length > 0 ? (
                classes.map((classItem, index) => {
                  const color = PALETTE[index % PALETTE.length];
                  return (
                    <FadeInView key={classItem._id} delay={index * 55}>
                      <AnimatedButton
                        style={[styles.classButton, { backgroundColor: color, shadowColor: color }]}
                        onPress={() => handleClassSelect(classItem)}
                      >
                        <Text style={styles.classButtonText}>{classItem.class_text}</Text>
                      </AnimatedButton>
                    </FadeInView>
                  );
                })
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No classes available</Text>
                </View>
              )}
            </View>
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
    letterSpacing: 0.2,
  },
  subtitle: {
    color: '#e9defe',
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
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 12,
  },
  cardTitle: {
    color: '#3b3f5c',
    fontWeight: '800',
    fontSize: 12.5,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  classGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 11,
  },
  classButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 112,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 4,
  },
  classButtonText: {
    color: '#fff',
    fontSize: 12.5,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 45,
  },
  emptyText: {
    color: '#a0aec0',
    fontSize: 12.5,
  },
});