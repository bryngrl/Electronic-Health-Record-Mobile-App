import { useCallback } from 'react';
import apiClient from '../../../api/apiClient';

export const usePhysicalExam = () => {
  // STEP 1: ASSESSMENT (POST)
  const saveAssessment = useCallback(async (payload: any) => {
    // Matches @router.post("/")
    const response = await apiClient.post('/physical-exam/', payload);
    return response.data; // Returns PhysicalExamRead with ID
  }, []);

  // Real-time CDSS: Keyword matching for Assessment
  const checkAssessmentAlerts = useCallback(async (payload: any) => {
    try {
      const response = await apiClient.post('/physical-exam/', payload);
      return response.data;
    } catch (err) { return null; }
  }, []);

  // STEPS 2-5: DPIE UPDATES (PUT)
  const updateDPIE = useCallback(async (examId: number, stepKey: string, text: string) => {
    // Matches @router.put("/{exam_id}/diagnosis"), /planning, etc.
    const response = await apiClient.put(`/physical-exam/${examId}/${stepKey}`, {
      [stepKey]: text
    });
    return response.data;
  }, []);

  const fetchLatestPhysicalExam = useCallback(async (patientId: number) => {
    try {
      const response = await apiClient.get(`/physical-exam/patient/${patientId}`);
      // records are sorted by created_at desc
      const records = response.data || [];
      if (records.length > 0) {
        // Check if the latest record is from today
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

  return { saveAssessment, checkAssessmentAlerts, updateDPIE, fetchLatestPhysicalExam };
};