import { useCallback } from 'react';
import apiClient from '@api/apiClient';

export const useMedicalHistory = () => {
  const saveMedicalHistory = useCallback(async (patientId: number, formData: any) => {
    try {
      const sanitize = (data: any) => {
        const sanitized = { ...data };
        Object.keys(sanitized).forEach(key => {
          if (typeof sanitized[key] === 'string' && sanitized[key].trim() === '') {
            sanitized[key] = 'N/A';
          }
        });
        return sanitized;
      };

      // Wrap all data into one unified payload for /submit-all
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

      // Send ONE request instead of five
      const response = await apiClient.post('/medical-history/submit-all', payload);
      return response.data;
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.message || 'Submission Error';
      throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
    }
  }, []);

  const fetchMedicalHistory = useCallback(async (patientId: number) => {
    try {
      const response = await apiClient.get(`/medical-history/patient/${patientId}/summary`);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching medical history:', err);
      return null;
    }
  }, []);

  return { saveMedicalHistory, fetchMedicalHistory };
};
