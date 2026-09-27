import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Text, StyleSheet, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export const useToast = () => useContext(ToastContext);

const CONFIG: Record<ToastType, { bg: string; icon: keyof typeof Feather.glyphMap }> = {
  success: { bg: '#10b981', icon: 'check-circle' },
  error: { bg: '#ef4444', icon: 'alert-circle' },
  info: { bg: '#6366f1', icon: 'info' },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -120, duration: 220, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, [translateY, opacity]);

  const show = useCallback((message: string, type: ToastType = 'info') => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setToast({ message, type });
    translateY.setValue(-120);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 15, stiffness: 180 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    hideTimer.current = setTimeout(hide, 2800);
  }, [translateY, opacity, hide]);

  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  const top = (Platform.OS === 'web' ? 16 : insets.top) + 8;

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <Animated.View
          pointerEvents="none"
          testID="app-toast"
          style={[
            styles.toast,
            { top, backgroundColor: CONFIG[toast.type].bg, transform: [{ translateY }], opacity },
          ]}
        >
          <Feather name={CONFIG[toast.type].icon} size={18} color="#fff" />
          <Text style={styles.text} numberOfLines={2}>{toast.message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999,
  },
  text: { flex: 1, color: '#fff', fontSize: 13.5, fontWeight: '600' },
});
