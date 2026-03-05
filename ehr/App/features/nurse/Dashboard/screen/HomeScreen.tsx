import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  BackHandler,
  ActivityIndicator,
} from 'react-native';

import DashboardSummary from '../components/DashboardSummary';
import { DashboardGrid } from '@components/navigation/DashboardGrid';
import BottomNav from '@components/navigation/BottomNav';

/**
 * instructions: to add a new screen that follows the standard folder structure,
 * just add the folder name to this array.
 * pattern: @nurse/[Name]/screen/[Name]Screen
 */
const nurseScreenList = [
  'Search',
  'Calendar',
  'VitalSigns',
  'MedicalHistory',
  'PhysicalExam',
  'LabValues',
  'Diagnostics',
  'MedAdministration',
  'MedicalReconciliation',
  'IvsAndLines',
  'IntakeAndOutput',
];

const autoRegistry = nurseScreenList.reduce((acc, name) => {
  acc[name] = lazy(() => import(`@nurse/${name}/screen/${name}Screen`));
  return acc;
}, {} as any);

/**
 * instructions: if a new file doesn't follow the standard naming pattern
 * or folder structure, add its import path manually here.
 */
const customScreens = {
  Register: lazy(
    () => import('@nurse/PatientRegistration/component/RegisterPatient'),
  ),
  'Demographic Profile': lazy(
    () => import('@nurse/DemographicProfile/screen/DemographicProfileScreen'),
  ),
  Activities: lazy(() => import('@nurse/ADL/screen/ADLMainScreen')),
  EditPatient: lazy(
    () => import('@nurse/EditPatientDetails/screen/EditPatientScreen'),
  ),
};

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('Home');
  const [navigationHistory, setNavigationHistory] = useState<string[]>([
    'Home',
  ]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState<number | null>(null);

  const handleNavigation = useCallback((route: string) => {
    setActiveTab(prevTab => {
      if (prevTab !== route) setNavigationHistory(prev => [...prev, route]);
      return route;
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

  const renderContent = () => {
    if (activeTab === 'Home')
      return <DashboardSummary onNavigate={handleNavigation} />;
    if (activeTab === 'Grid')
      return <DashboardGrid onPressItem={handleNavigation} />;

    const cleanName = activeTab.replace(/\s+/g, '');
    const Screen =
      autoRegistry[cleanName] ||
      customScreens[activeTab as keyof typeof customScreens];

    if (!Screen) return <DashboardSummary onNavigate={handleNavigation} />;

    const screenProps: any = { onBack: handleBack };

    /**
     * instructions: add specific prop logic here for screens
     * that require more than just the default onBack prop.
     */
    if (activeTab === 'Demographic Profile') {
      screenProps.onSelectionChange = setIsSelecting;
      screenProps.onPatientClick = (id: number) => {
        setEditingPatientId(id);
        handleNavigation('EditPatient');
      };
    }
    if (activeTab === 'EditPatient') {
      screenProps.patientId = editingPatientId || 0;
    }

    return (
      <Suspense
        fallback={<ActivityIndicator size="small" style={{ marginTop: 20 }} />}
      >
        <Screen {...screenProps} />
      </Suspense>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.flex1}>{renderContent()}</View>

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
  container: { flex: 1, backgroundColor: '#fff' },
  flex1: { flex: 1 },
});
