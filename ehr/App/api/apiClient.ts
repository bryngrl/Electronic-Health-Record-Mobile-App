import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// local development:
const BACKEND_PORT = 8000;
const IP_ADDRESS = '192.168.1.21';
export const BASE_URL = `http://${IP_ADDRESS}:${BACKEND_PORT}/`;

//prodcution:
// export const BASE_URL = `https://electronichealthrecord.bscs3a.com/api`;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// Interceptor to add Authorization header
apiClient.interceptors.request.use(
  async config => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // Use the common headers object to ensure compatibility across axios versions
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from storage', error);
    }
    console.log(
      'Starting Request to:',
      config.baseURL,
      config.url?.split('?')[0],
    );
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  response => {
    console.log('Response received:', response.status);
    return response;
  },
  async error => {
    const originalRequest = error.config;

    if (error.response) {
      // Server responded with error status
      console.error(
        'Backend error:',
        error.response.status,
        error.response.data,
      );

      // If we get a 403 (or 401) it might be because the interceptor token was stale
      // We can try to re-read from storage one time for specific requests
      if (
        (error.response.status === 403 || error.response.status === 401) &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;
        const token = await AsyncStorage.getItem('token');
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      }
    } else if (error.request) {
      // Request made but no response received
      console.error(
        'No response from backend. Check if server is running on',
        host + ':' + BACKEND_PORT,
      );
    } else {
      // Error in request setup
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
