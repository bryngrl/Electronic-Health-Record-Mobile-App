import { useCallback } from 'react';
import apiClient from '@api/apiClient';

export const usePhysicalExam = () => {
  // STEP 1: ASSESSMENT (POST)
  const saveAssessment = useCallback(async (payload: any) => {
    const response = await apiClient.post('/physical-exam/', payload);
    return response.data; 
  }, []);

  // Real-time CDSS
  const checkAssessmentAlerts = useCallback(async (payload: any) => {
    try {
      const response = await apiClient.post('/physical-exam/', payload);
      return response.data;
    } catch (err) { return null; }
  }, []);

  // STEPS 2-5: DPIE UPDATES (PUT)
  const updateDPIE = useCallback(async (examId: number, stepKey: string, text: string) => {
    const response = await apiClient.put(`/physical-exam/${examId}/${stepKey}`, {
      [stepKey]: text
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
    fetchExamHistoryForReading // Bagong function para sa reading
  };
};