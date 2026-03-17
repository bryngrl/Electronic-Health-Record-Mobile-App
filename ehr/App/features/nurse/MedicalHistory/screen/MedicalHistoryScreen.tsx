import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  BackHandler,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import HistoryInputCard from '../components/HistoryInputCard';
import Button from '@components/button';
import { useMedicalHistory } from '../hook/useMedicalHistory';
import SweetAlert from '@components/SweetAlert';
import PatientSearchBar from '@components/PatientSearchBar';
import { useAppTheme } from '@App/theme/ThemeContext';

interface MedicalHistoryProps {
  onBack: () => void;
  readOnly?: boolean;
  patientId?: number;
  initialPatientName?: string;
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

const MedicalHistoryScreen: React.FC<MedicalHistoryProps> = ({ onBack, readOnly = false, patientId, initialPatientName }) => {
  const { isDarkMode, theme, commonStyles } = useAppTheme();
  const styles = useMemo(
    () => createStyles(theme, commonStyles, isDarkMode),
    [theme, commonStyles, isDarkMode],
  );

  const { saveMedicalHistoryStep, fetchMedicalHistory } = useMedicalHistory();
  const [step, setStep] = useState(0);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null,
  );
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const prevPatientIdRef = useRef<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

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
  const [lastSavedData, setLastSavedData] = useState(initialFormData);
  const [isNAStep, setIsNAStep] = useState<Record<string, boolean>>({
    present: false,
    past: false,
    allergies: false,
    vaccination: false,
    developmental: false,
  });

  const toggleNA = () => {
    const currentKey = steps[step].key;
    const newState = !isNAStep[currentKey];

    setIsNAStep(prev => ({ ...prev, [currentKey]: newState }));

    if (newState) {
      // Set all fields in this step to "N/A"
      const fields = STEP_FIELDS[currentKey];
      const updatedSection = {
        ...(formData[currentKey as keyof typeof formData] as any),
      };
      fields.forEach(f => {
        updatedSection[f] = 'N/A';
      });
      setFormData(prev => ({ ...prev, [currentKey]: updatedSection }));
    } else {
      // Clear fields if they were "N/A"
      const fields = STEP_FIELDS[currentKey];
      const updatedSection = {
        ...(formData[currentKey as keyof typeof formData] as any),
      };
      fields.forEach(f => {
        if (updatedSection[f] === 'N/A') {
          updatedSection[f] = '';
        }
      });
      setFormData(prev => ({ ...prev, [currentKey]: updatedSection }));
    }
  };

  useEffect(() => {
    if (readOnly && patientId) {
      setSelectedPatientId(patientId);
    }
  }, [readOnly, patientId]);

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

