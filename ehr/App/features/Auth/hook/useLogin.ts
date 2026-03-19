import { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import apiClient from '@api/apiClient';
import { useAuth } from '../AuthContext';
import { useToast } from '@App/context/ToastContext';

export const useLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info' | 'delete';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const { login } = useAuth();
  const { showToast } = useToast();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' | 'delete' = 'info',
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  /**
   * Handle Standard Login
   */
  const handleLogin = async () => {
    if (!email || !password) {
      showAlert('Error', 'Please fill in all fields', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/auth/login', {
        username: email,
        password,
      });

      const {
        access_token,
        role,
        full_name,
        name,
        user_id,
        id,
        email: userEmail,
        ...restOfUserDetails
      } = response.data;

      const finalFullName = full_name || name || restOfUserDetails.user?.full_name || restOfUserDetails.user?.name;
      const finalId = user_id || id || restOfUserDetails.user?.id;

      await login(
        {
          id: finalId,
          full_name: finalFullName,
          email: userEmail ?? email,
          role,
          ...restOfUserDetails,
        },
        access_token,
      );

      showToast(`Welcome back, ${finalFullName || email}!`, 'success', 4000);
    } catch (error: any) {
      let errorMessage = 'Invalid username or password';

      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          errorMessage = detail
            .map((err: any) => `${err.loc.join('.')}: ${err.msg}`)
            .join('\n');
        } else if (typeof detail === 'string') {
          errorMessage = detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      showAlert('Login Failed', errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle Forgot Password Flow
   * 1. Verifies if email exists in Laravel DB
   * 2. Navigates to ChangePasswordScreen when account exists
   */
  const handleForgotPassword = async (navigation: {
    navigate: (route: string, params?: Record<string, unknown>) => void;
  }) => {
    if (!email) {
      showAlert('Email Required', 'Please enter your email address to verify your account.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      // Endpoint matches the verifyAccountForReset method in Laravel UserController
      const response = await apiClient.post('/auth/verify-account', { email });

      if (response.data.exists) {
        navigation.navigate('ChangePassword', { verifiedEmail: email });
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'We could not find an account with that email.';
      showAlert('Account Not Found', msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
    handleForgotPassword, // Exported function
    width,
    height,
    isLandscape,
  };
};