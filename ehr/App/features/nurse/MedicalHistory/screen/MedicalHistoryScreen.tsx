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

const MedicalHistoryScreen: React.FC<MedicalHistoryProps> = ({ 
  onBack,
  readOnly = false,
  patientId,
  initialPatientName
}) => {
  const { isDarkMode, theme, commonStyles } = useAppTheme();
  const styles = useMemo(
    () => createStyles(theme, commonStyles, isDarkMode),
    [theme, commonStyles, isDarkMode],
  );

  const { saveMedicalHistoryStep, fetchMedicalHistory } = useMedicalHistory();
  const [step, setStep] = useState(0);
  const [searchText, setSearchText] = useState(initialPatientName || '');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    patientId || null,
  );
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const prevPatientIdRef = useRef<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

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
  const [isNAStep, setIsNAStep] = useState<Record<string, boolean>>({
    present: false,
    past: false,
    allergies: false,
    vaccination: false,
    developmental: false,
  });

  const toggleNA = () => {
    if (readOnly) return; 
    const currentKey = steps[step].key;
    const newState = !isNAStep[currentKey];

    setIsNAStep(prev => ({ ...prev, [currentKey]: newState }));

    if (newState) {
      const fields = STEP_FIELDS[currentKey];
      const updatedSection = {
        ...(formData[currentKey as keyof typeof formData] as any),
      };
      fields.forEach(f => {
        updatedSection[f] = 'N/A';
      });
      setFormData(prev => ({ ...prev, [currentKey]: updatedSection }));
    } else {
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
    async (pid: number) => {
      const data = await fetchMedicalHistory(pid);
      if (data) {
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
    },
    [fetchMedicalHistory],
  );

  useEffect(() => {
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
    if (readOnly) {
        if (step < steps.length - 1) {
            setStep(step + 1);
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        } else {
            onBack();
        }
        return;
    }

    if (!selectedPatientId) {
      return showAlert(
        'Patient Required',
        'Please select a patient first in the search bar.',
      );
    }

    const currentKey = steps[step].key;
    const currentData = formData[currentKey as keyof typeof formData];

    try {
      // Save only the current step
      await saveMedicalHistoryStep(selectedPatientId, currentKey, currentData);

      if (step < steps.length - 1) {
        setStep(step + 1);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      } else {
        showAlert(
          'Success',
          'Medical History has been saved successfully.',
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
          {/* UPDATED HEADER: Removed Close Icon */}
          <View style={[styles.header, { marginBottom: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Medical History</Text>
              <Text style={styles.dateText}>{formatDate()}</Text>
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
          
          {/* SEARCH BAR / STATIC PATIENT */}
          {!readOnly ? (
            <PatientSearchBar
                onPatientSelect={(id, name) => {
                  setSelectedPatientId(id);
                  setSearchText(name);
                }}
                initialPatientName={searchText}
                onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
            />
          ) : (
             <View style={styles.staticPatientContainer}>
                <Text style={styles.staticPatientLabel}>PATIENT:</Text>
                <Text style={styles.staticPatientName}>{initialPatientName || "Unknown Patient"}</Text>
             </View>
          )}

          {/* HIDE MARK AS N/A IN READ ONLY */}
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
            {/* Optional Step Indicator for Viewing Mode */}
            {readOnly && <Text style={{color: theme.textMuted, fontSize: 10}}>{step + 1} / {steps.length}</Text>}
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
                if (!readOnly && !selectedPatientId) {
                  showAlert(
                    'Patient Required',
                    'Please select a patient first in the search bar.',
                  );
                }
              }}
            />
          ))}

          <View style={styles.btnContainer}>
            <Button
              title={step === steps.length - 1 ? (readOnly ? 'FINISH' : 'SUBMIT') : 'NEXT'}
              onPress={handleNext}
              disabled={!selectedPatientId && !readOnly}
            />
          </View>
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
    // New styles for Static Patient View
    staticPatientContainer: {
        marginBottom: 20,
        backgroundColor: theme.card,
        padding: 15,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border
    },
    staticPatientLabel: {
        fontFamily: 'AlteHaasGroteskBold',
        color: theme.primary,
        fontSize: 12,
        marginRight: 10
    },
    staticPatientName: {
        fontFamily: 'AlteHaasGrotesk',
        color: theme.text,
        fontSize: 16,
        fontWeight: 'bold'
    },
    stepHeader: {
      backgroundColor: theme.tableHeader,
      paddingVertical: 10,
      borderRadius: 25,
      alignItems: 'center',
      marginBottom: 10,
      marginTop: 20,
      flexDirection: 'column', 
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
    fadeBottom: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
    },
  });

export default MedicalHistoryScreen;