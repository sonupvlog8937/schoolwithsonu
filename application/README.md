# Admin Mobile App - React Native TypeScript

Complete admin panel mobile application built with React Native, Expo, and TypeScript. Feature parity with the web admin panel.

## ✅ Fixed Issues

### TypeScript Configuration
- ✅ Fixed all JSX compilation errors
- ✅ Added proper compiler options (`jsx: "react-native"`, `esModuleInterop`, etc.)
- ✅ All TypeScript errors resolved
- ✅ Full type safety across the application

### Package.json Reorganization
- ✅ Moved production dependencies from devDependencies to dependencies
- ✅ Added proper scripts (start, android, ios, web, lint)
- ✅ Updated version to 1.0.0
- ✅ Organized dependencies logically

### API Utilities Enhanced
- ✅ Added `uploadImage` - Single image upload
- ✅ Added `uploadImages` - Multiple images upload  
- ✅ Added `deleteImages` - Delete images
- ✅ Added `deleteMultipleData` - Bulk delete
- ✅ Exported `getBaseUrl` for external use

## 🆕 New Components Created

### Form Components
- **OtpBox** - 6-digit OTP input with auto-focus and navigation
- **ImageUploadBox** - Image picker with preview, delete, and upload
- **ProductOptionsEditor** - Dynamic product options (Size, Color, RAM, etc.)
- **ProductSpecsEditor** - Product specifications (key-value pairs)

### Existing Components
- AdminFeatureScreen - Generic feature screen template
- EmptyView - Empty state component
- ErrorBoundary - Error boundary wrapper
- ErrorFallback - Error fallback UI
- KeyboardAwareScrollViewCompat - Keyboard-aware scroll
- LoadingView - Loading state
- SearchInput - Search input with debounce
- StatCard - Dashboard stat cards
- StatusBadge - Status badges

## 📱 New Screens Created

### Authentication
- ✅ verify-account.tsx - OTP verification with resend

### Product Management
- ✅ products/add.tsx - Complete product creation form with:
  - Basic info (name, description, brand)
  - Pricing (price, old price, discount, stock)
  - Categories (category, subcategory, weight)
  - Multiple image uploads
  - Product options editor
  - Product specifications editor
  - Featured/Published toggles

- ✅ products/[id]/index.tsx - Full product details view with:
  - Image gallery with thumbnails
  - Price, discount, rating display
  - Stock and category information
  - Specifications list
  - Product options display
  - Edit and delete actions
  - Publish/Unpublish toggle

### Existing Screens (Already Implemented)
- Login, SignUp, ForgotPassword, ChangePassword
- Dashboard with stats and quick actions
- Orders listing with filters
- Products listing with search
- Categories, Subcategories
- Users management
- Wallet transactions
- Store Profile
- Coupons
- Banners (multiple types)
- Blog
- Riders
- Reviews
- Commerce Settings
- Go Market (shop, restaurant, operations)
- Manage Logo
- Product RAMS, Weight, Size management
- More (settings menu)

## 🔧 Installation & Setup

```bash
# Install dependencies
cd admin-mobile
npm install

# Start development server
npm start

# Run on specific platform
npm run android  # Android
npm run ios      # iOS
npm run web      # Web

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 🌐 Environment Configuration

Create/update `.env` file:

```env
EXPO_PUBLIC_API_URL="https://your-api-url.com"
```

## 📁 Project Structure

```
admin-mobile/
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Tab navigation screens
│   │   ├── index.tsx        # Dashboard
│   │   ├── orders.tsx       # Orders listing
│   │   ├── products.tsx     # Products listing
│   │   └── more.tsx         # More menu
│   ├── products/            # Product management
│   │   ├── add.tsx          # Add product
│   │   └── [id]/            # Product details/edit
│   │       └── index.tsx    # Product details
│   ├── orders/              # Order management
│   │   └── [id].tsx         # Order details
│   └── ...                  # Other screens
├── components/              # Reusable components
│   ├── OtpBox.tsx
│   ├── ImageUploadBox.tsx
│   ├── ProductOptionsEditor.tsx
│   ├── ProductSpecsEditor.tsx
│   └── ...
├── context/                 # React Context
│   └── AuthContext.tsx      # Authentication context
├── hooks/                   # Custom hooks
│   └── useColors.ts         # Theme colors hook
├── utils/                   # Utility functions
│   └── api.ts              # API functions
├── constants/               # App constants
│   ├── colors.ts           # Color definitions
│   └── adminFeatures.ts    # Feature configurations
└── ...
```

## 🎨 Theme & Styling

The app uses a custom theming system via `useColors` hook:

```tsx
import { useColors } from '@/hooks/useColors';

const MyComponent = () => {
  const colors = useColors();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello</Text>
    </View>
  );
};
```

### Available Colors
- `primary` - Primary brand color
- `background` - Main background
- `card` - Card background
- `text` - Primary text
- `textSecondary` - Secondary text
- `textTertiary` - Tertiary text
- `border` - Border color
- `danger` - Error/delete color
- `success` - Success color
- `warning` - Warning color
- And many more...

## 🔐 Authentication

Authentication is handled through `AuthContext`:

```tsx
import { useAuth } from '@/context/AuthContext';

