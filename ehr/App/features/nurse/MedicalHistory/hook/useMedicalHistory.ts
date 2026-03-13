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
      // Map step keys to endpoints from SYNC_MOBILE_APP.md
      const endpoints: Record<string, string> = {
        present: '/medical-history/present-illness',
        past: '/medical-history/past-history',
        allergies: '/medical-history/allergies',
        vaccination: '/medical-history/vaccination',
        developmental: '/medical-history/developmental'
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

  const fetchMedicalHistory = useCallback(async (patientId: number) => {
    try {
      // Laravel uses /api/medical-history/patient/{id} as per SYNC_MOBILE_APP.md
      const response = await apiClient.get(`/medical-history/patient/${patientId}`);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching medical history:', err);
      return null;
    }
  }, []);

  return { saveMedicalHistoryStep, fetchMedicalHistory };
};
