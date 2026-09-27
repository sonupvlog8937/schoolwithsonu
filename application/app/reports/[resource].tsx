import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/state/store';
import { createReport, deleteReport, fetchReport } from '@/state/reportSlice';

const titles: Record<string, string> = {
  downloads: 'Report Downloads',
  'campus-feed-engagement': 'Campus Feed Engagement',
  'student-leave': 'Student Leave Report',
  'receipt-wise-fee': 'Receipt Wise Fee Collection',
  'fee-collected': 'Fee Collected Report',
  'fee-discount': 'Fee Discount Report',
  'fee-type-term-wise': 'Fee Type/Term Wise Report',
  'datewise-fee-collected': 'Datewise Fee Collected Report',
  'termwise-fee-collected': 'Termwise Fee Collected Report',
  'fee-balance': 'Fee Balance Report',
  'termwise-balance': 'Termwise Balance Report',
  'fee-type-termwise-balance': 'Fee Type/Termwise Balance Report',
  'fee-adjustment': 'Fee Adjustment Report',
  'classwise-balance-summary': 'Classwise Balance Summary',
  'term-wise-fee': 'Term Wise Fee Report',
  'student-more-balance': 'Student With More Balance',
  'fee-due-date': 'Fee Due Date Report',
  'fee-rebate': 'Fee Rebate Report',
  'deleted-fee-receipt': 'Deleted Fee Receipt Report',
  'sell-summary': 'Sell Summary Report',
  'purchase-summary': 'Purchase Summary Report',
  'inventory-stock': 'Inventory Stock Report',
  'route-student': 'Route Student Report',
  'transport-stoppage-fee': 'Transport Stoppage Fee Report',
};

const fields: Record<string, string[]> = {
  downloads: ['title', 'type', 'date', 'status'],
  'campus-feed-engagement': ['title', 'engagement', 'date', 'status'],
  'student-leave': ['studentName', 'days', 'reason', 'status'],
  'receipt-wise-fee': ['receiptNo', 'studentName', 'amount', 'status'],
  'fee-collected': ['studentName', 'amount', 'collectionDate', 'status'],
  'fee-discount': ['studentName', 'discount', 'date', 'status'],
  'fee-type-term-wise': ['feeType', 'term', 'amount', 'status'],
  'datewise-fee-collected': ['date', 'amount', 'status'],
  'termwise-fee-collected': ['term', 'amount', 'status'],
  'fee-balance': ['studentName', 'balance', 'status'],
  'termwise-balance': ['term', 'balance', 'status'],
  'fee-type-termwise-balance': ['feeType', 'term', 'balance', 'status'],
  'fee-adjustment': ['studentName', 'adjustment', 'date', 'status'],
  'classwise-balance-summary': ['className', 'balance', 'status'],
  'term-wise-fee': ['term', 'amount', 'status'],
  'student-more-balance': ['studentName', 'balance', 'status'],
  'fee-due-date': ['studentName', 'dueDate', 'status'],
  'fee-rebate': ['studentName', 'rebate', 'status'],
  'deleted-fee-receipt': ['receiptNo', 'deletedAt', 'status'],
  'sell-summary': ['itemName', 'units', 'amount', 'status'],
  'purchase-summary': ['itemName', 'units', 'amount', 'status'],
  'inventory-stock': ['itemName', 'stock', 'status'],
  'route-student': ['routeName', 'studentName', 'status'],
  'transport-stoppage-fee': ['routeName', 'amount', 'status'],
};

export function ReportScreen({ fixedResource }: { fixedResource?: string }) {
  const params = useLocalSearchParams<{ resource: string }>();
  const resource = fixedResource || params.resource || 'downloads';
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { records, loading } = useSelector((state: RootState) => state.report);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchReport(resource));
  }, [dispatch, resource]);

  const save = () => {
    dispatch(createReport({ resource, data: form }));
    setForm({});
    setOpen(false);
  };

  const list = fields[resource] || fields.downloads;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.heading}>{titles[resource] || 'Reports'}</Text>
        <Pressable style={styles.add} onPress={() => setOpen(true)}>
          <Text style={styles.addText}>+ Add</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color="#ef4444" size="large" />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{item.data?.title || item.data?.studentName || item.data?.routeName || item.data?.itemName || `Record ${index + 1}`}</Text>
                <Text style={styles.meta}>{list.slice(0, 3).map((key) => item.data?.[key] ?? item[key]).filter(Boolean).join(' • ') || item.status || 'Active'}</Text>
              </View>
              <Pressable onPress={() => dispatch(deleteReport({ resource, id: item._id }))}>
                <Text style={styles.delete}>Remove</Text>
              </Pressable>
            </View>
          )}
        />
      )}

      <Modal visible={open} transparent animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Add {titles[resource] || 'Reports'}</Text>
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

export default function ReportsResourceScreen() {
  return <ReportScreen />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f5f9', padding: 18, paddingTop: 54 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  back: { color: '#ef4444', fontSize: 34, marginRight: 10 },
  heading: { flex: 1, color: '#173452', fontSize: 20, fontWeight: '700' },
  add: { backgroundColor: '#ef4444', borderRadius: 8, padding: 10 },
  addText: { color: '#fff', fontWeight: '700' },
  row: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  rowTitle: { color: '#173452', fontWeight: '700' },
  meta: { color: '#94a3b8', marginTop: 5 },
  delete: { color: '#ef4444' },
  modal: { margin: 20, marginTop: 140, backgroundColor: '#fff', borderRadius: 14, padding: 20 },
  modalTitle: { color: '#173452', fontSize: 20, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#dbe3ee', borderRadius: 8, padding: 12, marginTop: 14 },
  submit: { backgroundColor: '#ef4444', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  submitText: { color: '#fff', fontWeight: '700' },
  cancel: { textAlign: 'center', color: '#64748b', marginTop: 16 },
});
