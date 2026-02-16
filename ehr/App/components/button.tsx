import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  // Ensure 'variant' is included in the interface to fix the ts(2322) error
  variant?: 'outlined' | 'gradient'; 
}

const CustomButton = ({ title, onPress, style }: ButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableOpacity 
      onPress={onPress} 
      onPressIn={() => setIsPressed(true)}  // Gradient on touch (mobile "hover")
      onPressOut={() => setIsPressed(false)} // Outlined on release
      activeOpacity={0.9}
      style={[styles.container, style]}
    >
      {isPressed ? (
        <View style={styles.shadowWrapper}>
          <LinearGradient
            colors={['#80C342', '#004d26']}
            style={styles.gradientButton}
          >
            <Text style={styles.gradientText}>{title}</Text>
          </LinearGradient>
        </View>
      ) : (
        <View style={styles.outlinedButton}>
          <Text style={styles.outlinedText}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { minWidth: 120 },
  outlinedButton: {
    borderWidth: 2,
    borderColor: '#004d26',
    backgroundColor: '#E8F5E9',
    borderRadius: 50,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlinedText: { color: '#004d26', fontWeight: 'bold', fontSize: 15 },
  shadowWrapper: {
    shadowColor: '#004d26',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 50,
    elevation: 10,
  },
  gradientButton: {
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15},
});

export default CustomButton;