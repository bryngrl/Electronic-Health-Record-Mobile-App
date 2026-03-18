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

// --- UPDATED PATIENT RECORD MODAL COMPONENT (CENTERED BOX STYLE) ---
const PatientRecordModal = ({
  visible,
  onClose,
  patient,
  onSelectCategory,
}: any) => {
  const { theme } = useAppTheme();
  const modalStyles = useMemo(() => createModalStyles(theme), [theme]);
  const categories = [
    { name: 'Medical History', update: 'Updated 3 hours ago', icon: 'history' },
    {
      name: 'Physical Exam',
      update: 'Updated 3 hours ago',
      icon: 'person-search',
    },
    { name: 'Vital Signs', update: 'Updated 3 hours ago', icon: 'show-chart' },
    { name: 'Intake and Output', update: 'No updates', icon: 'water-drop' },
    { name: 'Lab Values', update: 'Updated 3 hours ago', icon: 'science' },
    { name: 'Diagnostics', update: 'Updated 3 hours ago', icon: 'biotech' },
    { name: 'IVs & Lines', update: 'Updated 3 hours ago', icon: 'vaccines' },
    {
      name: 'Activities of Daily Living',
      update: 'Updated 3 hours ago',
      icon: 'accessibility',
    },
    {
      name: 'Medical Administration',
      update: 'Updated 3 hours ago',
      icon: 'medication',
    },
    {
      name: 'Medical Reconciliation',
      update: 'Updated 3 hours ago',
      icon: 'assignment-turned-in',
    },
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
            {categories.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={modalStyles.categoryCard}
                onPress={() => onSelectCategory(item.name)}
                activeOpacity={0.6}
              >
                <View style={modalStyles.cardLeft}>
                  <View style={modalStyles.iconCircle}>
                    <Icon name={item.icon} size={22} color={theme.primary} />
                  </View>
                  <View style={modalStyles.cardInfo}>
                    <Text style={modalStyles.categoryName}>{item.name}</Text>
                    <Text style={modalStyles.updateText}>{item.update}</Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={24} color={theme.primary} />
              </TouchableOpacity>
            ))}
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
        admissionDate: selectedPatient.admission_date
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
            <Icon name="keyboard-arrow-down" size={24} color={theme.text} />
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
                onPress={() => {
                  setSelectedPatient(item);
                  setRecordVisible(true);
                }}
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
      />
    </View>
  );
};

export default DoctorPatientsScreen;
