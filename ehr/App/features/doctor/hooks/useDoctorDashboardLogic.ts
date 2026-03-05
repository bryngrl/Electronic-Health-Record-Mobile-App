import { useState, useMemo, useEffect } from 'react';
import apiClient from '../../../api/apiClient';

export interface PatientUpdate {
  id: string;
  patient_id: number;
  patient_name: string;
  update_type: string;
  status: 'Unread' | 'Read';
  created_at: string;
}

// MOCK DATA for temporary use since backend endpoint /doctor/updates doesn't exist yet
const MOCK_UPDATES: PatientUpdate[] = [
  {
    id: '1',
    patient_id: 101,
    patient_name: 'Juan Dela Cruz',
    update_type: 'Vital Signs',
    status: 'Unread',
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
  },
  {
    id: '2',
    patient_id: 102,
    patient_name: 'Maria Clara',
    update_type: 'Lab Results Ready',
    status: 'Unread',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: '3',
    patient_id: 103,
    patient_name: 'Crisostomo Ibarra',
    update_type: 'New Assessment Added',
    status: 'Read',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  }
];

export const useDoctorDashboardLogic = () => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Unread' | 'Read'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [updates, setUpdates] = useState<PatientUpdate[]>(MOCK_UPDATES);
  const [loading, setLoading] = useState(false);

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      // Try to fetch from real API, but fall back to mock data if it fails
      const response = await apiClient.get('/doctor/updates');
      if (response.data && Array.isArray(response.data)) {
        setUpdates(response.data);
      } else {
        setUpdates(MOCK_UPDATES);
      }
    } catch (error) {
      console.log('Using mock data for doctor updates (Backend endpoint not ready yet)');
      setUpdates(MOCK_UPDATES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
    // Optional: polling every 30 seconds
    const interval = setInterval(fetchUpdates, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (dateString: string) => {
    const now = new Date();
    const updateDate = new Date(dateString);
    const diffInMs = now.getTime() - updateDate.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMins / 60);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;

    return updateDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const markAsRead = async (updateId: string) => {
    try {
      // Optimistic update for UI feel even if API fails
      setUpdates(prev =>
        prev.map(u => u.id === updateId ? { ...u, status: 'Read' } : u)
      );
      
      // Attempt real API call
      await apiClient.put(`/doctor/updates/${updateId}/read`);
    } catch (error) {
      console.log('Update status sync with backend failed, but UI was updated.');
    }
  };

  const filteredUpdates = useMemo(() => {
    if (!updates || !Array.isArray(updates)) return [];
    
    return updates
      .filter(item => {
        const matchesFilter = activeFilter === 'All' || item.status === activeFilter;
        const matchesSearch = item.patient_name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
      })
      .map(item => ({
        ...item,
        name: item.patient_name,
        time: formatTime(item.created_at),
        type: item.update_type,
        unread: item.status === 'Unread'
      }));
  }, [updates, activeFilter, searchQuery]);

  return {
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    filteredUpdates,
    loading,
    markAsRead,
    refresh: fetchUpdates
  };
};
