import { useState, useEffect, useCallback, useRef } from 'react';
import { BackHandler, Animated } from 'react-native';
import { usePhysicalExam } from '../hook/usePhysicalExam';
import { initialFormData, ALERT_KEY_MAP } from './constants';

export const usePhysicalExamScreen = (onBack: () => void) => {
  const {
    saveAssessment,
    analyzeField,
    fetchLatestPhysicalExam,
    dataAlert,
    fetchDataAlert,
  } = usePhysicalExam();

  const [searchText, setSearchText] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const prevPatientIdRef = useRef<string | null>(null);
  const fieldTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const formDataRef = useRef(initialFormData);
  const examIdRef = useRef<number | null>(null);
  const preNASnapshotRef = useRef<typeof initialFormData | null>(null);

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning';
  }>({ visible: false, title: '', message: '', type: 'error' });

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' = 'error',
  ) => setAlertConfig({ visible: true, title, message, type });

  const [examId, setExamId] = useState<number | null>(null);
  const [backendAlerts, setBackendAlerts] = useState<Record<string, string | null>>({});
  const [backendSeverities, setBackendSeverities] = useState<Record<string, string | null>>({});
  const [assessmentAlert, setAssessmentAlert] = useState<string | null>(null);
  const [isAdpieActive, setIsAdpieActive] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [lastSavedData, setLastSavedData] = useState(initialFormData);
  const [isNA, setIsNA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Processing...');
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => { formDataRef.current = formData; }, [formData]);
  useEffect(() => { examIdRef.current = examId; }, [examId]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => backHandler.remove();
  }, [onBack]);

  const toggleNA = async () => {
    const newState = !isNA;
    setIsNA(newState);
    Object.values(fieldTimers.current).forEach(clearTimeout);
    fieldTimers.current = {};
    
    let updatedFormData: typeof initialFormData;
    if (newState) {
      preNASnapshotRef.current = { ...formData };
      const allNA = { ...formData };
      Object.keys(initialFormData).forEach(key => { (allNA as any)[key] = 'N/A'; });
      updatedFormData = allNA;
    } else {
      updatedFormData = preNASnapshotRef.current
        ? { ...preNASnapshotRef.current }
        : { ...initialFormData };
      preNASnapshotRef.current = null;
    }
    
    setFormData(updatedFormData);
    formDataRef.current = updatedFormData;

    // Automatically save N/A state if a patient is selected
    if (selectedPatientId) {
      try {
        const result = await saveAssessment(
          { patient_id: selectedPatientId, ...updatedFormData },
          examIdRef.current,
        );
        const record = result?.data || result;
        if (record?.id) {
          setExamId(record.id);
          examIdRef.current = record.id;
        }
        // Update alerts from N/A state (likely "No Findings")
        const alerts = result?.alerts || {};
        const updatedAlerts: Record<string, string | null> = {};
        Object.entries(ALERT_KEY_MAP).forEach(([_, alertKey]) => {
          const v = alerts[alertKey] ?? record?.[alertKey];
          updatedAlerts[alertKey] = (v && v !== 'No Findings') ? v : null;
        });
        setBackendAlerts(updatedAlerts);
      } catch {
        console.error('Failed to auto-save N/A state:');
      }    }
  };

  const loadPatientData = useCallback(
    async (patientId: number) => {
      preNASnapshotRef.current = null; // Clear any stale snapshot on patient change
      fetchDataAlert(patientId);
      const data = await fetchLatestPhysicalExam(patientId);
      if (data) {
        const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
        const recordDate = (data.created_at || '').split('T')[0];
        
        if (recordDate === today) {
          setExamId(data.id);
          examIdRef.current = data.id;
        } else {
          setExamId(null);
          examIdRef.current = null;
        }

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
        setLastSavedData(newFormData);
        formDataRef.current = newFormData;
        setIsNA(Object.values(newFormData).every(v => v === 'N/A'));
        
        // Load alerts from saved record using ALERT_KEY_MAP (DB column names)
        const loadedAlerts: Record<string, string | null> = {};
        Object.values(ALERT_KEY_MAP).forEach(alertKey => {
          const v = data[alertKey];
          loadedAlerts[alertKey] = (v && v !== 'No Findings') ? v : null;
        });
        setBackendAlerts(loadedAlerts);
      } else {
        setExamId(null);
        examIdRef.current = null;
        setFormData(initialFormData);
        formDataRef.current = initialFormData;
        setIsNA(false);
        setBackendAlerts({});
        Object.values(fieldTimers.current).forEach(clearTimeout);
        fieldTimers.current = {};
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
        examIdRef.current = null;
        setFormData(initialFormData);
        setLastSavedData(initialFormData);
        setIsNA(false);
        setBackendAlerts({});
        Object.values(fieldTimers.current).forEach(clearTimeout);
        fieldTimers.current = {};
      }
    }
  }, [selectedPatientId, loadPatientData]);

  const isModified = Object.keys(formData).some(
    key => (formData as any)[key] !== (lastSavedData as any)[key]
  );

  const getBackendAlert = (field: string): string | null => {
    const alertKey = ALERT_KEY_MAP[field];
    if (!alertKey) return null;
    return backendAlerts[alertKey] ?? null;
  };

  const getBackendSeverity = (field: string): string | null => {
    return backendSeverities[field] ?? null;
  };

  const updateField = (field: string, val: string) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    formDataRef.current = { ...formDataRef.current, [field]: val };

    if (fieldTimers.current[field]) clearTimeout(fieldTimers.current[field]);

    const alertKey = ALERT_KEY_MAP[field];

    fieldTimers.current[field] = setTimeout(async () => {
      if (!selectedPatientId) return;
      
      const result = await analyzeField(
        parseInt(selectedPatientId, 10),
        examIdRef.current,
        formDataRef.current,
        field,
        alertKey!,
      );

      if (result) {
        if (result.examId && !examIdRef.current) {
          examIdRef.current = result.examId;
          setExamId(result.examId);
        }

        // Update ALL alerts from the response to keep everything in sync
        const updatedAlerts = { ...result.alerts };
        
        // If current field is cleared, make sure its specific alert is also cleared locally
        if (!val.trim()) {
          updatedAlerts[alertKey!] = null;
        }

        setBackendAlerts(prev => ({ ...prev, ...updatedAlerts }));
        setBackendSeverities(prev => ({ ...prev, [field]: result.severity }));
      }
    }, 800);
  };

  const handleCDSSPress = async () => {
    if (!selectedPatientId) {
      return showAlert('Patient Required', 'Please select a patient first in the search bar.');
    }
    setIsLoading(true);
    setLoadingMessage('Saving Assessment...');
    try {
      const result = await saveAssessment(
        { patient_id: selectedPatientId, ...formData },
        examIdRef.current,
      );
      const record = result?.data || result;
      const id = record?.id || examIdRef.current;
      if (id) {
        setExamId(id);
        examIdRef.current = id;
        setLoadingMessage('Initializing ADPIE...');
        
        Animated.timing(screenOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          setIsAdpieActive(true);
          screenOpacity.setValue(1);
          setIsLoading(false);
        });

        setLastSavedData({ ...formDataRef.current });
        // Load updated alerts from save response
        const alerts = result?.alerts || {};
        const updated: Record<string, string | null> = { ...backendAlerts };
        Object.entries(ALERT_KEY_MAP).forEach(([_, alertKey]) => {
          const v = alerts[alertKey] ?? record?.[alertKey];
          updated[alertKey] = (v && v !== 'No Findings') ? v : null;
        });
        setBackendAlerts(updated);
      } else {
        setIsLoading(false);
        showAlert('Error', 'Could not retrieve assessment ID.');
      }
    } catch {
      setIsLoading(false);
      showAlert('Error', 'Could not initiate clinical support.');
    }
  };

  const handleSave = async () => {
    if (!selectedPatientId) {
      return showAlert('Patient Required', 'Please select a patient first in the search bar.');
    }
    setIsLoading(true);
    setLoadingMessage('Saving Physical Exam...');
    try {
      const result = await saveAssessment(
        { patient_id: selectedPatientId, ...formData },
        examIdRef.current,
      );
      const record = result?.data || result;
      const newId = record?.id;
      const isUpdate = !!examIdRef.current; // examIdRef was set → this was an update
      if (newId) {
        setExamId(newId);
        examIdRef.current = newId;
        setLastSavedData({ ...formDataRef.current });
        fetchDataAlert(parseInt(selectedPatientId, 10));
        // Refresh alerts from save response
        const alerts = result?.alerts || {};
        const updated: Record<string, string | null> = { ...backendAlerts };
        Object.entries(ALERT_KEY_MAP).forEach(([_, alertKey]) => {
          const v = alerts[alertKey] ?? record?.[alertKey];
          updated[alertKey] = (v && v !== 'No Findings') ? v : null;
        });
        setBackendAlerts(updated);
      }
      setIsLoading(false);
      showAlert(
        isUpdate ? 'Successfully Updated' : 'Successfully Submitted',
        `Physical Exam has been ${isUpdate ? 'updated' : 'submitted'} successfully.`,
        'success',
      );
    } catch {
      setIsLoading(false);
      showAlert('Error', 'Submission failed. Please check your connection.');
    }
  };

  const generateFindingsSummary = () => {
    const findings = Object.entries(formData)
      .filter(([_, v]) => v && v.trim() !== '' && v !== 'N/A')
      .map(([key, v]) => `${key.replace(/_/g, ' ').toUpperCase()}: ${v}`);

    const alerts = Object.values(backendAlerts)
      .filter((v): v is string => typeof v === 'string' && v.trim() !== '' && !v.toLowerCase().includes('normal'));

    const summary = [...findings, ...alerts];
    if (dataAlert) {
      if (typeof dataAlert === 'string') summary.push(dataAlert);
      else Object.values(dataAlert).forEach(v => typeof v === 'string' && v.trim() !== '' && summary.push(v));
    }
    return summary.join('. ');
  };

  const isDataEntered = Object.values(formData).some(v => v && v.trim().length > 0 && v !== 'N/A');

  const getCurrentDate = () =>
    new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return {
    searchText, setSearchText,
    selectedPatientId, setSelectedPatientId,
    scrollEnabled, setScrollEnabled,
    alertConfig, setAlertConfig, showAlert,
    examId,
    assessmentAlert, setAssessmentAlert,
    isAdpieActive, setIsAdpieActive,
    formData, isNA, backendAlerts, dataAlert,
    toggleNA, loadPatientData, getBackendAlert, getBackendSeverity,
    updateField, handleCDSSPress, handleSave,
    generateFindingsSummary, isDataEntered, getCurrentDate,
    isModified,
    isLoading, loadingMessage, screenOpacity,
  };
};
