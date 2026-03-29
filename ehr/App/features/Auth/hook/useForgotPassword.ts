import { useState, useEffect, useRef } from 'react';
import apiClient from '@api/apiClient';

export const useForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setTimeout(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [cooldown]);

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

  const handleForgotPassword = async () => {
    if (cooldown > 0) {
      showAlert('Wait', `Please wait ${cooldown} seconds before trying again.`, 'warning');
      return;
    }

    if (!email) {
      showAlert('Error', 'Please enter your email address', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert('Error', 'Please enter a valid email address', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/auth/forgot-password', {
        email: email,
        source: 'mobile',
      });

      showAlert(
        'Success',
        'We have emailed your password reset link. Please check your email.',
        'success'
      );
      setCooldown(60); // Start 60s local cooldown
    } catch (error: any) {
      console.error('Forgot password error:', error);
      let errorMessage = 'Failed to send password reset link.';

      if (error.response?.status === 429) {
        errorMessage = 'Too many requests. Please try again in 15 minutes.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showAlert('Request Failed', errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    email,
    setEmail,
    isSubmitting,
    cooldown,
    alertConfig,
    hideAlert,
    handleForgotPassword,
  };
};
