import { useState, useCallback } from 'react';
import apiClient from '@api/apiClient';

export const useADL = () => {
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

  const saveADLAssessment = useCallback(async (payload: any) => {
    const sanitized = sanitize(payload);
    const response = await apiClient.post('/adl/', sanitized);
    return response.data;
  }, []);

  const checkADLAlerts = useCallback(async (payload: any) => {
    try {
      const sanitized = sanitize(payload);
      const response = await apiClient.post('/adl/check-alerts', sanitized);
      if (response.data) {
        setAlerts(response.data);
      }
      return response.data;
    } catch (err) {
      return null;
    }
  }, []);

  const updateADLStep = useCallback(async (recordId: number, stepKey: string, text: string) => {
    const sanitizedText = text.trim() === '' ? 'N/A' : text;
    const response = await apiClient.put(`/adl/${recordId}/${stepKey}`, {
      [stepKey]: sanitizedText
    });
    return response.data;
  }, []);

  const fetchLatestADL = useCallback(async (patientId: number) => {
    try {
      const response = await apiClient.get(`/adl/patient/${patientId}`);
      const records = response.data || [];
      // Always return the latest record regardless of the date
      if (records.length > 0) {
        return records[0];
      }
      return null;
    } catch (err) {
      console.error('Error fetching ADL:', err);
      return null;
    }
  }, []);

  return { alerts, setAlerts, saveADLAssessment, checkADLAlerts, updateADLStep, fetchLatestADL };
};
