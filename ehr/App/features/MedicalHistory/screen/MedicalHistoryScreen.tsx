import React, { useState } from 'react';
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
const LIGHT_GREEN_BG = '#E8F5E9';

interface MedicalHistoryProps {
  onBack: () => void;
}

const MedicalHistoryScreen: React.FC<MedicalHistoryProps> = ({ onBack }) => {
  const { saveMedicalHistory } = useMedicalHistory();
  const [step, setStep] = useState(0);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
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

  const [formData, setFormData] = useState({
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
  });

  const steps = [
    { title: 'PRESENT ILLNESS', key: 'present' },
    { title: 'PAST MEDICAL / SURGICAL', key: 'past' },
    { title: 'KNOWN CONDITION OR ALLERGIES', key: 'allergies' },
    { title: 'VACCINATION', key: 'vaccination' },
    { title: 'DEVELOPMENTAL HISTORY', key: 'developmental' },
  ];

  const handleNext = async () => {
    if (!selectedPatientId) {
      return showAlert('Patient Required', 'Please select a patient first in the search bar.');
    }

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      try {
        // Submit all 5 components to the backend router endpoints
        await saveMedicalHistory(selectedPatientId, formData);

        showAlert('Success', 'Medical History components saved successfully.', 'success');
        setTimeout(() => {
          onBack();
        }, 1500);
      } catch (error: any) {
        showAlert('Error', error.message || 'Failed to save history.');
      }
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
    setFormData({
      ...formData,
      [currentKey]: { ...formData[currentKey], [field]: val },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
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
          onPatientSelect={(id) => setSelectedPatientId(id)}
        />

        <View style={styles.stepHeader}>
          <Text style={styles.stepHeaderText}>{steps[step].title}</Text>
        </View>

        {Object.keys(formData[steps[step].key as keyof typeof formData]).map(
          field => (
            <HistoryInputCard
              key={`${steps[step].key}-${field}`}
              label={
                field.replace('_', ' ').charAt(0).toUpperCase() +
                field.replace('_', ' ').slice(1)
              }
              value={
                (formData[steps[step].key as keyof typeof formData] as any)[
                  field
                ]
              }
              onChangeText={(val: string) => updateField(field, val)}
              disabled={!selectedPatientId}
              onDisabledPress={() => showAlert('Patient Required', 'Please select a patient first in the search bar.')}
            />
          ),
        )}

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
  stepHeaderText: { color: THEME_GREEN, fontWeight: 'semibold', fontSize: 12 },
  btnContainer: { marginTop: 10 },
});

export default MedicalHistoryScreen;
