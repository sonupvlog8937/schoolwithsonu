// HowItWorks component for mobile homepage
import React from 'react';
import { View, Text } from 'react-native';

const steps = [
  { step: '01', title: 'Book a Demo', desc: 'Schedule a call with our specialist' },
  { step: '02', title: 'Setup', desc: 'We handle data migration and training' },
  { step: '03', title: 'Go Live', desc: 'Launch within 24 hours' },
];

export default function HowItWorks() {
  return (
    <View style={{ marginTop: 32, paddingHorizontal: 20 }}>
      <View style={{ paddingBottom: 8 }}>
        <View style={{ backgroundColor: '#eef2ff', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 12 }}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: '#4f46e5', letterSpacing: 1 }}>SIMPLE PROCESS</Text>
        </View>
        <Text style={{ fontSize: 26, fontWeight: '800', color: '#0f172a', marginBottom: 8 }}>Get started in 3 steps</Text>
      </View>
      {steps.map((item, idx) => (
        <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={{ fontSize: 48, fontWeight: '800', color: 'rgba(79, 70, 229, 0.15)' }}>{item.step}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: '#0f172a', marginBottom: 4 }}>{item.title}</Text>
            <Text style={{ fontSize: 13, color: '#64748b' }}>{item.desc}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
