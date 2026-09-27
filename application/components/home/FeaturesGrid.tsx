// FeaturesGrid component for mobile homepage
import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

const features = [
  { title: 'Smart Attendance', desc: 'Biometric & app-based tracking with automated reports', icon: 'check-circle', color: '#3b82f6', bg: '#eff6ff' },
  { title: 'Fee Management', desc: 'Secure payments with automated reminders', icon: 'credit-card', color: '#10b981', bg: '#ecfdf5' },
  { title: 'Notifications', desc: 'Real-time alerts for exams and announcements', icon: 'bell', color: '#f59e0b', bg: '#fffbeb' },
  { title: 'Reports', desc: 'Digital report cards and analytics', icon: 'trending-up', color: '#8b5cf6', bg: '#f5f3ff' },
  { title: 'Data Security', desc: '256-bit encryption with daily backups', icon: 'lock', color: '#ef4444', bg: '#fef2f2' },
  { title: '24/7 Support', desc: 'Round-the-clock customer assistance', icon: 'headphones', color: '#06b6d4', bg: '#ecfeff' },
];

export default function FeaturesGrid() {
  return (
    <View style={{ marginTop: 32, paddingHorizontal: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {features.map((f, i) => (
        <View key={i} style={{ width: '48%' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: f.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Feather name={f.icon as any} size={22} color={f.color} />
            </View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#0f172a', marginBottom: 6 }}>{f.title}</Text>
            <Text style={{ fontSize: 12, color: '#64748b', lineHeight: 18 }}>{f.desc}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
