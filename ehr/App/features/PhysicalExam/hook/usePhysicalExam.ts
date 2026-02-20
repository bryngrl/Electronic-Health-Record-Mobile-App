import apiClient from '../../../api/apiClient';

export const usePhysicalExam = () => {
  // STEP 1: ASSESSMENT (POST)
  const saveAssessment = async (payload: any) => {
    // Matches @router.post("/")
    const response = await apiClient.post('/physical-exam/', payload);
    return response.data; // Returns PhysicalExamRead with ID
  };

  // Real-time CDSS: Keyword matching for Assessment
  // 2. REAL-TIME CDSS: Polling findings to check for risks
 const checkAssessmentAlerts = async (payload: any) => {
    try {
      const response = await apiClient.post('/physical-exam/', payload);
      return response.data;
    } catch (err) { return null; }
  
  };

  // STEPS 2-5: DPIE UPDATES (PUT)
  const updateDPIE = async (examId: number, stepKey: string, text: string) => {
    // Matches @router.put("/{exam_id}/diagnosis"), /planning, etc.
    const response = await apiClient.put(`/physical-exam/${examId}/${stepKey}`, {
      [stepKey]: text
    });
    return response.data;
  };

  return { saveAssessment, checkAssessmentAlerts, updateDPIE };
};