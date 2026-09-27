import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/state/store';
import { createTimetable, deleteTimetable, fetchTimetable } from '@/state/timetableSlice';

const titles: Record<string, string> = {
  configurations: 'Configurations',
  'subject-requirements': 'Subject Requirements',
  'teacher-workload': 'Teacher Workload',
  generate: 'Generate Timetable',
  'view-active-timetable': 'View Active Timetable',
};

const fields: Record<string, string[]> = {
  configurations: ['name', 'description', 'status'],
  'subject-requirements': ['subjectName', 'className', 'periodsRequired', 'status'],
  'teacher-workload': ['teacherName', 'assignedPeriods', 'workloadType', 'status'],
  generate: ['className', 'section', 'generatedOn', 'status'],
  'view-active-timetable': ['day', 'className', 'periodNumber', 'status'],
};

export function TimetableScreen({ fixedResource }: { fixedResource?: string }) {
  const params = useLocalSearchParams<{ resource: string }>();
  const resource = fixedResource || params.resource || 'configurations';
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { records, loading } = useSelector((state: RootState) => state.timetable);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchTimetable(resource));
  }, [dispatch, resource]);

  const save = () => {
    dispatch(createTimetable({ resource, data: form }));
    setForm({});
    setOpen(false);
  };

  const list = fields[resource] || fields.configurations;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.heading}>{titles[resource] || 'Timetable'}</Text>
        <Pressable style={styles.add} onPress={() => setOpen(true)}>
          <Text style={styles.addText}>+ Add</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color="#0ea5e9" size="large" />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{item.data?.name || item.data?.subjectName || item.data?.teacherName || item.data?.className || `Record ${index + 1}`}</Text>
                <Text style={styles.meta}>{list.slice(0, 3).map((key) => item.data?.[key] ?? item[key]).filter(Boolean).join(' • ') || item.status || 'Active'}</Text>
              </View>
              <Pressable onPress={() => dispatch(deleteTimetable({ resource, id: item._id }))}>
                <Text style={styles.delete}>Remove</Text>
              </Pressable>
            </View>
          )}
        />
      )}

      <Modal visible={open} transparent animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Add {titles[resource] || 'Timetable'}</Text>
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

export default function TimetableResourceScreen() {
  return <TimetableScreen />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f5f9', padding: 18, paddingTop: 54 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  back: { color: '#0ea5e9', fontSize: 34, marginRight: 10 },
  heading: { flex: 1, color: '#173452', fontSize: 20, fontWeight: '700' },
  add: { backgroundColor: '#0ea5e9', borderRadius: 8, padding: 10 },
  addText: { color: '#fff', fontWeight: '700' },
  row: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  rowTitle: { color: '#173452', fontWeight: '700' },
  meta: { color: '#94a3b8', marginTop: 5 },
  delete: { color: '#ef4444' },
  modal: { margin: 20, marginTop: 140, backgroundColor: '#fff', borderRadius: 14, padding: 20 },
  modalTitle: { color: '#173452', fontSize: 20, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#dbe3ee', borderRadius: 8, padding: 12, marginTop: 14 },
  submit: { backgroundColor: '#0ea5e9', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  submitText: { color: '#fff', fontWeight: '700' },
  cancel: { textAlign: 'center', color: '#64748b', marginTop: 16 },
});
