import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, RefreshCw, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { fetchDataFromApi, updateFormData } from '@/utils/api';

// If this screen lives inside an expo-router / react-navigation bottom
// Tab Navigator, uncomment these two lines and use `tabBarHeight` in the
// ScrollView's contentContainerStyle paddingBottom (see FIX NOTE at bottom).
// import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const fields = [
  ['school_name', 'School Name'],
  ['shortName', 'Short Name'],
  ['address', 'School Address'],
  ['affiliationNo', 'Affiliation No.'],
  ['registrationNo', 'Registration No.'],
  ['officeNo', 'Office No. (Contact)'],
  ['helpNo', 'Help No. (Contact)'],
  ['email', 'Email'],
  ['websiteAddress', 'Website Address'],
  ['facebookLink', 'Facebook Link'],
  ['instagramLink', 'Instagram Link'],
  ['twitterLink', 'Twitter Link'],
  ['youtubeLink', 'YouTube Link'],
  ['registrationDescription', 'Registration Description'],
  ['apiBiometric', 'Api Biometric'],
  ['apiBiometricKey', 'Api Biometric Key'],
  ['apiBiometricSecret', 'Api Biometric Secret'],
];

const assets = [
  ['image', 'Upload Logo', 'Logo (200 X 200)'],
  ['principalSignature', 'Upload Principal Signature', 'Principal Signature (150 X 80)'],
  ['dashboardBackground', 'Upload Dashboard Background', 'Dashboard Background'],
  ['boardLogo', 'Upload Board Logo', 'Affiliated Board Logo'],
  ['welcomeCard', 'Upload Welcome Card', 'Welcome Card'],
];

