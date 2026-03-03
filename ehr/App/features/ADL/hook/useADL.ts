import { useState, useCallback } from 'react';
import apiClient from '../../../api/apiClient';

export const useADL = () => {
  const [alerts, setAlerts] = useState<any>({});

  const saveADLAssessment = useCallback(async (payload: any) => {
    const response = await apiClient.post('/adl/', payload);
    return response.data;
  }, []);

  const checkADLAlerts = useCallback(async (payload: any) => {
    try {
      const response = await apiClient.post('/adl/check-alerts', payload);
      if (response.data) {
        setAlerts(response.data);
      }
      return response.data;
    } catch (err) {
      return null;
    }
  }, []);

  const updateADLStep = useCallback(async (recordId: number, stepKey: string, text: string) => {
    const response = await apiClient.put(`/adl/${recordId}/${stepKey}`, {
      [stepKey]: text
    });
    return response.data;
  }, []);

  const fetchLatestADL = useCallback(async (patientId: number) => {
    try {
      const response = await apiClient.get(`/adl/patient/${patientId}`);
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
      console.error('Error fetching ADL:', err);
      return null;
    }
  }, []);

  return { alerts, setAlerts, saveADLAssessment, checkADLAlerts, updateADLStep, fetchLatestADL };
};