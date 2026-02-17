import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import DashboardSummary from '../components/DashboardSummary';
import { DashboardGrid } from '../../../components/navigation/DashboardGrid';
import SearchScreen from '../../Search/screen/SearchScreen';
import CalendarScreen from '../../Calendar/screen/CalendarScreen';
import BottomNav from '../../../components/navigation/BottomNav';
import RegisterPatient from '../../PatientRegistration/component/RegisterPatient';

// FIXED PATH: Replaced ../../../ with ../../ to resolve the module error
import DemographicProfileScreen from '../../DemographicProfile/screen/DemographicProfileScreen';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('Home');
  // New state to hide/show the bottom navigation bar
  const [isSelectingInProfile, setIsSelectingInProfile] = useState(false);

  const handleNavigation = (route: string) => {
    setActiveTab(route);
    setIsSelectingInProfile(false); // Reset when navigating away
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
      case 'Demographic Profile':
        return (
          <DemographicProfileScreen
            onBack={() => setActiveTab('Grid')}
            onSelectionChange={selecting => setIsSelectingInProfile(selecting)}
          />
        );
      default:
        return <DashboardSummary onNavigate={handleNavigation} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.flex1}>{renderPage()}</View>

      {/* HIDE BottomNav if:
        1. We are on the Demographic Profile screen AND 
        2. A patient is currently selected/held.
      */}
      {!(activeTab === 'Demographic Profile' && isSelectingInProfile) && (
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
  container: { flex: 1, backgroundColor: '#fff' },
  flex1: { flex: 1 },
});
