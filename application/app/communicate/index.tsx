import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

const pages = [
  ['group-message', 'Group Message'], ['particular-student', 'Particular Student'], ['particular-staff', 'Particular Staff'],
  ['particular-number-sms', 'Particular Number SMS'], ['particular-email', 'Particular Email'], ['homework', 'Homework'],
  ['holidays', 'Holidays'], ['events', 'Events'], ['academic-calendar', 'Academic Calendar'], ['birthday', 'Birthday'],
  ['gallery', 'Gallery'], ['hobby-group-members', 'Hobby Group Members'], ['circular', 'Circular'], ['popups', 'Popups'],
  ['home-content', 'Home Content'], ['sms-student-username', 'SMS Student Username'], ['sms-staff-username', 'SMS Staff Username'],
];

export default function CommunicationIndex() {
  const router = useRouter();
  return <View style={styles.container}><Text style={styles.heading}>Communicate</Text><FlatList data={pages} keyExtractor={(item) => item[0]} renderItem={({ item }) => <Pressable style={styles.item} onPress={() => router.push(`/communicate/${item[0]}` as any)}><Text style={styles.itemText}>{item[1]}</Text><Text style={styles.arrow}>›</Text></Pressable>} /></View>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f3f5f9', padding: 20, paddingTop: 56 }, heading: { fontSize: 28, fontWeight: '700', color: '#1e293b', marginBottom: 18 }, item: { backgroundColor: '#fff', borderRadius: 12, padding: 18, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#1e293b', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }, itemText: { color: '#334155', fontSize: 16, fontWeight: '600' }, arrow: { color: '#f4512c', fontSize: 26 } });