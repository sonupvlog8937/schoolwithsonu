import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save, Trash2 } from 'lucide-react-native';
import type { AppDispatch, RootState } from '@/state/store';
import { createSection, deleteSection, fetchSections, saveSectionPositions, updateSection } from '@/state/sectionSlice';

const COLORS = {
  primary: '#fb542d',
  primaryDark: '#e0430f',
  primaryLight: '#ff8a5c',
  amber: '#ffb020',
  blue: '#3b82f6',
  violet: '#8b5cf6',
  pink: '#ec4899',
  teal: '#14b8a6',
  sky: '#0ea5e9',
  green: '#16a34a',
  red: '#ef4444',
  bg: '#fff8f4',
  surface: '#ffffff',
  border: '#ffe1cc',
  textMuted: '#a68a7a',
  textDark: '#3a2a20',
};

function FadeInView({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 350, delay, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View
      style={[
        style,
        { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

function AnimatedPressable({
  children,
  onPress,
  style,
  disabled,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  disabled?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 40 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }).start();
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity activeOpacity={0.85} disabled={disabled} onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} style={style}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function SectionScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const records = useSelector((state: RootState) => state.sections.records);
  const loading = useSelector((state: RootState) => state.sections.loading);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('0');
  const [editing, setEditing] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    dispatch(fetchSections());
  }, [dispatch]);

  const submit = () => {
    if (!name.trim()) return;
    if (editing) {
      dispatch(updateSection({ id: editing, updates: { name, position: Number(position) } }));
    } else {
      dispatch(createSection({ name, position: Number(position) }));
    }
    setName('');
    setPosition('0');
    setEditing(null);
  };

  const handleSavePositions = () => {
    const positions = records.map((row) => ({ id: row._id, position: row.position }));
    dispatch(saveSectionPositions(positions));
  };

  const filteredRecords = showInactive ? records : records.filter((row) => row.active);
  const bottomPad = insets.bottom + 90;

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ paddingBottom: bottomPad }}>
      <FadeInView>
        <View style={styles.header}>
          <TouchableOpacity style={styles.back} activeOpacity={0.7} onPress={() => router.back()}>
            <ArrowLeft size={17} color="#fff" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>SECTION</Text>
        </View>
      </FadeInView>

      <FadeInView delay={70}>
        <View style={styles.form}>
          <Text style={styles.heading}>SECTION</Text>
          <TextInput
            placeholder="Section"
            placeholderTextColor={COLORS.textMuted}
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            placeholder="Position (sort order)"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numeric"
            value={position}
            onChangeText={setPosition}
            style={styles.input}
          />
          <AnimatedPressable style={styles.submit} onPress={submit}>
            <Text style={styles.submitText}>{editing ? 'Update' : 'Submit'}</Text>
          </AnimatedPressable>
        </View>
      </FadeInView>

      <FadeInView delay={140}>
        <View style={styles.list}>
          <View style={styles.listHeader}>
            <Text style={styles.heading}>SECTION LIST</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity activeOpacity={0.8} style={styles.save} onPress={handleSavePositions}>
                <Save size={13} color="#fff" />
                <Text style={styles.saveText}>Save Positions</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.inactiveButton, showInactive && styles.inactiveButtonActive]}
                onPress={() => setShowInactive(!showInactive)}
              >
                <Text style={styles.inactiveText}>{showInactive ? 'Hide Inactive' : 'Show Inactive'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : filteredRecords.length ? (
            filteredRecords.map((row, index) => (
              <FadeInView key={row._id} delay={Math.min(index, 8) * 45} style={styles.row}>
                <Text style={styles.name}>{row.name}</Text>
                <TextInput
                  keyboardType="numeric"
                  value={String(row.position)}
                  onChangeText={(value) => dispatch(updateSection({ id: row._id, updates: { position: Number(value) } }))}
                  style={styles.positionInput}
                />
                <Switch
                  value={row.active}
                  onValueChange={(value) => {
                    dispatch(updateSection({ id: row._id, updates: { active: value } }));
                  }}
                  trackColor={{ false: '#e2d3c8', true: COLORS.primaryLight }}
                  thumbColor={row.active ? COLORS.primary : '#fff'}
                />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setEditing(row._id);
                    setName(row.name);
                    setPosition(String(row.position));
                  }}
                >
                  <Text style={styles.edit}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7} onPress={() => dispatch(deleteSection(row._id))}>
                  <Trash2 size={15} color={COLORS.red} />
                </TouchableOpacity>
              </FadeInView>
            ))
          ) : (
            <Text style={styles.empty}>No Data</Text>
          )}
        </View>
      </FadeInView>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.primary, padding: 20, paddingTop: 26 },
  back: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 14 },
  backText: { color: '#fff', fontSize: 11 },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
  form: {
    backgroundColor: COLORS.surface,
    margin: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  list: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.amber,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13, flexWrap: 'wrap', gap: 8 },
  heading: { color: COLORS.primary, fontWeight: '800', fontSize: 13, marginBottom: 13 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    marginBottom: 12,
    color: COLORS.textDark,
    backgroundColor: '#fffdfb',
  },
  submit: { alignSelf: 'flex-end', backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  buttonGroup: { flexDirection: 'row', gap: 8 },
  save: { backgroundColor: COLORS.amber, borderRadius: 6, padding: 8, flexDirection: 'row', gap: 5, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  inactiveButton: { backgroundColor: COLORS.primaryLight, borderRadius: 6, padding: 8 },
  inactiveButtonActive: { backgroundColor: COLORS.green },
  inactiveText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#fdf1e8' },
  name: { flex: 1, color: COLORS.textDark, fontSize: 12 },
  positionInput: { width: 48, borderWidth: 1, borderColor: COLORS.border, padding: 5, fontSize: 10.5, textAlign: 'center', borderRadius: 5, color: COLORS.textDark },
  edit: { color: COLORS.blue, fontSize: 11, paddingHorizontal: 8, fontWeight: '600' },
  empty: { color: COLORS.textMuted, textAlign: 'center', padding: 32, fontSize: 13 },
});