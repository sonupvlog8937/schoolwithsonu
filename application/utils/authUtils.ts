import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '@/constants/branding';

/**
 * Authentication utility functions for managing user sessions
 * Implements 30-day session persistence matching web client
 */

export interface SessionInfo {
  loginTime: Date;
  expiryTime: Date;
  remainingDays: number;
  isValid: boolean;
}

// Store user session with 30-day expiry
export const storeUserSession = async (token: string, user: unknown) => {
  const loginTime = Date.now();
  const expiryTime = loginTime + (API_CONFIG.SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  
  await AsyncStorage.multiSet([
    ['accessToken', token],
    ['userData', JSON.stringify(user)],
    ['loginTime', loginTime.toString()],
    ['sessionExpiry', expiryTime.toString()],
  ]);
  
  console.log('📦 Session stored. Expires:', new Date(expiryTime).toLocaleString());
};

// Check if session is still valid
export const isSessionValid = async (): Promise<boolean> => {
  try {
    const sessionExpiry = await AsyncStorage.getItem('sessionExpiry');
    if (!sessionExpiry) return false;
    
    const expiryTime = parseInt(sessionExpiry, 10);
    const now = Date.now();
    
    return now < expiryTime;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
};

// Get remaining session days
export const getSessionRemainingDays = async (): Promise<number> => {
  try {
    const sessionExpiry = await AsyncStorage.getItem('sessionExpiry');
    if (!sessionExpiry) return 0;
    
    const expiryTime = parseInt(sessionExpiry, 10);
    const now = Date.now();
    const remainingMs = expiryTime - now;
    
    if (remainingMs <= 0) return 0;
    
    return Math.floor(remainingMs / (24 * 60 * 60 * 1000));
  } catch (error) {
    console.error('Error calculating remaining days:', error);
    return 0;
  }
};

// Clear user session completely
export const clearUserSession = async () => {
  await AsyncStorage.multiRemove([
    'accessToken',
    'refreshToken',
    'userData',
    'loginTime',
    'sessionExpiry',
  ]);
  
  console.log('🗑️ Session cleared');
};

// Get complete session info
export const getSessionInfo = async (): Promise<SessionInfo | null> => {
  try {
    const [loginTime, sessionExpiry] = await AsyncStorage.multiGet(['loginTime', 'sessionExpiry']);
    
    const loginTimeValue = loginTime[1];
    const sessionExpiryValue = sessionExpiry[1];
    
    if (!loginTimeValue || !sessionExpiryValue) return null;
    
    const remainingDays = await getSessionRemainingDays();
    const valid = await isSessionValid();
    
    return {
      loginTime: new Date(parseInt(loginTimeValue, 10)),
      expiryTime: new Date(parseInt(sessionExpiryValue, 10)),
      remainingDays,
      isValid: valid,
    };
  } catch (error) {
    console.error('Error getting session info:', error);
    return null;
  }
};
