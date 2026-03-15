import { useState, useEffect, useRef, useCallback } from 'react';
import { BackHandler, Animated, ScrollView } from 'react-native';
import { useIntakeAndOutputLogic } from '../hook/useIntakeAndOutputLogic';

export const useIntakeAndOutputScreen = (onBack: () => void, readOnly: boolean, patientId?: number, initialPatientName?: string) => {
  const {
    patientName,
    selectedPatientId,
    selectedPatient,
    handleSelectPatient,
    intakeOutput,
    handleUpdateField,
    isDataEntered,
    saveAssessment,
    analyzeField,
    assessmentAlert,
    assessmentSeverity,
    currentAlert,
    dataAlert,
    setBackendAlert,
    triggerPatientAlert,
    loading,
    recordId,
    currentDayNo,
    isExistingRecord,
    setIsExistingRecord,
    ADPIE_STAGES,
    setIntakeOutput,
  } = useIntakeAndOutputLogic();

  const [alertVisible, setAlertVisible] = useState(false);
  const [cdssModalVisible, setCdssModalVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState({
    title: '',
    message: '',
  });
  const [isAdpieActive, setIsAdpieActive] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [isNA, setIsNA] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const fieldTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [backendAlert, setLocalBackendAlert] = useState<string | null>(null);
  const [backendSeverity, setLocalBackendSeverity] = useState<string | null>(null);
  const [isAlertLoading, setIsAlertLoading] = useState(false);
  const analyzeCountRef = useRef(0);
  const bellFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (readOnly && patientId) {
      handleSelectPatient(patientId, initialPatientName || '', null);
    }
  }, [readOnly, patientId]);

  const calculateDayNumber = useCallback(() => {
    if (!selectedPatient?.admission_date) return '';
    const admission = new Date(selectedPatient.admission_date);
    const today = new Date();
    admission.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffDays =
      Math.floor(
        (today.getTime() - admission.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1;
    return diffDays > 0 ? diffDays.toString() : '1';
  }, [selectedPatient]);

  const handleFieldChange = useCallback(
    (field: string, value: string) => {
      handleUpdateField(field, value);
      if (!selectedPatientId) return;
      if (fieldTimers.current[field]) clearTimeout(fieldTimers.current[field]);
      setIsAlertLoading(true);
      analyzeCountRef.current += 1;
      const thisCount = analyzeCountRef.current;
      fieldTimers.current[field] = setTimeout(async () => {
        const currentData = { ...intakeOutput, [field]: value };
        const toInt = (v: string) => {
          const n = parseInt(v, 10);
          return isNaN(n) ? null : n;
        };
        const payload = {
          patient_id: parseInt(selectedPatientId, 10),
          day_no: parseInt(calculateDayNumber(), 10) || 1,
          oral_intake: toInt(currentData.oral_intake),
          iv_fluids_volume: toInt(currentData.iv_fluids_volume),
          urine_output: toInt(currentData.urine_output),
        };
        const result = await analyzeField(payload);
        if (result) {
          setLocalBackendAlert(result.alert);
          setLocalBackendSeverity(result.severity);
        }
        if (thisCount === analyzeCountRef.current) {
          setIsAlertLoading(false);
        }
      }, 800);
    },
    [selectedPatientId, intakeOutput, analyzeField, handleUpdateField, calculateDayNumber],
  );

  const toggleNA = () => {
    const newState = !isNA;
    setIsNA(newState);
    if (newState) {
      setIntakeOutput({
        oral_intake: 'N/A',
        iv_fluids_volume: 'N/A',
        urine_output: 'N/A',
      });
    } else {
      setIntakeOutput(prev => ({
        oral_intake: prev.oral_intake === 'N/A' ? '' : prev.oral_intake,
        iv_fluids_volume:
          prev.iv_fluids_volume === 'N/A' ? '' : prev.iv_fluids_volume,
        urine_output: prev.urine_output === 'N/A' ? '' : prev.urine_output,
      }));
    }
  };

  useEffect(() => {
    if (selectedPatientId) {
      const fields = ['oral_intake', 'iv_fluids_volume', 'urine_output'];
      const allNA = fields.every(f => (intakeOutput as any)[f] === 'N/A');
      setIsNA(allNA);
    } else {
      setIsNA(false);
    }
  }, [selectedPatientId, intakeOutput]);

  const handleBackPress = useCallback(() => {
    if (isAdpieActive) {
      setIsAdpieActive(false);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return true;
    }
    if (cdssModalVisible) {
      setCdssModalVisible(false);
      return true;
    }
    onBack();
    return true;
  }, [isAdpieActive, cdssModalVisible, onBack]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    return () => backHandler.remove();
  }, [handleBackPress]);

  useEffect(() => {
    const now = new Date();
    const days = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
    ];
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December',
    ];
    setCurrentDate(
      `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`,
    );
  }, []);

  const handleAlertPress = () => {
    if (!selectedPatientId) {
      triggerPatientAlert();
      setAlertVisible(true);
      return;
    }
    setCdssModalVisible(true);
  };

  const handleCDSSPress = () => {
    if (!selectedPatientId) {
      triggerPatientAlert();
      setAlertVisible(true);
      return;
    }
    setCdssModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!selectedPatientId) {
      triggerPatientAlert();
      setAlertVisible(true);
      return;
    }
    const dayNo = parseInt(calculateDayNumber(), 10) || 1;
    const res = await saveAssessment(dayNo);
    if (res) {
      setSuccessMessage({
        title: isExistingRecord ? 'Record Updated' : 'Record Saved',
        message: 'Intake and Output data has been successfully processed.',
      });
      setSuccessVisible(true);
    }
  };

  const isValidDataAlert = (v: string | null | undefined): v is string =>
    !!v &&
    !v.toLowerCase().includes('no findings') &&
    !v.toLowerCase().includes('no result') &&
    !v.toLowerCase().includes('no alert') &&
    v.trim() !== '';

  const hasRealAlert =
    isValidDataAlert(backendAlert) ||
    isValidDataAlert(assessmentAlert) ||
    isValidDataAlert(dataAlert);
  const isAlertActive = !!selectedPatientId && hasRealAlert;

  const getCleanedAlertText = () => {
    const parts = [
      backendAlert,
      assessmentAlert,
      isValidDataAlert(dataAlert) ? dataAlert : null,
    ].filter(Boolean);
    if (!parts.length) return 'No clinical findings found.';
    return parts
      .join('\n\n')
      .replace(/[🔴🟠✓⚠️❌]/g, '')
      .replace(/\[(CRITICAL|WARNING|INFO)\]/gi, '$1')
      .trim();
  };

  return {
    patientName,
    selectedPatientId,
    selectedPatient,
    handleSelectPatient,
    intakeOutput,
    isDataEntered,
    loading,
    recordId,
    currentDayNo,
    isExistingRecord,
    alertVisible, setAlertVisible,
    cdssModalVisible, setCdssModalVisible,
    successVisible, setSuccessVisible,
    successMessage,
    isAdpieActive, setIsAdpieActive,
    currentDate,
    scrollEnabled, setScrollEnabled,
    isNA, toggleNA,
    scrollViewRef,
    isAlertLoading,
    bellFadeAnim,
    handleFieldChange,
    calculateDayNumber,
    handleAlertPress,
    handleCDSSPress,
    handleSubmit,
    getCleanedAlertText,
    backendSeverity,
    assessmentSeverity,
    assessmentAlert,
    isAlertActive,
  };
};
