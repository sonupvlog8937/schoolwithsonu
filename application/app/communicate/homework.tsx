import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput,
  ActivityIndicator, FlatList, Alert, RefreshControl, Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/state/store';
import { fetchCommunication, createCommunication, deleteCommunication, clearCommunicationNotice } from '@/state/communicationSlice';
import { Ionicons } from '@expo/vector-icons';

export default function HomeworkScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { records, loading, saving, error, success } = useSelector((state: RootState) => state.communication);

  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    class: '',
    subject: '',
    homework_date: '',
    submission_date: '',
    attachment: '',
    status: 'Active'
  });

  // Sample data - should come from API
  const classes = [
    { _id: '1', class_text: 'Class 1' },
    { _id: '2', class_text: 'Class 2' },
    { _id: '3', class_text: 'Class 3' }
  ];

  const subjects = [
    { _id: '1', subject_name: 'Mathematics' },
    { _id: '2', subject_name: 'Science' },
    { _id: '3', subject_name: 'English' }
  ];

  useEffect(() => {
    dispatch(fetchCommunication('homework'));
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchCommunication('homework'));
    setRefreshing(false);
  };

  const handleOpenModal = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      title: '',
      description: '',
      class: '',
      subject: '',
      homework_date: today,
      submission_date: '',
      attachment: '',
      status: 'Active'
    });
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      classId: formData.class,
      subjectId: formData.subject,
      homework_date: formData.homework_date,
      submission_date: formData.submission_date,
      attachment: formData.attachment,
      status: formData.status
    };

    dispatch(createCommunication({ resource: 'homework', data: payload })).then((result: any) => {
      if (result.type.includes('fulfilled')) {
        handleCloseModal();
        dispatch(fetchCommunication('homework'));
        Alert.alert('Success', 'Homework created successfully');
      } else {
        Alert.alert('Error', 'Failed to create homework');
      }
    });
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this homework?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteCommunication({ resource: 'homework', id })).then(() => {
              dispatch(fetchCommunication('homework'));
            });
          }
        }
      ]
    );
  };

  const handleView = (homework: any) => {
    setSelectedHomework(homework);
    setViewModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return '#10b981';
      case 'completed': return '#3b82f6';
      case 'expired': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getDaysRemaining = (submissionDate: string) => {
    const today = new Date();
    const submission = new Date(submissionDate);
    const diffTime = submission.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isExpired = (submissionDate: string) => {
    return getDaysRemaining(submissionDate) < 0;
  };

  const filteredRecords = records.filter((record: any) => {
    if (filterStatus !== 'all' && record.status?.toLowerCase() !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: records.length,
    active: records.filter((r: any) => r.status?.toLowerCase() === 'active').length,
    completed: records.filter((r: any) => r.status?.toLowerCase() === 'completed').length,
    expired: records.filter((r: any) => r.status?.toLowerCase() === 'expired' || isExpired(r.submission_date)).length
  };

  const renderHomeworkCard = ({ item }: { item: any }) => {
    const daysRemaining = getDaysRemaining(item.submission_date);
    const expired = isExpired(item.submission_date);

    return (
      <View style={styles.homeworkCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.classChip}>
              <Ionicons name="school" size={14} color="#3b82f6" />
              <Text style={styles.classChipText}>{item.class?.class_text || 'N/A'}</Text>
            </View>
            <View style={styles.subjectChip}>
              <Text style={styles.subjectChipText}>{item.subject?.subject_name || 'N/A'}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status || 'Active'}
            </Text>
          </View>
        </View>

        <Text style={styles.homeworkTitle}>{item.title}</Text>
        <Text style={styles.homeworkDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.dateContainer}>
          <View style={styles.dateItem}>
            <Ionicons name="calendar-outline" size={14} color="#6b7280" />
            <Text style={styles.dateLabel}>Assigned:</Text>
            <Text style={styles.dateValue}>
              {item.homework_date ? new Date(item.homework_date).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
          <View style={styles.dateItem}>
            <Ionicons name="calendar" size={14} color="#6b7280" />
            <Text style={styles.dateLabel}>Due:</Text>
            <Text style={styles.dateValue}>
              {item.submission_date ? new Date(item.submission_date).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>

        {daysRemaining >= 0 && daysRemaining <= 3 && !expired && (
          <View style={styles.urgentBanner}>
            <Ionicons name="time" size={16} color="#f59e0b" />
            <Text style={styles.urgentText}>
              {daysRemaining === 0 ? 'Due Today!' : `${daysRemaining} days remaining`}
            </Text>
          </View>
        )}

        {expired && (
          <View style={[styles.urgentBanner, { backgroundColor: '#fef2f2' }]}>
            <Ionicons name="alert-circle" size={16} color="#ef4444" />
            <Text style={[styles.urgentText, { color: '#ef4444' }]}>Expired</Text>
          </View>
        )}

        {item.attachment && (
          <View style={styles.attachmentIndicator}>
            <Ionicons name="attach" size={14} color="#6b7280" />
            <Text style={styles.attachmentText}>Has attachment</Text>
          </View>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => handleView(item)}
          >
            <Ionicons name="eye" size={16} color="#3b82f6" />
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item._id)}
          >
            <Ionicons name="trash" size={16} color="#ef4444" />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fb542d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Homework</Text>
        <TouchableOpacity onPress={handleOpenModal} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsContainer}
      >
        {[
          { label: 'Total', value: stats.total, color: '#3b82f6', icon: 'documents' },
          { label: 'Active', value: stats.active, color: '#10b981', icon: 'checkmark-circle' },
          { label: 'Completed', value: stats.completed, color: '#8b5cf6', icon: 'checkmark-done-circle' },
          { label: 'Expired', value: stats.expired, color: '#ef4444', icon: 'close-circle' }
        ].map((stat, index) => (
          <View key={index} style={[styles.statCard, { borderLeftColor: stat.color }]}>
            <Ionicons name={stat.icon as any} size={24} color={stat.color} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {['all', 'active', 'completed', 'expired'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterTab,
              filterStatus === status && styles.filterTabActive
            ]}
            onPress={() => setFilterStatus(status)}
          >
            <Text
              style={[
                styles.filterTabText,
                filterStatus === status && styles.filterTabTextActive
              ]}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Homework List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fb542d" />
        </View>
      ) : (
        <FlatList
          data={filteredRecords}
          keyExtractor={(item) => item._id}
          renderItem={renderHomeworkCard}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#fb542d']} />
          }
          contentContainerStyle={styles.homeworkList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>No homework found</Text>
            </View>
          }
        />
      )}

      {/* Add Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Homework</Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Title */}
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Homework title"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />

              {/* Description */}
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Homework description"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={4}
              />

              {/* Class (Simplified - in real app should be dropdown) */}
              <Text style={styles.inputLabel}>Class</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter class"
                value={formData.class}
                onChangeText={(text) => setFormData({ ...formData, class: text })}
              />

              {/* Subject */}
              <Text style={styles.inputLabel}>Subject</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter subject"
                value={formData.subject}
                onChangeText={(text) => setFormData({ ...formData, subject: text })}
              />

              {/* Homework Date */}
              <Text style={styles.inputLabel}>Homework Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2024-01-01"
                value={formData.homework_date}
                onChangeText={(text) => setFormData({ ...formData, homework_date: text })}
              />

              {/* Submission Date */}
              <Text style={styles.inputLabel}>Submission Date (YYYY-MM-DD) *</Text>
              <TextInput
                style={styles.input}
                placeholder="2024-01-15"
                value={formData.submission_date}
                onChangeText={(text) => setFormData({ ...formData, submission_date: text })}
              />

              {/* Attachment */}
              <Text style={styles.inputLabel}>Attachment URL (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://example.com/file.pdf"
                value={formData.attachment}
                onChangeText={(text) => setFormData({ ...formData, attachment: text })}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!formData.title.trim() || !formData.description.trim() || saving) && styles.submitButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={!formData.title.trim() || !formData.description.trim() || saving}
              >
                <Ionicons name="checkmark" size={18} color="#fff" />
                <Text style={styles.submitButtonText}>
                  {saving ? 'Creating...' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* View Modal */}
      <Modal
        visible={viewModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setViewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.viewModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Homework Details</Text>
              <TouchableOpacity onPress={() => setViewModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {selectedHomework && (
              <ScrollView style={styles.viewModalContent}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Title</Text>
                  <Text style={styles.detailValue}>{selectedHomework.title}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Description</Text>
                  <Text style={styles.detailValue}>{selectedHomework.description}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Class</Text>
                  <View style={styles.classBadge}>
                    <Text style={styles.classBadgeText}>
                      {selectedHomework.class?.class_text || 'N/A'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Subject</Text>
                  <View style={styles.subjectBadge}>
                    <Text style={styles.subjectBadgeText}>
                      {selectedHomework.subject?.subject_name || 'N/A'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Homework Date</Text>
                  <Text style={styles.detailValue}>
                    {selectedHomework.homework_date
                      ? new Date(selectedHomework.homework_date).toLocaleDateString()
                      : 'N/A'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Submission Date</Text>
                  <Text style={styles.detailValue}>
                    {selectedHomework.submission_date
                      ? new Date(selectedHomework.submission_date).toLocaleDateString()
                      : 'N/A'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(selectedHomework.status) + '20' }
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(selectedHomework.status) }
                      ]}
                    >
                      {selectedHomework.status || 'Active'}
                    </Text>
                  </View>
                </View>

                {selectedHomework.attachment && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Attachment</Text>
                    <TouchableOpacity style={styles.attachmentButton}>
                      <Ionicons name="attach" size={16} color="#3b82f6" />
                      <Text style={styles.attachmentButtonText}>View Attachment</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {selectedHomework.teacher && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Teacher</Text>
                    <Text style={styles.detailValue}>
                      {selectedHomework.teacher.name || 'N/A'}
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setViewModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  backButton: {
    padding: 8
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8
  },
  addButton: {
    backgroundColor: '#fb542d',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#fff'
  },
  filterTabActive: {
    backgroundColor: '#fb542d'
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280'
  },
  filterTabTextActive: {
    color: '#fff'
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  homeworkList: {
    padding: 16
  },
  homeworkCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    gap: 6,
    marginRight: 8
  },
  classChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4
  },
  classChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3b82f6'
  },
  subjectChip: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  subjectChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10b981'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  homeworkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8
  },
  homeworkDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6'
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  dateLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginLeft: 2
  },
  dateValue: {
    fontSize: 11,
    color: '#111827',
    fontWeight: '600'
  },
  urgentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6
  },
  urgentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b'
  },
  attachmentIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12
  },
  attachmentText: {
    fontSize: 11,
    color: '#6b7280'
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 4
  },
  viewButton: {
    backgroundColor: '#eff6ff'
  },
  viewButtonText: {
    color: '#3b82f6',
    fontSize: 13,
    fontWeight: '600'
  },
  deleteButton: {
    backgroundColor: '#fef2f2'
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827'
  },
  modalContent: {
    padding: 20
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff'
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f3f4f6'
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280'
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fb542d',
    gap: 8
  },
  submitButtonDisabled: {
    opacity: 0.5
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  },
  viewModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    margin: 20,
    maxHeight: '80%'
  },
  viewModalContent: {
    padding: 20
  },
  detailRow: {
    marginBottom: 20
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
    textTransform: 'uppercase'
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20
  },
  classBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  classBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6'
  },
  subjectBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  subjectBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981'
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-start'
  },
  attachmentButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6'
  },
  closeButton: {
    margin: 20,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f3f4f6'
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280'
  }
});