import axios from 'axios';

const BACKEND_PORT = 8000;
const YOUR_IP = '192.168.47.251'; //change this to match your current ip (ipconfig in cmd prompt)
const host = YOUR_IP;

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
    } else {
      // Error in request setup
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
