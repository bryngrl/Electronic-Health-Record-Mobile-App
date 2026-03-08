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
      
      const rawDate = toRawDate(dateStr);
      let targetRecords = records.filter(r => r.date === rawDate);
      
      if (targetRecords.length === 0 && records.length > 0) {
        // If no records for today, but there are records, maybe show latest? 
        // Or just show empty for today. The screen seems to want to show today's.
        // I'll stick to rawDate.
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
            medication: record.medication === 'N/A' ? '' : (record.medication || ''),
            dose: record.dose === 'N/A' ? '' : (record.dose || ''),
            route: record.route === 'N/A' ? '' : (record.route || ''),
            frequency: record.frequency === 'N/A' ? '' : (record.frequency || ''),
            comments: record.comments === 'N/A' ? '' : (record.comments || ''),
          };
        }
      });

      setFormData(prev => ({
        ...prev,
        medications: newMeds,
        patient_id: patientId,
      }));
    } catch (error) {
      console.error('Error in fetchPatientData:', error);
    }
  }, []);

  const saveMedAdministration = async () => {
    if (!formData.patient_id) throw new Error('Patient is required');
    const sanitize = val => (val === null || (typeof val === 'string' && val.trim() === '')) ? 'N/A' : val;
    const rawDate = toRawDate(formData.date);
    
    const med = formData.medications[step];
    // If medication is empty and no record exists, we might skip but usually we save N/A
    
    const payload = {
      patient_id: parseInt(formData.patient_id, 10),
      medication: sanitize(med.medication),
      dose: sanitize(med.dose),
      route: sanitize(med.route),
      frequency: sanitize(med.frequency),
      comments: sanitize(med.comments),
      time: rawTimeSlots[step],
      date: rawDate,
    };

    try {
      let response;
      if (med.id) {
        response = await apiClient.put(`/medication-administration/${med.id}`, payload);
      } else {
        response = await apiClient.post('/medication-administration/', payload);
      }
      
      const savedData = response.data?.data || response.data;
      if (savedData?.id) {
        setFormData(prev => {
          const newMeds = [...prev.medications];
          newMeds[step] = { ...newMeds[step], id: savedData.id };
          return { ...prev, medications: newMeds };
        });
      }
      return savedData;
    } catch (err) {
      console.error(`Error saving med step ${step}:`, err?.response?.data || err.message);
      const serverMsg = err?.response?.data?.message || err?.response?.data?.detail;
      throw new Error(serverMsg || err.message || 'Failed to save');
    }
  };

  return {
    step, setStep,
    timeSlots: displayTimeSlots,
    formData, setFormData,
    updateCurrentMed, nextStep,
    saveMedAdministration, fetchPatientData,
  };
};
