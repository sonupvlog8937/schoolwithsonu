import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, Platform, Animated, Easing,
  LayoutChangeEvent, useColorScheme,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useAuth } from '@/context/AuthContext';

type IconName = React.ComponentProps<typeof Feather>['name'];

const ACCENT = '#6366f1';      // active color (indigo)
const BAR_H = 64;              // tab row height
const BOTTOM_GAP = 14;         // neeche ka extra gap (safe-area ke upar)
const PILL_W = 52;             // lavender pill behind the icon
const PILL_H = 34;
const PILL_TOP = 7;

const TABS: { name: string; route: string; icon: IconName }[] = [
  { name: 'Quick Access', route: '/', icon: 'grid' },
  { name: 'Attendance', route: '/attendance', icon: 'calendar' },
  { name: 'Fees', route: '/fees', icon: 'dollar-sign' },
  { name: 'More', route: '/more', icon: 'menu' },
];

// Hide tabs on these routes
const HIDE_TABS_ROUTES = [
  '/login', '/signup', '/register', '/forgot-password', '/verify-account',
  '/contact', '/profile', '/settings', '/change-password',
];

/* ---------- Single tab: icon bounce + press spring ---------- */
function TabItem({ tab, active, isDark, onPress }: {
  tab: (typeof TABS)[number]; active: boolean; isDark: boolean; onPress: () => void;
}) {
  const on = useRef(new Animated.Value(active ? 1 : 0)).current;
  const press = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(on, { toValue: active ? 1 : 0, friction: 5, tension: 140, useNativeDriver: true }).start();
  }, [active, on]);

  const spring = (v: number) =>
    Animated.spring(press, { toValue: v, friction: 6, tension: 240, useNativeDriver: true }).start();

  const color = active ? ACCENT : isDark ? '#94a3b8' : '#8f94ab';

  return (
    <Animated.View style={[styles.tabItem, { transform: [{ scale: press }] }]}>
      <Pressable
        style={styles.tabPress}
        onPress={onPress}
        onPressIn={() => spring(0.92)}
        onPressOut={() => spring(1)}
        accessibilityRole="button"
        accessibilityLabel={tab.name}
        accessibilityState={{ selected: active }}
      >
        <View style={styles.iconArea}>
          <Animated.View style={{ transform: [{ scale: on.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }] }}>
            <Feather name={tab.icon} size={20} color={color} />
          </Animated.View>
        </View>
        <Text style={[styles.label, { color }, active && styles.labelActive]} numberOfLines={1}>
          {tab.name}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

/* ---------- Tab bar ---------- */
export function PersistentTabBar() {
  const router = useRouter();
  const pathname = usePathname() || '';
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { userData } = useAuth();

  const [rowW, setRowW] = useState(0);
  const enter = useRef(new Animated.Value(0)).current;
  const pos = useRef(new Animated.Value(0)).current;
  const indOpacity = useRef(new Animated.Value(0)).current;

  // Bar tabhi dikhega jab user logged in ho aur auth/public route par na ho.
  // ('/' ab Dashboard hai, isliye wahan bhi dikhega)
  const isLoggedIn = !!userData;
  const isAuthRoute = HIDE_TABS_ROUTES.some((route) => pathname.startsWith(route));
  const shouldHideTabs = !isLoggedIn || isAuthRoute;

  const isActive = (route: string) => {
    if (route === '/') {
      return pathname === '/' || pathname === '/index' || pathname === '/(tabs)' || pathname.startsWith('/(tabs)');
    }
    return pathname === route || pathname.startsWith(route);
  };
  const activeIndex = TABS.findIndex((t) => isActive(t.route));

  // Bar slides up whenever it becomes visible
  useEffect(() => {
    if (shouldHideTabs) { enter.setValue(0); return; }
    Animated.timing(enter, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [shouldHideTabs, enter]);

  // Lavender pill slides to the active tab
  useEffect(() => {
    if (activeIndex < 0) {
      Animated.timing(indOpacity, { toValue: 0, duration: 200, useNativeDriver: false }).start();
      return;
    }
    Animated.parallel([
      Animated.spring(pos, { toValue: activeIndex, friction: 8, tension: 80, useNativeDriver: false }),
      Animated.timing(indOpacity, { toValue: 1, duration: 200, useNativeDriver: false }),
    ]).start();
  }, [activeIndex, pos, indOpacity]);

  if (shouldHideTabs) {
    return null;
  }

  const tabW = rowW ? rowW / TABS.length : 0;
  const inputRange = TABS.map((_, i) => i);
  const onLayout = (e: LayoutChangeEvent) => setRowW(e.nativeEvent.layout.width);

  const go = (route: string) => {
    if (route === '/') router.push('/(tabs)');
    else router.push(route as any);
  };

  const bg = Platform.OS === 'ios'
    ? (isDark ? 'rgba(30,41,59,0.8)' : 'rgba(255,255,255,0.88)')
    : (isDark ? '#1e293b' : '#ffffff');

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom + BOTTOM_GAP,
          backgroundColor: bg,
          borderTopColor: isDark ? 'rgba(148,163,184,0.2)' : '#e2e8f0',
          opacity: enter,
          transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
        },
      ]}
    >
      {Platform.OS === 'ios' && (
        <BlurView intensity={100} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      )}

      <View style={styles.row} onLayout={onLayout}>
        {/* sliding lavender pill (behind the icon only) */}
        <Animated.View
          pointerEvents="none"
          style={[styles.pill, {
            opacity: indOpacity,
            backgroundColor: isDark ? `${ACCENT}33` : `${ACCENT}22`,
            transform: [{
              translateX: pos.interpolate({
                inputRange,
                outputRange: TABS.map((_, i) => i * tabW + (tabW - PILL_W) / 2),
              }),
            }],
          }]}
        />
        {TABS.map((tab) => (
          <TabItem key={tab.route} tab={tab} active={isActive(tab.route)} isDark={isDark} onPress={() => go(tab.route)} />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderTopWidth: StyleSheet.hairlineWidth,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  row: {
    flexDirection: 'row',
    height: BAR_H,
  },
  pill: {
    position: 'absolute',
    top: PILL_TOP,
    left: 0,
    width: PILL_W,
    height: PILL_H,
    borderRadius: PILL_H / 2,
  },
  tabItem: {
    flex: 1,
  },
  tabPress: {
    flex: 1,
    alignItems: 'center',
    paddingTop: PILL_TOP,
  },
  iconArea: {
    height: PILL_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 3,
  },
  labelActive: {
    fontWeight: '700',
  },
});