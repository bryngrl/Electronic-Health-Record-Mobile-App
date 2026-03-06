import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text } from 'react-native';

// Defining types prevents the "implicitly has an 'any' type" error
interface LoginFormProps {
  email: string;
  setEmail: (text: string) => void;
  password: string;
  setPassword: (text: string) => void;
  handleLogin: () => void;
  isSubmitting: boolean;
  containerStyle?: object; // Optional style prop
}

export const LoginForm = ({ 
  email, 
  setEmail, 
  password, 
  setPassword, 
  handleLogin,
  isSubmitting,
  containerStyle 
}: LoginFormProps) => {
  return (
    <View style={[styles.formContainer, containerStyle]}>
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="#A0A0A0"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#A0A0A0"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity 
        style={[styles.loginButton, isSubmitting && { opacity: 0.7 }]} 
        activeOpacity={0.8}
        onPress={handleLogin}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>{isSubmitting ? 'LOGGING IN...' : 'LOG IN'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: { width: '100%' },
  input: {
    backgroundColor: '#ffffff',
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 20,
    marginBottom: 15,
    elevation: 3,
  },
  loginButton: {
    backgroundColor: '#f1b434',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  buttonText: { color: '#004d26', fontWeight: '700', fontSize: 18 },
});