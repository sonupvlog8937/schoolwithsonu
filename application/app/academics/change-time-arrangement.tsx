import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Clock, CheckCircle, X, Edit2, Trash2 } from 'lucide-react-native';
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
import FadeInView from '@/components/FadeInView';
import AnimatedButton from '@/components/AnimatedButton';

const CHIP_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#f43f5e', '#06b6d4'];

export default function ChangeTimeArrangement() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { modules, loading, dropdownData } = useSelector((state: RootState) => state.academicModule);
  const changeArrangements = modules['change-arrangement'] || [];
  const classes = dropdownData.classes || [];
  const teachers = dropdownData.teachers || [];
  const sections = dropdownData.sections || [];

  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({
    class: '',
    sections: [] as string[],
    absentTeacher: '',
    assignTeacher: '',
    date: '',
    status: 'Active',
  });
  const [showInactive, setShowInactive] = useState(false);
  const [filterClass, setFilterClass] = useState('');

  useEffect(() => {
    dispatch(fetchAcademicModule('change-arrangement'));
    dispatch(fetchClassesForDropdown());
    dispatch(fetchTeachersForDropdown());
    dispatch(fetchSectionsForDropdown(undefined));
  }, [dispatch]);

  const handleEdit = (record: any) => {
    setFormData({
      class: record.class?._id || '',
      sections: record.sections?.map((s: any) => s._id) || [],
      absentTeacher: record.absentTeacher?._id || '',
      assignTeacher: record.assignTeacher?._id || '',
      date: record.date || '',
      status: record.status || 'Active',
    });
    setEditing(record);
  };

  const handleDelete = (id: string) => {
    dispatch(deleteAcademicRecord({ module: 'change-arrangement', id }));
  };

  const handleSubmit = () => {
    if (!formData.class || !formData.absentTeacher || !formData.assignTeacher || !formData.date) {
      alert('Please fill all required fields');
      return;
    }

    const payload = {
      class: formData.class,
      sections: formData.sections,
      absentTeacher: formData.absentTeacher,
      assignTeacher: formData.assignTeacher,
      date: formData.date,
      status: formData.status,
    };

    if (editing) {
      dispatch(updateAcademicRecord({ module: 'change-arrangement', id: editing._id, payload })).then(() => {
        setEditing(null);
        setFormData({ class: '', sections: [], absentTeacher: '', assignTeacher: '', date: '', status: 'Active' });
      });
    } else {
      dispatch(createAcademicRecord({ module: 'change-arrangement', payload })).then(() => {
        setFormData({ class: '', sections: [], absentTeacher: '', assignTeacher: '', date: '', status: 'Active' });
      });
    }
  };

  const handleClassChange = (classId: string) => {
    setFormData({ ...formData, class: classId, sections: [] });
    dispatch(fetchSectionsForDropdown(undefined));
  };

  const handleSectionToggle = (sectionId: string) => {
    const newSections = formData.sections.includes(sectionId)
      ? formData.sections.filter((id) => id !== sectionId)
      : [...formData.sections, sectionId];
    setFormData({ ...formData, sections: newSections });
  };

  const filteredArrangements = showInactive
    ? changeArrangements
    : changeArrangements.filter((ca: any) => ca.status === 'Active');

  const filteredByClass = filterClass
    ? filteredArrangements.filter((ca: any) => ca.class?._id === filterClass)
    : filteredArrangements;

  return (
    <View style={styles.page}>
      <LinearGradient colors={['#6366f1', '#8b5cf6', '#d946ef']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <AnimatedButton style={styles.back} onPress={() => router.back()}>
          <ArrowLeft size={17} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </AnimatedButton>
        <Text style={styles.title}>Change Time Arrangement</Text>
        <Text style={styles.subtitle}>Academic module</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Form Section */}
        <FadeInView style={styles.card}>
          <View style={styles.cardHeader}>
            <Clock size={18} color="#6366f1" />
            <Text style={styles.cardTitle}>{editing ? 'Edit Arrangement' : 'Assign Teacher'}</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Class *</Text>
            <View style={styles.pickerContainer}>
              {classes.map((cls: any, i: number) => {
                const active = formData.class === cls._id;
                const color = CHIP_COLORS[i % CHIP_COLORS.length];
                return (
                  <AnimatedButton
                    key={cls._id}
                    style={[styles.pickerOption, active && { backgroundColor: color, borderColor: color }]}
                    onPress={() => handleClassChange(cls._id)}
                  >
                    <Text style={[styles.pickerOptionText, active && styles.pickerOptionTextSelected]}>
                      {cls.class_text}
                    </Text>
                  </AnimatedButton>
                );
              })}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Section</Text>
            <View style={styles.sectionGrid}>
              {sections.map((section: any, i: number) => {
                const active = formData.sections.includes(section._id);
                const color = CHIP_COLORS[(i + 3) % CHIP_COLORS.length];
                return (
                  <AnimatedButton
                    key={section._id}
                    style={[styles.sectionChip, active && { backgroundColor: color, borderColor: color }]}
                    onPress={() => handleSectionToggle(section._id)}
                  >
                    <Text style={[styles.sectionChipText, active && styles.sectionChipTextSelected]}>
                      {section.name}
                    </Text>
                  </AnimatedButton>
                );
              })}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Absent Teacher *</Text>
            <View style={styles.pickerContainer}>
              {teachers.map((teacher: any, i: number) => {
                const active = formData.absentTeacher === teacher._id;
                return (
                  <AnimatedButton
                    key={teacher._id}
                    style={[styles.pickerOption, active && { backgroundColor: '#f43f5e', borderColor: '#f43f5e' }]}
                    onPress={() => setFormData({ ...formData, absentTeacher: teacher._id })}
                  >
                    <Text style={[styles.pickerOptionText, active && styles.pickerOptionTextSelected]}>
                      {teacher.name}
                    </Text>
                  </AnimatedButton>
                );
              })}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Assign Teacher *</Text>
            <View style={styles.pickerContainer}>
              {teachers.map((teacher: any) => {
                const active = formData.assignTeacher === teacher._id;
                return (
                  <AnimatedButton
                    key={teacher._id}
                    style={[styles.pickerOption, active && { backgroundColor: '#10b981', borderColor: '#10b981' }]}
                    onPress={() => setFormData({ ...formData, assignTeacher: teacher._id })}
                  >
                    <Text style={[styles.pickerOptionText, active && styles.pickerOptionTextSelected]}>
                      {teacher.name}
                    </Text>
                  </AnimatedButton>
                );
              })}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date *</Text>
            <TextInput
              style={styles.input}
              placeholder="DD-MM-YYYY"
              value={formData.date}
              onChangeText={(text) => setFormData({ ...formData, date: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusContainer}>
              <AnimatedButton
                style={[styles.statusOption, formData.status === 'Active' && { backgroundColor: '#10b981', borderColor: '#10b981' }]}
                onPress={() => setFormData({ ...formData, status: 'Active' })}
              >
                <Text style={[styles.statusOptionText, formData.status === 'Active' && styles.statusOptionTextSelected]}>
                  Active
                </Text>
              </AnimatedButton>
              <AnimatedButton
                style={[styles.statusOption, formData.status === 'Inactive' && { backgroundColor: '#94a3b8', borderColor: '#94a3b8' }]}
                onPress={() => setFormData({ ...formData, status: 'Inactive' })}
              >
                <Text style={[styles.statusOptionText, formData.status === 'Inactive' && styles.statusOptionTextSelected]}>
                  Inactive
                </Text>
              </AnimatedButton>
            </View>
          </View>

          <AnimatedButton
            style={[
              styles.submitButton,
              (!formData.class || !formData.absentTeacher || !formData.assignTeacher || !formData.date) &&
                styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!formData.class || !formData.absentTeacher || !formData.assignTeacher || !formData.date}
          >
            <Text style={styles.submitButtonText}>{editing ? 'Update' : 'Submit'}</Text>
          </AnimatedButton>
        </FadeInView>

        {/* List Section */}
        <FadeInView delay={80} style={styles.card}>
          <View style={styles.cardHeader}>
            <Calendar size={18} color="#8b5cf6" />
            <Text style={[styles.cardTitle, { color: '#8b5cf6' }]}>Changed Timetable List</Text>
          </View>

          <View style={styles.filterContainer}>
            <AnimatedButton
              style={[styles.filterButton, showInactive && { backgroundColor: '#8b5cf6' }]}
              onPress={() => setShowInactive(!showInactive)}
            >
              <Text style={[styles.filterButtonText, showInactive && styles.filterButtonTextActive]}>
                {showInactive ? 'Showing Inactive' : 'Show Inactive'}
              </Text>
            </AnimatedButton>
          </View>

          <View style={styles.classFilterContainer}>
            <Text style={styles.filterLabel}>Filter by Class:</Text>
            <View style={styles.classFilterGrid}>
              <AnimatedButton
                style={[styles.classFilterChip, filterClass === '' && { backgroundColor: '#3b3f5c', borderColor: '#3b3f5c' }]}
                onPress={() => setFilterClass('')}
              >
                <Text style={[styles.classFilterChipText, filterClass === '' && styles.classFilterChipTextSelected]}>
                  All
                </Text>
              </AnimatedButton>
              {classes.map((cls: any, i: number) => {
                const active = filterClass === cls._id;
                const color = CHIP_COLORS[i % CHIP_COLORS.length];
                return (
                  <AnimatedButton
                    key={cls._id}
                    style={[styles.classFilterChip, active && { backgroundColor: color, borderColor: color }]}
                    onPress={() => setFilterClass(cls._id)}
                  >
                    <Text style={[styles.classFilterChipText, active && styles.classFilterChipTextSelected]}>
                      {cls.class_text}
                    </Text>
                  </AnimatedButton>
                );
              })}
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#8b5cf6" size="large" />
            </View>
          ) : (
            <View style={styles.listContainer}>
              {filteredByClass.length > 0 ? (
                filteredByClass.map((row: any, index: number) => (
                  <FadeInView key={row._id} delay={index * 60} style={styles.listItem}>
                    <View style={styles.listItemContent}>
                      <View style={styles.listItemRow}>
                        <Text style={styles.listItemLabel}>Section:</Text>
                        <Text style={styles.listItemValue}>
                          {row.sections?.length > 0 ? row.sections.map((s: any) => s.name).join(', ') : '-'}
                        </Text>
                      </View>
                      <View style={styles.listItemRow}>
                        <Text style={styles.listItemLabel}>Absent Teacher:</Text>
                        <Text style={styles.listItemValue}>{row.absentTeacher?.name || '-'}</Text>
                      </View>
                      <View style={styles.listItemRow}>
                        <Text style={styles.listItemLabel}>Assign Teacher:</Text>
                        <Text style={styles.listItemValue}>{row.assignTeacher?.name || '-'}</Text>
                      </View>
                      <View style={styles.listItemRow}>
                        <Text style={styles.listItemLabel}>Date:</Text>
                        <Text style={styles.listItemValue}>{row.date || '-'}</Text>
                      </View>
                      <View style={styles.listItemRow}>
                        <Text style={styles.listItemLabel}>Status:</Text>
                        <View style={styles.statusBadge}>
                          <CheckCircle size={13} color={row.status === 'Active' ? '#10b981' : '#a0aec0'} />
                          <Text style={[styles.statusText, row.status === 'Active' && styles.statusTextActive]}>
                            {row.status || 'Active'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.listItemActions}>
                      <AnimatedButton style={[styles.actionButton, { backgroundColor: '#eff6ff' }]} onPress={() => handleEdit(row)}>
                        <Edit2 size={15} color="#3b82f6" />
                      </AnimatedButton>
                      <AnimatedButton style={[styles.actionButton, { backgroundColor: '#fef2f2' }]} onPress={() => handleDelete(row._id)}>
                        <Trash2 size={15} color="#f43f5e" />
                      </AnimatedButton>
                    </View>
                  </FadeInView>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <X size={44} color="#a0aec0" />
                  <Text style={styles.emptyText}>No Data</Text>
                </View>
              )}
            </View>
          )}
        </FadeInView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f4f5f9',
  },
  header: {
    padding: 22,
    paddingTop: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 18,
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: '#ede9fe',
    fontSize: 10,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 15,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 12,
  },
  cardTitle: {
    color: '#6366f1',
    fontWeight: '800',
    fontSize: 12.5,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#2d3748',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  pickerOptionText: {
    color: '#4a5568',
    fontSize: 11.5,
  },
  pickerOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  sectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  sectionChipText: {
    color: '#4a5568',
    fontSize: 11.5,
  },
  sectionChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12.5,
    color: '#2d3748',
    backgroundColor: '#f9fafb',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  statusOptionText: {
    color: '#4a5568',
    fontSize: 12.5,
    fontWeight: '600',
  },
  statusOptionTextSelected: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 12.5,
    fontWeight: '700',
  },
  filterContainer: {
    marginBottom: 12,
  },
  filterButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  filterButtonText: {
    color: '#6b7280',
    fontSize: 11.5,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  classFilterContainer: {
    marginBottom: 12,
  },
  filterLabel: {
    color: '#2d3748',
    fontSize: 11.5,
    fontWeight: '600',
    marginBottom: 8,
  },
  classFilterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  classFilterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  classFilterChipText: {
    color: '#4a5568',
    fontSize: 10.5,
  },
  classFilterChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  listContainer: {
    gap: 12,
  },
  listItem: {
    backgroundColor: '#f7fafc',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  listItemContent: {
    marginBottom: 8,
  },
  listItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  listItemLabel: {
    color: '#718096',
    fontSize: 11,
  },
  listItemValue: {
    color: '#2d3748',
    fontSize: 11,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    color: '#a0aec0',
    fontSize: 10.5,
  },
  statusTextActive: {
    color: '#10b981',
  },
  listItemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionButton: {
    padding: 7,
    borderRadius: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 45,
    gap: 8,
  },
  emptyText: {
    color: '#a0aec0',
    fontSize: 12.5,
  },
});