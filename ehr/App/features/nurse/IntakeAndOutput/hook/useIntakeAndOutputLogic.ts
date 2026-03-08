import { useState, useCallback, useMemo } from 'react';
import apiClient from '@api/apiClient';

export interface IntakeOutputData {
  oral_intake: string;
  iv_fluids_volume: string;
  urine_output: string;
}

export const useIntakeAndOutputLogic = () => {
  const [patientName, setPatientName] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [intakeOutput, setIntakeOutput] = useState<IntakeOutputData>({
    oral_intake: '',
    iv_fluids_volume: '',
    urine_output: '',
  });
  const [assessmentAlert, setAssessmentAlert] = useState<string | null>(null);
  const [currentAlert, setBackendAlert] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataAlert, setDataAlert] = useState<string | null>(null);
  const [recordId, setRecordId] = useState<number | null>(null);
  const [existingRecords, setExistingRecords] = useState<any[]>([]);

  const ADPIE_STAGES = ['Assessment', 'Diagnosis', 'Planning', 'Intervention', 'Evaluation'];

  const fetchDataAlert = useCallback(async (patientId: number) => {
    try {
      const response = await apiClient.get(`/intake-output/data-alert/patient/${patientId}`);
      if (response.data) {
        const alertMsg = typeof response.data === 'string' 
          ? response.data 
          : (response.data.intake_and_output || response.data.alert || response.data.message || null);
        setDataAlert(alertMsg);
      } else {
        setDataAlert(null);
      }
    } catch (e) {
      console.error('Failed to fetch intake and output data alert:', e);
      setDataAlert(null);
    }
  }, []);

  const handleUpdateField = useCallback(
    (field: keyof IntakeOutputData, value: string) => {
      if (value === 'N/A') {
        setIntakeOutput(prev => ({ ...prev, [field]: 'N/A' }));
        return;
      }
      // Only allow numbers
      const cleanValue = value.replace(/[^0-9]/g, '');
      setIntakeOutput(prev => ({ ...prev, [field]: cleanValue }));
    },
    [],
  );

  const isDataEntered = useMemo(() => {
    return true; // Enable empty inputs as per requirement
  }, []);

  const fetchLatestIntakeOutput = useCallback(async (patientId: number) => {
    try {
      const response = await apiClient.get(`/intake-output/patient/${patientId}?patient_id=${patientId}`);
      const records = response.data || [];
      setExistingRecords(records);
      if (records.length > 0) {
        return records[0];
      }
      return null;
    } catch (err) {
      console.error('Error fetching Intake & Output:', err);
      return null;
    }
  }, []);

  const checkRealTimeAlerts = useCallback(async (payload: any, existingId?: number | null) => {
    try {
      const targetId = existingId || recordId;
      let response;
      if (targetId) {
        response = await apiClient.put(`/intake-output/${targetId}/assessment`, payload);
      } else {
        response = await apiClient.post('/intake-output/check-alerts', payload);
      }
      
      if (response.data && response.data.assessment_alert) {
        setAssessmentAlert(response.data.assessment_alert);
      }
      return response.data;
    } catch (err) {
      return null;
    }
  }, [recordId]);

  const saveAssessment = useCallback(async () => {
    if (!selectedPatientId) return null;
    
    setLoading(true);
    try {
      const sanitizeInt = (val: string) => {
        if (!val || val.trim() === '' || val === 'N/A') return null;
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? null : parsed;
      };

      const payload = {
        patient_id: parseInt(selectedPatientId, 10),
        oral_intake: sanitizeInt(intakeOutput.oral_intake),
        iv_fluids: sanitizeInt(intakeOutput.iv_fluids_volume),
        urine_output: sanitizeInt(intakeOutput.urine_output),
      };

      // POST /intake-output handles both create and update for today's record in the backend
      const response = await apiClient.post('/intake-output', payload);

      const data = response.data;
      if (data.id) setRecordId(data.id);
      if (data.assessment_alert) setAssessmentAlert(data.assessment_alert);
      
      // Refresh history
      fetchLatestIntakeOutput(parseInt(selectedPatientId, 10));
      
      return data;
    } catch (e) {
      console.error('API Error saving I&O:', e);
      return null;
    } finally {
      setLoading(false);
    }
  }, [selectedPatientId, intakeOutput, fetchLatestIntakeOutput]);

  const handleSelectPatient = useCallback(async (id: number | null, name: string) => {
    setSelectedPatientId(id ? id.toString() : null);
    setPatientName(name);
    
    if (id) {
      fetchDataAlert(id);
      const data = await fetchLatestIntakeOutput(id);
      if (data) {
        setRecordId(data.id);
        setIntakeOutput({
          oral_intake: (data.oral_intake ?? '').toString(),
          iv_fluids_volume: (data.iv_fluids ?? data.iv_fluids_volume ?? '').toString(),
          urine_output: (data.urine_output ?? '').toString(),
        });
        setAssessmentAlert(data.assessment_alert);
      } else {
        setRecordId(null);
        setIntakeOutput({ oral_intake: '', iv_fluids_volume: '', urine_output: '' });
        setAssessmentAlert(null);
      }
    } else {
      setRecordId(null);
      setIntakeOutput({ oral_intake: '', iv_fluids_volume: '', urine_output: '' });
      setAssessmentAlert(null);
    }
  }, [fetchLatestIntakeOutput, fetchDataAlert]);

  const triggerPatientAlert = useCallback(() => {
    setBackendAlert({
      title: 'Patient Required',
      message: 'Please select a patient first in the search bar.',
      type: 'error',
    });
  }, []);

  return {
    patientName,
    selectedPatientId,
    handleSelectPatient,
    intakeOutput,
    handleUpdateField,
    isDataEntered,
    saveAssessment,
    checkRealTimeAlerts,
    assessmentAlert,
    currentAlert,
    dataAlert,
    setBackendAlert,
    triggerPatientAlert,
    loading,
    recordId,
    ADPIE_STAGES,
    setIntakeOutput,
  };
};
