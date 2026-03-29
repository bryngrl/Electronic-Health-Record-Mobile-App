import React, { useState } from 'react';
import { ActivityIndicator, View, Platform, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from '@features/nurse/Dashboard/screen/HomeScreen';
import DoctorMainScreen from '@features/doctor/screens/DoctorMainScreen';
import LoginScreen from '@features/Auth/screen/LoginScreen';
import ForgotPasswordScreen from '@features/Auth/screen/ForgotPasswordScreen';
import AdminMainScreen from '@features/Admin/screen/AdminMainScreen';
import { ThemeProvider, useAppTheme } from './theme/ThemeContext';
import { AuthProvider, useAuth } from '@features/Auth/AuthContext';
import SplashScreen from '@components/SplashScreen';
import { ToastProvider } from './context/ToastContext';
import useNetworkMonitor from './hooks/useNetworkMonitor';

const NetworkMonitor = () => {
  useNetworkMonitor();
  return null;
};

const MainApp = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { theme } = useAppTheme();
  const [currentScreen, setCurrentScreen] = useState<'Login' | 'ForgotPassword'>('Login');
  const [splashFinished, setSplashFinished] = useState(
    Platform.OS !== 'android',
  );

  const nextScreen = !user ? 'Login' : 'Home';

  const role = user?.role?.toLowerCase();
  let content;

  if (authLoading) {
    content = (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator size="large" color="#004d26" />
      </View>
    );
  } else if (!user) {
    if (currentScreen === 'ForgotPassword') {
      content = <ForgotPasswordScreen onBack={() => setCurrentScreen('Login')} />;
    } else {
      content = <LoginScreen onForgotPassword={() => setCurrentScreen('ForgotPassword')} />;
    }
  } else if (role === 'nurse') {
    content = <HomeScreen />;
  } else if (role === 'doctor') {
    content = <DoctorMainScreen />;
  } else if (role === 'admin') {
    content = <AdminMainScreen />;
  } else {
    content = <LoginScreen onForgotPassword={() => setCurrentScreen('ForgotPassword')} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Main Content inside SafeAreaView - This stays stable */}
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        {content}
      </SafeAreaView>

      {/* SplashScreen Overlay - Covers everything until finished */}
      {!splashFinished && (
        <View style={StyleSheet.absoluteFill}>
          <SplashScreen
            onAnimationFinish={() => setSplashFinished(true)}
            nextScreen={authLoading ? undefined : nextScreen}
          />
        </View>
      )}
    </View>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <ToastProvider>
            <NetworkMonitor />
            <MainApp />
          </ToastProvider>
        </SafeAreaProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
