import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Switch,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { AppDispatch, RootState } from '@/state/store';
import {
  fetchMasterConfig,
  createMasterConfig,
  updateMasterConfig,
  deleteMasterConfig,
} from '@/state/masterConfigurationSlice';

// If this screen lives inside an expo-router / react-navigation bottom
// Tab Navigator, uncomment these two lines and use `tabBarHeight` in the
// ScrollView's contentContainerStyle paddingBottom (see FIX NOTE at bottom).
// import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
};

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

const ACCENTS = ['#6366f1', '#ec4899', '#10b981', '#f97316', '#3b82f6'];

export default function SessionManagement() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  // const tabBarHeight = useBottomTabBarHeight(); // uncomment if inside a Tab Navigator
  const { sessions = [], loading } = useSelector((state: RootState) => state.masterConfiguration);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    startDate: new Date(),
    endDate: new Date(),
    isCurrentSession: false,
    active: true,
  });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const modalAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (modalVisible) {
      modalAnim.setValue(0);
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible, modalAnim]);

  const loadSessions = () => {
    dispatch(fetchMasterConfig('session'));
  };

  const handleOpenModal = (session: any = null) => {
    if (session) {
      setEditingSession(session);
      setFormData({
        name: session.name || '',
        startDate: session.data?.startDate ? new Date(session.data.startDate) : new Date(),
        endDate: session.data?.endDate ? new Date(session.data.endDate) : new Date(),
        isCurrentSession: session.data?.isCurrentSession || false,
        active: session.active !== false,
      });
    } else {
      setEditingSession(null);
      setFormData({
        name: '',
        startDate: new Date(),
        endDate: new Date(),
        isCurrentSession: false,
        active: true,
      });
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingSession(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter session name');
      return;
    }

    const payload = {
      name: formData.name,
      data: {
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        isCurrentSession: formData.isCurrentSession,
      },
      active: formData.active,
    };

    try {
      if (editingSession) {
        await dispatch(
          updateMasterConfig({ module: 'session', id: editingSession._id, data: payload })
        ).unwrap();
      } else {
        await dispatch(createMasterConfig({ module: 'session', data: payload })).unwrap();
      }
      handleCloseModal();
      loadSessions();
    } catch (error) {
      console.error('Error saving session:', error);
      Alert.alert('Error', 'Failed to save session');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to remove this session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(deleteMasterConfig({ module: 'session', id })).unwrap();
            loadSessions();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete session');
          }
        },
      },
    ]);
  };

  const handleToggleActive = async (session: any) => {
    try {
      await dispatch(
        updateMasterConfig({
          module: 'session',
          id: session._id,
          data: { ...session, active: !session.active },
        })
      ).unwrap();
      loadSessions();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleToggleCurrentSession = async (session: any) => {
    try {
      await dispatch(
        updateMasterConfig({
          module: 'session',
          id: session._id,
          data: {
            ...session,
            data: { ...session.data, isCurrentSession: !session.data?.isCurrentSession },
          },
        })
      ).unwrap();
      loadSessions();
    } catch (error) {
      console.error('Error toggling current session:', error);
    }
  };

  if (loading && sessions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading sessions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#6366f1', '#ec4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Session Management</Text>
            <Text style={styles.headerSubtitle}>Manage academic sessions and years</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => handleOpenModal()} activeOpacity={0.85}>
          <Ionicons name="add-circle-outline" size={16} color="#6366f1" />
          <Text style={styles.addButtonText}>ADD SESSION</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Sessions List */}
      <ScrollView
        style={styles.content}
        // FIX: bottom padding so content isn't hidden behind a bottom tab bar.
        // Swap 100 for `tabBarHeight + 24` if you enable the hook above.
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadSessions}
            colors={['#6366f1']}
            tintColor="#6366f1"
          />
        }
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>SESSION LIST</Text>
            <TouchableOpacity>
              <Text style={styles.inactiveButton}>Inactive</Text>
            </TouchableOpacity>
          </View>

          {sessions.length > 0 ? (
            sessions.map((session: any, index: number) => {
              const accent = ACCENTS[index % ACCENTS.length];
              return (
                <FadeInView key={session._id} delay={index * 60} style={styles.sessionCard}>
                  <View style={[styles.sessionAccent, { backgroundColor: accent }]} />
                  <View style={styles.sessionCardInner}>
                    <View style={styles.sessionRow}>
                      <Text style={styles.sessionLabel}>Session Name</Text>
                      <View style={[styles.namePill, { backgroundColor: `${accent}18` }]}>
                        <Text style={[styles.namePillText, { color: accent }]}>
                          {session.name || '-'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.sessionRow}>
                      <Text style={styles.sessionLabel}>Start Date</Text>
                      <Text style={styles.sessionValue}>{formatDate(session.data?.startDate)}</Text>
                    </View>
                    <View style={styles.sessionRow}>
                      <Text style={styles.sessionLabel}>End Date</Text>
                      <Text style={styles.sessionValue}>{formatDate(session.data?.endDate)}</Text>
                    </View>
                    <View style={styles.sessionRow}>
                      <Text style={styles.sessionLabel}>Current Session</Text>
                      <Switch
                        value={session.data?.isCurrentSession || false}
                        onValueChange={() => handleToggleCurrentSession(session)}
                        trackColor={{ false: '#cbd5e1', true: accent }}
                        thumbColor="#ffffff"
                      />
                    </View>
                    <View style={styles.sessionRow}>
                      <Text style={styles.sessionLabel}>Status</Text>
                      <Switch
                        value={session.active !== false}
                        onValueChange={() => handleToggleActive(session)}
                        trackColor={{ false: '#cbd5e1', true: accent }}
                        thumbColor="#ffffff"
                      />
                    </View>
                    <View style={styles.sessionActions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleOpenModal(session)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="create-outline" size={14} color="#3b82f6" />
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(session._id)}
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
              <Ionicons name="calendar-outline" size={44} color="#cbd5e1" />
              <Text style={styles.emptyText}>No sessions found</Text>
              <Text style={styles.emptySubtext}>Click "ADD SESSION" to create one</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: modalAnim,
                transform: [
                  {
                    translateY: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['#6366f1', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>
                {editingSession ? 'Edit Session' : 'Add Session'}
              </Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Ionicons name="close" size={20} color="#ffffff" />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Session Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2026-2027"
                placeholderTextColor="#94a3b8"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />

              <Text style={styles.inputLabel}>Start Date *</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowStartPicker(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.dateInputText}>{formatDate(formData.startDate.toISOString())}</Text>
                <Ionicons name="calendar-outline" size={18} color="#6366f1" />
              </TouchableOpacity>

              {showStartPicker && (
                <DateTimePicker
                  value={formData.startDate}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowStartPicker(false);
                    if (date) setFormData({ ...formData, startDate: date });
                  }}
                />
              )}

              <Text style={styles.inputLabel}>End Date *</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowEndPicker(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.dateInputText}>{formatDate(formData.endDate.toISOString())}</Text>
                <Ionicons name="calendar-outline" size={18} color="#6366f1" />
              </TouchableOpacity>

              {showEndPicker && (
                <DateTimePicker
                  value={formData.endDate}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowEndPicker(false);
                    if (date) setFormData({ ...formData, endDate: date });
                  }}
                />
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCloseModal} activeOpacity={0.8}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmit} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#6366f1', '#ec4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitButton}
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
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
    padding: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#6366f1',
    fontSize: 12.5,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cardTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: 0.3,
  },
  inactiveButton: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ec4899',
  },
  sessionCard: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sessionAccent: {
    width: 4,
  },
  sessionCardInner: {
    flex: 1,
    padding: 14,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 11,
  },
  sessionLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  sessionValue: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '600',
  },
  namePill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  namePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sessionActions: {
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
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  emptySubtext: {
    marginTop: 4,
    fontSize: 11,
    color: '#cbd5e1',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalBody: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
  },
  dateInputText: {
    fontSize: 13,
    color: '#1e293b',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 120,
  },
  submitButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});

/*
FIX NOTE — "tabs ke karan niche wala section hide ho jata hai":
Happens because a bottom Tab Navigator floats over the screen and the
ScrollView doesn't know its height, so the last card(s) end up underneath it.
1. contentContainerStyle paddingBottom: 100 (already added above) — a safe
   fixed buffer so content never sits under the tab bar.
2. For a pixel-perfect fix instead of a fixed number, import and use:
     import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
     const tabBarHeight = useBottomTabBarHeight();
   then set paddingBottom: tabBarHeight + 24.
   This only works when SessionManagement is rendered *inside* a
   <Tabs.Screen> / bottom Tab Navigator route (e.g. expo-router's
   `app/(tabs)/...` folder). If it's a normal stacked screen opened via
   router.push (not itself a tab), the fixed paddingBottom above is enough.
*/