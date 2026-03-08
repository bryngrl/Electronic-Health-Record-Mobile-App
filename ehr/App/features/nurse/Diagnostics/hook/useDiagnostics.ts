import { useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import apiClient from '@api/apiClient';
import * as ImagePicker from 'react-native-image-picker';

export interface DiagnosticRecord {
  id?: number;
  diagnostic_id?: number;
  patient_id: number;
  image_type: string;
  file_path: string;
  original_name: string;
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
      // Ensure each record has an id field for consistency
      const mappedData = (Array.isArray(data) ? data : (data.data || [])).map((d: any) => ({
        ...d,
        id: d.id || d.diagnostic_id,
        diagnostic_id: d.diagnostic_id || d.id
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

      const formData = new FormData();
      formData.append('patient_id', String(patientId));
      formData.append('image_type', imageType);

      const fileData = {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `diagnostic_${Date.now()}.jpg`,
      };

      formData.append('file', fileData as any);

      setLoading(true);

      const response = await apiClient.post('/diagnostics', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: (data) => data, // Essential for multipart/form-data in some axios versions
        timeout: 60000,
      });

      await fetchDiagnostics(patientId);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error uploading diagnostic:', error);
      let errorMsg = 'Failed to upload image';

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMsg =
          error.response.data?.detail ||
          `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMsg = 'No response from server. Check your connection.';
      }

      return { success: false, error: errorMsg };
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
