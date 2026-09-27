import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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

export default function SchoolDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { data: schoolData, isLoading, error } = useQuery({
    queryKey: ['school-detail', id],
    queryFn: () => fetchDataFromApi(`/api/public/schools/${id}`),
    enabled: !!id,
  });

  const school = schoolData?.school;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text style={styles.loadingText}>Loading school details...</Text>
        </View>
      </View>
    );
  }

  if (error || !school) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={THEME.inkMuted} />
          <Text style={styles.errorText}>School not found</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color={THEME.primaryDeep} />
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <Pressable style={styles.backButtonTop} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={THEME.primaryDeep} />
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        {/* School Image */}
        {school.schoolImage && (
          <Image
            source={{ uri: getSchoolImageSrc(school.schoolImage) }}
            style={styles.schoolImage}
            resizeMode="cover"
          />
        )}

        {/* School Info */}
        <View style={styles.content}>
          <Text style={styles.schoolName}>{school.schoolName}</Text>
          
          {school.ownerName && (
            <View style={styles.infoRow}>
              <Feather name="user" size={16} color={THEME.inkMuted} />
              <Text style={styles.infoLabel}>Owner:</Text>
              <Text style={styles.infoValue}>{school.ownerName}</Text>
            </View>
          )}

          {school.email && (
            <View style={styles.infoRow}>
              <Feather name="mail" size={16} color={THEME.inkMuted} />
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{school.email}</Text>
            </View>
          )}

          {school.phoneNumber && (
            <View style={styles.infoRow}>
              <Feather name="phone" size={16} color={THEME.inkMuted} />
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{school.phoneNumber}</Text>
            </View>
          )}

          {school.address && (
            <View style={styles.infoRow}>
              <Feather name="map-pin" size={16} color={THEME.inkMuted} />
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>{school.address}</Text>
            </View>
          )}

          {school.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>{school.description}</Text>
            </View>
          )}
        </View>

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: THEME.inkMuted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.ink,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: THEME.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  backButtonTop: {
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
  schoolImage: {
    width: '100%',
    height: 250,
    backgroundColor: THEME.border,
  },
  content: {
    padding: 24,
  },
  schoolName: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 20,
    lineHeight: 36,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.inkMuted,
  },
  infoValue: {
    fontSize: 14,
    color: THEME.ink,
    flex: 1,
  },
  descriptionSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.ink,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: THEME.inkMuted,
    lineHeight: 24,
  },
});
