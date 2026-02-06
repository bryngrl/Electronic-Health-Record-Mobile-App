import React, { useState } from 'react';
import { 
  StyleSheet, View, TouchableWithoutFeedback, 
  useWindowDimensions, SafeAreaView 
} from 'react-native';
import { Header } from '../../../components/Header';
import { Sidebar } from '../../../components/Sidebar';
import { DashboardGrid } from '../components/DashboardGrid';
import RegisterScreen from '../../PatientRegistration/screen/RegistrationScreen';

export default function HomeScreen() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");
  const { width } = useWindowDimensions();

  const handleNavigation = (route: string) => {
    setActiveTab(route);
    setIsMenuOpen(false);
  };

  const renderPage = () => {
    if (activeTab === "Register") {
      // Pass onBack to handle the 'BACK' button tap
      return <RegisterScreen onBack={() => setActiveTab("Home")} />;
    }
    return <DashboardGrid onPressItem={handleNavigation} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header name="Robles" role="SN" onMenuPress={() => setIsMenuOpen(true)} />
      <View style={styles.flex1}>{renderPage()}</View>
      
      {isMenuOpen && (
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => setIsMenuOpen(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>
          <View style={[styles.sidebarWrapper, { width: width * 0.75 }]}>
            <Sidebar activeRoute={activeTab} onNavigate={handleNavigation} onLogout={() => {}} />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  padding: { padding: 0 },
  flex1: { flex: 1 , width: '100%'},
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 1000 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sidebarWrapper: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#fff', elevation: 16 }
});