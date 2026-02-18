import { useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import apiClient from '../../../api/apiClient';
import * as ImagePicker from 'react-native-image-picker';

export interface DiagnosticRecord {
  diagnostic_id: number;
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
      const response = await apiClient.get(`/diagnostics/patient/${patientId}`);
      setDiagnostics(response.data || []);
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
      formData.append('patient_id', patientId);
      formData.append('image_type', imageType);

      const fileData = {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `diagnostic_${Date.now()}.jpg`,
      };

      formData.append('file', fileData as any);

      setLoading(true);

      // Axios in React Native sometimes needs the Content-Type header to be omitted
      // so the browser/environment can set it with the correct boundary.
      // But FastAPI requires it to be multipart/form-data.
      const response = await apiClient.post('/diagnostics/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success', 'Image uploaded successfully');
      await fetchDiagnostics(patientId);
      return response.data;
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
        // The request was made but no response was received
        errorMsg = 'No response from server. Check your connection.';
      }

      Alert.alert('Error', errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteDiagnostic = async (patientId: string, diagnosticId: number) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this diagnostic image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await apiClient.delete(`/diagnostics/${diagnosticId}`);
              Alert.alert('Success', 'Image deleted');
              await fetchDiagnostics(patientId);
            } catch (error) {
              console.error('Error deleting diagnostic:', error);
              Alert.alert('Error', 'Failed to delete image');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  return {
    diagnostics,
    loading,
    fetchDiagnostics,
    uploadDiagnostic,
    deleteDiagnostic,
  };
};