const MyComponent = () => {
  const { isLogin, userData, login, logout } = useAuth();
  
  // Use auth state and functions
};
```

### User Roles
- ADMIN - Full access
- SELLER - Seller access
- GROCERY_SELLER - Grocery specific
- RESTAURANT_SELLER - Restaurant specific
- FASHION_SELLER, ELECTRONICS_SELLER, etc.
- DELIVERY_RIDER - Delivery rider access

## 🌐 API Integration

All API calls use the utilities in `utils/api.ts`:

```tsx
import { fetchDataFromApi, postData, editData, deleteData } from '@/utils/api';

// GET request
const data = await fetchDataFromApi('/api/products');

// POST request
const result = await postData('/api/products', { name: 'Product' });

// PUT request
const updated = await editData('/api/products/123', { name: 'Updated' });

// DELETE request
await deleteData('/api/products/123');

// Upload images
const formData = new FormData();
formData.append('image', imageFile);
const uploaded = await uploadFormData('/api/upload', formData);
```

## 📦 Key Dependencies

- **expo** - React Native framework
- **expo-router** - File-based routing
- **@tanstack/react-query** - Data fetching and caching
- **lucide-react-native** - Icon library
- **expo-image-picker** - Image picker
- **@react-native-async-storage/async-storage** - Local storage
- **axios** - HTTP client
- **react-native-gesture-handler** - Gesture handling
- **react-native-reanimated** - Animations

## 🚀 Features Implemented

### Product Management
- ✅ Product listing with search and filters
- ✅ Add new products with full form
- ✅ View product details
- ✅ Multiple image uploads
- ✅ Product options (Size, Color, etc.)
- ✅ Product specifications
- ✅ Publish/Unpublish products
- ⏳ Edit existing products (structure ready)
- ⏳ Delete products

### Order Management
- ✅ Order listing with filters
- ✅ Order details view
- ✅ Order status management
- ⏳ Advanced order actions

### User Management
- ✅ User listing
- ✅ View user details
- ⏳ Edit user roles
- ⏳ User activation/deactivation

### Category Management
- ✅ Category listing
- ✅ Subcategory listing
- ⏳ Add/Edit categories
- ⏳ Add/Edit subcategories

### Content Management
- ✅ Blog listing
- ✅ Banner management
- ✅ Home slider management
- ⏳ Add/Edit blog posts
- ⏳ Add/Edit banners

### Go Market (Quick Commerce)
- ✅ Shop profile management
- ✅ Restaurant profile management
- ✅ Store operations control
- ✅ Commerce settings
- ⏳ Grocery shops list
- ⏳ Restaurants list
- ⏳ Menu management

### Other Features
- ✅ Dashboard with stats
- ✅ Wallet transactions
- ✅ Reviews management
- ✅ Riders management
- ✅ Coupons management
- ✅ Logo management
- ✅ Product variants (RAMS, Weight, Size)
- ✅ Profile management
- ✅ Change password
- ✅ Account verification (OTP)

## 🐛 Known Issues & Limitations

### Minor Issues
- Some screens still need edit functionality
- Bulk upload not implemented
- Rich text editor not implemented
- Map view for riders not implemented
- Push notifications not implemented

### Platform Limitations
- Web platform has limited image picker support
- Some native features may not work on web

## 📝 Development Guidelines

### Adding New Screens
1. Create file in `app/` directory
2. Follow existing screen patterns
3. Use `useColors` for theming
4. Add proper TypeScript types
5. Handle loading and error states
6. Add navigation in appropriate places

### Creating Components
1. Create in `components/` directory
2. Export as named export
3. Add proper TypeScript interfaces
4. Use `useColors` for styling
5. Make components reusable

### API Integration
1. Use functions from `utils/api.ts`
2. Handle errors gracefully
3. Show loading indicators
4. Invalidate React Query cache when needed

## 🔄 Next Steps

### High Priority
1. ✅ TypeScript errors (DONE)
2. ✅ Product add screen (DONE)
3. ✅ Product details screen (DONE)
4. ⏳ Product edit screen
5. ⏳ Category add/edit screens
6. ⏳ Blog add/edit screens

### Medium Priority
7. ⏳ Banner add/edit screens
8. ⏳ Coupon add/edit screens
9. ⏳ User role management
10. ⏳ Advanced order actions
11. ⏳ Go Market missing features

### Low Priority
12. ⏳ Bulk product upload
13. ⏳ Rich text editor
14. ⏳ Map view for riders
15. ⏳ Push notifications
16. ⏳ Offline mode
17. ⏳ Analytics charts

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Documentation](https://expo.github.io/router/docs/)
- [React Query Documentation](https://tanstack.com/query/latest)

## 🤝 Contributing

1. Follow existing code patterns
2. Add proper TypeScript types
3. Test on both iOS and Android
4. Update documentation
5. Handle errors gracefully

## 📄 License

Private - All rights reserved

---

**Status**: 🟢 Ready for Development  
**TypeScript**: ✅ All Errors Fixed  
**Feature Parity**: ~50% Complete  
**Last Updated**: August 6, 2026
