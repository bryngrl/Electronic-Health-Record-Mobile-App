import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Platform,
  StatusBar,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLogin } from '../hook/useLogin';
import { LoginForm } from '../components/LoginForm';
import SweetAlert from '@components/SweetAlert';

export default function LoginScreen() {
  const navigation = useNavigation<any>();

  const {
    email,
    setEmail,
    password,
    setPassword,
    isSubmitting,
    isPasswordVisible,
    togglePasswordVisibility,
    alertConfig,
    hideAlert,
    handleLogin,
    handleForgotPassword, // Function from updated useLogin.ts
  } = useLogin();

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false),
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top Section - Logo */}
        <View
          style={[
            styles.logoContainer,
            isKeyboardVisible && styles.logoContainerKeyboard,
          ]}
        >
          <Image
            source={require('@assets/icons/ehr_logo.png')}
            fadeDuration={0}
            style={[
              styles.logo,
              isKeyboardVisible ? styles.logoSmall : styles.logoLarge,
            ]}
            resizeMode="contain"
          />
        </View>

        {/* Bottom Section - Form Card */}
        <View style={styles.bottomSheet}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Welcome !</Text>
            <Text style={styles.subtitle}>Sign in to your account.</Text>

            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              handleLogin={handleLogin}
              isSubmitting={isSubmitting}
              isPasswordVisible={isPasswordVisible}
              togglePasswordVisibility={togglePasswordVisibility}
            />

            {/* Forgot Password Trigger */}
            <TouchableOpacity
              onPress={() => handleForgotPassword(navigation)}
              style={styles.forgotPasswordContainer}
              disabled={isSubmitting}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <SweetAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onCancel={hideAlert}
        onConfirm={hideAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginTop: 40,
  },
  logoContainerKeyboard: {
    flex: 0.4,
    paddingTop: 10,
  },
  logoLarge: {
    width: 200,
    height: 200,
  },
  logoSmall: {
    width: 80,
    height: 80,
  },
  logo: {
    // Base styles inherited from logoLarge/Small
  },
  bottomSheet: {
    marginTop: 40,
    backgroundColor: '#035022',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 40,
    paddingTop: 35,
    paddingBottom: 20,
    flex: 2,
  },
  title: {
    paddingTop: 25,
    color: '#ffffff',
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 35,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 15,
    paddingVertical: 10,
  },
  forgotPasswordText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
    opacity: 0.9,
  },
});