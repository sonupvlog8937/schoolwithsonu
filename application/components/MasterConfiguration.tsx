import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/state/store';
import {
  createMasterConfig,
  deleteMasterConfig,
  fetchMasterConfig,
  updateMasterConfig,
} from '@/state/masterConfigurationSlice';

// If this screen lives inside an expo-router / react-navigation bottom
// Tab Navigator, uncomment these two lines and use `tabBarHeight` in the
// ScrollView's contentContainerStyle paddingBottom (see FIX NOTE at bottom).
// import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

type Field = { key: string; label: string; multiline?: boolean; boolean?: boolean; required?: boolean };
type ModuleConfig = { title: string; fields: Field[]; columns: Field[] };

const text = (key: string, label: string, options: Partial<Field> = {}): Field => ({ key, label, ...options });
const simple = (title: string, label = title): ModuleConfig => ({
  title,
  fields: [text('name', label, { required: true }), text('description', 'Description', { multiline: true })],
  columns: [text('name', label), text('description', 'Description')],
});

const configs: Record<string, ModuleConfig> = {
  'app-version': {
    title: 'APP VERSION',
    fields: [
      text('platform', 'Platform', { required: true }),
      text('minSupported', 'Min Supported', { required: true }),
      text('latest', 'Latest', { required: true }),
      text('title', 'Title'),
    ],
    columns: [
      text('platform', 'Platform'),
      text('minSupported', 'Min Supported'),
      text('latest', 'Latest'),
      text('title', 'Title'),
    ],
  },
  'house-name': simple('HOUSE NAME', 'House Name'),
  'hobby-group': simple('SCHOOL GROUP', 'Group Name'),
  religion: simple('RELIGION NAME', 'Religion Name'),
  disabilities: simple('DISABILITIES', 'Disability'),
  designation: simple('DESIGNATION'),
  department: simple('DEPARTMENT'),
  'library-setting': {
    title: 'LIBRARY SETTING',
    fields: [
      text('returnWithDays', 'Return With Days', { required: true }),
      text('noOfDays', 'No. of Days', { required: true }),
      text('amountCharged', 'Amount Charged', { required: true }),
      text('description', 'Description', { multiline: true }),
    ],
    columns: [text('returnWithDays', 'Return With Days'), text('noOfDays', 'No. of Days'), text('amountCharged', 'Amount Charged')],
  },
  'general-settings': {
    title: 'GENERAL SETTINGS',
    fields: [
      text('printReceipt', 'Print Receipt', { boolean: true }),
      text('showBalance', 'Show Balance', { boolean: true }),
      text('applyFine', 'Apply Fine', { boolean: true }),
      text('showDiscount', 'Show Discount', { boolean: true }),
      text('noOfDays', 'No. of Days'),
      text('amountCharged', 'Amount Charged'),
      text('description', 'Description', { multiline: true }),
    ],
    columns: [text('printReceipt', 'Print Receipt'), text('applyFine', 'Apply Fine'), text('showDiscount', 'Show Discount')],
  },
  'online-payment': {
    title: 'ONLINE PAYMENT',
    fields: [
      text('upiId', 'UPI Id', { required: true }),
      text('upiHolderName', 'UPI Holder Name', { required: true }),
      text('accountNo', 'Account No.', { required: true }),
      text('bankName', 'Bank Name'),
      text('ifscCode', 'IFSC Code'),
      text('accountHolderName', 'Account Holder Name'),
      text('razorpayKeyId', 'Razorpay Key Id'),
      text('razorpaySecretKey', 'Razorpay Secret Key'),
    ],
    columns: [text('upiId', 'UPI Id'), text('upiHolderName', 'UPI Holder Name'), text('bankName', 'Bank Name')],
  },
  'payment-method': simple('PAYMENT METHOD'),
  'sms-settings': {
    title: 'SMS SETTINGS',
    fields: [
      text('feeSms', 'Fee SMS', { boolean: true }),
      text('admissionSms', 'Admission SMS', { boolean: true }),
      text('visitorSms', 'Visitor SMS', { boolean: true }),
      text('birthdaySms', 'Birthday SMS', { boolean: true }),
      text('biometricCheckinStudents', 'Biometric Check-in SMS to Students', { boolean: true }),
      text('biometricCheckoutStudents', 'Biometric Check-out SMS to Students', { boolean: true }),
      text('administrationNumbers', 'Administration Numbers', { multiline: true }),
    ],
    columns: [text('feeSms', 'Fee SMS'), text('admissionSms', 'Admission SMS'), text('visitorSms', 'Visitor SMS')],
  },
  'sms-template': {
    title: 'SMS TEMPLATE',
    fields: [text('smsName', 'SMS Name', { required: true }), text('smsContent', 'SMS Content', { multiline: true, required: true })],
    columns: [text('smsName', 'SMS Name'), text('smsContent', 'SMS Content')],
  },
  'biometric-device': {
    title: 'BIOMETRIC DEVICE',
    fields: [text('sn', 'SN', { required: true }), text('ip', 'IP', { required: true }), text('description', 'Description', { multiline: true })],
    columns: [text('sn', 'SN'), text('ip', 'IP'), text('description', 'Description')],
  },
  'school-shifts': {
    title: 'SCHOOL SHIFT',
    fields: [
      text('shiftName', 'Shift Name', { required: true }),
      text('checkinStart', 'Checkin Start', { required: true }),
      text('checkinEnd', 'Checkin End', { required: true }),
      text('checkinTime', 'Checkin Time', { required: true }),
      text('checkoutStart', 'Checkout Start', { required: true }),
      text('checkoutEnd', 'Checkout End', { required: true }),
      text('checkoutTime', 'Checkout Time', { required: true }),
      text('timeDuration', 'Time Duration', { required: true }),
    ],
    columns: [text('shiftName', 'Shift Name'), text('checkinStart', 'Checkin Start'), text('checkoutStart', 'Checkout Start')],
  },
  'working-days-template': {
    title: 'WORKING DAYS TEMPLATE',
    fields: [text('name', 'Name', { required: true }), text('className', 'Select Class', { required: true })],
    columns: [text('name', 'Name'), text('className', 'Class')],
  },
  'school-config': {
    title: 'SCHOOL CONFIGURATIONS',
    fields: [text('key', 'Key', { required: true }), text('value', 'Value', { required: true }), text('defaultValue', 'Default?')],
    columns: [text('key', 'Key'), text('value', 'Value'), text('defaultValue', 'Default?')],
  },
  boards: {
    title: 'BOARDS',
    fields: [
      text('shortCode', 'Short Code', { required: true }),
      text('name', 'Name', { required: true }),
      text('description', 'Description', { multiline: true }),
      text('active', 'Active', { boolean: true }),
    ],
    columns: [text('shortCode', 'Short Code'), text('name', 'Name'), text('description', 'Description')],
  },
  'enquiry-statuses': {
    title: 'ADMISSION QUERY STATUSES',
    fields: [
      text('name', 'Name', { required: true }),
      text('order', 'Order'),
      text('colour', 'Colour'),
      text('isDefault', 'Default', { boolean: true }),
      text('active', 'Active', { boolean: true }),
    ],
    columns: [text('order', 'Order'), text('name', 'Name'), text('colour', 'Colour')],
  },
  'enquiry-sources': {
    title: 'ENQUIRY SOURCES',
    fields: [
      text('name', 'Name', { required: true }),
      text('order', 'Order'),
      text('isDefault', 'Default', { boolean: true }),
      text('active', 'Active', { boolean: true }),
    ],
    columns: [text('order', 'Order'), text('name', 'Source')],
  },
};

