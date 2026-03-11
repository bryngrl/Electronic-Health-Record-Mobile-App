import { useState, useCallback } from 'react';
import apiClient from '@api/apiClient';

const inferSeverity = (text: string): string => {
  const upper = text.toUpperCase();
  if (upper.includes('URGENT') || upper.includes('CRITICAL') || upper.includes('IMMEDIATELY') || upper.includes('EMERGENCY') || upper.includes('PERITONITIS') || upper.includes('SEPSIS')) return 'CRITICAL';
  if (upper.includes('EVALUATE') || upper.includes('MONITOR') || upper.includes('ASSESS') || upper.includes('REFER') || upper.includes('DISEASE') || upper.includes('INFECTION') || upper.includes('ABNORMAL') || upper.includes('SUSPECTED') || upper.includes('LIVER') || upper.includes('HEMOLYSIS') || upper.includes('JAUNDICE') || upper.includes('PALLOR') || upper.includes('TREAT') || upper.includes('ELEVATED')) return 'WARNING';
  return 'INFO';
};

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

  const sanitize = (data: any) => {
    const sanitized = { ...data };
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].trim() === '') {
        sanitized[key] = 'N/A';
      }
    });
    return sanitized;
  };

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
    const sanitizedText = text.trim() === '' ? 'N/A' : text;
    const response = await apiClient.put(`/lab-values/${examId}/${stepKey}`, {
      [stepKey]: sanitizedText,
    });
    return response.data;
  };

  const analyzeLabField = useCallback(async (
    patientId: number,
    currentLabId: number | null,
    prefix: string,
    resultVal: string,
    rangeVal: string,
  ): Promise<{ alert: string | null; severity: string | null; labId: number | null } | null> => {
    if (!resultVal || resultVal.trim().length < 1 || resultVal === 'N/A') return null;
    try {
      const body = sanitize({
        patient_id: patientId,
        [`${prefix}_result`]: resultVal,
        [`${prefix}_normal_range`]: rangeVal || 'N/A',
      });
      let response;
      if (currentLabId) {
        response = await apiClient.put(`/lab-values/${currentLabId}/assessment`, body);
      } else {
        response = await apiClient.post('/lab-values', body);
      }
      const data = response.data?.data || response.data;
      const returnedLabId: number | null = data?.id || null;
      const alertText: string = (data?.[`${prefix}_alert`] || '').toString().trim();
      const invalid = ['No findings.', 'No Findings', 'Normal'];
      if (!alertText || invalid.includes(alertText) || alertText.includes('No result')) {
        return { alert: null, severity: null, labId: returnedLabId };
      }
      return { alert: alertText, severity: inferSeverity(alertText), labId: returnedLabId };
    } catch (e) {
      return null;
    }
  }, []);

  return {
    alerts,
    setAlerts,
    checkLabAlerts,
    saveLabAssessment,
    updateDPIE,
    fetchLatestLabValues,
    dataAlert,
    fetchDataAlert,
    analyzeLabField,
  };
};