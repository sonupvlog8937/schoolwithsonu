import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { fetchDataFromApi } from '@/utils/api';
import { EmptyView } from '@/components/EmptyView';
import { LoadingView } from '@/components/LoadingView';

export interface AdminFeatureConfig {
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  endpoint?: string;
  responseKeys?: string[];
  primaryField?: string;
  secondaryField?: string;
  statLabel?: string;
  actions?: string[];
}

const readPath = (item: Record<string, unknown>, path?: string) => {
  if (!path) return undefined;
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, item);
};

const normalizeRows = (data: unknown, keys: string[]) => {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (!data || typeof data !== 'object') return [];
  const record = data as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value as Record<string, unknown>[];
  }
  return [];
};

export function AdminFeatureScreen({ config }: { config: AdminFeatureConfig }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const s = styles(colors);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const { data, refetch, isLoading, isError } = useQuery({
    queryKey: ['admin-feature', config.title, config.endpoint],
    queryFn: () => (config.endpoint ? fetchDataFromApi(config.endpoint) : Promise.resolve({ data: [] })),
    enabled: Boolean(config.endpoint),
  });

  const rows = normalizeRows(data, config.responseKeys ?? ['data', 'list', 'items', 'orders', 'products', 'users']);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderItem = ({ item, index }: { item: Record<string, unknown>; index: number }) => {
    const primary = readPath(item, config.primaryField) ?? item.name ?? item.title ?? item._id ?? `${config.title} ${index + 1}`;
    const secondary = readPath(item, config.secondaryField) ?? item.email ?? item.status ?? item.createdAt ?? 'Tap web admin for full edit controls';
    return (
      <View style={s.card}>
        <View style={[s.itemIcon, { backgroundColor: colors.primary + '18' }]}>
          <Feather name={config.icon} size={18} color={colors.primary} />
        </View>
        <View style={s.itemBody}>
          <Text style={s.itemTitle} numberOfLines={1}>{String(primary)}</Text>
          <Text style={s.itemSubtitle} numberOfLines={2}>{String(secondary)}</Text>
        </View>
      </View>
    );
  };

  if (isLoading && rows.length === 0) return <LoadingView message={`Loading ${config.title.toLowerCase()}...`} />;

  return (
    <View style={[s.container, { paddingTop: topPad, paddingBottom: botPad }]}>
      <View style={s.headerRow}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={s.pageTitle}>{config.title}</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={s.hero}>
        <View style={[s.heroIcon, { backgroundColor: colors.primary + '18' }]}>
          <Feather name={config.icon} size={24} color={colors.primary} />
        </View>
        <View style={s.heroText}>
          <Text style={s.heroTitle}>{config.description}</Text>
          <Text style={s.heroSub}>Same admin feature is available in mobile with live data, refresh, and safe fallback UI.</Text>
        </View>
      </View>

      {config.actions?.length ? (
        <View style={s.actions}>
          {config.actions.map((action) => <Text key={action} style={s.actionPill}>{action}</Text>)}
        </View>
      ) : null}

      {isError ? (
        <EmptyView icon="wifi-off" title={`Failed to load ${config.title}`} actionLabel="Retry" onAction={refetch} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item, index) => String(item._id ?? item.id ?? index)}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListHeaderComponent={<Text style={s.count}>{rows.length} {config.statLabel ?? 'records'}</Text>}
          ListEmptyComponent={<EmptyView icon={config.icon} title={`No ${config.title.toLowerCase()} found`} description="Pull to refresh or use the web admin for creating new records." />}
        />
      )}
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  backBtn: { padding: 4 },
  pageTitle: { fontSize: 17, fontWeight: '700', color: colors.foreground, fontFamily: 'Inter_700Bold' },
  hero: { margin: 16, padding: 16, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, flexDirection: 'row', gap: 12 },
  heroIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  heroText: { flex: 1 },
  heroTitle: { fontSize: 15, color: colors.foreground, fontFamily: 'Inter_700Bold' },
  heroSub: { marginTop: 4, fontSize: 12, lineHeight: 18, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  actionPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, overflow: 'hidden', backgroundColor: colors.muted, color: colors.foreground, fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  list: { padding: 16, gap: 10, paddingBottom: 32 },
  count: { color: colors.mutedForeground, fontSize: 12, marginBottom: 10, fontFamily: 'Inter_500Medium' },
  card: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  itemIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  itemBody: { flex: 1 },
  itemTitle: { fontSize: 14, color: colors.foreground, fontFamily: 'Inter_600SemiBold' },
  itemSubtitle: { marginTop: 3, fontSize: 12, lineHeight: 17, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
});
