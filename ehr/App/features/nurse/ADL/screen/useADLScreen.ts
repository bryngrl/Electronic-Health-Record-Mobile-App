import { useState, useEffect, useCallback, useRef } from 'react';
import { BackHandler, Animated } from 'react-native';
import apiClient from '@api/apiClient';
import { useADL } from '../hook/useADL';
import { initialFormData, ALERT_KEY_MAP } from './constants';

export const useADLScreen = (onBack: () => void, recordId: number | null = null, readOnly: boolean = false) => {
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
  const [recordDayNo, setRecordDayNo] = useState<string | null>(null);
  const [isExistingRecord, setIsExistingRecord] = useState(false);
  const [backendAlerts, setBackendAlerts] = useState<
    Record<string, string | null>
  >({});
  const [backendSeverities, setBackendSeverities] = useState<
    Record<string, string | null>
  >({});
  const [isAdpieActive, setIsAdpieActive] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [lastSavedData, setLastSavedData] = useState(initialFormData);
  const [isNA, setIsNA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Processing...');
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);
  useEffect(() => {
    adlIdRef.current = adlId;
  }, [adlId]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onBack();
        return true;
      },
    );
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
      Object.keys(initialFormData).forEach(key => {
        (allNA as any)[key] = 'N/A';
      });
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
    if (selectedPatient?.id) {
      try {
        const result = await saveADLAssessment(
          {
            patient_id: selectedPatient.id,
            day_no: calculateDayNumber(),
            ...updatedFormData,
          },
          adlIdRef.current,
        );
        const record = result?.data || result;
        if (record?.id) {
          setAdlId(record.id);
          adlIdRef.current = record.id;
        }
        // Update alerts from N/A state
        const alerts = result?.alerts || record?.alerts || {};
        const updatedAlerts: Record<string, string | null> = {};
        Object.entries(ALERT_KEY_MAP).forEach(([_, alertKey]) => {
          const v = alerts[alertKey] ?? record?.[alertKey];
          updatedAlerts[alertKey] = isValidAlert(v) ? v : null;
        });
        setBackendAlerts(updatedAlerts);
      } catch {
        console.error('Failed to auto-save N/A state');
      }
    }
  };

  const isValidAlert = (v: any) =>
    v &&
    typeof v === 'string' &&
    v.trim() !== '' &&
    v !== 'No findings.' &&
    v !== 'No Findings';

  const loadPatientData = useCallback(
    async (patientId: number) => {
      preNASnapshotRef.current = null;
      fetchDataAlert(patientId);
      
      let data;
      if (recordId) {
        try {
          // Use patient-based endpoint and filter, since direct ID endpoint might not exist
          const res = await apiClient.get(`/adl/patient/${patientId}?patient_id=${patientId}`);
          const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
          data = list.find((item: any) => item.id === recordId);
          
          if (!data) {
            console.warn(`[ADL] Record ${recordId} not found in patient list, falling back to latest`);
            data = await fetchLatestADL(patientId);
          }
        } catch (e) {
          console.error('[ADL] Failed to fetch via patient list', e);
          data = await fetchLatestADL(patientId);
        }
      } else {
        data = await fetchLatestADL(patientId);
      }

      if (data) {
        const today = new Date().toLocaleDateString('en-CA');
        const recordDate = (data.date || data.created_at || '').split('T')[0];

        if (recordDate === today) {
          setAdlId(data.id);
          adlIdRef.current = data.id;
          setIsExistingRecord(true);
        } else if (recordId && data.id === recordId) {
          setAdlId(data.id);
          adlIdRef.current = data.id;
          setIsExistingRecord(true); // Treat as existing if specifically requested
        } else {
          setAdlId(null);
          adlIdRef.current = null;
          setIsExistingRecord(false);
        }

        setRecordDayNo(data.day_no?.toString() || null);

        const newFormData = {
          mobility_assessment: data.mobility_assessment || '',
          hygiene_assessment: data.hygiene_assessment || '',
          toileting_assessment: data.toileting_assessment || '',
          feeding_assessment: data.feeding_assessment || '',
          hydration_assessment: data.hydration_assessment || '',
          sleep_pattern_assessment: data.sleep_pattern_assessment || '',
          pain_level_assessment: data.pain_level_assessment || '',
        };
        setFormData(newFormData);
        setLastSavedData(newFormData);
        formDataRef.current = newFormData;
        setIsNA(Object.values(newFormData).every(v => v === 'N/A'));
        const loaded: Record<string, string | null> = {};
        Object.entries(ALERT_KEY_MAP).forEach(([_, alertKey]) => {
          const v = data[alertKey];
          loaded[alertKey] = isValidAlert(v) ? v : null;
        });
        setBackendAlerts(loaded);
      } else {
        setAdlId(null);
        adlIdRef.current = null;
        setRecordDayNo(null);
        setIsExistingRecord(false);
        setFormData(initialFormData);
        formDataRef.current = initialFormData;
        setIsNA(false);
        setBackendAlerts({});
        setBackendSeverities({});
        Object.values(fieldTimers.current).forEach(clearTimeout);
        fieldTimers.current = {};
      }
    },
    [fetchLatestADL, fetchDataAlert, analyzeField, recordId],
  );

  useEffect(() => {
    if (selectedPatient?.id !== prevPatientIdRef.current) {
      prevPatientIdRef.current = selectedPatient?.id || null;
      if (selectedPatient?.id) {
        loadPatientData(selectedPatient.id);
      } else {
        setAdlId(null);
        adlIdRef.current = null;
        setRecordDayNo(null);
        setIsExistingRecord(false);
        setFormData(initialFormData);
        setLastSavedData(initialFormData);
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
    return isValidAlert(backendAlerts[alertKey])
      ? backendAlerts[alertKey]
      : null;
  };

  const getBackendSeverity = (field: string): string | null =>
    backendSeverities[field] ?? null;

  const updateField = (field: string, val: string) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    formDataRef.current = { ...formDataRef.current, [field]: val };

    if (fieldTimers.current[field]) clearTimeout(fieldTimers.current[field]);

    const alertKey = ALERT_KEY_MAP[field];

    fieldTimers.current[field] = setTimeout(async () => {
      if (!selectedPatient) return;

      const res = await analyzeField(
        selectedPatient.id,
        adlIdRef.current,
        { ...formDataRef.current, day_no: calculateDayNumber() },
        field,
        alertKey!,
      );

      if (res) {
        if (res.adlId && !adlIdRef.current) {
          adlIdRef.current = res.adlId;
          setAdlId(res.adlId);
        }

        // Update ALL alerts from the response to keep everything in sync
        const updatedAlerts = { ...res.alerts };

        // If current field is cleared, make sure its specific alert is also cleared locally
        if (!val.trim()) {
          updatedAlerts[alertKey!] = null;
        }

        setBackendAlerts(prev => ({ ...prev, ...updatedAlerts }));
        setBackendSeverities(prev => ({ ...prev, [field]: res.severity }));
      }
    }, 800);
  };

  const handleCDSSPress = async () => {
    if (!selectedPatient) {
      return showAlert(
        'Patient Required',
        'Please select a patient first in the search bar.',
      );
    }
    setIsLoading(true);
    setLoadingMessage('Saving Assessment...');
    try {
      const result = await saveADLAssessment(
        {
          patient_id: selectedPatient.id,
          day_no: calculateDayNumber(),
          ...formDataRef.current,
        },
        adlIdRef.current,
      );
      const record = result?.data || result;
      const id = record?.id || adlIdRef.current;
      if (id) {
        setAdlId(id);
        adlIdRef.current = id;
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
        const updated: Record<string, string | null> = { ...backendAlerts };
        Object.entries(ALERT_KEY_MAP).forEach(([_, alertKey]) => {
          const v = record?.[alertKey];
          updated[alertKey] = isValidAlert(v) ? v : null;
        });
        setBackendAlerts(updated);
      } else {
        setIsLoading(false);
        showAlert('Error', 'Could not retrieve assessment ID.');
      }
    } catch (e) {
      setIsLoading(false);
      showAlert('Error', 'Could not initiate clinical support.');
    }
  };

  const handleSave = async () => {
    if (!selectedPatient) {
      return showAlert(
        'Patient Required',
        'Please select a patient first in the search bar.',
      );
    }
    setIsLoading(true);
    setLoadingMessage('Saving ADL Assessment...');
    try {
      const isUpdate = isExistingRecord;
      const result = await saveADLAssessment(
        {
          patient_id: selectedPatient.id,
          day_no: calculateDayNumber(),
          ...formDataRef.current,
        },
        adlIdRef.current,
      );
      const record = result?.data || result;
      const newId = record?.id;
      if (newId) {
        setAdlId(newId);
        adlIdRef.current = newId;
        setIsExistingRecord(true);
        setLastSavedData({ ...formDataRef.current });
        fetchDataAlert(selectedPatient.id);
        const updated: Record<string, string | null> = { ...backendAlerts };
        Object.entries(ALERT_KEY_MAP).forEach(([_, alertKey]) => {
          const v = record?.[alertKey];
          updated[alertKey] = isValidAlert(v) ? v : null;
        });
        setBackendAlerts(updated);
      }
      setIsLoading(false);
      showAlert(
        isUpdate ? 'Successfully Updated' : 'Successfully Submitted',
        `ADL Assessment has been ${
          isUpdate ? 'updated' : 'submitted'
        } successfully.`,
        'success',
      );
    } catch (e) {
      setIsLoading(false);
      showAlert('Error', 'Submission failed. Please check your connection.');
    }
  };

  const calculateDayNumber = () => {
    if (readOnly && recordDayNo) return recordDayNo;
    if (isExistingRecord && recordDayNo) return recordDayNo;

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
  };

  const generateFindingsSummary = () => {
    const findings = Object.entries(formDataRef.current)
      .filter(([_, v]) => v && v.trim() !== '' && v !== 'N/A')
      .map(
        ([key, v]) =>
          `${key
            .replace(/_assessment/g, '')
            .replace(/_/g, ' ')
            .toUpperCase()}: ${v}`,
      );
    const alerts = Object.values(backendAlerts).filter(
      (v): v is string => typeof v === 'string' && v.trim() !== '',
    );
    return [...findings, ...alerts].join('. ');
  };

  const isDataEntered = Object.values(formData).some(
    v => v && v.trim().length > 0 && v !== 'N/A',
  );

  const isModified = Object.keys(formData).some(
    key => (formData as any)[key] !== (lastSavedData as any)[key],
  );

  return {
    searchText,
    setSearchText,
    selectedPatient,
    setSelectedPatient,
    scrollEnabled,
    setScrollEnabled,
    alertConfig,
    setAlertConfig,
    showAlert,
    adlId,
    isExistingRecord,
    isAdpieActive,
    setIsAdpieActive,
    formData,
    isNA,
    backendAlerts,
    dataAlert,
    toggleNA,
    loadPatientData,
    getBackendAlert,
    getBackendSeverity,
    updateField,
    handleCDSSPress,
    handleSave,
    generateFindingsSummary,
    isDataEntered,
    calculateDayNumber,
    isModified,
    isLoading,
    loadingMessage,
    screenOpacity,
  };
};
