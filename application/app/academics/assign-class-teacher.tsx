import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Animated,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, X, UsersRound } from 'lucide-react-native';
import type { AppDispatch, RootState } from '@/state/store';
import {
  fetchAcademicModule,
  createAcademicRecord,
  updateAcademicRecord,
  deleteAcademicRecord,
  fetchClassesForDropdown,
  fetchTeachersForDropdown,
  fetchSectionsForDropdown,
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

export default function AssignClassTeacher() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { modules, loading, error, dropdownData } = useSelector(
    (state: RootState) => state.academicModule
  );
  const classTeachers = modules['class-teacher'] || [];
  const classes = dropdownData.classes || [];
  const teachers = dropdownData.teachers || [];
  const sections = dropdownData.sections || [];

  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({
    class: '',
    sections: [] as string[],
    teacher: '',
    status: 'Active',
  });
  const [showInactive, setShowInactive] = useState(false);

  // modal entrance animation
  const modalAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (openDialog) {
      modalAnim.setValue(0);
      Animated.spring(modalAnim, { toValue: 1, useNativeDriver: true, friction: 8, tension: 60 }).start();
    }
  }, [openDialog]);

  useEffect(() => {
    dispatch(fetchAcademicModule('class-teacher'));
    dispatch(fetchClassesForDropdown());
    dispatch(fetchTeachersForDropdown());
    dispatch(fetchSectionsForDropdown(undefined));
  }, [dispatch]);

  const handleOpenDialog = () => {
    setFormData({ class: '', sections: [], teacher: '', status: 'Active' });
    setEditing(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditing(null);
  };

  const handleEdit = (record: any) => {
    setFormData({
      class: record.class?._id || '',
      sections: record.sections?.map((s: any) => s._id) || [],
      teacher: record.teacher?._id || '',
      status: record.status || 'Active',
    });
    setEditing(record);
    setOpenDialog(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Assignment',
      'Are you sure you want to delete this assignment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteAcademicRecord({ module: 'class-teacher', id })),
        },
      ]
    );
  };

  const handleSubmit = () => {
    if (!formData.class || !formData.teacher) {
      Alert.alert('Validation Error', 'Please select class and teacher');
      return;
    }

    const payload = {
      class: formData.class,
      sections: formData.sections,
      teacher: formData.teacher,
      status: formData.status,
    };

    if (editing) {
      dispatch(updateAcademicRecord({ module: 'class-teacher', id: editing._id, payload })).then(() => {
        handleCloseDialog();
      });
    } else {
      dispatch(createAcademicRecord({ module: 'class-teacher', payload })).then(() => {
        handleCloseDialog();
      });
    }
  };

  const handleClassChange = (classId: string) => {
    setFormData({ ...formData, class: classId, sections: [] });
    dispatch(fetchSectionsForDropdown(undefined));
  };

  const toggleSection = (sectionId: string) => {
    const newSections = formData.sections.includes(sectionId)
      ? formData.sections.filter((id) => id !== sectionId)
      : [...formData.sections, sectionId];
    setFormData({ ...formData, sections: newSections });
  };

  const filteredClassTeachers = showInactive
    ? classTeachers
    : classTeachers.filter((ct) => ct.status === 'Active');

  const bottomPad = insets.bottom + 90;

  return (
    <View style={styles.page}>
      <FadeInView>
        <View style={styles.header}>
          <TouchableOpacity style={styles.back} activeOpacity={0.7} onPress={() => router.back()}>
            <ArrowLeft size={17} color="#fff" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>ASSIGN CLASS TEACHER</Text>
          <Text style={styles.subtitle}>Academic module</Text>
        </View>
      </FadeInView>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: bottomPad }}>
        <FadeInView delay={70}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <UsersRound size={18} color={COLORS.primary} />
              <Text style={styles.cardTitle}>ASSIGN CLASS TEACHER</Text>
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
                <Text style={styles.addButtonText}>ADD CLASS TEACHER</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator style={styles.loader} color={COLORS.primary} />
            ) : filteredClassTeachers.length > 0 ? (
              filteredClassTeachers.map((row, index) => (
                <FadeInView key={row._id} delay={Math.min(index, 8) * 45} style={styles.row}>
                  <View style={styles.rowContent}>
                    <View style={styles.rowField}>
                      <Text style={styles.fieldLabel}>Class:</Text>
                      <Text style={styles.fieldValue}>{row.class?.class_text || '-'}</Text>
                    </View>
                    <View style={styles.rowField}>
                      <Text style={styles.fieldLabel}>Sections:</Text>
                      <Text style={styles.fieldValue}>
                        {row.sections?.length > 0 ? row.sections.map((s) => s.name).join(', ') : '-'}
                      </Text>
                    </View>
                    <View style={styles.rowField}>
                      <Text style={styles.fieldLabel}>Teacher:</Text>
                      <Text style={styles.fieldValue}>{row.teacher?.name || '-'}</Text>
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
              <Text style={styles.modalTitle}>{editing ? 'EDIT CLASS TEACHER' : 'ADD CLASS TEACHER'}</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={handleCloseDialog}>
                <X size={19} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formField}>
                <Text style={styles.label}>Assign Classes *</Text>
                <ScrollView style={styles.pickerContainer} showsVerticalScrollIndicator={false}>
                  {classes.map((cls) => (
                    <TouchableOpacity
                      key={cls._id}
                      activeOpacity={0.7}
                      style={[styles.pickerItem, formData.class === cls._id && styles.pickerItemSelected]}
                      onPress={() => handleClassChange(cls._id)}
                    >
                      <Text style={[styles.pickerItemText, formData.class === cls._id && styles.pickerItemTextSelected]}>
                        {cls.class_text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Assign Sections</Text>
                {sections.length > 0 ? (
                  sections.map((section) => (
                    <TouchableOpacity
                      key={section._id}
                      activeOpacity={0.7}
                      style={[styles.checkboxItem, formData.sections.includes(section._id) && styles.checkboxItemSelected]}
                      onPress={() => toggleSection(section._id)}
                    >
                      <View style={[styles.checkbox, formData.sections.includes(section._id) && styles.checkboxSelected]} />
                      <Text style={styles.checkboxText}>{section.name}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noDataText}>No sections available</Text>
                )}
              </View>

              <View style={styles.formField}>
                <Text style={styles.label}>Teacher *</Text>
                <ScrollView style={styles.pickerContainer} showsVerticalScrollIndicator={false}>
                  {teachers.map((teacher) => (
                    <TouchableOpacity
                      key={teacher._id}
                      activeOpacity={0.7}
                      style={[styles.pickerItem, formData.teacher === teacher._id && styles.pickerItemSelected]}
                      onPress={() => setFormData({ ...formData, teacher: teacher._id })}
                    >
                      <Text style={[styles.pickerItemText, formData.teacher === teacher._id && styles.pickerItemTextSelected]}>
                        {teacher.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
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
                style={[styles.submitButton, (!formData.class || !formData.teacher) && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={!formData.class || !formData.teacher}
              >
                <Text style={styles.submitButtonText}>{editing ? 'Update' : 'Assign'}</Text>
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
  fieldLabel: { color: COLORS.textMuted, fontSize: 10.5, width: 66 },
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
  pickerContainer: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, maxHeight: 120 },
  pickerItem: { paddingVertical: 9, paddingHorizontal: 11, borderBottomWidth: 1, borderBottomColor: '#fdf1e8' },
  pickerItemSelected: { backgroundColor: '#fff1e6' },
  pickerItemText: { color: '#5c4b40', fontSize: 12.5 },
  pickerItemTextSelected: { color: COLORS.primary, fontWeight: '700' },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 11,
    backgroundColor: '#fffaf6',
    borderRadius: 8,
    marginBottom: 6,
  },
  checkboxItemSelected: { backgroundColor: '#fff1e6' },
  checkbox: { width: 17, height: 17, borderRadius: 4, borderWidth: 2, borderColor: '#e2d3c8', marginRight: 8 },
  checkboxSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkboxText: { color: '#5c4b40', fontSize: 12.5 },
  noDataText: { color: COLORS.textMuted, fontSize: 11.5, fontStyle: 'italic' },
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