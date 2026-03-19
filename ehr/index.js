/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App/App';
import { name as appName } from './app.json';

// Set host for API calls when running on physical devices.
// Replace with your machine IP (example: '192.168.1.42') or set it dynamically.
// This is read by App/api/apiClient.ts via `global.REACT_NATIVE_HOST`.
if (typeof global !== 'undefined' && !global.REACT_NATIVE_HOST) {
	// Default host for Android devices. When testing with a USB-connected
	// device we use `localhost` with `adb reverse` so the device can reach
	// the local uvicorn server without network configuration.
	global.REACT_NATIVE_HOST = 'localhost';
}

AppRegistry.registerComponent(appName, () => App);
