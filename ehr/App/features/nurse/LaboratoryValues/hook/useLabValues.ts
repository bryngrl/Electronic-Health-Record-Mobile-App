import { useState, useCallback } from 'react';
import apiClient from '@api/apiClient';

export const useLabValues = () => {
  const [alerts, setAlerts] = useState<any>({});

  const sanitize = useCallback((data: any) => {
    const sanitized = { ...data };
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].trim() === '') {
        sanitized[key] = 'N/A';
      }
    });
    return sanitized;
  }, []);

  // STEP 1: Create initial record
  const saveLabAssessment = useCallback(async (payload: any) => {
    const sanitized = sanitize(payload);
    const response = await apiClient.post('/lab-values/', sanitized);
    return response.data;
  }, [sanitize]);

  // STEP 2: Update specific tests & fetch real-time CDSS comparison
  const checkLabAlerts = useCallback(async (recordId: number, payload: any) => {
    if (!recordId) return null;
    try {
      const sanitized = sanitize(payload);
      const response = await apiClient.put(`/lab-values/${recordId}/assessment`, sanitized);
      if (response.data) {
        setAlerts(response.data);
      }
      return response.data;
    } catch (err) {
      return null;
    }
  }, [sanitize]);

  const updateDPIE = useCallback(async (examId: number, stepKey: string, text: string) => {
    const sanitizedText = text.trim() === '' ? 'N/A' : text;
    const response = await apiClient.put(`/lab-values/${examId}/${stepKey}`, {
      [stepKey]: sanitizedText
    });
    return response.data;
  }, []);

  return { alerts, checkLabAlerts, saveLabAssessment, updateDPIE };
};
