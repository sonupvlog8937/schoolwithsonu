import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  Keyboard,
  useWindowDimensions,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import Constants from 'expo-constants';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  School,
  User,
  Users,
  Shield,
  DollarSign,
  BookOpen,
  UserCheck,
  Crown,
  UserCog,
  AlertCircle,
  Check,
  Info,
  Fingerprint,
  WifiOff,
  Sparkles,
  ChevronRight,
} from 'lucide-react-native';
import { APP_NAME, APP_TAGLINE, SCHOOL_ROLES, type SchoolRole } from '@/constants/branding';

const REMEMBER_ME_KEY = '@edusmart:rememberedCredentials';
const BIOMETRIC_PREF_KEY = '@edusmart:biometricEnabled';

// ---------------------------------------------------------------------------
// Theme — White & Yellow, production palette
// ---------------------------------------------------------------------------
const THEME = {
  bg: '#FFFDF7',
  surface: '#FFFFFF',
  surfaceAlt: '#FFFBEB',
  border: '#F3E8C7',
  borderStrong: '#FDE68A',
  ink: '#1F2937',
  inkMuted: '#6B7280',
  inkFaint: '#9CA3AF',
  primary: '#F5B301', // core yellow
  primaryDeep: '#D89400',
  primarySoft: '#FFE9A8',
  accent: '#FFC93C',
  success: '#16A34A',
  successBg: '#F0FDF4',
  successBorder: '#BBF7D0',
  danger: '#DC2626',
  dangerBg: '#FEF2F2',
  dangerBorder: '#FECACA',
  gradientPrimary: ['#FFD65A', '#F5B301', '#E08E00'] as const,
  gradientMuted: ['#E5E7EB', '#D1D5DB'] as const,
  shadowColor: '#F5B301',
};

const ROLE_OPTIONS = [
  { value: SCHOOL_ROLES.STUDENT, label: 'Student', icon: User, color: '#2563EB', gradient: ['#60A5FA', '#2563EB'] as const },
  { value: SCHOOL_ROLES.TEACHER, label: 'Teacher', icon: UserCheck, color: '#059669', gradient: ['#34D399', '#059669'] as const },
  { value: SCHOOL_ROLES.PARENT, label: 'Parent', icon: Users, color: '#7C3AED', gradient: ['#A78BFA', '#7C3AED'] as const },
  { value: SCHOOL_ROLES.SCHOOL, label: 'School Admin', icon: School, color: '#D89400', gradient: ['#FFD65A', '#D89400'] as const },
  { value: SCHOOL_ROLES.ACCOUNTANT, label: 'Accountant', icon: DollarSign, color: '#0891B2', gradient: ['#22D3EE', '#0891B2'] as const },
  { value: SCHOOL_ROLES.LIBRARIAN, label: 'Librarian', icon: BookOpen, color: '#DB2777', gradient: ['#F472B6', '#DB2777'] as const },
  { value: SCHOOL_ROLES.RECEPTIONIST, label: 'Receptionist', icon: UserCog, color: '#0D9488', gradient: ['#2DD4BF', '#0D9488'] as const },
  { value: SCHOOL_ROLES.SUPERADMIN, label: 'Super Admin', icon: Crown, color: '#DC2626', gradient: ['#F87171', '#DC2626'] as const },
  { value: SCHOOL_ROLES.VICEADMIN, label: 'Vice Admin', icon: Shield, color: '#4F46E5', gradient: ['#818CF8', '#4F46E5'] as const },
];

// Demo quick-fill accounts (dev/staging convenience — stripped from production builds)
const DEMO_ACCOUNTS: Array<{ label: string; email: string; role: SchoolRole }> = __DEV__
  ? [
      { label: 'Student Demo', email: 'student@demo.com', role: SCHOOL_ROLES.STUDENT },
      { label: 'Teacher Demo', email: 'teacher@demo.com', role: SCHOOL_ROLES.TEACHER },
      { label: 'Admin Demo', email: 'admin@demo.com', role: SCHOOL_ROLES.SCHOOL },
    ]
  : [];

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

interface FieldErrors {
  email?: string;
  password?: string;
  general?: string;
}

type PasswordStrength = 'weak' | 'fair' | 'strong';

