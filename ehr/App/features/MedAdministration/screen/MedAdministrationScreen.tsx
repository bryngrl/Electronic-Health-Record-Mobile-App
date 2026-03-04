// MedAdministration/screen/MedAdministrationScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Pressable,
  BackHandler,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MedAdministrationInputCard from '../components/MedAdministrationInputCard';
import { useMedAdministration } from '../hook/useMedAdministration';
import apiClient from '../../../api/apiClient';
import SweetAlert from '../../../components/SweetAlert';
import PatientSearchBar from '../../../components/PatientSearchBar';

const THEME_GREEN = '#035022';
const LIGHT_GREEN_BG = '#E5FFE8';

const MedAdministrationScreen = ({ onBack }: any) => {
  const {
    step,
    timeSlots,
    formData,
    setFormData,
    updateCurrentMed,
    nextStep,
    saveMedAdministration,
    fetchPatientData,
  } = useMedAdministration();

  const [scrollEnabled, setScrollEnabled] = useState(true);
  const lastFetched = useRef<{ id: number | null; date: string }>({
    id: null,
    date: '',
  });

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

  useEffect(() => {
    const backAction = () => {
      onBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [onBack]);

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' = 'error',
  ) => {
    setAlertConfig({ visible: true, title, message, type });
  };

  // Fetch patient data when patient or date changes
// ... (rest of the file)
  useEffect(() => {
    if (
      formData.patient_id &&
      (formData.patient_id !== lastFetched.current.id ||
        formData.date !== lastFetched.current.date)
    ) {
      lastFetched.current = { id: formData.patient_id, date: formData.date };
      fetchPatientData(formData.patient_id, formData.date);
    }
  }, [formData.patient_id, formData.date, fetchPatientData]);

  const handlePatientSelect = (id: number | null, name: string) => {
    if (id) {
      setFormData(prev => ({
        ...prev,
        patient_id: id,
        patientName: name,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        patient_id: null,
        patientName: '',
        medications: [
          {
            id: null,
            medication: '',
            dose: '',
            route: '',
            frequency: '',
            comments: '',
          },
          {
            id: null,
            medication: '',
            dose: '',
            route: '',
            frequency: '',
            comments: '',
          },
          {
            id: null,
            medication: '',
            dose: '',
            route: '',
            frequency: '',
            comments: '',
          },
        ],
      }));
    }
  };

  const currentMed = formData.medications[step];
  const isFormValid =
    formData.patient_id &&
    currentMed.medication &&
    currentMed.medication.trim() !== '';

  const handleAction = async () => {
    if (!formData.patient_id) {
      return showAlert(
        'Patient Required',
        'Please select a patient first in the search bar.',
      );
    }

    // Validation: Medication name is required to proceed
    if (!currentMed.medication || currentMed.medication.trim() === '') {
      return showAlert(
        'Input Required',
        'Please enter the medication name before proceeding.',
      );
    }

    if (step === 2) {
      try {
        await saveMedAdministration();
        showAlert(
          'Success',
          'Medication Administration records saved successfully.',
          'success',
        );
      } catch (error: any) {
        showAlert(
          'Error',
          error.message || 'Failed to save medication administration.',
        );
      }
    } else {
      nextStep();
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

  const onDisabledPress = () => {
    showAlert(
      'Patient Required',
      'Please select a patient first in the search bar.',
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={scrollEnabled}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Medication {'\n'}Administration</Text>
            <Text style={styles.dateText}>{formatDate()}</Text>
          </View>
        </View>

        <PatientSearchBar
          initialPatientName={formData.patientName}
          onPatientSelect={handlePatientSelect}
          onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
        />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DATE :</Text>
          <View style={styles.pillInput}>
            <Text style={styles.dateVal}>{formData.date}</Text>
          </View>
        </View>

        {/* Time Progress Banner */}
        <View style={styles.timeBanner}>
          <Text style={styles.timeText}>{timeSlots[step]}</Text>
        </View>

        {/* Input Cards */}
        <MedAdministrationInputCard
          label="Medication"
          value={currentMed.medication}
          onChangeText={t => updateCurrentMed('medication', t)}
          editable={!!formData.patient_id}
          onDisabledPress={onDisabledPress}
        />
        <MedAdministrationInputCard
          label="Dose"
          value={currentMed.dose}
          onChangeText={t => updateCurrentMed('dose', t)}
          editable={!!formData.patient_id}
          onDisabledPress={onDisabledPress}
        />
        <MedAdministrationInputCard
          label="Route"
          value={currentMed.route}
          onChangeText={t => updateCurrentMed('route', t)}
          editable={!!formData.patient_id}
          onDisabledPress={onDisabledPress}
        />
        <MedAdministrationInputCard
          label="Frequency"
          value={currentMed.frequency}
          onChangeText={t => updateCurrentMed('frequency', t)}
          editable={!!formData.patient_id}
          onDisabledPress={onDisabledPress}
        />
        <MedAdministrationInputCard
          label="Comments"
          value={currentMed.comments}
          onChangeText={t => updateCurrentMed('comments', t)}
          multiline
          editable={!!formData.patient_id}
          onDisabledPress={onDisabledPress}
        />

        {/* Footer Navigation Button */}
        <TouchableOpacity
          style={[styles.actionBtn, !isFormValid && styles.disabledButton]}
          onPress={handleAction}
          disabled={
            !isFormValid &&
            !!formData.patient_id &&
            currentMed.medication !== ''
          } // Allow press if patient not selected to show alert
        >
          <Text
            style={[styles.actionBtnText, !isFormValid && { color: '#9E9E9E' }]}
          >
            {step === 2 ? 'SUBMIT' : 'NEXT'}
          </Text>
          {step < 2 && (
            <Icon
              name="chevron-right"
              size={24}
              color={isFormValid ? THEME_GREEN : '#9E9E9E'}
            />
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation Mockup */}
      <View style={styles.bottomNav}>
        <Icon name="home" size={28} color={THEME_GREEN} />
        <Icon name="search" size={28} color={THEME_GREEN} />
        <View style={styles.addBtnContainer}>
          <Icon name="person-add" size={28} color={THEME_GREEN} />
        </View>
        <Icon name="grid-view" size={28} color={THEME_GREEN} />
        <Icon name="calendar-today" size={28} color={THEME_GREEN} />
      </View>

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
    marginBottom: 20,
  },
  title: {
    fontSize: 35,
    color: '#035022',
    fontFamily: 'MinionPro-SemiboldItalic',
  },
  dateText: {
    fontSize: 13,
    fontFamily: 'AlteHaasGroteskBold',
    color: '#999',
  },
  section: { marginBottom: 15, zIndex: 10 },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'AlteHaasGroteskBold',
    color: '#0A8219',
    marginBottom: 8,
  },
  inputField: {
    borderRadius: 25,
    paddingHorizontal: 20,
    height: 45,
    borderWidth: 1,
    borderColor: '#F2F2F2',
    fontSize: 14,
  },
  pillInput: {
    borderWidth: 1.5,
    borderColor: '#EBEBEB',
    borderRadius: 25,
    height: 45,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  dateVal: {
    color: '#333',
    fontFamily: 'AlteHaasGrotesk',
    fontSize: 14,
  },
  timeBanner: {
    backgroundColor: LIGHT_GREEN_BG,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginVertical: 15,
  },
  timeText: {
    color: '#29A539',
    fontFamily: 'AlteHaasGroteskBold',

    fontSize: 14,
  },
  actionBtn: {
    height: 52,
    backgroundColor: LIGHT_GREEN_BG,
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#29A539',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#F0F0F0',
    borderColor: '#E0E0E0',
    opacity: 0.6,
  },
  actionBtnText: {
    color: THEME_GREEN,
    fontWeight: 'bold',
    fontSize: 15,
    marginRight: 5,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 70,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 10,
  },
  addBtnContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    top: -20,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 4,
  },
});

export default MedAdministrationScreen;
