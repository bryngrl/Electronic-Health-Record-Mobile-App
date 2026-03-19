import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import DoctorBottomNav from '../components/DoctorBottomNav';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AccountModal } from '../../../components/AccountModal';
import apiClient from '../../../api/apiClient';
import { useAppTheme } from '@App/theme/ThemeContext';
import { createStyles, createModalStyles } from './DoctorPatientsScreen.styles';

const CACHE_PATIENTS_KEY = 'doctor_cache_patients';

// --- TIME AGO FORMATTER ---
const formatTimeAgo = (timestamp: string | null) => {
  if (!timestamp) return 'No updates';
  try {
    const now = new Date();
    const updated = new Date(timestamp);
    const diffInMs = now.getTime() - updated.getTime();
    
    if (diffInMs < 0) return 'Updated just now';

    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHrs = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHrs / 24);

    if (diffInMins < 1) return 'Updated just now';
    if (diffInMins < 60) return `Updated ${diffInMins}m ago`;
    if (diffInHrs < 24) return `Updated ${diffInHrs}h ago`;
    return `Updated ${diffInDays}d ago`;
  } catch (e) {
    return 'No updates';
  }
};

// --- UPDATED PATIENT RECORD MODAL COMPONENT (CENTERED BOX STYLE) ---
const PatientRecordModal = ({
  visible,
  onClose,
  patient,
  onSelectCategory,
  loadingStats,
}: any) => {
  const { theme } = useAppTheme();
  const modalStyles = useMemo(() => createModalStyles(theme), [theme]);
  
  const stats = patient?.record_stats || {};

  const categories = [
    { name: 'Medical History', icon: 'history' },
    { name: 'Physical Exam', icon: 'person-search' },
    { name: 'Vital Signs', icon: 'show-chart' },
    { name: 'Intake and Output', icon: 'water-drop' },
    { name: 'Lab Values', icon: 'science' },
    { name: 'Diagnostics', icon: 'biotech' },
    { name: 'IVs & Lines', icon: 'vaccines' },
    { name: 'Activities of Daily Living', icon: 'accessibility' },
    { name: 'Medical Administration', icon: 'medication' },
    { name: 'Medical Reconciliation', icon: 'assignment-turned-in' },
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
            <View style={{ flex: 1 }}>
              <Text style={modalStyles.title}>Patient Record</Text>
              <Text style={modalStyles.patientName} numberOfLines={1}>
                {patient
                  ? `${patient.first_name} ${patient.last_name}`
                  : 'Select a patient'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <Icon name="close" size={22} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={modalStyles.scrollContent}
          >
            {loadingStats && (
              <View style={{ padding: 10, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={{ fontSize: 10, color: theme.textMuted, marginTop: 4 }}>Updating stats...</Text>
              </View>
            )}
            
            {categories.map((item, index) => {
              const lastUpdated = stats[item.name];
              const hasUpdate = !!lastUpdated;
              const updateText = formatTimeAgo(lastUpdated);

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    modalStyles.categoryCard,
                    !hasUpdate && { opacity: 0.5 }
                  ]}
                  onPress={() => hasUpdate && onSelectCategory(item.name)}
                  activeOpacity={hasUpdate ? 0.6 : 1}
                  disabled={!hasUpdate}
                >
                  <View style={modalStyles.cardLeft}>
                    <View style={modalStyles.iconCircle}>
                      <Icon name={item.icon} size={22} color={theme.primary} />
                    </View>
                    <View style={modalStyles.cardInfo}>
                      <Text style={modalStyles.categoryName}>{item.name}</Text>
                      <Text style={modalStyles.updateText}>{updateText}</Text>
                    </View>
                  </View>
                  {hasUpdate && <Icon name="chevron-right" size={24} color={theme.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const DoctorPatientsScreen = ({
  onNavigate,
}: {
  onNavigate: (route: string, params?: any) => void;
}) => {
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [recordVisible, setRecordVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, isDarkMode } = useAppTheme();
  const styles = useMemo(
    () => createStyles(theme, isDarkMode),
    [theme, isDarkMode],
  );

  // Load cache on mount for instant display
  useEffect(() => {
    const loadCache = async () => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_PATIENTS_KEY);
        if (cached) {
          setPatients(JSON.parse(cached));
          setLoading(false);
        }
      } catch {}
    };
    loadCache();
  }, []);

  const fetchPatients = useCallback(async () => {
    try {
      setPatients(prev => {
        if (prev.length === 0) setLoading(true);
        return prev;
      });
      const response = await apiClient.get('/doctor/patients');
      if (response.data && Array.isArray(response.data)) {
        setPatients(response.data);
        AsyncStorage.setItem(
          CACHE_PATIENTS_KEY,
          JSON.stringify(response.data),
        ).catch(() => {});
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handlePatientPress = async (patient: any) => {
    setSelectedPatient(patient);
    setRecordVisible(true);
    setLoadingStats(true);
    try {
      const res = await apiClient.get(`/doctor/patient/${patient.patient_id}`);
      if (res.data) {
        setSelectedPatient(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch patient stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const filteredPatients = useMemo(() => {
    return patients.filter(
      p =>
        `${p.first_name ?? ''} ${p.last_name ?? ''}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        String(p.patient_id ?? p.id ?? '').includes(searchQuery),
    );
  }, [patients, searchQuery]);

  const handleCategoryPress = (categoryName: string) => {
    setRecordVisible(false);

    const categoryToRoute: Record<string, string> = {
      'Vital Signs': 'VitalSigns',
      'Physical Exam': 'PhysicalExam',
      'Intake and Output': 'IntakeOutput',
      'Lab Values': 'LabValues',
      'IVs & Lines': 'IvsLines',
      'Activities of Daily Living': 'ADL',
      'Medical Administration': 'Medication',
      'Medical History': 'MedicalHistory',
      Diagnostics: 'Diagnostics',
      'Medical Reconciliation': 'MedicationReconciliation',
    };

    const route = categoryToRoute[categoryName];
    if (route && selectedPatient) {
      const patientId = selectedPatient.patient_id ?? selectedPatient.id;
      const patientName = `${selectedPatient.first_name ?? ''} ${
        selectedPatient.last_name ?? ''
      }`.trim();
      onNavigate(route, {
        patientId,
        patientName,
        admissionDate: selectedPatient.admission_date,
      });
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchPatients}
            colors={[theme.secondary]}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Patients</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setAccountModalVisible(true)}
            style={{ marginTop: 10 }}
          >
            {/* <Icon name="keyboard-arrow-down" size={24} color={theme.text} /> */}
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBarWrapper}>
            <Ionicons
              name="search-outline"
              size={20}
              color={theme.textMuted}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchBar}
              placeholder="Search"
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.listSection}>
          {loading && patients.length === 0 ? (
            <ActivityIndicator
              color={theme.secondary}
              style={{ marginTop: 50 }}
            />
          ) : filteredPatients.length > 0 ? (
            filteredPatients.map(item => (
              <TouchableOpacity
                key={item.patient_id}
                style={styles.patientCard}
                activeOpacity={0.7}
                onPress={() => handlePatientPress(item)}
              >
                <View style={styles.patientLeft}>
                  <View style={styles.avatarPlaceholder}>
                    <Image
                      source={require('../../../../assets/doctors-page/patients-logo.png')}
                      style={{
                        width: 24,
                        height: 24,
                        tintColor: theme.primary,
                      }}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.patientName}>
                      {item.first_name} {item.last_name}
                    </Text>
                    <Text style={styles.patientId}>
                      ID: {String(item.patient_id).padStart(4, '0')}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <Text
                style={{
                  color: theme.textMuted,
                  fontFamily: 'AlteHaasGrotesk',
                }}
              >
                No patients found.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <DoctorBottomNav activeRoute="DoctorPatients" onNavigate={onNavigate} />

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
        loadingStats={loadingStats}
      />
    </View>
  );
};

export default DoctorPatientsScreen;
