import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Upload, X, Image as ImageIcon } from 'lucide-react-native';
import { useColors } from '@/hooks/useColors';

interface ImageUploadBoxProps {
  onImageSelected: (uri: string, file: any) => void;
  existingImage?: string;
  onRemove?: () => void;
  label?: string;
  aspectRatio?: [number, number];
  multiple?: boolean;
}

export const ImageUploadBox: React.FC<ImageUploadBoxProps> = ({
  onImageSelected,
  existingImage,
  onRemove,
  label = 'Upload Image',
  aspectRatio,
  multiple = false,
}) => {
  const colors = useColors();
  const [loading, setLoading] = useState(false);
  const [localUri, setLocalUri] = useState<string | undefined>(existingImage);

  const requestPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permission to upload images.');
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: !multiple,
        aspect: aspectRatio,
        quality: 0.8,
        allowsMultipleSelection: multiple,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setLocalUri(asset.uri);
        onImageSelected(asset.uri, asset);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setLocalUri(undefined);
    onRemove?.();
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      
      {localUri ? (
        <View style={[styles.imageContainer, { backgroundColor: colors.card }]}>
          <Image source={{ uri: localUri }} style={styles.image} resizeMode="cover" />
          <TouchableOpacity
            style={[styles.removeButton, { backgroundColor: colors.danger }]}
            onPress={handleRemove}
          >
            <X size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.uploadBox, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={pickImage}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                <Upload size={32} color={colors.primary} />
              </View>
              <Text style={[styles.uploadText, { color: colors.textSecondary }]}>
                Tap to upload image
              </Text>
              <Text style={[styles.uploadHint, { color: colors.textTertiary }]}>
                PNG, JPG, WEBP (max 5MB)
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  uploadBox: {
    height: 200,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
  },
  uploadHint: {
    fontSize: 12,
  },
  imageContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
