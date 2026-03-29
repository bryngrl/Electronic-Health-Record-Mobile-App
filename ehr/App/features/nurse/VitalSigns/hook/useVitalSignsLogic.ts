import { useState, useMemo, useCallback, useRef } from 'react';
import apiClient from '@api/apiClient';
import { getAlertFromCache, saveAlertToCache } from '@App/utils/cdssCache';

const TIME_SLOTS = ['6:00 AM', '8:00 AM', '12:00 PM', '2:00 PM', '6:00 PM', '8:00 PM', '12:00 AM'];

export interface Vitals {
  temperature: string;
  hr: string;
  rr: string;
  bp: string;
  spo2: string;
}

const initialVitals: Vitals = {
  temperature: '',
  hr: '',
  rr: '',
  bp: '',
  spo2: '',
};

const inferSeverity = (text: string): string => {
  const upper = text.toUpperCase();
  if (upper.includes('URGENT') || upper.includes('CRITICAL') || upper.includes('IMMEDIATELY') || upper.includes('EMERGENCY') || upper.includes('PERITONITIS') || upper.includes('SEPSIS')) return 'CRITICAL';
  if (upper.includes('EVALUATE') || upper.includes('MONITOR') || upper.includes('ASSESS') || upper.includes('REFER') || upper.includes('DISEASE') || upper.includes('INFECTION') || upper.includes('ABNORMAL') || upper.includes('SUSPECTED') || upper.includes('LIVER') || upper.includes('HEMOLYSIS') || upper.includes('JAUNDICE') || upper.includes('PALLOR') || upper.includes('TREAT') || upper.includes('ELEVATED') || upper.includes('TACHYCARDIA') || upper.includes('BRADYCARDIA') || upper.includes('HYPERTENSION') || upper.includes('HYPOTENSION') || upper.includes('FEVER') || upper.includes('HYPOTHERMIA')) return 'WARNING';
  return 'INFO';
};

export const convertTo24h = (timeStr: string) => {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  if (hours === '12') {
    hours = modifier === 'AM' ? '00' : '12';
  } else if (modifier === 'PM') {
    hours = (parseInt(hours, 10) + 12).toString();
  }
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};

const formatTo12h = (time24: string) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const h = parseInt(hours, 10);
  const m = parseInt(minutes, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHours = h % 12 || 12;
  return `${displayHours}:${m.toString().padStart(2, '0')} ${ampm}`;
};

const filterAlertByTime = (alertText: string, timeLabel: string) => {
  if (!alertText) return null;
  const otherSlots = TIME_SLOTS.filter(s => s !== timeLabel);
  const lines = alertText.split(/[\n;]| \| /)
    .map(l => l.trim())
    .filter(line => {
      if (!line) return false;
      const lower = line.toLowerCase();
      if (lower.includes('out of range') || lower.includes('no findings')) return false;
      if (otherSlots.some(other => line.startsWith(other))) return false;
      return true;
    })
    .map(line => line.startsWith(timeLabel) ? line.replace(`${timeLabel}:`, '').trim() : line);
  
  // Deduplicate identical lines
  const uniqueLines = Array.from(new Set(lines));
  
  return uniqueLines.join('\n').trim() || null;
};

