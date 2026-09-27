import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { APP_NAME, LOGO_URL } from '@/constants/branding';
import Breadcrumb from './Breadcrumb';

export default function Header() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userData, isLogin } = useAuth();

  return (
    <View>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          {/* Logo */}
          <Pressable style={styles.logoRow} onPress={() => router.push('/')}>
            <Image
              source={{ uri: LOGO_URL }}
              style={styles.logoImage}
            />
            <Text style={styles.logoText}>{APP_NAME}</Text>
          </Pressable>

          {/* Right Side Actions */}
          <View style={styles.actions}>
            {isLogin && userData ? (
              <Pressable style={styles.avatarButton} onPress={() => router.push('/(tabs)/more')}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {userData.name?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              </Pressable>
            ) : (
              <Pressable style={styles.loginButton} onPress={() => router.push('/login')}>
                <Feather name="log-in" size={16} color="#fff" />
                <Text style={styles.loginButtonText}>Login</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
      <Breadcrumb />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e6e9f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    minHeight: 48,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4f46e5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  avatarButton: {
    padding: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4f46e5',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
