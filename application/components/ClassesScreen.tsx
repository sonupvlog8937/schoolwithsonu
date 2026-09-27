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
import { ArrowLeft, Save, Trash2 } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import type { AppDispatch, RootState } from '@/state/store';
import {
  createAcademicRecord,
  deleteAcademicRecord,
  fetchAcademicModule,
  updateAcademicRecord,
} from '@/state/academicModuleSlice';
import { fetchDataFromApi } from '@/utils/api';

// ---------- colourful white + orange theme ----------
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
  headCell: '#fff1e6',
  textMuted: '#a68a7a',
  textDark: '#3a2a20',
};

// ---------- small reusable fade+slide-up entrance wrapper ----------
function FadeInView({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: any;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 350,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export default function ClassesScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const classes = useSelector((state: RootState) => state.academicModule.modules.classes || []);
  const loading = useSelector((state: RootState) => state.academicModule.loading);

  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  const [formData, setFormData] = useState({
    sectionId: '',
    className: '',
    position: '0',
    subjects: [] as string[],
    additionalSubjects: [] as string[],
  });
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingOptions(true);

      const [sectionsRes, subjectsRes] = await Promise.all([
        fetchDataFromApi('/sections'),
        fetchDataFromApi('/subject/fetch-all'),
      ]);

      setSections(sectionsRes?.data || []);
      setSubjects(subjectsRes?.data || []);
      dispatch(fetchAcademicModule('classes'));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.className.trim() || !formData.sectionId) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }

    const payload = {
      class_text: formData.className,
      class_num: Number(formData.position) || 0,
      section: formData.sectionId,
      asignSubTeach: formData.subjects.map((subId) => ({ subject: subId, teacher: null })),
      additionalSubjects: formData.additionalSubjects,
    };

    try {
      if (editing) {
        await dispatch(
          updateAcademicRecord({ module: 'classes', id: editing, payload })
        ).unwrap();
        setEditing(null);
      } else {
        await dispatch(createAcademicRecord({ module: 'classes', payload })).unwrap();
      }

      setFormData({
        sectionId: '',
        className: '',
        position: '0',
        subjects: [],
        additionalSubjects: [],
      });
      dispatch(fetchAcademicModule('classes'));
    } catch (error) {
      console.error('Error saving class:', error);
      Alert.alert('Error', 'Failed to save class');
    }
  };

  const handleEdit = (record: any) => {
    setEditing(record._id);
    setFormData({
      sectionId: record.section?._id || '',
      className: record.class_text || '',
      position: String(record.class_num || 0),
      subjects: record.asignSubTeach?.map((item: any) => item.subject?._id || item.subject) || [],
      additionalSubjects: record.additionalSubjects || [],
    });
  };

  const handleDelete = (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to remove this class?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(deleteAcademicRecord({ module: 'classes', id })).unwrap();
            dispatch(fetchAcademicModule('classes'));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete class');
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({
      sectionId: '',
      className: '',
      position: '0',
      subjects: [],
      additionalSubjects: [],
    });
  };

  const toggleSubject = (subjectId: string, isAdditional: boolean) => {
    if (isAdditional) {
      const newAdditionalSubjects = formData.additionalSubjects.includes(subjectId)
        ? formData.additionalSubjects.filter((id) => id !== subjectId)
        : [...formData.additionalSubjects, subjectId];
      setFormData({ ...formData, additionalSubjects: newAdditionalSubjects });
    } else {
      const newSubjects = formData.subjects.includes(subjectId)
        ? formData.subjects.filter((id) => id !== subjectId)
        : [...formData.subjects, subjectId];
      setFormData({ ...formData, subjects: newSubjects });
    }
  };

  const filteredClasses = showInactive ? classes : classes.filter((c: any) => c.active !== false);

  if (loadingOptions) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // extra bottom space so the tab bar never covers the list content
  const bottomPad = insets.bottom + 90;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: bottomPad }}>
      <FadeInView>
        <View style={styles.header}>
          <TouchableOpacity style={styles.back} activeOpacity={0.7} onPress={() => router.back()}>
            <ArrowLeft size={17} color="#fff" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>CLASS</Text>
        </View>
      </FadeInView>

      {/* Form Card */}
      <FadeInView delay={70}>
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>CLASS</Text>

          <Text style={styles.inputLabel}>* Section</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.sectionId}
              onValueChange={(value) => setFormData({ ...formData, sectionId: value })}
              style={styles.picker}
            >
              <Picker.Item label="Select Section" value="" />
              {sections.map((section) => (
                <Picker.Item key={section._id} label={section.name} value={section._id} />
              ))}
            </Picker>
          </View>

          <Text style={styles.inputLabel}>* Class Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Class Name"
            placeholderTextColor={COLORS.textMuted}
            value={formData.className}
            onChangeText={(text) => setFormData({ ...formData, className: text })}
          />

          <Text style={styles.inputLabel}>Position (sort order)</Text>
          <TextInput
            style={styles.input}
            placeholder="Position"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numeric"
            value={formData.position}
            onChangeText={(text) => setFormData({ ...formData, position: text })}
          />

          <Text style={styles.inputLabel}>Subjects</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue=""
              onValueChange={(value) => value && toggleSubject(value, false)}
              style={styles.picker}
            >
              <Picker.Item label="Select core subjects" value="" />
              {subjects.map((subject) => (
                <Picker.Item key={subject._id} label={subject.subject_name} value={subject._id} />
              ))}
            </Picker>
          </View>
          {formData.subjects.length > 0 && (
            <View style={styles.selectedChips}>
              {formData.subjects.map((subId) => {
                const subject = subjects.find((s) => s._id === subId);
                return (
                  <View key={subId} style={styles.chip}>
                    <Text style={styles.chipText}>{subject?.subject_name || subId}</Text>
                    <TouchableOpacity onPress={() => toggleSubject(subId, false)}>
                      <Text style={styles.chipRemove}>×</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          <Text style={styles.inputLabel}>Additional Subjects</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue=""
              onValueChange={(value) => value && toggleSubject(value, true)}
              style={styles.picker}
            >
              <Picker.Item label="Select optional / additional subjects" value="" />
              {subjects.map((subject) => (
                <Picker.Item key={subject._id} label={subject.subject_name} value={subject._id} />
              ))}
            </Picker>
          </View>
          {formData.additionalSubjects.length > 0 && (
            <View style={styles.selectedChips}>
              {formData.additionalSubjects.map((subId) => {
                const subject = subjects.find((s) => s._id === subId);
                return (
                  <View key={subId} style={[styles.chip, styles.chipAmber]}>
                    <Text style={styles.chipTextAmber}>{subject?.subject_name || subId}</Text>
                    <TouchableOpacity onPress={() => toggleSubject(subId, true)}>
                      <Text style={styles.chipRemoveAmber}>×</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

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
            <Text style={styles.cardTitle}>CLASS LIST</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity activeOpacity={0.8} style={styles.saveButton}>
                <Save size={11} color="#fff" />
                <Text style={styles.saveButtonText}>Save Positions</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.inactiveButton, showInactive && styles.inactiveButtonActive]}
                onPress={() => setShowInactive(!showInactive)}
              >
                <Text style={styles.inactiveButtonText}>
                  {showInactive ? 'Hide Inactive' : 'Inactive'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />
          ) : filteredClasses.length > 0 ? (
            filteredClasses.map((record: any, index: number) => (
              <FadeInView key={record._id} delay={Math.min(index, 8) * 45} style={styles.recordCard}>
                <View style={styles.recordRow}>
                  <Text style={styles.recordLabel}>Class Name:</Text>
                  <Text style={styles.recordValue}>{record.class_text || '-'}</Text>
                </View>
                <View style={styles.recordRow}>
                  <Text style={styles.recordLabel}>Position:</Text>
                  <TextInput
                    style={styles.positionInput}
                    keyboardType="numeric"
                    value={String(record.class_num || 0)}
                    onChangeText={(value) =>
                      dispatch(
                        updateAcademicRecord({
                          module: 'classes',
                          id: record._id,
                          payload: { class_num: Number(value) },
                        })
                      )
                    }
                  />
                </View>
                <View style={styles.recordRow}>
                  <Text style={styles.recordLabel}>Subjects:</Text>
                  <Text style={styles.recordValue}>{record.asignSubTeach?.length || 0}</Text>
                </View>
                <View style={styles.recordRow}>
                  <Text style={styles.recordLabel}>Additional:</Text>
                  <Text style={styles.recordValue}>{record.additionalSubjects?.length || 0}</Text>
                </View>
                <View style={styles.recordRow}>
                  <Text style={styles.recordLabel}>Status:</Text>
                  <Switch
                    value={record.active !== false}
                    onValueChange={(value) => {
                      dispatch(
                        updateAcademicRecord({
                          module: 'classes',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
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
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
    flexWrap: 'wrap',
    gap: 8,
  },
  headerButtons: { flexDirection: 'row', gap: 8 },
  cardTitle: { color: COLORS.primary, fontWeight: '800', fontSize: 13, marginBottom: 13 },
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
    backgroundColor: '#fff1e6',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },
  chipText: { fontSize: 10.5, color: COLORS.primaryDark, fontWeight: '500' },
  chipRemove: { fontSize: 16, color: COLORS.primaryDark, fontWeight: '600' },
  chipAmber: { backgroundColor: '#fff6e0' },
  chipTextAmber: { fontSize: 10.5, color: '#a06600', fontWeight: '500' },
  chipRemoveAmber: { fontSize: 16, color: '#a06600', fontWeight: '600' },
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
  saveButton: {
    backgroundColor: COLORS.amber,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 6,
  },
  saveButtonText: { color: '#fff', fontSize: 9.5, fontWeight: '700' },
  inactiveButton: { backgroundColor: COLORS.primaryLight, paddingVertical: 6, paddingHorizontal: 9, borderRadius: 6 },
  inactiveButtonActive: { backgroundColor: COLORS.green },
  inactiveButtonText: { color: '#fff', fontSize: 9.5, fontWeight: '700' },
  recordCard: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#fdf1e8' },
  recordRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 },
  recordLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
  recordValue: { fontSize: 12, color: COLORS.textDark, fontWeight: '600' },
  positionInput: {
    width: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 5,
    fontSize: 10.5,
    textAlign: 'center',
    borderRadius: 5,
    color: COLORS.textDark,
  },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  editButton: { backgroundColor: '#fff6e0', paddingVertical: 6, paddingHorizontal: 11, borderRadius: 6 },
  editButtonText: { fontSize: 11, color: '#a06600', fontWeight: '600' },
  deleteButton: { backgroundColor: '#fef2f2', paddingVertical: 6, paddingHorizontal: 11, borderRadius: 6 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 44, opacity: 0.3 },
  emptyText: { marginTop: 10, fontSize: 14, color: COLORS.textMuted },
});