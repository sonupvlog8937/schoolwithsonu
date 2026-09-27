import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/state/store';
import { createExam, deleteExam, fetchExam } from '@/state/examSlice';

const titles: Record<string, string> = {
  terms: 'Exam Terms',
  'common-type': 'Exam Common Type',
  type: 'Exam Type',
  'grading-system': 'Grading System',
  system: 'Exam System',
  'co-scholastic-grade': 'Co-Scholastic Grade System',
  'co-scholastic-area': 'Co-Scholastic Area',
  schedule: 'Exam Schedule',
  'online-exam': 'Online Exam',
  'hall-ticket': 'Hall Ticket',
  'marks-multi-subject': 'Exam Marks Multi Subject',
  'subject-remarks-all': 'Subject Remarks (All Subjects)',
  'subject-remarks': 'Subject Remarks',
  marks: 'Exam Marks',
  'co-scholastic-marks': 'Co-Scholastic Marks',
  'marks-report': 'Exam Marks Report',
  'report-card': 'Report Card',
  'promote-structure': 'Promote Exam Structure',
  'test-assignment': 'Test Assignment',
  'bulk-attendance-update': 'Bulk Attendance Update',
  'system-config': 'Exam System Config',
};

const fields: Record<string, string[]> = {
  terms: ['name', 'code', 'session', 'status'],
  'common-type': ['name', 'description', 'status'],
  type: ['name', 'shortName', 'status'],
  'grading-system': ['grade', 'minMarks', 'maxMarks', 'description'],
  system: ['name', 'description', 'status'],
  'co-scholastic-grade': ['grade', 'range', 'description'],
  'co-scholastic-area': ['name', 'description', 'weightage'],
  schedule: ['examName', 'className', 'section', 'date', 'time', 'status'],
  'online-exam': ['title', 'subject', 'date', 'duration', 'status'],
  'hall-ticket': ['studentName', 'className', 'admissionNo', 'examName', 'status'],
  'marks-multi-subject': ['studentName', 'className', 'subject', 'marks', 'status'],
  'subject-remarks-all': ['studentName', 'className', 'remark', 'status'],
  'subject-remarks': ['studentName', 'subject', 'remark', 'status'],
  marks: ['studentName', 'className', 'subject', 'marks', 'grade'],
  'co-scholastic-marks': ['studentName', 'className', 'area', 'marks', 'grade'],
  'marks-report': ['studentName', 'className', 'examName', 'totalMarks', 'percentage'],
  'report-card': ['studentName', 'className', 'session', 'gradePoint', 'status'],
  'promote-structure': ['fromClass', 'toClass', 'examType', 'status'],
  'test-assignment': ['title', 'subject', 'assignedTo', 'status'],
  'bulk-attendance-update': ['examName', 'date', 'attendanceStatus', 'status'],
  'system-config': ['name', 'value', 'status'],
};

export function ExamScreen({ fixedResource }: { fixedResource?: string }) {
  const params = useLocalSearchParams<{ resource: string }>();
  const resource = fixedResource || params.resource || 'terms';
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { records, loading } = useSelector((state: RootState) => state.exam);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchExam(resource));
  }, [dispatch, resource]);

  const save = () => {
    dispatch(createExam({ resource, data: form }));
    setForm({});
    setOpen(false);
  };

  const list = fields[resource] || fields.terms;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.heading}>{titles[resource] || 'Exam Records'}</Text>
        <Pressable style={styles.add} onPress={() => setOpen(true)}>
          <Text style={styles.addText}>+ Add</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color="#f4512c" size="large" />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text style={styles.empty}>No Data</Text>}
          renderItem={({ item, index }) => (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{item.data?.name || item.data?.studentName || item.data?.title || `Record ${index + 1}`}</Text>
                <Text style={styles.meta}>{list.slice(0, 3).map((key) => item.data?.[key] ?? item[key]).filter(Boolean).join(' • ') || item.status || 'Active'}</Text>
              </View>
              <Pressable onPress={() => dispatch(deleteExam({ resource, id: item._id }))}>
                <Text style={styles.delete}>Remove</Text>
              </Pressable>
            </View>
          )}
        />
      )}

      <Modal visible={open} transparent animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Add {titles[resource] || 'Exam'}</Text>
          {list.map((field) => (
            <TextInput
              key={field}
              style={styles.input}
              value={form[field] ?? ''}
              placeholder={field}
              onChangeText={(value) => setForm((prev) => ({ ...prev, [field]: value }))}
            />
          ))}
          <Pressable style={styles.submit} onPress={save}>
            <Text style={styles.submitText}>Save</Text>
          </Pressable>
          <Pressable onPress={() => setOpen(false)}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

export default function ExamResource() {
  return <ExamScreen />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f5f9', padding: 18, paddingTop: 54 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  back: { color: '#f4512c', fontSize: 34, marginRight: 10 },
  heading: { flex: 1, color: '#173452', fontSize: 20, fontWeight: '700' },
  add: { backgroundColor: '#f4512c', borderRadius: 8, padding: 10 },
  addText: { color: '#fff', fontWeight: '700' },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 100 },
  row: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  rowTitle: { color: '#173452', fontWeight: '700' },
  meta: { color: '#94a3b8', marginTop: 5 },
  delete: { color: '#ef4444' },
  modal: { margin: 20, marginTop: 140, backgroundColor: '#fff', borderRadius: 14, padding: 20 },
  modalTitle: { color: '#173452', fontSize: 20, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#dbe3ee', borderRadius: 8, padding: 12, marginTop: 14 },
  submit: { backgroundColor: '#f4512c', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  submitText: { color: '#fff', fontWeight: '700' },
  cancel: { textAlign: 'center', color: '#64748b', marginTop: 16 },
});
