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

export const useDoctorDashboardLogic = () => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Unread' | 'Read'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [updates, setUpdates] = useState<PatientUpdate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/doctor/updates');
      setUpdates(response.data);
    } catch (error) {
      console.error('Error fetching doctor updates:', error);
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
    // Ensure dateString is treated as UTC
    const normalizedDate = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
    const updateDate = new Date(normalizedDate);
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
      await apiClient.put(`/doctor/updates/${updateId}/read`);
      setUpdates(prev => 
        prev.map(u => u.id === updateId ? { ...u, status: 'Read' } : u)
      );
    } catch (error) {
      console.error('Error marking update as read:', error);
    }
  };

  const filteredUpdates = useMemo(() => {
    return updates
      .filter(item => {
        const matchesFilter = activeFilter === 'All' || item.status === activeFilter;
        const matchesSearch = item.patient_name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
      })
      .map(item => ({
        ...item,
        name: item.patient_name,
        type: item.update_type,
        time: formatTime(item.created_at)
      }));
  }, [activeFilter, searchQuery, updates]);

  return {
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    filteredUpdates,
    updates,
    loading,
    refreshUpdates: fetchUpdates,
    markAsRead
  };
};