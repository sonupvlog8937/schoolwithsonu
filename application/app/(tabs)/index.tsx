import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Pressable, Animated, Easing, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Search, X } from 'lucide-react-native';

// Apna `categories` array yahan se import hoga (README steps dekho)
import { categories } from '../constants/quickAccessData';

type Category = (typeof categories)[number];
type Sub = Category['subcategories'][number];
type Item = Sub & { color: string; catName: string };

const SIDEBAR_W = 88;
const GRID_PAD = 16;
const GRID_GAP = 10;

// Cards ko multi-color look dene ke liye rotating palette
const PALETTE = [
  { bg: ['#ffe4e6', '#fecdd3'], dot: '#f43f5e' },
  { bg: ['#fef3c7', '#fde68a'], dot: '#f59e0b' },
  { bg: ['#d1fae5', '#a7f3d0'], dot: '#10b981' },
  { bg: ['#e0f2fe', '#bae6fd'], dot: '#0ea5e9' },
  { bg: ['#ede9fe', '#ddd6fe'], dot: '#8b5cf6' },
  { bg: ['#fce7f3', '#fbcfe8'], dot: '#ec4899' },
  { bg: ['#ccfbf1', '#99f6e4'], dot: '#14b8a6' },
  { bg: ['#ffedd5', '#fed7aa'], dot: '#f97316' },
] as const;

const enterEase = Easing.out(Easing.cubic);

/* ---------- Sub-category card (staggered entrance + press spring) ---------- */
function SubCard({ item, index, width, showCat, onPress }: {
  item: Item; index: number; width: number; showCat?: boolean; onPress: () => void;
}) {
  const enter = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1, duration: 450, delay: Math.min(index, 14) * 40,
      easing: enterEase, useNativeDriver: true,
    }).start();
  }, [enter, index]);

  const p = PALETTE[index % PALETTE.length];
  const spring = (v: number) =>
    Animated.spring(press, { toValue: v, friction: 6, tension: 220, useNativeDriver: true }).start();
  const scale = Animated.multiply(
    enter.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }),
    press,
  );

  return (
    <Animated.View
      style={[styles.cardShadow, {
        width, opacity: enter,
        transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }, { scale }],
      }]}
    >
      <Pressable onPress={onPress} onPressIn={() => spring(0.95)} onPressOut={() => spring(1)} style={styles.card}>
        <LinearGradient colors={p.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardTop}>
          <View style={[styles.emojiWrap, { shadowColor: p.dot }]}>
            <Text style={styles.emoji}>{item.icon}</Text>
          </View>
        </LinearGradient>
        <View style={styles.cardBottom}>
          <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
          {showCat && <Text style={[styles.cardCat, { color: item.color }]} numberOfLines={1}>{item.catName}</Text>}
        </View>
        <View style={[styles.cardBar, { backgroundColor: p.dot }]} />
      </Pressable>
    </Animated.View>
  );
}

/* ---------- Sidebar category item (animated selection) ---------- */
function CategoryItem({ cat, active, onPress }: { cat: Category; active: boolean; onPress: () => void }) {
  const sel = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(sel, { toValue: active ? 1 : 0, duration: 280, easing: enterEase, useNativeDriver: false }).start();
  }, [active, sel]);

  const Icon = cat.icon;
  const iconBg = sel.interpolate({ inputRange: [0, 1], outputRange: [`${cat.color}1f`, cat.color] });
  const rowBg = sel.interpolate({ inputRange: [0, 1], outputRange: [`${cat.color}00`, `${cat.color}14`] });
  const nameColor = sel.interpolate({ inputRange: [0, 1], outputRange: ['#64748b', cat.color] });
  const scale = sel.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <Animated.View style={[styles.categoryItem, { backgroundColor: rowBg }]}>
        <Animated.View style={[styles.indicator, { backgroundColor: cat.color, transform: [{ scaleY: sel }] }]} />
        <Animated.View style={[styles.categoryIconWrapper, { backgroundColor: iconBg, transform: [{ scale }] }]}>
          <Icon color={active ? '#fff' : cat.color} size={17} />
        </Animated.View>
        <Animated.Text style={[styles.categoryName, { color: nameColor }, active && { fontWeight: '700' }]} numberOfLines={2}>
          {cat.name}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

/* ---------- Slide/fade wrapper for banner ---------- */
function FadeIn({ children }: { children: React.ReactNode }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 380, easing: enterEase, useNativeDriver: true }).start();
  }, [v]);
  return (
    <Animated.View style={{ opacity: v, transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }}>
      {children}
    </Animated.View>
  );
}

