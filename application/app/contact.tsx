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
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { getBaseUrl } from '@/utils/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const DESCRIPTION_LIMIT = 500;

export default function ContactScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    description: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    subject: '',
    description: '',
  });

  const contactDetails = [
    { icon: 'mail', label: 'Email', value: 'sonupvlog8937@gmail.com', color: '#ec4899' },
    { icon: 'phone', label: 'Phone', value: '+91 89697 37537', color: '#3b82f6' },
    { icon: 'map-pin', label: 'Address', value: 'Patna, Bihar, India', color: '#14b8a6' },
    { icon: 'clock', label: 'Working Hours', value: 'Mon – Sat, 9 AM – 6 PM', color: '#f59e0b' },
  ];

  const socialLinks = [
    { icon: 'facebook', color: '#3b82f6', url: 'https://facebook.com' },
    { icon: 'twitter', color: '#14b8a6', url: 'https://twitter.com' },
    { icon: 'linkedin', color: '#8b5cf6', url: 'https://linkedin.com' },
  ];

  const validateForm = () => {
    const newErrors = { email: '', subject: '', description: '' };
    let isValid = true;

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const response = await axios.post(`${getBaseUrl()}/contact`, formData);
      Alert.alert('Success', response.data?.message || 'Message sent — we\'ll get back to you soon.');
      setFormData({ email: '', subject: '', description: '' });
      setErrors({ email: '', subject: '', description: '' });
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocialPress = (url: string) => {
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open link'));
  };

  return (
    <View style={styles.container}>
      <Header />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Hero Header */}
          <LinearGradient
            colors={['#1c1917', '#292524']}
            style={styles.heroHeader}
          >
            {/* Decorative blobs */}
            <View style={[styles.blob, { top: -70, right: -60, width: 240, height: 240, backgroundColor: 'rgba(236, 72, 153, 0.22)' }]} />
            <View style={[styles.blob, { bottom: -60, left: -50, width: 200, height: 200, backgroundColor: 'rgba(59, 130, 246, 0.2)' }]} />
            <View style={[styles.blob, { top: 30, left: '40%', width: 120, height: 120, backgroundColor: 'rgba(245, 158, 11, 0.15)' }]} />

            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Get in touch</Text>
              <Text style={styles.heroSubtitle}>
                Have a question or need help? Fill out the form below and our team will respond within 24 hours.
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.content}>
            {/* Contact Info Card */}
            <LinearGradient
              colors={['#8b5cf6', '#ec4899', '#f43f5e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.infoCard}
            >
              <Text style={styles.infoTitle}>Contact information</Text>
              <Text style={styles.infoSubtitle}>Reach out to us directly — we're happy to help.</Text>

              <View style={styles.contactDetails}>
                {contactDetails.map((item, index) => (
                  <View key={index} style={styles.contactItem}>
                    <View style={styles.contactIconBox}>
                      <Feather name={item.icon as any} size={20} color="#fff" />
                    </View>
                    <View style={styles.contactText}>
                      <Text style={styles.contactLabel}>{item.label}</Text>
                      <Text style={styles.contactValue}>{item.value}</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.socialLinks}>
                {socialLinks.map((social, index) => (
                  <Pressable
                    key={index}
                    style={styles.socialButton}
                    onPress={() => handleSocialPress(social.url)}
                  >
                    <Feather name={social.icon as any} size={16} color={social.color} />
                  </Pressable>
                ))}
              </View>
            </LinearGradient>

            {/* Contact Form */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Send us a message</Text>
              <Text style={styles.formSubtitle}>
                Fill in the details below and we'll get back to you shortly.
              </Text>

              {/* Email */}
              <View style={styles.inputGroup}>
                <View style={styles.inputIcon}>
                  <Feather name="mail" size={18} color="#3b82f6" />
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

              {/* Subject */}
              <View style={styles.inputGroup}>
                <View style={styles.inputIcon}>
                  <Feather name="tag" size={18} color="#14b8a6" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Subject"
                  placeholderTextColor="#94a3b8"
                  value={formData.subject}
                  onChangeText={(text) => setFormData({ ...formData, subject: text })}
                />
              </View>
              {errors.subject ? <Text style={styles.errorText}>{errors.subject}</Text> : null}

              {/* Description */}
              <View style={[styles.inputGroup, styles.textareaGroup]}>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="Description"
                  placeholderTextColor="#94a3b8"
                  value={formData.description}
                  onChangeText={(text) => {
                    if (text.length <= DESCRIPTION_LIMIT) {
                      setFormData({ ...formData, description: text });
                    }
                  }}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  maxLength={DESCRIPTION_LIMIT}
                />
              </View>
              <View style={styles.charCount}>
                <Text style={styles.charCountText}>
                  {formData.description.length}/{DESCRIPTION_LIMIT} characters
                </Text>
              </View>
              {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}

              {/* Submit Button */}
              <Pressable
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                <LinearGradient
                  colors={['#8b5cf6', '#ec4899', '#f59e0b']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGradient}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>Send Message</Text>
                      <Feather name="send" size={17} color="#fff" />
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          </View>

          <Footer />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollView: { flex: 1 },

  // Hero Header
  heroHeader: {
    paddingVertical: 60,
    paddingHorizontal: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(236, 72, 153, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },

  // Content
  content: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
    gap: 24,
  },

  // Info Card
  infoCard: {
    borderRadius: 24,
    padding: 28,
    ...Platform.select({
      ios: {
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  infoSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.92)',
    marginBottom: 28,
    lineHeight: 20,
  },
  contactDetails: {
    gap: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  contactIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactText: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  // Form Card
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: '#e6e9f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#5b6472',
    marginBottom: 28,
    lineHeight: 20,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
  },
  textareaGroup: {
    alignItems: 'flex-start',
    paddingVertical: 14,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
    padding: 0,
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  charCountText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    marginBottom: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
