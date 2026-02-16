import React from 'react';
import { StyleSheet, View, Text, FlatList, TextInput } from 'react-native';
import { PatientRow } from '../component/PatientRow';
import CustomButton from '../../../components/button';

const PATIENTS = [
  { id: '1', name: 'Oberbrunner, Loyal W.', age: '9', sex: 'Male' },
  { id: '2', name: 'Bednar, Erick T.', age: '16', sex: 'Female' },
  { id: '3', name: 'Mayer, Zack J.', age: '18', sex: 'Male' },
  { id: '4', name: 'Terry, Bianka L.', age: '18', sex: 'Female' },
  { id: '5', name: 'Gleason, Geraldine R.', age: '15', sex: 'Male' },
];

export default function DemographicProfileScreen({ onBack }: { onBack: () => void }) {
  const renderHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerText, { flex: 0.6, textAlign: 'center' }]}>PATIENT ID</Text>
      <Text style={[styles.headerText, { flex: 2.5, textAlign: 'center' }]}>NAME</Text>
      <Text style={[styles.headerText, { flex: 0.6, textAlign: 'center' }]}>AGE</Text>
      <Text style={[styles.headerText, { flex: 1, textAlign: 'center' }]}>GENDER</Text>
      <Text style={[styles.headerText, { flex: 2, textAlign: 'center' }]}>ACTIONS</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.mainTitle}>PATIENT LIST</Text>
        
        <View style={styles.searchRow}>
          <TextInput 
            style={styles.searchBar} 
            placeholder="Search patients..." 
            placeholderTextColor="#AAA"
          />
          <CustomButton 
            title="ADD PATIENT" 
            onPress={() => {}} 
            variant="gradient"
            style={styles.addPatientBtn}
          />
        </View>
      </View>

      <FlatList
        data={PATIENTS}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => <PatientRow patient={item} />}
        keyExtractor={item => item.id}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
      />

    
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topSection: { padding: 15 },
  mainTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A6A24',
    letterSpacing: -1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  searchBar: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: '#1A6A24',
    borderRadius: 25,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  addPatientBtn: {
    minWidth: 130,
    paddingVertical: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1A6A24', // Dark green header from image
    paddingVertical: 15,
  },
  headerText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 13,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  backBtn: {
    width: '50%',
  }
});