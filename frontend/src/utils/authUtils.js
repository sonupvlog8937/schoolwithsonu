/**
 * Authentication utility functions for managing user sessions
 */

// Store user session with timestamp
export const storeUserSession = (token, user) => {
  const loginTime = Date.now();
  const expiryTime = loginTime + (30 * 24 * 60 * 60 * 1000); // 30 days in milliseconds
  
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('loginTime', loginTime.toString());
  localStorage.setItem('sessionExpiry', expiryTime.toString());
  
  console.log('📦 Session stored. Expires:', new Date(expiryTime).toLocaleString());
};

// Check if session is still valid
export const isSessionValid = () => {
  const sessionExpiry = localStorage.getItem('sessionExpiry');
  
  if (!sessionExpiry) return false;
  
  const expiryTime = parseInt(sessionExpiry, 10);
  const now = Date.now();
  
  return now < expiryTime;
};

// Get remaining session time in days
export const getSessionRemainingDays = () => {
  const sessionExpiry = localStorage.getItem('sessionExpiry');
  
  if (!sessionExpiry) return 0;
  
  const expiryTime = parseInt(sessionExpiry, 10);
  const now = Date.now();
  const remainingMs = expiryTime - now;
  
  if (remainingMs <= 0) return 0;
  
  return Math.floor(remainingMs / (24 * 60 * 60 * 1000));
};

// Clear user session
export const clearUserSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('loginTime');
  localStorage.removeItem('sessionExpiry');
  
  console.log('🗑️ Session cleared');
};

// Get session info
export const getSessionInfo = () => {
  const loginTime = localStorage.getItem('loginTime');
  const sessionExpiry = localStorage.getItem('sessionExpiry');
  
  if (!loginTime || !sessionExpiry) return null;
  
  return {
    loginTime: new Date(parseInt(loginTime, 10)),
    expiryTime: new Date(parseInt(sessionExpiry, 10)),
    remainingDays: getSessionRemainingDays(),
    isValid: isSessionValid()
  };
};
