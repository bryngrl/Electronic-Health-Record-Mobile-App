import { useState, useEffect, useCallback, useRef } from 'react';
import { BackHandler } from 'react-native';
import { useLabValues } from '../hook/useLabValues';
import { LAB_TESTS, getTestPrefix } from './constants';

const isValidAlert = (v: any): v is string =>
  typeof v === 'string' &&
  v.trim() !== '' &&
  !v.toLowerCase().includes('no findings') &&
  !v.toLowerCase().includes('no result') &&
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
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [isNA, setIsNA] = useState(false);

  const [labId, setLabId] = useState<number | null>(null);
  const labIdRef = useRef<number | null>(null);
  const [isExistingRecord, setIsExistingRecord] = useState(false);

  const [allLabData, setAllLabData] = useState<Record<string, any>>({});
  const [selectedTestIndex, setSelectedTestIndex] = useState(0);
  const [result, setResult] = useState('');
  const [normalRange, setNormalRange] = useState('');

  const [backendAlerts, setBackendAlerts] = useState<Record<string, string | null>>({});
  const [backendSeverities, setBackendSeverities] = useState<Record<string, string | null>>({});

  const [isAlertLoading, setIsAlertLoading] = useState(false);

  const [isAdpieActive, setIsAdpieActive] = useState(false);
  const [showLabList, setShowLabList] = useState(false);
  const [passedAlert, setPassedAlert] = useState<string | null>(null);

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning';
  }>({ visible: false, title: '', message: '', type: 'error' });

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' = 'error',
  ) => setAlertConfig({ visible: true, title, message, type });

  useEffect(() => { labIdRef.current = labId; }, [labId]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => backHandler.remove();
  }, [onBack]);

  // Sync result/normalRange when test index or loaded data changes
  useEffect(() => {
    const prefix = getTestPrefix(LAB_TESTS[selectedTestIndex]);
    setResult(allLabData[`${prefix}_result`] || (isNA ? 'N/A' : ''));
    setNormalRange(allLabData[`${prefix}_normal_range`] || (isNA ? 'N/A' : ''));
  }, [selectedTestIndex, allLabData]);

  // Real-time debounce: auto-analyze after user types result/range
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!selectedPatientId || !result || !result.trim() || result === 'N/A') return;

    const prefix = getTestPrefix(LAB_TESTS[selectedTestIndex]);
    const patientId = selectedPatientId;

    setIsAlertLoading(true);
    debounceTimer.current = setTimeout(async () => {
      const res = await analyzeLabField(patientId, labIdRef.current, prefix, result, normalRange);
      if (!res) {
        setIsAlertLoading(false);
        return;
      }
      if (res.labId && !labIdRef.current) {
        labIdRef.current = res.labId;
        setLabId(res.labId);
      }
      setBackendAlerts(prev => ({ ...prev, [`${prefix}_alert`]: res.alert }));
      setBackendSeverities(prev => ({ ...prev, [`${prefix}_severity`]: res.severity }));
      setIsAlertLoading(false);
    }, 800);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [result, normalRange, selectedTestIndex, selectedPatientId]);

  const handlePatientSelect = useCallback(async (
    id: number | null,
    name: string,
    _patientObj?: any,
  ) => {
    setSelectedPatientId(id);
    setSearchText(name);

    if (!id) {
      setLabId(null);
      labIdRef.current = null;
      setIsExistingRecord(false);
      setAllLabData({});
      setBackendAlerts({});
      setBackendSeverities({});
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      return;
    }

    fetchDataAlert(id);
    const data = await fetchLatestLabValues(id);

    if (data && data.id) {
      setLabId(data.id);
      labIdRef.current = data.id;
      setIsExistingRecord(true);
      setAllLabData(data);
      // Load existing alerts, null-out empty/normal values
      const loaded: Record<string, string | null> = {};
      LAB_TESTS.forEach(test => {
        const p = getTestPrefix(test);
        loaded[`${p}_alert`] = isValidAlert(data[`${p}_alert`]) ? data[`${p}_alert`] : null;
      });
      setBackendAlerts(loaded);
    } else {
      setLabId(null);
      labIdRef.current = null;
      setIsExistingRecord(false);
      setAllLabData({});
      setBackendAlerts({});
      setBackendSeverities({});
    }
  }, [fetchDataAlert, fetchLatestLabValues]);

  const toggleNA = () => {
    const newState = !isNA;
    setIsNA(newState);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (newState) {
      setResult('N/A');
      setNormalRange('N/A');
    } else {
      const prefix = getTestPrefix(LAB_TESTS[selectedTestIndex]);
      setResult(allLabData[`${prefix}_result`] || '');
      setNormalRange(allLabData[`${prefix}_normal_range`] || '');
    }
  };

  const handleCDSSPress = async () => {
    if (!selectedPatientId) {
      return showAlert('Patient Required', 'Please select a patient first in the search bar.');
    }
    const prefix = getTestPrefix(LAB_TESTS[selectedTestIndex]);
    try {
      const res = await saveLabAssessment({
        patient_id: selectedPatientId,
        [`${prefix}_result`]: result,
        [`${prefix}_normal_range`]: normalRange,
      }, labIdRef.current);
      const record = res?.data || res;
      if (record?.id) {
        setLabId(record.id);
        labIdRef.current = record.id;
        setIsAdpieActive(true);
        const existingAlert = backendAlerts[`${prefix}_alert`];
        if (existingAlert) setPassedAlert(existingAlert);
      }
    } catch (e) {
      showAlert('Error', 'Could not initiate clinical support.');
    }
  };

  const handleNextOrSave = async () => {
    if (!selectedPatientId) {
      return showAlert('Patient Required', 'Please select a patient first in the search bar.');
    }
    const prefix = getTestPrefix(LAB_TESTS[selectedTestIndex]);
    try {
      const res = await saveLabAssessment({
        patient_id: selectedPatientId,
        [`${prefix}_result`]: result || 'N/A',
        [`${prefix}_normal_range`]: normalRange || 'N/A',
      }, labIdRef.current);
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
      if (selectedTestIndex === LAB_TESTS.length - 1) {
        showAlert(
          isExistingRecord ? 'Successfully Updated' : 'Successfully Submitted',
          `Lab Assessment has been ${isExistingRecord ? 'updated' : 'submitted'} successfully.`,
          'success',
        );
        setIsExistingRecord(true);
      } else {
        setSelectedTestIndex(prev => prev + 1);
      }
    } catch (e) {
      showAlert('Error', 'Submission failed. Please check your connection.');
    }
  };

  const generateFindingsSummary = () => {
    const findings = Object.entries(allLabData)
      .filter(([key, value]) => key.endsWith('_result') && typeof value === 'string' && value.trim() !== '' && value !== 'N/A')
      .map(([key, value]) => `${key.replace('_result', '').toUpperCase()}: ${value}`);
    if (dataAlert) findings.push(dataAlert);
    return findings.join('. ');
  };

  return {
    searchText, setSearchText,
    selectedPatientId,
    scrollEnabled, setScrollEnabled,
    isNA, toggleNA,
    labId,
    isExistingRecord,
    allLabData,
    selectedTestIndex, setSelectedTestIndex,
    result, setResult,
    normalRange, setNormalRange,
    backendAlerts,
    backendSeverities,
    isAlertLoading,
    isAdpieActive, setIsAdpieActive,
    showLabList, setShowLabList,
    passedAlert, setPassedAlert,
    alertConfig, setAlertConfig,
    showAlert,
    dataAlert,
    handlePatientSelect,
    handleCDSSPress,
    handleNextOrSave,
    generateFindingsSummary,
  };
};
