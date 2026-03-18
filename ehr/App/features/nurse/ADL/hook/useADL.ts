import { useState, useCallback } from 'react';
import apiClient from '@api/apiClient';
import { getAlertFromCache, saveAlertToCache } from '@App/utils/cdssCache';

export const useADL = () => {
  const [dataAlert, setDataAlert] = useState<string | null>(null);

  const fetchDataAlert = useCallback(async (patientId: number) => {
    try {
      const response = await apiClient.get(`/adl/data-alert/patient/${patientId}`);
      if (response.data) {
        const alertMsg = typeof response.data === 'string'
          ? response.data
          : (response.data.alert || response.data.adl || response.data.message || null);
        setDataAlert(alertMsg);
      } else {
        setDataAlert(null);
      }
    } catch (e) {
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

  const analyzeField = useCallback(async (
    patientId: number,
    currentAdlId: number | null,
    fullData: any,
    fieldName: string,
    alertKey: string,
  ): Promise<{ 
    alerts: Record<string, string | null>; 
    severity: string | null; 
    adlId: number | null 
  } | null> => {
    try {
      // Check cache first
      const cached = await getAlertFromCache('adl', patientId, fullData);
      if (cached) {
        console.log('[ADL] Returning cached alerts');
        return { alerts: cached.alerts, severity: cached.severity, adlId: currentAdlId };
      }

      const body = { ...fullData, patient_id: patientId };
      const sanitized = sanitize(body);

      let response;
      if (currentAdlId) {
        response = await apiClient.put(`/adl/${currentAdlId}/assessment`, sanitized);
      } else {
        response = await apiClient.post('/adl', sanitized);
      }

      const data = response.data?.data || response.data;
      const alertsObj = response.data?.alerts || data?.alerts || {};
      const returnedAdlId: number | null = data?.id || null;

      const allAlerts: Record<string, string | null> = {};
      Object.keys(alertsObj).forEach(key => {
        const val = alertsObj[key];
        allAlerts[key] = (val && val !== 'No findings.' && val !== 'No Findings') ? val.toString().trim() : null;
      });

      // Also check data record directly for alert keys if not in alertsObj
      if (alertKey && !allAlerts[alertKey] && data[alertKey] && data[alertKey] !== 'No findings.' && data[alertKey] !== 'No Findings') {
        allAlerts[alertKey] = data[alertKey].toString().trim();
      }

      const alertText = allAlerts[alertKey] || '';
      let severity = 'INFO';
      if (alertText) {
        const upper = alertText.toUpperCase();
        if (
          upper.includes('URGENT') || upper.includes('CRITICAL') ||
          upper.includes('IMMEDIATELY') || upper.includes('EMERGENCY') ||
          upper.includes('PERITONITIS') || upper.includes('SEPSIS')
        ) {
          severity = 'CRITICAL';
        } else if (
          upper.includes('EVALUATE') || upper.includes('MONITOR') ||
          upper.includes('ASSESS') || upper.includes('REFER') ||
          upper.includes('DISEASE') || upper.includes('INFECTION') ||
          upper.includes('ABNORMAL') || upper.includes('SUSPECTED') ||
          upper.includes('LIVER') || upper.includes('HEMOLYSIS') ||
          upper.includes('JAUNDICE') || upper.includes('PALLOR') ||
          upper.includes('TREAT') || upper.includes('ELEVATED')
        ) {
          severity = 'WARNING';
        }
      } else {
        severity = null as any;
      }

      // Save to cache
      await saveAlertToCache('adl', patientId, fullData, allAlerts, severity);

      return { alerts: allAlerts, severity, adlId: returnedAdlId };
    } catch (e) {
      return null;
    }
  }, []);

  const saveADLAssessment = useCallback(async (payload: any, existingId?: number | null) => {
    const body = { ...payload, patient_id: parseInt(payload.patient_id, 10) };
    const sanitized = sanitize(body);
    if (existingId) {
      const response = await apiClient.put(`/adl/${existingId}/assessment`, sanitized);
      return response.data;
    } else {
      const response = await apiClient.post('/adl', sanitized);
      return response.data;
    }
  }, []);

  const updateADLStep = useCallback(async (recordId: number, stepKey: string, text: string) => {
    const sanitizedText = text.trim() === '' ? 'N/A' : text;
    const response = await apiClient.put(`/adl/${recordId}/${stepKey}`, {
      [stepKey]: sanitizedText,
    });
    return response.data;
  }, []);

  const fetchLatestADL = useCallback(async (patientId: number) => {
    try {
      const response = await apiClient.get(`/adl/patient/${patientId}?patient_id=${patientId}`);
      const data = response.data;
      if (Array.isArray(data)) return data.length > 0 ? data[0] : null;
      if (data && typeof data === 'object') return data;
      return null;
    } catch (err) {
      return null;
    }
  }, []);

  return {
    saveADLAssessment,
    analyzeField,
    updateADLStep,
    fetchLatestADL,
    dataAlert,
    fetchDataAlert,
  };
};