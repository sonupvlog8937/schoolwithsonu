import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Alert,
  Animated,
  Easing,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/hooks/useColors';
import axios from 'axios';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001';

/**
 * Fades + slides a block up on mount, with an optional stagger delay.
 */
function AnimatedSection({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: any;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 460,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 460,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

/**
 * Press-scale wrapper — quick smooth spring shrink/grow on touch, the
 * mobile equivalent of a hover lift.
 */
function PressScale({
  children,
  style,
  onPress,
  disabled,
}: {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
  disabled?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();

  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onPress={onPress}
      disabled={disabled}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

/**
 * Animated progress fill — grows smoothly to its target width instead of
 * popping in, using a gradient bar.
 */
function AnimatedCoverageBar({
  coverage,
  colors,
}: {
  coverage: number;
  colors: [string, string];
}) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: coverage || 0,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [coverage]);

  return (
    <View style={styles.progressBarContainer}>
      <Animated.View
        style={{
          width: widthAnim.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
          }),
          height: '100%',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}

export default function FeeAssignmentDashboard() {
  const colors = useColors();

  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [dashboard, setDashboard] = useState({
    totalStudents: 0,
    feeAssigned: 0,
    feeNotAssigned: 0,
    gradesCovered: 0,
    totalGrades: 0,
    gradeWiseBreakdown: [],
    session: new Date().getFullYear().toString()
  });

  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    recordsPerPage: 20
  });

  const [filters, setFilters] = useState({
    session: new Date().getFullYear().toString(),
    classId: '',
    section: '',
    feeStatus: '',
    studentStatus: '',
    search: '',
    page: 1,
    limit: 20
  });

  // Filter options - will be populated from backend API
  const [filterOptions, setFilterOptions] = useState({
    classes: [],
    sections: [],
    feeStatuses: [],
    studentStatuses: []
  });

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerField, setPickerField] = useState<'classId' | 'section' | 'feeStatus' | 'studentStatus'>('feeStatus');

  const normalizeDashboardData = (payload: any) => ({
    totalStudents: Number(payload?.totalStudents || 0),
    feeAssigned: Number(payload?.feeAssigned || 0),
    feeNotAssigned: Number(payload?.feeNotAssigned || 0),
    gradesCovered: Number(payload?.gradesCovered || 0),
    totalGrades: Number(payload?.totalGrades || 0),
    gradeWiseBreakdown: Array.isArray(payload?.gradeWiseBreakdown) ? payload.gradeWiseBreakdown : [],
    session: payload?.session || new Date().getFullYear().toString(),
    filters: payload?.filters || { classes: [], sections: [], feeStatuses: [], studentStatuses: [] },
  });

  useEffect(() => {
    fetchDashboard();
  }, [filters.session]);

  useEffect(() => {
    fetchStudents();
  }, [filters.classId, filters.section, filters.feeStatus, filters.studentStatus, filters.search, filters.page, filters.limit]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const schoolId = await getSchoolId();

      console.log('📱 Mobile Fee Assignment API URL:', API_URL);
      console.log('📱 Mobile School ID:', schoolId);
      console.log('📱 Mobile Session:', filters.session);

      const response = await axios.get(
        `${API_URL}/fee-assignment/dashboard/${schoolId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { session: filters.session }
        }
      );

      console.log('📱 Mobile Dashboard Response:', JSON.stringify(response.data, null, 2));

      const payload = response?.data?.data ?? response?.data ?? {};
      const normalized = normalizeDashboardData(payload);

      setDashboard(normalized);

      const filterData = {
        classes: Array.isArray(normalized.filters?.classes) ? normalized.filters.classes : [],
        sections: Array.isArray(normalized.filters?.sections) ? normalized.filters.sections : [],
        feeStatuses: Array.isArray(normalized.filters?.feeStatuses) ? normalized.filters.feeStatuses : [],
        studentStatuses: Array.isArray(normalized.filters?.studentStatuses) ? normalized.filters.studentStatuses : []
      };

      console.log('📱 Mobile Filter Options:', JSON.stringify(filterData, null, 2));
      console.log('📱 Mobile Classes Count:', filterData.classes.length);
      console.log('📱 Mobile Sections Count:', filterData.sections.length);

      setFilterOptions(filterData);
    } catch (error) {
      console.error('❌ Mobile Dashboard Error:', error);
      if (axios.isAxiosError(error)) {
        console.error('❌ Response:', error.response?.data);
        console.error('❌ Status:', error.response?.status);
        console.error('❌ Message:', error.message);
      }
      Alert.alert('Error', `Failed to load dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      const token = await getToken();
      const schoolId = await getSchoolId();

      console.log('📱 Mobile Fetching Students with filters:', JSON.stringify(filters, null, 2));

      const response = await axios.get(
        `${API_URL}/fee-assignment/students/${schoolId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            ...filters,
            session: filters.session,
            page: filters.page,
            limit: filters.limit,
          }
        }
      );

      console.log('📱 Mobile Students Response:', response.data?.data?.length, 'students');

      const list = Array.isArray(response?.data?.data) ? response.data.data : [];
      const nextPagination = response?.data?.pagination || { currentPage: 1, totalPages: 1, totalRecords: 0, recordsPerPage: filters.limit };

      setStudents(list);
      setPagination(nextPagination);
    } catch (error) {
      console.error('❌ Mobile Students Error:', error);
      if (axios.isAxiosError(error)) {
        console.error('❌ Response:', error.response?.data);
        console.error('❌ Message:', error.message);
      }
      Alert.alert('Error', `Failed to load students: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setStudentsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboard(), fetchStudents()]);
    setRefreshing(false);
  };

  const getToken = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No auth token found');
    }
    return token;
  };

  const getSchoolId = async () => {
    try {
      // First try to get from AsyncStorage userData
      const storedUser = await AsyncStorage.getItem('userData');
      
      console.log('📱 Stored User Data:', storedUser);
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log('📱 Parsed User Data:', JSON.stringify(userData, null, 2));
        
        // Check all possible schoolId fields
        const schoolId =
          userData?.schoolId ||
          userData?.school_id ||
          userData?.id ||
          userData?._id ||
          userData?.school?._id ||
          userData?.school?.id ||
          userData?.school;

        console.log('📱 Extracted School ID from userData:', schoolId);

        if (schoolId) {
          return schoolId;
        }
      }

      // If not found in userData, try to decode from token
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        try {
          // Decode JWT token (without verification, just parse the payload)
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const decoded = JSON.parse(jsonPayload);
          
          console.log('📱 Decoded Token:', JSON.stringify(decoded, null, 2));
          
          const tokenSchoolId = decoded?.schoolId || decoded?.school_id || decoded?.id;
          
          if (tokenSchoolId) {
            console.log('📱 School ID from token:', tokenSchoolId);
            return tokenSchoolId;
          }
        } catch (decodeError) {
          console.error('❌ Token decode error:', decodeError);
        }
      }

      // If still not found, throw detailed error
      throw new Error('School ID not found in AsyncStorage or token');
    } catch (error) {
      console.error('❌ getSchoolId Error:', error);
      throw error;
    }
  };

  const formatCoverage = (coverage: number) => {
    return `${Math.round(coverage || 0)}%`;
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    colors: gradientColors,
    delay = 0,
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: any;
    colors: [string, string];
    delay?: number;
  }) => (
    <AnimatedSection delay={delay} style={[styles.statCard, { width: cardWidth }]}>
      <PressScale style={{ borderRadius: 16, overflow: 'hidden' }}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statGradient}
        >
          <View style={styles.statContent}>
            <MaterialCommunityIcons
              name={icon}
              size={22}
              color="rgba(255, 255, 255, 0.9)"
            />
            <Text style={styles.statTitle}>{title}</Text>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statSubtitle}>{subtitle}</Text>
          </View>
        </LinearGradient>
      </PressScale>
    </AnimatedSection>
  );

  const openPicker = (field: 'classId' | 'section' | 'feeStatus' | 'studentStatus') => {
    setPickerField(field);
    setPickerVisible(true);
  };

  const getOptionLabel = (field: 'classId' | 'section' | 'feeStatus' | 'studentStatus', value: string) => {
    if (!value) return field === 'classId' ? 'All Classes' : field === 'section' ? 'All Sections' : field === 'feeStatus' ? 'All Status' : 'All Status';
    if (field === 'classId') {
      const cls = filterOptions.classes.find((item: any) => (item._id || item.value) === value);
      return cls?.name || cls?.label || 'Select Class';
    }
    if (field === 'section') {
      return value || 'All Sections';
    }
    if (field === 'feeStatus') {
      const item = filterOptions.feeStatuses.find((option: any) => (option.value || option._id) === value);
      return item?.label || item?.name || 'All Status';
    }
    const item = filterOptions.studentStatuses.find((option: any) => (option.value || option._id) === value);
    return item?.label || item?.name || 'All Status';
  };

  const getPickerOptions = () => {
    if (pickerField === 'classId') {
      return [
        { _id: '', name: 'All Classes', value: '', label: 'All Classes' }, 
        ...filterOptions.classes
      ];
    }
    if (pickerField === 'section') {
      return [
        { value: '', label: 'All Sections' }, 
        ...filterOptions.sections
      ];
    }
    if (pickerField === 'feeStatus') {
      return [
        { value: '', label: 'All Status' }, 
        ...filterOptions.feeStatuses
      ];
    }
    return [
      { value: '', label: 'All Status' }, 
      ...filterOptions.studentStatuses
    ];
  };

  const applyPickerValue = (value: string) => {
    const nextFilters = { ...filters, [pickerField]: value, page: 1 };
    setFilters(nextFilters);
    setPickerVisible(false);
  };

  const resetFilters = () => {
    setFilters({
      session: new Date().getFullYear().toString(),
      classId: '',
      section: '',
      feeStatus: '',
      studentStatus: '',
      search: '',
      page: 1,
      limit: 20,
    });
  };

  return (
    <>
      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}> 
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select option</Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <MaterialCommunityIcons name="close" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            {getPickerOptions().map((option: any) => (
              <TouchableOpacity
                key={option._id || option.value || 'all'}
                onPress={() => {
                  applyPickerValue(option._id || option.value || '');
                }}
                style={styles.optionRow}
              >
                <Text style={[styles.optionText, { color: colors.text }]}>{option.name || option.label}</Text>
                {(filters[pickerField] || '') === (option._id || option.value || '') && (
                  <MaterialCommunityIcons name="check" size={18} color="#667eea" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#667eea', '#ec4899']}
            tintColor="#667eea"
          />
        }
      >
      {/* Header */}
      <AnimatedSection delay={0}>
        <LinearGradient
          colors={['#667eea', '#8b5cf6', '#ec4899']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.headerTitle}>Fee Assignment Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Students with and without a fee group for the current session
          </Text>
        </LinearGradient>
      </AnimatedSection>

      {/* Stats Cards */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
        </View>
      ) : (
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Students"
            value={dashboard.totalStudents}
            subtitle={`${dashboard.totalStudents} students`}
            icon="account-group"
            colors={['#2563eb', '#1e40af']}
            delay={60}
          />
          <StatCard
            title="Fee Assigned"
            value={dashboard.feeAssigned}
            subtitle={`${((dashboard.feeAssigned / dashboard.totalStudents) * 100 || 0).toFixed(1)}% students`}
            icon="check-circle"
            colors={['#10b981', '#059669']}
            delay={120}
          />
          <StatCard
            title="Not Assigned"
            value={dashboard.feeNotAssigned}
            subtitle={`${dashboard.feeNotAssigned} pending`}
            icon="close-circle"
            colors={['#f43f5e', '#e11d48']}
            delay={180}
          />
          <StatCard
            title="Grades Covered"
            value={`${dashboard.gradesCovered}/${dashboard.totalGrades}`}
            subtitle="grades assigned"
            icon="school"
            colors={['#f59e0b', '#ea580c']}
            delay={240}
          />
        </View>
      )}

      {/* Grade-wise Breakdown */}
      <AnimatedSection delay={280} style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconBadge, { backgroundColor: '#eef0ff' }]}>
            <MaterialCommunityIcons name="chart-bar" size={16} color="#667eea" />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Grade-wise Breakdown
          </Text>
        </View>
        <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>
          Click a row to filter the list below
        </Text>

        {dashboard.gradeWiseBreakdown.map((grade: any, index: number) => (
          <PressScale
            key={grade.classId || grade.className || index}
            style={[styles.gradeRow, { borderBottomColor: colors.border, backgroundColor: filters.classId === (grade.classId || '') ? `${'#667eea'}10` : 'transparent' }]}
            onPress={() => {
              const nextClassId = filters.classId === (grade.classId || '') ? '' : (grade.classId || '');
              setFilters((prev) => ({ ...prev, classId: nextClassId, page: 1 }));
            }}
          >
            <View style={styles.gradeInfo}>
              <Text style={[styles.gradeName, { color: colors.text }]}>
                {grade.className}
              </Text>
              <View style={styles.gradeStats}>
                <View style={styles.gradeStat}>
                  <Text style={[styles.gradeStatLabel, { color: colors.mutedForeground }]}>
                    Total: 
                  </Text>
                  <Text style={[styles.gradeStatValue, { color: colors.text }]}>
                    {grade.total}
                  </Text>
                </View>
                <View style={styles.gradeStat}>
                  <Text style={[styles.gradeStatLabel, { color: colors.mutedForeground }]}>
                    Assigned: 
                  </Text>
                  <Text style={[styles.gradeStatValue, { color: '#059669' }]}>
                    {grade.assigned}
                  </Text>
                </View>
                <View style={styles.gradeStat}>
                  <Text style={[styles.gradeStatLabel, { color: colors.mutedForeground }]}>
                    Pending: 
                  </Text>
                  <Text style={[styles.gradeStatValue, { color: '#e11d48' }]}>
                    {grade.notAssigned}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.coverageContainer}>
              <AnimatedCoverageBar
                coverage={grade.coverage}
                colors={
                  grade.coverage === 100
                    ? ['#34d399', '#059669']
                    : ['#fbbf24', '#ea580c']
                }
              />
              <Text style={[styles.coverageText, { color: colors.text }]}>
                {formatCoverage(grade.coverage)}
              </Text>
            </View>
          </PressScale>
        ))}
      </AnimatedSection>

      {/* Filters */}
      <AnimatedSection delay={340} style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconBadge, { backgroundColor: '#f5f3ff' }]}>
            <MaterialCommunityIcons name="filter" size={16} color="#8b5cf6" />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Filter Students
          </Text>
        </View>

        <View style={styles.filterRow}>
          <PressScale style={[styles.filterButton, { borderColor: colors.border }]} onPress={() => openPicker('feeStatus')}>
            <Text style={[styles.filterButtonText, { color: colors.text }]}>
              {getOptionLabel('feeStatus', filters.feeStatus)}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={18} color={colors.mutedForeground} />
          </PressScale>

          <PressScale style={[styles.filterButton, { borderColor: colors.border }]} onPress={() => openPicker('section')}>
            <Text style={[styles.filterButtonText, { color: colors.text }]}>
              {getOptionLabel('section', filters.section)}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={18} color={colors.mutedForeground} />
          </PressScale>
        </View>

        <View style={styles.filterRow}>
          <PressScale style={[styles.filterButton, { borderColor: colors.border }]} onPress={() => openPicker('classId')}>
            <Text style={[styles.filterButtonText, { color: colors.text }]}>{getOptionLabel('classId', filters.classId)}</Text>
            <MaterialCommunityIcons name="chevron-down" size={18} color={colors.mutedForeground} />
          </PressScale>

          <PressScale style={[styles.filterButton, { borderColor: colors.border }]} onPress={resetFilters}>
            <Text style={[styles.filterButtonText, { color: '#f43f5e' }]}>Reset</Text>
            <MaterialCommunityIcons name="restore" size={18} color="#f43f5e" />
          </PressScale>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.input, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="magnify" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search name, admission no..."
            placeholderTextColor={colors.mutedForeground}
            value={filters.search}
            onChangeText={(text) => setFilters({ ...filters, search: text })}
          />
        </View>
      </AnimatedSection>

      <AnimatedSection delay={360} style={[styles.section, { backgroundColor: colors.card }]}> 
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconBadge, { backgroundColor: '#eef2ff' }]}> 
            <MaterialCommunityIcons name="account-school" size={16} color="#667eea" />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Filters</Text>
        </View>

        <View style={styles.filterRow}>
          <PressScale style={[styles.filterButton, { borderColor: colors.border }]} onPress={() => openPicker('classId')}>
            <Text style={[styles.filterButtonText, { color: colors.text }]}>{getOptionLabel('classId', filters.classId)}</Text>
            <MaterialCommunityIcons name="chevron-down" size={18} color={colors.mutedForeground} />
          </PressScale>

          <PressScale style={[styles.filterButton, { borderColor: colors.border }]} onPress={() => openPicker('studentStatus')}>
            <Text style={[styles.filterButtonText, { color: colors.text }]}>{getOptionLabel('studentStatus', filters.studentStatus)}</Text>
            <MaterialCommunityIcons name="chevron-down" size={18} color={colors.mutedForeground} />
          </PressScale>
        </View>
      </AnimatedSection>

      {/* Students List */}
      <AnimatedSection delay={400} style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconBadge, { backgroundColor: '#fdf2f8' }]}>
            <MaterialCommunityIcons name="account-multiple" size={16} color="#ec4899" />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Student List
          </Text>
        </View>

        {studentsLoading ? (
          <ActivityIndicator size="small" color="#667eea" />
        ) : students.length > 0 ? (
          students.slice(0, 5).map((student: any, index: number) => (
            <PressScale
              key={index}
              style={[styles.studentCard, { borderBottomColor: colors.border }]}
            >
              <View style={styles.studentInfo}>
                <View style={styles.studentHeader}>
                  <Text style={[styles.studentName, { color: colors.text }]}>
                    {student.name}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          student.feeStatus === 'Assigned'
                            ? '#ecfdf5'
                            : '#fee2e2'
                      }
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            student.feeStatus === 'Assigned'
                              ? '#059669'
                              : '#e11d48'
                        }
                      ]}
                    >
                      {student.feeStatus}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.studentDetail, { color: colors.mutedForeground }]}>
                  Adm No: {student.admissionNo} | Class: {student.class} {student.section}
                </Text>
                {student.feeGroup !== '-' && (
                  <Text style={[styles.studentDetail, { color: colors.mutedForeground }]}>
                    Fee Group: {student.feeGroup}
                  </Text>
                )}
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={colors.mutedForeground}
              />
            </PressScale>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="account-off"
              size={40}
              color={colors.mutedForeground}
            />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No students found
            </Text>
          </View>
        )}

        {students.length > 5 && (
          <PressScale style={styles.viewMoreButton}>
            <Text style={styles.viewMoreText}>
              View All {pagination.totalRecords} Students
            </Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color="#667eea" />
          </PressScale>
        )}
      </AnimatedSection>

      {/* Summary */}
      <AnimatedSection delay={460} style={[styles.section, { backgroundColor: colors.card, marginBottom: 24 }]}>
        <Text style={[styles.summaryText, { color: colors.mutedForeground }]}>
          Total {pagination.totalRecords} students | Page {pagination.currentPage} of {pagination.totalPages}
        </Text>
      </AnimatedSection>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#764ba2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.92)',
  },
  loadingContainer: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  statGradient: {
    padding: 14,
  },
  statContent: {
    alignItems: 'flex-start',
  },
  statTitle: {
    fontSize: 10.5,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 6,
    marginBottom: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 3,
  },
  statSubtitle: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 11,
    marginBottom: 10,
  },
  gradeRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  gradeInfo: {
    marginBottom: 8,
  },
  gradeName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  gradeStats: {
    flexDirection: 'row',
    gap: 14,
  },
  gradeStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gradeStatLabel: {
    fontSize: 11,
    marginRight: 3,
  },
  gradeStatValue: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  coverageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  progressBarContainer: {
    flex: 1,
    height: 7,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  coverageText: {
    fontSize: 11,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 9,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 12.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12.5,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  studentInfo: {
    flex: 1,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  studentDetail: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  emptyText: {
    fontSize: 12.5,
    marginTop: 8,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#667eea',
    marginRight: 4,
  },
  summaryText: {
    fontSize: 11,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  modalSheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '500',
  },
});