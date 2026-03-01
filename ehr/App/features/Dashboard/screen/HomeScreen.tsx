import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import DashboardSummary from '../components/DashboardSummary';
import { DashboardGrid } from '../../../components/navigation/DashboardGrid';
import SearchScreen from '../../Search/screen/SearchScreen';
import CalendarScreen from '../../Calendar/screen/CalendarScreen';
import BottomNav from '../../../components/navigation/BottomNav';
import RegisterPatient from '../../PatientRegistration/component/RegisterPatient';
import DemographicProfileScreen from '../../DemographicProfile/screen/DemographicProfileScreen';
import VitalSignsScreen from '../../VitalSigns/screen/VitalSignsScreen';

import MedicalHistoryScreen from '../../MedicalHistory/screen/MedicalHistoryScreen';
import PhysicalExamScreen from '../../PhysicalExam/screen/PhysicalExamScreen';
import ADLMainScreen from '../../ADL/screen/ADLMainScreen';
import LabValuesScreen from '../../LaboratoryValues/screen/LabValuesScreen';
import DiagnosticsScreen from '../../Diagnostics/screen/DiagnosticsScreen';
import MedAdministrationScreen from '../../MedAdministration/screen/MedAdministrationScreen';
import MedicalReconciliationScreen from '../../MedicalReconciliation/screen/MedicalReconciliationScreen';
import IvsAndLinesScreen from '../../IvsAndLines/screen/IvsAndLinesScreen';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('Home');
  const [isSelecting, setIsSelecting] = useState(false);

  const handleNavigation = (route: string) => {
    setActiveTab(route);
    setIsSelecting(false); // Reset selection state when navigating
  };

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
      case 'Register':
        return <RegisterPatient onBack={() => setActiveTab('Home')} />;

      // Pass the onSelectionChange prop to detect when to hide BottomNav
      case 'Demographic Profile':
        return (
          <DemographicProfileScreen
            onBack={() => setActiveTab('Grid')}
            onSelectionChange={selecting => setIsSelecting(selecting)}
          />
        );

      case 'Vital Signs':
        return <VitalSignsScreen onBack={() => setActiveTab('Grid')} />;

      case 'Register':
        return <RegisterPatient onBack={() => setActiveTab('Home')} />;
      case 'MedicalHistory':
        return <MedicalHistoryScreen onBack={() => setActiveTab('Grid')} />;
      case 'PhysicalExam':
        return <PhysicalExamScreen onBack={() => setActiveTab('Grid')} />;
      case 'Activities':
        return <ADLMainScreen onBack={() => setActiveTab('Grid')} />;
      case 'LabValues':
        return <LabValuesScreen onBack={() => setActiveTab('Grid')} />;
      case 'Diagnostics':
        return <DiagnosticsScreen onBack={() => setActiveTab('Grid')} />;
      case 'Medication Administration':
        return <MedAdministrationScreen onBack={() => setActiveTab('Grid')} />;
      case 'Medication Reconciliation':
        return <MedicalReconciliationScreen onBack={() => setActiveTab('Grid')} />;
      case 'IvsAndLines':
        return <IvsAndLinesScreen onBack={() => setActiveTab('Grid')} />;

      default:
        return <DashboardSummary onNavigate={handleNavigation} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.flex1}>{renderPage()}</View>

      {/* Logic: Hide BottomNav if we are in Demographic Profile 
          AND the user has selected/held a patient.
      */}
      {!(activeTab === 'Demographic Profile' && isSelecting) && (
        <BottomNav
          activeRoute={activeTab === 'Demographic Profile' ? 'Grid' : activeTab}
          onNavigate={handleNavigation}
          onAddPatient={() => setActiveTab('Register')}
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
