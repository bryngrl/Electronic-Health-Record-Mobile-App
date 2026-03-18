import { useState, useCallback, useMemo, useRef } from 'react';
import apiClient from '@api/apiClient';
import { getAlertFromCache, saveAlertToCache } from '@App/utils/cdssCache';

export interface IntakeOutputData {
  oral_intake: string;
  iv_fluids_volume: string;
  urine_output: string;
}

const inferSeverity = (text: string): string => {
  const upper = text.toUpperCase();
  if (upper.includes('URGENT') || upper.includes('CRITICAL') || upper.includes('IMMEDIATELY') || upper.includes('EMERGENCY') || upper.includes('PERITONITIS') || upper.includes('SEPSIS')) return 'CRITICAL';
  if (upper.includes('EVALUATE') || upper.includes('MONITOR') || upper.includes('ASSESS') || upper.includes('REFER') || upper.includes('DISEASE') || upper.includes('INFECTION') || upper.includes('ABNORMAL') || upper.includes('SUSPECTED') || upper.includes('LIVER') || upper.includes('HEMOLYSIS') || upper.includes('JAUNDICE') || upper.includes('PALLOR') || upper.includes('TREAT') || upper.includes('ELEVATED') || upper.includes('OLIGURIA') || upper.includes('DEHYDRATION') || upper.includes('OVERLOAD') || upper.includes('RENAL')) return 'WARNING';
  return 'INFO';
};

