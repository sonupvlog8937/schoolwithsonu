// HeroCarousel component for mobile homepage
import React, { useState } from 'react';
import { View, Text, FlatList, Dimensions, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Complete School\nManagement System',
    subtitle: 'Streamline your school operations with our all-in-one platform',
    gradient: ['#4f46e5', '#6366f1', '#818cf8'],
  },
  {
    id: 2,
    title: 'Smart Attendance\nTracking',
    subtitle: 'Biometric & app-based attendance with automated alerts',
    gradient: ['#3b82f6', '#60a5fa', '#93c5fd'],
  },
  {
    id: 3,
    title: 'Fee Management\nMade Easy',
    subtitle: 'Secure online payments with instant receipts',
    gradient: ['#10b981', '#34d399', '#6ee7b7'],
  },
];

export default function HeroCarousel() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);

  const renderSlide = ({ item }: any) => (
    <View style={[{ height: 320 }, { width }]}>
      <LinearGradient colors={item.gradient} style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
        <View style={{ maxWidth: '85%' }}>
          <Text style={{ fontSize: 32, fontWeight: '800', color: '#fff', marginBottom: 12, lineHeight: 38 }}>
            {item.title}
          </Text>
          <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.9)', marginBottom: 24, lineHeight: 22 }}>
            {item.subtitle}
          </Text>
          <Pressable
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25 }}
            onPress={() => router.push('/login')}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#4f46e5' }}>Get Started</Text>
            <Feather name="arrow-right" size={18} color="#4f46e5" />
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <>
      <FlatList
        data={slides}
        renderItem={renderSlide}
        keyExtractor={item => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={e => {
          const slide = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveSlide(slide);
        }}
        scrollEventThrottle={16}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 16 }}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={{ width: activeSlide === index ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: activeSlide === index ? '#4f46e5' : '#e2e8f0' }}
          />
        ))}
      </View>
    </>
  );
}
