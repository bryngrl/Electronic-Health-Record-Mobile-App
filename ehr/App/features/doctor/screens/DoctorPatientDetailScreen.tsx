import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import apiClient from '../../../api/apiClient';

interface Props {
  patientId: number;
  category: string;
  recordId?: number; // Optional
  onBack: () => void;
}

export default function DoctorPatientDetailScreen({ patientId, category, recordId, onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch patient basic info
      const patientRes = await apiClient.get(`/patients/${patientId}`);
      setPatient(patientRes.data);

      // Identify endpoint base
      let baseEndpoint = '';
      switch (category) {
        case 'vital_signs': baseEndpoint = '/vital-signs'; break;
        case 'physical_exam': baseEndpoint = '/physical-exam'; break;
        case 'lab_values': baseEndpoint = '/lab-values'; break;
        case 'intake_output': baseEndpoint = '/intake-output'; break;
        case 'adl': baseEndpoint = '/adl'; break;
        default: break;
      }

      if (baseEndpoint) {
        if (recordId) {
          // Fetch specific record
          const recordRes = await apiClient.get(`${baseEndpoint}/${recordId}`);
          setData(recordRes.data);
        } else {
          // Fetch latest record for this patient
          const listRes = await apiClient.get(`${baseEndpoint}/patient/${patientId}`);
          if (listRes.data && listRes.data.length > 0) {
            setData(listRes.data[0]); // First one is the latest
          }
        }
      }
    } catch (error) {
      console.error('Error fetching detail data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [patientId, category, recordId]);

  const renderContent = () => {
    if (!data) return <Text style={styles.noData}>No recent records found for this category.</Text>;

    switch (category) {
      case 'vital_signs':
        return (
          <View style={styles.recordContainer}>
            <Text style={styles.recordTitle}>Latest Vital Signs</Text>
            <View style={styles.grid}>
              <DetailItem label="Temperature" value={`${data.temperature}°C`} alert={data.temperature_alert} />
              <DetailItem label="Heart Rate" value={`${data.hr} bpm`} alert={data.hr_alert} />
              <DetailItem label="Resp Rate" value={`${data.rr} bpm`} alert={data.rr_alert} />
              <DetailItem label="BP" value={data.bp} alert={data.bp_alert} />
              <DetailItem label="SpO2" value={`${data.spo2}%`} alert={data.spo2_alert} />
            </View>
            
            {data.diagnosis && (
              <View style={styles.adpieSection}>
                <Text style={styles.adpieTitle}>Diagnosis</Text>
                <Text style={styles.adpieText}>{data.diagnosis}</Text>
                {data.diagnosis_alert && <Text style={styles.alertText}>{data.diagnosis_alert}</Text>}
              </View>
            )}
          </View>
        );
      
      case 'physical_exam':
        return (
          <View style={styles.recordContainer}>
            <Text style={styles.recordTitle}>Latest Physical Exam</Text>
            <DetailItem label="General Appearance" value={data.general_appearance} alert={data.general_appearance_alert} />
            <DetailItem label="Skin" value={data.skin_condition} alert={data.skin_alert} />
            <DetailItem label="Eyes" value={data.eye_condition} alert={data.eye_alert} />
            <DetailItem label="Oral" value={data.oral_condition} alert={data.oral_alert} />
            <DetailItem label="Cardio" value={data.cardiovascular} alert={data.cardiovascular_alert} />
            <DetailItem label="Abdomen" value={data.abdomen_condition} alert={data.abdomen_alert} />
            <DetailItem label="Extremities" value={data.extremities} alert={data.extremities_alert} />
            <DetailItem label="Neurological" value={data.neurological} alert={data.neurological_alert} />
          </View>
        );

      default:
        return (
          <View style={styles.recordContainer}>
            <Text style={styles.recordTitle}>{category.replace('_', ' ').toUpperCase()}</Text>
            <Text style={styles.jsonText}>{JSON.stringify(data, null, 2)}</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#035022" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>View Record</Text>
          {patient && (
            <Text style={styles.headerSubtitle}>
              {patient.first_name} {patient.last_name} | ID: {String(patient.patient_id).padStart(4, '0')}
            </Text>
          )}
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#29A539" style={{ marginTop: 50 }} />
        ) : (
          renderContent()
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const DetailItem = ({ label, value, alert }: any) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || 'N/A'}</Text>
    {alert && <Text style={styles.detailAlert}>{alert}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#035022' },
  headerSubtitle: { fontSize: 13, color: '#999' },
  scrollContent: { padding: 20 },
  recordContainer: { 
    backgroundColor: '#F9FDF9', 
    borderRadius: 15, 
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5F3E5'
  },
  recordTitle: { fontSize: 18, fontWeight: '700', color: '#035022', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  detailItem: { width: '100%', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 8 },
  detailLabel: { fontSize: 12, color: '#999', marginBottom: 2 },
  detailValue: { fontSize: 16, color: '#333', fontWeight: '500' },
  detailAlert: { fontSize: 11, color: '#D32F2F', marginTop: 4, fontStyle: 'italic' },
  adpieSection: { marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  adpieTitle: { fontSize: 15, fontWeight: '700', color: '#035022', marginBottom: 5 },
  adpieText: { fontSize: 14, color: '#444' },
  alertText: { fontSize: 12, color: '#D32F2F', marginTop: 5, fontStyle: 'italic' },
  noData: { textAlign: 'center', marginTop: 50, color: '#999' },
  jsonText: { fontSize: 12, color: '#666', fontFamily: 'monospace' }
});