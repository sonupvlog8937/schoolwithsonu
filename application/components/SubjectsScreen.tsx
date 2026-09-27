import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { ArrowLeft, Trash2 } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import type { AppDispatch, RootState } from '@/state/store';
import {
  createAcademicRecord,
  deleteAcademicRecord,
  fetchAcademicModule,
  updateAcademicRecord,
} from '@/state/academicModuleSlice';
import { fetchDataFromApi } from '@/utils/api';

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

export default function SubjectsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const subjects = useSelector((state: RootState) => state.academicModule.modules.subjects || []);
  const loading = useSelector((state: RootState) => state.academicModule.loading);

  const [boards, setBoards] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  const [formData, setFormData] = useState({
    subjectName: '',
    subjectCode: '',
    subjectType: 'theory',
    boards: [] as string[],
    optional: false,
  });
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingOptions(true);

      const boardsRes = await fetchDataFromApi('/master-config/boards');
      setBoards(boardsRes?.data || []);

      dispatch(fetchAcademicModule('subjects'));
    } catch (error) {
      console.error('Error loading data:', error);
      setBoards([]);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.subjectName.trim()) {
      Alert.alert('Error', 'Please enter subject name');
      return;
    }

    const payload = {
      subject_name: formData.subjectName,
      subject_codename: formData.subjectCode,
      subject_type: formData.subjectType,
      boards: formData.boards,
      optional: formData.optional,
    };

    try {
      if (editing) {
        await dispatch(
          updateAcademicRecord({ module: 'subjects', id: editing, payload })
        ).unwrap();
        setEditing(null);
      } else {
        await dispatch(createAcademicRecord({ module: 'subjects', payload })).unwrap();
      }

      setFormData({
        subjectName: '',
        subjectCode: '',
        subjectType: 'theory',
        boards: [],
        optional: false,
      });
      dispatch(fetchAcademicModule('subjects'));
    } catch (error) {
      console.error('Error saving subject:', error);
      Alert.alert('Error', 'Failed to save subject');
    }
  };

  const handleEdit = (record: any) => {
    setEditing(record._id);
    setFormData({
      subjectName: record.subject_name || '',
      subjectCode: record.subject_codename || '',
      subjectType: record.subject_type || 'theory',
      boards: record.boards || [],
      optional: record.optional || false,
    });
  };

  const handleDelete = (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to remove this subject?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(deleteAcademicRecord({ module: 'subjects', id })).unwrap();
            dispatch(fetchAcademicModule('subjects'));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete subject');
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({
      subjectName: '',
      subjectCode: '',
      subjectType: 'theory',
      boards: [],
      optional: false,
    });
  };

  const toggleBoard = (boardId: string) => {
    const newBoards = formData.boards.includes(boardId)
      ? formData.boards.filter((id) => id !== boardId)
      : [...formData.boards, boardId];
    setFormData({ ...formData, boards: newBoards });
  };

  const filteredSubjects = showInactive ? subjects : subjects.filter((s: any) => s.active !== false);

  if (loadingOptions) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const bottomPad = insets.bottom + 90;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: bottomPad }}>
      <FadeInView>
        <View style={styles.header}>
          <TouchableOpacity style={styles.back} activeOpacity={0.7} onPress={() => router.back()}>
            <ArrowLeft size={17} color="#fff" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>SUBJECT</Text>
        </View>
      </FadeInView>

      {/* Form Card */}
      <FadeInView delay={70}>
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>ADD SUBJECT</Text>
          <Text style={styles.sectionTitle}>Main Parameters</Text>

          <Text style={styles.inputLabel}>* Subject</Text>
          <TextInput
            style={styles.input}
            placeholder="Subject"
            placeholderTextColor={COLORS.textMuted}
            value={formData.subjectName}
            onChangeText={(text) => setFormData({ ...formData, subjectName: text })}
          />

          <Text style={styles.inputLabel}>Subject Code</Text>
          <TextInput
            style={styles.input}
            placeholder="Subject Code"
            placeholderTextColor={COLORS.textMuted}
            value={formData.subjectCode}
            onChangeText={(text) => setFormData({ ...formData, subjectCode: text })}
          />

          <Text style={styles.inputLabel}>* Subject Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.subjectType}
              onValueChange={(value) => setFormData({ ...formData, subjectType: value })}
              style={styles.picker}
            >
              <Picker.Item label="Theory" value="theory" />
              <Picker.Item label="Practical" value="practical" />
            </Picker>
          </View>

          <Text style={styles.inputLabel}>Boards</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue=""
              onValueChange={(value) => {
                if (value) toggleBoard(value);
              }}
              style={styles.picker}
            >
              <Picker.Item label="Select board(s) - optional" value="" />
              {boards.map((board) => (
                <Picker.Item key={board._id} label={board.data?.shortName || board.name} value={board._id} />
              ))}
            </Picker>
          </View>
          {formData.boards.length > 0 && (
            <View style={styles.selectedChips}>
              {formData.boards.map((boardId) => {
                const board = boards.find((b) => b._id === boardId);
                const boardName = board?.data?.shortName || board?.name || boardId;
                return (
                  <View key={boardId} style={styles.chip}>
                    <Text style={styles.chipText}>{boardName}</Text>
                    <TouchableOpacity onPress={() => toggleBoard(boardId)}>
                      <Text style={styles.chipRemove}>×</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.switchRow}>
            <Text style={styles.inputLabel}>Optional Subject</Text>
            <Switch
              value={formData.optional}
              onValueChange={(value) => setFormData({ ...formData, optional: value })}
              trackColor={{ false: '#e2d3c8', true: COLORS.primaryLight }}
              thumbColor={formData.optional ? COLORS.primary : '#fff'}
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.submitButton, editing && styles.updateButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>{editing ? 'Update' : 'Submit'}</Text>
            </TouchableOpacity>
            {editing && (
              <TouchableOpacity activeOpacity={0.7} style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </FadeInView>

      {/* List Card */}
      <FadeInView delay={140}>
        <View style={styles.listCard}>
          <View style={styles.listHeader}>
            <Text style={styles.cardTitle}>SUBJECT LIST</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.inactiveButton, showInactive && styles.inactiveButtonActive]}
                onPress={() => setShowInactive(!showInactive)}
              >
                <Text style={styles.inactiveButtonText}>{showInactive ? 'Hide Inactive' : 'Inactive'}</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.8} style={styles.addButton}>
                <Text style={styles.addButtonText}>Add Subject</Text>
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
          ) : filteredSubjects.length > 0 ? (
            filteredSubjects.map((record: any, index: number) => (
              <FadeInView key={record._id} delay={Math.min(index, 8) * 45} style={styles.recordCard}>
                <View style={styles.recordRow}>
                  <Text style={styles.recordLabel}>Subject:</Text>
                  <Text style={[styles.recordValue, styles.subjectName]}>{record.subject_name || '-'}</Text>
                </View>
                <View style={styles.recordRow}>
                  <Text style={styles.recordLabel}>Code:</Text>
                  <Text style={styles.recordValue}>{record.subject_codename || '-'}</Text>
                </View>
                <View style={styles.recordRow}>
                  <Text style={styles.recordLabel}>Type:</Text>
                  <Text style={styles.recordValue}>{record.subject_type || 'theory'}</Text>
                </View>
                <View style={styles.recordRow}>
                  <Text style={styles.recordLabel}>Boards:</Text>
                  <View style={styles.boardChips}>
                    {record.boards?.length > 0 ? (
                      record.boards.map((boardId: string) => {
                        const board = boards.find((b) => b._id === boardId);
                        const boardName = board?.data?.shortName || board?.name || boardId;
                        return (
                          <View key={boardId} style={[styles.boardChip, styles.boardChipBlue]}>
                            <Text style={styles.boardChipTextBlue}>{boardName}</Text>
                          </View>
                        );
                      })
                    ) : (
                      <Text style={styles.noDataText}>-</Text>
                    )}
                  </View>
                </View>
                <View style={styles.recordRow}>
                  <Text style={styles.recordLabel}>Optional:</Text>
                  <View style={[styles.boardChip, record.optional ? styles.boardChipYellow : styles.boardChipGray]}>
                    <Text style={[styles.boardChipText, record.optional ? styles.boardChipTextYellow : {}]}>
                      {record.optional ? 'Optional' : 'Core'}
                    </Text>
                  </View>
                </View>
                <View style={styles.recordRow}>
                  <Text style={styles.recordLabel}>Status:</Text>
                  <Switch
                    value={record.active !== false}
                    onValueChange={(value) => {
                      dispatch(
                        updateAcademicRecord({
                          module: 'subjects',
                          id: record._id,
                          payload: { active: value },
                        })
                      );
                    }}
                    trackColor={{ false: '#e2d3c8', true: COLORS.primaryLight }}
                    thumbColor={record.active !== false ? COLORS.primary : '#fff'}
                  />
                </View>
                <View style={styles.actionRow}>
                  <TouchableOpacity activeOpacity={0.7} style={styles.editButton} onPress={() => handleEdit(record)}>
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.deleteButton}
                    onPress={() => handleDelete(record._id)}
                  >
                    <Trash2 size={13} color={COLORS.red} />
                    <Text style={styles.deleteButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </FadeInView>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📚</Text>
              <Text style={styles.emptyText}>No Data</Text>
            </View>
          )}
        </View>
      </FadeInView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  loadingText: { marginTop: 12, fontSize: 13, color: COLORS.textMuted },
  header: { backgroundColor: COLORS.primary, padding: 20, paddingTop: 26 },
  back: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 14 },
  backText: { color: '#fff', fontSize: 11 },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
  formCard: {
    backgroundColor: COLORS.surface,
    margin: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  listCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.amber,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13, flexWrap: 'wrap', gap: 8 },
  headerButtons: { flexDirection: 'row', gap: 8 },
  cardTitle: { color: COLORS.primary, fontWeight: '800', fontSize: 13, marginBottom: 13 },
  sectionTitle: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted, marginBottom: 13 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#7a6a5f', marginBottom: 7 },
  pickerContainer: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, marginBottom: 14, overflow: 'hidden', backgroundColor: '#fffdfb' },
  picker: { height: 48 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 11,
    fontSize: 13,
    color: COLORS.textDark,
    marginBottom: 14,
    backgroundColor: '#fffdfb',
  },
  selectedChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },
  chipText: { fontSize: 10.5, color: COLORS.blue, fontWeight: '500' },
  chipRemove: { fontSize: 16, color: COLORS.blue, fontWeight: '600' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  buttonRow: { flexDirection: 'row', gap: 8 },
  submitButton: { flex: 1, backgroundColor: COLORS.primary, paddingVertical: 11, borderRadius: 8, alignItems: 'center' },
  updateButton: { backgroundColor: COLORS.blue },
  submitButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  cancelButton: {
    paddingVertical: 11,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelButtonText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  inactiveButton: { backgroundColor: COLORS.primaryLight, paddingVertical: 6, paddingHorizontal: 9, borderRadius: 6 },
  inactiveButtonActive: { backgroundColor: COLORS.green },
  inactiveButtonText: { color: '#fff', fontSize: 9.5, fontWeight: '700' },
  addButton: { backgroundColor: COLORS.amber, paddingVertical: 6, paddingHorizontal: 9, borderRadius: 6 },
  addButtonText: { color: '#fff', fontSize: 9.5, fontWeight: '700' },
  recordCard: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#fdf1e8' },
  recordRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 },
  recordLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
  recordValue: { fontSize: 12, color: COLORS.textDark, fontWeight: '600' },
  subjectName: { color: COLORS.primary },
  boardChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, flex: 1, justifyContent: 'flex-end' },
  boardChip: { backgroundColor: '#e5e7eb', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 8 },
  boardChipText: { fontSize: 9.5, color: '#374151', fontWeight: '500' },
  boardChipBlue: { backgroundColor: '#e0f2fe' },
  boardChipTextBlue: { fontSize: 9.5, color: '#0369a1', fontWeight: '500' },
  boardChipYellow: { backgroundColor: '#fff6e0' },
  boardChipTextYellow: { color: '#a06600' },
  boardChipGray: { backgroundColor: '#e5e7eb' },
  noDataText: { fontSize: 11, color: COLORS.textMuted },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  editButton: { backgroundColor: '#fff6e0', paddingVertical: 6, paddingHorizontal: 11, borderRadius: 6 },
  editButtonText: { fontSize: 11, color: '#a06600', fontWeight: '600' },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef2f2',
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 6,
  },
  deleteButtonText: { fontSize: 11, color: COLORS.red, fontWeight: '500' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 44, opacity: 0.3 },
  emptyText: { marginTop: 10, fontSize: 14, color: COLORS.textMuted },
});