import { NativeModules, useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';

const useNetworkMonitor = () => {
  const { showToast } = useToast();
  const isFirstRun = useRef(true);
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!NativeModules?.RNCNetInfo) {
      console.warn('[NetInfo] RNCNetInfo native module is not available. Skipping network monitor subscription.');
      return;
    }

    const NetInfo =
      require('@react-native-community/netinfo').default as typeof import('@react-native-community/netinfo').default;

    const unsubscribe = NetInfo.addEventListener(state => {
      const connected =
        state.isConnected && state.isInternetReachable !== false;

      if (isFirstRun.current) {
        isFirstRun.current = false;
        if (!connected) {
          wasOffline.current = true;
          showToast('No internet connection', 'offline');
        }
        return;
      }

      if (!connected) {
        wasOffline.current = true;
        showToast('No internet connection', 'offline');
      } else if (wasOffline.current) {
        wasOffline.current = false;
        showToast("You're back online", 'online', 3000);
      }
    });

    return () => unsubscribe();
  }, [showToast]);
};

export default useNetworkMonitor;
