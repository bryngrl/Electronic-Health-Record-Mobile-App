import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Pressable,
  Platform,
} from 'react-native';
import BlurViewSafe from './BlurViewSafe';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const THEME = {
  success: { color: '#2BB673', icon: 'check-circle-outline' as const },
  error: { color: '#E05260', icon: 'alert-circle-outline' as const },
  delete: { color: '#E05260', icon: 'trash-can-outline' as const },
  warning: { color: '#F5A623', icon: 'alert-outline' as const },
  info: { color: '#3B9EE8', icon: 'information-outline' as const },
} as const;

type AlertType = keyof typeof THEME;

interface SweetAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: AlertType;
  onCancel?: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  dismissOnBackdrop?: boolean;
}

const { width } = Dimensions.get('window');

export default function SweetAlert({
  visible,
  title,
  message,
  type = 'info',
  onCancel,
  onConfirm,
  confirmText,
  cancelText,
  dismissOnBackdrop = true,
}: SweetAlertProps) {
  const theme = THEME[type];

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = visible
      ? withTiming(1, { duration: 240, easing: Easing.out(Easing.cubic) })
      : withTiming(0, { duration: 180, easing: Easing.in(Easing.cubic) });
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [26, 0]) },
      { scale: interpolate(progress.value, [0, 1], [0.98, 1]) },
    ],
  }));

  const defaultConfirmText =
    confirmText ?? (type === 'delete' ? 'Delete' : type === 'error' ? 'OK' : 'Confirm');
  const defaultCancelText = cancelText ?? 'Cancel';

  const handleBackdrop = () => {
    if (!dismissOnBackdrop) return;
    onCancel?.();
  };


  const blurType = useMemo(() => {
    // Android-safe values: "light" / "dark"
    // iOS can use system materials, but you’re on Android so keep it safe:
    return Platform.OS === 'ios' ? 'systemMaterial' : 'light';
  }, []);

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleBackdrop} />

        <Animated.View style={[styles.cardWrap, cardStyle]}>
          <View style={styles.card}>
            {}
              <BlurViewSafe
                style={StyleSheet.absoluteFill}
                blurType={blurType}
                blurAmount={25}
                reducedTransparencyFallbackColor="rgba(255,255,255,0.92)"
              />

            {/* Glass tint overlay (works for both Blur + fallback) */}
            <View style={styles.glassTint} />

            {/* Close button */}
            <TouchableOpacity
              onPress={onCancel}
              disabled={!onCancel}
              style={[styles.closeBtn, !onCancel && { opacity: 0 }]}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name="close" size={18} color="#7B8496" />
            </TouchableOpacity>

            {/* Center content */}
            <View style={styles.centerContent}>
              <View style={[styles.iconBadge, { borderColor: `${theme.color}40` }]}>
                <View style={[styles.iconFill, { backgroundColor: `${theme.color}E6` }]}>
                  <MaterialCommunityIcons name={theme.icon} size={46} color="#fff" />
                </View>
              </View>

              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

         

              <View style={styles.btnRow}>
                {onCancel && (
                  <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.85}>
                    <Text style={styles.cancelTxt}>{defaultCancelText}</Text>
                  </TouchableOpacity>
                )}

                {onConfirm && (
                  <TouchableOpacity
                    style={[
                      styles.confirmBtn,
                      { backgroundColor: theme.color },
                      !onCancel && styles.fullBtn,
                    ]}
                    onPress={onConfirm}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.confirmTxt}>{defaultConfirmText}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 14, 25, 0.30)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardWrap: {
    width: width * 0.88,
    maxWidth: 420,
  },

  card: {
    borderRadius: 28,
    overflow: 'hidden',
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    elevation: 18,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
  },

  fallbackFrost: {
    backgroundColor: 'rgba(255,255,255,0.78)',
  },

  glassTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },

  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.35)',
    zIndex: 5,
  },

  centerContent: {
    alignItems: 'center',
    paddingTop: 20,
  },

  iconBadge: {
    width: 110,
    height: 110,
    borderRadius: 32,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginBottom: 16,
  },

  iconFill: {
    width: 80,
    height: 80,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#101626',
    textAlign: 'center',
  },

  message: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: '#56607A',
    textAlign: 'center',
    paddingHorizontal: 12,
  },

  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },

  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.40)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.60)',
  },

  cancelTxt: {
    fontWeight: '800',
    color: '#5E687F',
  },

  confirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  fullBtn: { flex: 1 },

  confirmTxt: {
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.2,
  },
});