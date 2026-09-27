import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { ToastProvider } from '@/components/Toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AccountsDashboardProvider } from '@/context/AccountsDashboardContext';
import { StaffDashboardProvider } from '@/context/StaffDashboardContext';
import { InventoryDashboardProvider } from '@/context/InventoryDashboardContext';
import { PersistentTabBar } from '@/components/PersistentTabBar';
import { Provider } from 'react-redux';
import { store } from '@/state/store';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function RootLayoutNav() {
  const { isLogin, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments() as any; // Type workaround for expo-router

  // CRITICAL: React immediately to isLogin changes
  useEffect(() => {
    console.log('🔀🔀🔀 NAVIGATION EFFECT TRIGGERED 🔀🔀🔀');
    console.log('🔀 Current State:', { 
      isLoading, 
      isLogin, 
      segment0: segments[0],
      allSegments: segments 
    });
    
    if (isLoading) {
      console.log('🔄 Auth still loading, waiting...');
      return;
    }
    
    const inAuthRoute =
      segments[0] === 'login' ||
      segments[0] === 'signup' ||
      segments[0] === 'forgot-password' ||
      segments[0] === 'verify-account';

    const inPublicRoute = 
      segments[0] === 'index' ||
      !segments[0] ||
      segments[0] === 'about' ||
      segments[0] === 'contact' ||
      segments[0] === 'register' ||
      segments[0] === 'privacy' ||
      segments[0] === 'schools' ||
      (segments[0] === 'schools' && segments[1]); // Include schools/[id]

    console.log('🔀 Route Analysis:', { inAuthRoute, inPublicRoute, currentRoute: segments[0] });

    // PRIORITY 1: User logged out - allow public routes, otherwise redirect to index
    if (!isLogin) {
      if (inAuthRoute || inPublicRoute) {
        console.log('✅ Not logged in, in public/auth route');
      } else {
        console.log('🔀 ⚠️ NOT LOGGED IN - REDIRECTING TO HOME!');
        router.replace('/');
        console.log('🔀 ✅ Navigation to / (index) executed');
      }
      return;
    }

    // PRIORITY 2: User logged in but in auth/public route - go to tabs
    if (isLogin && (inAuthRoute || inPublicRoute)) {
      console.log('🔀 ⚠️ LOGGED IN BUT IN AUTH/PUBLIC ROUTE - REDIRECTING TO TABS!');
      router.replace('/(tabs)');
      console.log('🔀 ✅ Navigation to /(tabs) executed');
      return;
    }

    // Everything is fine
    console.log('🔀 ✅ User in correct route based on auth state');
  }, [isLogin, isLoading, segments, router]);

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="dashboard" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="login" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="register" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="contact" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="signup" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="profile" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="categories" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="users" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="wallet" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="store-profile" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="coupons" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="banners" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="change-password" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="settings" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="blog" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="orders/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="subcategories" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="home-slider" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="banner-v1" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="banner-list2" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="banners-management" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="riders" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="reviews" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="commerce-settings" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="go-market" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="go-market-shop" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="go-market-restaurant" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="store-operations" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="manage-logo" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="product-rams" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="product-weight" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="product-size" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="notices" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="timetable" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="homework" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="exams" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="library" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="content/[resource]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="study-material/upload" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="import/[resource]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="access/[resource]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="access/control" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="parent-accounts" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="website/[resource]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="website/gallery" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="website/bulletin-board" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="website/public-disclosure" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="students" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="teachers" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="schools/index" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="schools/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="dashboard/staff" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="dashboard/accounts" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="dashboard/fee-assignment" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="dashboard/inventory" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="dashboard/library" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="dashboard/follow-up" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="dashboard/complaint" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="dashboard/visitor" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="dashboard/chat" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="dashboard/user-activity" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="account/index" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="account/[resource]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="account/payment-requests" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="account/event-collections" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="account/income-category" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="account/expense-category" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="account/account-head" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="account/income" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="account/expenses" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="account/income-report" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="account/expense-report" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="account/daily-monthly-report" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="account/overall-summary" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="account/group-wise-overall" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="store/index" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="store/[resource]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="hr/index" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="hr/[resource]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="leave/index" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="leave/[resource]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="timetable/index" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="timetable/[resource]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="reports/index" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="reports/[resource]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="curriculum/index" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="curriculum/[resource]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="inventory/index" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="inventory/[resource]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="master/[module]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        {/* <Stack.Screen name="master/session" options={{ headerShown: false, animation: 'slide_from_right' }} /> */}
        <Stack.Screen name="master/school-info" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="master/session" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="academics/sections" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="academics/classes" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="academics/subject" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="academics/assign-class-teacher" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="academics/timing-configuration" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="academics/student-timetable" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="academics/teachers-timetable" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="academics/change-time-arrangement" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="academics/mark-absent-user-status" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="exam" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="exam/index" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="exam/[resource]" options={{ headerShown: false, animation: 'slide_from_right' }} />
      </Stack>
      <PersistentTabBar />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <Provider store={store}>
      <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AuthProvider>
                <StaffDashboardProvider>
                  <AccountsDashboardProvider>
                    <InventoryDashboardProvider>
                      <ToastProvider>
                        <RootLayoutNav />
                      </ToastProvider>
                    </InventoryDashboardProvider>
                  </AccountsDashboardProvider>
                </StaffDashboardProvider>
              </AuthProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
      </SafeAreaProvider>
    </Provider>
  );
}
