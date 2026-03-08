import { useCallback } from 'react';
import apiClient from '@api/apiClient';

export const usePatients = () => {
  const getPatients = useCallback(async () => {
    try {
      // Use multiple parameters to ensure we get inactive patients as well across different backend versions
      const response = await apiClient.get('/patient?all=true&all=1&is_active=all');
      return response.data;
    } catch (err: any) {
      const message = err?.response?.data || err?.message || 'Network Error';
      throw new Error(
        typeof message === 'string' ? message : JSON.stringify(message),
      );
    }
  }, []);

  const getPatientById = useCallback(async (id: string | number) => {
    try {
      // Use ?all=true to bypass active filter on backend when fetching specific patient
      const response = await apiClient.get(`/patient/${id}?all=true`);
      return response.data;
    } catch (err: any) {
      const message =
        err?.response?.data || err?.message || 'Error fetching patient details';
      throw new Error(
        typeof message === 'string' ? message : JSON.stringify(message),
      );
    }
  }, []);

  return { getPatients, getPatientById };
};
