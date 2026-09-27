import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput,
  ActivityIndicator, Modal, Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { postData } from '@/utils/api';

interface OTPDeleteConfirmationProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
}

const PHONE_NUMBER = '8969737537';
const OTP_LENGTH = 6;

export function OTPDeleteConfirmation({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
}: OTPDeleteConfirmationProps) {
  const colors = useColors();
  const [step, setStep] = useState<'confirm' | 'otp'>('confirm');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setStep('confirm');
      setOtp(['', '', '', '', '', '']);
      setError('');
      setOtpSent(false);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  const sendOTP = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await postData('/api/otp/send-delete-otp', {
        phoneNumber: PHONE_NUMBER,
        action: 'delete',
        itemType: title,
        itemName: itemName || 'item',
      });

      if (response?.error === false || response?.success) {
        setOtpSent(true);
        setStep('otp');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Auto focus first input
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        setError(response?.message || 'Failed to send OTP');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== OTP_LENGTH) {
      setError('Please enter complete OTP');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await postData('/api/otp/verify-delete-otp', {
        phoneNumber: PHONE_NUMBER,
        otp: otpCode,
      });

      if (response?.error === false || response?.success || response?.verified) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onConfirm();
        onClose();
      } else {
        setError(response?.message || 'Invalid OTP');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto move to next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all filled
    if (value && index === OTP_LENGTH - 1 && newOtp.every(d => d)) {
      verifyOTP();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: colors.card,
              transform: [{ scale: scaleAnim }],
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          {step === 'confirm' ? (
            // Step 1: Confirmation
            <>
              <View style={[styles.iconContainer, { backgroundColor: '#fee2e2' }]}>
                <Feather name="alert-triangle" size={32} color="#dc2626" />
              </View>

              <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
              <Text style={[styles.message, { color: colors.mutedForeground }]}>
                {message}
              </Text>

              {itemName && (
                <View style={[styles.itemBadge, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.itemName, { color: colors.foreground }]}>
                    {itemName}
                  </Text>
                </View>
              )}

              <View style={[styles.infoBox, { backgroundColor: '#fef3c7', borderColor: '#fcd34d' }]}>
                <Feather name="info" size={16} color="#d97706" />
                <Text style={[styles.infoText, { color: '#92400e' }]}>
                  OTP will be sent to {PHONE_NUMBER.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}
                </Text>
              </View>

              <View style={styles.buttonRow}>
                <Pressable
                  style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
                  onPress={handleClose}
                  disabled={isLoading}
                >
                  <Text style={[styles.buttonText, { color: colors.foreground }]}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={[styles.button, styles.sendButton, isLoading && styles.buttonDisabled]}
                  onPress={sendOTP}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Feather name="send" size={16} color="#fff" />
                      <Text style={styles.sendButtonText}>Send OTP</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </>
          ) : (
            // Step 2: OTP Input
            <>
              <View style={[styles.iconContainer, { backgroundColor: '#dbeafe' }]}>
                <Feather name="shield" size={32} color="#2563eb" />
              </View>

              <Text style={[styles.title, { color: colors.foreground }]}>Enter OTP</Text>
              <Text style={[styles.message, { color: colors.mutedForeground }]}>
                We've sent a 6-digit code to{'\n'}
                {PHONE_NUMBER.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}
              </Text>

              {/* OTP Input */}
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      if (ref) inputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.otpInput,
                      {
                        borderColor: digit ? colors.primary : colors.border,
                        color: colors.foreground,
                        backgroundColor: colors.background,
                      },
                      error && styles.otpInputError,
                    ]}
                    value={digit}
                    onChangeText={(value) => handleOTPChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </View>

              {error && (
                <View style={styles.errorContainer}>
                  <Feather name="alert-circle" size={14} color="#dc2626" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Pressable
                onPress={sendOTP}
                disabled={isLoading}
                style={styles.resendButton}
              >
                <Text style={[styles.resendText, { color: colors.primary }]}>
                  Didn't receive? Resend OTP
                </Text>
              </Pressable>

              <View style={styles.buttonRow}>
                <Pressable
                  style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
                  onPress={handleClose}
                  disabled={isLoading}
                >
                  <Text style={[styles.buttonText, { color: colors.foreground }]}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={[styles.button, styles.verifyButton, isLoading && styles.buttonDisabled]}
                  onPress={verifyOTP}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Feather name="check" size={16} color="#fff" />
                      <Text style={styles.verifyButtonText}>Verify</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  itemBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 16,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    lineHeight: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  sendButton: {
    backgroundColor: '#2563eb',
  },
  verifyButton: {
    backgroundColor: '#16a34a',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Inter_700Bold',
  },
  verifyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Inter_700Bold',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  otpInputError: {
    borderColor: '#dc2626',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    fontFamily: 'Inter_500Medium',
  },
  resendButton: {
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  resendText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
});
