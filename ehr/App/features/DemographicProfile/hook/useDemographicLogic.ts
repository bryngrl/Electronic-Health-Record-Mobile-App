// App/features/DemographicProfile/hook/useDemographicLogic.ts
import { useState, useCallback, useEffect } from 'react';
import apiClient from '../../../api/apiClient';

export const useDemographicLogic = (
  onSelectionChange: (isSelecting: boolean) => void,
) => {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
  }>({ visible: false, title: '', message: '', type: 'success' });

  const isSelectionMode = selectedIds.size > 0;

  useEffect(() => {
    onSelectionChange(isSelectionMode);
  }, [isSelectionMode, onSelectionChange]);

  const loadPatients = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      // Matches the pluralized path based on your registration code
      const response = await apiClient.get('/patients/');
      setPatients(response.data || []);
    } catch (error) {
      console.error('Profile Fetch Error:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // NEW: Function to handle Active/Inactive status updates
  const updateStatus = useCallback(
    async (status: boolean) => {
      setIsLoading(true);
      try {
        /**
         * Iterate through selected IDs and update status on the backend.
         * Matches PUT /patients/{patient_id} with is_active: 1 or 0.
         */
        const updatePromises = Array.from(selectedIds).map(id => {
          // Find the existing patient data to satisfy full PUT requirements if needed
          const existingPatient = (patients as any[]).find(
            p => p.patient_id === id,
          );

          // We send back the full patient object with the updated is_active status
          // because the backend PUT endpoint uses PatientCreate schema (no partial updates).
          const updatedData = {
            ...existingPatient,
            is_active: status ? 1 : 0,
          };

          // Remove fields that are not in PatientCreate schema if they exist
          delete updatedData.patient_id;
          delete updatedData.created_at;
          delete updatedData.updated_at;

          return apiClient.put(`/patients/${id}`, updatedData);
        });

        await Promise.all(updatePromises);

        // Show success alert
        const statusText = status ? 'active' : 'inactive';
        let message = '';
        if (selectedIds.size === 1) {
          const id = Array.from(selectedIds)[0];
          const p = (patients as any[]).find(ptr => ptr.patient_id === id);
          const name = p ? `${p.first_name} ${p.last_name}` : 'Patient';
          message = `${name} set to ${statusText}`;
        } else {
          message = `${selectedIds.size} patients set to ${statusText}`;
        }

        setAlertConfig({
          visible: true,
          title: 'Status Updated',
          message,
          type: 'success',
        });

        // Reset selection and refresh list on success
        setSelectedIds(new Set());
        await loadPatients(false);
      } catch (error) {
        console.error('Status Update Error:', error);
        setAlertConfig({
          visible: true,
          title: 'Error',
          message: 'Failed to update patient status',
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [selectedIds, loadPatients, patients],
  );

  const toggleSelection = useCallback((id: number) => {
    setSelectedIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) newSelection.delete(id);
      else newSelection.add(id);
      return newSelection;
    });
  }, []);

  return {
    patients,
    isLoading,
    isRefreshing,
    selectedIds,
    isSelectionMode,
    loadPatients,
    toggleSelection,
    updateStatus, // Expose to the screen
    alertConfig,
    closeAlert: () => setAlertConfig(prev => ({ ...prev, visible: false })),
    handleRefresh: () => {
      setIsRefreshing(true);
      loadPatients(false);
    },
    clearSelection: () => setSelectedIds(new Set()),
  };
};
