import { useCallback } from 'react';
import apiClient from '@api/apiClient';
import { getDataFromCache, saveDataToCache } from '@App/utils/cdssCache';

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
      
      // Check if we have any existing data for this step (any non-N/A value or existing ID)
      const hasExistingData = stepData.patient_id || stepData.medical_id || stepData.id || stepData.development_id;

      const payload = {
        patient_id: patientId,
        ...sanitizedData
      };

      let response;
      if (hasExistingData) {
        // Update existing record using patientId as the unique identifier
        // since backend models use patient_id as primaryKey
        response = await apiClient.put(`${endpoint}/${patientId}`, payload);
      } else {
        // Create new record
        response = await apiClient.post(endpoint, payload);
      }

      // Refresh cache after successful save to ensure "new data" is available
      const freshData = await apiClient.get(`/medical-history/patient/${patientId}`);
      if (freshData.data) {
        await saveDataToCache('medical-history', patientId, freshData.data);
      }

      return response.data;
    } catch (err: any) {
      console.error(`Error saving medical history step (${stepKey}):`, err?.response?.data || err.message);
      const message = err?.response?.data?.message || err?.response?.data?.detail || err?.message || 'Submission Error';
      throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
    }
  }, []);

  const fetchMedicalHistory = useCallback(async (patientId: number) => {
    try {
      // Check cache first
      const cached = await getDataFromCache('medical-history', patientId);
      if (cached) {
        console.log('[MedicalHistory] Returning cached data');
        // Return cached but still fetch fresh in background? 
        // User said "when i load it next time, its faster", usually means show cache then maybe update.
        // For now, let's just return cached if available to be fast.
        return cached;
      }

      // Laravel uses /api/medical-history/patient/{id} as per SYNC_MOBILE_APP.md
      const response = await apiClient.get(`/medical-history/patient/${patientId}`);
      if (response.data) {
        await saveDataToCache('medical-history', patientId, response.data);
      }
      return response.data;
    } catch (err: any) {
      console.error('Error fetching medical history:', err);
      return null;
    }
  }, []);

  return { saveMedicalHistoryStep, fetchMedicalHistory };
};