export const useIntakeAndOutputLogic = () => {
  const [patientName, setPatientName] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatientObj] = useState<any | null>(null);
  const [intakeOutput, setIntakeOutput] = useState<IntakeOutputData>({
    oral_intake: '',
    iv_fluids_volume: '',
    urine_output: '',
  });
  const [lastSavedData, setLastSavedData] = useState<IntakeOutputData>({
    oral_intake: '',
    iv_fluids_volume: '',
    urine_output: '',
  });
  const [assessmentAlert, setAssessmentAlert] = useState<string | null>(null);
  const [assessmentSeverity, setAssessmentSeverity] = useState<string | null>(null);
  const [currentAlert, setBackendAlert] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataAlert, setDataAlert] = useState<string | null>(null);
  const [recordId, setRecordId] = useState<number | null>(null);
  const [isExistingRecord, setIsExistingRecord] = useState(false);
  const recordIdRef = useRef<number | null>(null);
  const [existingRecords, setExistingRecords] = useState<any[]>([]);
  const [currentDayNo, setCurrentDayNo] = useState<string>('');

  const ADPIE_STAGES = ['Assessment', 'Diagnosis', 'Planning', 'Intervention', 'Evaluation'];

  const fetchDataAlert = useCallback(async (patientId: number) => {
    try {
      const response = await apiClient.get(`/intake-and-output/data-alert/patient/${patientId}`);
      if (response.data) {
        const alertMsg = typeof response.data === 'string' 
          ? response.data 
          : (response.data.intake_and_output || response.data.alert || response.data.message || null);
        setDataAlert(alertMsg);
      } else {
        setDataAlert(null);
      }
    } catch (e) {
      console.error('Failed to fetch intake and output data alert:', e);
      setDataAlert(null);
    }
  }, []);

  const handleUpdateField = useCallback(
    (field: keyof IntakeOutputData, value: string) => {
      if (value === 'N/A') {
        setIntakeOutput(prev => ({ ...prev, [field]: 'N/A' }));
        return;
      }
      // Only allow numbers
      const cleanValue = value.replace(/[^0-9]/g, '');
      setIntakeOutput(prev => ({ ...prev, [field]: cleanValue }));
    },
    [],
  );

  const isDataEntered = useMemo(() => {
    return Object.values(intakeOutput).some(
      v => v && v.trim() !== '' && v !== 'N/A',
    );
  }, [intakeOutput]);

  const fetchLatestIntakeOutput = useCallback(async (patientId: number) => {
    try {
      const response = await apiClient.get(`/intake-and-output/patient/${patientId}?patient_id=${patientId}`);
      const records = response.data || [];
      setExistingRecords(records);
      if (records.length > 0) {
        return records[0];
      }
      return null;
    } catch (err) {
      console.error('Error fetching Intake & Output:', err);
      return null;
    }
  }, []);

  const analyzeField = useCallback(async (payload: any): Promise<{ 
    alerts: Record<string, string | null>; 
    severity: string | null; 
    recordId: number | null 
  } | null> => {
    try {
      const patientId = payload.patient_id || selectedPatientId;
      if (!patientId) return null;

      // Create input data for cache (exclude metadata)
      const { patient_id, day_no, ...inputData } = payload;

      // Check cache first
      const cached = await getAlertFromCache('intake-and-output', patientId, inputData);
      if (cached) {
        console.log('[IntakeAndOutput] Returning cached alerts');
        return { alerts: cached.alerts, severity: cached.severity, recordId: recordIdRef.current };
      }

      const targetId = recordIdRef.current;
      let response;
      if (targetId) {
        response = await apiClient.put(`/intake-and-output/${targetId}/assessment`, payload);
      } else {
        response = await apiClient.post('/intake-and-output', payload);
      }
      
      const data = response.data?.data || response.data;
      const alertsObj = response.data?.alerts || data?.alerts || {};
      const returnedId: number | null = data?.id || null;

      if (returnedId && !recordIdRef.current) {
        recordIdRef.current = returnedId;
        setRecordId(returnedId);
      }

      const allAlerts: Record<string, string | null> = {};
      Object.keys(alertsObj).forEach(key => {
        const val = alertsObj[key];
        allAlerts[key] = (val && val !== 'No findings.' && val !== 'No Findings') ? val.toString().trim() : null;
      });

      // If specific alert keys are in data but not alertsObj, pull them in
      ['oral_intake_alert', 'iv_fluids_volume_alert', 'urine_output_alert', 'alert', 'assessment_alert'].forEach(k => {
        if (!allAlerts[k] && data[k] && data[k] !== 'No findings.' && data[k] !== 'No Findings') {
          allAlerts[k] = data[k].toString().trim();
        }
      });

      let severity = 'INFO';
      const firstAlert = Object.values(allAlerts).find(v => v !== null);
      if (firstAlert) {
        severity = inferSeverity(firstAlert);
      } else {
        severity = null as any;
      }

      // Save to cache
      await saveAlertToCache('intake-and-output', patientId, inputData, allAlerts, severity);

      return { alerts: allAlerts, severity, recordId: returnedId };
    } catch (err) {
      console.error('[IO analyzeField] error:', err);
      return null;
    }
  }, [selectedPatientId]);

  const saveAssessment = useCallback(async (dayNo?: number) => {
    if (!selectedPatientId) return null;
    setLoading(true);
    try {
      const toInt = (val: string) => { const n = parseInt(val, 10); return isNaN(n) ? null : n; };
      const today = new Date().toLocaleDateString('en-CA');
      const payload = {
        patient_id: parseInt(selectedPatientId, 10),
        day_no: dayNo || 1,
        oral_intake: toInt(intakeOutput.oral_intake),
        iv_fluids_volume: toInt(intakeOutput.iv_fluids_volume),
        urine_output: toInt(intakeOutput.urine_output),
      };
      const existingToday = existingRecords.find(r => {
        const recDate = (r.date || r.created_at).split('T')[0];
        return recDate === today;
      });
      let response;
      if (existingToday) {
        response = await apiClient.put(`/intake-and-output/${existingToday.id}/assessment`, payload);
      } else {
        response = await apiClient.post('/intake-and-output', payload);
      }
      const data = response.data?.data || response.data;
      if (data?.id) {
        setRecordId(data.id);
        recordIdRef.current = data.id;
      }
      if (data?.day_no !== undefined && data?.day_no !== null) {
        setCurrentDayNo(String(data.day_no));
      }
      const alertText: string = (data?.alert || data?.assessment_alert || '').toString().trim();
      if (alertText && alertText !== 'No findings.' && alertText !== 'No Findings') {
        setAssessmentAlert(alertText);
        setAssessmentSeverity(inferSeverity(alertText));
      }
      setLastSavedData({ ...intakeOutput });
      fetchLatestIntakeOutput(parseInt(selectedPatientId, 10));
      return data;
    } catch (e) {
      return null;
    } finally {
      setLoading(false);
    }
  }, [selectedPatientId, intakeOutput, existingRecords, fetchLatestIntakeOutput]);

  const handleSelectPatient = useCallback(async (id: number | null, name: string, patientObj?: any) => {
    setSelectedPatientId(id ? id.toString() : null);
    setPatientName(name);
    setSelectedPatientObj(patientObj || null);
    setIsExistingRecord(false);
    recordIdRef.current = null;
    setRecordId(null);
    setCurrentDayNo('');
    setAssessmentAlert(null);
    setAssessmentSeverity(null);
    
    if (id) {
      fetchDataAlert(id);
      const data = await fetchLatestIntakeOutput(id);
      if (data) {
        const today = new Date().toLocaleDateString('en-CA');
        const recordDate = (data.date || data.created_at || '').split('T')[0];

        if (recordDate === today) {
          recordIdRef.current = data.id;
          setRecordId(data.id);
          setIsExistingRecord(true);
        } else {
          recordIdRef.current = null;
          setRecordId(null);
          setIsExistingRecord(false);
        }

        setCurrentDayNo(
          data.day_no !== undefined && data.day_no !== null
            ? String(data.day_no)
            : '',
        );
        const initialData = {
          oral_intake: (data.oral_intake ?? '').toString(),
          iv_fluids_volume: (data.iv_fluids_volume ?? data.iv_fluids ?? '').toString(),
          urine_output: (data.urine_output ?? '').toString(),
        };
        setIntakeOutput(initialData);
        setLastSavedData(initialData);
        if (data.assessment_alert) {
          setAssessmentAlert(data.assessment_alert);
          setAssessmentSeverity(inferSeverity(data.assessment_alert));
        }
      } else {
        setCurrentDayNo('');
        setIntakeOutput({ oral_intake: '', iv_fluids_volume: '', urine_output: '' });
      }
    } else {
      setCurrentDayNo('');
      setIntakeOutput({ oral_intake: '', iv_fluids_volume: '', urine_output: '' });
    }
  }, [fetchLatestIntakeOutput]);

  const triggerPatientAlert = useCallback(() => {
    setBackendAlert({
      title: 'Patient Required',
      message: 'Please select a patient first in the search bar.',
      type: 'error',
    });
  }, []);

  return {
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
    lastSavedData,
  };
};