  const loadPatientData = useCallback(
    async (patientId: number) => {
      const data = await fetchMedicalHistory(patientId);
      if (data) {
        // Helper to handle both object and single-element array responses
        const getFirst = (val: any) => (Array.isArray(val) ? val[0] : val);

        const newFormData = {
          present: getFirst(data.present_illness) || initialFormData.present,
          past: getFirst(data.past_history || data.past_medical_surgical || data.past_medical) || initialFormData.past,
          allergies: getFirst(data.allergies || data.known_condition_allergies) || initialFormData.allergies,
          vaccination:
            getFirst(data.vaccination) || initialFormData.vaccination,
          developmental:
            getFirst(data.developmental_history || data.developmental) ||
            initialFormData.developmental,
        };
        setFormData(newFormData);

        // Check for N/A state
        const newISNA: Record<string, boolean> = {};
        Object.keys(STEP_FIELDS).forEach(key => {
          const section = newFormData[key as keyof typeof newFormData];
          const fields = STEP_FIELDS[key];
          const allNA =
            fields.length > 0 &&
            fields.every(f => (section as any)[f] === 'N/A');
          newISNA[key] = allNA;
        });
        setIsNAStep(newISNA);
        setLastSavedData(newFormData);
      } else {
        setFormData(initialFormData);
        setLastSavedData(initialFormData);
        setIsNAStep({
          present: false,
          past: false,
          allergies: false,
          vaccination: false,
          developmental: false,
        });
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
        setIsNAStep({
          present: false,
          past: false,
          allergies: false,
          vaccination: false,
          developmental: false,
        });
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

    const currentKey = steps[step].key;
    const currentData = formData[currentKey as keyof typeof formData];

    try {
      if (isModified) {
        // Save only if the current step has been modified
        await saveMedicalHistoryStep(selectedPatientId, currentKey, currentData);

        // Update lastSavedData for this step immediately
        setLastSavedData(prev => ({
          ...prev,
          [currentKey]: { ...currentData },
        }));
      }

      if (step < steps.length - 1) {
        setStep(step + 1);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      } else {
        if (isModified) {
          showAlert(
            'Success',
            'Medical History has been saved successfully.',
            'success',
          );
          loadPatientData(selectedPatientId);
        } else {
          // If it's the last step and no changes, just close
          onBack();
        }
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

  const isModified = useMemo(() => {
    if (!selectedPatientId) return false;
    const currentData = formData[currentStepKey as keyof typeof formData];
    const savedData = lastSavedData[currentStepKey as keyof typeof lastSavedData];
    return JSON.stringify(currentData) !== JSON.stringify(savedData);
  }, [formData, lastSavedData, currentStepKey, selectedPatientId]);

  const isDataEntered = useMemo(() => {
    const currentData = formData[currentStepKey as keyof typeof formData];
    return Object.values(currentData).some(
      v => typeof v === 'string' && v.trim() !== '' && v !== 'N/A',
    );
  }, [formData, currentStepKey]);

  const isNA = isNAStep[currentStepKey];

  const fadeColors = isDarkMode
    ? ['rgba(18, 18, 18, 0)', 'rgba(18, 18, 18, 0.8)', 'rgba(18, 18, 18, 1)']
    : [
        'rgba(255, 255, 255, 0)',
        'rgba(255, 255, 255, 0.8)',
        'rgba(255, 255, 255, 1)',
      ];

  const headerFadeColors = isDarkMode
    ? ['rgba(18, 18, 18, 1)', 'rgba(18, 18, 18, 0)']
    : ['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0)'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={{ zIndex: 10 }}>
        <View
          style={{
            paddingHorizontal: 40,
            backgroundColor: theme.background,
            paddingBottom: 15,
          }}
        >
          <View style={[styles.header, { marginBottom: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Medical History</Text>
              <Text style={styles.dateText}>{formatDate()}</Text>
              {readOnly && (
                <Text style={{ fontSize: 14, color: '#E8572A', fontFamily: 'AlteHaasGroteskBold', marginTop: 5 }}>
                  [READ ONLY]
                </Text>
              )}
            </View>
          </View>
        </View>
        <LinearGradient
          colors={headerFadeColors}
          style={{ height: 20 }}
          pointerEvents="none"
        />
      </View>

      <View style={{ flex: 1, marginTop: -20 }}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={scrollEnabled}
        >
          <View style={{ height: 20 }} />
          <PatientSearchBar
            onPatientSelect={id => setSelectedPatientId(id)}
            onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
            initialPatientName={readOnly ? (initialPatientName || '') : undefined}
          />

          {!readOnly && (
          <TouchableOpacity
            style={[styles.naRow, !selectedPatientId && { opacity: 0.5 }]}
            onPress={() => {
              if (!selectedPatientId) {
                showAlert(
                  'Patient Required',
                  'Please select a patient first in the search bar.',
                );
              } else {
                toggleNA();
              }
            }}
          >
            <Text
              style={[
                styles.naText,
                !selectedPatientId && { color: theme.textMuted },
              ]}
            >
              Mark all as N/A
            </Text>
            <Icon
              name={
                isNAStep[currentStepKey]
                  ? 'check-box'
                  : 'check-box-outline-blank'
              }
              size={22}
              color={selectedPatientId ? theme.primary : theme.textMuted}
            />
          </TouchableOpacity>
          )}

          {!readOnly && (
          <Text
            style={[
              styles.disabledTextAtBottom,
              isNAStep[currentStepKey] && { color: theme.error },
            ]}
          >
            {isNAStep[currentStepKey]
              ? 'All fields below are disabled.'
              : 'Checking this will disable all fields below.'}
          </Text>
          )}

          <View style={styles.stepHeader}>
            <Text style={styles.stepHeaderText}>{steps[step].title}</Text>
          </View>

          {currentFields.map(field => (
            <HistoryInputCard
              key={`${currentStepKey}-${field}`}
              label={
                FIELD_LABELS[field] || field.replace('_', ' ').toUpperCase()
              }
              value={
                (formData[currentStepKey as keyof typeof formData] as any)[
                  field
                ] || ''
              }
              onChangeText={(val: string) => updateField(field, val)}
              disabled={!selectedPatientId || isNAStep[currentStepKey] || readOnly}
              onDisabledPress={() => {
                if (!selectedPatientId) {
                  showAlert(
                    'Patient Required',
                    'Please select a patient first in the search bar.',
                  );
                }
              }}
            />
          ))}

          {!readOnly ? (
            <View style={styles.btnContainer}>
              <Button
                title={step === steps.length - 1 ? 'SUBMIT' : 'NEXT'}
                onPress={handleNext}
                disabled={!selectedPatientId}
              />
            </View>
          ) : (
            <View style={{ marginTop: 10 }}>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                <TouchableOpacity
                  style={[styles.navBtn, step === 0 && { backgroundColor: theme.buttonDisabledBg, borderColor: theme.buttonDisabledBorder }]}
                  onPress={() => { setStep(step - 1); scrollViewRef.current?.scrollTo({ y: 0, animated: true }); }}
                  disabled={step === 0}
                >
                  <Text style={[styles.navBtnText, step === 0 && { color: theme.textMuted }]}>‹ PREV</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.navBtn, step === steps.length - 1 && { backgroundColor: theme.buttonDisabledBg, borderColor: theme.buttonDisabledBorder }]}
                  onPress={() => { setStep(step + 1); scrollViewRef.current?.scrollTo({ y: 0, animated: true }); }}
                  disabled={step === steps.length - 1}
                >
                  <Text style={[styles.navBtnText, step === steps.length - 1 && { color: theme.textMuted }]}>NEXT ›</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.navBtn} onPress={onBack}>
                <Text style={styles.navBtnText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
        <LinearGradient
          colors={fadeColors}
          style={styles.fadeBottom}
          pointerEvents="none"
        />
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

const createStyles = (theme: any, commonStyles: any, isDarkMode: boolean) =>
  StyleSheet.create({
    safeArea: commonStyles.safeArea,
    container: commonStyles.container,
    header: commonStyles.header,
    title: commonStyles.title,
    dateText: {
      fontSize: 13,
      fontFamily: 'AlteHaasGroteskBold',
      color: theme.textMuted,
    },
    stepHeader: {
      backgroundColor: theme.tableHeader,
      paddingVertical: 10,
      borderRadius: 25,
      alignItems: 'center',
      marginBottom: 10,
      marginTop: 20,
    },
    stepHeaderText: {
      color: theme.secondary,
      fontFamily: 'AlteHaasGroteskBold',
      fontSize: 14,
    },
    naRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginBottom: 5,
      marginTop: 5,
    },
    naText: {
      fontSize: 14,
      fontFamily: 'AlteHaasGroteskBold',
      color: theme.primary,
      marginRight: 8,
    },
    disabledTextAtBottom: {
      fontSize: 13,
      fontFamily: 'AlteHaasGroteskBold',
      color: theme.textMuted,
      textAlign: 'right',
    },
    btnContainer: { marginTop: 10 },
    navBtn: {
      flex: 1,
      backgroundColor: theme.buttonBg,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.buttonBorder,
    },
    navBtnText: {
      color: theme.primary,
      fontFamily: 'AlteHaasGroteskBold',
      fontSize: 15,
    },
    fadeBottom: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
    },
  });

export default MedicalHistoryScreen;
