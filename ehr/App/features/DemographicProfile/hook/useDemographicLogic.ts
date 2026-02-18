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
         * Matches PUT /patient/{patient_id}.
         */
        const updatePromises = Array.from(selectedIds).map(id =>
          apiClient.put(`/patient/${id}`, { isActive: status }),
        );

        await Promise.all(updatePromises);

        // Reset selection and refresh list on success
        setSelectedIds(new Set());
        await loadPatients(false);
      } catch (error) {
        console.error('Status Update Error:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedIds, loadPatients],
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
    handleRefresh: () => {
      setIsRefreshing(true);
      loadPatients(false);
    },
    clearSelection: () => setSelectedIds(new Set()),
  };
};
