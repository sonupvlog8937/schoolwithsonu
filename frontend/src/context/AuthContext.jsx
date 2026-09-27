/* eslint-disable react/prop-types */
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { baseUrl } from '../environment';
import { isSessionValid, clearUserSession } from '../utils/authUtils';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [themeDark, setThemeDark] = useState(false);

  // Validate token with server
  const validateToken = async (token) => {
    try {
      const response = await axios.get(`${baseUrl}/auth/check`, {
        headers: { Authorization: token }
      });
      
      if (response.data && response.data.id) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.log('Token validation failed:', error.response?.status);
      return null;
    }
  };

  // Check for a token in localStorage to persist login
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      const theme = localStorage.getItem("themeDark");

      // Setup theme
      if (theme !== null && theme !== undefined && theme !== "") {
        try {
          setThemeDark(JSON.parse(theme));
        } catch {
          /* ignore */
        }
      } else if (
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ) {
        setThemeDark(true);
      }

      // Validate session
      if (token && userData) {
        // First check local expiry
        if (!isSessionValid()) {
          console.log('⏰ Session expired (30 days), clearing...');
          clearUserSession();
          setAuthenticated(false);
          setUser(null);
          setLoading(false);
          return;
        }

        try {
          // Validate token with server
          const validatedUser = await validateToken(token);
          
          if (validatedUser) {
            // Token is valid, restore session
            const storedUser = JSON.parse(userData);
            setAuthenticated(true);
            setUser(storedUser);
            console.log('✅ Session restored for:', storedUser.role);
          } else {
            // Token invalid or expired, clear session
            console.log('❌ Token validation failed, clearing session');
            clearUserSession();
            setAuthenticated(false);
            setUser(null);
          }
        } catch (error) {
          console.error('Session restore error:', error);
          clearUserSession();
          setAuthenticated(false);
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login function
  const login = (credentials) => {
    setAuthenticated(true);
    setUser(credentials);
    console.log("✅ User logged in:", credentials.role);
  };

  // Logout function
  const logout = () => {
    clearUserSession();
    setUser(null);
    setAuthenticated(false);
    console.log("👋 User logged out");
  };

  const themeChange = () => {
    localStorage.setItem("themeDark", JSON.stringify(!themeDark));
    setThemeDark(!themeDark);
  };

  return (
    <AuthContext.Provider value={{ 
      authenticated, 
      user, 
      login, 
      logout, 
      loading, 
      themeChange, 
      themeDark 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
