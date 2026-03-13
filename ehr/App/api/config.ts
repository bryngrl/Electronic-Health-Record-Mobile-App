/**
  API Configuration: Switch between local development and production environments.
 **/

const LOCAL_IP = '192.168.1.21';
const BACKEND_PORT = 8000;

const DEV_BASE_URL = `http://${LOCAL_IP}:${BACKEND_PORT}/api`;
const PROD_BASE_URL = 'https://electronichealthrecord.bscs3a.com/api';

// Exported configuration
export const BASE_URL = PROD_BASE_URL; // Manually switched to PROD for testing
export const HOST = 'electronichealthrecord.bscs3a.com'; // Manually switched to PROD host
export { BACKEND_PORT };
