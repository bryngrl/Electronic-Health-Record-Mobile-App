// MedAdministration/hook/useMedAdministration.ts
import { useState, useCallback } from 'react';
import apiClient from '../../../api/apiClient';

export const useMedAdministration = () => {
  const [step, setStep] = useState(0); // 0: 10AM, 1: 2PM, 2: 6PM
  const rawTimeSlots = ['10:00:00', '14:00:00', '18:00:00'];
  const displayTimeSlots = ['10:00 AM', '2:00 PM', '6:00 PM'];

  const [formData, setFormData] = useState({
    patient_id: null as number | null,
    patientName: '',
    date: new Date().toISOString().split('T')[0],
    medications: [
      { id: null as number | null, medication: '', dose: '', route: '', frequency: '', comments: '' },
      { id: null as number | null, medication: '', dose: '', route: '', frequency: '', comments: '' },
      { id: null as number | null, medication: '', dose: '', route: '', frequency: '', comments: '' },
    ],
  });

  const updateCurrentMed = (field: string, value: string) => {
    const newMeds = [...formData.medications];
    newMeds[step] = { ...newMeds[step], [field]: value };
    setFormData(prev => ({ ...prev, medications: newMeds }));
  };

  const nextStep = () => {
    if (step < 2) setStep(step + 1);
  };

  const fetchPatientData = useCallback(async (patientId: number, dateStr: string) => {
    try {
      const response = await apiClient.get(`/medication-administration/patient/${patientId}`);
      const records = response.data || [];
      
      const todayRecords = records.filter((r: any) => r.date === dateStr);
      
      const newMeds = [
        { id: null, medication: '', dose: '', route: '', frequency: '', comments: '' },
        { id: null, medication: '', dose: '', route: '', frequency: '', comments: '' },
        { id: null, medication: '', dose: '', route: '', frequency: '', comments: '' },
      ];

      todayRecords.forEach((record: any) => {
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

      setFormData(prev => ({ ...prev, medications: newMeds }));
    } catch (error) {
      console.error('Error fetching patient med data:', error);
    }
  }, []);

  const saveMedAdministration = async () => {
    if (!formData.patient_id) {
      throw new Error('Patient is required');
    }

    const medsToSubmit = formData.medications
      .map((med, index) => ({ med, index }))
      .filter(item => item.med.medication.trim() !== '');

    if (medsToSubmit.length === 0) {
      throw new Error('No medication data to submit');
    }

    try {
      for (const item of medsToSubmit) {
        const payload = {
          patient_id: formData.patient_id,
          medication: item.med.medication.trim(),
          dose: item.med.dose.trim() || null,
          route: item.med.route.trim() || null,
          frequency: item.med.frequency.trim() || null,
          comments: item.med.comments.trim() || null,
          time: rawTimeSlots[item.index],
          date: formData.date,
        };

        if (item.med.id) {
          await apiClient.put(`/medication-administration/${item.med.id}`, payload);
        } else {
          await apiClient.post('/medication-administration/', payload);
        }
      }
    } catch (err: any) {
      console.error('Submission Error:', err?.response?.data || err.message);
      throw err;
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
