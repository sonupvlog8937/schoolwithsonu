import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { 
  User, 
  Mail, 
  School, 
  LogOut, 
  Lock, 
  Bell, 
  Settings, 
  HelpCircle,
  Clock,
  Shield,
  ChevronRight
} from 'lucide-react-native';
import { getSessionInfo } from '@/utils/authUtils';

export default function MoreScreen() {
  const { userData, logout } = useAuth();
  const router = useRouter();
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  useEffect(() => {
    loadSessionInfo();
  }, []);

  const loadSessionInfo = async () => {
    const info = await getSessionInfo();
    setSessionInfo(info);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const getSessionColor = () => {
    if (!sessionInfo) return '#64748b';
    if (sessionInfo.remainingDays <= 3) return '#ef4444';
    if (sessionInfo.remainingDays <= 7) return '#f59e0b';
    return '#10b981';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <LinearGradient
          colors={['#6366f1', '#8b5cf6', '#ec4899']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.avatarContainer}>
            {userData?.image_url ? (
              <Image source={{ uri: userData.image_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User color="#fff" size={40} />
              </View>
            )}
          </View>
          <Text style={styles.userName}>{userData?.name || 'User'}</Text>
          <Text style={styles.userRole}>{userData?.role}</Text>
          {userData?.school_name && (
            <View style={styles.schoolBadge}>
              <School color="#fff" size={14} />
              <Text style={styles.schoolName}>{userData.school_name}</Text>
            </View>
          )}
        </LinearGradient>

        {/* Session Info */}
        {sessionInfo && sessionInfo.isValid && (
          <View style={styles.section}>
            <View style={[styles.sessionCard, { borderColor: getSessionColor() }]}>
              <View style={styles.sessionRow}>
                <Clock color={getSessionColor()} size={20} />
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionLabel}>Session Expires</Text>
                  <Text style={styles.sessionValue}>
                    {sessionInfo.remainingDays} days left
                  </Text>
                  <Text style={styles.sessionDate}>
                    {sessionInfo.expiryTime.toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <View style={[styles.sessionIndicator, { backgroundColor: getSessionColor() }]} />
            </View>
          </View>
        )}

        {/* Account Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon={User}
              label="Profile"
              onPress={() => router.push('/profile')}
            />
            <MenuItem
              icon={Mail}
              label={userData?.email || 'Email'}
              value={userData?.email || 'N/A'}
              isInfo
            />
            {userData?.schoolId && (
              <MenuItem
                icon={School}
                label="School ID"
                value={userData.schoolId}
                isInfo
              />
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon={Lock}
              label="Change Password"
              onPress={() => router.push('/change-password')}
            />
            <MenuItem
              icon={Bell}
              label="Notifications"
              onPress={() => Alert.alert('Notifications', 'Coming soon!')}
            />
            <MenuItem
              icon={Settings}
              label="Settings"
              onPress={() => router.push('/settings')}
            />
            <MenuItem
              icon={HelpCircle}
              label="Help & Support"
              onPress={() => Alert.alert('Help', 'Contact: support@ourschool.com')}
            />
          </View>
        </View>

        {/* Security Badge */}
        <View style={styles.securityBadge}>
          <Shield color="#10b981" size={16} />
          <Text style={styles.securityText}>
            Your data is encrypted and secure
          </Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.7}
          style={styles.logoutButton}
        >
          <LogOut color="#ef4444" size={20} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>OurSchool v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

interface MenuItemProps {
  icon: any;
  label: string;
  value?: string;
  onPress?: () => void;
  isInfo?: boolean;
}

function MenuItem({ icon: Icon, label, value, onPress, isInfo }: MenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={isInfo ? 1 : 0.7}
      disabled={isInfo}
    >
      <View style={styles.menuIcon}>
        <Icon color="#6366f1" size={20} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuLabel}>{label}</Text>
        {value && <Text style={styles.menuValue}>{value}</Text>}
      </View>
      {!isInfo && <ChevronRight color="#cbd5e1" size={20} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 32,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    fontWeight: '600',
  },
  schoolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  schoolName: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  sessionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  sessionDate: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  sessionIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  menuValue: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  securityText: {
    fontSize: 12,
    color: '#64748b',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fee2e2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 16,
  },
});
