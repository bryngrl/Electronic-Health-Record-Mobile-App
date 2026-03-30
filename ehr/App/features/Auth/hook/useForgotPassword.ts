import { useState, useEffect, useRef } from 'react';
import apiClient from '@api/apiClient';

export const useForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [attempts, setAttempts] = useState(0);
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
      await apiClient.post('/auth/forgot-password', {
        email: email,
        source: 'mobile',
      });

      showAlert(
        'Success',
        '6-digit reset code sent to your email. Please check your inbox.',
        'success'
      );
      setIsCodeSent(true);
      setIsCodeVerified(false);
      setCooldown(60);
      setAttempts(0); 
    } catch (error: any) {
      let errorMessage = 'Failed to send reset code.';

      if (error.response?.status === 429) {
        errorMessage = 'Too many requests. Please try again in 15 minutes.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      showAlert('Request Failed', errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      showAlert('Error', 'Please enter the 6-digit code', 'warning');
      return;
    }

    if (attempts >= 3) {
      showAlert('Error', 'Maximum attempts reached. Please request a new code.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/auth/verify-code', {
        email: email,
        code: code,
      });

      setIsCodeVerified(true);
      setAttempts(0);
      showAlert(
        'Success',
        'Verification code confirmed. You can now set your new password.',
        'success'
      );
    } catch (error: any) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      let errorMessage = 'Invalid verification code.';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      if (newAttempts >= 3) {
        errorMessage += ' Maximum attempts reached. Please request a new code.';
      } else {
        errorMessage += ` Attempt ${newAttempts} of 3.`;
      }

      showAlert('Verification Failed', errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!password) {
      showAlert('Error', 'Please enter your new password', 'warning');
      return;
    }

    if (password.length < 8) {
      showAlert('Error', 'Password must be at least 8 characters long', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Error', 'Passwords do not match', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/auth/reset-password', {
        email: email,
        code: code,
        password: password,
        password_confirmation: confirmPassword,
      });

      showAlert(
        'Success',
        'Your password has been reset successfully. You can now sign in with your new password.',
        'success'
      );
    } catch (error: any) {
      let errorMessage = 'Failed to reset password.';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      showAlert('Reset Failed', errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
    attempts,
    alertConfig,
    hideAlert,
    handleForgotPassword,
    handleVerifyCode,
    handleResetPassword,
  };
};
