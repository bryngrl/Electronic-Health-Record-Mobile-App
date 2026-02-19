// MedAdministration/hook/useMedAdministration.ts
import { useState } from 'react';
import apiClient from '../../../api/apiClient';

export const useMedAdministration = () => {
  const [step, setStep] = useState(0); // 0: 10AM, 1: 2PM, 2: 6PM
  const timeSlots = ['10:00:00', '14:00:00', '18:00:00'];
  const displayTimeSlots = ['10:00 AM', '2:00 PM', '6:00 PM'];

  const [formData, setFormData] = useState({
    patient_id: null as number | null,
    patientName: '',
    date: new Date().toISOString().split('T')[0],
    medications: [
      { medication: '', dose: '', route: '', frequency: '', comments: '' },
      { medication: '', dose: '', route: '', frequency: '', comments: '' },
      { medication: '', dose: '', route: '', frequency: '', comments: '' },
    ],
  });

  const updateCurrentMed = (field: string, value: string) => {
    const newMeds = [...formData.medications];
    newMeds[step] = { ...newMeds[step], [field]: value };
    setFormData({ ...formData, medications: newMeds });
  };

  const nextStep = () => {
    if (step < 2) setStep(step + 1);
  };

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
        // Omitting time/date entirely to satisfy "Input should be None" 
        // while avoiding potential DB nullability crashes.
        const payload = {
          patient_id: parseInt(formData.patient_id.toString(), 10),
          medication: item.med.medication.trim() || null,
          dose: item.med.dose.trim() || null,
          route: item.med.route.trim() || null,
          frequency: item.med.frequency.trim() || null,
          comments: item.med.comments.trim() || null,
        };

        console.log('Sending MedAdmin Payload:', payload);
        const response = await apiClient.post('/medication-administration/', payload);
        console.log('MedAdmin Success:', response.status);

        // Brief delay between requests to prevent DB lock/race conditions
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (err: any) {
      console.error('Submission Error:', err?.response?.data || err.message);
      if (err?.response?.status === 500) {
        throw new Error('Server Error (500). Please check if the medication table exists in the database.');
      }
      const detail = err?.response?.data?.detail;
      const errorMessage = typeof detail === 'string' ? detail : JSON.stringify(detail || err.message);
      throw new Error(errorMessage);
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
  };
};
