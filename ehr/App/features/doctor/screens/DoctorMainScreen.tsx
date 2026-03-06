import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, BackHandler } from 'react-native';
import { useAppTheme } from '@App/theme/ThemeContext';

// --- DOCTOR FEATURE IMPORTS ---
import DoctorHomeScreen from './DoctorHomeScreen';
import DoctorPatientsScreen from './DoctorPatientsScreen';
import DoctorReportsScreen from './DoctorReportsScreen';
import DoctorUpdatesScreen from './DoctorUpdatesScreen';
import DoctorPatientDetailScreen from './DoctorPatientDetailScreen';

// --- NURSE SCREENS (RE-USED IN READ-ONLY) ---
import VitalSignsScreen from '../../nurse/VitalSigns/screen/VitalSignsScreen';
import PhysicalExamScreen from '../../nurse/PhysicalExam/screen/PhysicalExamScreen';

export default function DoctorMainScreen() {
  const { theme } = useAppTheme();
  const [activeTab, setActiveTab] = useState('DoctorHome');
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['DoctorHome']);
  const [selectedPatientData, setSelectedPatientData] = useState<{patientId: number, category: string, recordId?: number, patientName?: string} | null>(null);

  const handleNavigation = useCallback((route: string, params?: any) => {
    if (params) {
      setSelectedPatientData(params);
    }
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
      case 'DoctorPatientDetail':
        return selectedPatientData ? (
          <DoctorPatientDetailScreen 
            patientId={selectedPatientData.patientId}
            category={selectedPatientData.category}
            recordId={selectedPatientData.recordId}
            onBack={handleBack}
          />
        ) : null;
      
      // RE-USING NURSE SCREENS IN READ-ONLY MODE
      case 'VitalSigns':
        return selectedPatientData ? (
          <VitalSignsScreen 
            onBack={handleBack}
            readOnly={true}
            patientId={selectedPatientData.patientId}
            initialPatientName={selectedPatientData.patientName}
          />
        ) : null;

      case 'PhysicalExam':
        return selectedPatientData ? (
          <PhysicalExamScreen 
            onBack={handleBack}
            readOnly={true}
            patientId={selectedPatientData.patientId.toString()}
            initialPatientName={selectedPatientData.patientName}
          />
        ) : null;

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
