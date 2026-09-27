import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, useColorScheme, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Tabs } from 'expo-router';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' }} />
        <Label>Quick Access</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="attendance">
        <Icon sf={{ default: 'calendar', selected: 'calendar.badge.clock' }} />
        <Label>Attendance</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="fees">
        <Icon sf={{ default: 'dollarsign.circle', selected: 'dollarsign.circle.fill' }} />
        <Label>Fees</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="more">
        <Icon sf={{ default: 'line.3.horizontal', selected: 'line.3.horizontal' }} />
        <Label>More</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

/** Icon wrapper that animates a soft pill background + gentle bounce when the tab becomes active. */
function TabIcon({
  focused,
  color,
  activeColor,
  children,
}: {
  focused: boolean;
  color: string;
  activeColor: string;
  children: React.ReactNode;
}) {
  const scale = useRef(new Animated.Value(focused ? 1 : 0.9)).current;
  const pillOpacity = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1 : 0.9,
        useNativeDriver: true,
        friction: 6,
        tension: 140,
      }),
      Animated.timing(pillOpacity, {
        toValue: focused ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, scale, pillOpacity]);

  return (
    <View style={styles.iconStack}>
      <Animated.View
        style={[
          styles.pill,
          {
            backgroundColor: `${activeColor}1A`,
            opacity: pillOpacity,
            transform: [{ scale: pillOpacity }],
          },
        ]}
      />
      <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>
    </View>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const safeAreaInsets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';
  const isIOS = Platform.OS === 'ios';
  const isWeb = Platform.OS === 'web';

  const tabs: {
    name: string;
    title: string;
    sf: string;
    feather: React.ComponentProps<typeof Feather>['name'];
  }[] = [
    { name: 'index', title: 'Quick Access', sf: 'square.grid.2x2', feather: 'grid' },
    { name: 'attendance', title: 'Attendance', sf: 'calendar', feather: 'calendar' },
    { name: 'fees', title: 'Fees', sf: 'dollarsign.circle', feather: 'dollar-sign' },
    { name: 'more', title: 'More', sf: 'line.3.horizontal', feather: 'menu' },
  ];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarShowLabel: true,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: isIOS ? 'transparent' : colors.card,
            borderColor: colors.border,
            bottom: isWeb ? 0 : 16 + safeAreaInsets.bottom * 0.4,
            marginHorizontal: isWeb ? 0 : 16,
            borderRadius: isWeb ? 0 : 24,
            borderWidth: isWeb ? 0 : StyleSheet.hairlineWidth,
            shadowColor: '#000',
            shadowOpacity: isWeb ? 0 : isDark ? 0.35 : 0.12,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: isWeb ? 0 : 8,
            paddingBottom: isWeb ? 0 : 0,
            ...(isWeb ? { height: 84 } : { height: 64 }),
          },
        ],
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? 'dark' : 'light'}
              style={[StyleSheet.absoluteFill, { borderRadius: 24, overflow: 'hidden' }]}
            />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.card, borderRadius: 24, overflow: 'hidden' },
              ]}
            />
          ),
        tabBarItemStyle: styles.tabItem,
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: '600',
          fontFamily: 'Inter_500Medium',
          marginTop: 2,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon focused={focused} color={color} activeColor={colors.primary}>
                {Platform.OS === 'ios' ? (
                  <SymbolView name={tab.sf as never} tintColor={color} size={22} />
                ) : (
                  <Feather name={tab.feather} size={20} color={color} />
                )}
              </TabIcon>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
  },
  tabItem: {
    paddingTop: 8,
  },
  iconStack: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    position: 'absolute',
    width: 40,
    height: 32,
    borderRadius: 16,
  },
});