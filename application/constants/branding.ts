/**
 * Branding configuration for EduSmart mobile app
 * Keep this in sync with client/src/branding.js
 */

export const APP_NAME = 'EduSmart';
export const APP_SHORT_NAME = 'EduSmart';
export const APP_TAGLINE = 'Complete School Management Solution';
export const LOGO_URL = 'https://res.cloudinary.com/dn7ko6gut/image/upload/v1776425546/ChatGPT_Image_Apr_17_2026_05_02_07_PM_mqa7gd.png';

// School roles
export const SCHOOL_ROLES = {
  SCHOOL: 'SCHOOL',
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
  PARENT: 'PARENT',
  ACCOUNTANT: 'ACCOUNTANT',
  LIBRARIAN: 'LIBRARIAN',
  RECEPTIONIST: 'RECEPTIONIST',
  SUPERADMIN: 'SUPERADMIN',
  VICEADMIN: 'VICEADMIN',
} as const;

export type SchoolRole = typeof SCHOOL_ROLES[keyof typeof SCHOOL_ROLES];

// API configuration
export const API_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 2,
  SESSION_EXPIRY_DAYS: 30,
};

// Theme colors
export const COLORS = {
  primary: '#6366f1',
  primaryDark: '#4338ca',
  secondary: '#8b5cf6',
  accent: '#ec4899',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};
