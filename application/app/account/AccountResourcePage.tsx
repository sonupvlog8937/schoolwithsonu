import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/state/store';
import { createAccount, deleteAccount, fetchAccount } from '@/state/accountSlice';

const titles: Record<string, string> = {
  'payment-requests': 'Payment Requests',
  'event-collections': 'Event Collections',
  'income-category': 'Income Category',
  'expense-category': 'Expense Category',
  'account-head': 'Account Head',
  income: 'Income',
  expenses: 'Expenses',
  'income-report': 'Income Report',
  'expense-report': 'Expense Report',
  'daily-monthly-report': 'Daily/Monthly Accounts Report',
  'overall-summary': 'Overall Accounts Summary',
  'group-wise-overall': 'Group Wise Overall',
};

const fields: Record<string, string[]> = {
  'payment-requests': ['title', 'requestType', 'amount', 'status'],
  'event-collections': ['eventName', 'amount', 'collector', 'status'],
  'income-category': ['name', 'type', 'description', 'status'],
  'expense-category': ['name', 'type', 'description', 'status'],
  'account-head': ['name', 'category', 'description', 'status'],
  income: ['title', 'category', 'amount', 'date', 'status'],
  expenses: ['title', 'category', 'amount', 'date', 'status'],
  'income-report': ['title', 'category', 'amount', 'date', 'status'],
  'expense-report': ['title', 'category', 'amount', 'date', 'status'],
  'daily-monthly-report': ['month', 'totalIncome', 'totalExpense', 'balance', 'status'],
  'overall-summary': ['label', 'amount', 'type', 'status'],
  'group-wise-overall': ['groupName', 'amount', 'type', 'status'],
};

export function AccountResourceScreen({ fixedResource }: { fixedResource: string }) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { records, loading } = useSelector((state: RootState) => state.account);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchAccount(fixedResource));
  }, [dispatch, fixedResource]);

  const save = () => {
    dispatch(createAccount({ resource: fixedResource, data: form }));
    setForm({});
    setOpen(false);
  };

  const list = fields[fixedResource] || fields['payment-requests'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.heading}>{titles[fixedResource] || 'Accounts'}</Text>
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
                <Text style={styles.rowTitle}>{item.data?.title || item.data?.eventName || item.data?.name || `Record ${index + 1}`}</Text>
                <Text style={styles.meta}>{list.slice(0, 3).map((key) => item.data?.[key] ?? item[key]).filter(Boolean).join(' • ') || item.status || 'Active'}</Text>
              </View>
              <Pressable onPress={() => dispatch(deleteAccount({ resource: fixedResource, id: item._id }))}>
                <Text style={styles.delete}>Remove</Text>
              </Pressable>
            </View>
          )}
        />
      )}

      <Modal visible={open} transparent animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Add {titles[fixedResource] || 'Accounts'}</Text>
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
