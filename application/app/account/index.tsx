import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

const pages = [
  ['payment-requests', 'Payment Requests'],
  ['event-collections', 'Event Collections'],
  ['income-category', 'Income Category'],
  ['expense-category', 'Expense Category'],
  ['account-head', 'Account Head'],
  ['income', 'Income'],
  ['expenses', 'Expenses'],
  ['income-report', 'Income Report'],
  ['expense-report', 'Expense Report'],
  ['daily-monthly-report', 'Daily/Monthly Accounts Report'],
  ['overall-summary', 'Overall Accounts Summary'],
  ['group-wise-overall', 'Group Wise Overall'],
];

export default function AccountIndex() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Accounts</Text>
      <FlatList
        data={pages}
        keyExtractor={(item) => item[0]}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/account/${item[0]}` as any)}>
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
