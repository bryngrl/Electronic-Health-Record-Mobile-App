import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from '@features/nurse/Dashboard/screen/HomeScreen';
import DoctorHomeScreen from '@features/doctor/screens/DoctorHomeScreen';
import LoginScreen from '@features/Auth/screen/LoginScreen';
import { ThemeProvider } from './theme/ThemeContext';
import { AuthProvider, useAuth } from '@features/Auth/AuthContext';

const MainApp = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#004d26" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  // Redirect based on role
  if (user.role === 'doctor') {
    return <DoctorHomeScreen />;
  }

  // Default for nurse
  return <HomeScreen />;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <MainApp />
          </SafeAreaView>
        </SafeAreaProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
