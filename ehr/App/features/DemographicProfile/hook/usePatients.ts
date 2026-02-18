// App/features/DemographicProfile/hook/usePatients.ts
import { useCallback } from 'react';
import apiClient from '../../../api/apiClient';

export const usePatients = () => {
  const getPatients = useCallback(async () => {
    try {
      // Using plural to match your successful registration endpoint
      const response = await apiClient.get('/patients/');
      return response.data;
    } catch (err: any) {
      const message = err?.response?.data || err?.message || 'Network Error';
      throw new Error(
        typeof message === 'string' ? message : JSON.stringify(message),
      );
    }
  }, []); // Empty array ensures this function is stable

  return { getPatients };
};
