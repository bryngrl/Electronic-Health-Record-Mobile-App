import React, { useState } from 'react';
import { ActivityIndicator, View, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from '@features/nurse/Dashboard/screen/HomeScreen';
import DoctorMainScreen from '@features/doctor/screens/DoctorMainScreen';
import LoginScreen from '@features/Auth/screen/LoginScreen';
// Added Admin Screen import
import AdminMainScreen from '@features/Admin/screen/AdminMainScreen'; 
import { ThemeProvider, useAppTheme } from './theme/ThemeContext';
import { AuthProvider, useAuth } from '@features/Auth/AuthContext';
import SplashScreen from '@components/SplashScreen';

const MainApp = () => {
  const { user, isLoading } = useAuth();
  const { theme } = useAppTheme();
  const [splashFinished, setSplashFinished] = useState(Platform.OS !== 'android');

  if (!splashFinished) {
    return (
      <View style={{ flex: 1, backgroundColor: '#035022' }}>
        <SplashScreen onAnimationFinish={() => setSplashFinished(true)} />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color="#004d26" />
      </View>
    );
  }

  // Updated routing logic to include admin
  let content;
  if (!user) {
    content = <LoginScreen />;
  } else if (user.role?.toLowerCase() === 'admin') {
    content = <AdminMainScreen />;
  } else if (user.role?.toLowerCase() === 'doctor') {
    content = <DoctorMainScreen />;
  } else {
    // Defaulting to Nurse/HomeScreen
    content = <HomeScreen />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {content}
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <MainApp />
        </SafeAreaProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}