export const useVitalSignsLogic = () => {
  const [patientName, setPatientName] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [admissionDate, setAdmissionDate] = useState<string | null>(null);
  const [dayNo, setDayNo] = useState<number>(1);

  const calculateDayNo = useCallback((admDate?: string | null) => {
    const dateToUse = admDate || admissionDate;
    if (!dateToUse) return 1;
    try {
      const admission = new Date(dateToUse);
      const today = new Date();
      admission.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      const diffTime = today.getTime() - admission.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays > 0 ? diffDays : 1;
    } catch (e) {
      console.error('Error calculating day_no:', e);
      return 1;
    }
  }, [admissionDate]);

  const [vitalsHistory, setVitalsHistory] = useState<Record<string, Vitals>>({});
  const [alertsHistory, setAlertsHistory] = useState<Record<string, { alert: string | null, severity: string | null }>>({});
  const [lastSavedVitals, setLastSavedVitals] = useState<Record<string, Vitals>>({});
  const [currentVitals, setCurrentVitals] = useState<Vitals>(initialVitals);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  
  const [backendAlert, setBackendAlert] = useState<{ title: string, message: string, type: 'success' | 'error' } | null>(null);
  const [backendSeverity, setBackendSeverity] = useState<string | null>(null);
  const [realtimeAlert, setRealtimeAlert] = useState<string | null>(null);
  const [realtimeSeverity, setRealtimeSeverity] = useState<string | null>(null);
  const [dataAlert, setDataAlert] = useState<string | null>(null);
  const [existingRecords, setExistingRecords] = useState<any[]>([]);
  const [isExistingRecord, setIsExistingRecord] = useState(false);
  const recordIdRef = useRef<number | null>(null);

  const currentTime = useMemo(() => TIME_SLOTS[currentTimeIndex], [currentTimeIndex]);

  const fetchDataAlert = async (patientId: string, time24?: string) => {
    setDataAlert(null);
    const targetTime24 = time24 || convertTo24h(currentTime);
    console.log(`[fetchDataAlert] Fetching alerts for Patient: ${patientId}, Time: ${targetTime24}`);
    
    try {
      const url = `/vital-signs/data-alert/patient/${patientId}?time=${targetTime24}`;
      const response = await apiClient.get(url);
      
      const timeLabel = time24 ? formatTo12h(time24) : currentTime;

      if (response.data) {
        console.log(`[fetchDataAlert] API Response for ${targetTime24}:`, response.data);
        const alertMsg = typeof response.data === 'string' 
          ? response.data 
          : (response.data.vital_signs || response.data.alert || response.data.message || null);
        
        if (alertMsg) {
          const filtered = filterAlertByTime(alertMsg, timeLabel);
          console.log(`[fetchDataAlert] Final Filtered Alert for ${timeLabel}:`, filtered);
          setDataAlert(filtered);
        } else {
          console.log(`[fetchDataAlert] No alert message found in response for ${targetTime24}`);
        }
      } else {
        console.log(`[fetchDataAlert] Empty response for ${targetTime24}`);
      }
    } catch (e) {
      console.error('[fetchDataAlert] Failed to fetch vital signs data alert:', e);
    }
  };

  const isDataEntered = useMemo(() => {
    return Object.values(currentVitals).some(
      v => v && v.trim() !== '' && v !== 'N/A',
    );
  }, [currentVitals]);

  const isDataComplete = useMemo(() => {
    return Object.values(currentVitals).every(
      v => v && v.trim() !== '',
    );
  }, [currentVitals]);

  const loadPatientData = async (patientId: string, admDate?: string | null) => {
    try {
      const today = new Date().toLocaleDateString('en-CA');
      const response = await apiClient.get(`/vital-signs/patient/${patientId}?patient_id=${patientId}`);
      const records = response.data || [];
      setExistingRecords(records);
      
      const history: Record<string, Vitals> = {};
      const alerts: Record<string, { alert: string | null, severity: string | null, id: number | null }> = {};
      
      let latestSlotIndex = -1;

      records.forEach((rec: any) => {
        const recDate = (rec.date || rec.created_at).split('T')[0];
        if (recDate === today) {
          const slotLabel = formatTo12h(rec.time);
          const slotIdx = TIME_SLOTS.indexOf(slotLabel);
          if (slotIdx !== -1) {
            history[slotLabel] = {
              temperature: rec.temperature || '',
              hr: rec.hr || '',
              rr: rec.rr || '',
              bp: rec.bp || '',
              spo2: rec.spo2 || '',
            };

            const alertVal = rec.assessment_alert || rec.alert || '';
            const filtered = filterAlertByTime(alertVal, slotLabel);
            
            alerts[slotLabel] = {
              alert: filtered,
              severity: filtered ? inferSeverity(filtered) : null,
              id: rec.id || null
            };

            if (slotIdx > latestSlotIndex) latestSlotIndex = slotIdx;
          }
        }
      });
      
      setVitalsHistory(history);
      setAlertsHistory(alerts as any);
      setLastSavedVitals(JSON.parse(JSON.stringify(history)));
      
      if (Object.keys(history).length > 0) {
        setIsExistingRecord(true);
      }

      let activeTime = currentTime;
      if (history[currentTime]) {
        setCurrentVitals(history[currentTime]);
        setRealtimeAlert(alerts[currentTime]?.alert || null);
        setRealtimeSeverity(alerts[currentTime]?.severity || null);
        recordIdRef.current = (alerts[currentTime] as any)?.id || null;
      } 
      else if (latestSlotIndex !== -1) {
        activeTime = TIME_SLOTS[latestSlotIndex];
        setCurrentTimeIndex(latestSlotIndex);
        setCurrentVitals(history[activeTime]);
        setRealtimeAlert(alerts[activeTime]?.alert || null);
        setRealtimeSeverity(alerts[activeTime]?.severity || null);
        recordIdRef.current = (alerts[activeTime] as any)?.id || null;
      }
      else {
        setCurrentVitals(initialVitals);
        setRealtimeAlert(null);
        setRealtimeSeverity(null);
        recordIdRef.current = null;
      }

      const activeTime24 = convertTo24h(activeTime);
      fetchDataAlert(patientId, activeTime24);

      if (history[activeTime]) {
        const currentDayNo = calculateDayNo(admDate);
        const payload = {
          patient_id: parseInt(patientId, 10),
          date: today,
          time: activeTime24,
          day_no: currentDayNo,
          ...history[activeTime]
        };
        analyzeField(payload, true).then(res => {
          if (res) {
            const joined = Object.values(res.alerts).filter(v => v).join('\n');
            const filtered = filterAlertByTime(joined, activeTime);
            setRealtimeAlert(filtered);
            setRealtimeSeverity(res.severity);
            setAlertsHistory(prev => ({
              ...prev,
              [activeTime]: { alert: filtered, severity: res.severity }
            }));
          }
        });
      }
      
    } catch (e) {
      console.error('Failed to load patient data:', e);
      setExistingRecords([]);
      setVitalsHistory({});
      setAlertsHistory({});
      setCurrentVitals(initialVitals);
      setRealtimeAlert(null);
      setRealtimeSeverity(null);
      recordIdRef.current = null;
    }
  };

  const analyzeField = useCallback(async (payload: any, force = false): Promise<{ 
    alerts: Record<string, string | null>; 
    severity: string | null; 
    recordId: number | null 
  } | null> => {
    try {
      const patientId = payload.patient_id || selectedPatientId;
      if (!patientId) return null;

      const { patient_id, ...inputData } = payload;
      
      if (!force) {
        const cached = await getAlertFromCache('vital-signs', patientId, inputData);
        if (cached) {
          return { alerts: cached.alerts, severity: cached.severity, recordId: recordIdRef.current };
        }
      }

      const today = new Date().toLocaleDateString('en-CA');
      const payloadTime = (payload.time || '').substring(0, 5);
      const existingRecord = existingRecords.find(r => {
        const recDate = (r.date || r.created_at).split('T')[0];
        return recDate === today && (r.time || '').substring(0, 5) === payloadTime.substring(0, 5);
      });
      let targetId = existingRecord?.id || recordIdRef.current;

      if (!targetId) {
        const postResp = await apiClient.post('/vital-signs', payload);
        targetId = (postResp.data?.data || postResp.data)?.id;
        if (targetId) recordIdRef.current = targetId;
      }

      if (!targetId) return null;

      const response = await apiClient.put(`/vital-signs/${targetId}/assessment`, payload);
      const rawData = response.data?.data || response.data || {};
      const rawAlerts = response.data?.alerts || rawData?.alerts || {};
      
      const processedAlerts: Record<string, string | null> = {};
      const timeLabel = formatTo12h(payloadTime);
      
      const filterLine = (val: string) => {
        return filterAlertByTime(val, timeLabel);
      };

      if (rawAlerts && typeof rawAlerts === 'object' && !Array.isArray(rawAlerts)) {
        Object.keys(rawAlerts).forEach(k => {
          processedAlerts[k] = filterLine(String(rawAlerts[k] || ''));
        });
      } else if (typeof rawAlerts === 'string' && rawAlerts.trim()) {
        processedAlerts.assessment_alert = filterLine(rawAlerts);
      }

      ['assessment_alert', 'alert', 'message'].forEach(k => {
        if (!processedAlerts[k]) {
          processedAlerts[k] = filterLine(String(rawData[k] || ''));
        }
      });

      let severity = 'INFO';
      const firstValid = Object.values(processedAlerts).find(v => v !== null);
      if (firstValid) {
        severity = inferSeverity(firstValid);
      } else {
        severity = null as any;
      }

      await saveAlertToCache('vital-signs', patientId, inputData, processedAlerts, severity);

      return { 
        alerts: processedAlerts, 
        severity, 
        recordId: targetId 
      };
    } catch (err) {
      console.error('[VS analyzeField] error:', err);
      return null;
    }
  }, [existingRecords, selectedPatientId]);

  const saveAssessment = async (pDayNo?: number, slotTime?: string, slotVitals?: Vitals) => {
    if (!selectedPatientId) return null;

    const sanitize = (data: any) => {
      const sanitized = { ...data };
      Object.keys(sanitized).forEach(key => {
        if (typeof sanitized[key] === 'string' && sanitized[key].trim() === '') {
          sanitized[key] = 'N/A';
        }
      });
      return sanitized;
    };

    const targetTime = slotTime || currentTime;
    const targetVitals = slotVitals || currentVitals;
    const today = new Date().toLocaleDateString('en-CA');
    const time24 = convertTo24h(targetTime);
    const finalDayNo = pDayNo || dayNo || calculateDayNo();

    const payload = sanitize({
      patient_id: parseInt(selectedPatientId, 10),
      date: today,
      time: time24,
      day_no: finalDayNo,
      ...targetVitals
    });

    try {
      const existingRecord = existingRecords.find(r => {
        const recDate = (r.date || r.created_at).split('T')[0];
        return recDate === today && (r.time || '').substring(0, 5) === time24.substring(0, 5);
      });

      let response;
      if (existingRecord) {
        response = await apiClient.put(`/vital-signs/${existingRecord.id}/assessment`, payload);
      } else {
        response = await apiClient.post('/vital-signs', payload);
      }
      
      const data = response.data?.data || response.data;
      const rawAlertText = (data?.assessment_alert || data?.alert || '').toString().trim();
      const filteredAlertText = filterAlertByTime(rawAlertText, targetTime);

      const severity = filteredAlertText ? inferSeverity(filteredAlertText) : null;
      
      setAlertsHistory(prev => ({
        ...prev,
        [targetTime]: { alert: filteredAlertText || null, severity }
      }));

      if (targetTime === currentTime) {
        if (filteredAlertText) {
          const isCritical = filteredAlertText.includes('🔴') || filteredAlertText.toUpperCase().includes('CRITICAL');
          setBackendAlert({
            title: isCritical ? 'CRITICAL ALERT' : 'VITAL SIGNS ASSESSMENT',
            message: filteredAlertText.replace(/ \| /g, '\n'),
            type: isCritical ? 'error' : 'success'
          });
          setBackendSeverity(severity);
          setRealtimeAlert(filteredAlertText);
          setRealtimeSeverity(severity);
        } else {
          setRealtimeAlert(null);
          setRealtimeSeverity(null);
        }
      }
      
      return response.data;
    } catch (e: any) {
      console.error(`API Error saving vital signs for ${targetTime}:`, e?.response?.data || e.message);
      return null;
    }
  };

  const saveAllAssessments = async (pDayNo?: number) => {
    if (!selectedPatientId) return null;
    setVitalsHistory(prev => ({ ...prev, [currentTime]: currentVitals }));
    
    const finalDayNo = pDayNo || dayNo || calculateDayNo();
    const results = [];
    results.push(await saveAssessment(finalDayNo, currentTime, currentVitals));

    for (const slot of TIME_SLOTS) {
      if (slot !== currentTime && vitalsHistory[slot]) {
        const hasData = Object.values(vitalsHistory[slot]).some(v => v && v.trim() !== '');
        if (hasData) {
          results.push(await saveAssessment(finalDayNo, slot, vitalsHistory[slot]));
        }
      }
    }
    await loadPatientData(selectedPatientId);
    return results.find(r => r !== null) || null;
  };

  const handleUpdateVital = (key: keyof Vitals, value: string) => {
    setCurrentVitals(prev => ({ ...prev, [key]: value }));
    if (backendAlert) setBackendAlert(null);
  };

  const handleNextTime = () => {
    const oldTime = currentTime;
    setVitalsHistory(prev => ({ ...prev, [oldTime]: currentVitals }));
    setAlertsHistory(prev => ({ ...prev, [oldTime]: { alert: realtimeAlert, severity: realtimeSeverity } }));
    
    if (currentTimeIndex < TIME_SLOTS.length - 1) {
      const nextIndex = currentTimeIndex + 1;
      const nextTime = TIME_SLOTS[nextIndex];
      setCurrentTimeIndex(nextIndex);
      setCurrentVitals(vitalsHistory[nextTime] || initialVitals);
      const alertsForNext = alertsHistory[nextTime];
      setBackendAlert(null);
      setRealtimeAlert(alertsForNext?.alert || null);
      setRealtimeSeverity(alertsForNext?.severity || null);
      if (selectedPatientId) {
        fetchDataAlert(selectedPatientId, convertTo24h(nextTime));
      }
    }
  };

  const handlePrevTime = () => {
    const oldTime = currentTime;
    setVitalsHistory(prev => ({ ...prev, [oldTime]: currentVitals }));
    setAlertsHistory(prev => ({ ...prev, [oldTime]: { alert: realtimeAlert, severity: realtimeSeverity } }));

    if (currentTimeIndex > 0) {
      const prevIndex = currentTimeIndex - 1;
      const prevTime = TIME_SLOTS[prevIndex];
      setCurrentTimeIndex(prevIndex);
      setCurrentVitals(vitalsHistory[prevTime] || initialVitals);
      const alertsForPrev = alertsHistory[prevTime];
      setBackendAlert(null);
      setRealtimeAlert(alertsForPrev?.alert || null);
      setRealtimeSeverity(alertsForPrev?.severity || null);
      if (selectedPatientId) {
        fetchDataAlert(selectedPatientId, convertTo24h(prevTime));
      }
    }
  };

  const chartData = useMemo(() => {
    const keys: (keyof Vitals)[] = ['temperature', 'hr', 'rr', 'bp', 'spo2'];
    const result: Record<string, any[]> = {};
    keys.forEach(key => {
      result[key] = TIME_SLOTS.map(slot => {
        let valueStr = (slot === currentTime) ? currentVitals[key] : (vitalsHistory[slot] ? vitalsHistory[slot][key] : '');
        return { time: slot, value: parseFloat(valueStr.split('/')[0]) || 0 };
      });
    });
    return result;
  }, [currentVitals, vitalsHistory, currentTime]);

  const setSelectedPatient = (id: string | null, name: string, admDate?: string) => {
    setSelectedPatientId(id);
    setPatientName(name);
    setAdmissionDate(admDate || null);
    
    if (id) {
      const calculated = calculateDayNo(admDate);
      setDayNo(calculated);
      loadPatientData(id, admDate);
    } else {
      setDayNo(1);
      setVitalsHistory({});
      setAlertsHistory({});
      setLastSavedVitals({});
      setCurrentVitals(initialVitals);
      setExistingRecords([]);
    }
    setIsExistingRecord(false);
    recordIdRef.current = null;
    setRealtimeAlert(null);
    setRealtimeSeverity(null);
    setBackendAlert(null);
    setBackendSeverity(null);
  };

  const selectTime = (index: number) => {
    const oldTime = currentTime;
    setVitalsHistory(prev => ({ ...prev, [oldTime]: currentVitals }));
    setAlertsHistory(prev => ({ ...prev, [oldTime]: { alert: realtimeAlert, severity: realtimeSeverity } }));
    setCurrentTimeIndex(index);
    const newTime = TIME_SLOTS[index];
    setCurrentVitals(vitalsHistory[newTime] || initialVitals);
    const alertsForSlot = alertsHistory[newTime];
    setRealtimeAlert(alertsForSlot?.alert || null);
    setRealtimeSeverity(alertsForSlot?.severity || null);
    if (selectedPatientId) {
      fetchDataAlert(selectedPatientId, convertTo24h(newTime));
    }
  };

  const reset = () => {
    setPatientName('');
    setSelectedPatientId(null);
    setVitalsHistory({});
    setAlertsHistory({});
    setLastSavedVitals({});
    setCurrentVitals(initialVitals);
    setCurrentTimeIndex(0);
    setBackendAlert(null);
    setExistingRecords([]);
  };

  const isModified = useMemo(() => {
    if (!selectedPatientId) return false;
    const currentSaved = lastSavedVitals[currentTime] || initialVitals;
    if (currentVitals.temperature !== currentSaved.temperature || currentVitals.hr !== currentSaved.hr || currentVitals.rr !== currentSaved.rr || currentVitals.bp !== currentSaved.bp || currentVitals.spo2 !== currentSaved.spo2) return true;
    for (const slot of TIME_SLOTS) {
      if (slot === currentTime) continue;
      if (vitalsHistory[slot]) {
        const saved = lastSavedVitals[slot] || initialVitals;
        if (vitalsHistory[slot].temperature !== saved.temperature || vitalsHistory[slot].hr !== saved.hr || vitalsHistory[slot].rr !== saved.rr || vitalsHistory[slot].bp !== saved.bp || vitalsHistory[slot].spo2 !== saved.spo2) return true;
      }
    }
    return false;
  }, [currentVitals, vitalsHistory, lastSavedVitals, currentTime, selectedPatientId]);

  const updateDPIE = useCallback(async (recordId: number, stepKey: string, text: string) => {
    try {
      const sanitizedText = text.trim() === '' ? 'N/A' : text;
      const response = await apiClient.put(`/vital-signs/${recordId}/${stepKey}`, { [stepKey]: sanitizedText });
      return response.data;
    } catch (err) {
      console.error(`Error updating Vital Signs ${stepKey}:`, err);
      return null;
    }
  }, []);

  return {
    patientName,
    selectedPatientId,
    setSelectedPatient,
    vitals: currentVitals,
    handleUpdateVital,
    isDataEntered,
    isDataComplete,
    currentTime,
    currentTimeIndex,
    handleNextTime,
    handlePrevTime,
    saveAssessment,
    saveAllAssessments,
    analyzeField,
    updateDPIE,
    isMenuVisible,
    setIsMenuVisible,
    selectTime,
    reset,
    TIME_SLOTS,
    chartData,
    currentAlert: backendAlert,
    backendSeverity,
    realtimeAlert,
    realtimeSeverity,
    setRealtimeAlert,
    setRealtimeSeverity,
    dataAlert,
    vitalKeys: Object.keys(initialVitals) as (keyof Vitals)[],
    existingRecords,
    isExistingRecord,
    setIsExistingRecord,
    isModified,
    dayNo,
  };
};
