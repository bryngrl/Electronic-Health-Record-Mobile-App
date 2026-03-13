import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient, { BASE_URL } from '@api/apiClient';
import * as ImagePicker from 'react-native-image-picker';

export interface DiagnosticRecord {
  id?: number;
  diagnostic_id?: number;
  patient_id: number;
  type: string;
  path: string;
  original_name: string;
  image_url: string;
  created_at: string;
}

export const useDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDiagnostics = useCallback(async (patientId: string) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/diagnostics/patient/${patientId}?patient_id=${patientId}`);
      const data = response.data || [];
      const raw = Array.isArray(data) ? data : (data.data || []);
      const mappedData = raw.map((d: any) => ({
        ...d,
        id: d.id || d.diagnostic_id,
        diagnostic_id: d.diagnostic_id || d.id,
      }));
      setDiagnostics(mappedData);
    } catch (error) {
      console.error('Error fetching diagnostics:', error);
      setDiagnostics([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadDiagnostic = async (patientId: string, imageType: string) => {
    try {
      const result = await ImagePicker.launchImageLibrary({
        mediaType: 'photo',
        includeBase64: false,
        quality: 0.8,
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      if (!asset.uri) return null;

      const filename = asset.fileName || asset.uri.split('/').pop() || `diagnostic_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const mimeType = asset.type || (match ? `image/${match[1]}` : 'image/jpeg');

      const formData = new FormData();
      formData.append('patient_id', String(patientId));
      formData.append('type', imageType);
      formData.append('images[]', {
        uri: asset.uri,
        name: filename,
        type: mimeType,
      } as any);

      setLoading(true);

      const token = await AsyncStorage.getItem('token');

      // Use fetch directly — do NOT set Content-Type manually so fetch sets it with the multipart boundary
      const response = await fetch(`${BASE_URL}/diagnostics`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: formData,
      });

      const responseData = await response.json();
      console.log('[Diagnostics] upload response:', responseData);

      if (!response.ok) {
        const errorMsg = responseData?.message || responseData?.detail || `Server error: ${response.status}`;
        return { success: false, error: errorMsg };
      }

      await fetchDiagnostics(patientId);
      return { success: true, data: responseData };
    } catch (error: any) {
      console.error('Error uploading diagnostic:', error);
      return { success: false, error: 'Failed to upload image. Check your connection.' };
    } finally {
      setLoading(false);
    }
  };

  const deleteDiagnostic = async (diagnosticId: number) => {
    setLoading(true);
    try {
      await apiClient.delete(`/diagnostics/${diagnosticId}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting diagnostic:', error);
      return { success: false, error: 'Failed to delete image' };
    } finally {
      setLoading(false);
    }
  };

  return {
    diagnostics,
    loading,
    fetchDiagnostics,
    uploadDiagnostic,
    deleteDiagnostic,
  };
};