const ACCENTS = ['#6366f1', '#ec4899', '#10b981', '#f97316', '#3b82f6', '#8b5cf6'];

// ---------- Small animated wrapper for staggered fade/slide-in ----------
const FadeInView = ({
  delay = 0,
  style,
  children,
}: {
  delay?: number;
  style?: any;
  children: React.ReactNode;
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
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default function MasterConfigurationScreen({ fixedModule }: { fixedModule?: string }) {
  const { module = 'session' } = useLocalSearchParams<{ module: string }>();
  const name = fixedModule || String(module);
  const config = configs[name] || simple(name.toUpperCase());
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  // const tabBarHeight = useBottomTabBarHeight(); // uncomment if inside a Tab Navigator
  const state = useSelector((root: RootState) => root.masterConfiguration.modules[name]);
  const [form, setForm] = useState<Record<string, any>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchMasterConfig(name));
    setForm({});
    setEditingId(null);
  }, [dispatch, name]);

  const records = state?.records || [];
  const fields = useMemo(() => config.fields, [config]);
  const setValue = (key: string, value: any) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    const first = fields.find((field) => !field.boolean);
    const nameValue =
      form.name || form.platform || form.shortCode || (first ? form[first.key] : '') || 'Configuration';
    const data = { name: String(nameValue), data: form, active: form.active !== false };
    if (editingId) await dispatch(updateMasterConfig({ module: name, id: editingId, data }));
    else await dispatch(createMasterConfig({ module: name, data }));
    setForm({});
    setEditingId(null);
    dispatch(fetchMasterConfig(name));
  };

  const edit = (record: any) => {
    setEditingId(record._id);
    setForm({ ...(record.data || {}), name: record.name || record.data?.name });
  };

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
          <ArrowLeft size={15} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.subtitle}>Manage {config.title.toLowerCase()}</Text>
      </LinearGradient>

      <View style={styles.layout}>
        <FadeInView delay={0} style={styles.formCard}>
          <View style={styles.headingRow}>
            <View style={styles.headingDot} />
            <Text style={styles.heading}>{editingId ? `EDIT ${config.title}` : config.title}</Text>
          </View>

          {fields.map((field, i) =>
            field.boolean ? (
              <FadeInView key={field.key} delay={20 + i * 12} style={styles.switchRow}>
                <Text style={styles.label}>
                  {field.required && <Text style={styles.required}>* </Text>}
                  {field.label}
                </Text>
                <Switch
                  value={Boolean(form[field.key])}
                  onValueChange={(value) => setValue(field.key, value)}
                  trackColor={{ false: '#cbd5e1', true: '#6366f1' }}
                  thumbColor="#ffffff"
                />
              </FadeInView>
            ) : (
              <FadeInView key={field.key} delay={20 + i * 12} style={styles.fieldWrap}>
                <Text style={styles.label}>
                  {field.required && <Text style={styles.required}>* </Text>}
                  {field.label}
                </Text>
                <TextInput
                  value={String(form[field.key] ?? '')}
                  onChangeText={(value) => setValue(field.key, value)}
                  placeholder={field.label}
                  placeholderTextColor="#a8b3bf"
                  multiline={field.multiline}
                  style={[styles.input, field.multiline && styles.multiline]}
                />
              </FadeInView>
            )
          )}

          <View style={styles.rule} />

          <TouchableOpacity onPress={submit} activeOpacity={0.85} style={styles.submitWrap}>
            <LinearGradient
              colors={editingId ? ['#3b82f6', '#60a5fa'] : ['#6366f1', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submit}
            >
              <Text style={styles.submitText}>{editingId ? 'Update' : 'Submit'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </FadeInView>

        <View style={styles.listCard}>
          <View style={styles.listHeader}>
            <View style={styles.headingRow}>
              <View style={[styles.headingDot, { backgroundColor: '#ec4899' }]} />
              <Text style={styles.heading}>{config.title} LIST</Text>
            </View>
            <View style={styles.inactive}>
              <Text style={styles.inactiveText}>INACTIVE</Text>
            </View>
          </View>

          {state?.loading ? (
            <ActivityIndicator color="#6366f1" style={{ marginVertical: 20 }} />
          ) : records.length === 0 ? (
            <Text style={styles.empty}>No Data</Text>
          ) : (
            records.map((record: any, index: number) => {
              const accent = ACCENTS[index % ACCENTS.length];
              return (
                <FadeInView key={record._id} delay={index * 55} style={styles.record}>
                  <View style={[styles.recordAccent, { backgroundColor: accent }]} />
                  <View style={styles.recordMain}>
                    {config.columns.map((field, ci) => (
                      <Text
                        key={field.key}
                        style={[styles.recordText, ci === 0 && { color: accent, fontWeight: '700' }]}
                      >
                        {String(record.data?.[field.key] ?? record[field.key] ?? (field.key === 'name' ? record.name : '-'))}
                      </Text>
                    ))}
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity onPress={() => edit(record)} style={styles.actionBtn} activeOpacity={0.8}>
                      <Pencil size={14} color="#3b82f6" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => dispatch(deleteMasterConfig({ module: name, id: record._id }))}
                      style={[styles.actionBtn, styles.deleteBtn]}
                      activeOpacity={0.8}
                    >
                      <Trash2 size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </FadeInView>
              );
            })
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f4f6fb' },
  content: { padding: 16, paddingBottom: 32 },
  header: { padding: 18, paddingTop: 20, borderRadius: 16, marginBottom: 16 },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  backText: { color: '#fff', fontSize: 10.5, fontWeight: '600' },
  title: { color: '#fff', fontSize: 18, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 10.5, marginTop: 4 },
  layout: { gap: 16 },
  formCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  listCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 14 },
  headingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6366f1' },
  heading: { color: '#1e293b', fontSize: 12.5, fontWeight: '800' },
  fieldWrap: { marginBottom: 4 },
  label: { color: '#475569', fontSize: 10.5, marginBottom: 5, fontWeight: '500' },
  required: { color: '#ef4444' },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 9,
    color: '#17233b',
    fontSize: 11.5,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  multiline: { minHeight: 64, textAlignVertical: 'top' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 },
  rule: { height: 1, backgroundColor: '#eef1f6', marginVertical: 10 },
  submitWrap: { alignSelf: 'flex-end' },
  submit: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  submitText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  inactive: { backgroundColor: '#ec489918', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  inactiveText: { color: '#ec4899', fontSize: 9, fontWeight: '700' },
  empty: { color: '#b6c0ca', textAlign: 'center', paddingVertical: 46, fontSize: 12.5 },
  record: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingVertical: 12,
    alignItems: 'center',
  },
  recordAccent: { width: 4, height: 30, borderRadius: 2, marginRight: 10 },
  recordMain: { flex: 1, gap: 4 },
  recordText: { color: '#52667a', fontSize: 11 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    backgroundColor: '#eff6ff',
    padding: 7,
    borderRadius: 8,
  },
  deleteBtn: { backgroundColor: '#fef2f2' },
});

/*
FIX NOTE — "tabs ke karan niche wala section hide ho jata hai":
Happens because a bottom Tab Navigator floats over the screen and the
ScrollView doesn't know its height, so the last record(s) end up underneath it.
1. contentContainerStyle paddingBottom: 100 (already added above) — a safe
   fixed buffer so content never sits under the tab bar.
2. For a pixel-perfect fix instead of a fixed number, import and use:
     import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
     const tabBarHeight = useBottomTabBarHeight();
   then set paddingBottom: tabBarHeight + 24.
   This only works when MasterConfigurationScreen is rendered *inside* a
   <Tabs.Screen> / bottom Tab Navigator route (e.g. expo-router's
   `app/(tabs)/...` folder). If it's a normal stacked screen opened via
   router.push (not itself a tab), the fixed paddingBottom above is enough.
*/