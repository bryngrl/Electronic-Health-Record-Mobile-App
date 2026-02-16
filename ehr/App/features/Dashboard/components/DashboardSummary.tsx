import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, 
  ScrollView, Platform 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AccountModal } from '../../../components/AccountModal';

const THEME_GREEN = '#1B4332';

const DashboardSummary = ({ onNavigate }: { onNavigate: (route: string) => void }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const formatDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const user = { firstName: "Jovilyn" };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            {/* Italicized greeting */}
            <Text style={[styles.greeting, { fontStyle: 'italic' }]}>
              Hello, {user.firstName}
            </Text>
            <Text style={styles.dateText}>{formatDate()}</Text>
          </View>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Icon name="keyboard-arrow-down" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>New Registered Patients</Text>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>There is no existing patient.</Text>
            <TouchableOpacity 
              style={styles.addPatientBtn}
              onPress={() => onNavigate('Register')}
            >
              <Text style={styles.addPatientText}>ADD PATIENT</Text>
            </TouchableOpacity>
          </View>
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

        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => onNavigate('Grid')} // Navigates to Grid
        >
          <View style={styles.btnContent}>
            <View style={styles.btnIconBg}>
              <Icon name="notes" size={20} color="#666" />
            </View>
            <Text style={styles.btnLabel}>Start documenting patient</Text>
          </View>
          <Icon name="arrow-forward-ios" size={20} color="#BDBDBD" />
        </TouchableOpacity>

      </ScrollView>

      <AccountModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onLogout={() => setModalVisible(false)} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 25 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 35, marginTop: 10 },
  greeting: { fontSize: 32, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', color: THEME_GREEN, fontWeight: 'bold' },
  dateText: { fontSize: 14, color: '#999', marginTop: 4 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#888', marginBottom: 15 },
  emptyCard: { paddingVertical: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#eee', borderRadius: 15 },
  emptyText: { color: '#999', fontSize: 14, marginBottom: 15 },
  addPatientBtn: { borderWidth: 1, borderColor: '#333', borderRadius: 20, paddingHorizontal: 30, paddingVertical: 8 },
  addPatientText: { color: '#333', fontWeight: 'bold', fontSize: 12 },
  recentCard: { width: 110, height: 110, backgroundColor: '#fff', borderRadius: 15, borderWidth: 1.5, borderColor: '#D8F3DC', padding: 15, marginRight: 15, justifyContent: 'space-between', elevation: 2 },
  cardText: { fontSize: 13, fontWeight: 'bold', color: THEME_GREEN, lineHeight: 16 },
  actionBtn: { backgroundColor: '#F2F2F2', borderRadius: 15, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  btnContent: { flexDirection: 'row', alignItems: 'center' },
  btnIconBg: { backgroundColor: '#CCC', padding: 4, borderRadius: 4 },
  btnLabel: { marginLeft: 15, fontSize: 15, color: '#888', fontWeight: '600' },
  footerInfo: { textAlign: 'center', fontSize: 12, color: THEME_GREEN, marginTop: 20 },
});

export default DashboardSummary;