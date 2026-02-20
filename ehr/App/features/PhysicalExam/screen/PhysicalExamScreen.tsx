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
import ExamInputCard from '../components/PhysicalInputCard';
import ADPIEScreen from './ADPIEScreen'; // Integrated Stepper
import apiClient from '../../../api/apiClient';
import { usePhysicalExam } from '../hook/usePhysicalExam';
import SweetAlert from '../../../components/SweetAlert';

const THEME_GREEN = '#035022';

interface PhysicalExamProps {
  onBack: () => void;
}

const PhysicalExamScreen: React.FC<PhysicalExamProps> = ({ onBack }) => {
  const { saveAssessment, checkAssessmentAlerts } = usePhysicalExam();
  const [searchText, setSearchText] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );

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

  const [examId, setExamId] = useState<number | null>(null);
  const [backendAlerts, setBackendAlerts] = useState<any>({});

  // Controls the view switch from Assessment to ADPIE Stepper
  const [isAdpieActive, setIsAdpieActive] = useState(false);

  const [formData, setFormData] = useState({
    general_appearance: '',
    skin_condition: '',
    eye_condition: '',
    oral_condition: '',
    cardiovascular: '',
    abdomen_condition: '',
    extremities: '',
    neurological: '',
  });

  // REAL-TIME CDSS: Debounced polling to update bells as you type
  useEffect(() => {
    if (!selectedPatientId) return;

    const timer = setTimeout(async () => {
      const hasContent = Object.values(formData).some(v => v.trim().length > 0);
      if (hasContent) {
        try {
          const result = await checkAssessmentAlerts({
            patient_id: selectedPatientId,
            ...formData,
          });
          if (result) setBackendAlerts(result);
        } catch (e) {
          console.error('CDSS Real-time Error:', e);
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData, selectedPatientId]);

  // Load patient list on mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await apiClient.get('/patients/');
        const normalized = (response.data || []).map((p: any) => ({
          id: (p.patient_id ?? p.id).toString(),
          fullName: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
        }));
        setPatients(normalized);
      } catch (e) {
        console.error('Failed to load patients');
      }
    };
    fetchPatients();
  }, []);

  // NEW: CDSS Button Handler to trigger ADPIE Workflow
  const handleCDSSPress = async () => {
    if (!selectedPatientId) {
      return showAlert('Patient Required', 'Please select a patient first in the search bar.');
    }

    try {
      // Step 1: POST to /physical-exam/ to create the record
      const result = await saveAssessment({
        patient_id: selectedPatientId,
        ...formData,
      });

      const id = result.id || result.physical_exam_id;
      if (id) {
        setExamId(id);
        setIsAdpieActive(true); // Switch to ADPIE Stepper View
      }
    } catch (e) {
      // Backend error check for 405 Method Not Allowed
      showAlert('Error', 'Could not initiate clinical support.');
    }
  };

  const handleSave = async () => {
    if (!selectedPatientId) {
      return showAlert('Patient Required', 'Please select a patient first in the search bar.');
    }
    try {
      const result = await saveAssessment({
        patient_id: selectedPatientId,
        ...formData,
      });
      if (result.id || result.physical_exam_id) {
        setExamId(result.id || result.physical_exam_id);
      }
      showAlert('Success', 'Assessment Saved!', 'success');
    } catch (e) {
      showAlert('Error', 'Submission failed. Check backend (405 error).');
    }
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  // Switch to ADPIE Screen if active
  if (isAdpieActive && examId && selectedPatientId) {
    return (
      <ADPIEScreen
        examId={examId}
        patientId={selectedPatientId}
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
            <Text style={styles.title}>Physical Exam</Text>
            <Text style={styles.dateText}>{formatDate()}</Text>
          </View>
          <TouchableOpacity onPress={onBack}>
            <Icon name="more-vert" size={35} color={THEME_GREEN} />
          </TouchableOpacity>
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
                    setSelectedPatientId(p.id);
                    setShowDropdown(false);
                  }}
                  style={styles.dropItem}
                >
                  <Text>{p.fullName}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerText}>PHYSICAL EXAMINATION</Text>
        </View>

        {/* Assessment Notepad Cards */}
        <ExamInputCard
          label="GENERAL APPEARANCE"
          value={formData.general_appearance}
          disabled={!selectedPatientId}
          alertText={backendAlerts.general_appearance_alert}
          onChangeText={t =>
            setFormData({ ...formData, general_appearance: t })
          }
        />
        <ExamInputCard
          label="SKIN"
          value={formData.skin_condition}
          disabled={!selectedPatientId}
          alertText={backendAlerts.skin_alert}
          onChangeText={t => setFormData({ ...formData, skin_condition: t })}
        />
        <ExamInputCard
          label="EYES"
          value={formData.eye_condition}
          disabled={!selectedPatientId}
          alertText={backendAlerts.eye_alert}
          onChangeText={t => setFormData({ ...formData, eye_condition: t })}
        />
        <ExamInputCard
          label="ORAL CAVITY"
          value={formData.oral_condition}
          disabled={!selectedPatientId}
          alertText={backendAlerts.oral_alert}
          onChangeText={t => setFormData({ ...formData, oral_condition: t })}
        />
        <ExamInputCard
          label="CARDIOVASCULAR"
          value={formData.cardiovascular}
          disabled={!selectedPatientId}
          alertText={backendAlerts.cardiovascular_alert}
          onChangeText={t => setFormData({ ...formData, cardiovascular: t })}
        />
        <ExamInputCard
          label="ABDOMEN"
          value={formData.abdomen_condition}
          disabled={!selectedPatientId}
          alertText={backendAlerts.abdomen_alert}
          onChangeText={t => setFormData({ ...formData, abdomen_condition: t })}
        />
        <ExamInputCard
          label="EXTREMITIES"
          value={formData.extremities}
          disabled={!selectedPatientId}
          alertText={backendAlerts.extremities_alert}
          onChangeText={t => setFormData({ ...formData, extremities: t })}
        />
        <ExamInputCard
          label="NEUROLOGICAL"
          value={formData.neurological}
          disabled={!selectedPatientId}
          alertText={backendAlerts.neurological_alert}
          onChangeText={t => setFormData({ ...formData, neurological: t })}
        />

        <View style={styles.footerRow}>
          {/* CDSS Button: Triggers Nursing Process Stepper */}
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
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 3,
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    zIndex: 99,
  },
  dropItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  banner: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  bannerText: { color: THEME_GREEN, fontWeight: 'bold', fontSize: 12 },
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

export default PhysicalExamScreen;
