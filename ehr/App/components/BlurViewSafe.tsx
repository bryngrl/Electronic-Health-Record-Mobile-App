import React from 'react';
import {
  NativeModules,
  Platform,
  StyleProp,
  View,
  ViewStyle,
  UIManager,
} from 'react-native';

type BlurViewSafeProps = {
  style?: StyleProp<ViewStyle>;
  blurType?: 'light' | 'dark' | 'xlight' | 'regular' | 'prominent' | 'extraDark';
  blurAmount?: number;
  reducedTransparencyFallbackColor?: string;
  children?: React.ReactNode;
};

// Use BlurView from @react-native-community/blur
// The user wants the original blur effect, not a fallback.
const { BlurView } = require('@react-native-community/blur');

export default function BlurViewSafe({
  style,
  blurType = 'dark',
  blurAmount = 10,
  reducedTransparencyFallbackColor,
  children,
}: BlurViewSafeProps) {
  return (
    <BlurView
      style={style}
      blurType={blurType}
      blurAmount={blurAmount}
      reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
    >
      {children}
    </BlurView>
  );
}
