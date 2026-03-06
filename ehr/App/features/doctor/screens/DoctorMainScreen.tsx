import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, BackHandler } from 'react-native';
import { useAppTheme } from '@App/theme/ThemeContext';

// --- DOCTOR FEATURE IMPORTS ---
import DoctorHomeScreen from './DoctorHomeScreen';
import DoctorPatientsScreen from './DoctorPatientsScreen';
import DoctorReportsScreen from './DoctorReportsScreen';
import DoctorUpdatesScreen from './DoctorUpdatesScreen';

export default function DoctorMainScreen() {
  const { theme } = useAppTheme();
  const [activeTab, setActiveTab] = useState('DoctorHome');
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['DoctorHome']);

  const handleNavigation = useCallback((route: string) => {
    setActiveTab(prevTab => {
      if (prevTab !== route) {
        setNavigationHistory(prev => [...prev, route]);
      }
      return route;
    });
  }, []);

  const handleBack = useCallback(() => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop();
      const previousRoute = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setActiveTab(previousRoute);
      return true;
    }
    return false;
  }, [navigationHistory]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBack,
    );
    return () => backHandler.remove();
  }, [handleBack]);

  const getScreenContent = () => {
    switch (activeTab) {
      case 'DoctorHome':
        return (
          <DoctorHomeScreen 
            onNavigate={handleNavigation} 
            onViewAll={() => handleNavigation('DoctorUpdates')} 
          />
        );
      case 'DoctorPatients':
        return <DoctorPatientsScreen onNavigate={handleNavigation} />;
      case 'DoctorReports':
        return <DoctorReportsScreen onNavigate={handleNavigation} />;
      case 'DoctorUpdates':
        return <DoctorUpdatesScreen onNavigate={handleNavigation} />;
      default:
        return (
          <DoctorHomeScreen 
            onNavigate={handleNavigation} 
            onViewAll={() => handleNavigation('DoctorUpdates')} 
          />
        );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.flex1}>
        {getScreenContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex1: { flex: 1 },
});
