import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/state/store';
import { createHumanResource, deleteHumanResource, fetchHumanResource } from '@/state/humanResourceSlice';

const titles: Record<string, string> = {
  'add-staff': 'Add Staff',
  'manage-staff': 'Manage Staff',
  payroll: 'Payroll',
  'staff-attendance': 'Staff Attendance',
};

const fields: Record<string, string[]> = {
  'add-staff': ['fullName', 'email', 'phone', 'department', 'status'],
  'manage-staff': ['fullName', 'department', 'designation', 'status'],
  payroll: ['employeeName', 'month', 'salary', 'deduction', 'status'],
  'staff-attendance': ['employeeName', 'date', 'present', 'status'],
};

export function HumanResourceScreen({ fixedResource }: { fixedResource?: string }) {
  const params = useLocalSearchParams<{ resource: string }>();
  const resource = fixedResource || params.resource || 'add-staff';
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { records, loading } = useSelector((state: RootState) => state.humanResource);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchHumanResource(resource));
  }, [dispatch, resource]);

  const save = () => {
    dispatch(createHumanResource({ resource, data: form }));
    setForm({});
    setOpen(false);
  };

  const list = fields[resource] || fields['add-staff'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.heading}>{titles[resource] || 'Human Resource'}</Text>
        <Pressable style={styles.add} onPress={() => setOpen(true)}>
          <Text style={styles.addText}>+ Add</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color="#22c55e" size="large" />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{item.data?.fullName || item.data?.employeeName || `Record ${index + 1}`}</Text>
                <Text style={styles.meta}>{list.slice(0, 3).map((key) => item.data?.[key] ?? item[key]).filter(Boolean).join(' • ') || item.status || 'Active'}</Text>
              </View>
              <Pressable onPress={() => dispatch(deleteHumanResource({ resource, id: item._id }))}>
                <Text style={styles.delete}>Remove</Text>
              </Pressable>
            </View>
          )}
        />
      )}

      <Modal visible={open} transparent animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Add {titles[resource] || 'Human Resource'}</Text>
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

export default function HumanResourceResourceScreen() {
  return <HumanResourceScreen />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f5f9', padding: 18, paddingTop: 54 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  back: { color: '#22c55e', fontSize: 34, marginRight: 10 },
  heading: { flex: 1, color: '#173452', fontSize: 20, fontWeight: '700' },
  add: { backgroundColor: '#22c55e', borderRadius: 8, padding: 10 },
  addText: { color: '#fff', fontWeight: '700' },
  row: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  rowTitle: { color: '#173452', fontWeight: '700' },
  meta: { color: '#94a3b8', marginTop: 5 },
  delete: { color: '#ef4444' },
  modal: { margin: 20, marginTop: 140, backgroundColor: '#fff', borderRadius: 14, padding: 20 },
  modalTitle: { color: '#173452', fontSize: 20, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#dbe3ee', borderRadius: 8, padding: 12, marginTop: 14 },
  submit: { backgroundColor: '#22c55e', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  submitText: { color: '#fff', fontWeight: '700' },
  cancel: { textAlign: 'center', color: '#64748b', marginTop: 16 },
});
