import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/state/store';
import { createCommunication, deleteCommunication, fetchCommunication } from '@/state/communicationSlice';

const names: Record<string, string> = { 'group-message': 'Group Message', 'particular-student': 'Particular Student', 'particular-staff': 'Particular Staff', 'particular-number-sms': 'Send SMS to Numbers', 'particular-email': 'Send Email to Addresses', homework: 'Homework', holidays: 'Holidays', events: 'Events', 'academic-calendar': 'Academic Calendar', birthday: 'Student Birthday', gallery: 'Photo Gallery', 'hobby-group-members': 'Student Hobby Group', circular: 'Circular', popups: 'App Popups', 'home-content': 'Home Content', 'sms-student-username': 'SMS Student Username', 'sms-staff-username': 'SMS Staff Username' };
const messagePages = new Set(['group-message', 'particular-student', 'particular-staff', 'particular-number-sms', 'particular-email']);

export function CommunicationResourceScreen({ resource: resourceProp }: { resource?: string }) {
  const params = useLocalSearchParams<{ resource: string }>();
  const resource = resourceProp || params.resource || 'group-message';
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { records, loading } = useSelector((state: RootState) => state.communication);
  const [modal, setModal] = useState(false);
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => { dispatch(fetchCommunication(resource)); }, [dispatch, resource]);
  const save = () => { dispatch(createCommunication({ resource, data: messagePages.has(resource) ? { recipients: recipients.split(',').map((item) => item.trim()).filter(Boolean), message } : { title, message, status: 'Active' } })); setMessage(''); setRecipients(''); setTitle(''); setModal(false); };

  return <View style={styles.container}><View style={styles.header}><Pressable onPress={() => router.back()}><Text style={styles.back}>‹</Text></Pressable><Text style={styles.heading}>{names[resource] || 'Communication'}</Text><Pressable style={styles.add} onPress={() => setModal(true)}><Text style={styles.addText}>+ Add</Text></Pressable></View>{loading ? <ActivityIndicator color="#f4512c" size="large" style={styles.loader} /> : <FlatList data={records} keyExtractor={(item) => item._id} ListEmptyComponent={<Text style={styles.empty}>No data</Text>} renderItem={({ item }) => <View style={styles.card}><Text style={styles.cardTitle}>{item.data?.title || item.data?.message || item.data?.subject || 'Communication record'}</Text><Text style={styles.meta}>{item.data?.recipients?.join(', ') || item.data?.fromDate || 'Active'}</Text><Pressable onPress={() => dispatch(deleteCommunication({ resource, id: item._id }))}><Text style={styles.delete}>Remove</Text></Pressable></View>} />}<Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}><View style={styles.modal}>{!messagePages.has(resource) && <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />}{messagePages.has(resource) && <TextInput placeholder="Recipients, comma separated" value={recipients} onChangeText={setRecipients} style={styles.input} />}<TextInput placeholder="Message" value={message} onChangeText={setMessage} multiline style={[styles.input, { height: 110 }]} /><Pressable style={styles.save} onPress={save}><Text style={styles.saveText}>Save</Text></Pressable><Pressable onPress={() => setModal(false)}><Text style={styles.cancel}>Cancel</Text></Pressable></View></Modal></View>;
}

export default function CommunicationResource() {
  return <CommunicationResourceScreen />;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f3f5f9', padding: 18, paddingTop: 54 }, header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 }, back: { color: '#f4512c', fontSize: 34 }, heading: { flex: 1, color: '#1e293b', fontSize: 21, fontWeight: '700' }, add: { backgroundColor: '#f4512c', borderRadius: 8, paddingVertical: 9, paddingHorizontal: 12 }, addText: { color: '#fff', fontWeight: '700' }, loader: { marginTop: 80 }, empty: { textAlign: 'center', color: '#94a3b8', marginTop: 100 }, card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10 }, cardTitle: { color: '#334155', fontSize: 16, fontWeight: '600' }, meta: { color: '#94a3b8', marginTop: 7 }, delete: { color: '#ef4444', marginTop: 12 }, modal: { margin: 20, marginTop: 110, backgroundColor: '#fff', borderRadius: 16, padding: 20, height: 350 }, input: { borderWidth: 1, borderColor: '#dbe3ee', borderRadius: 8, padding: 12, marginTop: 12 }, save: { backgroundColor: '#f4512c', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 18 }, saveText: { color: '#fff', fontWeight: '700' }, cancel: { textAlign: 'center', color: '#64748b', marginTop: 16 } });