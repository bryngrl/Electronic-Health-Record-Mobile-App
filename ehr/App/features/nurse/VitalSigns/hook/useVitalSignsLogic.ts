import { useState, useMemo, useCallback } from 'react';
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

const convertTo24h = (timeStr: string) => {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') {
    hours = modifier === 'AM' ? '00' : '12';
  } else if (modifier === 'PM') {
    hours = (parseInt(hours, 10) + 12).toString();
  }
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
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
  const [dataAlert, setDataAlert] = useState<string | null>(null);
  const [existingRecords, setExistingRecords] = useState<any[]>([]);

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
    return Object.values(currentVitals).some(v => v !== '');
  }, [currentVitals]);

  const isDataComplete = useMemo(() => {
    return Object.values(currentVitals).every(v => v !== '');
  }, [currentVitals]);

  const loadPatientData = useCallback(async (patientId: string) => {
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
      
      if (history[currentTime]) {
        setCurrentVitals(history[currentTime]);
      } else {
        setCurrentVitals(initialVitals);
      }
      
    } catch (e) {
      console.error('Failed to load patient data:', e);
      setExistingRecords([]);
      setVitalsHistory({});
      setCurrentVitals(initialVitals);
    }
  }, [currentTime]);

  const setSelectedPatient = useCallback((id: string | null, name: string) => {
    setSelectedPatientId(id);
    setPatientName(name);
    if (id) {
      loadPatientData(id);
    } else {
      setVitalsHistory({});
      setCurrentVitals(initialVitals);
      setExistingRecords([]);
    }
  }, [loadPatientData]);

  const handleUpdateVital = useCallback((key: keyof Vitals, value: string) => {
    setCurrentVitals(prev => ({ ...prev, [key]: value }));
    if (backendAlert) setBackendAlert(null);
  }, [backendAlert]);

  const handleNextTime = useCallback(() => {
    setVitalsHistory(prev => ({ ...prev, [currentTime]: currentVitals }));
    
    if (currentTimeIndex < TIME_SLOTS.length - 1) {
      const nextIndex = currentTimeIndex + 1;
      setCurrentTimeIndex(nextIndex);
      const historyForNext = vitalsHistory[TIME_SLOTS[nextIndex]];
      setCurrentVitals(historyForNext || initialVitals);
      setBackendAlert(null); 
    }
  }, [currentTime, currentTimeIndex, currentVitals, vitalsHistory]);

  const saveAssessment = useCallback(async (dayNo?: number) => {
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
      const existingRecord = existingRecords.find(
        r => {
            const recDate = (r.date || r.created_at).split('T')[0];
            return recDate === today && r.time === time24;
        }
      );

      let response;
      if (existingRecord) {
        response = await apiClient.put(`/vital-signs/${existingRecord.id}/assessment`, payload);
      } else {
        response = await apiClient.post('/vital-signs', payload);
      }
      
      const data = response.data;
      await loadPatientData(selectedPatientId);
      
      if (data.assessment_alert) {
        const isCritical = data.assessment_alert.includes('🔴') || data.assessment_alert.includes('CRITICAL');
        const alertObj: { title: string, message: string, type: 'success' | 'error' } = {
          title: isCritical ? 'CRITICAL ALERT' : 'VITAL SIGNS ASSESSMENT',
          message: data.assessment_alert.replace(/ \| /g, '\n'),
          type: isCritical ? 'error' : 'success'
        };
        setBackendAlert(alertObj);
      }
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
  }, [selectedPatientId, currentTime, currentVitals, existingRecords, loadPatientData]);

  const selectTime = useCallback((index: number) => {
    const oldTime = TIME_SLOTS[currentTimeIndex];
    setVitalsHistory(prev => ({ ...prev, [oldTime]: currentVitals }));
    
    setCurrentTimeIndex(index);
    const newTime = TIME_SLOTS[index];
    const historyForSlot = vitalsHistory[newTime];
    setCurrentVitals(historyForSlot || initialVitals);
  }, [currentTimeIndex, currentVitals, vitalsHistory]);

  const reset = useCallback(() => {
    setPatientName('');
    setSelectedPatientId(null);
    setVitalsHistory({});
    setCurrentVitals(initialVitals);
    setCurrentTimeIndex(0);
    setBackendAlert(null);
    setExistingRecords([]);
  }, []);

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
    updateDPIE,
    isMenuVisible,
    setIsMenuVisible,
    selectTime,
    reset,
    TIME_SLOTS,
    chartData,
    currentAlert: backendAlert,
    dataAlert,
    vitalKeys: Object.keys(initialVitals) as (keyof Vitals)[],
    existingRecords,
  };
};
