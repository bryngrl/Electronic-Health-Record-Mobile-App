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
  BackHandler,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import ExamInputCard from '../components/PhysicalInputCard';
import ADPIEScreen from './ADPIEScreen'; // Integrated Stepper
import { usePhysicalExam } from '../hook/usePhysicalExam';
import SweetAlert from '@components/SweetAlert';
import PatientSearchBar from '@components/PatientSearchBar';
import { useAppTheme } from '@App/theme/ThemeContext';
import apiClient from '@api/apiClient';

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
  const [isAdpieActive, setIsAdpieActive] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

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
        // DOCTOR VIEW: Independent fetching from history
        const history = await fetchExamHistoryForReading(pId);
        if (history.length > 0) {
          applyExamData(history[0]);
        } else {
          setExamId(null);
          setFormData(initialFormData);
          setBackendAlerts({});
        }
      } else {
        // NURSE VIEW
        const data = await fetchLatestPhysicalExam(pId);
        if (data) {
          applyExamData(data);
        } else {
          setExamId(null);
          setFormData(initialFormData);
          setBackendAlerts({});
        }
      }
    },
    [fetchLatestPhysicalExam, fetchExamHistoryForReading, applyExamData, readOnly],
  );

  // Sync if props change
  useEffect(() => {
    if (patientId) {
      setSelectedPatientId(patientId);
      setSearchText(initialPatientName || '');
    }
  }, [patientId, initialPatientName]);

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

  // REAL-TIME CDSS (NURSE ONLY)
  useEffect(() => {
    if (!selectedPatientId || readOnly) return;
    const timer = setTimeout(async () => {
      const hasContent = Object.values(formData).some(v => v && v.trim().length > 0);
      if (hasContent) {
        try {
          const result = await checkAssessmentAlerts({ patient_id: selectedPatientId, ...formData });
          if (result) setBackendAlerts(result);
        } catch (e) {}
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData, selectedPatientId, checkAssessmentAlerts, readOnly]);

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
      }
    } catch (e) {
      showAlert('Error', 'Could not initiate clinical support.');
    }
  };

  const handleSave = async () => {
    if (readOnly) {
      onBack();
      return;
    }
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

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const updateField = (field: string, val: string) => {
    if (!readOnly) setFormData(prev => ({ ...prev, [field]: val }));
  };

  const isDataEntered = Object.values(formData).some(v => v && v.trim().length > 0);

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
                <Text style={styles.dateText}>{formatDate()}</Text>
            </View>
          </View>
        </View>
        <LinearGradient colors={isDarkMode ? ['#121212', 'rgba(18,18,18,0)'] : ['#FFFFFF', 'rgba(255,255,255,0)']} style={{ height: 20 }} pointerEvents="none" />
      </View>

      <View style={{ flex: 1, marginTop: -20 }}>
        <ScrollView keyboardShouldPersistTaps="handled" style={styles.container} showsVerticalScrollIndicator={false} scrollEnabled={scrollEnabled}>
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

          <View style={styles.banner}>
            <Text style={styles.bannerText}>PHYSICAL EXAMINATION</Text>
          </View>

          <ExamInputCard label="GENERAL APPEARANCE" value={formData.general_appearance} disabled={!selectedPatientId} alertText={backendAlerts.general_appearance_alert} onChangeText={t => updateField('general_appearance', t)} readOnly={readOnly} />
          <ExamInputCard label="SKIN" value={formData.skin_condition} disabled={!selectedPatientId} alertText={backendAlerts.skin_alert} onChangeText={t => updateField('skin_condition', t)} readOnly={readOnly} />
          <ExamInputCard label="EYES" value={formData.eye_condition} disabled={!selectedPatientId} alertText={backendAlerts.eye_alert} onChangeText={t => updateField('eye_condition', t)} readOnly={readOnly} />
          <ExamInputCard label="ORAL CAVITY" value={formData.oral_condition} disabled={!selectedPatientId} alertText={backendAlerts.oral_alert} onChangeText={t => updateField('oral_condition', t)} readOnly={readOnly} />
          <ExamInputCard label="CARDIOVASCULAR" value={formData.cardiovascular} disabled={!selectedPatientId} alertText={backendAlerts.cardiovascular_alert} onChangeText={t => updateField('cardiovascular', t)} readOnly={readOnly} />
          <ExamInputCard label="ABDOMEN" value={formData.abdomen_condition} disabled={!selectedPatientId} alertText={backendAlerts.abdomen_alert} onChangeText={t => updateField('abdomen_condition', t)} readOnly={readOnly} />
          <ExamInputCard label="EXTREMITIES" value={formData.extremities} disabled={!selectedPatientId} alertText={backendAlerts.extremities_alert} onChangeText={t => updateField('extremities', t)} readOnly={readOnly} />
          <ExamInputCard label="NEUROLOGICAL" value={formData.neurological} disabled={!selectedPatientId} alertText={backendAlerts.neurological_alert} onChangeText={t => updateField('neurological', t)} readOnly={readOnly} />

          <View style={styles.footerRow}>
            <TouchableOpacity style={[styles.cdssBtn, (isDataEntered || readOnly) && { backgroundColor: theme.buttonBg, borderColor: theme.buttonBorder }]} onPress={handleCDSSPress}>
              <Text style={[styles.cdssText, (isDataEntered || readOnly) && { color: theme.primary }]}>CDSS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
              <Text style={styles.submitText}>SUBMIT</Text>
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
    sectionLabel: { fontSize: 12, fontWeight: 'bold', color: theme.primary, marginBottom: 8 },
    banner: { backgroundColor: theme.tableHeader, paddingVertical: 10, borderRadius: 25, alignItems: 'center', marginBottom: 20 },
    bannerText: { color: theme.secondary, fontFamily: 'AlteHaasGroteskBold', fontSize: 14 },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingBottom: 40 },
    cdssBtn: { flex: 1, backgroundColor: theme.buttonBg, paddingVertical: 15, borderRadius: 25, alignItems: 'center', marginHorizontal: 5, borderWidth: 1, borderColor: theme.buttonBorder },
    submitBtn: { flex: 1, backgroundColor: theme.buttonBg, paddingVertical: 15, borderRadius: 25, alignItems: 'center', marginHorizontal: 5, borderWidth: 1, borderColor: theme.buttonBorder },
    cdssText: { color: theme.primary, fontWeight: 'bold' },
    submitText: { color: theme.primary, fontWeight: 'bold' },
    fadeBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 },
  });

export default PhysicalExamScreen;