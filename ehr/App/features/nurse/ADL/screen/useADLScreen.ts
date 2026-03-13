import { useState, useEffect, useCallback, useRef } from 'react';
import { BackHandler } from 'react-native';
import { useADL } from '../hook/useADL';
import { initialFormData, ALERT_KEY_MAP } from './constants';

export const useADLScreen = (onBack: () => void) => {
  const {
    saveADLAssessment,
    analyzeField,
    fetchLatestADL,
    dataAlert,
    fetchDataAlert,
  } = useADL();

  const [searchText, setSearchText] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const prevPatientIdRef = useRef<number | null>(null);
  const fieldTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const formDataRef = useRef(initialFormData);
  const adlIdRef = useRef<number | null>(null);
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

  const [adlId, setAdlId] = useState<number | null>(null);
  const [isExistingRecord, setIsExistingRecord] = useState(false);
  const [backendAlerts, setBackendAlerts] = useState<Record<string, string | null>>({});
  const [backendSeverities, setBackendSeverities] = useState<Record<string, string | null>>({});
  const [isAdpieActive, setIsAdpieActive] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [isNA, setIsNA] = useState(false);

  useEffect(() => { formDataRef.current = formData; }, [formData]);
  useEffect(() => { adlIdRef.current = adlId; }, [adlId]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => backHandler.remove();
  }, [onBack]);

  const toggleNA = () => {
    const newState = !isNA;
    setIsNA(newState);
    Object.values(fieldTimers.current).forEach(clearTimeout);
    fieldTimers.current = {};
    if (newState) {
      preNASnapshotRef.current = { ...formData };
      const allNA = { ...formData };
      Object.keys(initialFormData).forEach(key => { (allNA as any)[key] = 'N/A'; });
      setFormData(allNA);
      formDataRef.current = allNA;
    } else {
      const restored = preNASnapshotRef.current
        ? { ...preNASnapshotRef.current }
        : { ...initialFormData };
      preNASnapshotRef.current = null;
      setFormData(restored);
      formDataRef.current = restored;
    }
  };

  const isValidAlert = (v: any) =>
    v && typeof v === 'string' && v.trim() !== '' && v !== 'No findings.' && v !== 'No Findings';

  const loadPatientData = useCallback(async (patientId: number) => {
    preNASnapshotRef.current = null;
    fetchDataAlert(patientId);
    const data = await fetchLatestADL(patientId);
    if (data) {
      setAdlId(data.id);
      adlIdRef.current = data.id;
      setIsExistingRecord(true);
      const newFormData = {
        mobility_assessment:      data.mobility_assessment || '',
        hygiene_assessment:       data.hygiene_assessment || '',
        toileting_assessment:     data.toileting_assessment || '',
        feeding_assessment:       data.feeding_assessment || '',
        hydration_assessment:     data.hydration_assessment || '',
        sleep_pattern_assessment: data.sleep_pattern_assessment || '',
        pain_level_assessment:    data.pain_level_assessment || '',
      };
      setFormData(newFormData);
      formDataRef.current = newFormData;
      setIsNA(Object.values(newFormData).every(v => v === 'N/A'));
      const loaded: Record<string, string | null> = {};
      Object.entries(ALERT_KEY_MAP).forEach(([_, alertKey]) => {
        loaded[alertKey] = isValidAlert(data[alertKey]) ? data[alertKey] : null;
      });
      setBackendAlerts(loaded);
    } else {
      setAdlId(null);
      adlIdRef.current = null;
      setIsExistingRecord(false);
      setFormData(initialFormData);
      formDataRef.current = initialFormData;
      setIsNA(false);
      setBackendAlerts({});
      setBackendSeverities({});
      Object.values(fieldTimers.current).forEach(clearTimeout);
      fieldTimers.current = {};
    }
  }, [fetchLatestADL, fetchDataAlert]);

  useEffect(() => {
    if (selectedPatient?.id !== prevPatientIdRef.current) {
      prevPatientIdRef.current = selectedPatient?.id || null;
      if (selectedPatient?.id) {
        loadPatientData(selectedPatient.id);
      } else {
        setAdlId(null);
        adlIdRef.current = null;
        setIsExistingRecord(false);
        setFormData(initialFormData);
        setIsNA(false);
        setBackendAlerts({});
        setBackendSeverities({});
        Object.values(fieldTimers.current).forEach(clearTimeout);
        fieldTimers.current = {};
      }
    }
  }, [selectedPatient, loadPatientData]);

  const getBackendAlert = (field: string): string | null => {
    const alertKey = ALERT_KEY_MAP[field];
    if (!alertKey) return null;
    return isValidAlert(backendAlerts[alertKey]) ? backendAlerts[alertKey] : null;
  };

  const getBackendSeverity = (field: string): string | null =>
    backendSeverities[field] ?? null;

  const updateField = (field: string, val: string) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    formDataRef.current = { ...formDataRef.current, [field]: val };

    if (fieldTimers.current[field]) clearTimeout(fieldTimers.current[field]);

    const alertKey = ALERT_KEY_MAP[field];
    if (!val || val.trim().length < 3 || val === 'N/A') {
      if (alertKey) setBackendAlerts(prev => ({ ...prev, [alertKey]: null }));
      return;
    }

    fieldTimers.current[field] = setTimeout(async () => {
      if (!selectedPatient?.id) return;
      const result = await analyzeField(
        selectedPatient.id,
        adlIdRef.current,
        field,
        val,
        alertKey!,
      );

      if (result?.adlId && !adlIdRef.current) {
        adlIdRef.current = result.adlId;
        setAdlId(result.adlId);
      }

      if (alertKey) {
        setBackendAlerts(prev => ({ ...prev, [alertKey]: result?.alert ?? null }));
      }
      setBackendSeverities(prev => ({ ...prev, [field]: result?.severity ?? null }));
    }, 800);
  };

  const handleCDSSPress = async () => {
    if (!selectedPatient) {
      return showAlert('Patient Required', 'Please select a patient first in the search bar.');
    }
    try {
      const result = await saveADLAssessment(
        { patient_id: selectedPatient.id, ...formDataRef.current },
        adlIdRef.current,
      );
      const record = result?.data || result;
      const id = record?.id || adlIdRef.current;
      if (id) {
        setAdlId(id);
        adlIdRef.current = id;
        setIsAdpieActive(true);
        const updated: Record<string, string | null> = { ...backendAlerts };
        Object.entries(ALERT_KEY_MAP).forEach(([_, alertKey]) => {
          const v = record?.[alertKey];
          updated[alertKey] = isValidAlert(v) ? v : null;
        });
        setBackendAlerts(updated);
      } else {
        showAlert('Error', 'Could not retrieve assessment ID.');
      }
    } catch (e) {
      showAlert('Error', 'Could not initiate clinical support.');
    }
  };

  const handleSave = async () => {
    if (!selectedPatient) {
      return showAlert('Patient Required', 'Please select a patient first in the search bar.');
    }
    try {
      const isUpdate = isExistingRecord;
      const result = await saveADLAssessment(
        { patient_id: selectedPatient.id, ...formDataRef.current },
        adlIdRef.current,
      );
      const record = result?.data || result;
      const newId = record?.id;
      if (newId) {
        setAdlId(newId);
        adlIdRef.current = newId;
        setIsExistingRecord(true);
        fetchDataAlert(selectedPatient.id);
        const updated: Record<string, string | null> = { ...backendAlerts };
        Object.entries(ALERT_KEY_MAP).forEach(([_, alertKey]) => {
          const v = record?.[alertKey];
          updated[alertKey] = isValidAlert(v) ? v : null;
        });
        setBackendAlerts(updated);
      }
      showAlert(
        isUpdate ? 'Successfully Updated' : 'Successfully Submitted',
        `ADL Assessment has been ${isUpdate ? 'updated' : 'submitted'} successfully.`,
        'success',
      );
    } catch (e) {
      showAlert('Error', 'Submission failed. Please check your connection.');
    }
  };

  const calculateDayNumber = () => {
    if (!selectedPatient?.admission_date) return '';
    const admission = new Date(selectedPatient.admission_date);
    const today = new Date();
    admission.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - admission.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays.toString() : '1';
  };

  const generateFindingsSummary = () => {
    const findings = Object.entries(formDataRef.current)
      .filter(([_, v]) => v && v.trim() !== '' && v !== 'N/A')
      .map(([key, v]) => `${key.replace(/_assessment/g, '').replace(/_/g, ' ').toUpperCase()}: ${v}`);
    const alerts = Object.values(backendAlerts)
      .filter((v): v is string => typeof v === 'string' && v.trim() !== '');
    return [...findings, ...alerts].join('. ');
  };

  const isDataEntered = Object.values(formData).some(
    v => v && v.trim().length > 0 && v !== 'N/A',
  );

  return {
    searchText, setSearchText,
    selectedPatient, setSelectedPatient,
    scrollEnabled, setScrollEnabled,
    alertConfig, setAlertConfig,
    showAlert,
    adlId, isExistingRecord,
    isAdpieActive, setIsAdpieActive,
    formData, isNA, backendAlerts, dataAlert,
    toggleNA, loadPatientData, getBackendAlert, getBackendSeverity,
    updateField, handleCDSSPress, handleSave,
    generateFindingsSummary, isDataEntered, calculateDayNumber,
  };
};
