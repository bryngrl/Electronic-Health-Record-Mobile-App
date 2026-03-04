import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ExamInputCard from '../components/PhysicalInputCard';
import ADPIEScreen from './ADPIEScreen'; // Integrated Stepper
import { usePhysicalExam } from '../hook/usePhysicalExam';
import SweetAlert from '../../../components/SweetAlert';
import PatientSearchBar from '../../../components/PatientSearchBar';

const THEME_GREEN = '#035022';

interface PhysicalExamProps {
  onBack: () => void;
}

const initialFormData = {
  general_appearance: '',
  skin_condition: '',
  eye_condition: '',
  oral_condition: '',
  cardiovascular: '',
  abdomen_condition: '',
  extremities: '',
  neurological: '',
};

const PhysicalExamScreen: React.FC<PhysicalExamProps> = ({ onBack }) => {
  const { saveAssessment, checkAssessmentAlerts, fetchLatestPhysicalExam } =
    usePhysicalExam();
  const [searchText, setSearchText] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const prevPatientIdRef = useRef<string | null>(null);

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

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' = 'error',
  ) => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const [examId, setExamId] = useState<number | null>(null);
  const [backendAlerts, setBackendAlerts] = useState<any>({});

  // Controls the view switch from Assessment to ADPIE Stepper
  const [isAdpieActive, setIsAdpieActive] = useState(false);

  const [formData, setFormData] = useState(initialFormData);

  const loadPatientData = useCallback(
    async (patientId: number) => {
      const data = await fetchLatestPhysicalExam(patientId);
      if (data) {
        setExamId(data.id);
        setFormData({
          general_appearance: data.general_appearance || '',
          skin_condition: data.skin_condition || '',
          eye_condition: data.eye_condition || '',
          oral_condition: data.oral_condition || '',
          cardiovascular: data.cardiovascular || '',
          abdomen_condition: data.abdomen_condition || '',
          extremities: data.extremities || '',
          neurological: data.neurological || '',
        });
        // Also update alerts if they exist in the loaded data
        setBackendAlerts({
          general_appearance_alert: data.general_appearance_alert,
          skin_alert: data.skin_alert,
          eye_alert: data.eye_alert,
          oral_alert: data.oral_alert,
          cardiovascular_alert: data.cardiovascular_alert,
          abdomen_alert: data.abdomen_alert,
          extremities_alert: data.extremities_alert,
          neurological_alert: data.neurological_alert,
        });
      } else {
        setExamId(null);
        setFormData(initialFormData);
        setBackendAlerts({});
      }
    },
    [fetchLatestPhysicalExam],
  );

  useEffect(() => {
    if (selectedPatientId !== prevPatientIdRef.current) {
      prevPatientIdRef.current = selectedPatientId;
      if (selectedPatientId) {
        loadPatientData(parseInt(selectedPatientId, 10));
      } else {
        setExamId(null);
        setFormData(initialFormData);
        setBackendAlerts({});
      }
    }
  }, [selectedPatientId, loadPatientData]);

  // REAL-TIME CDSS: Debounced polling to update bells as you type
  useEffect(() => {
    if (!selectedPatientId) return;

    const timer = setTimeout(async () => {
      const hasContent = Object.values(formData).some(
        v => v && v.trim().length > 0,
      );
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
  }, [formData, selectedPatientId, checkAssessmentAlerts]);

  // NEW: CDSS Button Handler to trigger ADPIE Workflow
  const handleCDSSPress = async () => {
    if (!selectedPatientId) {
      return showAlert(
        'Patient Required',
        'Please select a patient first in the search bar.',
      );
    }

    try {
      // Step 1: POST to /physical-exam/ to create or update the record
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
      showAlert('Error', 'Could not initiate clinical support.');
    }
  };

  const handleSave = async () => {
    if (!selectedPatientId) {
      return showAlert(
        'Patient Required',
        'Please select a patient first in the search bar.',
      );
    }
    try {
      const result = await saveAssessment({
        patient_id: selectedPatientId,
        ...formData,
      });

      const newId = result.id || result.physical_exam_id;
      // Check if it was an update or a new submission
      const isUpdate = !!examId || result.updated_at !== result.created_at;

      if (newId) {
        setExamId(newId);
      }

      showAlert(
        isUpdate ? 'SUCCESSFULLY UPDATED' : 'SUCCESSFULLY SUBMITTED',
        `Physical Exam has been ${
          isUpdate ? 'updated' : 'submitted'
        } successfully.`,
        'success',
      );

      // Refresh to get latest state
      loadPatientData(parseInt(selectedPatientId, 10));
    } catch (e) {
      showAlert('Error', 'Submission failed. Please check your connection.');
    }
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const updateField = (field: string, val: string) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const isDataEntered = Object.values(formData).some(
    v => v && v.trim().length > 0,
  );

  // Switch to ADPIE Screen if active
  if (isAdpieActive && examId && selectedPatientId) {
    return (
      <ADPIEScreen
        examId={examId}
        patientId={selectedPatientId}
        patientName={searchText}
        assessmentAlerts={backendAlerts}
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
        scrollEnabled={scrollEnabled}
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

        <PatientSearchBar
          onPatientSelect={(id, name) => {
            setSelectedPatientId(id ? id.toString() : null);
            setSearchText(name);
          }}
          initialPatientName={searchText}
          onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
        />

        <View style={styles.banner}>
          <Text style={styles.bannerText}>PHYSICAL EXAMINATION</Text>
        </View>

        {/* Assessment Notepad Cards */}
        <ExamInputCard
          label="GENERAL APPEARANCE"
          value={formData.general_appearance}
          disabled={!selectedPatientId}
          alertText={backendAlerts.general_appearance_alert}
          onChangeText={t => updateField('general_appearance', t)}
        />
        <ExamInputCard
          label="SKIN"
          value={formData.skin_condition}
          disabled={!selectedPatientId}
          alertText={backendAlerts.skin_alert}
          onChangeText={t => updateField('skin_condition', t)}
        />
        <ExamInputCard
          label="EYES"
          value={formData.eye_condition}
          disabled={!selectedPatientId}
          alertText={backendAlerts.eye_alert}
          onChangeText={t => updateField('eye_condition', t)}
        />
        <ExamInputCard
          label="ORAL CAVITY"
          value={formData.oral_condition}
          disabled={!selectedPatientId}
          alertText={backendAlerts.oral_alert}
          onChangeText={t => updateField('oral_condition', t)}
        />
        <ExamInputCard
          label="CARDIOVASCULAR"
          value={formData.cardiovascular}
          disabled={!selectedPatientId}
          alertText={backendAlerts.cardiovascular_alert}
          onChangeText={t => updateField('cardiovascular', t)}
        />
        <ExamInputCard
          label="ABDOMEN"
          value={formData.abdomen_condition}
          disabled={!selectedPatientId}
          alertText={backendAlerts.abdomen_alert}
          onChangeText={t => updateField('abdomen_condition', t)}
        />
        <ExamInputCard
          label="EXTREMITIES"
          value={formData.extremities}
          disabled={!selectedPatientId}
          alertText={backendAlerts.extremities_alert}
          onChangeText={t => updateField('extremities', t)}
        />
        <ExamInputCard
          label="NEUROLOGICAL"
          value={formData.neurological}
          disabled={!selectedPatientId}
          alertText={backendAlerts.neurological_alert}
          onChangeText={t => updateField('neurological', t)}
        />

        <View style={styles.footerRow}>
          {/* CDSS Button: Triggers Nursing Process Stepper */}
          <TouchableOpacity
            style={[
              styles.cdssBtn,
              isDataEntered && {
                backgroundColor: '#DCFCE7',
                borderColor: THEME_GREEN,
              },
            ]}
            onPress={handleCDSSPress}
          >
            <Text
              style={[styles.cdssText, isDataEntered && { color: THEME_GREEN }]}
            >
              CDSS
            </Text>
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
  dateText: { fontSize: 13, fontFamily: 'AlteHaasGroteskBold', color: '#999' },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME_GREEN,
    marginBottom: 8,
  },
  banner: {
    backgroundColor: '#E5FFE8',
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  bannerText: {
    color: '#29A539',
    fontFamily: 'AlteHaasGroteskBold',
    fontSize: 14,
  },
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
