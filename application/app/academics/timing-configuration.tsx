import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Animated,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, X, Clock } from 'lucide-react-native';
import type { AppDispatch, RootState } from '@/state/store';
import {
  fetchAcademicModule,
  createAcademicRecord,
  updateAcademicRecord,
  deleteAcademicRecord,
} from '@/state/academicModuleSlice';

const COLORS = {
  primary: '#fb542d',
  primaryDark: '#e0430f',
  primaryLight: '#ff8a5c',
  amber: '#ffb020',
  blue: '#3b82f6',
  green: '#16a34a',
  red: '#ef4444',
  bg: '#fff8f4',
  surface: '#ffffff',
  border: '#ffe1cc',
  textMuted: '#a68a7a',
  textDark: '#3a2a20',
};

function FadeInView({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 350, delay, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View
      style={[
        style,
        { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export default function TimingConfiguration() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { modules, loading, error } = useSelector((state: RootState) => state.academicModule);
  const timings = modules['timing'] || [];

  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({
    period: '',
    startTime: '',
    endTime: '',
    status: 'Active',
  });
  const [showInactive, setShowInactive] = useState(false);

  const modalAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (openDialog) {
      modalAnim.setValue(0);
      Animated.spring(modalAnim, { toValue: 1, useNativeDriver: true, friction: 8, tension: 60 }).start();
    }
  }, [openDialog]);

  useEffect(() => {
    dispatch(fetchAcademicModule('timing'));
  }, [dispatch]);

  const handleOpenDialog = () => {
    setFormData({ period: '', startTime: '', endTime: '', status: 'Active' });
    setEditing(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditing(null);
  };

  const handleEdit = (record: any) => {
    setFormData({
      period: record.period || '',
      startTime: record.startTime || '',
      endTime: record.endTime || '',
      status: record.status || 'Active',
    });
    setEditing(record);
    setOpenDialog(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Timing',
      'Are you sure you want to delete this timing?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteAcademicRecord({ module: 'timing', id })),
        },
      ]
    );
  };

  const handleSubmit = () => {
    if (!formData.period || !formData.startTime || !formData.endTime) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return;
    }

    const payload = {
      period: formData.period,
      startTime: formData.startTime,
      endTime: formData.endTime,
      status: formData.status,
    };

    if (editing) {
      dispatch(updateAcademicRecord({ module: 'timing', id: editing._id, payload })).then(() => {
        handleCloseDialog();
      });
    } else {
      dispatch(createAcademicRecord({ module: 'timing', payload })).then(() => {
        handleCloseDialog();
      });
    }
  };

  const filteredTimings = showInactive ? timings : timings.filter((t) => t.status === 'Active');
  const bottomPad = insets.bottom + 90;

  return (
    <View style={styles.page}>
      <FadeInView>
        <View style={styles.header}>
          <TouchableOpacity style={styles.back} activeOpacity={0.7} onPress={() => router.back()}>
            <ArrowLeft size={17} color="#fff" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>TIMING LIST</Text>
          <Text style={styles.subtitle}>Academic module</Text>
        </View>
      </FadeInView>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: bottomPad }}>
        <FadeInView delay={70}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Clock size={18} color={COLORS.primary} />
              <Text style={styles.cardTitle}>TIMING LIST</Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.filterButton, showInactive && styles.filterButtonActive]}
                onPress={() => setShowInactive(!showInactive)}
              >
                <Text style={[styles.filterButtonText, showInactive && styles.filterButtonTextActive]}>
                  INACTIVE
                </Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.8} style={styles.addButton} onPress={handleOpenDialog}>
                <Plus size={15} color="#fff" />
                <Text style={styles.addButtonText}>ADD TIMING</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator style={styles.loader} color={COLORS.primary} />
            ) : filteredTimings.length > 0 ? (
              filteredTimings.map((row, index) => (
                <FadeInView key={row._id} delay={Math.min(index, 8) * 45} style={styles.row}>
                  <View style={styles.rowContent}>
                    <View style={styles.rowField}>
                      <Text style={styles.fieldLabel}>Period:</Text>
                      <Text style={styles.fieldValue}>{row.period || '-'}</Text>
                    </View>
                    <View style={styles.rowField}>
                      <Text style={styles.fieldLabel}>Start Time:</Text>
                      <Text style={styles.fieldValue}>{row.startTime || '-'}</Text>
                    </View>
                    <View style={styles.rowField}>
                      <Text style={styles.fieldLabel}>End Time:</Text>
                      <Text style={styles.fieldValue}>{row.endTime || '-'}</Text>
                    </View>
                    <View style={styles.rowField}>
                      <Text style={styles.fieldLabel}>Status:</Text>
                      <Text
                        style={[
                          styles.fieldValue,
                          { color: row.status === 'Active' ? COLORS.green : COLORS.amber },
                        ]}
                      >
                        {row.status || 'Active'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity activeOpacity={0.8} style={styles.editButton} onPress={() => handleEdit(row)}>
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7} style={styles.deleteButton} onPress={() => handleDelete(row._id)}>
                      <X size={13} color={COLORS.red} />
                      <Text style={styles.deleteButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </FadeInView>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <X size={44} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No Data</Text>
              </View>
            )}
          </View>
        </FadeInView>
      </ScrollView>

      <Modal visible={openDialog} animationType="fade" transparent onRequestClose={handleCloseDialog}>
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: modalAnim,
                transform: [
                  { scale: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
                  { translateY: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
                ],
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editing ? 'EDIT TIMING' : 'ADD TIMING'}</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={handleCloseDialog}>
                <X size={19} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formField}>
                <Text style={styles.label}>Period *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.period}
                  onChangeText={(text) => setFormData({ ...formData, period: text })}
                  placeholder="e.g., Period 1"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Start Time *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.startTime}
                  onChangeText={(text) => setFormData({ ...formData, startTime: text })}
                  placeholder="e.g., 09:00 AM"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>End Time *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.endTime}
                  onChangeText={(text) => setFormData({ ...formData, endTime: text })}
                  placeholder="e.g., 09:45 AM"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.statusButtons}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.statusButton, formData.status === 'Active' && styles.statusButtonActive]}
                    onPress={() => setFormData({ ...formData, status: 'Active' })}
                  >
                    <Text style={[styles.statusButtonText, formData.status === 'Active' && styles.statusButtonTextActive]}>
                      Active
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.statusButton, formData.status === 'Inactive' && styles.statusButtonActive]}
                    onPress={() => setFormData({ ...formData, status: 'Inactive' })}
                  >
                    <Text style={[styles.statusButtonText, formData.status === 'Inactive' && styles.statusButtonTextActive]}>
                      Inactive
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity activeOpacity={0.7} style={styles.cancelButton} onPress={handleCloseDialog}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.submitButton,
                  (!formData.period || !formData.startTime || !formData.endTime) && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!formData.period || !formData.startTime || !formData.endTime}
              >
                <Text style={styles.submitButtonText}>{editing ? 'Update' : 'Submit'}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 26,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  backText: { color: '#fff', fontSize: 11 },
  title: { color: '#fff', fontSize: 21, fontWeight: '800' },
  subtitle: { color: '#ffe1cc', fontSize: 10, marginTop: 4 },
  content: { flex: 1 },
  card: {
    backgroundColor: COLORS.surface,
    margin: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 11 },
  cardTitle: { color: COLORS.primary, fontWeight: '800', fontSize: 13 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14, gap: 8 },
  filterButton: { flex: 1, backgroundColor: '#fff1e6', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center' },
  filterButtonActive: { backgroundColor: COLORS.green },
  filterButtonText: { color: COLORS.primaryDark, fontSize: 11, fontWeight: '700' },
  filterButtonTextActive: { color: '#fff' },
  addButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  loader: { padding: 56 },
  row: { backgroundColor: '#fffaf6', borderWidth: 1, borderColor: '#fdf1e8', borderRadius: 10, paddingVertical: 11, paddingHorizontal: 11, marginBottom: 8 },
  rowContent: { gap: 4 },
  rowField: { flexDirection: 'row', alignItems: 'center' },
  fieldLabel: { color: COLORS.textMuted, fontSize: 10.5, width: 70 },
  fieldValue: { color: COLORS.textDark, fontSize: 11.5, flex: 1 },
  actionButtons: { flexDirection: 'row', gap: 8, marginTop: 8 },
  editButton: { backgroundColor: '#fff6e0', paddingHorizontal: 11, paddingVertical: 6, borderRadius: 6 },
  editButtonText: { color: '#a06600', fontSize: 10.5, fontWeight: '700' },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
  },
  deleteButtonText: { color: COLORS.red, fontSize: 10.5, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', paddingVertical: 42, gap: 8 },
  emptyText: { color: COLORS.textMuted, fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(58, 30, 15, 0.45)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, width: '100%', maxHeight: '80%' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { color: COLORS.primary, fontWeight: '800', fontSize: 15 },
  modalBody: { padding: 15, maxHeight: '60%' },
  formField: { marginBottom: 15 },
  label: { color: COLORS.textDark, fontSize: 12.5, fontWeight: '600', marginBottom: 7 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 11,
    fontSize: 12.5,
    color: COLORS.textDark,
    backgroundColor: '#fffdfb',
  },
  statusButtons: { flexDirection: 'row', gap: 8 },
  statusButton: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderRadius: 8,
    backgroundColor: '#fffaf6',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  statusButtonActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  statusButtonText: { color: '#5c4b40', fontSize: 12.5, fontWeight: '600' },
  statusButtonTextActive: { color: '#fff' },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, padding: 15, borderTopWidth: 1, borderTopColor: COLORS.border },
  cancelButton: { paddingHorizontal: 15, paddingVertical: 9, borderRadius: 8 },
  cancelButtonText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  submitButton: { backgroundColor: COLORS.primary, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 8 },
  submitButtonDisabled: { backgroundColor: '#f0d9cc' },
  submitButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});