import { useState, useMemo, useEffect } from 'react';
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

export const useVitalSignsLogic = () => {
  const [patientName, setPatientName] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [vitalsHistory, setVitalsHistory] = useState<Record<string, Vitals>>({});
  const [currentVitals, setCurrentVitals] = useState<Vitals>(initialVitals);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  
  // Storage for alerts returned by the backend
  const [backendAlert, setBackendAlert] = useState<{ title: string, message: string, type: 'success' | 'error' } | null>(null);

  // Load patient list on mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await apiClient.get('/patients/');
        const normalized = (response.data || []).map((p: any) => ({
          id: (p.patient_id ?? p.id).toString(),
          fullName: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
        }));
        setPatients(normalized);
      } catch (e) {
        console.error('Failed to load patients');
      }
    };
    fetchPatients();
  }, []);

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
        const alertObj = {
          title: isCritical ? 'CRITICAL ALERT' : 'VITAL SIGNS ASSESSMENT',
          message: data.assessment_alert.replace(/ \| /g, '\n'),
          type: isCritical ? 'error' : ('success' as const)
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
    // We remove the automatic saveAssessment here so the UI can handle it explicitly
    setVitalsHistory(prev => ({ ...prev, [currentTime]: currentVitals }));
    
    if (currentTimeIndex < TIME_SLOTS.length - 1) {
      const nextIndex = currentTimeIndex + 1;
      setCurrentTimeIndex(nextIndex);
      const historyForNext = vitalsHistory[TIME_SLOTS[nextIndex]];
      setCurrentVitals(historyForNext || initialVitals);
      setBackendAlert(null); // Clear alert for new time slot
    }
  };

  const getChartData = (vitalKey: keyof Vitals) => {
    const currentPoint = { time: currentTime, value: parseFloat(currentVitals[vitalKey]) || 0 };
    const historicalData = Object.entries(vitalsHistory).map(([time, vitals]) => ({
      time,
      value: parseFloat(vitals[vitalKey]) || 0,
    }));
    return [...historicalData, currentPoint];
  };

  const handleSearchPatient = (text: string) => {
    setPatientName(text);
    setFilteredPatients(
      patients.filter(p =>
        p.fullName.toLowerCase().includes(text.toLowerCase()),
      ),
    );
    setShowDropdown(true);
  };

  const selectPatient = (p: any) => {
    setPatientName(p.fullName);
    setSelectedPatientId(p.id);
    setShowDropdown(false);
  };

  const selectTime = (index: number) => {
    setVitalsHistory(prev => ({ ...prev, [currentTime]: currentVitals }));
    setCurrentTimeIndex(index);
    const historyForSlot = vitalsHistory[TIME_SLOTS[index]];
    setCurrentVitals(historyForSlot || initialVitals);
  };

  const reset = () => {
    setPatientName('');
    setSelectedPatientId(null);
    setVitalsHistory({});
    setCurrentVitals(initialVitals);
    setCurrentTimeIndex(0);
    setBackendAlert(null);
  };

  const updateDPIE = async (recordId: number, stepKey: string, text: string) => {
    try {
      const response = await apiClient.put(`/vital-signs/${recordId}/${stepKey}`, {
        [stepKey]: text
      });
      return response.data;
    } catch (err) {
      console.error(`Error updating Vital Signs ${stepKey}:`, err);
      return null;
    }
  };

  return {
    patientName,
    selectedPatientId,
    filteredPatients,
    showDropdown,
    setShowDropdown,
    handleSearchPatient,
    selectPatient,
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
  };
};