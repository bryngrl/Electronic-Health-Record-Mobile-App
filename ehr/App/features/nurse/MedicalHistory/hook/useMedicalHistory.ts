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

      // Map the 5 sub-components to their respective API endpoints
      const endpoints = {
        present: '/medical-history/present-illness',
        past: '/medical-history/past-medical-surgical',
        allergies: '/medical-history/allergies',
        vaccination: '/medical-history/vaccination',
        developmental: '/medical-history/developmental-history'
      };

      const present = sanitize(formData.present);
      const past = sanitize(formData.past);
      const allergies = sanitize(formData.allergies);
      const vaccination = sanitize(formData.vaccination);
      const developmental = sanitize(formData.developmental);

      // Create an array of individual POST requests (backend handles upsert)
      const requests = [
        apiClient.post(endpoints.present, { ...present, patient_id: patientId }),
        apiClient.post(endpoints.past, { ...past, patient_id: patientId }),
        apiClient.post(endpoints.allergies, { ...allergies, patient_id: patientId }),
        apiClient.post(endpoints.vaccination, { ...vaccination, patient_id: patientId }),
        apiClient.post(endpoints.developmental, { 
          patient_id: patientId,
          gross_motor: developmental.gross_motor,
          fine_motor: developmental.fine_motor,
          language: developmental.language,
          cognitive: developmental.cognitive,
          social: developmental.social
        })
      ];

      // Execute all requests in parallel
      const results = await Promise.all(requests);
      return results;
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