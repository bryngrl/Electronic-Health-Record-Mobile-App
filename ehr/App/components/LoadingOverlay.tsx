import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, Animated, StyleSheet } from 'react-native';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [visible, pulseAnim]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.loadingOverlay}>
        <Animated.Image
          source={require('@assets/icons/loading.png')}
          style={[styles.loadingLogo, { transform: [{ scale: pulseAnim }] }]}
          resizeMode="contain"
        />
        <Text style={styles.loadingText}>{message}</Text>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    width: 90,
    height: 90,
    tintColor: '#ffffff',
    marginBottom: 20,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'AlteHaasGroteskBold',
    letterSpacing: 0.5,
  },
});

export default LoadingOverlay;
