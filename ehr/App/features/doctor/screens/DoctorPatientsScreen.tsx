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
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AccountModal } from '../../../components/AccountModal';
import apiClient from '../../../api/apiClient';

const { width } = Dimensions.get('window');

// --- HELPER FUNCTION: REAL-TIME UPDATES ---
// Ito ang magko-convert ng date galing sa DB papuntang "3h ago" or "Just now"
const getTimeAgo = (dateString: string | null) => {
  if (!dateString) return 'No updates';

  const now = new Date();
  const updateDate = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - updateDate.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return updateDate.toLocaleDateString(); // Fallback to actual date if > 7 days
};

// --- MODAL COMPONENT ---
const PatientRecordModal = ({ visible, onClose, patient, onSelectCategory }: any) => {
  
  // Dito natin ima-map ang category sa specific column sa database mo.
  // Halimbawa: Ang 'Vital Signs' ay kukuha ng data sa 'patient.vitals_updated_at'
  const getCategoryData = (patientData: any) => [
    { 
      name: 'Medical History', 
      icon: 'history', 
      // Palitan mo 'history_updated_at' ng totoong column name sa DB mo
      update: getTimeAgo(patientData?.history_updated_at) 
    },
    { 
      name: 'Physical Exam', 
      icon: 'person-search', 
      update: getTimeAgo(patientData?.physical_exam_updated_at) 
    },
    { 
      name: 'Vital Signs', 
      icon: 'show-chart', 
      update: getTimeAgo(patientData?.vitals_updated_at || patientData?.updated_at) // Example fallback
    },
    { 
      name: 'Intake and Output', 
      icon: 'water-drop', 
      update: getTimeAgo(patientData?.io_updated_at) 
    },
    { 
      name: 'Lab Values', 
      icon: 'science', 
      update: getTimeAgo(patientData?.lab_updated_at) 
    },
    { 
      name: 'Diagnostics', 
      icon: 'biotech', 
      update: getTimeAgo(patientData?.diagnostics_updated_at) 
    },
    { 
      name: 'IVs & Lines', 
      icon: 'vaccines', 
      update: getTimeAgo(patientData?.iv_updated_at) 
    },
    { 
      name: 'Activities of Daily Living', 
      icon: 'accessibility', 
      update: getTimeAgo(patientData?.adl_updated_at) 
    },
    { 
      name: 'Medical Administration', 
      icon: 'medication', 
      update: getTimeAgo(patientData?.meds_updated_at) 
    },
    { 
      name: 'Medical Reconciliation', 
      icon: 'assignment-turned-in', 
      update: getTimeAgo(patientData?.reco_updated_at) 
    },
  ];

  const categories = patient ? getCategoryData(patient) : [];

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
                activeOpacity={0.7}
              >
                <View style={modalStyles.cardLeft}>
                  <View style={modalStyles.iconContainer}>
                    <Icon name={item.icon} size={22} color="#035022" />
                  </View>
                  <View style={modalStyles.cardInfo}>
                    <Text style={modalStyles.categoryName}>{item.name}</Text>
                    {/* Dito na lalabas yung Real-time update text */}
                    <Text style={modalStyles.updateText}>
                        {item.update === 'No updates' ? 'No updates' : `Updated ${item.update}`}
                    </Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={22} color="#035022" />
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
      const response = await apiClient.get('/patient/');
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
        {/* Header - UPDATED: REMOVED ARROW */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Patients</Text>
            <Text style={styles.date}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>
          {/* Removed the TouchableOpacity with keyboard-arrow-down here */}
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
        <NavItem label="Home" icon={require('../../../../assets/doctors-page/doctor-home.png')} onPress={() => onNavigate('DoctorHome')} />
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
  scrollContent: { paddingHorizontal: 40, paddingBottom: 150, paddingTop: 40 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 35,
    marginTop: 10
  },
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
    backgroundColor: 'rgba(255,255,255,0.2)', 
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  modalContainer: { 
    width: '85%', 
    maxHeight: '75%', 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 20, 
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    borderWidth: 2, 
    borderColor: '#035022', 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 15 
  },
  title: { 
    fontSize: 20, 
    color: '#035022', 
    fontWeight: '700', 
    marginBottom: 2
  },
  patientName: { 
    fontSize: 13, 
    color: '#999',
    fontWeight: '400'
  },
  closeButton: { 
    padding: 5, 
    marginTop: -5, 
    marginRight: -5 
  },
  scrollContent: { 
    paddingBottom: 5 
  },
  categoryCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#F4FDF6', 
    borderRadius: 14, 
    paddingVertical: 14, 
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  cardLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  iconContainer: { 
    marginRight: 12,
  },
  cardInfo: { 
    justifyContent: 'center', 
    flex: 1 
  },
  categoryName: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#035022',
    marginBottom: 1
  },
  updateText: { 
    fontSize: 11, 
    color: '#B0B0B0', 
    fontWeight: '400'
  },
});

export default DoctorPatientsScreen;