// MedAdministration/hook/useMedAdministration.js
import { useState, useCallback } from 'react';
import apiClient from '@api/apiClient';
import { getDataFromCache, saveDataToCache } from '@App/utils/cdssCache';

const getTodayFormatted = () =>
  new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

const toRawDate = displayDate => {
  const d = new Date(displayDate);
  if (isNaN(d.getTime())) {
    return new Date().toLocaleDateString('en-CA');
  }
  // Robust YYYY-MM-DD using en-CA locale
  return d.toLocaleDateString('en-CA');
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

  const [lastSavedMeds, setLastSavedMeds] = useState([
    { id: null, medication: '', dose: '', route: '', frequency: '', comments: '' },
    { id: null, medication: '', dose: '', route: '', frequency: '', comments: '' },
    { id: null, medication: '', dose: '', route: '', frequency: '', comments: '' },
  ]);

  const isModified = JSON.stringify(formData.medications[step]) !== JSON.stringify(lastSavedMeds[step]);

  const isDataEntered = ['medication', 'dose', 'route', 'frequency', 'comments'].some(
    f => {
      const v = formData.medications[step][f];
      return v && typeof v === 'string' && v.trim() !== '' && v !== 'N/A';
    },
  );

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
    
    const rawDate = toRawDate(dateStr);
    const cacheKey = `med-admin-${patientId}-${rawDate}`;

    try {
      // Check cache first (with date in key)
      const cached = await getDataFromCache(cacheKey, patientId);
      if (cached) {
        setFormData(prev => ({
          ...prev,
          medications: cached,
          patient_id: patientId,
        }));
        setLastSavedMeds(JSON.parse(JSON.stringify(cached)));
      }

      console.log(`[MedAdmin] Fetching all records for patient ${patientId} on ${rawDate}`);
      const response = await apiClient.get(`/medication-administration/patient/${patientId}`);
      const allRecords = response.data || [];

      // Map backend records to our 3 specific time slots
      const updatedMeds = rawTimeSlots.map(timeStr => {
        const dbTime = timeStr + ':00';
        const record = allRecords.find(r => r.date === rawDate && r.time === dbTime);

        if (record) {
          return {
            id: record.id,
            medication: record.medication === 'N/A' ? '' : record.medication || '',
            dose: record.dose === 'N/A' ? '' : record.dose || '',
            route: record.route === 'N/A' ? '' : record.route || '',
            frequency: record.frequency === 'N/A' ? '' : record.frequency || '',
            comments: record.comments === 'N/A' ? '' : record.comments || '',
          };
        }
        return { id: null, medication: '', dose: '', route: '', frequency: '', comments: '' };
      });

      setFormData(prev => ({
        ...prev,
        medications: updatedMeds,
        patient_id: patientId,
      }));
      setLastSavedMeds(JSON.parse(JSON.stringify(updatedMeds)));
      await saveDataToCache(cacheKey, patientId, updatedMeds);
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
        console.log(`[MedAdmin] Editing existing record ID: ${item.id}`);
        response = await apiClient.put(`/medication-administration/${item.id}`, payload);
      } else {
        console.log(`[MedAdmin] Creating new record for ${rawTimeSlots[step]}`);
        response = await apiClient.post('/medication-administration', payload);
      }
      
      const savedData = response.data?.data || response.data;
      if (savedData?.id) {
        setFormData(prev => {
          const newMeds = [...prev.medications];
          newMeds[step] = { ...newMeds[step], id: savedData.id };
          setLastSavedMeds(JSON.parse(JSON.stringify(newMeds)));
          
          // Update cache after save
          const cacheKey = `med-admin-${formData.patient_id}-${rawDate}`;
          saveDataToCache(cacheKey, formData.patient_id, newMeds);
          
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
    isModified,
    isDataEntered,
  };
};
