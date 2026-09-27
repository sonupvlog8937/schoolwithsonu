import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { ArrowLeft, UserCheck, Briefcase, Calendar, Check } from 'lucide-react-native';
import type { AppDispatch, RootState } from '@/state/store';
import { fetchAcademicModule } from '@/state/academicModuleSlice';
import FadeInView from '@/components/FadeInView';
import AnimatedButton from '@/components/AnimatedButton';

export default function MarkAbsentUserStatus() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { modules, loading } = useSelector((state: RootState) => state.academicModule);
  const absentStatusData = modules['absent-status'] || [];

  const [studentForm, setStudentForm] = useState({
    date: new Date().toISOString().split('T')[0],
    sendMessage: false,
  });

  const [staffForm, setStaffForm] = useState({
    date: new Date().toISOString().split('T')[0],
    sendMessage: false,
  });

  useEffect(() => {
    dispatch(fetchAcademicModule('absent-status'));
  }, [dispatch]);

  const handleStudentSubmit = () => {
    console.log('Student absent status submitted:', studentForm);
  };

  const handleStaffSubmit = () => {
    console.log('Staff absent status submitted:', staffForm);
  };

  return (
    <View style={styles.page}>
      <LinearGradient colors={['#0ea5e9', '#6366f1', '#a855f7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <AnimatedButton style={styles.back} onPress={() => router.back()}>
          <ArrowLeft size={17} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </AnimatedButton>
        <Text style={styles.title}>Mark Absent Status</Text>
        <Text style={styles.subtitle}>Academic module</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Student Status Card */}
        <FadeInView style={[styles.card, { borderTopColor: '#10b981', borderTopWidth: 3 }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBubble, { backgroundColor: '#ecfdf5' }]}>
              <UserCheck size={17} color="#10b981" />
            </View>
            <Text style={[styles.cardTitle, { color: '#10b981' }]}>Mark Absent Student Status</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date</Text>
            <View style={styles.dateInputContainer}>
              <Calendar size={16} color="#10b981" />
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
                value={studentForm.date}
                onChangeText={(text) => setStudentForm({ ...studentForm, date: text })}
              />
            </View>
          </View>

          <AnimatedButton
            style={styles.checkboxContainer}
            onPress={() => setStudentForm({ ...studentForm, sendMessage: !studentForm.sendMessage })}
          >
            <View style={[styles.checkbox, studentForm.sendMessage && { backgroundColor: '#10b981', borderColor: '#10b981' }]}>
              {studentForm.sendMessage && <Check size={13} color="#fff" />}
            </View>
            <Text style={styles.checkboxLabel}>Send Message</Text>
          </AnimatedButton>

          <AnimatedButton style={[styles.submitButton, { backgroundColor: '#10b981' }]} onPress={handleStudentSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </AnimatedButton>
        </FadeInView>

        {/* Staff Status Card */}
        <FadeInView delay={100} style={[styles.card, { borderTopColor: '#f97316', borderTopWidth: 3 }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBubble, { backgroundColor: '#fff7ed' }]}>
              <Briefcase size={17} color="#f97316" />
            </View>
            <Text style={[styles.cardTitle, { color: '#f97316' }]}>Mark Absent Staff Status</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date</Text>
            <View style={styles.dateInputContainer}>
              <Calendar size={16} color="#f97316" />
              <TextInput
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
                value={staffForm.date}
                onChangeText={(text) => setStaffForm({ ...staffForm, date: text })}
              />
            </View>
          </View>

          <AnimatedButton
            style={styles.checkboxContainer}
            onPress={() => setStaffForm({ ...staffForm, sendMessage: !staffForm.sendMessage })}
          >
            <View style={[styles.checkbox, staffForm.sendMessage && { backgroundColor: '#f97316', borderColor: '#f97316' }]}>
              {staffForm.sendMessage && <Check size={13} color="#fff" />}
            </View>
            <Text style={styles.checkboxLabel}>Send Message</Text>
          </AnimatedButton>

          <AnimatedButton style={[styles.submitButton, { backgroundColor: '#f97316' }]} onPress={handleStaffSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </AnimatedButton>
        </FadeInView>
      </ScrollView>
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
    color: '#e5eefe',
    fontSize: 10,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 4,
    padding: 15,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 16,
  },
  iconBubble: {
    width: 30,
    height: 30,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontWeight: '800',
    fontSize: 12.5,
    flexShrink: 1,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#2d3748',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#f9fafb',
  },
  dateInput: {
    flex: 1,
    fontSize: 12.5,
    color: '#2d3748',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    color: '#4a5568',
    fontSize: 12.5,
  },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 12.5,
    fontWeight: '700',
  },
});