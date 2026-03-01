import { useCallback } from 'react';
import apiClient from '../../../api/apiClient';

export const usePatients = () => {
  const getPatients = useCallback(async () => {
    try {
      const response = await apiClient.get('/patients/');
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
      const response = await apiClient.get(`/patients/${id}/`);
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
