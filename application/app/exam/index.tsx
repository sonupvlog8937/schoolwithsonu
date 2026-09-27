import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

const pages = [
  ['terms', 'Exam Terms'],
  ['common-type', 'Exam Common Type'],
  ['type', 'Exam Type'],
  ['grading-system', 'Grading System'],
  ['system', 'Exam System'],
  ['co-scholastic-grade', 'Co-Scholastic Grade System'],
  ['co-scholastic-area', 'Co-Scholastic Area'],
  ['schedule', 'Exam Schedule'],
  ['online-exam', 'Online Exam'],
  ['hall-ticket', 'Hall Ticket'],
  ['marks-multi-subject', 'Exam Marks Multi Subject'],
  ['subject-remarks-all', 'Subject Remarks (All Subjects)'],
  ['subject-remarks', 'Subject Remarks'],
  ['marks', 'Exam Marks'],
  ['co-scholastic-marks', 'Co-Scholastic Marks'],
  ['marks-report', 'Exam Marks Report'],
  ['report-card', 'Report Card'],
  ['promote-structure', 'Promote Exam Structure'],
  ['test-assignment', 'Test Assignment'],
  ['bulk-attendance-update', 'Bulk Attendance Update'],
  ['system-config', 'Exam System Config'],
];

export default function ExamIndex() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Exam</Text>
      <FlatList
        data={pages}
        keyExtractor={(item) => item[0]}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/exam/${item[0]}` as any)}>
            <Text style={styles.title}>{item[1]}</Text>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f5f9', padding: 18, paddingTop: 54 },
  heading: { color: '#173452', fontSize: 26, fontWeight: '700', marginBottom: 18 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 18, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  title: { color: '#334155', fontSize: 16, fontWeight: '700' },
  arrow: { color: '#f4512c', fontSize: 24 },
});
