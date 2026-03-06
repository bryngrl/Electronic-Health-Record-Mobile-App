import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Platform,
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
  // These values are calculated to match LoginScreen's layout (flex: 1 for logoContainer)
  // height / 2 is center, we move it up to roughly where LoginScreen's logo is.
  const LOGO_TARGET_Y = -(height * 0.31); // Adjust this to move logo Up (-) or Down (+)
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
      // 5. Move logo to top (to match LoginScreen position)
      Animated.timing(logoTranslateY, {
        toValue: LOGO_TARGET_Y,
        duration: 800,
        useNativeDriver: true,
      }),
      // 6. Final delay before switching screens
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
