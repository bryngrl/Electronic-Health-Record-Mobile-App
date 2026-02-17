import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
} from 'react-native';

import PatientRow from '../component/patientrow';

// Export the interface so the Row component can import it
export interface Patient {
  id: number | string | null;
  name: string;
  isActive: boolean;
}

const MOCK_PATIENTS: Patient[] = [
  { id: null, name: 'Esquerra, Jovilyn F.', isActive: false },
  { id: 1, name: 'Robles, Rain Louie', isActive: true },
  { id: null, name: 'Esquerra, Jovilyn F.', isActive: true },
  { id: null, name: 'Roblerra, Jovilyn F.', isActive: false },
  { id: null, name: 'Esquerra, Jovilyn F.', isActive: true },
  { id: '12', name: 'Esquerra, Jovilyn F.', isActive: false },
  { id: '14', name: 'Eobles, Rain Louie', isActive: true },
];

const DemographicProfileScreen: React.FC = () => {
  const [search, setSearch] = useState<string>('');

  const filteredPatients = MOCK_PATIENTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Demographic{"\n"}Profile</Text>
          <TouchableOpacity style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>DONE</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.input}
            placeholder="search patient..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={text => setSearch(text)}
          />
        </View>

        <TouchableOpacity style={styles.addFab}>
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>

        <View style={styles.tableHeader}>
          <Text
            style={[styles.headerText, { flex: 0.15, textAlign: 'center' }]}
          >
            ID
          </Text>
          <Text style={[styles.headerText, { flex: 0.55 }]}>PATIENT NAME</Text>
          <Text style={[styles.headerText, { flex: 0.3, textAlign: 'center' }]}>
            ACTIONS
          </Text>
        </View>

        <FlatList
          data={filteredPatients}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => <PatientRow item={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        />

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendIcon, { backgroundColor: '#E8F5E9' }]}>
              <Text>👤</Text>
            </View>
            <Text style={styles.legendLabel}>Active</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendIcon, { backgroundColor: '#FFEBEE' }]}>
              <Text>🚫</Text>
            </View>
            <Text style={styles.legendLabel}>Inactive</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    color: '#004d40',
    fontWeight: 'bold',
    fontStyle: 'italic',
    lineHeight: 36,
  },
  doneBtn: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 35,
    justifyContent: 'center',
    backgroundColor: '#F1F8E9',
  },
  doneBtnText: { color: '#004d40', fontWeight: 'bold', fontSize: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 48,
  },
  searchIcon: { fontSize: 16, marginRight: 5 },
  input: { flex: 1, fontSize: 16, color: '#333' },
  addFab: {
    alignSelf: 'flex-end',
    backgroundColor: '#2E7D32',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
  },
  addText: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginTop: -2 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  headerText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 12 },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  legendIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  legendLabel: { color: '#004d40', fontSize: 14, fontWeight: '500' },
});

export default DemographicProfileScreen;
