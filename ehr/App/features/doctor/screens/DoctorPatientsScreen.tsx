import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  RefreshControl, 
  ActivityIndicator, 
  Modal, 
  Dimensions,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AccountModal } from '../../../components/AccountModal';
import apiClient from '../../../api/apiClient';

// --- UPDATED PATIENT RECORD MODAL COMPONENT (CENTERED BOX STYLE) ---
const PatientRecordModal = ({ visible, onClose, patient, onSelectCategory }: any) => {
  const categories = [
    { name: 'Medical History', update: 'Updated 3 hours ago', icon: 'history' },
    { name: 'Physical Exam', update: 'Updated 3 hours ago', icon: 'person-search' },
    { name: 'Vital Signs', update: 'Updated 3 hours ago', icon: 'show-chart' },
    { name: 'Intake and Output', update: 'No updates', icon: 'water-drop' },
    { name: 'Lab Values', update: 'Updated 3 hours ago', icon: 'science' },
    { name: 'Diagnostics', update: 'Updated 3 hours ago', icon: 'biotech' },
    { name: 'IVs & Lines', update: 'Updated 3 hours ago', icon: 'vaccines' },
    { name: 'Activities of Daily Living', update: 'Updated 3 hours ago', icon: 'accessibility' },
    { name: 'Medical Administration', update: 'Updated 3 hours ago', icon: 'medication' },
    { name: 'Medical Reconciliation', update: 'Updated 3 hours ago', icon: 'assignment-turned-in' },
  ];

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="fade" 
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.modalContainer}>
          <View style={modalStyles.header}>
            <View>
              <Text style={modalStyles.title}>Patient Record</Text>
              <Text style={modalStyles.patientName}>
                {patient ? `${patient.first_name} ${patient.last_name}` : 'Select a patient'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={modalStyles.scrollContent}>
            {categories.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={modalStyles.categoryCard}
                onPress={() => onSelectCategory(item.name)}
                activeOpacity={0.6}
              >
                <View style={modalStyles.cardLeft}>
                  <View style={modalStyles.iconCircle}>
                    <Icon name={item.icon} size={22} color="#035022" />
                  </View>
                  <View style={modalStyles.cardInfo}>
                    <Text style={modalStyles.categoryName}>{item.name}</Text>
                    <Text style={modalStyles.updateText}>{item.update}</Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={24} color="#035022" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const DoctorPatientsScreen = ({ onNavigate }: { onNavigate: (route: string) => void }) => {
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [recordVisible, setRecordVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/patients/');
      if (response.data && Array.isArray(response.data)) {
        setPatients(response.data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => 
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patient_id.toString().includes(searchQuery)
    );
  }, [patients, searchQuery]);

  const handleCategoryPress = (categoryName: string) => {
    setRecordVisible(false);
    if (categoryName === 'Medical Reconciliation') {
      onNavigate('MedicalReconciliation'); 
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchPatients} colors={['#29A539']} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Patients</Text>
            <Text style={styles.date}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setAccountModalVisible(true)}>
            <Icon name="keyboard-arrow-down" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBarWrapper}>
            <Image 
              source={require('../../../../assets/doctors-page/search.png')} 
              style={styles.searchIcon} 
              resizeMode="contain"
            />
            <TextInput   
              style={styles.searchBar} 
              placeholder="Search" 
              placeholderTextColor="#D9D9D9"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.listSection}>
          {loading && patients.length === 0 ? (
            <ActivityIndicator color="#29A539" style={{ marginTop: 50 }} />
          ) : filteredPatients.length > 0 ? (
            filteredPatients.map((item) => (
              <TouchableOpacity 
                key={item.patient_id} 
                style={styles.patientCard}
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedPatient(item);
                  setRecordVisible(true);
                }}
              >
                <View style={styles.patientLeft}>
                  <View style={styles.avatarPlaceholder}>
                    <Image 
                      source={require('../../../../assets/doctors-page/patients-logo.png')} 
                      style={{ width: 24, height: 24, tintColor: '#035022' }} 
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.patientName}>{item.first_name} {item.last_name}</Text>
                    <Text style={styles.patientId}>ID: {String(item.patient_id).padStart(4, '0')}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <Text style={{ color: '#999696' }}>No patients found.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <NavItem label="Home" icon={require('../../../../assets/doctors-page/doctor-home.png')} onPress={() => onNavigate('Doctors')} />
        <NavItem label="Patients" icon={require('../../../../assets/doctors-page/doctor-patients.png')} active />
        <NavItem label="Reports" icon={require('../../../../assets/doctors-page/doctor-reports.png')} onPress={() => onNavigate('DoctorReports')} />
        <NavItem label="Settings" icon={require('../../../../assets/doctors-page/doctor-settings.png')} />
      </View>

      <AccountModal 
        visible={accountModalVisible} 
        onClose={() => setAccountModalVisible(false)} 
        onLogout={() => setAccountModalVisible(false)} 
      />
      
      <PatientRecordModal 
        visible={recordVisible} 
        onClose={() => setRecordVisible(false)} 
        patient={selectedPatient}
        onSelectCategory={handleCategoryPress}
      />
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
  scrollContent: { paddingHorizontal: 25, paddingBottom: 150, paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  welcome: { fontSize: 35, color: '#035022', fontFamily: 'MinionPro-SemiboldItalic' },
  date: { fontSize: 14, color: '#B2B2B2', marginTop: 4, fontWeight: 'bold' },
  searchContainer: { marginBottom: 25 },
  searchBarWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 25, paddingHorizontal: 15,
    borderWidth: 1, borderColor: '#EBEBEB', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  searchIcon: { width: 18, height: 18, marginRight: 10, tintColor: '#D9D9D9' },
  searchBar: { flex: 1, height: 45, color: '#333' },
  listSection: { marginTop: -10 },
  patientCard: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, alignItems: 'center' },
  patientLeft: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: { 
    width: 40, height: 40, borderRadius: 5, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EBEBEB', 
    justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  info: { marginLeft: 12 },
  patientName: { color: '#333', fontSize: 15, fontWeight: '500' },
  patientId: { color: '#999', fontSize: 12 },
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

const modalStyles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  modalContainer: { 
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#FFF', 
    borderRadius: 20,
    padding: 25, 
    elevation: 15,
    borderWidth: 3,
    borderColor: '#035022', // Updated Border Color
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 },
  title: { fontSize: 24, color: '#035022', fontWeight: 'bold', fontFamily: 'MinionPro-Bold' },
  patientName: { fontSize: 16, color: '#B2B2B2', marginTop: 4 },
  closeButton: { padding: 5, marginTop: -5, marginRight: -5 },
  scrollContent: { paddingBottom: 10 },
  categoryCard: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    backgroundColor: '#F6FFF7', 
    borderRadius: 18, 
    padding: 16, 
    marginBottom: 12,
    borderWidth: 0, 
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconCircle: { 
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', 
    justifyContent: 'center', alignItems: 'center', marginRight: 15,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3
  },
  cardInfo: { justifyContent: 'center', flex: 1 },
  categoryName: { fontSize: 16, fontWeight: '600', color: '#035022' }, // Components Name Color
  updateText: { fontSize: 12, color: '#999', marginTop: 2 },
});

export default DoctorPatientsScreen;