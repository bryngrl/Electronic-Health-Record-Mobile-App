import { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import apiClient from '@api/apiClient';
import { useAuth } from '../AuthContext';

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
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' | 'delete' = 'info') => {
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

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert('Error', 'Please fill in all fields', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Attempting login with:', { email, password: '***' });
      
      // Send as JSON body instead of query parameters for better security and reliability
      const response = await apiClient.post('/auth/login', {
        email: email.trim(),
        password: password
      });

      console.log('Login response:', response.data);
      const { access_token, role, full_name, user_id } = response.data;

      await login(
        {
          id: user_id,
          full_name,
          email: email.trim(),
          role,
        },
        access_token,
      );

      console.log('Login successful as', role);
    } catch (error: any) {
      console.error('Login error detail:', error);
      let errorMessage = 'Invalid email or password';

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401) {
          errorMessage = 'The email or password you entered is incorrect.';
        } else if (error.response.status === 404) {
          errorMessage = 'Login service not found. Please contact support.';
        } else if (error.response.data?.detail) {
          const detail = error.response.data.detail;
          errorMessage = typeof detail === 'string' ? detail : JSON.stringify(detail);
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message;
      }

      showAlert('Login Failed', errorMessage, 'error');
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
    width,
    height,
    isLandscape,
  };
};
