import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import DashboardSummary from '../components/DashboardSummary';
import { DashboardGrid } from '@components/navigation/DashboardGrid';
import SearchScreen from '@nurse/Search/screen/SearchScreen';
import CalendarScreen from '@nurse/Calendar/screen/CalendarScreen';
import BottomNav from '@components/navigation/BottomNav';
import RegisterPatient from '@nurse/PatientRegistration/component/RegisterPatient';
import DemographicProfileScreen from '@nurse/DemographicProfile/screen/DemographicProfileScreen';
import VitalSignsScreen from '@nurse/VitalSigns/screen/VitalSignsScreen';
import EditPatientScreen from '@nurse/EditPatientDetails/screen/EditPatientScreen';

import MedicalHistoryScreen from '@nurse/MedicalHistory/screen/MedicalHistoryScreen';
import PhysicalExamScreen from '@nurse/PhysicalExam/screen/PhysicalExamScreen';
import ADLMainScreen from '@nurse/ADL/screen/ADLMainScreen';
import LabValuesScreen from '@nurse/LaboratoryValues/screen/LabValuesScreen';
import DiagnosticsScreen from '@nurse/Diagnostics/screen/DiagnosticsScreen';
import MedAdministrationScreen from '@nurse/MedAdministration/screen/MedAdministrationScreen';
import MedicalReconciliationScreen from '@nurse/MedicalReconciliation/screen/MedicalReconciliationScreen';
import IvsAndLinesScreen from '@nurse/IvsAndLines/screen/IvsAndLinesScreen';
import IntakeAndOutputScreen from '@nurse/IntakeAndOutput/screen/IntakeAndOutputScreen';
import PatientDetailsScreen from '@nurse/PatientDetails/screen/PatientDetailScreen';

const RECENT_FEATURES_KEY = '@recent_features';
const DASHBOARD_ITEM_IDS = [
  'Register',
  'Demographic Profile',
  'MedicalHistory',
  'PhysicalExam',
  'Vital Signs',
  'Intake and Output',
  'Activities',
  'LabValues',
  'Diagnostics',
  'IvsAndLines',
  'Medication Administration',
  'Medical Reconciliation',
  'Medication Reconciliation',
];

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('Home');
  const [navigationHistory, setNavigationHistory] = useState<string[]>([
    'Home',
  ]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState<number | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null,
  );

  const saveRecentFeature = async (featureId: string) => {
    try {
      const saved = await AsyncStorage.getItem(RECENT_FEATURES_KEY);
      let featureIds = saved ? JSON.parse(saved) : [];

      featureIds = featureIds.filter((id: string) => id !== featureId);
      featureIds.unshift(featureId);
      featureIds = featureIds.slice(0, 5);

      await AsyncStorage.setItem(RECENT_FEATURES_KEY, JSON.stringify(featureIds));
    } catch (e) {
      console.error('Failed to save recent feature in HomeScreen', e);
    }
  };

  const handleNavigation = useCallback((route: string) => {
    if (DASHBOARD_ITEM_IDS.includes(route)) {
      saveRecentFeature(route);
    }

    setActiveTab(prevTab => {
      if (prevTab !== route) {
        setNavigationHistory(prev => [...prev, route]);
      }
      return route;
    });
    setIsSelecting(false);
  }, []);

  const handleBack = useCallback(() => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // remove current
      const previousRoute = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setActiveTab(previousRoute);
      return true; // handled
    }
    return false; // let default behavior happen (exit app)
  }, [navigationHistory]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBack,
    );
    return () => backHandler.remove();
  }, [handleBack]);

  // SCREEN CONFIGURATION - ADD NEW SCREENS HERE
  const getScreenContent = () => {
    switch (activeTab) {
      case 'Home':
        return (
          <DashboardSummary
            onNavigate={handleNavigation}
            onPatientSelect={setSelectedPatientId}
          />
        );
      case 'Search':
        return (
          <SearchScreen
            onNavigate={handleNavigation}
            onPatientSelect={setSelectedPatientId}
          />
        );
      case 'Dashboard':
        return <DashboardGrid onPressItem={handleNavigation} />;
      case 'Calendar':
        return <CalendarScreen />;
      case 'Demographic Profile':
        return (
          <DemographicProfileScreen
            onBack={handleBack}
            onSelectionChange={setIsSelecting}
            onPatientClick={id => {
              setSelectedPatientId(id);
              handleNavigation('PatientDetail');
            }}
          />
        );
      case 'PatientDetail':
        return (
          <PatientDetailsScreen
            patientId={selectedPatientId || 0}
            onBack={handleBack}
            onEdit={id => {
              setEditingPatientId(id);
              handleNavigation('EditPatient');
            }}
          />
        );
      case 'EditPatient':
        return (
          <EditPatientScreen
            patientId={editingPatientId || 0}
            onBack={handleBack}
          />
        );
      case 'Vital Signs':
        return <VitalSignsScreen onBack={handleBack} />;
      case 'Register':
        return <RegisterPatient onBack={handleBack} />;
      case 'MedicalHistory':
        return <MedicalHistoryScreen onBack={handleBack} />;
      case 'PhysicalExam':
        return <PhysicalExamScreen onBack={handleBack} />;
      case 'Activities':
        return <ADLMainScreen onBack={handleBack} />;
      case 'LabValues':
        return <LabValuesScreen onBack={handleBack} />;
      case 'Diagnostics':
        return <DiagnosticsScreen onBack={handleBack} />;
      case 'Medication Administration':
        return <MedAdministrationScreen onBack={handleBack} />;
      case 'Medication Reconciliation':
      case 'Medical Reconciliation': // Alias for Medical Reconciliation
        return <MedicalReconciliationScreen onBack={handleBack} />;
      case 'IvsAndLines':
        return <IvsAndLinesScreen onBack={handleBack} />;
      case 'Intake and Output':
        return <IntakeAndOutputScreen onBack={handleBack} />;
      default:
        return <DashboardSummary onNavigate={handleNavigation} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.flex1, !isSelecting && { paddingBottom: 70 }]}>
        {getScreenContent()}
      </View>

      {!isSelecting && (
        <BottomNav
          activeRoute={activeTab}
          onNavigate={handleNavigation}
          onAddPatient={() => handleNavigation('Register')}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex1: {
    flex: 1,
  },
});
