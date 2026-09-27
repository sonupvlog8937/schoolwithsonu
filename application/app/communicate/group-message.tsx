import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput,
  ActivityIndicator, FlatList, Alert, RefreshControl, Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/state/communicationSlice';
import { fetchCommunication, sendCommunication, deleteCommunication, clearCommunicationNotice } from '@/state/communicationSlice';
import { Ionicons } from '@expo/vector-icons';

export default function GroupMessageScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { records, loading, saving, error, success } = useSelector((state: RootState) => state.communication);

  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const [formData, setFormData] = useState({
    messageType: 'group',
    title: '',
    message: '',
    channel: 'sms',
    recipients: '',
    priority: 'normal'
  });

  useEffect(() => {
    dispatch(fetchCommunication('group-message'));
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchCommunication('group-message'));
    setRefreshing(false);
  };

  const handleOpenModal = () => {
    setFormData({
      messageType: 'group',
      title: '',
      message: '',
      channel: 'sms',
      recipients: '',
      priority: 'normal'
    });
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSubmit = () => {
    if (!formData.message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    const payload = {
      channel: formData.channel,
      messageType: formData.messageType,
      title: formData.title,
      message: formData.message,
      recipients: formData.recipients.split(',').map(r => r.trim()).filter(Boolean),
      priority: formData.priority
    };

    dispatch(sendCommunication(payload)).then((result: any) => {
      if (result.type.includes('fulfilled')) {
        handleCloseModal();
        dispatch(fetchCommunication('group-message'));
        Alert.alert('Success', 'Message sent successfully');
      } else {
        Alert.alert('Error', 'Failed to send message');
      }
    });
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteCommunication({ resource: 'group-message', id })).then(() => {
              dispatch(fetchCommunication('group-message'));
            });
          }
        }
      ]
    );
  };

  const handleViewMessage = (message: any) => {
    setSelectedMessage(message);
    setViewModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'sent': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      case 'scheduled': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'sent': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'failed': return 'close-circle';
      case 'scheduled': return 'calendar';
      default: return 'mail';
    }
  };

  const filteredRecords = records.filter((record: any) => {
    if (filterStatus !== 'all' && record.status?.toLowerCase() !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: records.length,
    sent: records.filter((r: any) => r.status?.toLowerCase() === 'sent').length,
    pending: records.filter((r: any) => r.status?.toLowerCase() === 'pending').length,
    failed: records.filter((r: any) => r.status?.toLowerCase() === 'failed').length
  };

  const renderMessageCard = ({ item }: { item: any }) => (
    <View style={styles.messageCard}>
      <View style={styles.messageHeader}>
        <View style={styles.messageHeaderLeft}>
          <Ionicons
            name={getStatusIcon(item.status)}
            size={20}
            color={getStatusColor(item.status)}
          />
          <Text style={styles.messageTitle} numberOfLines={1}>
            {item.title || 'No Title'}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status || 'Sent'}
          </Text>
        </View>
      </View>

      <Text style={styles.messageText} numberOfLines={2}>
        {item.message}
      </Text>

      <View style={styles.messageFooter}>
        <View style={styles.messageInfo}>
          <Ionicons name="people" size={14} color="#6b7280" />
          <Text style={styles.messageInfoText}>
            {item.recipientCount || 0} recipients
          </Text>
        </View>
        <View style={styles.messageInfo}>
          <Ionicons name="time" size={14} color="#6b7280" />
          <Text style={styles.messageInfoText}>
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
      </View>

      <View style={styles.messageActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => handleViewMessage(item)}
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fb542d" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Message</Text>
        <TouchableOpacity onPress={handleOpenModal} style={styles.composeButton}>
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
          { label: 'Total', value: stats.total, color: '#3b82f6', icon: 'mail' },
          { label: 'Sent', value: stats.sent, color: '#10b981', icon: 'checkmark-circle' },
          { label: 'Pending', value: stats.pending, color: '#f59e0b', icon: 'time' },
          { label: 'Failed', value: stats.failed, color: '#ef4444', icon: 'close-circle' }
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
        {['all', 'sent', 'pending', 'failed', 'scheduled'].map((status) => (
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

      {/* Messages List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fb542d" />
        </View>
      ) : (
        <FlatList
          data={filteredRecords}
          keyExtractor={(item) => item._id}
          renderItem={renderMessageCard}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#fb542d']} />
          }
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="mail-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>No messages found</Text>
            </View>
          }
        />
      )}

      {/* Compose Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Compose Message</Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Message Type */}
              <Text style={styles.inputLabel}>Message Type</Text>
              <View style={styles.segmentedControl}>
                {[
                  { value: 'group', label: 'Group' },
                  { value: 'individual', label: 'Individual' }
                ].map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.segmentButton,
                      formData.messageType === type.value && styles.segmentButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, messageType: type.value })}
                  >
                    <Text
                      style={[
                        styles.segmentButtonText,
                        formData.messageType === type.value && styles.segmentButtonTextActive
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Individual Recipients */}
              {formData.messageType === 'individual' && (
                <>
                  <Text style={styles.inputLabel}>Phone Numbers</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter comma-separated numbers"
                    value={formData.recipients}
                    onChangeText={(text) => setFormData({ ...formData, recipients: text })}
                    multiline
                  />
                </>
              )}

              {/* Title */}
              <Text style={styles.inputLabel}>Title (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Message title"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />

              {/* Message */}
              <Text style={styles.inputLabel}>Message *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Type your message here..."
                value={formData.message}
                onChangeText={(text) => setFormData({ ...formData, message: text })}
                multiline
                numberOfLines={5}
              />

              {/* Channel */}
              <Text style={styles.inputLabel}>Channel</Text>
              <View style={styles.segmentedControl}>
                {[
                  { value: 'sms', label: 'SMS' },
                  { value: 'email', label: 'Email' },
                  { value: 'both', label: 'Both' }
                ].map((channel) => (
                  <TouchableOpacity
                    key={channel.value}
                    style={[
                      styles.segmentButton,
                      formData.channel === channel.value && styles.segmentButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, channel: channel.value })}
                  >
                    <Text
                      style={[
                        styles.segmentButtonText,
                        formData.channel === channel.value && styles.segmentButtonTextActive
                      ]}
                    >
                      {channel.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
                  styles.sendButton,
                  (!formData.message.trim() || saving) && styles.sendButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={!formData.message.trim() || saving}
              >
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={styles.sendButtonText}>
                  {saving ? 'Sending...' : 'Send'}
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
              <Text style={styles.modalTitle}>Message Details</Text>
              <TouchableOpacity onPress={() => setViewModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {selectedMessage && (
              <ScrollView style={styles.viewModalContent}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Title</Text>
                  <Text style={styles.detailValue}>
                    {selectedMessage.title || 'No Title'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Message</Text>
                  <Text style={styles.detailValue}>{selectedMessage.message}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Channel</Text>
                  <View style={styles.channelBadge}>
                    <Text style={styles.channelBadgeText}>
                      {selectedMessage.channel?.toUpperCase() || 'SMS'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(selectedMessage.status) + '20' }
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(selectedMessage.status) }
                      ]}
                    >
                      {selectedMessage.status || 'Sent'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Recipients</Text>
                  <Text style={styles.detailValue}>
                    {selectedMessage.recipientCount || 0} recipients
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>
                    {selectedMessage.createdAt
                      ? new Date(selectedMessage.createdAt).toLocaleString()
                      : 'N/A'}
                  </Text>
                </View>
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
  composeButton: {
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
  messagesList: {
    padding: 16
  },
  messageCard: {
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
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  messageHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
    flex: 1
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
  messageText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6'
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  messageInfoText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4
  },
  messageActions: {
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
    height: 120,
    textAlignVertical: 'top'
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center'
  },
  segmentButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  segmentButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280'
  },
  segmentButtonTextActive: {
    color: '#fb542d'
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
  sendButton: {
    flex: 1,
    flexDirection: 'row',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fb542d',
    gap: 8
  },
  sendButtonDisabled: {
    opacity: 0.5
  },
  sendButtonText: {
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
  channelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  channelBadgeText: {
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
