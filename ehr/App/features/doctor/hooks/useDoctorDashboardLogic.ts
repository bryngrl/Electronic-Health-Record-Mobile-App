import { useState, useMemo, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../../api/apiClient';

const CACHE_UPDATES_KEY = 'doctor_cache_updates';
const CACHE_STATS_KEY = 'doctor_cache_stats';

export interface PatientUpdate {
  id: string;
  record_id: number;
  patient_id: number;
  patient_name: string;
  update_type: string;
  type_key: string;
  time: string;
  isRead: boolean;
}

export interface DoctorStats {
  total_patients: number;
  active_patients: number;
  today_updates: number;
}

const normalizeItem = (item: any, existingIsRead: boolean): PatientUpdate => ({
  id: `${item.type_key ?? ''}-${item.record_id ?? item.id}`,
  record_id: Number(item.record_id ?? item.id),
  patient_id: Number(item.patient_id),
  patient_name: item.patient_name ?? 'Unknown Patient',
  update_type: item.type ?? 'Update',
  type_key: item.type_key ?? '',
  time: item.time ?? new Date().toISOString(),
  isRead: existingIsRead,
});

const DEDUPLICATE_FEATURES = [
  'vital-signs',
  'medical-history',
  'lab-values',
  'medication',
  'medical-reconciliation',
];

export const useDoctorDashboardLogic = () => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Unread' | 'Read'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [updates, setUpdates] = useState<PatientUpdate[]>([]);
  const [stats, setStats] = useState<DoctorStats>({ total_patients: 0, active_patients: 0, today_updates: 0 });
  // Only show loading spinner on first load if no cache exists
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Persist updates to AsyncStorage (includes isRead state)
  const persistUpdates = useCallback(async (data: PatientUpdate[]) => {
    try {
      await AsyncStorage.setItem(CACHE_UPDATES_KEY, JSON.stringify(data));
    } catch {}
  }, []);

  const persistStats = useCallback(async (data: DoctorStats) => {
    try {
      await AsyncStorage.setItem(CACHE_STATS_KEY, JSON.stringify(data));
    } catch {}
  }, []);

  // Load cache on mount for instant display
  useEffect(() => {
    const loadCache = async () => {
      try {
        const [cachedUpdates, cachedStats] = await Promise.all([
          AsyncStorage.getItem(CACHE_UPDATES_KEY),
          AsyncStorage.getItem(CACHE_STATS_KEY),
        ]);
        if (cachedUpdates) {
          const parsed: PatientUpdate[] = JSON.parse(cachedUpdates);
          setUpdates(parsed);
          setLoading(false); // cache available — no spinner needed
        }
        if (cachedStats) {
          setStats(JSON.parse(cachedStats));
        }
      } catch {}
    };
    loadCache();
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiClient.get('/doctor/stats');
      if (response.data) {
        setStats(response.data);
        persistStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching doctor stats:', err);
    }
  }, [persistStats]);

  const fetchUpdates = useCallback(async () => {
    try {
      // Only show loading spinner if nothing is cached yet
      setUpdates(prev => {
        if (prev.length === 0) setLoading(true);
        return prev;
      });
      setError(null);

      const response = await apiClient.get('/doctor/recent-forms', { params: { per_page: 50 } });
      let rawData = response.data?.data ?? response.data ?? [];
      if (!Array.isArray(rawData)) rawData = [];

      setUpdates(prev => {
        // Build a map of existing items so we only update what changed
        const existingMap = new Map(prev.map(u => [u.id, u]));

        // Normalize first
        const normalized = rawData.map((item: any) => {
          const itemId = `${item.type_key ?? ''}-${item.record_id ?? item.id}`;
          const existing = existingMap.get(itemId);
          // Preserve isRead for items already cached; respect API is_read for new items
          const isRead = existing ? existing.isRead : (item.is_read ?? false);
          return normalizeItem(item, isRead);
        });

        // Deduplicate: If same patient and same feature (in DEDUPLICATE_FEATURES), keep only most recent
        const seen = new Set<string>();
        const deduped: PatientUpdate[] = [];

        // Sort by time descending before deduping to ensure we keep the newest
        const sorted = [...normalized].sort(
          (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
        );

        for (const update of sorted) {
          const feature = update.type_key;
          if (DEDUPLICATE_FEATURES.includes(feature)) {
            const key = `${update.patient_id}-${feature}`;
            if (!seen.has(key)) {
              seen.add(key);
              deduped.push(update);
            }
          } else {
            // Features not in deduplicate list are always added
            deduped.push(update);
          }
        }

        persistUpdates(deduped);
        return deduped;
      });
    } catch (err) {
      console.error('Error fetching doctor updates:', err);
      setError('Failed to load updates. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [persistUpdates]);

  useEffect(() => {
    fetchUpdates();
    fetchStats();
    const interval = setInterval(() => {
      fetchUpdates();
      fetchStats();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchUpdates, fetchStats]);

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    // API returns "2026-03-11 08:45:00" — replace space with T for valid ISO parse
    const normalized = dateString.includes('T') ? dateString : dateString.replace(' ', 'T');
    const updateDate = new Date(normalized);
    if (isNaN(updateDate.getTime())) return dateString;
    const now = new Date();
    const diffInMs = now.getTime() - updateDate.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMins / 60);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;

    return updateDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const MODEL_TYPE_MAP: Record<string, string> = {
    'vital-signs':   'App\\Models\\Vitals',
    'physical-exam': 'App\\Models\\PhysicalExam',
    'adl':           'App\\Models\\ActOfDailyLiving',
    'intake-output': 'App\\Models\\IntakeAndOutput',
    'lab-values':    'App\\Models\\LabValues',
    'medication':    'App\\Models\\MedicationAdministration',
    'ivs-lines':     'App\\Models\\IvsAndLine',
  };

  const markAsRead = useCallback((updateId: string, typeKey?: string, recordId?: number) => {
    setUpdates(prev => {
      const next = prev.map(u => u.id === updateId ? { ...u, isRead: true } : u);
      persistUpdates(next);
      return next;
    });

    if (typeKey && recordId) {
      const modelType = MODEL_TYPE_MAP[typeKey];
      if (modelType) {
        apiClient.post('/doctor/mark-read', { model_type: modelType, model_id: recordId }).catch(() => {});
      }
    }
  }, [persistUpdates]);

  const markAllAsRead = useCallback(() => {
    setUpdates(prev => {
      const next = prev.map(u => ({ ...u, isRead: true }));
      persistUpdates(next);
      return next;
    });
  }, [persistUpdates]);

  const filteredUpdates = useMemo(() => {
    return updates
      .filter(item => {
        const matchesFilter =
          activeFilter === 'All' ||
          (activeFilter === 'Unread' && !item.isRead) ||
          (activeFilter === 'Read' && item.isRead);
        const matchesSearch = (item.patient_name ?? '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .map(item => ({
        ...item,
        name: item.patient_name,
        type: item.update_type,
        status: item.isRead ? 'Read' as const : 'Unread' as const,
        time: formatTime(item.time),
      }));
  }, [activeFilter, searchQuery, updates]);

  return {
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    filteredUpdates,
    updates,
    stats,
    loading,
    error,
    refreshUpdates: fetchUpdates,
    markAsRead,
    markAllAsRead,
  };
};