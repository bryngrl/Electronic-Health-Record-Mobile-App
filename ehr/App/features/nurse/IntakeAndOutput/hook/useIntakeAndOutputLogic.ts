import { useState, useCallback, useMemo } from 'react';
import apiClient from '@api/apiClient';

export interface IntakeOutputData {
  oral_intake: string;
  iv_fluids: string;
  urine_output: string;
}

export const useIntakeAndOutputLogic = () => {
  const [patientName, setPatientName] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [intakeOutput, setIntakeOutput] = useState<IntakeOutputData>({
    oral_intake: '',
    iv_fluids: '',
    urine_output: '',
  });
  const [assessmentAlert, setAssessmentAlert] = useState<string | null>(null);
  const [currentAlert, setBackendAlert] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [recordId, setRecordId] = useState<number | null>(null);

  const ADPIE_STAGES = ['Assessment', 'Diagnosis', 'Planning', 'Intervention', 'Evaluation'];

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
      const response = await apiClient.get(`/intake-output/patient/${patientId}`);
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
      console.error('Error fetching Intake & Output:', err);
      return null;
    }
  }, []);

  const checkRealTimeAlerts = useCallback(async (payload: any) => {
    try {
      const response = await apiClient.post('/intake-output/check-alerts', payload);
      if (response.data && response.data.assessment_alert) {
        setAssessmentAlert(response.data.assessment_alert);
      }
      return response.data;
    } catch (err) {
      return null;
    }
  }, []);

  const saveAssessment = useCallback(async () => {
    if (!selectedPatientId) return null;
    
    setLoading(true);
    try {
      const sanitize = (val: string) => (val.trim() === '' ? 'N/A' : val);

      const payload = {
        patient_id: parseInt(selectedPatientId, 10),
        oral_intake: sanitize(intakeOutput.oral_intake),
        iv_fluids: sanitize(intakeOutput.iv_fluids),
        urine_output: sanitize(intakeOutput.urine_output),
      };

      const response = await apiClient.post('/intake-output/', payload);
      const data = response.data;
      if (data.id) setRecordId(data.id);
      if (data.assessment_alert) setAssessmentAlert(data.assessment_alert);
      
      return data;
    } catch (e) {
      console.error('API Error saving I&O:', e);
      return null;
    } finally {
      setLoading(false);
    }
  }, [selectedPatientId, intakeOutput]);

  const handleSelectPatient = useCallback(async (id: number | null, name: string) => {
    setSelectedPatientId(id ? id.toString() : null);
    setPatientName(name);
    
    if (id) {
      const data = await fetchLatestIntakeOutput(id);
      if (data) {
        setRecordId(data.id);
        setIntakeOutput({
          oral_intake: data.oral_intake?.toString() || '',
          iv_fluids: data.iv_fluids?.toString() || '',
          urine_output: data.urine_output?.toString() || '',
        });
        setAssessmentAlert(data.assessment_alert);
      } else {
        setRecordId(null);
        setIntakeOutput({ oral_intake: '', iv_fluids: '', urine_output: '' });
        setAssessmentAlert(null);
      }
    } else {
      setRecordId(null);
      setIntakeOutput({ oral_intake: '', iv_fluids: '', urine_output: '' });
      setAssessmentAlert(null);
    }
  }, [fetchLatestIntakeOutput]);

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
    setBackendAlert,
    triggerPatientAlert,
    loading,
    recordId,
    ADPIE_STAGES,
    setIntakeOutput,
  };
};