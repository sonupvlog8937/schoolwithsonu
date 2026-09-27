import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from 'react-native';

export function PersistentHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { userData, isLogin } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Hide header on these routes (routes that have their own custom headers)
  const hideHeaderRoutes = [
    '/login', 
    '/signup', 
    '/register', 
    '/forgot-password', 
    '/verify-account',
    '/contact',
    '/(tabs)'
  ];
  
  // Show header only when user is logged in and not on auth/public routes
  const isPublicRoute = pathname === '/index' || !pathname;
  const isAuthRoute = hideHeaderRoutes.some(route => pathname.startsWith(route));
  const shouldHideHeader = !isLogin || isPublicRoute || isAuthRoute;

  if (shouldHideHeader) {
    return null;
  }

  const schoolName = userData?.school_name || userData?.owner_name || 'OurSchool';
  const schoolLogo = userData?.school_logo || userData?.logo;
  const userName = userData?.name || userData?.owner_name || 'User';
  const userRole = userData?.role || 'ADMIN';

  return (
    <View 
      style={[
        styles.container, 
        { 
          paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + 8,
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderBottomColor: isDark ? '#334155' : '#e2e8f0',
        }
      ]}
    >
      <View style={styles.content}>
        {/* Left: School Logo + Name */}
        <View style={styles.leftSection}>
          <View style={[styles.logoWrapper, { backgroundColor: isDark ? '#334155' : '#f1f5f9' }]}>
            {schoolLogo ? (
              <Image 
                source={{ uri: schoolLogo }} 
                style={styles.logo}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.logoText}>
                {schoolName.substring(0, 2).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.schoolInfo}>
            <Text style={[styles.schoolName, { color: isDark ? '#f1f5f9' : '#0f172a' }]} numberOfLines={1}>
              {schoolName}
            </Text>
            <Text style={[styles.schoolSubtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              School Management
            </Text>
          </View>
        </View>

        {/* Right: Profile */}
        <TouchableOpacity 
          style={[styles.profileButton, { backgroundColor: isDark ? '#334155' : '#f1f5f9' }]}
          onPress={() => router.push('/profile')}
          activeOpacity={0.7}
        >
          <View style={styles.profileContent}>
            <View style={styles.profileIconWrapper}>
              <User color={isDark ? '#f1f5f9' : '#0f172a'} size={20} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.userName, { color: isDark ? '#f1f5f9' : '#0f172a' }]} numberOfLines={1}>
                {userName}
              </Text>
              <Text style={[styles.userRole, { color: isDark ? '#94a3b8' : '#64748b' }]} numberOfLines={1}>
                {userRole}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  logoWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ff6347',
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  schoolSubtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  profileButton: {
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ff634715',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  profileInfo: {
    maxWidth: 100,
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 9,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
});
