// StatsSection component for mobile homepage
import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';

const stats = [
  { label: 'Schools', value: '500+', icon: 'home', color: '#3b82f6', bg: '#eff6ff' },
  { label: 'Students', value: '10K+', icon: 'users', color: '#10b981', bg: '#ecfdf5' },
  { label: 'Awards', value: '25+', icon: 'award', color: '#f59e0b', bg: '#fffbeb' },
  { label: 'Years', value: '8+', icon: 'shield', color: '#8b5cf6', bg: '#f5f3ff' },
];

export default function StatsSection() {
  const renderStat = ({ item }: any) => (
    <View style={{ width: 120, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', marginRight: 12 }}>
      <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        <Feather name={item.icon as any} size={24} color={item.color} />
      </View>
      <Text style={{ fontSize: 24, fontWeight: '800', color: '#0f172a' }}>{item.value}</Text>
      <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748b', marginTop: 4 }}>{item.label}</Text>
    </View>
  );

  return (
    <View style={{ marginTop: 32 }}>
      <FlatList
        data={stats}
        renderItem={renderStat}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        keyExtractor={item => item.label}
      />
    </View>
  );
}
