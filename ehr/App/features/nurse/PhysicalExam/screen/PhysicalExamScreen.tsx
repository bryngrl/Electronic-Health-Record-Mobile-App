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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import ExamInputCard from '../components/PhysicalInputCard';
import ADPIEScreen from './ADPIEScreen';
import { usePhysicalExam } from '../hook/usePhysicalExam';
import SweetAlert from '@components/SweetAlert';
import PatientSearchBar from '@components/PatientSearchBar';
import { useAppTheme } from '@App/theme/ThemeContext';

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
  patientId?: string;
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

  const { saveAssessment, checkAssessmentAlerts, fetchLatestPhysicalExam, fetchExamHistoryForReading } =
    usePhysicalExam();
  const [searchText, setSearchText] = useState(initialPatientName || '');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    patientId || null,
  );
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const prevPatientIdRef = useRef<string | null>(null);

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
  const [isAdpieActive, setIsAdpieActive] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [isNA, setIsNA] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const toggleNA = () => {
    if (readOnly) return;
    const newState = !isNA;
    setIsNA(newState);

    const updatedData = { ...formData };
    Object.keys(initialFormData).forEach(key => {
      (updatedData as any)[key] = newState ? 'N/A' : ((updatedData as any)[key] === 'N/A' ? '' : (updatedData as any)[key]);
    });
    setFormData(updatedData);
  };

  useEffect(() => {
    const backAction = () => {
      if (isAdpieActive) {
        setIsAdpieActive(false);
        return true;
      }
      onBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [onBack, isAdpieActive]);

  const applyExamData = useCallback((data: any) => {
    if (!data) return;
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
  }, []);

  const loadPatientData = useCallback(
    async (pId: number) => {
      if (readOnly) {
        const history = await fetchExamHistoryForReading(pId);
        if (history && history.length > 0) applyExamData(history[0]);
        else {
          setExamId(null);
          setFormData(initialFormData);
          setBackendAlerts({});
        }
      } else {
        const data = await fetchLatestPhysicalExam(pId);
        if (data) applyExamData(data);
        else {
          setExamId(null);
          setFormData(initialFormData);
          setIsNA(false);
          setBackendAlerts({});
        }
      }
    },
    [fetchLatestPhysicalExam, fetchExamHistoryForReading, applyExamData, readOnly],
  );

  useEffect(() => {
    if (patientId) {
      setSelectedPatientId(patientId);
      setSearchText(initialPatientName || '');
    }
  }, [patientId, initialPatientName]);

  useEffect(() => {
    if (selectedPatientId !== prevPatientIdRef.current) {
      prevPatientIdRef.current = selectedPatientId;
      if (selectedPatientId) loadPatientData(parseInt(selectedPatientId, 10));
      else {
        setExamId(null);
        setFormData(initialFormData);
        setIsNA(false);
        setBackendAlerts({});
      }
    }
  }, [selectedPatientId, loadPatientData]);

  useEffect(() => {
    if (!selectedPatientId || isNA || readOnly) return;
    const timer = setTimeout(async () => {
      const hasContent = Object.values(formData).some(v => v && v.trim().length > 0 && v !== 'N/A');
      if (hasContent) {
        try {
          const result = await checkAssessmentAlerts({ patient_id: selectedPatientId, ...formData });
          if (result) setBackendAlerts(result);
        } catch (e) {}
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData, selectedPatientId, checkAssessmentAlerts, isNA, readOnly]);

  const handleCDSSPress = async () => {
    if (readOnly) {
      if (examId) setIsAdpieActive(true);
      return;
    }
    if (!selectedPatientId) return showAlert('Patient Required', 'Please select a patient first.');
    try {
      const result = await saveAssessment({ patient_id: selectedPatientId, ...formData });
      const id = result.id || result.physical_exam_id;
      if (id) {
        setExamId(id);
        setIsAdpieActive(true);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    } catch (e) {
      showAlert('Error', 'Could not initiate clinical support.');
    }
  };

  const handleSave = async () => {
    if (readOnly) { onBack(); return; }
    if (!selectedPatientId) return showAlert('Patient Required', 'Please select a patient first.');
    try {
      const result = await saveAssessment({ patient_id: selectedPatientId, ...formData });
      const newId = result.id || result.physical_exam_id;
      if (newId) setExamId(newId);
      const isUpdate = result.updated_at !== result.created_at;
      showAlert(
        isUpdate ? 'SUCCESSFULLY UPDATED' : 'SUCCESSFULLY SUBMITTED',
        `Physical Exam has been ${isUpdate ? 'updated' : 'submitted'} successfully.`,
        'success',
      );
      loadPatientData(parseInt(selectedPatientId, 10));
    } catch (e) {
      showAlert('Error', 'Submission failed.');
    }
  };

  const updateField = (field: string, val: string) => {
    if (!readOnly) setFormData(prev => ({ ...prev, [field]: val }));
  };

  const isDataEntered = Object.values(formData).some(v => v && v.trim().length > 0 && v !== 'N/A');

  if (isAdpieActive && examId && selectedPatientId) {
    return (
      <ADPIEScreen
        examId={examId}
        patientName={searchText}
        assessmentAlerts={backendAlerts}
        readOnly={readOnly}
        onBack={() => setIsAdpieActive(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ zIndex: 10 }}>
        <View style={{ paddingHorizontal: 40, backgroundColor: theme.background, paddingBottom: 15 }}>
          <View style={[styles.header, { marginBottom: 0 }]}>
            <View style={{ flex: 1 }}>
                <Text style={styles.title}>Physical Exam</Text>
                <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
            </View>
          </View>
        </View>
        <LinearGradient colors={isDarkMode ? ['#121212', 'rgba(18,18,18,0)'] : ['#FFFFFF', 'rgba(255,255,255,0)']} style={{ height: 20 }} pointerEvents="none" />
      </View>

      <View style={{ flex: 1, marginTop: -20 }}>
        <ScrollView ref={scrollViewRef} keyboardShouldPersistTaps="handled" style={styles.container} showsVerticalScrollIndicator={false} scrollEnabled={scrollEnabled}>
          <View style={{ height: 20 }} />
          <PatientSearchBar
            onPatientSelect={(id, name) => {
              if (!readOnly) {
                setSelectedPatientId(id ? id.toString() : null);
                setSearchText(name);
              }
            }}
            initialPatientName={searchText}
            onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
          />

          {!readOnly && (
            <>
              <TouchableOpacity
                style={[styles.naRow, !selectedPatientId && { opacity: 0.5 }]}
                onPress={() => {
                  if (!selectedPatientId) showAlert('Patient Required', 'Please select a patient first.');
                  else toggleNA();
                }}
              >
                <Text style={[styles.naText, !selectedPatientId && { color: theme.textMuted }]}>Mark all as N/A</Text>
                <Icon name={isNA ? 'check-box' : 'check-box-outline-blank'} size={22} color={selectedPatientId ? theme.primary : theme.textMuted} />
              </TouchableOpacity>
              <Text style={[styles.disabledTextAtBottom, isNA && { color: theme.error }]}>
                {isNA ? 'All fields below are disabled.' : 'Checking this will disable all fields below.'}
              </Text>
            </>
          )}

          <View style={styles.banner}><Text style={styles.bannerText}>PHYSICAL EXAMINATION</Text></View>

          {Object.keys(initialFormData).map((key) => (
            <ExamInputCard
                key={key}
                label={key.replace('_', ' ').toUpperCase()}
                value={(formData as any)[key]}
                disabled={!selectedPatientId || isNA || readOnly}
                alertText={(backendAlerts as any)[`${key}_alert`] || (backendAlerts as any)[`${key.replace('_condition', '')}_alert`]}
                onChangeText={t => updateField(key, t)}
                onDisabledPress={() => { if (!selectedPatientId) showAlert('Patient Required', 'Please select a patient first.'); }}
            />
          ))}

          <View style={styles.footerRow}>
            <TouchableOpacity
              style={[styles.cdssBtn, (!selectedPatientId || (!isDataEntered && !isNA && !readOnly)) && { backgroundColor: theme.buttonDisabledBg, borderColor: theme.buttonDisabledBorder }]}
              onPress={handleCDSSPress}
              disabled={!selectedPatientId}
            >
              <Text style={[styles.cdssText, (!selectedPatientId || (!isDataEntered && !isNA && !readOnly)) ? { color: theme.textMuted } : { color: theme.primary }]}>
                {readOnly ? 'VIEW ADPIE' : 'CDSS'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, !selectedPatientId && { backgroundColor: theme.buttonDisabledBg, borderColor: theme.buttonDisabledBorder }]}
              onPress={handleSave}
              disabled={!selectedPatientId}
            >
              <Text style={[styles.submitText, !selectedPatientId && { color: theme.textMuted }]}>{readOnly ? 'FINISH' : 'SUBMIT'}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
        <LinearGradient colors={isDarkMode ? ['rgba(18,18,18,0)', 'rgba(18,18,18,1)'] : ['rgba(255,255,255,0)', 'rgba(255,255,255,1)']} style={styles.fadeBottom} pointerEvents="none" />
      </View>
      <SweetAlert visible={alertConfig.visible} title={alertConfig.title} message={alertConfig.message} type={alertConfig.type} onConfirm={() => setAlertConfig({ ...alertConfig, visible: false })} />
    </SafeAreaView>
  );
};

const createStyles = (theme: any, commonStyles: any, isDarkMode: boolean) =>
  StyleSheet.create({
    safeArea: commonStyles.safeArea,
    container: commonStyles.container,
    header: commonStyles.header,
    title: commonStyles.title,
    dateText: { fontSize: 13, fontFamily: 'AlteHaasGroteskBold', color: theme.textMuted },
    banner: { backgroundColor: theme.tableHeader, paddingVertical: 10, borderRadius: 25, alignItems: 'center', marginBottom: 20 },
    bannerText: { color: theme.secondary, fontFamily: 'AlteHaasGroteskBold', fontSize: 14 },
    naRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 5, marginTop: 5 },
    naText: { fontSize: 14, fontFamily: 'AlteHaasGroteskBold', color: theme.primary, marginRight: 8 },
    disabledTextAtBottom: { fontSize: 13, fontFamily: 'AlteHaasGroteskBold', color: theme.textMuted, textAlign: 'right', marginBottom: 15 },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingBottom: 40 },
    cdssBtn: { flex: 1, backgroundColor: theme.buttonBg, paddingVertical: 15, borderRadius: 25, alignItems: 'center', marginHorizontal: 5, borderWidth: 1.5, borderColor: theme.buttonBorder },
    submitBtn: { flex: 1, backgroundColor: theme.buttonBg, paddingVertical: 15, borderRadius: 25, alignItems: 'center', marginHorizontal: 5, borderWidth: 1.5, borderColor: theme.buttonBorder },
    cdssText: { color: theme.primary, fontFamily: 'AlteHaasGroteskBold', fontSize: 16 },
    submitText: { color: theme.primary, fontFamily: 'AlteHaasGroteskBold', fontSize: 16 },
    fadeBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 },
  });

export default PhysicalExamScreen;
