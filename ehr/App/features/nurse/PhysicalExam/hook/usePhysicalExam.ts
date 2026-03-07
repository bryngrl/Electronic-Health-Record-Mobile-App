import { useCallback } from 'react';
import apiClient from '@api/apiClient';

export const usePhysicalExam = () => {
  const sanitize = (data: any) => {
    const sanitized = { ...data };
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].trim() === '') {
        sanitized[key] = 'N/A';
      }
    });
    return sanitized;
  };

  // STEP 1: ASSESSMENT (POST)
  const saveAssessment = useCallback(async (payload: any) => {
    const sanitized = sanitize(payload);
    const response = await apiClient.post('/physical-exam/', sanitized);
    return response.data; 
  }, []);

  // Real-time CDSS
  const checkAssessmentAlerts = useCallback(async (payload: any) => {
    try {
      const sanitized = sanitize(payload);
      const response = await apiClient.post('/physical-exam/check-alerts', sanitized);
      return response.data;
    } catch (err) { return null; }
  }, []);

  // STEPS 2-5: DPIE UPDATES (PUT)
  const updateDPIE = useCallback(async (examId: number, stepKey: string, text: string) => {
    const sanitizedText = text.trim() === '' ? 'N/A' : text;
    const response = await apiClient.put(`/physical-exam/${examId}/${stepKey}`, {
      [stepKey]: sanitizedText
    });
    return response.data;
  }, []);

  const fetchLatestPhysicalExam = useCallback(async (patientId: number) => {
    try {
      const response = await apiClient.get(`/physical-exam/patient/${patientId}`);
      const records = response.data || [];
      if (records.length > 0) {
        const latest = records[0];
        const recordDate = new Date(latest.created_at).toDateString();
        const today = new Date().toDateString();
        if (recordDate === today) {
          return latest;
        }
      }
      return null;
    } catch (err) {
      console.error('Error fetching physical exam:', err);
      return null;
    }
  }, []);

  // --- ADDED FOR READING ONLY (SAFE FOR DOCTORS) ---
  const fetchExamHistoryForReading = useCallback(async (patientId: number) => {
    try {
      const response = await apiClient.get(`/physical-exam/patient/${patientId}`);
      return response.data || [];
    } catch (err) {
      return [];
    }
  }, []);

  return { 
    saveAssessment, 
    checkAssessmentAlerts, 
    updateDPIE, 
    fetchLatestPhysicalExam,
    fetchExamHistoryForReading 
  };
};