/* ---------- Screen ---------- */
export default function QuickAccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [selected, setSelected] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  const cardW = (width - SIDEBAR_W - GRID_PAD * 2 - GRID_GAP) / 2;
  const total = useMemo(() => categories.reduce((n, c) => n + c.subcategories.length, 0), []);
  const cat = categories[selected];
  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  const results: Item[] = useMemo(() => {
    if (!q) return [];
    return categories.flatMap((c) =>
      c.subcategories
        .filter((s) => s.name.toLowerCase().includes(q))
        .map((s) => ({ ...s, color: c.color, catName: c.name })),
    );
  }, [q]);

  const items: Item[] = searching
    ? results
    : cat.subcategories.map((s) => ({ ...s, color: cat.color, catName: cat.name }));

  const toggleSearch = () => {
    const next = !searchOpen;
    setSearchOpen(next);
    if (!next) setQuery('');
    Animated.timing(searchAnim, { toValue: next ? 1 : 0, duration: 260, easing: enterEase, useNativeDriver: false })
      .start(() => { if (next) inputRef.current?.focus(); });
  };

  const CatIcon = cat.icon;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={['#6366f1', '#a855f7', '#ec4899']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Quick Access</Text>
            <Text style={styles.headerSub}>{categories.length} modules • {total} shortcuts</Text>
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={toggleSearch} activeOpacity={0.7}>
            {searchOpen ? <X color="#fff" size={18} /> : <Search color="#fff" size={18} />}
          </TouchableOpacity>
        </View>

        <Animated.View style={{
          height: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 40] }),
          marginTop: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 12] }),
          opacity: searchAnim, overflow: 'hidden',
        }}>
          <View style={styles.searchBox}>
            <Search color="#fff" size={15} />
            <TextInput
              ref={inputRef} value={query} onChangeText={setQuery}
              placeholder="Search all shortcuts" placeholderTextColor="rgba(255,255,255,0.7)"
              style={styles.searchInput} returnKeyType="search" autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}><X color="#fff" size={15} /></TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <Text style={styles.sidebarTitle}>Categories</Text>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            {categories.map((c, i) => (
              <CategoryItem
                key={`${c.name}-${i}`} cat={c} active={!searching && selected === i}
                onPress={() => { setSelected(i); if (searching) setQuery(''); }}
              />
            ))}
          </ScrollView>
        </View>

        {/* Main */}
        <View style={styles.mainContent}>
          <FadeIn key={searching ? `s-${q}` : `c-${selected}`}>
            <LinearGradient
              colors={searching ? ['#6366f1', '#ec4899'] : [cat.color, `${cat.color}b3`]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}
            >
              {!searching && <CatIcon color="rgba(255,255,255,0.18)" size={70} style={styles.watermark} />}
              <View style={styles.bannerIcon}>
                {searching ? <Search color="#fff" size={16} /> : <CatIcon color="#fff" size={16} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitle} numberOfLines={1}>{searching ? `Results for "${query.trim()}"` : cat.name}</Text>
                <Text style={styles.bannerSub}>{items.length} {items.length === 1 ? 'shortcut' : 'shortcuts'}</Text>
              </View>
            </LinearGradient>
          </FadeIn>

          <ScrollView
            key={searching ? `list-s-${q}` : `list-${selected}`}
            showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.grid}
          >
            {items.length === 0 ? (
              <Text style={styles.empty}>Koi shortcut nahi mila. Doosra keyword try karo.</Text>
            ) : (
              items.map((item, i) => (
                <SubCard
                  key={`${item.catName}-${item.name}-${i}`} item={item} index={i} width={cardW} showCat={searching}
                  onPress={() => router.push(item.route as any)}
                />
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6ff' },

  header: { paddingHorizontal: 18, paddingBottom: 14, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 10.5, color: 'rgba(255,255,255,0.85)', marginTop: 1 },
  searchButton: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.22)' },
  searchInput: { flex: 1, fontSize: 12.5, color: '#fff', paddingVertical: 0 },

  content: { flex: 1, flexDirection: 'row' },

  sidebar: { width: SIDEBAR_W, backgroundColor: '#fff', borderRightWidth: 1, borderRightColor: '#eceefb' },
  sidebarTitle: { fontSize: 11.5, fontWeight: '700', color: '#94a3b8', paddingHorizontal: 12, paddingVertical: 12 },
  categoryItem: { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4, marginHorizontal: 6, marginBottom: 4, borderRadius: 12 },
  indicator: { position: 'absolute', left: -6, top: 14, width: 3, height: 28, borderRadius: 2 },
  categoryIconWrapper: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  categoryName: { fontSize: 9.5, fontWeight: '500', textAlign: 'center' },

  mainContent: { flex: 1 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: GRID_PAD, marginTop: 12, padding: 12, borderRadius: 14, overflow: 'hidden' },
  watermark: { position: 'absolute', right: -6, top: -8, transform: [{ rotate: '-12deg' }] },
  bannerIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  bannerTitle: { fontSize: 13, fontWeight: '800', color: '#fff' },
  bannerSub: { fontSize: 10.5, color: 'rgba(255,255,255,0.88)', marginTop: 1 },

  grid: { padding: GRID_PAD, paddingBottom: 100, flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP },
  empty: { fontSize: 12, color: '#94a3b8', textAlign: 'center', width: '100%', paddingVertical: 40 },

  cardShadow: {
    backgroundColor: '#fff', borderRadius: 14,
    shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 3,
  },
  card: { borderRadius: 14, overflow: 'hidden' },
  cardTop: { height: 78, alignItems: 'center', justifyContent: 'center' },
  emojiWrap: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 8, elevation: 4,
  },
  emoji: { fontSize: 22 },
  cardBottom: { paddingHorizontal: 8, paddingTop: 8, paddingBottom: 10, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  cardName: { fontSize: 10.5, fontWeight: '600', color: '#1e293b', textAlign: 'center' },
  cardCat: { fontSize: 9, fontWeight: '600', marginTop: 2 },
  cardBar: { height: 3, width: '100%' },
});