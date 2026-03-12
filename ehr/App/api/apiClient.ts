import axios from 'axios';
import { Platform } from 'react-native';

const BACKEND_PORT = 8000;

// Determine backend host depending on environment:
// - Android USB debugging -> 127.0.0.1 with `adb reverse tcp:8000 tcp:8000`
// - Android emulator -> 10.0.2.2 (set globalThis.BACKEND_HOST)
// - iOS simulator -> localhost
// - Physical device via Wi-Fi -> set globalThis.BACKEND_HOST to your LAN IP
let host = '127.0.0.1';
if (Platform.OS === 'android') {
  host = '127.0.0.1';
} else if (Platform.OS === 'ios') {
  host = 'localhost';
}

// Allow manual override for physical devices during testing
// Set from debugger or app startup: `globalThis.BACKEND_HOST = '192.168.x.x'`
if (typeof globalThis !== 'undefined' && (globalThis as any).BACKEND_HOST) {
  host = (globalThis as any).BACKEND_HOST;
}

export const BASE_URL = `http://${host}:${BACKEND_PORT}/`;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(request => {
  console.log('Starting Request to:', request.baseURL, request.url);
  return request;
});

apiClient.interceptors.response.use(
  response => {
    console.log('Response received:', response.status);
    return response;
  },
  error => {
    if (error.response) {
      // Server responded with error status
      console.error(
        'Backend error:',
        error.response.status,
        error.response.data,
      );
    } else if (error.request) {
      // Request made but no response received
      console.error(
        'No response from backend. Check if server is running on',
        host + ':' + BACKEND_PORT,
      );
      if (Platform.OS === 'android' && host === '127.0.0.1') {
        console.error(
          'Android USB tip: run `adb reverse tcp:8000 tcp:8000` from the project root.',
        );
      }
    } else {
      // Error in request setup
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
