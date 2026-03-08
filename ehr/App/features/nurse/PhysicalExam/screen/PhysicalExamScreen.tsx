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
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import ExamInputCard from '../components/PhysicalInputCard';
import ADPIEScreen from '@components/ADPIEScreen';
import { usePhysicalExam } from '../hook/usePhysicalExam';
import SweetAlert from '@components/SweetAlert';
import PatientSearchBar from '@components/PatientSearchBar';
import { useAppTheme } from '@App/theme/ThemeContext';

const alertIcon = require('@assets/icons/alert.png');

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

interface PhysicalExamProps {
  onBack: () => void;
  readOnly?: boolean;
  patientId?: number;
  initialPatientName?: string;
}

const PhysicalExamScreen: React.FC<PhysicalExamProps> = ({ 
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

  const {
    saveAssessment,
    checkAssessmentAlerts,
    fetchLatestPhysicalExam,
    dataAlert,
    fetchDataAlert,
  } = usePhysicalExam();
  const [searchText, setSearchText] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const prevPatientIdRef = useRef<string | null>(null);

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'error',
  });

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' = 'error',
  ) => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const [examId, setExamId] = useState<number | null>(null);
  const [backendAlerts, setBackendAlerts] = useState<any>({});
  const [assessmentAlert, setAssessmentAlert] = useState<string | null>(null);
  const [isAdpieActive, setIsAdpieActive] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [isNA, setIsNA] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // --- DOCTOR VIEWING LOGIC ---
  useEffect(() => {
    if (readOnly && patientId) {
      setSelectedPatientId(patientId.toString());
      setSearchText(initialPatientName || '');
    }
  }, [readOnly, patientId, initialPatientName]);

  const toggleNA = () => {
    if (readOnly) return;
    const newState = !isNA;
    setIsNA(newState);

    if (newState) {
      const updatedData = { ...formData };
      Object.keys(initialFormData).forEach(key => {
        (updatedData as any)[key] = 'N/A';
      });
      setFormData(updatedData);
    } else {
      const updatedData = { ...formData };
      Object.keys(initialFormData).forEach(key => {
        if ((updatedData as any)[key] === 'N/A') {
          (updatedData as any)[key] = '';
        }
      });
      setFormData(updatedData);
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
      fetchDataAlert(pid);
      const data = await fetchLatestPhysicalExam(pid);
      if (data) {
        setExamId(data.id);
        const newFormData = {
          general_appearance: data.general_appearance || '',
          skin_condition: data.skin_condition || '',
          eye_condition: data.eye_condition || '',
          oral_condition: data.oral_condition || '',
          cardiovascular: data.cardiovascular || '',
          abdomen_condition: data.abdomen_condition || '',
          extremities: data.extremities || '',
          neurological: data.neurological || '',
        };
        setFormData(newFormData);

        const allNA = Object.values(newFormData).every(v => v === 'N/A');
        setIsNA(allNA);

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
        setIsNA(false);
        setBackendAlerts({});
      }
    },
    [fetchLatestPhysicalExam, fetchDataAlert],
  );

  useEffect(() => {
    if (selectedPatientId !== prevPatientIdRef.current) {
      prevPatientIdRef.current = selectedPatientId;
      if (selectedPatientId) {
        loadPatientData(parseInt(selectedPatientId, 10));
      } else {
        setExamId(null);
        setFormData(initialFormData);
        setIsNA(false);
        setBackendAlerts({});
      }
    }
  }, [selectedPatientId, loadPatientData]);

  // REAL-TIME CDSS: Disabled in Read Only
  useEffect(() => {
    if (!selectedPatientId || isNA || readOnly) return;

    const timer = setTimeout(async () => {
      const hasContent = Object.values(formData).some(
        v => v && v.trim().length > 0 && v !== 'N/A',
      );
      if (hasContent) {
        try {
          const result = await checkAssessmentAlerts({
            patient_id: selectedPatientId,
            ...formData,
          }, examId);
          if (result) setBackendAlerts(result);
        } catch (e) {
          console.error('CDSS Real-time Error:', e);
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData, selectedPatientId, checkAssessmentAlerts, isNA, examId, readOnly]);

  const handleCDSSPress = async () => {
    if (readOnly) {
        if (examId) {
            setIsAdpieActive(true);
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        } else {
            showAlert('No Data', 'No Physical Exam record found for this patient.');
        }
        return;
    }

    if (!selectedPatientId) {
      return showAlert(
        'Patient Required',
        'Please select a patient first in the search bar.',
      );
    }

    try {
      const result = await saveAssessment(
        {
          patient_id: selectedPatientId,
          ...formData,
        },
        examId,
      );

      const id = result?.id || result?.physical_exam_id || examId;
      if (id) {
        setExamId(id);
        if (result?.assessment_alert || result?.alert) {
          setAssessmentAlert(result.assessment_alert || result.alert);
        }
        setIsAdpieActive(true);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      } else {
        showAlert('Error', 'Could not retrieve assessment ID.');
      }
    } catch (e) {
      console.error('CDSS Press Error:', e);
      showAlert('Error', 'Could not initiate clinical support.');
    }
  };

  const handleSave = async () => {
    if (readOnly) {
        onBack();
        return;
    }

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
      }, examId);

      const newId = result.id || result.physical_exam_id;
      const isUpdate = !!examId || result.updated_at !== result.created_at;

      if (newId) setExamId(newId);

      showAlert(
        isUpdate ? 'SUCCESSFULLY UPDATED' : 'SUCCESSFULLY SUBMITTED',
        `Physical Exam has been ${
          isUpdate ? 'updated' : 'submitted'
        } successfully.`,
        'success',
      );

      loadPatientData(parseInt(selectedPatientId, 10));
    } catch (e) {
      showAlert('Error', 'Submission failed. Please check your connection.');
    }
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const updateField = (field: string, val: string) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

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

  const generateFindingsSummary = () => {
    const findings = Object.entries(formData)
      .filter(([_, value]) => value && value.trim() !== '' && value !== 'N/A')
      .map(([key, value]) => {
        const label = key.replace(/_/g, ' ').toUpperCase();
        return `${label}: ${value}`;
      });
    
    const alerts = Object.entries(backendAlerts)
      .filter(([_, value]) => typeof value === 'string' && value.trim() !== '' && !value.toLowerCase().includes('normal'))
      .map(([_, value]) => value as string);

    const summary = [...findings, ...alerts];
    if (dataAlert) summary.push(dataAlert);

    return summary.join('. ');
  };

  if (isAdpieActive && examId && selectedPatientId) {
    return (
      <ADPIEScreen
        recordId={examId}
        patientName={searchText}
        feature="physical-exam"
        findingsSummary={generateFindingsSummary()}
        initialAlert={assessmentAlert || undefined}
        onBack={() => {
          setIsAdpieActive(false);
          setAssessmentAlert(null);
        }}
        readOnly={readOnly}
      />
    );
  }

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
              <Text style={styles.title}>Physical Exam</Text>
              <Text style={styles.subTitleDate}>{getCurrentDate()}</Text>
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
          keyboardShouldPersistTaps="handled"
          style={styles.container}
          showsVerticalScrollIndicator={false}
          scrollEnabled={scrollEnabled}
        >
          <View style={{ height: 20 }} />
          
          {!readOnly ? (
            <PatientSearchBar
                onPatientSelect={(id, name) => {
                setSelectedPatientId(id ? id.toString() : null);
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
                name={isNA ? 'check-box' : 'check-box-outline-blank'}
                size={22}
                color={selectedPatientId ? theme.primary : theme.textMuted}
                />
            </TouchableOpacity>
          )}

          {!readOnly && (
            <Text
                style={[
                styles.disabledTextAtBottom,
                isNA && { color: theme.error },
                ]}
            >
                {isNA
                ? 'All fields below are disabled.'
                : 'Checking this will disable all fields below.'}
            </Text>
          )}

          <View style={styles.banner}>
            <Text style={styles.bannerText}>PHYSICAL EXAMINATION</Text>
          </View>

          <ExamInputCard
            label="GENERAL APPEARANCE"
            value={formData.general_appearance}
            disabled={!selectedPatientId || isNA || readOnly}
            alertText={backendAlerts.general_appearance_alert}
            dataAlert={dataAlert}
            onChangeText={t => updateField('general_appearance', t)}
            onDisabledPress={() => {
              if (!selectedPatientId && !readOnly) {
                showAlert(
                  'Patient Required',
                  'Please select a patient first in the search bar.',
                );
              }
            }}
          />
          <ExamInputCard
            label="SKIN"
            value={formData.skin_condition}
            disabled={!selectedPatientId || isNA || readOnly}
            alertText={backendAlerts.skin_alert}
            dataAlert={dataAlert}
            onChangeText={t => updateField('skin_condition', t)}
            onDisabledPress={() => {
              if (!selectedPatientId && !readOnly) {
                showAlert(
                  'Patient Required',
                  'Please select a patient first in the search bar.',
                );
              }
            }}
          />
          <ExamInputCard
            label="EYES"
            value={formData.eye_condition}
            disabled={!selectedPatientId || isNA || readOnly}
            alertText={backendAlerts.eye_alert}
            dataAlert={dataAlert}
            onChangeText={t => updateField('eye_condition', t)}
            onDisabledPress={() => {
              if (!selectedPatientId && !readOnly) {
                showAlert(
                  'Patient Required',
                  'Please select a patient first in the search bar.',
                );
              }
            }}
          />
          <ExamInputCard
            label="ORAL CAVITY"
            value={formData.oral_condition}
            disabled={!selectedPatientId || isNA || readOnly}
            alertText={backendAlerts.oral_alert}
            dataAlert={dataAlert}
            onChangeText={t => updateField('oral_condition', t)}
            onDisabledPress={() => {
              if (!selectedPatientId && !readOnly) {
                showAlert(
                  'Patient Required',
                  'Please select a patient first in the search bar.',
                );
              }
            }}
          />
          <ExamInputCard
            label="CARDIOVASCULAR"
            value={formData.cardiovascular}
            disabled={!selectedPatientId || isNA || readOnly}
            alertText={backendAlerts.cardiovascular_alert}
            dataAlert={dataAlert}
            onChangeText={t => updateField('cardiovascular', t)}
            onDisabledPress={() => {
              if (!selectedPatientId && !readOnly) {
                showAlert(
                  'Patient Required',
                  'Please select a patient first in the search bar.',
                );
              }
            }}
          />
          <ExamInputCard
            label="ABDOMEN"
            value={formData.abdomen_condition}
            disabled={!selectedPatientId || isNA || readOnly}
            alertText={backendAlerts.abdomen_alert}
            dataAlert={dataAlert}
            onChangeText={t => updateField('abdomen_condition', t)}
            onDisabledPress={() => {
              if (!selectedPatientId && !readOnly) {
                showAlert(
                  'Patient Required',
                  'Please select a patient first in the search bar.',
                );
              }
            }}
          />
          <ExamInputCard
            label="EXTREMITIES"
            value={formData.extremities}
            disabled={!selectedPatientId || isNA || readOnly}
            alertText={backendAlerts.extremities_alert}
            dataAlert={dataAlert}
            onChangeText={t => updateField('extremities', t)}
            onDisabledPress={() => {
              if (!selectedPatientId && !readOnly) {
                showAlert(
                  'Patient Required',
                  'Please select a patient first in the search bar.',
                );
              }
            }}
          />
          <ExamInputCard
            label="NEUROLOGICAL"
            value={formData.neurological}
            disabled={!selectedPatientId || isNA || readOnly}
            alertText={backendAlerts.neurological_alert}
            dataAlert={dataAlert}
            onChangeText={t => updateField('neurological', t)}
            onDisabledPress={() => {
              if (!selectedPatientId && !readOnly) {
                showAlert(
                  'Patient Required',
                  'Please select a patient first in the search bar.',
                );
              }
            }}
          />

          <View style={styles.footerRow}>
            <TouchableOpacity
              style={[
                styles.cdssBtn,
                (!selectedPatientId && !readOnly) && {
                  backgroundColor: theme.buttonDisabledBg,
                  borderColor: theme.buttonDisabledBorder,
                },
              ]}
              onPress={handleCDSSPress}
              disabled={!selectedPatientId && !readOnly}
            >
              <Text
                style={[
                  styles.cdssText,
                  (!selectedPatientId && !readOnly)
                    ? { color: theme.textMuted }
                    : { color: theme.primary },
                ]}
              >
                CDSS
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                (!selectedPatientId && !readOnly) && {
                  backgroundColor: theme.buttonDisabledBg,
                  borderColor: theme.buttonDisabledBorder,
                },
              ]}
              onPress={handleSave}
              disabled={!selectedPatientId && !readOnly}
            >
              <Text
                style={[
                  styles.submitText,
                  (!selectedPatientId && !readOnly) && { color: theme.textMuted },
                ]}
              >
                {readOnly ? 'CLOSE' : 'SUBMIT'}
              </Text>
            </TouchableOpacity>
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
    subTitleDate: {
      fontSize: 13,
      fontFamily: 'AlteHaasGroteskBold',
      color: theme.textMuted,
    },
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
    alertIcon: {
      width: 45,
      height: 45,
      borderRadius: 22.5,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
    },
    fullImg: { width: '80%', height: '80%', resizeMode: 'contain' },
    sectionLabel: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.primary,
      marginBottom: 8,
    },
    banner: {
      backgroundColor: theme.tableHeader,
      paddingVertical: 10,
      borderRadius: 25,
      alignItems: 'center',
      marginBottom: 20,
    },
    bannerText: {
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
      marginBottom: 15,
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
      paddingBottom: 40,
    },
    cdssBtn: {
      flex: 1,
      backgroundColor: theme.buttonBg,
      paddingVertical: 15,
      borderRadius: 25,
      alignItems: 'center',
      marginHorizontal: 5,
      borderWidth: 1.5,
      borderColor: theme.buttonBorder,
    },
    submitBtn: {
      flex: 1,
      backgroundColor: theme.buttonBg,
      paddingVertical: 15,
      borderRadius: 25,
      alignItems: 'center',
      marginHorizontal: 5,
      borderWidth: 1.5,
      borderColor: theme.buttonBorder,
    },
    cdssText: {
      color: theme.primary,
      fontFamily: 'AlteHaasGroteskBold',
      fontSize: 16,
    },
    submitText: {
      color: theme.primary,
      fontFamily: 'AlteHaasGroteskBold',
      fontSize: 16,
    },
    fadeBottom: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
    },
  });

export default PhysicalExamScreen;
