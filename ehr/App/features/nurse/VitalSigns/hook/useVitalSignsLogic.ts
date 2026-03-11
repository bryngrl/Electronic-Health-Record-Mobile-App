import { useState, useMemo, useCallback, useRef } from 'react';
import apiClient from '@api/apiClient';

const TIME_SLOTS = ['6:00 AM', '8:00 AM', '12:00 PM', '2:00 PM', '6:00 PM', '8:00 PM', '12:00 AM'];

export interface Vitals {
  temperature: string;
  hr: string;
  rr: string;
  bp: string;
  spo2: string;
}

const initialVitals: Vitals = {
  temperature: '',
  hr: '',
  rr: '',
  bp: '',
  spo2: '',
};

const inferSeverity = (text: string): string => {
  const upper = text.toUpperCase();
  if (upper.includes('URGENT') || upper.includes('CRITICAL') || upper.includes('IMMEDIATELY') || upper.includes('EMERGENCY') || upper.includes('PERITONITIS') || upper.includes('SEPSIS')) return 'CRITICAL';
  if (upper.includes('EVALUATE') || upper.includes('MONITOR') || upper.includes('ASSESS') || upper.includes('REFER') || upper.includes('DISEASE') || upper.includes('INFECTION') || upper.includes('ABNORMAL') || upper.includes('SUSPECTED') || upper.includes('LIVER') || upper.includes('HEMOLYSIS') || upper.includes('JAUNDICE') || upper.includes('PALLOR') || upper.includes('TREAT') || upper.includes('ELEVATED') || upper.includes('TACHYCARDIA') || upper.includes('BRADYCARDIA') || upper.includes('HYPERTENSION') || upper.includes('HYPOTENSION') || upper.includes('FEVER') || upper.includes('HYPOTHERMIA')) return 'WARNING';
  return 'INFO';
};

export const convertTo24h = (timeStr: string) => {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') {
    hours = modifier === 'AM' ? '00' : '12';
  } else if (modifier === 'PM') {
    hours = (parseInt(hours, 10) + 12).toString();
  }
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};

const formatTo12h = (time24: string) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const h = parseInt(hours, 10);
  const m = parseInt(minutes, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHours = h % 12 || 12;
  return `${displayHours}:${m.toString().padStart(2, '0')} ${ampm}`;
};

