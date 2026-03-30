import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { BackHandler, Animated } from 'react-native';
import { useLabValues } from '../hook/useLabValues';
import { LAB_TESTS, getTestPrefix } from './constants';

const isValidAlert = (v: any): v is string =>
  typeof v === 'string' &&
  v.trim() !== '' &&
  !v.toLowerCase().includes('no findings') &&
  !v.toLowerCase().includes('no result') &&
  !v.toLowerCase().includes('no alert') &&
  v.toLowerCase() !== 'normal';

export const useLabValuesScreen = (onBack: () => void) => {
  const {
    saveLabAssessment,
    analyzeLabField,
    fetchLatestLabValues,
    fetchDataAlert,
    dataAlert,
  } = useLabValues();

  const [searchText, setSearchText] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null,
  );
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [isNA, setIsNA] = useState(false);
  const preNASnapshotRef = useRef<Record<string, string> | null>(null);

  const [labId, setLabId] = useState<number | null>(null);
  const labIdRef = useRef<number | null>(null);
  const [isExistingRecord, setIsExistingRecord] = useState(false);

  const [allLabData, setAllLabData] = useState<Record<string, any>>({});
  const [selectedTestIndex, setSelectedTestIndex] = useState(0);
  const [result, setResult] = useState('');
  const [normalRange, setNormalRange] = useState('');

  const [backendAlerts, setBackendAlerts] = useState<
    Record<string, string | null>
  >({});
  const [backendSeverities, setBackendSeverities] = useState<
    Record<string, string | null>
  >({});

  const [isAlertLoading, setIsAlertLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Processing...');
  const screenOpacity = useRef(new Animated.Value(1)).current;

  const [isAdpieActive, setIsAdpieActive] = useState(false);
  const [showLabList, setShowLabList] = useState(false);
  const [passedAlert, setPassedAlert] = useState<string | null>(null);

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning';
  }>({ visible: false, title: '', message: '', type: 'error' });

  const [modalVisible, setModalVisible] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' = 'error',
  ) => setAlertConfig({ visible: true, title, message, type });

  useEffect(() => {
    labIdRef.current = labId;
  }, [labId]);

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

  // Sync result/normalRange when test index or loaded data changes
  useEffect(() => {
    const prefix = getTestPrefix(LAB_TESTS[selectedTestIndex]);
    setResult(allLabData[`${prefix}_result`] || (isNA ? 'N/A' : ''));
    setNormalRange(allLabData[`${prefix}_normal_range`] || (isNA ? 'N/A' : ''));
    
    // Close modal when switching tests
    setModalVisible(false);
  }, [selectedTestIndex, allLabData, isNA]);

  const allLabDataRef = useRef(allLabData);
  useEffect(() => {
    const prefix = getTestPrefix(LAB_TESTS[selectedTestIndex]);
    const updated = {
      ...allLabData,
      [`${prefix}_result`]: result,
      [`${prefix}_normal_range`]: normalRange,
    };
    allLabDataRef.current = updated;
  }, [allLabData, result, normalRange, selectedTestIndex]);

  // Real-time debounce: auto-analyze after user types result/range
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!selectedPatientId) return;

    const prefix = getTestPrefix(LAB_TESTS[selectedTestIndex]);
    const patientId = selectedPatientId;

    // Check if inputs are N/A or empty
    const isResultNA = result.trim().toLowerCase() === 'n/a' || result.trim() === '';
    const isRangeNA = normalRange.trim().toLowerCase() === 'n/a' || normalRange.trim() === '';
    
    // If both are N/A or empty, clear the alert immediately
    if (isResultNA && isRangeNA) {
      setBackendAlerts(prev => ({ ...prev, [`${prefix}_alert`]: null }));
      setBackendSeverities(prev => ({ ...prev, [`${prefix}_severity`]: null }));
      setIsAlertLoading(false);
      return;
    }

    setIsAlertLoading(true);
    debounceTimer.current = setTimeout(async () => {
      const res = await analyzeLabField(
        patientId,
        labIdRef.current,
        allLabDataRef.current,
        prefix,
      );
      if (!res) {
        setIsAlertLoading(false);
        return;
      }
      if (res.labId && !labIdRef.current) {
        labIdRef.current = res.labId;
        setLabId(res.labId);
      }
      // Update all alerts from the response
      const updatedAlerts = { ...res.alerts };

      // Clear alert if inputs are N/A or empty
      if (isResultNA && isRangeNA) {
        updatedAlerts[`${prefix}_alert`] = null;
      }

      setBackendAlerts(prev => ({ ...prev, ...updatedAlerts }));
      setBackendSeverities(prev => ({
        ...prev,
        [`${prefix}_severity`]: res.severity,
      }));
      setIsAlertLoading(false);
    }, 800);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [
    result,
    normalRange,
    selectedTestIndex,
    selectedPatientId,
    analyzeLabField,
  ]);

  const handlePatientSelect = useCallback(
    async (id: number | null, name: string, _patientObj?: any) => {
      setSelectedPatientId(id);
      setSearchText(name);

      if (!id) {
        setLabId(null);
        labIdRef.current = null;
        setIsExistingRecord(false);
        setAllLabData({});
        allLabDataRef.current = {};
        setBackendAlerts({});
        setBackendSeverities({});
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        return;
      }

      fetchDataAlert(id);
      const data = await fetchLatestLabValues(id);

      if (data && data.id) {
        const today = new Date().toLocaleDateString('en-CA');
        const recordDate = (data.created_at || '').split('T')[0];

        if (recordDate === today) {
          setLabId(data.id);
          labIdRef.current = data.id;
          setIsExistingRecord(true);
        } else {
          setLabId(null);
          labIdRef.current = null;
          setIsExistingRecord(false);
        }
        setAllLabData(data);
        allLabDataRef.current = data;
        // Load existing alerts
        const loaded: Record<string, string | null> = {};
        LAB_TESTS.forEach(test => {
          const p = getTestPrefix(test);
          const alertKey = `${p}_alert`;
          loaded[alertKey] = isValidAlert(data[alertKey])
            ? data[alertKey]
            : null;
        });
        setBackendAlerts(loaded);
      } else {
        setLabId(null);
        labIdRef.current = null;
        setIsExistingRecord(false);
        setAllLabData({});
        allLabDataRef.current = {};
        setBackendAlerts({});
        setBackendSeverities({});
      }
    },
    [fetchDataAlert, fetchLatestLabValues],
  );

  const toggleNA = async () => {
    const newState = !isNA;
    setIsNA(newState);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    let updatedResult: string;
    let updatedRange: string;

    const prefix = getTestPrefix(LAB_TESTS[selectedTestIndex]);

    if (newState) {
      // Save snapshot of current test's result/range before setting to N/A
      preNASnapshotRef.current = {
        result: result,
        range: normalRange,
      };
      updatedResult = 'N/A';
      updatedRange = 'N/A';
    } else {
      // Restore from snapshot if available, otherwise fallback to allLabData
      if (preNASnapshotRef.current) {
        updatedResult = preNASnapshotRef.current.result;
        updatedRange = preNASnapshotRef.current.range;
        preNASnapshotRef.current = null;
      } else {
        updatedResult = allLabData[`${prefix}_result`] || '';
        updatedRange = allLabData[`${prefix}_normal_range`] || '';
      }
    }

    setResult(updatedResult);
    setNormalRange(updatedRange);

    if (selectedPatientId) {
      try {
        const prefix = getTestPrefix(LAB_TESTS[selectedTestIndex]);
        const payload = {
          ...allLabDataRef.current,
          patient_id: selectedPatientId,
          [`${prefix}_result`]: updatedResult,
          [`${prefix}_normal_range`]: updatedRange,
        };
        const saveResult = await saveLabAssessment(payload, labIdRef.current);
        const record = saveResult?.data || saveResult;
        if (record?.id) {
          setLabId(record.id);
          labIdRef.current = record.id;
          setAllLabData(prev => ({ ...prev, ...record }));
        }
        const alerts = saveResult?.alerts || record?.alerts || {};
        const updatedAlerts: Record<string, string | null> = {};
        LAB_TESTS.forEach(test => {
          const p = getTestPrefix(test);
          const alertKey = `${p}_alert`;
          const v = alerts[alertKey] ?? record?.[alertKey];
          updatedAlerts[alertKey] = isValidAlert(v) ? v : null;
        });
        setBackendAlerts(updatedAlerts);
      } catch {
        console.error('Failed to auto-save N/A state');
      }
    }
  };

  const handleCDSSPress = async () => {
    if (!selectedPatientId) {
      return showAlert(
        'Patient Required',
        'Please select a patient first in the search bar.',
      );
    }
    setIsLoading(true);
    setLoadingMessage('Saving Assessment...');
    const prefix = getTestPrefix(LAB_TESTS[selectedTestIndex]);
    try {
      const res = await saveLabAssessment(
        {
          patient_id: selectedPatientId,
          [`${prefix}_result`]: result,
          [`${prefix}_normal_range`]: normalRange,
        },
        labIdRef.current,
      );
      const record = res?.data || res;
      if (record?.id) {
        setLabId(record.id);
        labIdRef.current = record.id;
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

        const existingAlert = backendAlerts[`${prefix}_alert`];
        if (existingAlert) setPassedAlert(existingAlert);
      } else {
        setIsLoading(false);
      }
    } catch {
      setIsLoading(false);
      showAlert('Error', 'Could not initiate clinical support.');
    }
  };

  const handleNextOrSave = async () => {
    if (!selectedPatientId) {
      return showAlert(
        'Patient Required',
        'Please select a patient first in the search bar.',
      );
    }
    
    const prefix = getTestPrefix(LAB_TESTS[selectedTestIndex]);
    const isLastTest = selectedTestIndex === LAB_TESTS.length - 1;
    
    // Only show loading on last test (submit/update)
    if (isLastTest) {
      setIsLoading(true);
      setLoadingMessage('Saving Lab Values...');
    }
    
    try {
      // Determine what to submit based on context
      let resultToSubmit = result;
      let rangeToSubmit = normalRange;
      
      // Only use 'N/A' if explicitly set by checkbox or user typed it
      if (!isNA) {
        // If not using N/A checkbox, check if user literally typed "N/A" or "n/a"
        const isResultNA = result.trim().toLowerCase() === 'n/a';
        const isRangeNA = normalRange.trim().toLowerCase() === 'n/a';
        
        // If user didn't type N/A, submit empty string instead of N/A
        if (!isResultNA && result.trim() === '') {
          resultToSubmit = '';
        }
        if (!isRangeNA && normalRange.trim() === '') {
          rangeToSubmit = '';
        }
      } else {
        // N/A checkbox is checked, use 'N/A'
        resultToSubmit = 'N/A';
        rangeToSubmit = 'N/A';
      }
      
      const res = await saveLabAssessment(
        {
          patient_id: selectedPatientId,
          [`${prefix}_result`]: resultToSubmit,
          [`${prefix}_normal_range`]: rangeToSubmit,
        },
        labIdRef.current,
      );
      const record = res?.data || res;
      if (record?.id) {
        setLabId(record.id);
        labIdRef.current = record.id;
        setAllLabData((prev: Record<string, any>) => ({ ...prev, ...record }));
        const alertVal = record[`${prefix}_alert`];
        setBackendAlerts(prev => ({
          ...prev,
          [`${prefix}_alert`]: isValidAlert(alertVal) ? alertVal : null,
        }));
      }
      setIsLoading(false);
      if (isLastTest) {
        showAlert(
          isExistingRecord ? 'Successfully Updated' : 'Successfully Submitted',
          `Lab Assessment has been ${
            isExistingRecord ? 'updated' : 'submitted'
          } successfully.`,
          'success',
        );
        setIsExistingRecord(true);
      } else {
        setSelectedTestIndex(prev => prev + 1);
      }
    } catch {
      setIsLoading(false);
      showAlert('Error', 'Submission failed. Please check your connection.');
    }
  };

  const generateFindingsSummary = () => {
    const findings = Object.entries(allLabData)
      .filter(
        ([key, value]) =>
          key.endsWith('_result') &&
          typeof value === 'string' &&
          value.trim() !== '' &&
          value !== 'N/A',
      )
      .map(
        ([key, value]) =>
          `${key.replace('_result', '').toUpperCase()}: ${value}`,
      );
    if (dataAlert) findings.push(dataAlert);
    return findings.join('. ');
  };

  const isModified = useMemo(() => {
    if (!selectedPatientId) return false;
    const prefix = getTestPrefix(LAB_TESTS[selectedTestIndex]);
    const savedResult = allLabData[`${prefix}_result`] || (isNA ? 'N/A' : '');
    const savedRange =
      allLabData[`${prefix}_normal_range`] || (isNA ? 'N/A' : '');
    return result !== savedResult || normalRange !== savedRange;
  }, [
    result,
    normalRange,
    allLabData,
    selectedTestIndex,
    isNA,
    selectedPatientId,
  ]);

  const isDataEntered = useMemo(() => {
    return (
      result.trim() !== '' ||
      normalRange.trim() !== ''
    );
  }, [result, normalRange]);

  return {
    searchText,
    setSearchText,
    selectedPatientId,
    scrollEnabled,
    setScrollEnabled,
    isNA,
    toggleNA,
    labId,
    isExistingRecord,
    allLabData,
    selectedTestIndex,
    setSelectedTestIndex,
    result,
    setResult,
    normalRange,
    setNormalRange,
    backendAlerts,
    backendSeverities,
    isAlertLoading,
    isAdpieActive,
    setIsAdpieActive,
    showLabList,
    setShowLabList,
    passedAlert,
    setPassedAlert,
    alertConfig,
    setAlertConfig,
    showAlert,
    dataAlert,
    modalVisible,
    setModalVisible,
    handlePatientSelect,
    handleCDSSPress,
    handleNextOrSave,
    generateFindingsSummary,
    isModified,
    isDataEntered,
    isLoading,
    loadingMessage,
    screenOpacity,
  };
};
