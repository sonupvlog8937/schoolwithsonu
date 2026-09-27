import { useRef } from 'react';
import {
  Animated,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  GestureResponderEvent,
} from 'react-native';

interface AnimatedButtonProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
}

/** TouchableOpacity that scales down smoothly on press for tactile feedback. */
export default function AnimatedButton({ children, style, onPress, disabled }: AnimatedButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }).start();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      disabled={disabled}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </TouchableOpacity>
  );
}