import { useState, useMemo, useCallback } from 'react';
import apiClient from '@api/apiClient';

export const RECON_STAGES = [
  "PATIENT'S CURRENT MEDICATION",
  "PATIENT'S HOME MEDICATION",
  "CHANGES IN MEDICATION DURING HOSPITALIZATION"
];

export interface ReconEntry {
  med: string;
  dose: string;
  route: string;
  freq: string;
  indication: string;
  extra: string; // Administered stay? / Discontinued? / Reason for change
}

export interface Patient {
  patient_id: number;
  first_name: string;
  last_name: string;
}

const initialEntry: ReconEntry = { med: '', dose: '', route: '', freq: '', indication: '', extra: '' };

export const useMedicalReconLogic = () => {
  const [stageIndex, setStageIndex] = useState(0);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [patientName, setPatientName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [existingIds, setExistingIds] = useState<{
    current: number | null;
    home: number | null;
    changes: number | null;
  }>({ current: null, home: null, changes: null });

  const [reconData, setReconData] = useState<Record<number, ReconEntry>>({
    0: { ...initialEntry },
    1: { ...initialEntry },
    2: { ...initialEntry }
  });

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({ visible: false, title: '', message: '', type: 'info' });

  const [successMessage, setSuccessMessage] = useState({
    title: '',
    message: '',
  });
  const [successVisible, setSuccessVisible] = useState(false);

  const currentStage = RECON_STAGES[stageIndex];
  const values = reconData[stageIndex];

  // Fetch existing medications for selected patient
  const fetchPatientMedications = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      const [homeRes, currentRes, changesRes] = await Promise.all([
        apiClient.get(`/medication-reconciliation/home-medication/patient/${id}/`),
        apiClient.get(`/medication-reconciliation/current-medication/patient/${id}/`),
        apiClient.get(`/medication-reconciliation/changes-in-medication/patient/${id}/`),
      ]);

      const home = homeRes.data[0] || {};
      const current = currentRes.data[0] || {};
      const changes = changesRes.data[0] || {};

      setExistingIds({
        current: current.id || null,
        home: home.id || null,
        changes: changes.id || null
      });

      setReconData({
        0: {
          med: current.current_med || '',
          dose: current.current_dose || '',
          route: current.current_route || '',
          freq: current.current_frequency || '',
          indication: current.current_indication || '',
          extra: current.current_text || ''
        },
        1: {
          med: home.home_med || '',
          dose: home.home_dose || '',
          route: home.home_route || '',
          freq: home.home_frequency || '',
          indication: home.home_indication || '',
          extra: home.home_text || ''
        },
        2: {
          med: changes.change_med || '',
          dose: changes.change_dose || '',
          route: changes.change_route || '',
          freq: changes.change_frequency || '',
          indication: '',
          extra: changes.change_text || ''
        }
      });
    } catch (error) {
      console.error('Error fetching patient medications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data when patientId changes
  useMemo(() => {
    if (patientId) {
      fetchPatientMedications(patientId);
    } else {
      setExistingIds({ current: null, home: null, changes: null });
      setReconData({
        0: { ...initialEntry },
        1: { ...initialEntry },
        2: { ...initialEntry }
      });
    }
  }, [patientId, fetchPatientMedications]);

  // VALIDATION: Hindi makaka-next kung walang maski isang input
  const isDataEntered = useMemo(() => {
    return true; // Enable empty inputs as per requirement
  }, []);

  const handleUpdate = (field: keyof ReconEntry, value: string) => {
    setReconData(prev => ({
      ...prev,
      [stageIndex]: { ...prev[stageIndex], [field]: value }
    }));
  };

  const submitReconciliation = async () => {
    if (!patientId) {
      setAlertConfig({
        visible: true,
        title: 'Patient Required',
        message: 'Please select a patient first in the search bar.',
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    const isUpdate = !!(existingIds.current || existingIds.home || existingIds.changes);

    const sanitize = (val: string) => (val.trim() === '' ? 'N/A' : val);

    try {
      const newIds = { ...existingIds };

      // Stage 0: Current Medication
      const currentMed = reconData[0];
      const payload0 = {
        patient_id: patientId,
        current_med: sanitize(currentMed.med),
        current_dose: sanitize(currentMed.dose),
        current_route: sanitize(currentMed.route),
        current_frequency: sanitize(currentMed.freq),
        current_indication: sanitize(currentMed.indication),
        current_text: sanitize(currentMed.extra)
      };

      if (existingIds.current) {
        await apiClient.put(`/medication-reconciliation/current-medication/${existingIds.current}/`, payload0);
      } else {
        const res = await apiClient.post('/medication-reconciliation/current-medication/', payload0);
        if (res.data?.id) newIds.current = res.data.id;
      }

      // Stage 1: Home Medication
      const homeMed = reconData[1];
      const payload1 = {
        patient_id: patientId,
        home_med: sanitize(homeMed.med),
        home_dose: sanitize(homeMed.dose),
        home_route: sanitize(homeMed.route),
        home_frequency: sanitize(homeMed.freq),
        home_indication: sanitize(homeMed.indication),
        home_text: sanitize(homeMed.extra)
      };

      if (existingIds.home) {
        await apiClient.put(`/medication-reconciliation/home-medication/${existingIds.home}/`, payload1);
      } else {
        const res = await apiClient.post('/medication-reconciliation/home-medication/', payload1);
        if (res.data?.id) newIds.home = res.data.id;
      }

      // Stage 2: Changes in Medication
      const changeMed = reconData[2];
      const payload2 = {
        patient_id: patientId,
        change_med: sanitize(changeMed.med),
        change_dose: sanitize(changeMed.dose),
        change_route: sanitize(changeMed.route),
        change_frequency: sanitize(changeMed.freq),
        change_text: sanitize(changeMed.extra)
      };

      if (existingIds.changes) {
        await apiClient.put(`/medication-reconciliation/changes-in-medication/${existingIds.changes}/`, payload2);
      } else {
        const res = await apiClient.post('/medication-reconciliation/changes-in-medication/', payload2);
        if (res.data?.id) newIds.changes = res.data.id;
      }

      setExistingIds(newIds);

      setSuccessMessage({
        title: isUpdate ? 'Successully Updated' : 'Successfully Submitted',
        message: `Medication Reconciliation ${isUpdate ? 'updated' : 'submitted'} successfully!`,
      });
      setSuccessVisible(true);

    } catch (error) {
      console.error('Error submitting reconciliation:', error);
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: `Failed to ${isUpdate ? 'update' : 'submit'} medication reconciliation`,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (isDataEntered) {
      if (stageIndex < RECON_STAGES.length - 1) {
        setStageIndex(prev => prev + 1);
      } else {
        submitReconciliation();
      }
    }
  };

  const closeAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const triggerPatientAlert = useCallback(() => {
    setAlertConfig({
      visible: true,
      title: 'Patient Required',
      message: 'Please select a patient first in the search bar.',
      type: 'error'
    });
  }, []);

  const resetForm = useCallback(() => {
    setStageIndex(0);
    setPatientId(null);
    setPatientName('');
    setExistingIds({ current: null, home: null, changes: null });
    setReconData({
      0: { ...initialEntry },
      1: { ...initialEntry },
      2: { ...initialEntry }
    });
  }, []);

  return {
    stageIndex,
    currentStage,
    values,
    patientName,
    setPatientName,
    patientId,
    setPatientId,
    isLoading,
    isSubmitting,
    handleUpdate,
    handleNext,
    isDataEntered,
    isLastStage: stageIndex === RECON_STAGES.length - 1,
    alertConfig,
    closeAlert,
    triggerPatientAlert,
    resetForm,
    setStageIndex,
    RECON_STAGES,
    successMessage,
    successVisible,
    setSuccessVisible
  };
};