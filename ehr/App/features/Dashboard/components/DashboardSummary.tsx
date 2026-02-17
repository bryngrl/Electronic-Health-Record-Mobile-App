import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, 
  ScrollView, Platform, ActivityIndicator 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AccountModal } from '../../../components/AccountModal';
import apiClient from '../../../api/apiClient'; 

const THEME_GREEN = '#1B5E20';

const DashboardSummary = ({ onNavigate }: { onNavigate: (route: string) => void }) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  // FIX: Initialize as an empty array to prevent ".map is not a function" error
  const [patients, setPatients] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchLatestPatients();
  }, []);

  const fetchLatestPatients = async () => {
    try {
      setLoading(true);
      // Fetch using your confirmed USB IP: 10.248.106.213
      const response = await apiClient.get('/patients/');
      if (response.data && Array.isArray(response.data)) {
        setPatients(response.data.reverse()); 
      }
    } catch (error) {
      console.error("Connection Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  // Only show the 3 newest patients unless "Show more" is clicked
  const displayedPatients = Array.isArray(patients) 
    ? (showAll ? patients : patients.slice(0, 3)) 
    : [];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { fontStyle: 'italic' }]}>Hello, Jovilyn</Text>
            <Text style={styles.dateText}>{formatDate()}</Text>
          </View>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Icon name="keyboard-arrow-down" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* --- DYNAMIC REGISTERED PATIENTS SECTION --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>New Registered Patients</Text>
          
          {loading ? (
            <ActivityIndicator color={THEME_GREEN} style={{ marginVertical: 20 }} />
          ) : patients && patients.length > 0 ? (
            <View>
              {displayedPatients.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.patientItem}
                  onPress={() => onNavigate('Records')}
                >
                  <View style={styles.patientLeft}>
                    <Icon name="person" size={20} color={THEME_GREEN} style={styles.patientIcon} />
                    <Text style={styles.patientName}>{item.first_name} {item.last_name}</Text>
                  </View>
                  <Text style={styles.patientDate}>
                    {item.admission_date || "Jan 1, 2026"}
                  </Text>
                </TouchableOpacity>
              ))}
              
              {patients.length > 3 && (
                <TouchableOpacity 
                  style={styles.showMoreBtn} 
                  onPress={() => setShowAll(!showAll)}
                >
                  <Text style={styles.showMoreText}>
                    {showAll ? "Show less" : "Show more"}
                  </Text>
                  <Icon 
                    name={showAll ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                    size={20} 
                    color="#999" 
                  />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>There is no existing patient.</Text>
              <TouchableOpacity style={styles.addPatientBtn} onPress={() => onNavigate('Register')}>
                <Text style={styles.addPatientText}>ADD PATIENT</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Recents</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={styles.recentCard} onPress={() => onNavigate('Register')}>
              <Icon name="person-add" size={28} color={THEME_GREEN} />
              <Text style={styles.cardText}>Register Patient</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.recentCard} onPress={() => onNavigate('Vital Signs')}>
              <Icon name="monitor-heart" size={28} color={THEME_GREEN} />
              <Text style={styles.cardText}>Vital Signs</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.actionBtn} onPress={() => onNavigate('Grid')}>
          <View style={styles.btnContent}>
            <View style={styles.btnIconBg}><Icon name="notes" size={20} color="#666" /></View>
            <Text style={styles.btnLabel}>Start documenting patient</Text>
          </View>
          <Icon name="arrow-forward-ios" size={20} color="#BDBDBD" />
        </TouchableOpacity>
      </ScrollView>

      <AccountModal visible={modalVisible} onClose={() => setModalVisible(false)} onLogout={() => setModalVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 25 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 35, marginTop: 40 },
  greeting: { fontSize: 32, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', color: THEME_GREEN, fontWeight: 'bold' },
  dateText: { fontSize: 14, color: '#999', marginTop: 4 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#888', marginBottom: 15 },
  patientItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  patientLeft: { flexDirection: 'row', alignItems: 'center' },
  patientIcon: { marginRight: 15 },
  patientName: { fontSize: 15, color: '#333', fontWeight: '500' },
  patientDate: { fontSize: 13, color: '#999' },
  showMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  showMoreText: { color: '#999', fontSize: 13, marginRight: 5 },
  emptyCard: { paddingVertical: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#eee', borderRadius: 15 },
  emptyText: { color: '#999', fontSize: 14, marginBottom: 15 },
  addPatientBtn: { borderWidth: 1, borderColor: '#333', borderRadius: 20, paddingHorizontal: 30, paddingVertical: 8 },
  addPatientText: { color: '#333', fontWeight: 'bold', fontSize: 12 },
  recentCard: { width: 110, height: 110, backgroundColor: '#fff', borderRadius: 15, borderWidth: 1.5, borderColor: '#D8F3DC', padding: 15, marginRight: 15, justifyContent: 'space-between' },
  cardText: { fontSize: 13, fontWeight: 'bold', color: THEME_GREEN, lineHeight: 16 },
  actionBtn: { backgroundColor: '#F2F2F2', borderRadius: 15, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  btnContent: { flexDirection: 'row', alignItems: 'center' },
  btnIconBg: { backgroundColor: '#CCC', padding: 4, borderRadius: 4 },
  btnLabel: { marginLeft: 15, fontSize: 15, color: '#888', fontWeight: '600' },
});

export default DashboardSummary;