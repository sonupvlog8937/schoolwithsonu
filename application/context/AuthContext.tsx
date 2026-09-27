import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchDataFromApi, postData } from '@/utils/api';
import { 
  storeUserSession, 
  clearUserSession, 
  isSessionValid, 
  getSessionInfo 
} from '@/utils/authUtils';
import { SCHOOL_ROLES, type SchoolRole } from '@/constants/branding';

export interface UserData {
  _id?: string;
  id: string;
  name: string;
  email: string;
  role: SchoolRole;
  school_name?: string;
  schoolId?: string;
  image_url?: string;
  owner_name?: string;
  school_logo?: string;
  logo?: string;
  mobile?: string;
}

interface AuthContextType {
  isLogin: boolean;
  isLoading: boolean;
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
  login: (email: string, password: string, role: SchoolRole) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const ALLOWED_ROLES = Object.values(SCHOOL_ROLES);

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      console.log('🔐 Initializing auth...');
      const token = await AsyncStorage.getItem('accessToken');
      const storedUser = await AsyncStorage.getItem('userData');
      
      if (token && storedUser) {
        // First check local expiry (30 days)
        const sessionValid = await isSessionValid();
        
        if (!sessionValid) {
          console.log('⏰ Session expired (30 days), clearing...');
          await clearUserSession();
          setIsLogin(false);
          setUserData(null);
          setIsLoading(false);
          return;
        }
        
        const parsed: UserData = JSON.parse(storedUser);
        if (ALLOWED_ROLES.includes(parsed.role)) {
          setUserData(parsed);
          setIsLogin(true);
          
          // Log session info
          const sessionInfo = await getSessionInfo();
          if (sessionInfo) {
            console.log('✅ Session restored:', {
              role: parsed.role,
              name: parsed.name,
              remainingDays: sessionInfo.remainingDays,
              expiresAt: sessionInfo.expiryTime.toLocaleDateString()
            });
          }
          
          // Refresh user data in background
          refreshUserData().catch(err => console.log('Background refresh failed:', err));
        }
      } else {
        console.log('ℹ️ No stored session found');
      }
    } catch (error) {
      console.error('❌ Init auth error:', error);
      // Clear potentially corrupted data
      try {
        await clearUserSession();
      } catch (clearError) {
        console.error('Failed to clear session:', clearError);
      }
    } finally {
      setIsLoading(false);
      console.log('✅ Auth initialization complete');
    }
  };

  const refreshUserData = async () => {
    try {
      console.log('🔄 Refreshing user data...');
      const token = await AsyncStorage.getItem('accessToken');
      console.log('🔑 Token exists:', !!token);
      
      // Get user profile based on role
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) return;
      
      const user: UserData = JSON.parse(userData);
      const endpoint = getRoleEndpoint(user.role);
      
      if (endpoint) {
        const res = await fetchDataFromApi(endpoint);
        console.log('👤 Profile API response:', { 
          error: res?.error, 
          hasData: !!res?.data,
          success: res?.success
        });
        
        if (res?.success && res?.data) {
          console.log('✅ User data refreshed successfully');
          setUserData(res.data);
          await AsyncStorage.setItem('userData', JSON.stringify(res.data));
        } else if (res?.status === 401 || res?.error === true) {
          console.log('❌ Token invalid or expired, logging out...');
          await logout();
        }
      }
    } catch (error) {
      console.log('⚠️ Silent refresh error:', error);
      // Silent refresh - keep cached data
    }
  };

  const getRoleEndpoint = (role: SchoolRole): string | null => {
    const endpoints: Record<SchoolRole, string> = {
      [SCHOOL_ROLES.SCHOOL]: '/school/own-data',
      [SCHOOL_ROLES.STUDENT]: '/student/own-details',
      [SCHOOL_ROLES.TEACHER]: '/teacher/own-details',
      [SCHOOL_ROLES.PARENT]: '/parent/details',
      [SCHOOL_ROLES.ACCOUNTANT]: '/accountant/details',
      [SCHOOL_ROLES.LIBRARIAN]: '/librarian/details',
      [SCHOOL_ROLES.RECEPTIONIST]: '/receptionist/details',
      [SCHOOL_ROLES.SUPERADMIN]: '/super-admin/details',
      [SCHOOL_ROLES.VICEADMIN]: '/vice-admin/details',
    };
    return endpoints[role] || null;
  };

  const getRoleLoginEndpoint = (role: SchoolRole): string => {
    const endpoints: Record<SchoolRole, string> = {
      [SCHOOL_ROLES.SCHOOL]: '/school/login',
      [SCHOOL_ROLES.STUDENT]: '/student/login',
      [SCHOOL_ROLES.TEACHER]: '/teacher/login',
      [SCHOOL_ROLES.PARENT]: '/parent/login',
      [SCHOOL_ROLES.ACCOUNTANT]: '/accountant/login',
      [SCHOOL_ROLES.LIBRARIAN]: '/librarian/login',
      [SCHOOL_ROLES.RECEPTIONIST]: '/receptionist/login',
      [SCHOOL_ROLES.SUPERADMIN]: '/super-admin/login',
      [SCHOOL_ROLES.VICEADMIN]: '/vice-admin/login',
    };
    return endpoints[role];
  };

  const login = async (email: string, password: string, role: SchoolRole) => {
    try {
      console.log('🔑 Login attempt:', { email, role });
      
      const endpoint = getRoleLoginEndpoint(role);
      console.log('🔑 API Endpoint:', endpoint);
      
      const res = await postData(endpoint, { email, password });
      
      console.log('🔑 API Response:', { 
        success: res?.success, 
        error: res?.error,
        message: res?.message,
        hasUser: !!res?.user
      });

      // Check if login was successful
      const isSuccess = res?.success === true || res?.error === false;
      
      if (isSuccess && res?.user) {
        const user: UserData = res.user;
        
        console.log('✅ User data:', { 
          id: user.id,
          role: user.role,
          name: user.name
        });
        
        // Extract token from response
        const token = res?.token || '';
        
        if (!token) {
          console.log('❌ No token received from server');
          return { 
            success: false, 
            message: 'Login failed: No authentication token received.' 
          };
        }
        
        console.log('💾 Saving session with 30-day expiry...');
        await storeUserSession(token, user);
        
        // Save refresh token if available
        if (res.refreshToken) {
          await AsyncStorage.setItem('refreshToken', res.refreshToken);
        }
        
        // Get session info
        const sessionInfo = await getSessionInfo();
        if (sessionInfo) {
          console.log('📅 Session Info:', {
            expiresAt: sessionInfo.expiryTime.toLocaleDateString(),
            remainingDays: sessionInfo.remainingDays
          });
        }
        
        setUserData(user);
        setIsLogin(true);
        
        console.log('✅✅✅ LOGIN COMPLETE!');
        return { success: true };
      }

      console.log('❌ Login failed:', res?.message);
      return { 
        success: false, 
        message: res?.message ?? 'Invalid credentials. Please try again.' 
      };
    } catch (error) {
      console.error('❌ Login exception:', error);
      return { 
        success: false, 
        message: 'Network error. Please check your connection.' 
      };
    }
  };

  const logout = async () => {
    console.log('🚪 Logging out...');
    
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        // Optional: Call logout API
        // await fetchDataFromApi(`/api/auth/logout?token=${token}`);
      }
    } catch (error) {
      console.log('Logout API error (continuing anyway):', error);
    }
    
    // Clear session
    await clearUserSession();
    
    // Verify cleared
    const checkToken = await AsyncStorage.getItem('accessToken');
    console.log('✅ Session cleared:', !checkToken);
    
    // Update state
    setUserData(null);
    setIsLogin(false);
    
    console.log('✅ Logout complete');
  };

  return (
    <AuthContext.Provider value={{ 
      isLogin, 
      isLoading, 
      userData, 
      setUserData, 
      setIsLogin, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};