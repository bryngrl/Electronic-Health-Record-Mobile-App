import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import apiClient from '@api/apiClient';
import SweetAlert from '@components/SweetAlert';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

// Define the expected route params
type RootStackParamList = {
  ChangePassword: { verifiedEmail: string };
};

type ChangePasswordRouteProp = RouteProp<RootStackParamList, 'ChangePassword'>;

export default function ChangePasswordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<ChangePasswordRouteProp>();
  const { verifiedEmail } = route.params;

  // Form State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Alert State
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setAlert({ visible: true, title, message, type });
  };

  const handleUpdatePassword = async () => {
    // 1. Client-side Validation
    if (!password || !confirmPassword) {
      showAlert('Required', 'Please fill in both password fields.', 'warning');
      return;
    }

    if (password.length < 6) {
      showAlert('Validation', 'Password must be at least 6 characters long.', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Mismatch', 'Passwords do not match. Please check again.', 'error');
      return;
    }

    setIsUpdating(true);
    try {
      // 2. API Call to Laravel
      // Matches the 'updateForgottenPassword' method in your UserController
      const response = await apiClient.post('/auth/update-forgotten-password', {
        email: verifiedEmail,
        password: password,
        password_confirmation: confirmPassword, // Laravel's 'confirmed' rule requires this key
      });

      if (response.status === 200) {
        showAlert(
          'Success',
          'Your password has been updated! You will now be redirected to Login.',
          'success'
        );
        
        // Auto-navigate back to Login after 2.5 seconds
        setTimeout(() => {
          navigation.navigate('Login');
        }, 2500);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to update password. Please try again.';
      showAlert('Update Failed', errorMsg, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerSection}>
            <Text style={styles.title}>New Password</Text>
            <Text style={styles.subtitle}>
              Updating account for: <Text style={styles.emailText}>{verifiedEmail}</Text>
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Min. 6 characters"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Repeat password"
              placeholderTextColor="#999"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
              style={[styles.button, isUpdating && styles.buttonDisabled]}
              onPress={handleUpdatePassword}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Save & Update Database</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              disabled={isUpdating}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SweetAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onConfirm={() => setAlert({ ...alert, visible: false })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  headerSection: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#035022',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  emailText: {
    fontWeight: 'bold',
    color: '#035022',
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#035022',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  cancelText: {
    color: '#666',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});