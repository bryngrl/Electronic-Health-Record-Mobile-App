// MedAdministration/hook/useMedAdministration.ts
import { useState } from 'react';

export const useMedAdministration = () => {
  const [step, setStep] = useState(0); // 0: 10AM, 1: 2PM, 2: 6PM
  const timeSlots = ['10:00 AM', '2:00 PM', '6:00 PM'];

  const [formData, setFormData] = useState({
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

  return {
    step,
    setStep,
    timeSlots,
    formData,
    setFormData,
    updateCurrentMed,
    nextStep,
  };
};
