// MedAdministration/hook/useMedAdministration.js
import { useState, useCallback } from 'react';
import apiClient from '@api/apiClient';

const getTodayFormatted = () =>
  new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

const toRawDate = displayDate => {
  const d = new Date(displayDate);
  if (isNaN(d.getTime())) {
    return new Date().toISOString().split('T')[0];
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useMedAdministration = () => {
  const [step, setStep] = useState(0); 
  const rawTimeSlots = ['10:00:00', '14:00:00', '18:00:00'];
  const displayTimeSlots = ['10:00 AM', '2:00 PM', '6:00 PM'];

  const [formData, setFormData] = useState({
    patient_id: null,
    patientName: '',
    date: getTodayFormatted(),
    medications: [
      { id: null, medication: '', dose: '', route: '', frequency: '', comments: '' },
      { id: null, medication: '', dose: '', route: '', frequency: '', comments: '' },
      { id: null, medication: '', dose: '', route: '', frequency: '', comments: '' },
    ],
  });

  const updateCurrentMed = (field, value) => {
    setFormData(prev => {
      const newMeds = [...prev.medications];
      newMeds[step] = { ...newMeds[step], [field]: value };
      return { ...prev, medications: newMeds };
    });
  };

  const nextStep = () => {
    if (step < 2) setStep(step + 1);
  };

  const fetchPatientData = useCallback(async (patientId, dateStr) => {
    if (!patientId) return;
    try {
      const response = await apiClient.get(`/medication-administration/patient/${patientId}`);
      const records = response.data || [];
      if (records.length === 0) return;

      // Find records for the requested date, or fallback to the latest date
      const rawDate = toRawDate(dateStr);
      let targetRecords = records.filter(r => r.date === rawDate);
      
      if (targetRecords.length === 0) {
        const latestDate = records[0].date;
        targetRecords = records.filter(r => r.date === latestDate);
        // Update display date to match the loaded data
        const d = new Date(latestDate);
        const formatted = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        setFormData(prev => ({ ...prev, date: formatted }));
      }

      const newMeds = [
        { id: null, medication: '', dose: '', route: '', frequency: '', comments: '' },
        { id: null, medication: '', dose: '', route: '', frequency: '', comments: '' },
        { id: null, medication: '', dose: '', route: '', frequency: '', comments: '' },
      ];

      targetRecords.forEach(record => {
        const timeIndex = rawTimeSlots.indexOf(record.time);
        if (timeIndex !== -1) {
          newMeds[timeIndex] = {
            id: record.id,
            medication: record.medication || '',
            dose: record.dose || '',
            route: record.route || '',
            frequency: record.frequency || '',
            comments: record.comments || '',
          };
        }
      });

      setFormData(prev => ({
        ...prev,
        medications: newMeds,
        patient_id: patientId,
      }));
    } catch (error) {
      console.error('Error fetching patient med data:', error);
    }
  }, []);

  const saveMedAdministration = async () => {
    if (!formData.patient_id) throw new Error('Patient is required');
    const sanitize = val => (val === null || (typeof val === 'string' && val.trim() === '')) ? 'N/A' : val;
    const rawDate = toRawDate(formData.date);
    const errors = [];
    
    for (let i = 0; i <= step; i++) {
      const med = formData.medications[i];
      if (med.medication === '' && !med.id) continue;

      const payload = {
        patient_id: parseInt(formData.patient_id, 10),
        medication: sanitize(med.medication),
        dose: sanitize(med.dose),
        route: sanitize(med.route),
        frequency: sanitize(med.frequency),
        comments: sanitize(med.comments),
        time: rawTimeSlots[i],
        date: rawDate,
      };

      try {
        if (med.id) {
          await apiClient.put(`/medication-administration/${med.id}`, payload);
        } else {
          await apiClient.post('/medication-administration/', payload);
        }
      } catch (err) {
        errors.push(`${displayTimeSlots[i]}: ${err?.response?.data?.detail || err.message}`);
      }
    }

    if (errors.length > 0) throw new Error(`Failed to save some records:\n${errors.join('\n')}`);
  };

  return {
    step, setStep,
    timeSlots: displayTimeSlots,
    formData, setFormData,
    updateCurrentMed, nextStep,
    saveMedAdministration, fetchPatientData,
  };
};
