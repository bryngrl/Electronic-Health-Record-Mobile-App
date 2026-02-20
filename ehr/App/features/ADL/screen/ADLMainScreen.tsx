import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ADLInputCard from '../components/ADLInputCard';
import ADLCDSSStepper from './ADPIEScreen';
import apiClient from '../../../api/apiClient';
import { useADL } from '../hook/useADL';
import SweetAlert from '../../../components/SweetAlert';

const THEME_GREEN = '#035022';

const ADLScreen = ({ onBack }: any) => {
  const { alerts, checkADLAlerts, saveADLAssessment } = useADL();

  const [searchText, setSearchText] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // SweetAlert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'error',
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error' = 'error') => {
    setAlertConfig({ visible: true, title, message, type });
  };

  // UPDATED: Store full patient object to access admission_date
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  const [adlId, setAdlId] = useState<number | null>(null);
  const [isAdpieActive, setIsAdpieActive] = useState(false);

  const [formData, setFormData] = useState({
    mobility: '',
    hygiene: '',
    toileting: '',
    feeding: '',
    hydration: '',
    sleep_pattern: '',
    pain_level: '',
  });

  // Load patient list on mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await apiClient.get('/patients/');
        const normalized = (response.data || []).map((p: any) => ({
          id: (p.patient_id ?? p.id).toString(),
          fullName: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
          admissionDate: p.admission_date, // Backend must provide this
        }));
        setPatients(normalized);
      } catch (e) {
        console.error('Failed to load patients');
      }
    };
    fetchPatients();
  }, []);

  // CALCULATIONS: Admission Date & Day Number
  const getFormattedAdmissionDate = () => {
    if (!selectedPatient?.admissionDate) return '';
    const date = new Date(selectedPatient.admissionDate);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateDayNumber = () => {
    if (!selectedPatient?.admissionDate) return '';
    const admission = new Date(selectedPatient.admissionDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - admission.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // MS to Days
    return diffDays.toString();
  };

  // REAL-TIME CDSS
  useEffect(() => {
    if (!selectedPatient?.id || !adlId) return;
    const timer = setTimeout(async () => {
      const hasContent = Object.values(formData).some(v => v.trim().length > 0);
      if (hasContent) {
        try {
          await checkADLAlerts(adlId, { ...formData });
        } catch (e) {
          console.error('CDSS Real-time Error:', e);
        }
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData, selectedPatient, adlId]);

  const handleCDSSPress = async () => {
    if (!selectedPatient) {
      return showAlert('Patient Required', 'Please select a patient first in the search bar.');
    }
    try {
      const result = await saveADLAssessment({
        patient_id: selectedPatient.id,
        ...formData,
      });
      const id = result.id || result.adl_id;
      if (id) {
        setAdlId(id);
        setIsAdpieActive(true);
      }
    } catch (e) {
      showAlert('Error', 'Could not initiate clinical support.');
    }
  };

  const handleSave = async () => {
    if (!selectedPatient) {
      return showAlert('Patient Required', 'Please select a patient first in the search bar.');
    }
    try {
      const result = await saveADLAssessment({
        patient_id: selectedPatient.id,
        ...formData,
      });
      if (result.id) setAdlId(result.id);
      showAlert('Success', 'ADL Assessment Saved!', 'success');
    } catch (e) {
      showAlert('Error', 'Submission failed.');
    }
  };

  if (isAdpieActive && adlId && selectedPatient) {
    return (
      <ADLCDSSStepper
        adlId={adlId}
        patientId={selectedPatient.id}
        patientName={searchText}
        onBack={() => setIsAdpieActive(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Activities of Daily Living</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PATIENT NAME :</Text>
          <TextInput
            style={styles.searchBar}
            placeholder="Select or type Patient name"
            value={searchText}
            onChangeText={(text: string) => {
              setSearchText(text);
              setFilteredPatients(
                patients.filter(p =>
                  p.fullName.toLowerCase().includes(text.toLowerCase()),
                ),
              );
              setShowDropdown(true);
            }}
          />
          {showDropdown && filteredPatients.length > 0 && (
            <View style={styles.dropdown}>
              {filteredPatients.map(p => (
                <Pressable
                  key={p.id}
                  onPress={() => {
                    setSearchText(p.fullName);
                    setSelectedPatient(p); // Capture full object
                    setShowDropdown(false);
                  }}
                  style={styles.dropItem}
                >
                  <Text>{p.fullName}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* DYNAMIC ADMISSION ROW */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.sectionLabel}>DATE :</Text>
              <View style={styles.inputBox}>
                <Text style={styles.inputText}>
                  {getFormattedAdmissionDate()}
                </Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionLabel}>DAY NO. :</Text>
              <View style={styles.inputBox}>
                <Text style={styles.inputText}>{calculateDayNumber()}</Text>
                <Icon
                  name="arrow-drop-down"
                  size={24}
                  color={THEME_GREEN}
                  style={{ position: 'absolute', right: 10 }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* ADL Notepad Cards - Disabled until patient is selected */}
        <ADLInputCard
          label="MOBILITY"
          value={formData.mobility}
          disabled={!selectedPatient}
          alertText={alerts.mobility_alert}
          onChangeText={t => setFormData({ ...formData, mobility: t })}
        />
        <ADLInputCard
          label="HYGIENE"
          value={formData.hygiene}
          disabled={!selectedPatient}
          alertText={alerts.hygiene_alert}
          onChangeText={t => setFormData({ ...formData, hygiene: t })}
        />
        <ADLInputCard
          label="TOILETING"
          value={formData.toileting}
          disabled={!selectedPatient}
          alertText={alerts.toileting_alert}
          onChangeText={t => setFormData({ ...formData, toileting: t })}
        />
        <ADLInputCard
          label="FEEDING"
          value={formData.feeding}
          disabled={!selectedPatient}
          alertText={alerts.feeding_alert}
          onChangeText={t => setFormData({ ...formData, feeding: t })}
        />
        <ADLInputCard
          label="HYDRATION"
          value={formData.hydration}
          disabled={!selectedPatient}
          alertText={alerts.hydration_alert}
          onChangeText={t => setFormData({ ...formData, hydration: t })}
        />
        <ADLInputCard
          label="SLEEP PATTERN"
          value={formData.sleep_pattern}
          disabled={!selectedPatient}
          alertText={alerts.sleep_pattern_alert}
          onChangeText={t => setFormData({ ...formData, sleep_pattern: t })}
        />
        <ADLInputCard
          label="PAIN LEVEL"
          value={formData.pain_level}
          disabled={!selectedPatient}
          alertText={alerts.pain_level_alert}
          onChangeText={t => setFormData({ ...formData, pain_level: t })}
        />

        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.cdssBtn} onPress={handleCDSSPress}>
            <Text style={styles.cdssText}>CDSS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
            <Text style={styles.submitText}>SUBMIT</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <SweetAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={() => setAlertConfig({ ...alertConfig, visible: false })}
        confirmText="OK"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... Keep existing styles ...
  inputBox: {
    height: 48,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#F2F2F2',
    paddingHorizontal: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  inputText: { fontSize: 13, color: '#333' },
  row: { flexDirection: 'row', marginTop: 5 },
  // ... other styles
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 25 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 25,
  },
  title: {
    fontSize: 35,
    color: THEME_GREEN,
    fontFamily: 'MinionPro-SemiboldItalic',
  },
  dateText: { fontSize: 13, color: '#999' },
  section: { marginBottom: 15, zIndex: 10 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME_GREEN,
    marginBottom: 8,
  },
  searchBar: {
    borderRadius: 25,
    paddingHorizontal: 20,
    height: 48,
    borderWidth: 1,
    borderColor: '#F2F2F2',
    marginBottom: 15,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 3,
    position: 'absolute',
    top: 75,
    left: 0,
    right: 0,
    zIndex: 99,
  },
  dropItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingBottom: 40,
  },
  cdssBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#DCFCE7',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: THEME_GREEN,
  },
  cdssText: { color: '#6B7280', fontWeight: 'bold' },
  submitText: { color: THEME_GREEN, fontWeight: 'bold' },
});

export default ADLScreen;
