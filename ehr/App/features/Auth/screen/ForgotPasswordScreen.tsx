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
    code,
    setCode,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isCodeSent,
    setIsCodeSent,
    isCodeVerified,
    setIsCodeVerified,
    isSubmitting,
    cooldown,
    alertConfig,
    hideAlert,
    handleForgotPassword,
    handleVerifyCode,
    handleResetPassword,
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

  const handleBack = () => {
    if (isCodeVerified) {
      setIsCodeVerified(false);
    } else if (isCodeSent) {
      setIsCodeSent(false);
    } else {
      onBack();
    }
  };

  const renderCodeInput = () => {
    const displayCode = code.padEnd(6, '_');
    return (
      <View style={styles.codeContainer}>
        {displayCode.split('').map((char, index) => (
          <View key={index} style={styles.codeBox}>
            <Text style={styles.codeText}>{char}</Text>
          </View>
        ))}
        <TextInput
          style={styles.hiddenInput}
          value={code}
          onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus={true}
        />
      </View>
    );
  };

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
            onPress={handleBack}
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
            <Text style={styles.title}>
              {isCodeVerified ? 'New Password' : isCodeSent ? 'Verify Code' : 'Forgot Password?'}
            </Text>
            <Text style={styles.subtitle}>
              {isCodeVerified 
                ? 'Please enter and confirm your new password.'
                : isCodeSent 
                  ? 'Enter the 6-digit code sent to your email.' 
                  : 'Enter your email to receive a 6-digit reset code.'}
            </Text>

            <View style={styles.formContainer}>
              {!isCodeSent || isCodeVerified ? (
                <>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={[styles.input, (isCodeSent || isCodeVerified) && { backgroundColor: '#f0f0f0', color: '#888' }]}
                    placeholder="Enter your email"
                    placeholderTextColor="#A0A0A0"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!isCodeSent && !isCodeVerified}
                  />
                </>
              ) : null}

              {isCodeSent && !isCodeVerified && (
                <>
                  <Text style={styles.label}>6-Digit Code</Text>
                  {renderCodeInput()}
                </>
              )}

              {isCodeVerified && (
                <>
                  <Text style={styles.label}>New Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new password"
                    placeholderTextColor="#A0A0A0"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />

                  <Text style={styles.label}>Confirm New Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    placeholderTextColor="#A0A0A0"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </>
              )}

              <TouchableOpacity
                style={[
                  styles.submitButton, 
                  (isSubmitting || (cooldown > 0 && !isCodeSent)) && { opacity: 0.7 }
                ]}
                activeOpacity={0.8}
                onPress={
                  isCodeVerified 
                    ? handleResetPassword 
                    : isCodeSent 
                      ? handleVerifyCode 
                      : handleForgotPassword
                }
                disabled={isSubmitting || (cooldown > 0 && !isCodeSent)}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting 
                    ? 'PROCESSING...' 
                    : isCodeVerified
                      ? 'RESET PASSWORD'
                      : isCodeSent 
                        ? 'VERIFY CODE' 
                        : cooldown > 0 
                          ? `RESEND IN ${cooldown}S` 
                          : 'SEND RESET CODE'
                  }
                </Text>
              </TouchableOpacity>
              
              {!isCodeSent && (
                <TouchableOpacity
                  style={styles.backToLoginButton}
                  onPress={onBack}
                >
                  <Text style={styles.backToLoginText}>Back to Sign In</Text>
                </TouchableOpacity>
              )}

              {isCodeSent && !isCodeVerified && (
                <>
                  {cooldown === 0 ? (
                    <TouchableOpacity
                      style={styles.backToLoginButton}
                      onPress={handleForgotPassword}
                    >
                      <Text style={styles.backToLoginText}>Resend Code</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.backToLoginButton}>
                      <Text style={[styles.backToLoginText, { textDecorationLine: 'none' }]}>
                        Resend code in {cooldown}s
                      </Text>
                    </View>
                  )}
                </>
              )}
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
        onConfirm={alertConfig.type === 'success' ? (isCodeVerified && alertConfig.title === 'Success' && alertConfig.message.includes('reset successfully') ? onBack : hideAlert) : hideAlert}
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    position: 'relative',
  },
  codeBox: {
    width: 40,
    height: 50,
    borderBottomWidth: 2,
    borderBottomColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
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
