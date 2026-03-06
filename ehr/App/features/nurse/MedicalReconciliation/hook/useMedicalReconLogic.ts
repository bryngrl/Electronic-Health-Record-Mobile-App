import { useState, useCallback, useEffect } from 'react';
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
  extra: string; 
}

const initialEntry: ReconEntry = { med: '', dose: '', route: '', freq: '', indication: '', extra: '' };

export const useMedicalReconLogic = () => {
  const [stageIndex, setStepIndex] = useState(0);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [patientName, setPatientName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const fetchPatientMedications = useCallback(async (id: number) => {
    if (!id) return;
    setIsLoading(true);
    try {
      console.log(`[MedicalRecon] Fetching for patient ${id}`);
      const response = await apiClient.get(`/medical-reconciliation/patient/${id}`);
      const { current: currentList, home: homeList, changes: changesList } = response.data;

      // Extract the first item (most recent in many Laravel setups)
      const current = (Array.isArray(currentList) && currentList.length > 0) ? currentList[0] : {};
      const home = (Array.isArray(homeList) && homeList.length > 0) ? homeList[0] : {};
      const changes = (Array.isArray(changesList) && changesList.length > 0) ? changesList[0] : {};

      setReconData({
        0: {
          med: current.current_med === 'N/A' ? '' : current.current_med || '',
          dose: current.current_dose === 'N/A' ? '' : current.current_dose || '',
          route: current.current_route === 'N/A' ? '' : current.current_route || '',
          freq: current.current_frequency === 'N/A' ? '' : current.current_frequency || '',
          indication: current.current_indication === 'N/A' ? '' : current.current_indication || '',
          extra: current.current_text === 'N/A' ? '' : current.current_text || ''
        },
        1: {
          med: home.home_med === 'N/A' ? '' : home.home_med || '',
          dose: home.home_dose === 'N/A' ? '' : home.home_dose || '',
          route: home.home_route === 'N/A' ? '' : home.home_route || '',
          freq: home.home_frequency === 'N/A' ? '' : home.home_frequency || '',
          indication: home.home_indication === 'N/A' ? '' : home.home_indication || '',
          extra: home.home_text === 'N/A' ? '' : home.home_text || ''
        },
        2: {
          med: changes.change_med === 'N/A' ? '' : changes.change_med || '',
          dose: changes.change_dose === 'N/A' ? '' : changes.change_dose || '',
          route: changes.change_route === 'N/A' ? '' : changes.change_route || '',
          freq: changes.change_frequency === 'N/A' ? '' : changes.change_frequency || '',
          indication: '',
          extra: changes.change_text === 'N/A' ? '' : changes.change_text || ''
        }
      });
    } catch (error) {
      console.error('Error fetching patient medications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (patientId) {
      fetchPatientMedications(patientId);
    } else {
      setReconData({
        0: { ...initialEntry },
        1: { ...initialEntry },
        2: { ...initialEntry }
      });
    }
  }, [patientId, fetchPatientMedications]);

  const handleUpdate = (field: keyof ReconEntry, value: string) => {
    setReconData(prev => ({
      ...prev,
      [stageIndex]: { ...prev[stageIndex], [field]: value }
    }));
  };

  const submitReconciliation = async () => {
    if (!patientId) return;

    setIsSubmitting(true);
    const sanitize = (val: string) => (val && val.trim() === '' ? 'N/A' : val || 'N/A');
    const pid = parseInt(patientId.toString(), 10);

    try {
      console.log(`[MedicalRecon] Pattern-matched submission for patient ${pid}...`);
      
      const cMed = reconData[0];
      const hMed = reconData[1];
      const chMed = reconData[2];

      // Logic: EXACTLY like Medical History - no ID, just POST with patient_id.
      // The backend uses updateOrCreate logic based on patient_id.
      
      const payload0 = {
        patient_id: pid,
        current_med: sanitize(cMed.med),
        current_dose: sanitize(cMed.dose),
        current_route: sanitize(cMed.route),
        current_frequency: sanitize(cMed.freq),
        current_indication: sanitize(cMed.indication),
        current_text: sanitize(cMed.extra)
      };

      const payload1 = {
        patient_id: pid,
        home_med: sanitize(hMed.med),
        home_dose: sanitize(hMed.dose),
        home_route: sanitize(hMed.route),
        home_frequency: sanitize(hMed.freq),
        home_indication: sanitize(hMed.indication),
        home_text: sanitize(hMed.extra)
      };

      const payload2 = {
        patient_id: pid,
        change_med: sanitize(chMed.med),
        change_dose: sanitize(chMed.dose),
        change_route: sanitize(chMed.route),
        change_frequency: sanitize(chMed.freq),
        change_text: sanitize(chMed.extra)
      };

      // Sequential POSTs to match Medical History's reliable flow
      await apiClient.post('/medical-reconciliation/current', payload0);
      await apiClient.post('/medical-reconciliation/home', payload1);
      await apiClient.post('/medical-reconciliation/changes', payload2);

      setSuccessMessage({
        title: 'Success',
        message: 'Medication Reconciliation saved successfully!',
      });
      setSuccessVisible(true);
      
      // Refresh to pull the updated values back into the form
      await fetchPatientMedications(pid);

    } catch (error: any) {
      console.error('Error submitting reconciliation:', error?.response?.data || error.message);
      setAlertConfig({
        visible: true,
        title: 'Submission Error',
        message: error?.response?.data?.message || 'Failed to save edits.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (stageIndex < RECON_STAGES.length - 1) {
      setStepIndex(prev => prev + 1);
    } else {
      submitReconciliation();
    }
  };

  const closeAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

  const triggerPatientAlert = useCallback(() => {
    setAlertConfig({
      visible: true,
      title: 'Patient Required',
      message: 'Please select a patient first in the search bar.',
      type: 'error'
    });
  }, []);

  const resetForm = useCallback(() => {
    setStepIndex(0);
    setPatientId(null);
    setPatientName('');
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
    isLastStage: stageIndex === RECON_STAGES.length - 1,
    alertConfig,
    closeAlert,
    triggerPatientAlert,
    resetForm,
    setStageIndex: setStepIndex,
    RECON_STAGES,
    successMessage,
    successVisible,
    setSuccessVisible
  };
};
