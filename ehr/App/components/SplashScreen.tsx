import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Platform,
  StatusBar,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const diagonal = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
const circleSize = diagonal * 1.1;

interface SplashScreenProps {
  onAnimationFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationFinish }) => {
  const circleScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(0)).current;
  const [animationDone, setAnimationDone] = useState(false);

  // --- LOGO POSITIONING---
  // Adjust this to move logo Up (-) or Down (+) to match LoginScreen perfectly
  const LOGO_TARGET_Y = -(height * 0.31); 
  // -----------------------------

  useEffect(() => {
    if (Platform.OS !== 'android') {
      onAnimationFinish();
      return;
    }

    Animated.sequence([
      // 1. Small white circle appears
      Animated.timing(circleScale, {
        toValue: 0.03,
        duration: 500,
        useNativeDriver: true,
      }),
      // 2. Circle expands to cover screen
      Animated.timing(circleScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // 3. Logo fades in at center
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.delay(800),
      // 4. Move logo to top
      Animated.timing(logoTranslateY, {
        toValue: LOGO_TARGET_Y,
        duration: 800,
        useNativeDriver: true,
      }),
      // 5. Final delay
      Animated.delay(500),
    ]).start(() => {
      setAnimationDone(true);
      onAnimationFinish();
    });
  }, []);

  if (Platform.OS !== 'android' || animationDone) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#035022" barStyle="light-content" />
      {/* Expanding White Circle */}
      <Animated.View
        style={[
          styles.circle,
          {
            transform: [{ scale: circleScale }],
          },
        ]}
      />

      {/* Logo Container */}
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            opacity: logoOpacity,
            transform: [{ translateY: logoTranslateY }],
          },
        ]}
      >
        <Image
          source={require('@assets/icons/ehr_logo.png')}
          style={styles.logo}
          resizeMode="contain"
          fadeDuration={0}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#035022',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  circle: {
    width: circleSize,
    height: circleSize,
    borderRadius: circleSize / 2,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
  },
  logoWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});

export default SplashScreen;
