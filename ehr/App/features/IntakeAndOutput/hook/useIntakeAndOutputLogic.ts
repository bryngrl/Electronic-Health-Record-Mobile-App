import { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../../../api/apiClient';

export const ADPIE_STAGES = [
  'ASSESSMENT',
  'DIAGNOSIS',
  'PLANNING',
  'INTERVENTION',
  'EVALUATION',
];

export interface IntakeOutput {
  oral_intake: string;
  iv_fluids: string;
  urine_output: string;
}

const initialData: IntakeOutput = {
  oral_intake: '',
  iv_fluids: '',
  urine_output: '',
};

export const useIntakeAndOutputLogic = () => {
  const [searchText, setSearchText] = useState('');
  const [patientName, setPatientName] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recordId, setRecordId] = useState<number | null>(null);

  const [intakeOutput, setIntakeOutput] = useState<IntakeOutput>(initialData);
  const [assessmentAlert, setAssessmentAlert] = useState<string | null>(null);
  const [backendAlert, setBackendAlert] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Load patient list on mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await apiClient.get('/patients/');
        const normalized = (response.data || []).map((p: any) => ({
          id: (p.patient_id ?? p.id).toString(),
          fullName: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
        }));
        setPatients(normalized);
      } catch (e) {
        console.error('Failed to load patients');
      }
    };
    fetchPatients();
  }, []);

  const isDataEntered = useMemo(() => {
    return Object.values(intakeOutput).some(value => value.trim() !== '');
  }, [intakeOutput]);

  const handleSearchPatient = (text: string) => {
    setSearchText(text);
    if (text.length > 0) {
      const filtered = patients.filter(p =>
        p.fullName.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredPatients(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
      setSelectedPatientId(null);
      setPatientName('');
    }
  };

  const selectPatient = (p: any) => {
    setSearchText(p.fullName);
    setPatientName(p.fullName);
    setSelectedPatientId(p.id);
    setShowDropdown(false);
    loadPatientData(p.id);
  };

  const loadPatientData = async (patientId: string) => {
    try {
      const response = await apiClient.get(
        `/intake-output/patient/${patientId}`
      );
      const records = response.data || [];

      if (records.length > 0) {
        const mostRecent = records[0];
        setRecordId(mostRecent.id);
        setAssessmentAlert(mostRecent.assessment_alert || null);
        setIntakeOutput({
          oral_intake: mostRecent.oral_intake?.toString() || '',
          iv_fluids: mostRecent.iv_fluids?.toString() || '',
          urine_output: mostRecent.urine_output?.toString() || '',
        });
      } else {
        setRecordId(null);
        setAssessmentAlert(null);
        setIntakeOutput(initialData);
      }
    } catch (e) {
      console.error('Failed to load patient data:', e);
    }
  };

  const handleUpdateField = (key: keyof IntakeOutput, value: string) => {
    setIntakeOutput(prev => ({ ...prev, [key]: value }));
    // Clear alerts when user modifies data to avoid showing stale info
    setAssessmentAlert(null);
    if (backendAlert) setBackendAlert(null);
  };

  // REAL-TIME CDSS Check (Debounced)
  useEffect(() => {
    if (!selectedPatientId) return;

    const timer = setTimeout(async () => {
      if (isDataEntered) {
        try {
          const payload = {
            oral_intake: parseInt(intakeOutput.oral_intake || '0', 10),
            iv_fluids: parseInt(intakeOutput.iv_fluids || '0', 10),
            urine_output: parseInt(intakeOutput.urine_output || '0', 10),
          };

          let response;
          if (recordId) {
            // AssessmentUpdate schema forbids extra fields like patient_id
            response = await apiClient.put(`/intake-output/${recordId}/assessment`, payload);
          } else {
            // AssessmentCreate schema requires patient_id
            response = await apiClient.post('/intake-output/', {
              patient_id: parseInt(selectedPatientId, 10),
              ...payload
            });
          }
          
          const data = response.data;
          if (data.id) setRecordId(data.id);
          if (data.assessment_alert) setAssessmentAlert(data.assessment_alert);
        } catch (e) {
          console.error('Real-time CDSS Error:', e);
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [intakeOutput, selectedPatientId, recordId]);

  const saveAssessment = async () => {
    if (!selectedPatientId) {
      triggerPatientAlert();
      return null;
    }

    setLoading(true);

    const payload = {
      oral_intake: parseInt(intakeOutput.oral_intake || '0', 10),
      iv_fluids: parseInt(intakeOutput.iv_fluids || '0', 10),
      urine_output: parseInt(intakeOutput.urine_output || '0', 10),
    };

    try {
      let response;
      if (recordId) {
        // AssessmentUpdate schema forbids patient_id
        response = await apiClient.put(`/intake-output/${recordId}/assessment`, payload);
      } else {
        // AssessmentCreate schema requires patient_id
        response = await apiClient.post('/intake-output/', {
          patient_id: parseInt(selectedPatientId, 10),
          ...payload
        });
      }
      
      const data = response.data;
      setRecordId(data.id);
      setAssessmentAlert(data.assessment_alert || null);

      setBackendAlert({
        title: 'SUCCESS',
        message: 'Intake and Output record saved successfully.',
        type: 'success',
      });

      return data;
    } catch (e: any) {
      console.error('API Error saving intake and output:', e);
      setBackendAlert({
        title: 'ERROR',
        message: e.response?.data?.detail || 'Failed to save record.',
        type: 'error',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const triggerPatientAlert = useCallback(() => {
    setBackendAlert({
      title: 'Patient Required',
      message: 'Please select a patient first in the search bar.',
      type: 'error'
    });
  }, []);

  const reset = () => {
    setSearchText('');
    setPatientName('');
    setSelectedPatientId(null);
    setRecordId(null);
    setAssessmentAlert(null);
    setIntakeOutput(initialData);
    setBackendAlert(null);
  };

  return {
    searchText,
    patientName,
    selectedPatientId,
    filteredPatients,
    showDropdown,
    setShowDropdown,
    handleSearchPatient,
    selectPatient,
    intakeOutput,
    handleUpdateField,
    isDataEntered,
    saveAssessment,
    currentAlert: backendAlert,
    assessmentAlert,
    setBackendAlert,
    triggerPatientAlert,
    reset,
    loading,
    recordId,
    ADPIE_STAGES
  };
};
