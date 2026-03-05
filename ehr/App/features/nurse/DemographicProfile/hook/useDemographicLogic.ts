// App/features/DemographicProfile/hook/useDemographicLogic.ts
import { useState, useCallback, useEffect } from 'react';
import apiClient from '@api/apiClient';

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
      const targetValue = status ? 1 : 0;
      
      // Filter only those who actually need an update
      const idsToUpdate = Array.from(selectedIds).filter(id => {
        const p = (patients as any[]).find(ptr => ptr.patient_id === id);
        if (!p) return false;
        const currentStatus = typeof p.is_active === 'number' 
          ? p.is_active 
          : (p.is_active ? 1 : 0);
        return currentStatus !== targetValue;
      });

      if (idsToUpdate.length === 0) {
        setAlertConfig({
          visible: true,
          title: 'No Changes',
          message: `Selected patients are already ${status ? 'active' : 'inactive'}.`,
          type: 'success',
        });
        setSelectedIds(new Set());
        return;
      }

      setIsLoading(true);
      try {
        const updatePromises = idsToUpdate.map(id => {
          const existingPatient = (patients as any[]).find(
            p => p.patient_id === id,
          );

          const updatedData = {
            ...existingPatient,
            is_active: targetValue,
          };

          delete updatedData.patient_id;
          delete updatedData.created_at;
          delete updatedData.updated_at;

          return apiClient.put(`/patients/${id}`, updatedData);
        });

        await Promise.all(updatePromises);

        const statusText = status ? 'active' : 'inactive';
        let message = '';
        if (idsToUpdate.length === 1) {
          const id = idsToUpdate[0];
          const p = (patients as any[]).find(ptr => ptr.patient_id === id);
          const name = p ? `${p.first_name} ${p.last_name}` : 'Patient';
          message = `${name} set to ${statusText}`;
        } else {
          message = `${idsToUpdate.length} patients set to ${statusText}`;
        }

        setAlertConfig({
          visible: true,
          title: 'Status Updated',
          message,
          type: 'success',
        });

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
