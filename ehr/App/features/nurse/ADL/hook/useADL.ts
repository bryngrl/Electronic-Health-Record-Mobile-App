import { useState, useCallback } from 'react';
import apiClient from '@api/apiClient';

export const useADL = () => {
  const [alerts, setAlerts] = useState<any>({});
  const [dataAlert, setDataAlert] = useState<string | null>(null);

  const fetchDataAlert = useCallback(async (patientId: number) => {
    try {
      const response = await apiClient.get(`/adl/data-alert/patient/${patientId}`);
      if (response.data) {
        const alertMsg = typeof response.data === 'string' 
          ? response.data 
          : (response.data.adl || response.data.alert || response.data.message || null);
        setDataAlert(alertMsg);
      } else {
        setDataAlert(null);
      }
    } catch (e) {
      console.error('Failed to fetch ADL data alert:', e);
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

  const saveADLAssessment = useCallback(async (payload: any, existingId?: number | null) => {
    // Ensure patient_id is integer
    const body = {
      ...payload,
      patient_id: parseInt(payload.patient_id, 10)
    };
    const sanitized = sanitize(body);
    
    // If we have an existing ID, UPDATE
    if (existingId) {
      const response = await apiClient.put(`/adl/${existingId}/assessment`, sanitized);
      return response.data;
    } else {
      // CREATE
      const response = await apiClient.post('/adl', sanitized);
      return response.data;
    }
  }, []);

  const checkADLAlerts = useCallback(async (payload: any, existingId?: number | null) => {
    try {
      const body = {
        ...payload,
        patient_id: parseInt(payload.patient_id, 10)
      };
      const sanitized = sanitize(body);
      let response;
      if (existingId) {
        response = await apiClient.put(`/adl/${existingId}/assessment`, sanitized);
      } else {
        response = await apiClient.post('/adl/check-alerts', sanitized);
      }
      
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
      // Trying the standard pattern from the guide
      const response = await apiClient.get(`/adl/patient/${patientId}?patient_id=${patientId}`);
      const data = response.data;
      
      if (Array.isArray(data)) {
        return data.length > 0 ? data[0] : null;
      } else if (data && typeof data === 'object') {
        // If it's a single object, return it
        return data;
      }
      return null;
    } catch (err) {
      console.error('Error fetching ADL:', err);
      return null;
    }
  }, []);

  return { 
    alerts, 
    setAlerts, 
    saveADLAssessment, 
    checkADLAlerts, 
    updateADLStep, 
    fetchLatestADL,
    dataAlert,
    fetchDataAlert
  };
};
