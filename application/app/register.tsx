import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { getBaseUrl } from '@/utils/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    school_name: '',
    email: '',
    owner_name: '',
    address: '',
    password: '',
    confirm_password: '',
  });

  const [errors, setErrors] = useState({
    school_name: '',
    email: '',
    owner_name: '',
    address: '',
    password: '',
    confirm_password: '',
    image: '',
  });

  const perks = [
    { icon: 'check-circle', text: 'Verified & secure onboarding', color: '#4ade80' },
    { icon: 'users', text: 'Manage students, staff & parents', color: '#60a5fa' },
    { icon: 'credit-card', text: 'Fee collection ready on day one', color: '#fbbf24' },
  ];

  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (!pwd) return { label: '', value: 0, color: '#94a3b8' };
    if (score <= 2) return { label: 'Weak', value: 33, color: '#ef4444' };
    if (score <= 3) return { label: 'Medium', value: 66, color: '#f59e0b' };
    return { label: 'Strong', value: 100, color: '#10b981' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setErrors({ ...errors, image: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {
      school_name: '',
      email: '',
      owner_name: '',
      address: '',
      password: '',
      confirm_password: '',
      image: '',
    };
    let isValid = true;

    if (!imageUri) {
      newErrors.image = 'Please select a school image';
      isValid = false;
    }

    if (!formData.school_name.trim()) {
      newErrors.school_name = 'School name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    if (!formData.owner_name.trim()) {
      newErrors.owner_name = 'Your name is required';
      isValid = false;
    }

    if (!formData.address.trim()) {
      newErrors.address = 'School address is required';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      if (errors.image) {
        Alert.alert('Error', errors.image);
      }
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      
      // Add image
      if (imageUri) {
        const filename = imageUri.split('/').pop() || 'school-image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        fd.append('image', {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }

      // Add other fields
      fd.append('school_name', formData.school_name);
      fd.append('email', formData.email);
      fd.append('owner_name', formData.owner_name);
      fd.append('address', formData.address);
      fd.append('password', formData.password);

      const response = await axios.post(`${getBaseUrl()}/school/register`, fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert(
        'Success',
        response.data?.message || 'Registration successful! Please login to continue.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login'),
          },
        ]
      );

      // Reset form
      setFormData({
        school_name: '',
        email: '',
        owner_name: '',
        address: '',
        password: '',
        confirm_password: '',
      });
      setImageUri(null);
      setErrors({
        school_name: '',
        email: '',
        owner_name: '',
        address: '',
        password: '',
        confirm_password: '',
        image: '',
      });
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <LinearGradient
            colors={['#6366f1', '#8b5cf6', '#ec4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            {/* Decorative blobs */}
            <View style={[styles.blob, { top: -60, right: -60, width: 220, height: 220, backgroundColor: 'rgba(255,255,255,0.1)' }]} />
            <View style={[styles.blob, { bottom: -80, left: -40, width: 260, height: 260, backgroundColor: 'rgba(255,255,255,0.08)' }]} />

            <View style={styles.heroContent}>
              <View style={styles.logoRow}>
                <Feather name="award" size={28} color="#fff" />
                <Text style={styles.heroTitle}>School Registration</Text>
              </View>
              <Text style={styles.heroSubtitle}>
                Bring your school online in minutes. Set up attendance, fees, notifications and a parent portal — all
                from one free registration.
              </Text>

              <View style={styles.perksContainer}>
                {perks.map((perk, index) => (
                  <View key={index} style={styles.perkRow}>
                    <View style={[styles.perkIcon, { backgroundColor: `${perk.color}40` }]}>
                      <Feather name={perk.icon as any} size={16} color={perk.color} />
                    </View>
                    <Text style={styles.perkText}>{perk.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          </LinearGradient>

          {/* Form Section */}
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Register your school</Text>
            <Text style={styles.formSubtitle}>Fill in the details below to create your school's account.</Text>

            <View style={styles.formCard}>
              {/* Image Upload */}
              <Text style={styles.fieldLabel}>School Picture</Text>
              <Pressable style={styles.imageUploadBox} onPress={pickImage}>
                {imageUri ? (
                  <View style={styles.imagePreview}>
                    <Image source={{ uri: imageUri }} style={styles.previewImage} />
                    <View style={styles.imageOverlay}>
                      <Feather name="camera" size={24} color="#fff" />
                      <Text style={styles.imageOverlayText}>Change Photo</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Feather name="upload-cloud" size={32} color="#8b5cf6" />
                    <Text style={styles.uploadText}>Click to upload school image</Text>
                    <Text style={styles.uploadHint}>PNG or JPG, up to 5MB</Text>
                  </View>
                )}
              </Pressable>
              {errors.image ? <Text style={styles.errorText}>{errors.image}</Text> : null}

              {/* School Name */}
              <View style={styles.inputGroup}>
                <View style={styles.inputIcon}>
                  <Feather name="home" size={18} color="#94a3b8" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="School Name"
                  placeholderTextColor="#94a3b8"
                  value={formData.school_name}
                  onChangeText={(text) => setFormData({ ...formData, school_name: text })}
                />
              </View>
              {errors.school_name ? <Text style={styles.errorText}>{errors.school_name}</Text> : null}

              {/* Email */}
              <View style={styles.inputGroup}>
                <View style={styles.inputIcon}>
                  <Feather name="mail" size={18} color="#94a3b8" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#94a3b8"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

              {/* Owner Name */}
              <View style={styles.inputGroup}>
                <View style={styles.inputIcon}>
                  <Feather name="user" size={18} color="#94a3b8" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Your Name"
                  placeholderTextColor="#94a3b8"
                  value={formData.owner_name}
                  onChangeText={(text) => setFormData({ ...formData, owner_name: text })}
                />
              </View>
              {errors.owner_name ? <Text style={styles.errorText}>{errors.owner_name}</Text> : null}

              {/* Address */}
              <View style={[styles.inputGroup, styles.textareaGroup]}>
                <View style={[styles.inputIcon, { alignSelf: 'flex-start', marginTop: 4 }]}>
                  <Feather name="map-pin" size={18} color="#94a3b8" />
                </View>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="School Address"
                  placeholderTextColor="#94a3b8"
                  value={formData.address}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
              {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}

              {/* Password */}
              <View style={styles.inputGroup}>
                <View style={styles.inputIcon}>
                  <Feather name="lock" size={18} color="#94a3b8" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#94a3b8"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color="#94a3b8" />
                </Pressable>
              </View>
              {passwordStrength.label ? (
                <View style={styles.strengthRow}>
                  <View style={styles.strengthBar}>
                    <View
                      style={[
                        styles.strengthFill,
                        { width: `${passwordStrength.value}%`, backgroundColor: passwordStrength.color },
                      ]}
                    />
                  </View>
                  <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                    {passwordStrength.label}
                  </Text>
                </View>
              ) : null}
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <View style={styles.inputIcon}>
                  <Feather name="lock" size={18} color="#94a3b8" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#94a3b8"
                  value={formData.confirm_password}
                  onChangeText={(text) => setFormData({ ...formData, confirm_password: text })}
                  secureTextEntry={!showConfirmPassword}
                />
                <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Feather name={showConfirmPassword ? 'eye-off' : 'eye'} size={18} color="#94a3b8" />
                </Pressable>
              </View>
              {errors.confirm_password ? <Text style={styles.errorText}>{errors.confirm_password}</Text> : null}

              {/* Submit Button */}
              <Pressable
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                <LinearGradient
                  colors={['#6366f1', '#8b5cf6', '#ec4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGradient}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Register School</Text>
                  )}
                </LinearGradient>
              </Pressable>

              {/* Login Link */}
              <View style={styles.loginLinkContainer}>
                <Text style={styles.loginLinkText}>Already registered? </Text>
                <Pressable onPress={() => router.push('/login')}>
                  <Text style={styles.loginLink}>Sign in instead</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Footer */}
          <Footer />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollView: { flex: 1 },

  // Hero Section
  hero: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  heroContent: {
    zIndex: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 340,
  },
  perksContainer: {
    gap: 14,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  perkIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.95)',
  },

  // Form Section
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#5b6472',
    marginBottom: 24,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e6e9f0',
  },

  // Image Upload
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  imageUploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e6e9f0',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
    minHeight: 140,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 12,
  },
  uploadHint: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  imagePreview: {
    position: 'relative',
    width: '100%',
    height: 180,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imageOverlayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },

  // Input Group
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  textareaGroup: {
    alignItems: 'flex-start',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
    padding: 0,
  },
  textarea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginBottom: 12,
    marginLeft: 4,
  },

  // Password Strength
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  strengthBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: '700',
    minWidth: 60,
    textAlign: 'right',
  },

  // Submit Button
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  // Login Link
  loginLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginLinkText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  loginLink: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '700',
  },
});
