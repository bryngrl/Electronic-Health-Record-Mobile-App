import { useState } from 'react';
import { useWindowDimensions, Alert } from 'react-native';
import apiClient from '../../../api/apiClient';
import { useAuth } from '../AuthContext';

export const useLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { access_token, role, full_name, user_id } = response.data;
      
      await login({
        id: user_id,
        full_name,
        email,
        role
      }, access_token);

      console.log('Login successful as', role);
      // Success redirection is handled by AuthContext change in App.tsx
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.detail || 'Invalid email or password';
      Alert.alert('Login Failed', errorMessage);
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
    handleLogin,
    width,
    height,
    isLandscape,
  };
};
