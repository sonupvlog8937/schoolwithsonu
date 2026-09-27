import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { fetchDataFromApi } from '@/utils/api';
import { getSchoolImageSrc } from '@/utils/imageHelpers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const THEME = {
  bg: '#FFFDF7',
  surface: '#FFFFFF',
  ink: '#1F2937',
  inkMuted: '#6B7280',
  inkFaint: '#9CA3AF',
  primary: '#F5B301',
  primaryDeep: '#B87A00',
  border: '#F3E8C7',
};

export default function SchoolsListScreen() {
  const router = useRouter();

  const { data: schoolsData, isLoading } = useQuery({
    queryKey: ['all-schools'],
    queryFn: () => fetchDataFromApi('/api/public/schools'),
  });

  const schools = schoolsData?.schools ?? [];

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={THEME.primaryDeep} />
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>All Registered Schools</Text>
          <Text style={styles.subtitle}>
            Explore our growing network of digitally empowered institutions
          </Text>
        </View>

        {/* Schools List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={THEME.primary} />
            <Text style={styles.loadingText}>Loading schools...</Text>
          </View>
        ) : schools.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={48} color={THEME.inkMuted} />
            <Text style={styles.emptyText}>No schools found</Text>
          </View>
        ) : (
          <View style={styles.schoolsList}>
            {schools.map((school: any) => (
              <Pressable
                key={school._id}
                style={styles.schoolCard}
                onPress={() => router.push(`/schools/${school._id}`)}
              >
                <Image
                  source={{ uri: getSchoolImageSrc(school.schoolImage) }}
                  style={styles.schoolImage}
                  resizeMode="cover"
                />
                <View style={styles.schoolInfo}>
                  <Text style={styles.schoolName} numberOfLines={2}>
                    {school.schoolName}
                  </Text>
                  {school.ownerName && (
                    <Text style={styles.schoolOwner} numberOfLines={1}>
                      {school.ownerName}
                    </Text>
                  )}
                  {school.address && (
                    <View style={styles.addressRow}>
                      <Feather name="map-pin" size={14} color={THEME.inkMuted} />
                      <Text style={styles.schoolAddress} numberOfLines={1}>
                        {school.address}
                      </Text>
                    </View>
                  )}
                </View>
                <Feather name="chevron-right" size={20} color={THEME.inkFaint} />
              </Pressable>
            ))}
          </View>
        )}

        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  scrollView: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.primaryDeep,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 8,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    color: THEME.inkMuted,
    lineHeight: 22,
  },
  loadingContainer: {
    padding: 48,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: THEME.inkMuted,
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: THEME.inkMuted,
  },
  schoolsList: {
    paddingHorizontal: 24,
    gap: 16,
    paddingBottom: 24,
  },
  schoolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.surface,
    borderRadius: 12,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  schoolImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: THEME.border,
  },
  schoolInfo: {
    flex: 1,
    gap: 4,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.ink,
    lineHeight: 22,
  },
  schoolOwner: {
    fontSize: 14,
    color: THEME.inkMuted,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  schoolAddress: {
    fontSize: 13,
    color: THEME.inkMuted,
    flex: 1,
  },
});
