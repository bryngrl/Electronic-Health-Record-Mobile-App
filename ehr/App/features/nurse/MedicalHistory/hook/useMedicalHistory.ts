import { useCallback } from 'react';
import apiClient from '@api/apiClient';

export const useMedicalHistory = () => {
  const sanitize = (data: any) => {
    const sanitized = { ...data };
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].trim() === '') {
        sanitized[key] = 'N/A';
      }
    });
    return sanitized;
  };

  const saveMedicalHistoryStep = useCallback(async (patientId: number, stepKey: string, stepData: any) => {
    try {
      const endpoints: Record<string, string> = {
        present: '/medical-history/present-illness',
        past: '/medical-history/past-medical-surgical',
        allergies: '/medical-history/allergies',
        vaccination: '/medical-history/vaccination',
        developmental: '/medical-history/developmental-history'
      };

      const endpoint = endpoints[stepKey];
      if (!endpoint) throw new Error(`Invalid step key: ${stepKey}`);

      const sanitizedData = sanitize(stepData);
      
      const payload = {
        patient_id: patientId,
        ...sanitizedData
      };

      const response = await apiClient.post(endpoint, payload);
      return response.data;
    } catch (err: any) {
      console.error(`Error saving medical history step (${stepKey}):`, err?.response?.data || err.message);
      const message = err?.response?.data?.message || err?.response?.data?.detail || err?.message || 'Submission Error';
      throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
    }
  }, []);

  const saveMedicalHistory = useCallback(async (patientId: number, formData: any) => {
    try {
      const payload = {
        patient_id: patientId,
        present: { ...sanitize(formData.present), patient_id: patientId },
        past: { ...sanitize(formData.past), patient_id: patientId },
        allergies: { ...sanitize(formData.allergies), patient_id: patientId },
        vaccination: { ...sanitize(formData.vaccination), patient_id: patientId },
        developmental: { 
          patient_id: patientId,
          gross_motor: formData.developmental.gross_motor || 'N/A',
          fine_motor: formData.developmental.fine_motor || 'N/A',
          language: formData.developmental.language || 'N/A',
          cognitive: formData.developmental.cognitive || 'N/A',
          social: formData.developmental.social || 'N/A'
        }
      };

      const response = await apiClient.post('/medical-history/submit-all', payload);
      return response.data;
    } catch (err: any) {
      console.error('Error saving unified medical history:', err?.response?.data || err.message);
      throw err;
    }
  }, []);

  const fetchMedicalHistory = useCallback(async (patientId: number) => {
    try {
      // Get the summary which contains all 5 sub-components
      const response = await apiClient.get(`/medical-history/patient/${patientId}/summary`);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching medical history summary:', err);
      return null;
    }
  }, []);

  return { saveMedicalHistory, saveMedicalHistoryStep, fetchMedicalHistory };
};
