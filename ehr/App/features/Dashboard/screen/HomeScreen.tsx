import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import DashboardSummary from '../components/DashboardSummary';
import { DashboardGrid } from '../../../components/navigation/DashboardGrid';
import SearchScreen from '../../Search/screen/SearchScreen';
import CalendarScreen from '../../Calendar/screen/CalendarScreen';

import BottomNav from '../../../components/navigation/BottomNav';

// Corrected import path based on your folder structure
import RegisterPatient from '../../PatientRegistration/component/RegisterPatient';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('Home');

  const handleNavigation = (route: string) => setActiveTab(route);

  const renderPage = () => {
    switch (activeTab) {
      case "Home":
        return <DashboardSummary onNavigate={handleNavigation} />;
      case "Search":
        return <SearchScreen />;
      case "Grid":
        return <DashboardGrid onPressItem={handleNavigation} />;
      case "Calendar":
        return <CalendarScreen />;
      case "Register":
        // 'onBack' is now passed to match the interface in RegisterPatient
        return <RegisterPatient onBack={() => setActiveTab('Home')} />;
      default:
        return <DashboardSummary onNavigate={handleNavigation} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.flex1}>
        {renderPage()}
      </View>
      <BottomNav
        activeRoute={activeTab}
        onNavigate={handleNavigation}
        onAddPatient={() => setActiveTab('Register')}
      />
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