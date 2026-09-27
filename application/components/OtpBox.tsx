import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, Platform } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface OtpBoxProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  autoFocus?: boolean;
}

export const OtpBox: React.FC<OtpBoxProps> = ({ 
  length = 6, 
  value, 
  onChange, 
  autoFocus = true 
}) => {
  const colors = useColors();
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const otpArray = value.split('').slice(0, length);
    setOtp([...otpArray, ...Array(length - otpArray.length).fill('')]);
  }, [value, length]);

  const handleChange = (text: string, index: number) => {
    const sanitized = text.replace(/[^0-9]/g, '');
    if (sanitized.length === 0) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      onChange(newOtp.join(''));
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = sanitized[sanitized.length - 1];
    setOtp(newOtp);
    onChange(newOtp.join(''));

    if (sanitized.length > 0 && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => { inputs.current[index] = ref; }}
          style={[
            styles.input,
            {
              borderColor: digit ? colors.primary : colors.border,
              backgroundColor: colors.card,
              color: colors.text,
            },
          ]}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          autoFocus={autoFocus && index === 0}
          selectTextOnFocus
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  input: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});
