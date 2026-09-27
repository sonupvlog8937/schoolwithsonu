import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { APP_NAME, LOGO_URL } from '@/constants/branding';

export default function Footer() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    Alert.alert('Success', 'Thanks! You are on the list. We will send updates to your inbox.');
    setEmail('');
  };

  return (
    <View style={styles.footer}>
      {/* Main Footer Content */}
      <View style={styles.footerContent}>
        {/* Column 1: Logo & Description */}
        <View style={styles.footerColumn}>
          <View style={styles.footerLogo}>
            <Image
              source={{ uri: LOGO_URL }}
              style={styles.footerLogoImage}
            />
            <Text style={styles.footerLogoText}>{APP_NAME}</Text>
          </View>
          <Text style={styles.footerDescription}>
            Empowering schools with cutting-edge digital solutions. Trusted by 500+ institutions across India.
          </Text>
          <View style={styles.socialLinks}>
            {['facebook', 'twitter', 'linkedin', 'youtube'].map((social) => (
              <Pressable key={social} style={styles.socialButton}>
                <Feather name={social as any} size={18} color="rgba(226,232,240,0.8)" />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Column 2: Product Links */}
        <View style={styles.footerColumn}>
          <Text style={styles.footerColumnTitle}>Product</Text>
          <Pressable style={styles.footerLinkButton}>
            <Text style={styles.footerLink}>Features</Text>
          </Pressable>
          <Pressable style={styles.footerLinkButton}>
            <Text style={styles.footerLink}>Pricing</Text>
          </Pressable>
          <Pressable style={styles.footerLinkButton} onPress={() => router.push('/contact')}>
            <Text style={styles.footerLink}>Contact</Text>
          </Pressable>
        </View>

        {/* Column 3: Company Links */}
        <View style={styles.footerColumn}>
          <Text style={styles.footerColumnTitle}>Company</Text>
          <Pressable style={styles.footerLinkButton}>
            <Text style={styles.footerLink}>About</Text>
          </Pressable>
          <Pressable style={styles.footerLinkButton}>
            <Text style={styles.footerLink}>Blog</Text>
          </Pressable>
          <Pressable style={styles.footerLinkButton}>
            <Text style={styles.footerLink}>Careers</Text>
          </Pressable>
        </View>

        {/* Column 4: Newsletter */}
        <View style={[styles.footerColumn, { flex: 1.5 }]}>
          <Text style={styles.footerColumnTitle}>Subscribe to our newsletter</Text>
          <View style={styles.newsletterForm}>
            <TextInput
              style={styles.newsletterInput}
              placeholder="Your email"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Pressable style={styles.subscribeButton} onPress={handleSubscribe}>
              <Text style={styles.subscribeButtonText}>Subscribe</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Footer Divider */}
      <View style={styles.footerDivider} />

      {/* Footer Bottom */}
      <View style={styles.footerBottom}>
        <Text style={styles.copyright}>
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </Text>
        <View style={styles.footerBottomLinks}>
          <Pressable>
            <Text style={styles.footerBottomLink}>Privacy Policy</Text>
          </Pressable>
          <Text style={styles.footerBottomDivider}>•</Text>
          <Pressable>
            <Text style={styles.footerBottomLink}>Terms of Service</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#0f172a',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  footerContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    marginBottom: 32,
  },
  footerColumn: {
    flex: 1,
    minWidth: 140,
    gap: 12,
  },
  footerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  footerLogoImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  footerLogoText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  footerDescription: {
    fontSize: 13,
    color: 'rgba(226,232,240,0.85)',
    lineHeight: 20,
    marginBottom: 16,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 8,
  },
  socialButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(226,232,240,0.1)',
  },
  footerColumnTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  footerLinkButton: {
    paddingVertical: 4,
  },
  footerLink: {
    fontSize: 13,
    color: 'rgba(226,232,240,0.8)',
  },
  newsletterForm: {
    gap: 10,
  },
  newsletterInput: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 14,
  },
  subscribeButton: {
    backgroundColor: '#f97316',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  subscribeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginBottom: 24,
  },
  footerBottom: {
    gap: 12,
    alignItems: 'center',
  },
  copyright: {
    fontSize: 12,
    color: 'rgba(226,232,240,0.7)',
    textAlign: 'center',
  },
  footerBottomLinks: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  footerBottomLink: {
    fontSize: 12,
    color: 'rgba(226,232,240,0.7)',
  },
  footerBottomDivider: {
    fontSize: 12,
    color: 'rgba(226,232,240,0.5)',
  },
});
