import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import type { AppDispatch, RootState } from '@/state/store';
import {
  fetchMasterConfig,
  createMasterConfig,
  updateMasterConfig,
  deleteMasterConfig,
} from '@/state/masterConfigurationSlice';
import { fetchDataFromApi } from '@/utils/api';

// If this screen lives inside an expo-router / react-navigation bottom
// Tab Navigator, uncomment these two lines and use `tabBarHeight` in the
// ScrollView's contentContainerStyle paddingBottom (see FIX NOTE at bottom).
// import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

// ---------- Small animated wrapper for staggered fade/slide-in ----------
const FadeInView: React.FC<{ delay?: number; style?: any; children: React.ReactNode }> = ({
  delay = 0,
  style,
  children,
}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 360,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: anim,
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const ACCENTS = ['#6366f1', '#ec4899', '#10b981', '#f97316', '#3b82f6', '#8b5cf6'];

export default function RoomAssignment() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  // const tabBarHeight = useBottomTabBarHeight(); // uncomment if inside a Tab Navigator
  const { modules } = useSelector((state: RootState) => state.masterConfiguration);
  const roomsState = modules['rooms-assign'] || { records: [], loading: false };

  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [formData, setFormData] = useState({
    classId: '',
    sectionId: '',
    roomNo: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingOptions(true);

      const [classesRes, sectionsRes] = await Promise.all([
        fetchDataFromApi('/class/fetch-all'),
        fetchDataFromApi('/sections'),
      ]);

      setClasses(classesRes?.data || []);
      setSections(sectionsRes?.data || []);

      dispatch(fetchMasterConfig('rooms-assign'));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.classId || !formData.sectionId || !formData.roomNo) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const selectedClass = classes.find((c) => c._id === formData.classId);
    const selectedSection = sections.find((s) => s._id === formData.sectionId);

    const payload = {
      name: `${selectedClass?.class_text} - ${selectedSection?.name} - Room ${formData.roomNo}`,
      data: {
        className: selectedClass?.class_text || '',
        classId: formData.classId,
        sectionName: selectedSection?.name || '',
        sectionId: formData.sectionId,
        roomNo: formData.roomNo,
      },
      active: true,
    };

    try {
      if (editingId) {
        await dispatch(
          updateMasterConfig({ module: 'rooms-assign', id: editingId, data: payload })
        ).unwrap();
        setEditingId(null);
      } else {
        await dispatch(createMasterConfig({ module: 'rooms-assign', data: payload })).unwrap();
      }

      setFormData({ classId: '', sectionId: '', roomNo: '' });
      dispatch(fetchMasterConfig('rooms-assign'));
    } catch (error) {
      console.error('Error saving room assignment:', error);
      Alert.alert('Error', 'Failed to save room assignment');
    }
  };

  const handleEdit = (record: any) => {
    setEditingId(record._id);
    setFormData({
      classId: record.data?.classId || '',
      sectionId: record.data?.sectionId || '',
      roomNo: record.data?.roomNo || '',
    });
  };

  const handleDelete = (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to remove this room assignment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(deleteMasterConfig({ module: 'rooms-assign', id })).unwrap();
            dispatch(fetchMasterConfig('rooms-assign'));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete room assignment');
          }
        },
      },
    ]);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ classId: '', sectionId: '', roomNo: '' });
  };

  if (loadingOptions) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      // FIX: bottom padding so content isn't hidden behind a bottom tab bar.
      // Swap 100 for `tabBarHeight + 24` if you enable the hook above.
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={roomsState.loading}
          onRefresh={loadInitialData}
          colors={['#6366f1']}
          tintColor="#6366f1"
        />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={['#6366f1', '#ec4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Room Assignment</Text>
          <Text style={styles.headerSubtitle}>Assign rooms to class sections</Text>
        </View>
      </LinearGradient>

      {/* Form Card */}
      <FadeInView delay={0} style={styles.formCard}>
        <View style={styles.headingRow}>
          <View style={styles.headingDot} />
          <Text style={styles.cardTitle}>CLASS ROOM</Text>
        </View>

        <Text style={styles.inputLabel}>* Class Name</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.classId}
            onValueChange={(value) => setFormData({ ...formData, classId: value })}
            style={styles.picker}
          >
            <Picker.Item label="Select Class" value="" />
            {classes.map((cls) => (
              <Picker.Item key={cls._id} label={cls.class_text} value={cls._id} />
            ))}
          </Picker>
        </View>

        <Text style={styles.inputLabel}>* Section Name</Text>
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

        <Text style={styles.inputLabel}>* Room No.</Text>
        <TextInput
          style={styles.input}
          placeholder="Room No."
          placeholderTextColor="#94a3b8"
          value={formData.roomNo}
          onChangeText={(text) => setFormData({ ...formData, roomNo: text })}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={handleSubmit} activeOpacity={0.85} style={{ flex: 1 }}>
            <LinearGradient
              colors={editingId ? ['#3b82f6', '#60a5fa'] : ['#6366f1', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>{editingId ? 'Update' : 'Submit'}</Text>
            </LinearGradient>
          </TouchableOpacity>
          {editingId && (
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} activeOpacity={0.8}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </FadeInView>

      {/* List Card */}
      <View style={styles.listCard}>
        <View style={styles.listHeader}>
          <View style={styles.headingRow}>
            <View style={[styles.headingDot, { backgroundColor: '#ec4899' }]} />
            <Text style={styles.cardTitle}>CLASS ROOM LIST</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.inactiveButton}>Inactive</Text>
          </TouchableOpacity>
        </View>

        {roomsState.loading ? (
          <ActivityIndicator size="small" color="#6366f1" style={{ marginVertical: 20 }} />
        ) : roomsState.records.length > 0 ? (
          roomsState.records.map((record: any, index: number) => {
            const accent = ACCENTS[index % ACCENTS.length];
            return (
              <FadeInView key={record._id} delay={index * 60} style={styles.recordCard}>
                <View style={[styles.recordAccent, { backgroundColor: accent }]} />
                <View style={styles.recordCardInner}>
                  <View style={styles.recordRow}>
                    <Text style={styles.recordLabel}>Class Name:</Text>
                    <View style={[styles.classPill, { backgroundColor: `${accent}18` }]}>
                      <Text style={[styles.classPillText, { color: accent }]}>
                        {record.data?.className || '-'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.recordRow}>
                    <Text style={styles.recordLabel}>Section:</Text>
                    <Text style={styles.recordValue}>{record.data?.sectionName || '-'}</Text>
                  </View>
                  <View style={styles.recordRow}>
                    <Text style={styles.recordLabel}>Room No.:</Text>
                    <Text style={styles.recordValue}>{record.data?.roomNo || '-'}</Text>
                  </View>
                  <View style={styles.recordRow}>
                    <Text style={styles.recordLabel}>Status:</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: record.active ? '#10b98118' : '#ef444418' },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: record.active ? '#10b981' : '#ef4444' },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: record.active ? '#10b981' : '#ef4444' },
                        ]}
                      >
                        {record.active ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEdit(record)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="create-outline" size={14} color="#3b82f6" />
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(record._id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="trash-outline" size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </FadeInView>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyText}>No Data</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f6fb',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12.5,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 6,
    marginRight: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 18,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 10.5,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  formCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  headingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6366f1' },
  cardTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 7,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    marginBottom: 14,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
  },
  picker: {
    height: 48,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#1e293b',
    marginBottom: 14,
    backgroundColor: '#f8fafc',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },
  listCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  inactiveButton: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ec4899',
  },
  recordCard: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  recordAccent: {
    width: 4,
  },
  recordCardInner: {
    flex: 1,
    padding: 14,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 9,
  },
  recordLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  recordValue: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '600',
  },
  classPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  classPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 11.5,
    color: '#3b82f6',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
  },
  emptyIcon: {
    fontSize: 44,
    opacity: 0.3,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: '#94a3b8',
  },
});

/*
FIX NOTE — "tabs ke karan niche wala section hide ho jata hai":
Happens because a bottom Tab Navigator floats over the screen and the
ScrollView doesn't know its height, so the last record(s) end up underneath it.
1. contentContainerStyle paddingBottom: 100 (already added above) — a safe
   fixed buffer so content never sits under the tab bar.
2. For a pixel-perfect fix instead of a fixed number, import and use:
     import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
     const tabBarHeight = useBottomTabBarHeight();
   then set paddingBottom: tabBarHeight + 24.
   This only works when RoomAssignment is rendered *inside* a
   <Tabs.Screen> / bottom Tab Navigator route (e.g. expo-router's
   `app/(tabs)/...` folder). If it's a normal stacked screen opened via
   router.push (not itself a tab), the fixed paddingBottom above is enough.
*/