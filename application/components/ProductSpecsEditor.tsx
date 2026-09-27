import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Plus, X } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';

export interface ProductSpec {
  key: string;
  value: string;
}

interface ProductSpecsEditorProps {
  specs: ProductSpec[];
  onChange: (specs: ProductSpec[]) => void;
}

export const ProductSpecsEditor: React.FC<ProductSpecsEditorProps> = ({
  specs,
  onChange,
}) => {
  const colors = useColors();
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');

  const addSpec = () => {
    if (!specKey.trim() || !specValue.trim()) return;
    
    onChange([...specs, { key: specKey.trim(), value: specValue.trim() }]);
    setSpecKey('');
    setSpecValue('');
  };

  const removeSpec = (index: number) => {
    onChange(specs.filter((_, i) => i !== index));
  };

  const updateSpec = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...specs];
    updated[index][field] = value;
    onChange(updated);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Product Specifications</Text>
      
      {/* Add New Spec */}
      <View style={styles.addSection}>
        <TextInput
          style={[styles.input, styles.keyInput, { 
            backgroundColor: colors.card, 
            borderColor: colors.border, 
            color: colors.text 
          }]}
          placeholder="Key (e.g., Brand)"
          placeholderTextColor={colors.textTertiary}
          value={specKey}
          onChangeText={setSpecKey}
        />
        <TextInput
          style={[styles.input, styles.valueInput, { 
            backgroundColor: colors.card, 
            borderColor: colors.border, 
            color: colors.text 
          }]}
          placeholder="Value (e.g., Samsung)"
          placeholderTextColor={colors.textTertiary}
          value={specValue}
          onChangeText={setSpecValue}
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={addSpec}
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Specs List */}
      <ScrollView style={styles.specsList}>
        {specs.map((spec, index) => (
          <View key={index} style={[styles.specRow, { backgroundColor: colors.card }]}>
            <View style={styles.specContent}>
              <TextInput
                style={[styles.specKey, { color: colors.text }]}
                value={spec.key}
                onChangeText={(text) => updateSpec(index, 'key', text)}
                placeholder="Key"
                placeholderTextColor={colors.textTertiary}
              />
              <Text style={[styles.separator, { color: colors.textTertiary }]}>:</Text>
              <TextInput
                style={[styles.specValue, { color: colors.textSecondary }]}
                value={spec.value}
                onChangeText={(text) => updateSpec(index, 'value', text)}
                placeholder="Value"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            <TouchableOpacity onPress={() => removeSpec(index)}>
              <X size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        ))}
        
        {specs.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              No specifications added yet
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  addSection: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  keyInput: {
    flex: 1,
  },
  valueInput: {
    flex: 1.5,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  specsList: {
    maxHeight: 400,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  specContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  specKey: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  separator: {
    fontSize: 14,
    fontWeight: '600',
  },
  specValue: {
    flex: 1.5,
    fontSize: 14,
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