export const useVitalSignsLogic = () => {
  const [patientName, setPatientName] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const [vitalsHistory, setVitalsHistory] = useState<Record<string, Vitals>>({});
  const [currentVitals, setCurrentVitals] = useState<Vitals>(initialVitals);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  
  const [backendAlert, setBackendAlert] = useState<{ title: string, message: string, type: 'success' | 'error' } | null>(null);
  const [backendSeverity, setBackendSeverity] = useState<string | null>(null);
  const [realtimeAlert, setRealtimeAlert] = useState<string | null>(null);
  const [realtimeSeverity, setRealtimeSeverity] = useState<string | null>(null);
  const [dataAlert, setDataAlert] = useState<string | null>(null);
  const [existingRecords, setExistingRecords] = useState<any[]>([]);
  const [isExistingRecord, setIsExistingRecord] = useState(false);
  const recordIdRef = useRef<number | null>(null);

  const currentTime = useMemo(() => TIME_SLOTS[currentTimeIndex], [currentTimeIndex]);

  const fetchDataAlert = async (patientId: string) => {
    try {
      const response = await apiClient.get(`/vital-signs/data-alert/patient/${patientId}`);
      if (response.data) {
        const alertMsg = typeof response.data === 'string' 
          ? response.data 
          : (response.data.vital_signs || response.data.alert || response.data.message || null);
        setDataAlert(alertMsg);
      } else {
        setDataAlert(null);
      }
    } catch (e) {
      console.error('Failed to fetch vital signs data alert:', e);
      setDataAlert(null);
    }
  };

  const isDataEntered = useMemo(() => {
    return true; 
  }, []);

  const isDataComplete = useMemo(() => {
    return true; 
  }, []);

  const loadPatientData = async (patientId: string) => {
    try {
      fetchDataAlert(patientId);
      const response = await apiClient.get(`/vital-signs/patient/${patientId}?patient_id=${patientId}`);
      const records = response.data || [];
      setExistingRecords(records);
      
      const today = new Date().toLocaleDateString('en-CA');
      const history: Record<string, Vitals> = {};
      
      records.forEach((rec: any) => {
        const recDate = (rec.date || rec.created_at).split('T')[0];
        if (recDate === today) {
          const slotLabel = formatTo12h(rec.time);
          if (TIME_SLOTS.includes(slotLabel)) {
            history[slotLabel] = {
              temperature: rec.temperature || '',
              hr: rec.hr || '',
              rr: rec.rr || '',
              bp: rec.bp || '',
              spo2: rec.spo2 || '',
            };
          }
        }
      });
      
      setVitalsHistory(history);
      
      if (Object.keys(history).length > 0) {
        setIsExistingRecord(true);
      }

      if (history[currentTime]) {
        setCurrentVitals(history[currentTime]);
      } else if (records.length > 0) {
        const latest = records[0];
        setCurrentVitals({
          temperature: latest.temperature || '',
          hr: latest.hr || '',
          rr: latest.rr || '',
          bp: latest.bp || '',
          spo2: latest.spo2 || '',
        });
      } else {
        setCurrentVitals(initialVitals);
      }
      
    } catch (e) {
      console.error('Failed to load patient data:', e);
      setExistingRecords([]);
      setVitalsHistory({});
      setCurrentVitals(initialVitals);
    }
  };

  const analyzeField = useCallback(async (payload: any): Promise<{ alert: string | null; severity: string | null } | null> => {
    try {
      const today = new Date().toLocaleDateString('en-CA');
      const payloadTime = (payload.time || '').substring(0, 5);
      const existingRecord = existingRecords.find(r => {
        const recDate = (r.date || r.created_at).split('T')[0];
        return recDate === today && (r.time || '').substring(0, 5) === payloadTime;
      });
      let targetId = existingRecord?.id || recordIdRef.current;

      if (!targetId) {
        const postResp = await apiClient.post('/vital-signs', payload);
        const postData = postResp.data?.data || postResp.data;
        targetId = postData?.id;
        if (targetId) recordIdRef.current = targetId;
      }

      if (!targetId) return null;

      const response = await apiClient.put(`/vital-signs/${targetId}/assessment`, payload);
      const data = response.data?.data || response.data;
      const alertText: string = (data?.alerts || data?.assessment_alert || data?.alert || '').toString().trim();
      console.log('[VS analyzeField] raw response data:', JSON.stringify(data));
      console.log('[VS analyzeField] alert text:', alertText || '(empty)');
      if (
        !alertText ||
        alertText.toLowerCase().includes('no findings') ||
        alertText.toLowerCase().includes('no result') ||
        alertText.toLowerCase() === 'normal'
      ) {
        return { alert: null, severity: null };
      }
      return { alert: alertText, severity: inferSeverity(alertText) };
    } catch (err) {
      return null;
    }
  }, [existingRecords]);

  const saveAssessment = async (dayNo?: number) => {
    if (!selectedPatientId) return null;

    const sanitize = (data: any) => {
      const sanitized = { ...data };
      Object.keys(sanitized).forEach(key => {
        if (typeof sanitized[key] === 'string' && sanitized[key].trim() === '') {
          sanitized[key] = 'N/A';
        }
      });
      return sanitized;
    };

    const today = new Date().toLocaleDateString('en-CA');
    const time24 = convertTo24h(currentTime);

    const payload = sanitize({
      patient_id: parseInt(selectedPatientId, 10),
      date: today,
      time: time24,
      day_no: dayNo || 1,
      ...currentVitals
    });

    try {
      // Check if we have an existing record for this patient, date, and time slot
      const existingRecord = existingRecords.find(r => {
        const recDate = (r.date || r.created_at).split('T')[0];
        return recDate === today && (r.time || '').substring(0, 5) === time24.substring(0, 5);
      });

      let response;
      if (existingRecord) {
        response = await apiClient.put(`/vital-signs/${existingRecord.id}/assessment`, payload);
      } else {
        response = await apiClient.post('/vital-signs', payload);
      }
      
      const data = response.data?.data || response.data;
      
      // Refresh local records list after save
      await loadPatientData(selectedPatientId);
      
      const alertText: string = (data?.alerts || data?.assessment_alert || data?.alert || '').toString().trim();
      if (alertText && !alertText.toLowerCase().includes('no findings')) {
        const isCritical = alertText.includes('🔴') || alertText.toUpperCase().includes('CRITICAL');
        const alertObj: { title: string, message: string, type: 'success' | 'error' } = {
          title: isCritical ? 'CRITICAL ALERT' : 'VITAL SIGNS ASSESSMENT',
          message: alertText.replace(/ \| /g, '\n'),
          type: isCritical ? 'error' : 'success'
        };
        setBackendAlert(alertObj);
        setBackendSeverity(inferSeverity(alertText));
        setRealtimeAlert(alertText);
        setRealtimeSeverity(inferSeverity(alertText));
      }
      setIsExistingRecord(true);
      return data;
    } catch (e: any) {
      console.error('API Error saving vital signs:', e?.response?.data || e.message);
      setBackendAlert({
          title: 'Connection Error',
          message: e?.response?.data?.message || e?.response?.data?.detail || e.message || 'Failed to save vital signs.',
          type: 'error'
      });
      return null;
    }
  };

  const handleUpdateVital = (key: keyof Vitals, value: string) => {
    setCurrentVitals(prev => ({ ...prev, [key]: value }));
    if (backendAlert) setBackendAlert(null);
  };

  const handleNextTime = () => {
    setVitalsHistory(prev => ({ ...prev, [currentTime]: currentVitals }));
    
    if (currentTimeIndex < TIME_SLOTS.length - 1) {
      const nextIndex = currentTimeIndex + 1;
      setCurrentTimeIndex(nextIndex);
      const historyForNext = vitalsHistory[TIME_SLOTS[nextIndex]];
      setCurrentVitals(historyForNext || initialVitals);
      setBackendAlert(null);
      setRealtimeAlert(null);
      setRealtimeSeverity(null);
    }
  };

  const chartData = useMemo(() => {
    const keys: (keyof Vitals)[] = ['temperature', 'hr', 'rr', 'bp', 'spo2'];
    const result: Record<string, any[]> = {};

    keys.forEach(key => {
      result[key] = TIME_SLOTS.map(slot => {
        let valueStr = '';
        if (slot === currentTime) {
          valueStr = currentVitals[key];
        } else if (vitalsHistory[slot]) {
          valueStr = vitalsHistory[slot][key];
        }
        
        const numericValue = parseFloat(valueStr.split('/')[0]) || 0;
        
        return {
          time: slot,
          value: numericValue,
        };
      });
    });
    return result;
  }, [currentVitals, vitalsHistory, currentTime]);

  const setSelectedPatient = (id: string | null, name: string) => {
    setSelectedPatientId(id);
    setPatientName(name);
    setIsExistingRecord(false);
    recordIdRef.current = null;
    setRealtimeAlert(null);
    setRealtimeSeverity(null);
    setBackendSeverity(null);
    if (id) {
      loadPatientData(id);
    } else {
      setVitalsHistory({});
      setCurrentVitals(initialVitals);
      setExistingRecords([]);
    }
  };

  const selectTime = (index: number) => {
    const oldTime = TIME_SLOTS[currentTimeIndex];
    setVitalsHistory(prev => ({ ...prev, [oldTime]: currentVitals }));
    
    setCurrentTimeIndex(index);
    const newTime = TIME_SLOTS[index];
    const historyForSlot = vitalsHistory[newTime];
    setCurrentVitals(historyForSlot || initialVitals);
    setRealtimeAlert(null);
    setRealtimeSeverity(null);
  };

  const reset = () => {
    setPatientName('');
    setSelectedPatientId(null);
    setVitalsHistory({});
    setCurrentVitals(initialVitals);
    setCurrentTimeIndex(0);
    setBackendAlert(null);
    setExistingRecords([]);
  };

  const updateDPIE = useCallback(async (recordId: number, stepKey: string, text: string) => {
    try {
      const sanitizedText = text.trim() === '' ? 'N/A' : text;
      const response = await apiClient.put(`/vital-signs/${recordId}/${stepKey}`, {
        [stepKey]: sanitizedText
      });
      return response.data;
    } catch (err) {
      console.error(`Error updating Vital Signs ${stepKey}:`, err);
      return null;
    }
  }, []);

  return {
    patientName,
    selectedPatientId,
    setSelectedPatient,
    vitals: currentVitals,
    handleUpdateVital,
    isDataEntered,
    isDataComplete,
    currentTime,
    currentTimeIndex,
    handleNextTime,
    saveAssessment,
    analyzeField,
    updateDPIE,
    isMenuVisible,
    setIsMenuVisible,
    selectTime,
    reset,
    TIME_SLOTS,
    chartData,
    currentAlert: backendAlert,
    backendSeverity,
    realtimeAlert,
    realtimeSeverity,
    setRealtimeAlert,
    setRealtimeSeverity,
    dataAlert,
    vitalKeys: Object.keys(initialVitals) as (keyof Vitals)[],
    existingRecords,
    isExistingRecord,
    setIsExistingRecord,
  };
};
