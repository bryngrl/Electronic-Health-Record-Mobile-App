/**
  API Configuration: Automatically switches between local development and production environments.
 **/

const LOCAL_IP = '192.168.1.21'; // Update this to your current ip address
const BACKEND_PORT = 8000;

const DEV_BASE_URL = `http://${LOCAL_IP}:${BACKEND_PORT}/api`;
const PROD_BASE_URL = 'https://electronichealthrecord.bscs3a.com/api';

export const BASE_URL = __DEV__ ? DEV_BASE_URL : PROD_BASE_URL;
export const HOST = __DEV__ ? LOCAL_IP : 'electronichealthrecord.bscs3a.com';
export { BACKEND_PORT };
