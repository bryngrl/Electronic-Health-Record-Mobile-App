// App/features/DemographicProfile/hook/useDemographicLogic.ts
import { useState, useCallback, useEffect } from 'react';
import { usePatients } from './usePatients';

export const useDemographicLogic = (
  onSelectionChange: (isSelecting: boolean) => void,
) => {
  const { getPatients } = usePatients();

  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const isSelectionMode = selectedIds.size > 0;

  // Sync selection mode with the parent layout
  useEffect(() => {
    onSelectionChange(isSelectionMode);
  }, [isSelectionMode, onSelectionChange]);

  // STABILIZED: useCallback prevents infinite loops
  const loadPatients = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true);
      try {
        const data = await getPatients();
        setPatients(data || []);
      } catch (error) {
        console.error('Profile Fetch Error:', error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [getPatients],
  ); // Only changes if getPatients changes

  const toggleSelection = useCallback((id: number) => {
    setSelectedIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return newSelection;
    });
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadPatients(false);
  }, [loadPatients]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  return {
    patients,
    isLoading,
    isRefreshing,
    selectedIds,
    isSelectionMode,
    loadPatients,
    toggleSelection,
    handleRefresh,
    clearSelection,
  };
};
