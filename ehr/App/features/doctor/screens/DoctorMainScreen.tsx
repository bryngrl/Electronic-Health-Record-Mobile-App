import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, BackHandler, StatusBar } from 'react-native';
import { useAppTheme } from '@App/theme/ThemeContext';

// --- DOCTOR FEATURE IMPORTS ---
import DoctorHomeScreen from './DoctorHomeScreen';
import DoctorPatientsScreen from './DoctorPatientsScreen';
import DoctorReportsScreen from './DoctorReportsScreen';
import DoctorUpdatesScreen from './DoctorUpdatesScreen';
import DoctorPatientDetailScreen from './DoctorPatientDetailScreen';
import DoctorSettingsScreen from './DoctorSettingsScreen';

// --- NURSE SCREENS (RE-USED IN READ-ONLY) ---
import VitalSignsScreen from '../../nurse/VitalSigns/screen/VitalSignsScreen';
import PhysicalExamScreen from '../../nurse/PhysicalExam/screen/PhysicalExamScreen';
import MedicalHistoryScreen from '../../nurse/MedicalHistory/screen/MedicalHistoryScreen'; 
import IntakeAndOutputScreen from '../../nurse/IntakeAndOutput/screen/IntakeAndOutputScreen';
import LabValuesScreen from '../../nurse/LaboratoryValues/screen/LabValuesScreen';
import ADLScreen from '../../nurse/ADL/screen/ADLMainScreen';
import DiagnosticsScreen from '../../nurse/Diagnostics/screen/DiagnosticsScreen';
import IvsAndLinesScreen from '../../nurse/IvsAndLines/screen/IvsAndLinesScreen';
import MedAdministrationScreen from '../../nurse/MedAdministration/screen/MedAdministrationScreen';
import MedReconciliationScreen from '../../nurse/MedicalReconciliation/screen/MedicalReconciliationScreen';


export default function DoctorMainScreen() {
  const { theme, isDarkMode } = useAppTheme();
  const [activeTab, setActiveTab] = useState('DoctorHome');
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['DoctorHome']);
  const [selectedPatientData, setSelectedPatientData] = useState<any>(null);

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
    const bh = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => bh.remove();
  }, [handleBack]);

  const getScreenContent = () => {
    if (activeTab === 'DoctorHome') return <DoctorHomeScreen onNavigate={handleNavigation} onViewAll={() => handleNavigation('DoctorUpdates')} />;
    if (activeTab === 'DoctorPatients') return <DoctorPatientsScreen onNavigate={handleNavigation} />;
    if (activeTab === 'DoctorReports') return <DoctorReportsScreen onNavigate={handleNavigation} />;
    if (activeTab === 'DoctorUpdates') return <DoctorUpdatesScreen onNavigate={handleNavigation} onBack={handleBack} />;
    if (activeTab === 'DoctorSettings') return <DoctorSettingsScreen onNavigate={handleNavigation} />;
    
    if (!selectedPatientData) return <DoctorHomeScreen onNavigate={handleNavigation} onViewAll={() => handleNavigation('DoctorUpdates')} />;

    switch (activeTab) {
        case 'DoctorPatientDetail':
            return <DoctorPatientDetailScreen patientId={selectedPatientData.patientId} category={selectedPatientData.category} onBack={handleBack} />;
        case 'VitalSigns':
            return <VitalSignsScreen onBack={handleBack} readOnly={true} patientId={selectedPatientData.patientId} initialPatientName={selectedPatientData.patientName} admissionDate={selectedPatientData.admissionDate} />;
        case 'PhysicalExam':
            return <PhysicalExamScreen onBack={handleBack} readOnly={true} patientId={selectedPatientData.patientId.toString()} initialPatientName={selectedPatientData.patientName} admissionDate={selectedPatientData.admissionDate} />;
        case 'MedicalHistory':
            return <MedicalHistoryScreen onBack={handleBack} readOnly={true} patientId={selectedPatientData.patientId} initialPatientName={selectedPatientData.patientName} admissionDate={selectedPatientData.admissionDate} />;
        case 'LabValues':
            return <LabValuesScreen onBack={handleBack} readOnly={true} patientId={selectedPatientData.patientId} initialPatientName={selectedPatientData.patientName} admissionDate={selectedPatientData.admissionDate} />;
        case 'IntakeOutput':
            return <IntakeAndOutputScreen onBack={handleBack} readOnly={true} patientId={selectedPatientData.patientId} initialPatientName={selectedPatientData.patientName} admissionDate={selectedPatientData.admissionDate} />;
        case 'ADL':
            return <ADLScreen 
                onBack={handleBack} 
                readOnly={true} 
                patientId={selectedPatientData.patientId} 
                initialPatientName={selectedPatientData.patientName} 
                admissionDate={selectedPatientData.admissionDate}
                recordId={selectedPatientData.recordId}
                recordDate={selectedPatientData.recordDate}
            />;
        case 'Diagnostics':
            return <DiagnosticsScreen onBack={handleBack} readOnly={true} patientId={selectedPatientData.patientId} initialPatientName={selectedPatientData.patientName} admissionDate={selectedPatientData.admissionDate} />;
        case 'IvsLines':
            return <IvsAndLinesScreen onBack={handleBack} readOnly={true} patientId={selectedPatientData.patientId} initialPatientName={selectedPatientData.patientName} admissionDate={selectedPatientData.admissionDate} />;
        case 'Medication':
            return <MedAdministrationScreen onBack={handleBack} readOnly={true} patientId={selectedPatientData.patientId} initialPatientName={selectedPatientData.patientName} admissionDate={selectedPatientData.admissionDate} />;
        case 'MedicationReconciliation':
            return <MedReconciliationScreen onBack={handleBack} readOnly={true} patientId={selectedPatientData.patientId} initialPatientName={selectedPatientData.patientName} admissionDate={selectedPatientData.admissionDate} />;
        default:
            return <DoctorHomeScreen onNavigate={handleNavigation} onViewAll={() => handleNavigation('DoctorUpdates')} />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ flex: 1 }}>
          {getScreenContent()}
        </View>
      </SafeAreaView>
    </View>
  );
}
