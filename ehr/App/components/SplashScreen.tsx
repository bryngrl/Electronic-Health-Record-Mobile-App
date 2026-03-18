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
  nextScreen?: string;
}

const SplashScreen: React.FC<SplashScreenProps> = ({
  onAnimationFinish,
  nextScreen,
}) => {
  const circleScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(0)).current;
  const [animationDone, setAnimationDone] = useState(false);

  const LOGO_TARGET_Y = -(height * 0.31);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      onAnimationFinish();
      return;
    }

    // Wait for nextScreen to be determined (auth check finished)
    if (nextScreen === undefined) {
      return;
    }

    const goesToLogin = nextScreen === 'Login';

    if (goesToLogin) {
      // Full animation: circle expand → logo fade in → logo moves up
      Animated.sequence([
        Animated.timing(circleScale, {
          toValue: 0.03,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(circleScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.delay(800),
        Animated.timing(logoTranslateY, {
          toValue: LOGO_TARGET_Y,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.delay(500),
      ]).start(() => {
        setAnimationDone(true);
        onAnimationFinish();
      });
    } else {
      // Minimal animation: circle expand → logo fade in → logo fade out
      Animated.sequence([
        Animated.timing(circleScale, {
          toValue: 0.03,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(circleScale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setAnimationDone(true);
        onAnimationFinish();
      });
    }
  }, [nextScreen]);

  if (Platform.OS !== 'android' || animationDone) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#035022" barStyle="light-content" />
      <Animated.View
        style={[styles.circle, { transform: [{ scale: circleScale }] }]}
      />
      <Animated.View
        style={[
          styles.logoWrapper,
          { opacity: logoOpacity, transform: [{ translateY: logoTranslateY }] },
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
