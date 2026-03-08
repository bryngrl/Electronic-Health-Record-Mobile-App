import { useCallback, useState } from 'react';
import apiClient from '@api/apiClient';

export const usePhysicalExam = () => {
  const [dataAlert, setDataAlert] = useState<string | null>(null);

  const fetchDataAlert = useCallback(async (patientId: number) => {
    try {
      const response = await apiClient.get(`/physical-exam/data-alert/patient/${patientId}`);
      if (response.data) {
        const alertMsg = typeof response.data === 'string' 
          ? response.data 
          : (response.data.physical_exam || response.data.alert || response.data.message || null);
        setDataAlert(alertMsg);
      } else {
        setDataAlert(null);
      }
    } catch (e) {
      console.error('Failed to fetch physical exam data alert:', e);
      setDataAlert(null);
    }
  }, []);

  const sanitize = (data: any) => {
    const sanitized = { ...data };
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].trim() === '') {
        sanitized[key] = 'N/A';
      }
    });
    return sanitized;
  };

  // STEP 1: ASSESSMENT (POST or PUT)
  const saveAssessment = useCallback(async (payload: any, existingId?: number | null) => {
    // Ensure patient_id is integer
    const body = {
      ...payload,
      patient_id: parseInt(payload.patient_id, 10)
    };
    const sanitized = sanitize(body);
    
    const targetId = existingId || payload.id || payload.physical_exam_id;
    
    if (targetId) {
      // UPDATE existing record
      const response = await apiClient.put(`/physical-exam/${targetId}/assessment`, sanitized);
      return response.data;
    } else {
      // CREATE new record
      const response = await apiClient.post('/physical-exam', sanitized);
      return response.data;
    }
  }, []);

  // Real-time CDSS: Keyword matching for Assessment
  const checkAssessmentAlerts = useCallback(async (payload: any, existingId?: number | null) => {
    try {
      const body = {
        ...payload,
        patient_id: parseInt(payload.patient_id, 10)
      };
      const sanitized = sanitize(body);
      
      const targetId = existingId || payload.id || payload.physical_exam_id;

      if (targetId) {
        // UPDATE/Check on existing record
        const response = await apiClient.put(`/physical-exam/${targetId}/assessment`, sanitized);
        return response.data;
      } else {
        // CREATE/Check on new record
        const response = await apiClient.post('/physical-exam', sanitized);
        return response.data;
      }
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
      // Adding patient_id as query param to satisfy strict backend requirements
      const response = await apiClient.get(`/physical-exam/patient/${patientId}?patient_id=${patientId}`);
      const records = response.data || [];
      if (records.length > 0) {
        return records[0];
      }
      return null;
    } catch (err) {
      console.error('Error fetching physical exam:', err);
      return null;
    }
  }, []);

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
    fetchExamHistoryForReading,
    dataAlert,
    fetchDataAlert
  };
};
