import apiClient from '../../../api/apiClient';

export const useMedicalHistory = () => {
  const saveMedicalHistory = async (patientId: number, formData: any) => {
    try {
      // Map the 5 sub-components to their respective API endpoints
      const endpoints = {
        present: '/medical-history/present-illness',
        past: '/medical-history/past-medical-surgical',
        allergies: '/medical-history/allergies',
        vaccination: '/medical-history/vaccination',
        developmental: '/medical-history/developmental-history'
      };

      // Create an array of individual POST requests
      const requests = [
        apiClient.post(endpoints.present, { ...formData.present, patient_id: patientId }),
        apiClient.post(endpoints.past, { ...formData.past, patient_id: patientId }),
        apiClient.post(endpoints.allergies, { ...formData.allergies, patient_id: patientId }),
        apiClient.post(endpoints.vaccination, { ...formData.vaccination, patient_id: patientId }),
        apiClient.post(endpoints.developmental, { 
          patient_id: patientId,
          gross_motor: formData.developmental.gross,
          fine_motor: formData.developmental.fine,
          language: formData.developmental.language,
          cognitive: formData.developmental.cognitive,
          social: formData.developmental.social
        })
      ];

      // Execute all requests in parallel
      const results = await Promise.all(requests);
      return results;
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.message || 'Submission Error';
      throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
    }
  };

  return { saveMedicalHistory };
};