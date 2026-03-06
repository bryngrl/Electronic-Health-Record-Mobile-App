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
    // Fallback to today in raw format if invalid
    return new Date().toISOString().split('T')[0];
  }
  // toISOString gives UTC, which might shift the date.
  // For local YYYY-MM-DD:
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useMedAdministration = () => {
  const [step, setStep] = useState(0); // 0: 10AM, 1: 2PM, 2: 6PM
  const rawTimeSlots = ['10:00:00', '14:00:00', '18:00:00'];
  const displayTimeSlots = ['10:00 AM', '2:00 PM', '6:00 PM'];

  const [formData, setFormData] = useState({
    patient_id: null,
    patientName: '',
    date: getTodayFormatted(),
    medications: [
      {
        id: null,
        medication: '',
        dose: '',
        route: '',
        frequency: '',
        comments: '',
      },
      {
        id: null,
        medication: '',
        dose: '',
        route: '',
        frequency: '',
        comments: '',
      },
      {
        id: null,
        medication: '',
        dose: '',
        route: '',
        frequency: '',
        comments: '',
      },
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
    try {
      const rawDate = toRawDate(dateStr);
      const response = await apiClient.get(
        `/medication-administration/patient/${patientId}`,
      );
      const records = response.data || [];

      const todayRecords = records.filter(r => r.date === rawDate);

      const newMeds = [
        {
          id: null,
          medication: '',
          dose: '',
          route: '',
          frequency: '',
          comments: '',
        },
        {
          id: null,
          medication: '',
          dose: '',
          route: '',
          frequency: '',
          comments: '',
        },
        {
          id: null,
          medication: '',
          dose: '',
          route: '',
          frequency: '',
          comments: '',
        },
      ];

      todayRecords.forEach(record => {
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
    if (!formData.patient_id) {
      throw new Error('Patient is required');
    }

    const medsToSubmit = formData.medications
      .map((med, index) => ({ med, index }))
      .filter(item => item.med.medication.trim() !== '');

    if (medsToSubmit.length === 0) {
      throw new Error('No medication data to submit');
    }

    const rawDate = toRawDate(formData.date);
    const errors = [];
    for (const item of medsToSubmit) {
      const payload = {
        patient_id: parseInt(formData.patient_id, 10),
        medication: item.med.medication.trim(),
        dose: item.med.dose.trim() || null,
        route: item.med.route.trim() || null,
        frequency: item.med.frequency.trim() || null,
        comments: item.med.comments.trim() || null,
        time: rawTimeSlots[item.index],
        date: rawDate,
      };

      try {
        if (item.med.id) {
          await apiClient.put(
            `/medication-administration/${item.med.id}`,
            payload,
          );
        } else {
          await apiClient.post('/medication-administration/', payload);
        }
      } catch (err) {
        console.error(
          `Error saving ${rawTimeSlots[item.index]}:`,
          err?.response?.data || err.message,
        );
        errors.push(
          `${displayTimeSlots[item.index]}: ${
            err?.response?.data?.detail || err.message
          }`,
        );
      }
    }

    if (errors.length > 0) {
      throw new Error(`Failed to save some records:\n${errors.join('\n')}`);
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
