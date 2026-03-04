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
import HistoryInputCard from '../components/HistoryInputCard';
import Button from '../../../components/button';
import { useMedicalHistory } from '../hook/useMedicalHistory';
import SweetAlert from '../../../components/SweetAlert';
import PatientSearchBar from '../../../components/PatientSearchBar';

const THEME_GREEN = '#035022';
const LIGHT_GREEN_BG = '#E5FFE8';

interface MedicalHistoryProps {
  onBack: () => void;
}

const initialFormData = {
  present: {
    condition_name: '',
    description: '',
    medication: '',
    dosage: '',
    side_effect: '',
    comment: '',
  },
  past: {
    condition_name: '',
    description: '',
    medication: '',
    dosage: '',
    side_effect: '',
    comment: '',
  },
  allergies: {
    condition_name: '',
    description: '',
    medication: '',
    dosage: '',
    side_effect: '',
    comment: '',
  },
  vaccination: {
    condition_name: '',
    description: '',
    medication: '',
    dosage: '',
    side_effect: '',
    comment: '',
  },
  developmental: {
    gross_motor: '',
    fine_motor: '',
    language: '',
    cognitive: '',
    social: '',
  },
};

const STEP_FIELDS: Record<string, string[]> = {
  present: [
    'condition_name',
    'description',
    'medication',
    'dosage',
    'side_effect',
    'comment',
  ],
  past: [
    'condition_name',
    'description',
    'medication',
    'dosage',
    'side_effect',
    'comment',
  ],
  allergies: [
    'condition_name',
    'description',
    'medication',
    'dosage',
    'side_effect',
    'comment',
  ],
  vaccination: [
    'condition_name',
    'description',
    'medication',
    'dosage',
    'side_effect',
    'comment',
  ],
  developmental: [
    'gross_motor',
    'fine_motor',
    'language',
    'cognitive',
    'social',
  ],
};

const FIELD_LABELS: Record<string, string> = {
  condition_name: 'CONDITION NAME',
  description: 'DESCRIPTION',
  medication: 'MEDICATION',
  dosage: 'DOSAGE',
  side_effect: 'SIDE EFFECT',
  comment: 'COMMENT',
  gross_motor: 'GROS MOTOR',
  fine_motor: 'FINE MOTOR',
  language: 'LANGUAGE',
  cognitive: 'COGNITIVE',
  social: 'SOCIAL',
};

const MedicalHistoryScreen: React.FC<MedicalHistoryProps> = ({ onBack }) => {
  const { saveMedicalHistory, fetchMedicalHistory } = useMedicalHistory();
  const [step, setStep] = useState(0);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null,
  );
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const prevPatientIdRef = useRef<number | null>(null);

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

  const [formData, setFormData] = useState(initialFormData);

  const loadPatientData = useCallback(
    async (patientId: number) => {
      const data = await fetchMedicalHistory(patientId);
      if (data) {
        // Helper to handle both object and single-element array responses
        const getFirst = (val: any) => (Array.isArray(val) ? val[0] : val);

        setFormData({
          present: getFirst(data.present_illness) || initialFormData.present,
          past: getFirst(data.past_medical_surgical) || initialFormData.past,
          allergies: getFirst(data.allergies) || initialFormData.allergies,
          vaccination:
            getFirst(data.vaccination) || initialFormData.vaccination,
          developmental:
            getFirst(data.developmental_history) ||
            initialFormData.developmental,
        });
      } else {
        setFormData(initialFormData);
      }
    },
    [fetchMedicalHistory],
  );

  useEffect(() => {
    // Only fetch when the patient ID actually changes to avoid overwriting typing
    if (selectedPatientId !== prevPatientIdRef.current) {
      prevPatientIdRef.current = selectedPatientId;
      if (selectedPatientId) {
        loadPatientData(selectedPatientId);
      } else {
        setFormData(initialFormData);
      }
    }
  }, [selectedPatientId, loadPatientData]);

  const steps = [
    { title: 'PRESENT ILLNESS', key: 'present' },
    { title: 'PAST MEDICAL / SURGICAL', key: 'past' },
    { title: 'KNOWN CONDITION OR ALLERGIES', key: 'allergies' },
    { title: 'VACCINATION', key: 'vaccination' },
    { title: 'DEVELOPMENTAL HISTORY', key: 'developmental' },
  ];

  const handleNext = async () => {
    if (!selectedPatientId) {
      return showAlert(
        'Patient Required',
        'Please select a patient first in the search bar.',
      );
    }

    try {
      // Save progress silently (Backend handles upsert)
      await saveMedicalHistory(selectedPatientId, formData);

      if (step < steps.length - 1) {
        setStep(step + 1);
      } else {
        const isUpdate = !!(
          formData.present.medical_id ||
          formData.past.medical_id ||
          formData.allergies.medical_id ||
          formData.vaccination.medical_id ||
          formData.developmental.development_id
        );

        showAlert(
          isUpdate ? 'Successully Updated' : 'Successfully Submitted',
          `Medical History has been ${
            isUpdate ? 'updated' : 'submitted'
          } successfully.`,
          'success',
        );

        loadPatientData(selectedPatientId);
      }
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to save history.');
    }
  };

  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const updateField = (field: string, val: string) => {
    const currentKey = steps[step].key as keyof typeof formData;
    setFormData(prev => ({
      ...prev,
      [currentKey]: { ...prev[currentKey], [field]: val },
    }));
  };

  const currentStepKey = steps[step].key;
  const currentFields = STEP_FIELDS[currentStepKey];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={scrollEnabled}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Medical History</Text>
            <Text style={styles.dateText}>{formatDate()}</Text>
          </View>
          <TouchableOpacity onPress={onBack}>
            <Icon name="more-vert" size={35} color={THEME_GREEN} />
          </TouchableOpacity>
        </View>

        <PatientSearchBar
          onPatientSelect={id => setSelectedPatientId(id)}
          onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
        />

        <View style={styles.stepHeader}>
          <Text style={styles.stepHeaderText}>{steps[step].title}</Text>
        </View>

        {currentFields.map(field => (
          <HistoryInputCard
            key={`${currentStepKey}-${field}`}
            label={FIELD_LABELS[field] || field.replace('_', ' ').toUpperCase()}
            value={
              (formData[currentStepKey as keyof typeof formData] as any)[
                field
              ] || ''
            }
            onChangeText={(val: string) => updateField(field, val)}
            disabled={!selectedPatientId}
            onDisabledPress={() =>
              showAlert(
                'Patient Required',
                'Please select a patient first in the search bar.',
              )
            }
          />
        ))}

        <View style={styles.btnContainer}>
          <Button
            title={step === steps.length - 1 ? 'SUBMIT' : 'NEXT'}
            onPress={handleNext}
          />
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
  stepHeader: {
    backgroundColor: LIGHT_GREEN_BG,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  stepHeaderText: { color: '#29A539', fontWeight: 'bold', fontSize: 12 },
  btnContainer: { marginTop: 10 },
});

export default MedicalHistoryScreen;
