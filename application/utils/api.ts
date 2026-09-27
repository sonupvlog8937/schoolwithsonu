import AsyncStorage from '@react-native-async-storage/async-storage';

// Get base URL from environment (matches client configuration)
const getBaseUrl = () => {
  const url = process.env.EXPO_PUBLIC_API_URL || 'https://ourschoolerpwithsonuserver-1.vercel.app/api';
  return url.replace(/\/$/, '');
};

// Get server base URL (for image URLs)
const getServerUrl = () => {
  const url = process.env.EXPO_PUBLIC_SERVER_URL || 'https://ourschoolerpwithsonuserver-1.vercel.app';
  return url.replace(/\/$/, '');
};

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem('accessToken');
  return {
    Authorization: `Bearer ${token ?? ''}`,
    'Content-Type': 'application/json',
  };
};

// Timeout utility for production APK stability
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 15000): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetchDataFromApi = async (url: string): Promise<any> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    console.log('📡 API Call:', `${getBaseUrl()}${url}`);
    
    const headers = await getAuthHeaders();
    const response = await fetchWithTimeout(`${getBaseUrl()}${url}`, { headers }, 15000);
    
    console.log('📡 Response:', { status: response.status, ok: response.ok });
    
    const json = await response.json();
    
    if (response.status === 401) {
      console.error('❌ 401 Unauthorized');
    }
    
    return json;
  } catch (error) {
    console.error('📡 API Error:', error instanceof Error ? error.message : 'Unknown error');
    
    if (error instanceof Error && error.name === 'AbortError') {
      return { error: true, message: 'Request timeout. Please try again.' };
    }
    
    return { error: true, message: 'Network error. Please check your connection.' };
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const postData = async (url: string, data: unknown): Promise<any> => {
  try {
    const baseUrl = getBaseUrl();
    const headers = await getAuthHeaders();
    const fullUrl = `${baseUrl}${url}`;
    
    console.log('📡 POST:', fullUrl);
    
    const response = await fetchWithTimeout(fullUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    }, 15000);
    
    console.log('📡 POST Response:', { status: response.status, ok: response.ok });
    
    // Extract token from Authorization header
    const authHeader = response.headers.get('Authorization');
    
    const json = await response.json();
    
    // Add token from header to response if available
    if (authHeader && !json.token) {
      json.token = authHeader.replace('Bearer ', '');
    }
    
    if (!response.ok) return { ...json, status: response.status };
    return json;
  } catch (error) {
    console.error('📡 POST Error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return { error: true, message: 'Request timeout. Please try again.' };
    }
    
    return { error: true, message: 'Network error. Please check your connection.' };
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const editData = async (url: string, data: unknown): Promise<any> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetchWithTimeout(`${getBaseUrl()}${url}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    }, 15000);
    return response.json();
  } catch {
    return { error: true, message: 'Network error.' };
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const patchData = async (url: string, data: unknown): Promise<any> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetchWithTimeout(`${getBaseUrl()}${url}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    }, 15000);
    return response.json();
  } catch {
    return { error: true, message: 'Network error.' };
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const deleteData = async (url: string): Promise<any> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetchWithTimeout(`${getBaseUrl()}${url}`, {
      method: 'DELETE',
      headers,
    }, 15000);
    return response.json();
  } catch {
    return { error: true, message: 'Network error.' };
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const uploadFormData = async (url: string, formData: FormData): Promise<any> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await fetchWithTimeout(`${getBaseUrl()}${url}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token ?? ''}` },
      body: formData,
    }, 30000); // Longer timeout for uploads
    return response.json();
  } catch {
    return { error: true, message: 'Upload failed.' };
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const uploadImage = async (url: string, formData: FormData): Promise<any> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await fetchWithTimeout(`${getBaseUrl()}${url}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token ?? ''}` },
      body: formData,
    }, 30000);
    return response.json();
  } catch {
    return { error: true, message: 'Image upload failed.' };
  }
};

export const updateFormData = async (url: string, formData: FormData): Promise<any> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await fetchWithTimeout(`${getBaseUrl()}${url}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token ?? ''}` },
      body: formData,
    }, 30000);
    return response.json();
  } catch {
    return { error: true, message: 'Update failed.' };
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const uploadImages = async (url: string, formData: FormData): Promise<any> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await fetchWithTimeout(`${getBaseUrl()}${url}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token ?? ''}` },
      body: formData,
    }, 30000);
    return response.json();
  } catch {
    return { error: true, message: 'Images upload failed.' };
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const deleteImages = async (url: string): Promise<any> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetchWithTimeout(`${getBaseUrl()}${url}`, {
      method: 'DELETE',
      headers,
    }, 15000);
    return response.json();
  } catch {
    return { error: true, message: 'Delete failed.' };
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const deleteMultipleData = async (url: string, data: unknown): Promise<any> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetchWithTimeout(`${getBaseUrl()}${url}`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify(data),
    }, 15000);
    return response.json();
  } catch {
    return { error: true, message: 'Delete failed.' };
  }
};

export { getBaseUrl, getServerUrl, getAuthHeaders };

// Alias for convenience (matches client naming)
export const getData = fetchDataFromApi;
