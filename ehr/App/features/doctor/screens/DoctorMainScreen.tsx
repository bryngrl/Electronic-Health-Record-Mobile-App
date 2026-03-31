import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, BackHandler, StatusBar, InteractionManager, TouchableOpacity, Image } from 'react-native';
import { useAppTheme } from '@App/theme/ThemeContext';
import apiClient from '../../../api/apiClient';

// --- DOCTOR FEATURE IMPORTS ---
import DoctorHomeScreen from './DoctorHomeScreen';
import DoctorPatientsScreen from './DoctorPatientsScreen';
import DoctorReportsScreen from './DoctorReportsScreen';
import DoctorUpdatesScreen from './DoctorUpdatesScreen';
import DoctorPatientDetailScreen from './DoctorPatientDetailScreen';
import DoctorSettingsScreen from './DoctorSettingsScreen';
import LoadingOverlay from '@components/LoadingOverlay';

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
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading data...');

  const featureLabelMap: Record<string, string> = {
    DoctorPatientDetail: 'Patient Update',
    VitalSigns: 'Vital Signs',
    PhysicalExam: 'Physical Exam',
    MedicalHistory: 'Medical History',
    LabValues: 'Lab Values',
    IntakeOutput: 'Intake and Output',
    ADL: 'Activities of Daily Living',
    Diagnostics: 'Diagnostics',
    IvsLines: 'IVs and Lines',
    Medication: 'Medication Administration',
    MedicationReconciliation: 'Medication Reconciliation',
  };

  const routeToTypeKey: Record<string, string> = {
    VitalSigns: 'vital-signs',
    PhysicalExam: 'physical-exam',
    MedicalHistory: 'medical-history',
    LabValues: 'lab-values',
    IntakeOutput: 'intake-output',
    ADL: 'adl',
    Diagnostics: 'diagnostics',
    IvsLines: 'ivs-lines',
    Medication: 'medication',
    MedicationReconciliation: 'medical-reconciliation',
  };

  const categoryToTypeKey: Record<string, string> = {
    vital_signs: 'vital-signs',
    physical_exam: 'physical-exam',
    medical_history: 'medical-history',
    lab_values: 'lab-values',
    intake_output: 'intake-output',
    adl: 'adl',
    diagnostics: 'diagnostics',
    ivs_lines: 'ivs-lines',
    medication: 'medication',
    medical_reconciliation: 'medical-reconciliation',
  };

  const getTypeKeyForNavigation = (route: string, params?: any): string | null => {
    if (route === 'DoctorPatientDetail') {
      const category = String(params?.category ?? '').trim();
      return categoryToTypeKey[category] ?? null;
    }
    return routeToTypeKey[route] ?? null;
  };

  const handleNavigation = useCallback(async (route: string, params?: any) => {
    const featureLabel = featureLabelMap[route];
    const patientId = params?.patientId;
    const typeKey = getTypeKeyForNavigation(route, params);
    const shouldPrefetch = !!patientId && !!typeKey && !!featureLabel;

    if (shouldPrefetch) {
      setLoadingMessage(`Loading ${featureLabel}...`);
      setShowLoadingOverlay(true);
      try {
        await Promise.all([
          apiClient.get(`/doctor/patient/${patientId}`),
          apiClient.get(`/doctor/patient/${patientId}/forms/${typeKey}`),
        ]);
      } finally {
        // Keep current behavior of navigating even if prefetch fails.
      }
    }

    if (params) {
      setSelectedPatientData(params);
    }
    setActiveTab(prevTab => {
      if (prevTab !== route) {
        setNavigationHistory(prev => [...prev, route]);
      }
      return route;
    });

    if (shouldPrefetch) {
      InteractionManager.runAfterInteractions(() => {
        setShowLoadingOverlay(false);
      });
    }
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
            return <VitalSignsScreen onBack={handleBack} readOnly={true} patientId={selectedPatientData.patientId} initialPatientName={selectedPatientData.patientName} admissionDate={selectedPatientData.admissionDate} recordId={selectedPatientData.recordId} />;
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

  const isDoctorPatientReadOnlyView = ![
    'DoctorHome',
    'DoctorPatients',
    'DoctorReports',
    'DoctorUpdates',
    'DoctorSettings',
  ].includes(activeTab);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ flex: 1 }}>
          {isDoctorPatientReadOnlyView && (
            <TouchableOpacity
              onPress={handleBack}
              style={{
                position: 'absolute',
                top: 44,
                left: 26,
                zIndex: 30,
                width: 28,
                height: 28,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                source={require('@assets/icons/back_arrow.png')}
                style={{ width: 22, height: 22, tintColor: '#035022' }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
          {getScreenContent()}
        </View>
      </SafeAreaView>
      <LoadingOverlay visible={showLoadingOverlay} message={loadingMessage} />
    </View>
  );
}
