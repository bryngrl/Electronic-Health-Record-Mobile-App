import axios from 'axios';

const BACKEND_PORT = 8000; // Changed from 8000 to avoid socket conflicts

// Update this to your USB Tethering IP from ipconfig
const PHYSICAL_DEVICE_HOST = '192.168.1.5';

// Use the physical device host directly for USB testing
const host = PHYSICAL_DEVICE_HOST;

export const BASE_URL = `http://${host}:${BACKEND_PORT}`;

const apiClient = axios.create({
  // Adding /api if your FastAPI routes are prefixed with /api
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000, // 15 second timeout for slower connections
});

// Request interceptor - logs requests for debugging
apiClient.interceptors.request.use(request => {
  console.log('Starting Request to:', request.baseURL, request.url);
  return request;
});

// Response interceptor - handles connection errors gracefully
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
    } else {
      // Error in request setup
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
