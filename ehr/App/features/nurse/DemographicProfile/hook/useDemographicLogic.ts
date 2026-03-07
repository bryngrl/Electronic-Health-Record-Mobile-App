// App/features/DemographicProfile/hook/useDemographicLogic.ts
import { useState, useCallback, useEffect } from 'react';
import apiClient from '@api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PATIENTS_CACHE_KEY = '@demographic_patients_cache';

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

  // 1. Load cached patients on mount to ensure "sticky" list
  useEffect(() => {
    const loadCache = async () => {
      try {
        const cached = await AsyncStorage.getItem(PATIENTS_CACHE_KEY);
        if (cached) {
          setPatients(JSON.parse(cached));
        }
      } catch (e) {
        console.error('Failed to load patients cache', e);
      }
    };
    loadCache();
  }, []);

  useEffect(() => {
    onSelectionChange(isSelectionMode);
  }, [isSelectionMode, onSelectionChange]);

  const loadPatients = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const timestamp = new Date().getTime();
      // Use redundant parameters to bypass various backend filters
      const url = `/patient?all=true&all=1&is_active=all&with_inactive=1&show_all=1&t=${timestamp}`;
      const response = await apiClient.get(url);

      console.log(`[DEMOGRAPHIC FETCH] URL: ${url} Status: ${response.status}`);

      let incomingData = [];
      if (Array.isArray(response.data)) {
        incomingData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        incomingData = response.data.data;
      } else if (
        response.data?.patients &&
        Array.isArray(response.data.patients)
      ) {
        incomingData = response.data.patients;
      } else if (response.data?.success && response.data?.data) {
        incomingData = Array.isArray(response.data.data)
          ? response.data.data
          : [response.data.data];
      }

      if (Array.isArray(incomingData)) {
        setPatients(prevPatients => {
          // MASTER LIST LOGIC:
          // We start with our current list. If a patient is in the new API data, we update it.
          // If a patient is MISSING from the API data, we assume it became inactive on the web.
          // We NEVER remove a patient from this list.

          const patientMap = new Map();

          // First, add all previous patients and mark them as inactive by default
          // (They will be overwritten with fresh status if present in incomingData)
          prevPatients.forEach(p => {
            const id = p.patient_id || p.id;
            if (id) {
              patientMap.set(id, { ...p, is_active: 0 });
            }
          });

          // Second, merge/update with incoming data from API
          incomingData.forEach(p => {
            const id = p.patient_id || p.id;
            if (id) {
              const isActiveValue =
                String(p.is_active) === '1' ||
                p.is_active === true ||
                p.is_active === 1
                  ? 1
                  : 0;
              patientMap.set(id, { ...p, is_active: isActiveValue });
            }
          });

          // Convert back to array and sort by ID Descending
          const finalData = Array.from(patientMap.values()).sort((a, b) => {
            const idA = a.patient_id || a.id || 0;
            const idB = b.patient_id || b.id || 0;
            return idA - idB;
          });

          // Persist the master list to storage so it survives app restarts
          AsyncStorage.setItem(
            PATIENTS_CACHE_KEY,
            JSON.stringify(finalData),
          ).catch(e => console.error('Failed to save patients cache', e));

          return finalData;
        });
      }
    } catch (error) {
      console.error('Demographic Profile Sync Error:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Use a very aggressive polling interval (2 seconds) to pick up website changes immediately.
  useEffect(() => {
    if (isSelectionMode) return;

    const interval = setInterval(() => {
      loadPatients(false);
    }, 2000);

    return () => clearInterval(interval);
  }, [loadPatients, isSelectionMode]);

  // NEW: Function to handle Active/Inactive status updates
  const updateStatus = useCallback(
    async (status: boolean) => {
      const targetValue = status ? 1 : 0;

      // Filter only those who actually need an update
      const idsToUpdate = Array.from(selectedIds).filter(id => {
        const p = (patients as any[]).find(
          ptr => (ptr.patient_id || ptr.id) === id,
        );
        if (!p) return false;
        const currentStatus =
          typeof p.is_active === 'number'
            ? p.is_active
            : p.is_active === true ||
              p.is_active === 'true' ||
              p.is_active === '1'
            ? 1
            : 0;
        return currentStatus !== targetValue;
      });

      if (idsToUpdate.length === 0) {
        setAlertConfig({
          visible: true,
          title: 'No Changes',
          message: `Selected patients are already ${
            status ? 'active' : 'inactive'
          }.`,
          type: 'success',
        });
        setSelectedIds(new Set());
        return;
      }

      setIsLoading(true);
      try {
        const updatePromises = idsToUpdate.map(id => {
          // Use the specific toggle-status endpoint as per SYNC_MOBILE_APP.md section 2
          return apiClient.post(`/patient/${id}/toggle-status`, {
            is_active: targetValue,
          });
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
