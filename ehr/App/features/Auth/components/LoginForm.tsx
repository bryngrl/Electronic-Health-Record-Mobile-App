import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface LoginFormProps {
  email: string;
  setEmail: (text: string) => void;
  password: string;
  setPassword: (text: string) => void;
  handleLogin: () => void;
  isSubmitting: boolean;
  isPasswordVisible: boolean;
  togglePasswordVisibility: () => void;
  containerStyle?: object;
  onForgotPassword: () => void;
}

export const LoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  handleLogin,
  isSubmitting,
  isPasswordVisible,
  togglePasswordVisibility,
  containerStyle,
  onForgotPassword,
}: LoginFormProps) => {
  return (
    <View style={[styles.formContainer, containerStyle]}>
      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        placeholderTextColor="#A0A0A0"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="default"
      />

      {/* Password Label & Input */}
      <Text style={styles.label}>Password</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { paddingRight: 50, marginBottom: 0 }]}
          placeholder="Enter your password"
          placeholderTextColor="#A0A0A0"
          secureTextEntry={!isPasswordVisible}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          style={styles.eyeIcon}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon
            name={isPasswordVisible ? 'eye-off' : 'eye'}
            size={22}
            color="#A0A0A0"
          />
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.loginButton, isSubmitting && { opacity: 0.7 }]}
        activeOpacity={0.8}
        onPress={handleLogin}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? 'SIGNING IN...' : 'SIGN IN'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.forgotPasswordButton}
        onPress={onForgotPassword}
      >
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: { width: '100%' },
  label: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 5,
  },
  input: {
    backgroundColor: '#ffffff',
    height: 45,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 15,
    color: '#333',
    fontSize: 16,
    fontFamily: 'AlteHaasGrotesk',
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#E5FFE8',
    height: 45,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#29A539',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: {
    color: '#035022',
    fontFamily: 'AlteHaasGroteskBold',
    fontSize: 16,
  },
  forgotPasswordButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
  forgotPasswordText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
