import { useState, useMemo, useCallback } from 'react';
import apiClient from '../../../api/apiClient';

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
  
  // Storage for alerts returned by the backend
  const [backendAlert, setBackendAlert] = useState<{ title: string, message: string, type: 'success' | 'error' } | null>(null);
  
  // Storage for existing records
  const [existingRecords, setExistingRecords] = useState<any[]>([]);

  const currentTime = useMemo(() => TIME_SLOTS[currentTimeIndex], [currentTimeIndex]);

  const isDataEntered = useMemo(() => {
    return Object.values(currentVitals).some(value => value.trim() !== '');
  }, [currentVitals]);

  // Submit to Backend
  const saveAssessment = async () => {
    if (!selectedPatientId) return null;

    const payload = {
      patient_id: parseInt(selectedPatientId, 10),
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      time: convertTo24h(currentTime),
      day_no: 1, // Optional: logic could be added to calculate day_no
      ...currentVitals
    };

    try {
      const response = await apiClient.post('/vital-signs/', payload);
      const data = response.data;
      
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
    } catch (e) {
      console.error('API Error saving vital signs:', e);
      return null;
    }
  };

  const handleUpdateVital = (key: keyof Vitals, value: string) => {
    setCurrentVitals(prev => ({ ...prev, [key]: value }));
    // Reset alert when user starts typing again
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
    }
  };

  const getChartData = (vitalKey: keyof Vitals) => {
    const historicalData = Object.entries(vitalsHistory).map(([time, vitalsRecord]) => ({
      time,
      value: parseFloat(vitalsRecord[vitalKey]) || 0,
    }));
    return historicalData;
  };

  const loadPatientData = async (patientId: string) => {
    try {
      const response = await apiClient.get(`/vital-signs/patient/${patientId}`);
      const records = response.data || [];
      setExistingRecords(records);
      
      const today = new Date().toISOString().split('T')[0];
      const history: Record<string, Vitals> = {};
      
      records.forEach((rec: any) => {
        if (rec.date === today) {
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
  };

  const setSelectedPatient = (id: string | null, name: string) => {
    setSelectedPatientId(id);
    setPatientName(name);
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
      const response = await apiClient.put(`/vital-signs/${recordId}/${stepKey}`, {
        [stepKey]: text
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
    getChartData,
    currentAlert: backendAlert,
    vitalKeys: Object.keys(initialVitals) as (keyof Vitals)[],
    existingRecords,
  };
};
