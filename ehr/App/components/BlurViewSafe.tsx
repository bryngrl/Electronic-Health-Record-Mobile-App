import React from 'react';
import {
  NativeModules,
  Platform,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';

type BlurViewSafeProps = {
  style?: StyleProp<ViewStyle>;
  blurType?: string;
  blurAmount?: number;
  reducedTransparencyFallbackColor?: string;
  children?: React.ReactNode;
};

let NativeBlurView: any = null;
try {
  const hasAndroidManager =
    !!NativeModules?.BlurViewManager ||
    !!NativeModules?.RNCBlurView ||
    !!NativeModules?.RNBlurView;

  if (Platform.OS === 'ios' || hasAndroidManager) {
    NativeBlurView = require('@react-native-community/blur').BlurView;
  }
} catch {
  NativeBlurView = null;
}

export default function BlurViewSafe({
  style,
  blurType,
  blurAmount,
  reducedTransparencyFallbackColor,
  children,
}: BlurViewSafeProps) {
  if (NativeBlurView) {
    return (
      <NativeBlurView
        style={style}
        blurType={blurType}
        blurAmount={blurAmount}
        reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
      >
        {children}
      </NativeBlurView>
    );
  }

  return (
    <View
      style={[
        style,
        {
          backgroundColor:
            reducedTransparencyFallbackColor ?? 'rgba(0,0,0,0.45)',
        },
      ]}
    >
      {children}
    </View>
  );
}
