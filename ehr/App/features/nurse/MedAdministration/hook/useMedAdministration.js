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
  // Schedule: 10:00, 14:00, 18:00 (HH:mm format)
  const rawTimeSlots = ['10:00', '14:00', '18:00'];
  const displayTimeSlots = ['10:00 AM', '02:00 PM', '06:00 PM'];

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
      const rawDate = toRawDate(dateStr);
      console.log(`[MedAdmin] Fetching for patient ${patientId} on ${rawDate}`);
      
      const fetchSlot = async (timeStr) => {
        try {
          const response = await apiClient.get(`/medication-administration/patient/${patientId}/time/${timeStr}`);
          const data = response.data;

          if (data && data.exists) {
            console.log(`[MedAdmin] Record found for ${timeStr}: ID ${data.id}`);
            return {
              id: data.id, // Store ID for PUT updates
              medication: data.medication === 'N/A' ? '' : data.medication || '',
              dose: data.dose === 'N/A' ? '' : data.dose || '',
              route: data.route === 'N/A' ? '' : data.route || '',
              frequency: data.frequency === 'N/A' ? '' : data.frequency || '',
              comments: data.comments === 'N/A' ? '' : data.comments || '',
            };
          }
        } catch (error) {
          console.log(`[MedAdmin] No record for slot ${timeStr}`);
        }
        return { id: null, medication: '', dose: '', route: '', frequency: '', comments: '' };
      };

      const updatedMeds = await Promise.all(rawTimeSlots.map(time => fetchSlot(time)));

      setFormData(prev => ({
        ...prev,
        medications: updatedMeds,
        patient_id: patientId,
      }));
    } catch (error) {
      console.error('Error in fetchPatientData:', error);
    }
  }, []);

  const saveMedAdministration = async () => {
    if (!formData.patient_id) {
      throw new Error('Patient is required');
    }

    const sanitize = val =>
      val === null || (typeof val === 'string' && val.trim() === '')
        ? 'N/A'
        : val;

    const rawDate = toRawDate(formData.date);
    const item = formData.medications[step];

    const payload = {
      patient_id: parseInt(formData.patient_id, 10),
      medication: sanitize(item.medication),
      dose: sanitize(item.dose),
      route: sanitize(item.route),
      frequency: sanitize(item.frequency),
      time: rawTimeSlots[step],
      date: rawDate,
      comments: sanitize(item.comments),
    };

    try {
      let response;
      if (item.id) {
        // Option 3 in Guide: If we have an ID, update specifically with PUT
        console.log(`[MedAdmin] Editing existing record ID: ${item.id}`);
        response = await apiClient.put(`/medication-administration/${item.id}`, payload);
      } else {
        // Option B in Guide: New record via POST
        console.log(`[MedAdmin] Creating new record for ${rawTimeSlots[step]}`);
        response = await apiClient.post('/medication-administration', payload);
      }
      
      const savedData = response.data?.data || response.data;
      if (savedData?.id) {
        // Update local state with the returned ID
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
    step,
    setStep,
    timeSlots: displayTimeSlots,
    formData,
    setFormData,
    updateCurrentMed,
    nextStep,
    saveMedAdministration,
    fetchPatientData,
  };
};
