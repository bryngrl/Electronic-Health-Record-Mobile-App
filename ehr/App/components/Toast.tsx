import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppTheme } from '@App/theme/ThemeContext';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'offline' | 'online';

export interface ToastRef {
  show: (message: string, type?: ToastType, duration?: number) => void;
  hide: () => void;
}

const ICONS: Record<ToastType, string> = {
  success: 'check-circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
  offline: 'wifi-off',
  online: 'wifi',
};

const Toast = forwardRef<ToastRef, {}>((_, ref) => {
  const { theme } = useAppTheme();
  const [state, setState] = useState<{
    message: string;
    type: ToastType;
    shouldRender: boolean;
  }>({ message: '', type: 'info', shouldRender: false });

  const translateY = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDismissing = useRef(false);

  const hide = () => {
    if (isDismissing.current) return;
    isDismissing.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);

    Animated.parallel([
      Animated.timing(translateY, { toValue: 80, duration: 250, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) {
        setState(prev => ({ ...prev, shouldRender: false }));
        isDismissing.current = false;
      }
    });
  };

  useImperativeHandle(ref, () => ({
    show(message, type = 'info', duration = 3500) {
      if (timerRef.current) clearTimeout(timerRef.current);
      isDismissing.current = false;

      translateY.setValue(80);
      opacity.setValue(0);
      setState({ message, type, shouldRender: true });

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // offline type is persistent — only dismiss manually or via hide()
      if (type !== 'offline') {
        timerRef.current = setTimeout(() => hide(), duration);
      }
    },
    hide,
  }));

  if (!state.shouldRender) return null;

  const colors = getColors(theme, state.type);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={[styles.iconWrapper, { backgroundColor: colors.iconBg }]}>
        <Icon name={ICONS[state.type]} size={18} color={colors.icon} />
      </View>
      <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
        {state.message}
      </Text>
      <TouchableOpacity onPress={hide} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Icon name="close" size={16} color={colors.text} style={styles.closeIcon} />
      </TouchableOpacity>
    </Animated.View>
  );
});

const getColors = (theme: any, type: ToastType) => {
  switch (type) {
    case 'success':
    case 'online':
      return {
        bg: theme.toastSuccessBg,
        text: theme.toastSuccessText,
        border: theme.toastSuccessBorder,
        icon: theme.toastSuccessText,
        iconBg: `${theme.toastSuccessBorder}33`,
      };
    case 'error':
      return {
        bg: theme.toastErrorBg,
        text: theme.toastErrorText,
        border: theme.toastErrorBorder,
        icon: theme.toastErrorText,
        iconBg: `${theme.toastErrorBorder}33`,
      };
    case 'warning':
      return {
        bg: theme.toastWarningBg,
        text: theme.toastWarningText,
        border: theme.toastWarningBorder,
        icon: theme.toastWarningText,
        iconBg: `${theme.toastWarningBorder}33`,
      };
    case 'offline':
      return {
        bg: theme.toastOfflineBg,
        text: theme.toastOfflineText,
        border: theme.toastOfflineBorder,
        icon: theme.toastOfflineText,
        iconBg: `${theme.toastOfflineBorder}33`,
      };
    default:
      return {
        bg: theme.toastInfoBg,
        text: theme.toastInfoText,
        border: theme.toastInfoBorder,
        icon: theme.toastInfoText,
        iconBg: `${theme.toastInfoBorder}33`,
      };
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    zIndex: 99999,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    gap: 10,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'AlteHaasGrotesk',
    lineHeight: 18,
  },
  closeIcon: {
    opacity: 0.6,
  },
});

export default Toast;
