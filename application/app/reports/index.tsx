import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

const pages = [
  ['downloads', 'Report Downloads'],
  ['campus-feed-engagement', 'Campus Feed Engagement'],
  ['student-leave', 'Student Leave Report'],
  ['receipt-wise-fee', 'Receipt wise Fee collection'],
  ['fee-collected', 'Fee Collected Report'],
  ['fee-discount', 'Fee Discount Report'],
  ['fee-type-term-wise', 'Fee Type/Term Wise Report'],
  ['datewise-fee-collected', 'Datewise Fee Collected Report'],
  ['termwise-fee-collected', 'Termwise Fee Collected Report'],
  ['fee-balance', 'Fee Balance Report'],
  ['termwise-balance', 'Termwise Balance Report'],
  ['fee-type-termwise-balance', 'Fee Type/Termwise Balance Report'],
  ['fee-adjustment', 'Fee Adjustment Report'],
  ['classwise-balance-summary', 'Classwise Balance Summary'],
  ['term-wise-fee', 'Term Wise Fee Report'],
  ['student-more-balance', 'Student with More Balance'],
  ['fee-due-date', 'Fee Due Date Report'],
  ['fee-rebate', 'Fee Rebate Report'],
  ['deleted-fee-receipt', 'Deleted Fee Receipt Report'],
  ['sell-summary', 'Sell Summary Report'],
  ['purchase-summary', 'Purchase Summary Report'],
  ['inventory-stock', 'Inventory Stock Report'],
  ['route-student', 'Route Student Report'],
  ['transport-stoppage-fee', 'Transport Stoppage Fee Report'],
];

export default function ReportsIndex() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Reports</Text>
      <FlatList
        data={pages}
        keyExtractor={(item) => item[0]}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/reports/${item[0]}` as any)}>
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
  arrow: { color: '#ef4444', fontSize: 24 },
});
