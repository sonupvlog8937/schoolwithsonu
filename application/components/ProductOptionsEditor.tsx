import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Plus, X, Edit2 } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';

export interface ProductOption {
  name: string;
  values: string[];
}

interface ProductOptionsEditorProps {
  options: ProductOption[];
  onChange: (options: ProductOption[]) => void;
}

export const ProductOptionsEditor: React.FC<ProductOptionsEditorProps> = ({
  options,
  onChange,
}) => {
  const colors = useColors();
  const [optionName, setOptionName] = useState('');
  const [optionValue, setOptionValue] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addOption = () => {
    if (!optionName.trim()) return;
    
    const newOption: ProductOption = {
      name: optionName.trim(),
      values: [],
    };
    
    onChange([...options, newOption]);
    setOptionName('');
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  const addOptionValue = (optionIndex: number) => {
    if (!optionValue.trim()) return;
    
    const updated = [...options];
    updated[optionIndex].values.push(optionValue.trim());
    onChange(updated);
    setOptionValue('');
    setEditingIndex(null);
  };

  const removeOptionValue = (optionIndex: number, valueIndex: number) => {
    const updated = [...options];
    updated[optionIndex].values = updated[optionIndex].values.filter((_, i) => i !== valueIndex);
    onChange(updated);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Product Options</Text>
      
      {/* Add New Option */}
      <View style={styles.addSection}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Option name (e.g., Size, Color)"
          placeholderTextColor={colors.textTertiary}
          value={optionName}
          onChangeText={setOptionName}
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={addOption}
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Options List */}
      <ScrollView style={styles.optionsList}>
        {options.map((option, optionIndex) => (
          <View key={optionIndex} style={[styles.optionCard, { backgroundColor: colors.card }]}>
            <View style={styles.optionHeader}>
              <Text style={[styles.optionName, { color: colors.text }]}>{option.name}</Text>
              <TouchableOpacity onPress={() => removeOption(optionIndex)}>
                <X size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>

            {/* Add Value to Option */}
            {editingIndex === optionIndex && (
              <View style={styles.addValueSection}>
                <TextInput
                  style={[styles.valueInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  placeholder={`Add ${option.name.toLowerCase()} value`}
                  placeholderTextColor={colors.textTertiary}
                  value={optionValue}
                  onChangeText={setOptionValue}
                />
                <TouchableOpacity
                  style={[styles.addValueButton, { backgroundColor: colors.success }]}
                  onPress={() => addOptionValue(optionIndex)}
                >
                  <Plus size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {/* Values List */}
            <View style={styles.valuesList}>
              {option.values.map((value, valueIndex) => (
                <View key={valueIndex} style={[styles.valueChip, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.valueText, { color: colors.primary }]}>{value}</Text>
                  <TouchableOpacity onPress={() => removeOptionValue(optionIndex, valueIndex)}>
                    <X size={14} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
              
              <TouchableOpacity
                style={[styles.editButton, { borderColor: colors.primary }]}
                onPress={() => setEditingIndex(editingIndex === optionIndex ? null : optionIndex)}
              >
                <Edit2 size={14} color={colors.primary} />
                <Text style={[styles.editButtonText, { color: colors.primary }]}>
                  {editingIndex === optionIndex ? 'Done' : 'Add Values'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsList: {
    maxHeight: 400,
  },
  optionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '600',
  },
  addValueSection: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  valueInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  addValueButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valuesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  valueChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  valueText: {
    fontSize: 13,
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
