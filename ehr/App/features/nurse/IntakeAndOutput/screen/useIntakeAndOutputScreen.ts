import { useState, useEffect, useRef, useCallback } from 'react';
import { BackHandler, Animated, ScrollView } from 'react-native';
import { useIntakeAndOutputLogic } from '../hook/useIntakeAndOutputLogic';

export const useIntakeAndOutputScreen = (onBack: () => void, readOnly: boolean, patientId?: number, initialPatientName?: string, admissionDate?: string) => {
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
    setRecordId,
    currentDayNo,
    isExistingRecord,
    setIsExistingRecord,
    ADPIE_STAGES,
    setIntakeOutput,
    lastSavedData,
  } = useIntakeAndOutputLogic();

  const isModified =
    intakeOutput.oral_intake !== lastSavedData.oral_intake ||
    intakeOutput.iv_fluids_volume !== lastSavedData.iv_fluids_volume ||
    intakeOutput.urine_output !== lastSavedData.urine_output;

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
  const scrollViewRef = useRef<ScrollView>(null);
  const [isNA, setIsNA] = useState(false);
  const preNASnapshotRef = useRef<typeof intakeOutput | null>(null);
  const fieldTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [backendAlert, setLocalBackendAlert] = useState<string | null>(null);
  const [backendSeverity, setLocalBackendSeverity] = useState<string | null>(null);
  const [isAlertLoading, setIsAlertLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Processing...');
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const analyzeCountRef = useRef(0);
  const bellFadeAnim = useRef(new Animated.Value(1)).current;
  const intakeOutputRef = useRef(intakeOutput);

  const [backendAlerts, setBackendAlerts] = useState<Record<string, string | null>>({});
  const [backendSeverities, setBackendSeverities] = useState<Record<string, string | null>>({});

  useEffect(() => {
    intakeOutputRef.current = intakeOutput;
  }, [intakeOutput]);

  useEffect(() => {
    if (readOnly && patientId) {
      handleSelectPatient(patientId, initialPatientName || '', { admission_date: admissionDate });
    }
  }, [readOnly, patientId, admissionDate]);

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
      handleUpdateField(field as any, value);
      if (!selectedPatientId) return;
      if (fieldTimers.current[field]) clearTimeout(fieldTimers.current[field]);
      
      setIsAlertLoading(true);
      analyzeCountRef.current += 1;
      const thisCount = analyzeCountRef.current;

      fieldTimers.current[field] = setTimeout(async () => {
        const currentData = { ...intakeOutputRef.current, [field]: value };
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
          const updatedAlerts = { ...result.alerts };
          // If current field is cleared, make sure its specific alert is also cleared locally
          if (!value.trim()) {
            updatedAlerts[`${field}_alert`] = null;
          }
          setBackendAlerts(prev => ({ ...prev, ...updatedAlerts }));
          setBackendSeverities(prev => ({ ...prev, [field]: result.severity }));
        }
        if (thisCount === analyzeCountRef.current) {
          setIsAlertLoading(false);
        }
      }, 800);
    },
    [selectedPatientId, analyzeField, handleUpdateField, calculateDayNumber],
  );

  const toggleNA = async () => {
    const newState = !isNA;
    setIsNA(newState);
    Object.values(fieldTimers.current).forEach(clearTimeout);
    fieldTimers.current = {};

    let updatedData: typeof intakeOutput;
    if (newState) {
      // Save current state before setting to N/A
      preNASnapshotRef.current = { ...intakeOutput };

      updatedData = {
        oral_intake: 'N/A',
        iv_fluids_volume: 'N/A',
        urine_output: 'N/A',
      };
    } else {
      // Restore from snapshot
      if (preNASnapshotRef.current) {
        updatedData = { ...preNASnapshotRef.current };
        preNASnapshotRef.current = null;
      } else {
        // Fallback: Clear if no snapshot
        updatedData = {
          oral_intake: '',
          iv_fluids_volume: '',
          urine_output: '',
        };
      }
    }
    setIntakeOutput(updatedData);
    intakeOutputRef.current = updatedData;

    if (selectedPatientId) {
      try {
        const dayNo = parseInt(calculateDayNumber(), 10) || 1;
        const result = await saveAssessment(dayNo, updatedData, false);
        const record = result?.data || result;
        const alerts = result?.alerts || record?.alerts || {};
        const updatedAlerts: Record<string, string | null> = {};
        ['oral_intake_alert', 'iv_fluids_volume_alert', 'urine_output_alert', 'alert', 'assessment_alert'].forEach(k => {
          const v = alerts[k] ?? record?.[k];
          updatedAlerts[k] = isValidDataAlert(v) ? v : null;
        });
        setBackendAlerts(updatedAlerts);
      } catch {
        console.error('Failed to auto-save N/A state');
      }
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

  const handleCDSSPress = async () => {
    if (!selectedPatientId) {
      triggerPatientAlert();
      setAlertVisible(true);
      return;
    }
    const dayNo = parseInt(calculateDayNumber(), 10) || 1;
    setLoadingMessage('Saving Assessment...');
    const res = await saveAssessment(dayNo);
    const actualData = res?.data || res;
    const id = actualData?.id || recordId;
    if (id) {
      setRecordId(id);
      setLoadingMessage('Initializing ADPIE...');
      
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setIsAdpieActive(true);
        screenOpacity.setValue(1);
      });
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleSubmit = async () => {
    if (!selectedPatientId) {
      triggerPatientAlert();
      setAlertVisible(true);
      return;
    }
    const dayNo = parseInt(calculateDayNumber(), 10) || 1;
    setLoadingMessage('Saving Record...');
    const res = await saveAssessment(dayNo);
    if (res) {
      setSuccessMessage({
        title: isExistingRecord ? 'Record Updated' : 'Record Saved',
        message: 'Intake and Output data has been successfully processed.',
      });
      setSuccessVisible(true);
    }
  };

  const isValidDataAlert = (v: any): v is string =>
    v && typeof v === 'string' &&
    !v.toLowerCase().includes('no findings') &&
    !v.toLowerCase().includes('no result') &&
    !v.toLowerCase().includes('no alert') &&
    v.trim() !== '';

  const hasRealAlert =
    Object.values(backendAlerts).some(isValidDataAlert) ||
    isValidDataAlert(assessmentAlert) ||
    isValidDataAlert(dataAlert);
  const isAlertActive = !!selectedPatientId && isDataEntered && hasRealAlert;

  const getCleanedAlertText = () => {
    const parts = [
      ...Object.values(backendAlerts),
      assessmentAlert,
      isValidDataAlert(dataAlert) ? dataAlert : null,
    ].filter(isValidDataAlert);
    
    if (!parts.length) return 'No clinical findings found.';
    
    // Remove duplicates
    const unique = Array.from(new Set(parts));

    return unique
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
    isModified,
    loadingMessage,
    screenOpacity,
  };
};
