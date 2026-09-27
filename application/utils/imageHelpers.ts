import { getServerUrl } from './api';

/**
 * Get full URL for school image (matches client logic)
 * @param imageValue - Image filename or URL from database
 * @returns Full image URL
 */
export const getSchoolImageSrc = (imageValue?: string | null): string => {
  if (!imageValue) {
    return 'https://via.placeholder.com/300x200?text=No+Image';
  }

  // If already a full URL, return as is
  if (/^https?:\/\//i.test(imageValue)) {
    return imageValue;
  }

  // Construct URL from server base + relative path
  const serverOrigin = getServerUrl();
  return `${serverOrigin}/images/uploaded/school/${imageValue}`;
};

/**
 * Get full URL for teacher image
 * @param imageValue - Image filename or URL from database
 * @returns Full image URL
 */
export const getTeacherImageSrc = (imageValue?: string | null): string => {
  if (!imageValue) {
    return 'https://via.placeholder.com/200x200?text=No+Image';
  }

  if (/^https?:\/\//i.test(imageValue)) {
    return imageValue;
  }

  const serverOrigin = getServerUrl();
  return `${serverOrigin}/images/uploaded/teacher/${imageValue}`;
};

/**
 * Get full URL for student image
 * @param imageValue - Image filename or URL from database
 * @returns Full image URL
 */
export const getStudentImageSrc = (imageValue?: string | null): string => {
  if (!imageValue) {
    return 'https://via.placeholder.com/200x200?text=No+Image';
  }

  if (/^https?:\/\//i.test(imageValue)) {
    return imageValue;
  }

  const serverOrigin = getServerUrl();
  return `${serverOrigin}/images/uploaded/student/${imageValue}`;
};

/**
 * Get full URL for user avatar/profile image
 * @param imageValue - Image filename or URL from database
 * @returns Full image URL
 */
export const getUserImageSrc = (imageValue?: string | null): string => {
  if (!imageValue) {
    return 'https://via.placeholder.com/150x150?text=Avatar';
  }

  if (/^https?:\/\//i.test(imageValue)) {
    return imageValue;
  }

  const serverOrigin = getServerUrl();
  return `${serverOrigin}/images/uploaded/user/${imageValue}`;
};
