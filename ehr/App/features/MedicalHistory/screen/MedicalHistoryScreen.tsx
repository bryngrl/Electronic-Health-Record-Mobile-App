import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
  TextInput,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HistoryInputCard from '../components/HistoryInputCard';
import Button from '../../../components/button';
import apiClient from '../../../api/apiClient';
import { useMedicalHistory } from '../hook/useMedicalHistory';
import SweetAlert from '../../../components/SweetAlert';

const THEME_GREEN = '#035022';
const LIGHT_GREEN_BG = '#E8F5E9';

interface MedicalHistoryProps {
  onBack: () => void;
}

const MedicalHistoryScreen: React.FC<MedicalHistoryProps> = ({ onBack }) => {
  const { saveMedicalHistory } = useMedicalHistory();
  const [step, setStep] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
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

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await apiClient.get('/patients/');
        const raw = response.data || [];
        const normalized = raw.map((p: any) => ({
          ...p,
          id: p.patient_id ?? p.id ?? null,
          fullName: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
        }));
        setPatients(normalized);
      } catch (error) {
        console.error('Fetch Error:', error);
      }
    };
    fetchPatients();
  }, []);

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.length > 0) {
      const filtered = patients.filter(p =>
        p.fullName.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredPatients(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
      setSelectedPatientId(null);
    }
  };

  const onSelectPatient = (patient: any) => {
    setSearchText(patient.fullName);
    setSelectedPatientId(patient.id);
    setShowDropdown(false);
  };

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

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PATIENT NAME :</Text>
          <View style={styles.searchWrap}>
            <View style={styles.searchBar}>
              <TextInput
                style={styles.searchInput}
                placeholder="Select Patient name"
                placeholderTextColor="#BDBDBD"
                value={searchText}
                onChangeText={handleSearch}
                onFocus={() => {
                  if (patients.length > 0) {
                    setFilteredPatients(patients);
                    setShowDropdown(true);
                  }
                }}
              />
            </View>

            {showDropdown && filteredPatients.length > 0 && (
              <View style={styles.dropdown}>
                {filteredPatients.map((item, index) => (
                  <Pressable
                    key={item.id ? item.id.toString() : `p-${index}`}
                    style={({ pressed }) => [
                      styles.dropdownItem,
                      pressed && { opacity: 0.6 },
                    ]}
                    onPress={() => onSelectPatient(item)}
                  >
                    <Text style={styles.dropdownText}>{item.fullName}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>

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
  section: { marginBottom: 15, zIndex: 10 },
  searchWrap: { position: 'relative', zIndex: 999 },
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
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  searchInput: { fontSize: 14, color: '#333' },
  dropdown: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 56,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 8,
    zIndex: 9999,
    maxHeight: 220,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  dropdownText: { fontSize: 14, color: '#333' },
  selectedIndicator: { fontSize: 12, color: '#666', marginTop: 6 },
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
