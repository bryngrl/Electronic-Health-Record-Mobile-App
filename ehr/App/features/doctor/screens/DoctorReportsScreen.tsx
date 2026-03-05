import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AccountModal } from '../../../components/AccountModal';
import PatientSearchBar from '../../../components/PatientSearchBar';

const DoctorReportsScreen = ({ onNavigate }: { onNavigate: (route: string) => void }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [patientName, setPatientName] = useState('');
  const [scrollEnabled, setScrollEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={scrollEnabled}
      >
        {/* Header - Consistent with Home */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Reports</Text>
            <Text style={styles.date}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Icon name="keyboard-arrow-down" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Dynamic Search Bar with Dropdown */}
        <PatientSearchBar
          onPatientSelect={(id, name) => {
            setSelectedPatientId(id);
            setPatientName(name);
          }}
          onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
          initialPatientName={patientName}
          label="" 
          placeholder="Search Patients"
          containerStyle={styles.searchBarContainer}
          inputBarStyle={styles.searchBarWrapper}
        />

        {/* Conditional Content based on selection */}
        {!selectedPatientId ? (
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>Choose Patient to generate report.</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.generateButton}
            onPress={() => console.log('Generating PDF for:', selectedPatientId)}
            activeOpacity={0.7}
          >
            <Text style={styles.generateText}>GENERATE PDF</Text>
          </TouchableOpacity>
        )}

        <View style={styles.blankSection} />

      </ScrollView>

      {/* Doctor Internal Bottom Nav */}
      <View style={styles.bottomNav}>
        <NavItem label="Home" icon={require('../../../../assets/doctors-page/doctor-home.png')} onPress={() => onNavigate('Doctors')} />
        <NavItem label="Patients" icon={require('../../../../assets/doctors-page/doctor-patients.png')} onPress={() => onNavigate('DoctorPatients')} />
        <NavItem label="Reports" icon={require('../../../../assets/doctors-page/doctor-reports.png')} active />
        <NavItem label="Settings" icon={require('../../../../assets/doctors-page/doctor-settings.png')} />
      </View>

      <AccountModal visible={modalVisible} onClose={() => setModalVisible(false)} onLogout={() => setModalVisible(false)} />
    </SafeAreaView>
  );
};

const NavItem = ({ label, icon, active, onPress }: any) => (
  <TouchableOpacity onPress={onPress} style={styles.navItemWrapper}>
    <View style={[styles.navItem, active && styles.activeNavItem]}>
      <Image source={icon} style={[styles.navIconImage, active && { tintColor: '#29A539' }]} resizeMode="contain" />
      <Text style={[styles.navLabel, active && { color: '#29A539' }]}>{label}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { paddingHorizontal: 25, paddingBottom: 120, paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  welcome: { fontSize: 35, color: '#035022', fontFamily: 'MinionPro-SemiboldItalic' },
  date: { fontSize: 14, color: '#B2B2B2', marginTop: 4, fontWeight: 'bold' },
  searchBarContainer: { marginBottom: 10, zIndex: 999 },
  searchBarWrapper: {
    backgroundColor: '#FFF', borderRadius: 25, paddingHorizontal: 15, borderWidth: 1, borderColor: '#EBEBEB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, height: 48,
  },
  instructionContainer: { marginBottom: 25 },
  instructionText: { fontSize: 14, color: '#858583', marginLeft: 5, fontWeight: '500' },
  generateButton: {
    height: 48,
    backgroundColor: '#E5FFE8',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#29A539',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  generateText: {
    color: '#035022',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  blankSection: { height: 200 },
  bottomNav: { 
    position: 'absolute', bottom: 20, left: 20, right: 20, height: 70, backgroundColor: '#FFF', 
    borderRadius: 35, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 10, elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 
  },
  navItemWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navItem: { alignItems: 'center', justifyContent: 'center', paddingVertical: 8, width: '100%' },
  activeNavItem: { backgroundColor: '#E5FFE8', borderRadius: 20 },
  navIconImage: { width: 24, height: 24, marginBottom: 4 },
  navLabel: { fontSize: 10, color: '#999' }
});

export default DoctorReportsScreen;