function getPasswordStrength(value: string): PasswordStrength | null {
  if (!value) return null;
  let score = 0;
  if (value.length >= 6) score++;
  if (value.length >= 10) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  if (score <= 1) return 'weak';
  if (score <= 3) return 'fair';
  return 'strong';
}

const STRENGTH_META: Record<PasswordStrength, { label: string; color: string; width: `${number}%` }> = {
  weak: { label: 'Weak', color: THEME.danger, width: '33%' },
  fair: { label: 'Fair', color: THEME.primary, width: '66%' },
  strong: { label: 'Strong', color: THEME.success, width: '100%' },
};

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { width } = useWindowDimensions();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<SchoolRole>(SCHOOL_ROLES.STUDENT);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [isOffline, setIsOffline] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  const passwordInputRef = useRef<TextInput>(null);

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const toastAnim = useRef(new Animated.Value(0)).current;
  const logoSpin = useRef(new Animated.Value(0)).current;

  const isCompact = width < 380;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
    loadRememberedCredentials();
    checkBiometricPreference();

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(state.isConnected === false);
    });
    return () => unsubscribe();
  }, []);

  const loadRememberedCredentials = async () => {
    try {
      const saved = await AsyncStorage.getItem(REMEMBER_ME_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setEmail(parsed.email ?? '');
        setSelectedRole(parsed.role ?? SCHOOL_ROLES.STUDENT);
        setRememberMe(true);
      }
    } catch (e) {
      console.warn('Failed to load remembered credentials:', e);
    }
  };

  const checkBiometricPreference = async () => {
    try {
      const enabled = await AsyncStorage.getItem(BIOMETRIC_PREF_KEY);
      setBiometricAvailable(enabled === 'true');
    } catch {
      setBiometricAvailable(false);
    }
  };

  const triggerToast = (message: string) => {
    setShowToast(message);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(toastAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => setShowToast(null));
  };

  const validateEmail = (value: string): string | undefined => {
    const v = value.trim();
    if (!v) return 'Email ya username required hai';
    if (v.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      return 'Please enter a valid email address';
    }
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) return 'Password required hai';
    if (value.length < 4) return 'Password kam se kam 4 characters ka ho';
    return undefined;
  };

  const runShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const handleRoleSelect = (role: SchoolRole) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRole(role);
  };

  const handleLogin = async () => {
    Keyboard.dismiss();

    if (isOffline) {
      setErrors({ general: 'You appear to be offline. Please check your connection.' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      runShake();
      return;
    }

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setTouched({ email: true, password: true });
    setErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      runShake();
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const result = await login(email.trim().toLowerCase(), password, selectedRole);

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (rememberMe) {
          await AsyncStorage.setItem(
            REMEMBER_ME_KEY,
            JSON.stringify({ email: email.trim().toLowerCase(), role: selectedRole })
          );
          await AsyncStorage.setItem(BIOMETRIC_PREF_KEY, 'true');
        } else {
          await AsyncStorage.removeItem(REMEMBER_ME_KEY);
          await AsyncStorage.removeItem(BIOMETRIC_PREF_KEY);
        }
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        runShake();
        setErrors({ general: result.message || 'Invalid credentials. Please try again.' });
      }
    } catch (error) {
      console.error('Login error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      runShake();
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const saved = await AsyncStorage.getItem(REMEMBER_ME_KEY);
      if (!saved) {
        triggerToast('No saved account found. Please sign in first.');
        return;
      }
      triggerToast('Biometric authentication would run here.');
    } catch {
      triggerToast('Biometric login unavailable right now.');
    }
  };

  const fillDemoAccount = (demo: (typeof DEMO_ACCOUNTS)[number]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEmail(demo.email);
    setPassword('demo123');
    setSelectedRole(demo.role);
    setErrors({});
    setTouched({});
  };

  const contactSupport = () => {
    router.push('/contact');
  };

  const selectedRoleData = ROLE_OPTIONS.find((r) => r.value === selectedRole)!;
  const isFormValid = !validateEmail(email) && !validatePassword(password);
  const showEmailError = touched.email && !!errors.email;
  const showPasswordError = touched.password && !!errors.password;
  const strength = getPasswordStrength(password);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" backgroundColor={THEME.bg} />
      <Stack.Screen options={{ headerShown: false }} />

      {isOffline && (
        <View style={styles.offlineBanner}>
          <WifiOff color="#fff" size={14} />
          <Text style={styles.offlineBannerText}>No internet connection</Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Header */}
            <View style={styles.header}>
              <LinearGradient
                colors={THEME.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGradient}
              >
                <School color="#fff" size={38} strokeWidth={2.2} />
                <View style={styles.logoSparkle}>
                  <Sparkles color="#fff" size={16} />
                </View>
              </LinearGradient>
              <Text style={styles.appName}>{APP_NAME}</Text>
              <Text style={styles.tagline}>{APP_TAGLINE}</Text>
            </View>

            {/* Role Selection */}
            <View style={styles.roleSection}>
              <View style={styles.roleSectionHeader}>
                <Text style={styles.roleSectionTitle}>Select Your Role</Text>
                <View style={styles.roleCountPill}>
                  <Text style={styles.roleCountText}>{ROLE_OPTIONS.length}</Text>
                </View>
              </View>
              <View style={styles.roleGrid}>
                {ROLE_OPTIONS.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.value;

                  return (
                    <TouchableOpacity
                      key={role.value}
                      onPress={() => handleRoleSelect(role.value)}
                      activeOpacity={0.7}
                      style={[styles.roleButton, isCompact && styles.roleButtonCompact]}
                      accessibilityLabel={`Login as ${role.label}`}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <LinearGradient
                        colors={isSelected ? role.gradient : ['#FFFFFF', '#FFFBEB']}
                        style={[styles.roleButtonGradient, isSelected && styles.roleButtonSelected]}
                      >
                        <Icon color={isSelected ? '#fff' : role.color} size={22} />
                        <Text
                          numberOfLines={1}
                          style={[styles.roleButtonText, { color: isSelected ? '#fff' : THEME.inkMuted }]}
                        >
                          {role.label}
                        </Text>
                        {isSelected && (
                          <View style={styles.roleCheckBadge}>
                            <Check color="#fff" size={11} strokeWidth={3.5} />
                          </View>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Login Form */}
            <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
              <View style={styles.formContainer}>
                <View style={styles.formTitleRow}>
                  <View>
                    <Text style={styles.formTitle}>Welcome Back</Text>
                    <Text style={styles.formSubtitle}>
                      Sign in as{' '}
                      <Text style={{ color: selectedRoleData.color, fontWeight: '700' }}>
                        {selectedRoleData.label}
                      </Text>
                    </Text>
                  </View>
                  {biometricAvailable && (
                    <TouchableOpacity
                      onPress={handleBiometricLogin}
                      style={styles.biometricButton}
                      accessibilityLabel="Sign in with biometrics"
                    >
                      <Fingerprint color={THEME.primaryDeep} size={22} />
                    </TouchableOpacity>
                  )}
                </View>

                {errors.general ? (
                  <View style={styles.errorBanner}>
                    <AlertCircle color={THEME.danger} size={18} />
                    <Text style={styles.errorBannerText}>{errors.general}</Text>
                  </View>
                ) : null}

                {/* Email Input */}
                <View style={styles.fieldGroup}>
                  <View
                    style={[
                      styles.inputContainer,
                      showEmailError && styles.inputContainerError,
                      touched.email && !errors.email && email.length > 0 && styles.inputContainerValid,
                    ]}
                  >
                    <Mail color={showEmailError ? THEME.danger : THEME.inkFaint} size={20} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Email or Username"
                      placeholderTextColor={THEME.inkFaint}
                      value={email}
                      onChangeText={(v) => {
                        setEmail(v);
                        if (touched.email) setErrors((e) => ({ ...e, email: validateEmail(v), general: undefined }));
                      }}
                      onBlur={() => {
                        setTouched((t) => ({ ...t, email: true }));
                        setErrors((e) => ({ ...e, email: validateEmail(email) }));
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      textContentType="username"
                      returnKeyType="next"
                      onSubmitEditing={() => passwordInputRef.current?.focus()}
                      editable={!loading}
                      accessibilityLabel="Email or username"
                    />
                    {touched.email && !errors.email && email.length > 0 && (
                      <Check color={THEME.success} size={18} />
                    )}
                  </View>
                  {showEmailError && <Text style={styles.fieldErrorText}>{errors.email}</Text>}
                </View>

                {/* Password Input */}
                <View style={styles.fieldGroup}>
                  <View style={[styles.inputContainer, showPasswordError && styles.inputContainerError]}>
                    <Lock color={showPasswordError ? THEME.danger : THEME.inkFaint} size={20} style={styles.inputIcon} />
                    <TextInput
                      ref={passwordInputRef}
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor={THEME.inkFaint}
                      value={password}
                      onChangeText={(v) => {
                        setPassword(v);
                        if (touched.password)
                          setErrors((e) => ({ ...e, password: validatePassword(v), general: undefined }));
                      }}
                      onBlur={() => {
                        setTouched((t) => ({ ...t, password: true }));
                        setErrors((e) => ({ ...e, password: validatePassword(password) }));
                      }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password"
                      textContentType="password"
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                      editable={!loading}
                      accessibilityLabel="Password"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff color={THEME.inkFaint} size={20} /> : <Eye color={THEME.inkFaint} size={20} />}
                    </TouchableOpacity>
                  </View>
                  {showPasswordError && <Text style={styles.fieldErrorText}>{errors.password}</Text>}

                  {!!password && strength && (
                    <View style={styles.strengthWrap}>
                      <View style={styles.strengthTrack}>
                        <View
                          style={[
                            styles.strengthFill,
                            { width: STRENGTH_META[strength].width, backgroundColor: STRENGTH_META[strength].color },
                          ]}
                        />
                      </View>
                      <Text style={[styles.strengthLabel, { color: STRENGTH_META[strength].color }]}>
                        {STRENGTH_META[strength].label}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Remember me + Forgot Password */}
                <View style={styles.formRow}>
                  <TouchableOpacity
                    style={styles.rememberMeRow}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setRememberMe(!rememberMe);
                    }}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: rememberMe }}
                    accessibilityLabel="Remember me"
                  >
                    <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                      {rememberMe && <Check color="#fff" size={12} strokeWidth={3.5} />}
                    </View>
                    <Text style={styles.rememberMeText}>Remember me</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => router.push('/forgot-password')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={loading || !isFormValid}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityState={{ busy: loading, disabled: !isFormValid }}
                >
                  <LinearGradient
                    colors={loading || !isFormValid ? THEME.gradientMuted : THEME.gradientPrimary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.loginButton}
                  >
                    {loading ? (
                      <View style={styles.loadingRow}>
                        <ActivityIndicator color="#fff" />
                        <Text style={styles.loginButtonText}>Signing in...</Text>
                      </View>
                    ) : (
                      <View style={styles.loadingRow}>
                        <Text style={styles.loginButtonText}>Sign In as {selectedRoleData.label}</Text>
                        <ChevronRight color="#fff" size={18} />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {!isFormValid && !loading && (
                  <View style={styles.hintRow}>
                    <Info color={THEME.inkFaint} size={14} />
                    <Text style={styles.hintText}>Fill in your email and password to continue</Text>
                  </View>
                )}

                {/* Divider */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social buttons (visual placeholders — wire up to real providers) */}
                <View style={styles.socialRow}>
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => triggerToast('Google sign-in coming soon')}
                    accessibilityLabel="Continue with Google"
                  >
                    <Text style={styles.socialButtonText}>G</Text>
                    <Text style={styles.socialButtonLabel}>Google</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => triggerToast('Apple sign-in coming soon')}
                    accessibilityLabel="Continue with Apple"
                  >
                    <Text style={styles.socialButtonText}></Text>
                    <Text style={styles.socialButtonLabel}>Apple</Text>
                  </TouchableOpacity>
                </View>

                {/* Security Info */}
                <View style={styles.securityInfo}>
                  <Shield color={THEME.success} size={16} />
                  <Text style={styles.securityText}>Secure 30-day encrypted session</Text>
                </View>
              </View>
            </Animated.View>

            {/* Demo accounts (dev builds only) */}
            {DEMO_ACCOUNTS.length > 0 && (
              <View style={styles.demoSection}>
                <Text style={styles.demoTitle}>Quick Demo Login</Text>
                <View style={styles.demoChips}>
                  {DEMO_ACCOUNTS.map((demo) => (
                    <TouchableOpacity key={demo.email} style={styles.demoChip} onPress={() => fillDemoAccount(demo)} activeOpacity={0.7}>
                      <Text style={styles.demoChipText}>{demo.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Help + Version */}
            <View style={styles.footerSection}>
              <View style={styles.footerLinks}>
                <TouchableOpacity onPress={() => router.push('/about')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.footerLinkText}>About</Text>
                </TouchableOpacity>
                <View style={styles.footerDot} />
                <TouchableOpacity onPress={() => router.push('/privacy')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.footerLinkText}>Privacy Policy</Text>
                </TouchableOpacity>
                <View style={styles.footerDot} />
                <TouchableOpacity onPress={() => router.push('/contact')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.footerLinkText}>Contact</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.helpText}>
                Need help?{' '}
                <Text style={styles.helpLink} onPress={contactSupport}>
                  Contact Support
                </Text>
              </Text>
              
              <View style={styles.footerDivider} />
              
              <Text style={styles.versionText}>
                {APP_NAME} v{APP_VERSION}
              </Text>
              
              <Text style={styles.copyrightText}>
                © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Toast */}
      {showToast && (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.toastText}>{showToast}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  keyboardView: {
    flex: 1,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.danger,
    paddingVertical: 8,
  },
  offlineBannerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 8,
  },
  logoGradient: {
    width: 84,
    height: 84,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: THEME.shadowColor,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
    position: 'relative',
  },
  logoSparkle: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: THEME.primaryDeep,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: THEME.bg,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: THEME.inkMuted,
    fontWeight: '500',
  },
  roleSection: {
    marginBottom: 24,
  },
  roleSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  roleSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.ink,
  },
  roleCountPill: {
    backgroundColor: THEME.primarySoft,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roleCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.primaryDeep,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  roleButton: {
    width: '48%',
  },
  roleButtonCompact: {
    width: '100%',
  },
  roleButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 13,
    paddingRight: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: THEME.border,
  },
  roleButtonSelected: {
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  roleButtonText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  roleCheckBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: THEME.surface,
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: '#00000010',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 20,
  },
  formTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.ink,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: THEME.inkMuted,
  },
  biometricButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: THEME.surfaceAlt,
    borderWidth: 1.5,
    borderColor: THEME.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: THEME.dangerBg,
    borderWidth: 1,
    borderColor: THEME.dangerBorder,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#B91C1C',
    fontWeight: '500',
    lineHeight: 18,
  },
  fieldGroup: {
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.surfaceAlt,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: THEME.border,
    paddingHorizontal: 16,
  },
  inputContainerError: {
    borderColor: THEME.danger,
    backgroundColor: THEME.dangerBg,
  },
  inputContainerValid: {
    borderColor: THEME.successBorder,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: THEME.ink,
  },
  fieldErrorText: {
    fontSize: 12,
    color: THEME.danger,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
  eyeButton: {
    padding: 4,
  },
  strengthWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginLeft: 4,
  },
  strengthTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: THEME.border,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: '700',
    width: 42,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 20,
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primaryDeep,
  },
  rememberMeText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.primaryDeep,
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  hintText: {
    fontSize: 12,
    color: THEME.inkFaint,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 22,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.border,
  },
  dividerText: {
    fontSize: 12,
    color: THEME.inkFaint,
    fontWeight: '500',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: THEME.border,
    backgroundColor: THEME.surfaceAlt,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.ink,
  },
  socialButtonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.inkMuted,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
  },
  securityText: {
    fontSize: 12,
    color: THEME.inkMuted,
  },
  demoSection: {
    marginBottom: 20,
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.inkFaint,
    textAlign: 'center',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  demoChips: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  demoChip: {
    backgroundColor: THEME.primarySoft,
    borderWidth: 1,
    borderColor: THEME.borderStrong,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  demoChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.primaryDeep,
  },
  footerSection: {
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  footerLinkText: {
    fontSize: 13,
    color: THEME.primaryDeep,
    fontWeight: '600',
  },
  footerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: THEME.inkFaint,
  },
  footerDivider: {
    width: 40,
    height: 1,
    backgroundColor: THEME.border,
    marginVertical: 4,
  },
  helpText: {
    fontSize: 13,
    color: THEME.inkMuted,
  },
  helpLink: {
    color: THEME.primaryDeep,
    fontWeight: '700',
  },
  versionText: {
    fontSize: 11,
    color: THEME.inkFaint,
    fontWeight: '500',
  },
  copyrightText: {
    fontSize: 10,
    color: THEME.inkFaint,
    fontWeight: '400',
    textAlign: 'center',
  },
  toast: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
    backgroundColor: THEME.ink,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  toastText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});