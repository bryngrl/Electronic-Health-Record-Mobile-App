import { useCallback, useState } from 'react';
import apiClient from '@api/apiClient';
import { getAlertFromCache, saveAlertToCache } from '@App/utils/cdssCache';

export const usePhysicalExam = () => {
  const [dataAlert, setDataAlert] = useState<any>(null);

  const fetchDataAlert = useCallback(async (patientId: number) => {
    try {
      const response = await apiClient.get(`/physical-exam/data-alert/patient/${patientId}`);
      const body = response.data?.data || response.data;

      // API may return { alerts: "..." }, { physical_exam_alerts: "..." }, or a plain string
      if (typeof body === 'string') {
        setDataAlert(body.trim() || null);
      } else if (body?.alerts && typeof body.alerts === 'string') {
        setDataAlert(body.alerts.trim() || null);
      } else if (body?.physical_exam_alerts && typeof body.physical_exam_alerts === 'string') {
        setDataAlert(body.physical_exam_alerts.trim() || null);
      } else {
        setDataAlert(null);
      }
    } catch (e) {
      console.error('Failed to fetch physical exam data alert:', e);
      setDataAlert(null);
    }
  }, []);

  // Analyze a single field in real-time by saving to the backend (which runs CDSS automatically).
  // Uses PUT /{id}/assessment if examId exists, else POST /physical-exam.
  // Returns all alerts and severity for the specific field, plus the examId.
  const analyzeField = useCallback(async (
    patientId: number,
    examId: number | null,
    fullData: any,
    fieldName: string,
    alertKey: string,
  ): Promise<{ 
    alerts: Record<string, string | null>; 
    severity: string | null; 
    examId: number | null 
  } | null> => {
    try {
      // Check cache first
      const cached = await getAlertFromCache('physical-exam', patientId, fullData);
      if (cached) {
        console.log('[PhysicalExam] Returning cached alerts');
        return { alerts: cached.alerts, severity: cached.severity, examId: examId };
      }

      const body = { ...fullData, patient_id: patientId };
      const sanitized = sanitize(body);
      
      let response;
      if (examId) {
        response = await apiClient.put(`/physical-exam/${examId}/assessment`, sanitized);
      } else {
        response = await apiClient.post('/physical-exam', sanitized);
      }

      console.log(`[CDSS][${fieldName}] raw response:`, JSON.stringify(response.data, null, 2));

      const data = response.data;
      const record = data?.data || data || {};
      const alertsObj = data?.alerts || record?.alerts || {};

      // Capture the record id so subsequent calls update, not create
      const returnedExamId: number | null = record?.id || null;

      // Map all alerts from the response
      const allAlerts: Record<string, string | null> = {};
      Object.keys(alertsObj).forEach(key => {
        const val = alertsObj[key];
        allAlerts[key] = (val && val !== 'No Findings') ? val.toString().trim() : null;
      });

      // Also check record directly for alert keys if not in alertsObj
      if (alertKey && !allAlerts[alertKey] && record[alertKey] && record[alertKey] !== 'No Findings') {
        allAlerts[alertKey] = record[alertKey].toString().trim();
      }

      // Infer severity for the CURRENT field for UI highlighting
      const currentAlertText = allAlerts[alertKey] || '';
      let severity = 'INFO';
      if (currentAlertText) {
        const upper = currentAlertText.toUpperCase();
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
      await saveAlertToCache('physical-exam', patientId, fullData, allAlerts, severity);

      console.log(`[CDSS][${fieldName}] severity="${severity}"`);
      return { alerts: allAlerts, severity, examId: returnedExamId };
    } catch (e) {
      console.error(`[CDSS][${fieldName}] error:`, e);
      return null;
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

  const saveAssessment = useCallback(async (payload: any, existingId?: number | null) => {
    const body = {
      ...payload,
      patient_id: parseInt(payload.patient_id, 10)
    };
    const sanitized = sanitize(body);
    const targetId = existingId || payload.id;
    let response;
    if (targetId) {
      // Update existing record by ID — same endpoint used for real-time CDSS
      response = await apiClient.put(`/physical-exam/${targetId}/assessment`, sanitized);
    } else {
      // No existing record — create new
      response = await apiClient.post('/physical-exam', sanitized);
    }
    return response.data;
  }, []);

  const updateDPIE= useCallback(async (examId: number, stepKey: string, text: string) => {
    const sanitizedText = text.trim() === '' ? 'N/A' : text;
    const response = await apiClient.put(`/physical-exam/${examId}/${stepKey}`, {
      [stepKey]: sanitizedText
    });
    return response.data;
  }, []);

  const fetchLatestPhysicalExam = useCallback(async (patientId: number) => {
    try {
      const response = await apiClient.get(`/physical-exam/patient/${patientId}?patient_id=${patientId}`);
      const records = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.data)
          ? response.data.data
          : [];
      return records.length > 0 ? records[0] : null;
    } catch (err) {
      console.error('Error fetching physical exam:', err);
      return null;
    }
  }, []);

  return { 
    saveAssessment, 
    analyzeField,
    updateDPIE, 
    fetchLatestPhysicalExam,
    dataAlert,
    fetchDataAlert
  };
};