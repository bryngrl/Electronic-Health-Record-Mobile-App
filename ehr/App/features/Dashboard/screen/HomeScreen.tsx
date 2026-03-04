import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, BackHandler } from 'react-native';
import DashboardSummary from '../components/DashboardSummary';
import { DashboardGrid } from '../../../components/navigation/DashboardGrid';
import SearchScreen from '../../Search/screen/SearchScreen';
import CalendarScreen from '../../Calendar/screen/CalendarScreen';
import BottomNav from '../../../components/navigation/BottomNav';
import RegisterPatient from '../../PatientRegistration/component/RegisterPatient';
import DemographicProfileScreen from '../../DemographicProfile/screen/DemographicProfileScreen';
import VitalSignsScreen from '../../VitalSigns/screen/VitalSignsScreen';
import EditPatientScreen from '../../EditPatientDetails/screen/EditPatientScreen';

import MedicalHistoryScreen from '../../MedicalHistory/screen/MedicalHistoryScreen';
import PhysicalExamScreen from '../../PhysicalExam/screen/PhysicalExamScreen';
import ADLMainScreen from '../../ADL/screen/ADLMainScreen';
import LabValuesScreen from '../../LaboratoryValues/screen/LabValuesScreen';
import DiagnosticsScreen from '../../Diagnostics/screen/DiagnosticsScreen';
import MedAdministrationScreen from '../../MedAdministration/screen/MedAdministrationScreen';
import MedicalReconciliationScreen from '../../MedicalReconciliation/screen/MedicalReconciliationScreen';
import IvsAndLinesScreen from '../../IvsAndLines/screen/IvsAndLinesScreen';

import IntakeAndOutputScreen from '../../IntakeAndOutput/screen/IntakeAndOutputScreen';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('Home');
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['Home']);
  const [isSelecting, setIsSelecting] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState<number | null>(null);

  const handleNavigation = useCallback((route: string) => {
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

  const renderPage = () => {
    switch (activeTab) {
      case 'Home':
        return <DashboardSummary onNavigate={handleNavigation} />;
      case 'Search':
        return <SearchScreen />;
      case 'Grid':
        return <DashboardGrid onPressItem={handleNavigation} />;
      case 'Calendar':
        return <CalendarScreen />;

      case 'Demographic Profile':
        return (
          <DemographicProfileScreen
            onBack={handleBack}
            onSelectionChange={selecting => setIsSelecting(selecting)}
            onPatientClick={id => {
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
        return (
          <MedicalReconciliationScreen onBack={handleBack} />
        );

      case 'IvsAndLines':
        return <IvsAndLinesScreen onBack={handleBack} />;

      case 'Medical Reconciliation':
        return (
          <MedicalReconciliationScreen onBack={handleBack} />
        );

      case 'Intake and Output':
        return <IntakeAndOutputScreen onBack={handleBack} />;

      default:
        return <DashboardSummary onNavigate={handleNavigation} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.flex1}>{renderPage()}</View>

      {activeTab !== 'Demographic Profile' && (
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
