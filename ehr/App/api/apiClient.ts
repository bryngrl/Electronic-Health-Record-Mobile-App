import axios from 'axios';
import { Platform } from 'react-native';

const BACKEND_PORT = 8000;

// Update this to your USB Tethering IP from ipconfig
const PHYSICAL_DEVICE_HOST = '10.248.106.213'; 

// Use the physical device host directly for USB testing
const host = PHYSICAL_DEVICE_HOST;

const apiClient = axios.create({
  // Adding /api if your FastAPI routes are prefixed with /api
  baseURL: `http://${host}:${BACKEND_PORT}`, 
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000, // 10 second timeout helps diagnose connection issues
});

// Optional: Add a request interceptor to log what IP you are hitting
apiClient.interceptors.request.use(request => {
  console.log('Starting Request to:', request.baseURL);
  return request;
});

export default apiClient;