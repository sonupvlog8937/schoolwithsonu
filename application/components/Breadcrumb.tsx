import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter, useSegments, usePathname } from 'expo-router';

// Route labels mapping for better readability
const routeLabels: Record<string, string> = {
  // Main routes
  index: 'Home',
  home: 'Home',
  login: 'Login',
  register: 'Register',
  'forgot-password': 'Forgot Password',
  contact: 'Contact',
  about: 'About',
  privacy: 'Privacy Policy',

  // Dashboard and Profile
  dashboard: 'Dashboard',
  profile: 'Profile',
  'change-password': 'Change Password',
  settings: 'Settings',

  // School Features
  schools: 'Schools',
  notices: 'Notices',
  timetable: 'Timetable',
  homework: 'Homework',
  exams: 'Exams',
  library: 'Library',
  students: 'Students',
  teachers: 'Teachers',

  // Tab routes
  '(tabs)': 'Home',
  more: 'More',
  explore: 'Explore',

  // Other
  wallet: 'Wallet',
  categories: 'Categories',
  users: 'Users',
  'store-profile': 'Store Profile',
  coupons: 'Coupons',
  banners: 'Banners',
  blog: 'Blog',
  orders: 'Orders',
  subcategories: 'Subcategories',
  'home-slider': 'Home Slider',
  'banner-v1': 'Banner V1',
  'banner-list2': 'Banner List',
  'banners-management': 'Banners Management',
  riders: 'Riders',
  reviews: 'Reviews',
  'commerce-settings': 'Commerce Settings',
  'go-market': 'Go Market',
  'go-market-shop': 'Market Shop',
  'go-market-restaurant': 'Market Restaurant',
  'store-operations': 'Store Operations',
  'manage-logo': 'Manage Logo',
  'product-rams': 'Product Rams',
  'product-weight': 'Product Weight',
  'product-size': 'Product Size',
};

// Get label for a route segment
const getLabel = (segment: string): string => {
  return routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
};

// Check if segment is an ID (MongoDB ObjectId, UUID, or numeric)
const isId = (segment: string): boolean => {
  // MongoDB ObjectId pattern (24 hex characters)
  const objectIdPattern = /^[a-f\d]{24}$/i;
  // UUID pattern
  const uuidPattern = /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i;
  // Numeric ID
  const numericPattern = /^\d+$/;

  return objectIdPattern.test(segment) || uuidPattern.test(segment) || numericPattern.test(segment);
};

export default function Breadcrumb() {
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();

  // Filter out empty strings and special route groups
  const filteredSegments = segments.filter(
    (seg) => seg && !seg.startsWith('(') && !seg.endsWith(')')
  );

  // Don't show breadcrumb on home page, login, or register
  if (
    filteredSegments.length === 0 ||
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password'
  ) {
    return null;
  }

  // Build breadcrumb items
  const breadcrumbItems: { path: string; label: string; isLast: boolean }[] = [];
  let currentPath = '';

  filteredSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Skip IDs in breadcrumb display but keep them in path
    if (isId(segment)) {
      return;
    }

    const isLast = index === filteredSegments.length - 1;
    const label = getLabel(segment);

    breadcrumbItems.push({
      path: currentPath,
      label: label,
      isLast: isLast,
    });
  });

  // If no valid breadcrumb items (all were IDs), don't show breadcrumb
  if (breadcrumbItems.length === 0) {
    return null;
  }

  const handleNavigate = (path: string) => {
    try {
      router.push(path as any);
    } catch (error) {
      console.error('Breadcrumb navigation error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Home as plain text, matching screenshot style */}
        <Pressable onPress={() => router.push('/')}>
          <Text style={styles.linkText}>Home</Text>
        </Pressable>

        {/* Breadcrumb items */}
        {breadcrumbItems.map((item) => (
          <View key={item.path} style={styles.breadcrumbItem}>
            {/* Separator */}
            <Text style={styles.separator}>/</Text>

            {/* Breadcrumb link or text */}
            {item.isLast ? (
              <Text style={styles.currentText} numberOfLines={1}>
                {item.label}
              </Text>
            ) : (
              <Pressable onPress={() => handleNavigate(item.path)}>
                <Text style={styles.linkText} numberOfLines={1}>
                  {item.label}
                </Text>
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    marginHorizontal: 6,
    fontSize: 12,
    color: '#9ca3af',
  },
  linkText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4b5563',
    maxWidth: 120,
  },
  currentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    maxWidth: 120,
  },
});