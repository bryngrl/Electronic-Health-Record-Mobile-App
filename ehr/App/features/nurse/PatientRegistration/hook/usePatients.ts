import apiClient from '@api/apiClient';

export const usePatients = () => {
  const registerPatient = async (payload: any) => {
    try {
      const response = await apiClient.post('/patient', payload);
      return response;
    } catch (err: any) {
      // Normalize error so callers can show friendly messages
      const message = err?.response?.data || err?.message || 'Network Error';
      // rethrow with useful shape
      throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
    }
  };

  return { registerPatient };
};
