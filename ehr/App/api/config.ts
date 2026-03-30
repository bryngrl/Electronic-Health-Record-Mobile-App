const LOCAL_IP = '192.168.1.56';
const BACKEND_PORT = 8000;

const WEBSITE = 'electronichealthrecord.bscs3a.com';
const DEV_BASE_URL = `http://${LOCAL_IP}:${BACKEND_PORT}/api`;
const PROD_BASE_URL = `https://${WEBSITE}/api`;

const isProd = false; // Set to true for production builds, false for development

export const BASE_URL = isProd ? PROD_BASE_URL : DEV_BASE_URL;
export const HOST = isProd ? WEBSITE : LOCAL_IP;

export { BACKEND_PORT };
