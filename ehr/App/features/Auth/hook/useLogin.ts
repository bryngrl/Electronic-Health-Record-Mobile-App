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

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert('Error', 'Please fill in all fields', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Attempting login with:', { email, password: '[HIDDEN]' });
      const response = await apiClient.post('/auth/login', {
        username: email,
        password,
      });

      if (__DEV__) {
        console.log('--- LOGIN SUCCESS: RAW BACKEND DATA ---');
        console.log(JSON.stringify(response.data, null, 2));
        console.log('---------------------------------------');
      }

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

      // Extract full_name reliably
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
      // console.log('[Login] Stored email:', userEmail ?? email);

      showToast(`Welcome back, ${finalFullName || email}!`, 'success', 4000);
    } catch (error: any) {
      console.error('Login error full:', error);
      let errorMessage = 'Invalid username or password';

      if (error.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please try again in 3 minutes.';
      } else if (error.response?.data?.detail) {
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
