import { useState } from 'react';
import apiClient from '@api/apiClient';

export const useLabValues = () => {
  const [alerts, setAlerts] = useState<any>({});

  const sanitize = (data: any) => {
    const sanitized = { ...data };
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].trim() === '') {
        sanitized[key] = 'N/A';
      }
    });
    return sanitized;
  };

  // STEP 1: Create initial record
  const saveLabAssessment = async (payload: any) => {
    const sanitized = sanitize(payload);
    const response = await apiClient.post('/lab-values/', sanitized);
    return response.data; // Returns record with ID
  };

  // STEP 2: Update specific tests & fetch real-time CDSS comparison
  const checkLabAlerts = async (recordId: number, payload: any) => {
    try {
      // Matches @router.put("/{record_id}/assessment")
      const sanitized = sanitize(payload);
      const response = await apiClient.put(`/lab-values/${recordId}/assessment`, sanitized);
      if (response.data) {
        setAlerts(response.data); // Stores wbc_alert, rbc_alert, etc.
      }
      return response.data;
    } catch (err) {
      return null;
    }
  };
const updateDPIE = async (examId: number, stepKey: string, text: string) => {
    // Matches @router.put("/{exam_id}/diagnosis"), /planning, etc.
    const sanitizedText = text.trim() === '' ? 'N/A' : text;
    const response = await apiClient.put(`/lab-values/${examId}/${stepKey}`, {
      [stepKey]: sanitizedText
    });
    return response.data;
  };
  

  return { alerts, checkLabAlerts, saveLabAssessment,updateDPIE };
};