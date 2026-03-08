import { useState, useCallback } from 'react';
import apiClient from '@api/apiClient';

export const useLabValues = () => {
  const [alerts, setAlerts] = useState<any>({});
  const [dataAlert, setDataAlert] = useState<string | null>(null);

  const fetchDataAlert = useCallback(async (patientId: number) => {
    try {
      const response = await apiClient.get(`/lab-values/data-alert/patient/${patientId}`);
      if (response.data) {
        const alertMsg = typeof response.data === 'string' 
          ? response.data 
          : (response.data.lab_values || response.data.alert || response.data.message || null);
        setDataAlert(alertMsg);
      } else {
        setDataAlert(null);
      }
    } catch (e) {
      console.error('Failed to fetch lab values data alert:', e);
      setDataAlert(null);
    }
  }, []);

  const sanitize = useCallback((data: any) => {
    const sanitized = { ...data };
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].trim() === '') {
        sanitized[key] = 'N/A';
      }
    });
    return sanitized;
  }, []);

  // STEP 1: Create or Update record
  const saveLabAssessment = async (payload: any, existingId?: number | null) => {
    const sanitized = sanitize(payload);
    
    if (existingId) {
      // UPDATE
      const response = await apiClient.put(`/lab-values/${existingId}/assessment`, sanitized);
      return response.data;
    } else {
      // CREATE
      const response = await apiClient.post('/lab-values', sanitized);
      return response.data;
    }
  };

  const fetchLatestLabValues = async (patientId: number) => {
    try {
      const response = await apiClient.get(`/lab-values/patient/${patientId}?patient_id=${patientId}`);
      const data = response.data;
      
      if (Array.isArray(data)) {
        return data.length > 0 ? data[0] : null;
      } else if (data && typeof data === 'object') {
        // If it's a single object (or has a data key from Laravel)
        return data.data || data;
      }
      return null;
    } catch (err) {
      console.error('Error fetching lab values:', err);
      return null;
    }
  };

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

  return { 
    alerts, 
    setAlerts, 
    checkLabAlerts, 
    saveLabAssessment, 
    updateDPIE, 
    fetchLatestLabValues,
    dataAlert,
    fetchDataAlert
  };
};
