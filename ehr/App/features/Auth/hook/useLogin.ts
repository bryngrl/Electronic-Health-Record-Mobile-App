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
      console.log('Attempting login with:', { email, password: '[HIDDEN]' });
      const response = await apiClient.post('/auth/login', { username: email, password });

      console.log('Login response:', response.data);
      const { access_token, role, full_name, user_id, email: userEmail } = response.data;

      await login({ id: user_id, full_name, email: userEmail ?? email, role }, access_token);
      console.log('[Login] Stored email:', userEmail ?? email);

      showToast(`Welcome back, ${full_name || email}!`, 'success', 4000);
    } catch (error: any) {
      console.error('Login error full:', error);
      let errorMessage = 'Invalid username or password';

      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          errorMessage = detail.map((err: any) => `${err.loc.join('.')}: ${err.msg}`).join('\n');
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
