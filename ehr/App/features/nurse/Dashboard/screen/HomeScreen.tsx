import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, BackHandler } from 'react-native';

// --- NURSE FEATURE IMPORTS ---
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

// --- DOCTOR FEATURE IMPORTS ---
import DoctorHomeScreen from '@features/doctor/screens/DoctorHomeScreen';
import DoctorPatientsScreen from '@features/doctor/screens/DoctorPatientsScreen';
import DoctorReportsScreen from '@features/doctor/screens/DoctorReportsScreen';
import DoctorUpdatesScreen from '@features/doctor/screens/DoctorUpdatesScreen';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('Home');
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['Home']);
  const [isSelecting, setIsSelecting] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState<number | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  const handleNavigation = useCallback((route: string) => {
    // Standardize route names for doctor internal nav
    let targetRoute = route;
    if (route === 'Doctors') targetRoute = 'Doctor';
    
    setActiveTab(prevTab => {
      if (prevTab !== targetRoute) {
        setNavigationHistory(prev => [...prev, targetRoute]);
      }
      return targetRoute;
    });
    setIsSelecting(false);
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
      // NURSE SCREENS
      case 'Home':
        return <DashboardSummary onNavigate={handleNavigation} onPatientSelect={setSelectedPatientId} />;
      case 'Search':
        return <SearchScreen onNavigate={handleNavigation} onPatientSelect={setSelectedPatientId} />;
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
        return <EditPatientScreen patientId={editingPatientId || 0} onBack={handleBack} />;
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
      case 'Medical Reconciliation':
        return <MedicalReconciliationScreen onBack={handleBack} />;
      case 'IvsAndLines':
        return <IvsAndLinesScreen onBack={handleBack} />;
      case 'Intake and Output':
        return <IntakeAndOutputScreen onBack={handleBack} />;

      // DOCTOR SCREENS
      case 'Doctor':
      case 'Doctors': // Alias to support internal nav
        return <DoctorHomeScreen onBack={handleBack} onNavigate={handleNavigation} />;
      case 'DoctorPatients':
        return <DoctorPatientsScreen onNavigate={handleNavigation} />;
      case 'DoctorReports':
        return <DoctorReportsScreen onNavigate={handleNavigation} />;
      case 'DoctorUpdates':
        return <DoctorUpdatesScreen onNavigate={handleNavigation} />;

      default:
        return <DashboardSummary onNavigate={handleNavigation} />;
    }
  };

  const isDoctorRoute = activeTab.startsWith('Doctor');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.flex1}>{getScreenContent()}</View>

      {!isSelecting && !isDoctorRoute && (
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
  container: { flex: 1, backgroundColor: '#fff' },
  flex1: { flex: 1 },
});