// ---------- Small animated wrapper for staggered fade/slide-in ----------
const FadeInView: React.FC<{ delay?: number; style?: any; children: React.ReactNode }> = ({
  delay = 0,
  style,
  children,
}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 360,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: anim,
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default function SchoolInfo() {
  const router = useRouter();
  // const tabBarHeight = useBottomTabBarHeight(); // uncomment if inside a Tab Navigator
  const [form, setForm] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const response = await fetchDataFromApi('/school/fetch-single');
    if (response?.success) setForm(response.data || {});
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const setValue = (key: string, value: any) => setForm((current) => ({ ...current, [key]: value }));

  const pickImage = async (key: string) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: true,
    });
    const asset = result.canceled ? null : result.assets[0];
    if (asset?.base64) {
      setForm((current) => ({
        ...current,
        [key]: `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`,
        [`${key}File`]: { uri: asset.uri, name: `${key}.jpg`, type: asset.mimeType || 'image/jpeg' },
      }));
    }
  };

  const submit = async () => {
    setSaving(true);
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (!key.endsWith('File') && value !== undefined && value !== null && typeof value !== 'object') {
        payload.append(key, String(value));
      }
    });
    assets.forEach(([key]) => {
      if (form[`${key}File`]) payload.append(key, form[`${key}File`] as any);
    });
    await updateFormData('/school/update', payload);
    await load();
    setSaving(false);
  };

  if (loading) return <ActivityIndicator style={styles.loader} size="large" color="#6366f1" />;

  return (
    <ScrollView
      style={styles.page}
      // FIX: bottom padding so content isn't hidden behind a bottom tab bar.
      // Swap 100 for `tabBarHeight + 24` if you enable the hook above.
      contentContainerStyle={[styles.content, { paddingBottom: 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={['#6366f1', '#ec4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.back} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={14} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>SCHOOL</Text>
            <Text style={styles.subtitle}>School information and configuration</Text>
          </View>
          <TouchableOpacity style={styles.refresh} onPress={load} activeOpacity={0.8}>
            <RefreshCw size={14} color="#6366f1" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FadeInView delay={0} style={styles.card}>
        <View style={styles.headingRow}>
          <View style={styles.headingDot} />
          <Text style={styles.heading}>SCHOOL</Text>
        </View>
        {fields.map(([key, label], i) => (
          <FadeInView key={key} delay={20 + i * 15} style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              value={String(form[key] || '')}
              onChangeText={(value) => setValue(key, value)}
              multiline={key === 'address' || key === 'registrationDescription'}
              placeholderTextColor="#94a3b8"
              style={[
                styles.input,
                (key === 'address' || key === 'registrationDescription') && styles.multiline,
              ]}
            />
          </FadeInView>
        ))}

        <View style={styles.subheadingRow}>
          <View style={[styles.headingDot, { backgroundColor: '#ec4899' }]} />
          <Text style={styles.subheading}>BIOMETRIC SETUP</Text>
        </View>
        <Toggle
          label="Is Saturday Working"
          value={Boolean(form.saturdayWorking)}
          onChange={(value) => setValue('saturdayWorking', value)}
        />
        <Toggle
          label="Is Sunday Working"
          value={Boolean(form.sundayWorking)}
          onChange={(value) => setValue('sundayWorking', value)}
        />

        <View style={styles.divider} />

        {assets.map(([key, title, label], i) => (
          <FadeInView key={key} delay={i * 40} style={styles.field}>
            <Text style={styles.assetTitle}>{title}</Text>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity style={styles.upload} onPress={() => pickImage(key)} activeOpacity={0.85}>
              <Upload size={13} color="#6366f1" />
              <Text style={styles.uploadText}>Choose image</Text>
            </TouchableOpacity>
            {form[key] ? <Image source={form[key]} contentFit="contain" style={styles.preview} /> : null}
          </FadeInView>
        ))}

        <TouchableOpacity disabled={saving} onPress={submit} activeOpacity={0.85} style={styles.submitWrap}>
          <LinearGradient
            colors={['#6366f1', '#ec4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submit}
          >
            <Text style={styles.submitText}>{saving ? 'Saving...' : 'Submit'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </FadeInView>
    </ScrollView>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <TouchableOpacity style={styles.toggleRow} onPress={() => onChange(!value)} activeOpacity={0.8}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.toggle, value && styles.toggleOn]}>
        <View style={[styles.knob, value && styles.knobOn]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f4f6fb' },
  content: { paddingBottom: 35 },
  loader: { flex: 1, padding: 50 },
  header: {
    padding: 18,
    paddingTop: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  back: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginBottom: 14,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  backText: { color: '#fff', fontSize: 10.5, fontWeight: '600' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#fff', fontSize: 18, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 10, marginTop: 4 },
  refresh: { backgroundColor: '#fff', padding: 9, borderRadius: 10 },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 15,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 14 },
  headingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6366f1' },
  heading: { color: '#6366f1', fontSize: 13.5, fontWeight: '800' },
  field: { marginBottom: 12 },
  label: { color: '#64748b', fontSize: 10.5, marginBottom: 5, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 9,
    color: '#17233b',
    fontSize: 11,
    backgroundColor: '#f8fafc',
  },
  multiline: { minHeight: 64, textAlignVertical: 'top' },
  subheadingRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10, marginBottom: 12 },
  subheading: { color: '#1e293b', fontSize: 12.5, fontWeight: '800' },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: 280,
    marginBottom: 13,
  },
  toggle: { width: 34, height: 18, borderRadius: 12, backgroundColor: '#cbd5e1', padding: 2 },
  toggleOn: { backgroundColor: '#6366f1' },
  knob: { width: 14, height: 14, borderRadius: 8, backgroundColor: '#fff' },
  knobOn: { alignSelf: 'flex-end' },
  divider: { height: 1, backgroundColor: '#eef1f6', marginVertical: 18 },
  assetTitle: { color: '#ec4899', fontSize: 11.5, fontWeight: '800', marginBottom: 3 },
  upload: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#6366f1',
    backgroundColor: '#6366f10c',
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  uploadText: { color: '#6366f1', fontSize: 10.5, fontWeight: '700' },
  preview: { width: 140, height: 84, marginTop: 8, borderRadius: 8 },
  submitWrap: { alignSelf: 'flex-end', marginTop: 12 },
  submit: {
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 10,
  },
  submitText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});

/*
FIX NOTE — "tabs ke karan niche wala section hide ho jata hai":
Happens because a bottom Tab Navigator floats over the screen and the
ScrollView doesn't know its height, so the last field(s) end up underneath it.
1. contentContainerStyle paddingBottom: 100 (already added above) — a safe
   fixed buffer so content never sits under the tab bar.
2. For a pixel-perfect fix instead of a fixed number, import and use:
     import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
     const tabBarHeight = useBottomTabBarHeight();
   then set paddingBottom: tabBarHeight + 24.
   This only works when SchoolInfo is rendered *inside* a <Tabs.Screen> /
   bottom Tab Navigator route (e.g. expo-router's `app/(tabs)/...` folder).
   If it's a normal stacked screen opened via router.push (not itself a
   tab), the fixed paddingBottom above is enough.
*/