import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  Keyboard,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useForgotPassword } from '../hook/useForgotPassword';
import SweetAlert from '@components/SweetAlert';
import Icon from 'react-native-vector-icons/Ionicons';

interface ForgotPasswordScreenProps {
  onBack: () => void;
}

export default function ForgotPasswordScreen({ onBack }: ForgotPasswordScreenProps) {
  const {
    email,
    setEmail,
    isSubmitting,
    cooldown,
    alertConfig,
    hideAlert,
    handleForgotPassword,
  } = useForgotPassword();

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
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={onBack}
          >
            <Icon name="arrow-back" size={30} color="#035022" />
          </TouchableOpacity>
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
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>Enter your email to receive a reset link.</Text>

            <View style={styles.formContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <TouchableOpacity
                style={[
                  styles.submitButton, 
                  (isSubmitting || cooldown > 0) && { opacity: 0.7 }
                ]}
                activeOpacity={0.8}
                onPress={handleForgotPassword}
                disabled={isSubmitting || cooldown > 0}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting 
                    ? 'SENDING...' 
                    : cooldown > 0 
                      ? `RESEND IN ${cooldown}S` 
                      : 'SEND RESET LINK'
                  }
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.backToLoginButton}
                onPress={onBack}
              >
                <Text style={styles.backToLoginText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <SweetAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onCancel={hideAlert}
        onConfirm={alertConfig.type === 'success' ? onBack : hideAlert}
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
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 20,
    padding: 10,
    zIndex: 10,
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
    // base styles
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
    marginBottom: 30,
    color: '#333',
    fontSize: 16,
    fontFamily: 'AlteHaasGrotesk',
  },
  submitButton: {
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
  backToLoginButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
  backToLoginText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
