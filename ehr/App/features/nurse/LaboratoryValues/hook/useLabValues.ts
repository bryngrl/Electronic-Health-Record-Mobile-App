import { useState, useCallback } from 'react';
import apiClient from '@api/apiClient';
import { getAlertFromCache, saveAlertToCache } from '@App/utils/cdssCache';

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
    // Keep data as-is, don't convert empty strings to 'N/A'
    return { ...data };
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
    const sanitizedText = text.trim() === '' ? '' : text;
    const response = await apiClient.put(`/lab-values/${examId}/${stepKey}`, {
      [stepKey]: sanitizedText,
    });
    return response.data;
  };

  const analyzeLabField = useCallback(async (
    patientId: number,
    currentLabId: number | null,
    fullData: any,
    prefix: string,
  ): Promise<{ 
    alerts: Record<string, string | null>; 
    severity: string | null; 
    labId: number | null 
  } | null> => {
    try {
      // Check cache first
      const cached = await getAlertFromCache('lab-values', patientId, fullData);
      if (cached) {
        console.log('[LabValues] Returning cached alerts');
        return { alerts: cached.alerts, severity: cached.severity, labId: currentLabId };
      }

      const body = sanitize({ ...fullData, patient_id: patientId });
      let response;
      if (currentLabId) {
        response = await apiClient.put(`/lab-values/${currentLabId}/assessment`, body);
      } else {
        response = await apiClient.post('/lab-values', body);
      }
      const data = response.data?.data || response.data;
      const alertsObj = response.data?.alerts || data?.alerts || {};
      const returnedLabId: number | null = data?.id || null;

      const allAlerts: Record<string, string | null> = {};
      Object.keys(alertsObj).forEach(key => {
        const val = alertsObj[key];
        allAlerts[key] = (val && !val.toLowerCase().includes('no findings')) ? val.toString().trim() : null;
      });

      // Map from record directly if needed
      const alertKey = `${prefix}_alert`;
      if (!allAlerts[alertKey] && data[alertKey] && !data[alertKey].toLowerCase().includes('no findings')) {
        allAlerts[alertKey] = data[alertKey].toString().trim();
      }

      const alertText = allAlerts[alertKey] || '';
      let severity = 'INFO';
      if (alertText) {
        severity = inferSeverity(alertText);
      } else {
        severity = null as any;
      }

      // Save to cache
      await saveAlertToCache('lab-values', patientId, fullData, allAlerts, severity);

      return { alerts: allAlerts, severity, labId: returnedLabId };
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