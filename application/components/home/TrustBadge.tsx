// TrustBadge component for mobile homepage
import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function TrustBadge() {
  const avatars = ['#ef4444', '#10b981', '#3b82f6'];
  const letters = ['R', 'P', 'S'];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#fff', marginHorizontal: 20, marginTop: -20, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 100, elevation: 4 }}>
      <View style={{ flexDirection: 'row' }}>
        {avatars.map((color, i) => (
          <View key={i} style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: color, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', marginLeft: i > 0 ? -8 : 0 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>{letters[i]}</Text>
          </View>
        ))}
      </View>
      <Text style={{ fontSize: 12, fontWeight: '700', color: '#0f172a' }}>Trusted by 500+ schools</Text>
      <View style={{ flexDirection: 'row' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Feather key={i} name="star" size={10} color="#f59e0b" style={{ marginRight: 2 }} />
        ))}
      </View>
    </View>
  );
}
