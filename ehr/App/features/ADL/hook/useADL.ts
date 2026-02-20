import { useState } from 'react';
import apiClient from '../../../api/apiClient';

export const useADL = () => {
  const [alerts, setAlerts] = useState<any>({});

  // STEP 1: INITIAL ASSESSMENT (POST to @router.post("/"))
  const saveADLAssessment = async (payload: any) => {
    // Matches AssessmentCreate schema
    const response = await apiClient.post('/adl/', payload);
    return response.data; // Returns ADLRead with record ID
  };

  // REAL-TIME CDSS: Polls the update endpoint to get alerts without creating new records
  const checkADLAlerts = async (recordId: number, payload: any) => {
    try {
      // Matches @router.put("/{record_id}/assessment")
      const response = await apiClient.put(`/adl/${recordId}/assessment`, payload);
      if (response.data) {
        setAlerts(response.data); // Updates bells in real-time
      }
      return response.data;
    } catch (err) {
      return null;
    }
  };

  // STEPS 2-5: DPIE UPDATES (PUT to /{record_id}/diagnosis, /planning, etc.)
  const updateADLStep = async (recordId: number, stepKey: string, text: string) => {
    // Matches DiagnosisUpdate, PlanningUpdate, etc.
    const response = await apiClient.put(`/adl/${recordId}/${stepKey}`, {
      [stepKey]: text
    });
    return response.data;
  };

  return { alerts, saveADLAssessment, checkADLAlerts, updateADLStep };
};