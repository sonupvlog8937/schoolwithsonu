import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

const pages = [
  ['type', 'Leave Type'],
  ['define-policy', 'Define Leave Policy'],
  ['apply-staff', 'Apply Staff Leave'],
  ['staff-requests', 'Staff Leave Requests'],
  ['staff-balance', 'Staff Leave Balance'],
];

export default function LeaveIndex() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Leave</Text>
      <FlatList
        data={pages}
        keyExtractor={(item) => item[0]}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/leave/${item[0]}` as any)}>
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
  arrow: { color: '#06b6d4', fontSize: 24 },
});
