import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Platform,
  useColorScheme,
} from 'react-native';

import PatientRow from '../component/PatientRow';

export interface Patient {
  id: number | string | null;
  name: string;
  isActive: boolean;
}

interface ProfileProps {
  onBack: () => void;
  onSelectionChange: (isSelecting: boolean) => void; // Controls the HomeScreen Navbar
}

const MOCK_PATIENTS: Patient[] = [
  { id: 1, name: 'Esquerra, Jovilyn F.', isActive: false },
  { id: 2, name: 'Robles, Rain Louie', isActive: true },
  { id: 3, name: 'Esquerra, Jovilyn F.', isActive: false },
  { id: 4, name: 'Robles, Rain Louie', isActive: true },
  { id: 5, name: 'Esquerra, Jovilyn F.', isActive: false },
  { id: 6, name: 'Robles, Rain Louie', isActive: true },
];

const DemographicProfileScreen: React.FC<ProfileProps> = ({
  onBack,
  onSelectionChange,
}) => {
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [search, setSearch] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(
    new Set(),
  );

  const isSelectionMode = selectedIds.size > 0;
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Tell the HomeScreen to hide/show the BottomNav whenever selection changes
  useEffect(() => {
    onSelectionChange(isSelectionMode);
  }, [isSelectionMode]);

  const toggleSelection = (id: number | string | null) => {
    if (id === null) return;
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#000' : '#FFF'}
        translucent={false}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Demographic{'\n'}Profile</Text>
            {isSelectionMode && (
              <TouchableOpacity
                style={styles.doneBtn}
                onPress={() => setSelectedIds(new Set())}
              >
                <Text style={styles.doneBtnText}>DONE</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Search Bar - hidden during selection to match image */}
          {!isSelectionMode && (
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
          )}

          <View style={styles.tableHeader}>
            <Text
              style={[styles.headerText, { flex: 0.15, textAlign: 'center' }]}
            >
              ID
            </Text>
            <Text style={[styles.headerText, { flex: 0.55 }]}>
              PATIENT NAME
            </Text>
            <Text
              style={[styles.headerText, { flex: 0.3, textAlign: 'center' }]}
            >
              ACTIONS
            </Text>
          </View>

          <FlatList
            data={filteredPatients}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <PatientRow
                item={item}
                isSelected={item.id !== null && selectedIds.has(item.id)}
                onPress={() => isSelectionMode && toggleSelection(item.id)}
                onLongPress={() => toggleSelection(item.id)}
              />
            )}
            showsVerticalScrollIndicator={false}
          />

          {/* CIRCLED PART IN RED: Only shows when a patient is selected */}
          {isSelectionMode && (
            <View style={styles.actionFooter}>
              <TouchableOpacity style={styles.footerItem}>
                <View
                  style={[styles.statusCircle, { backgroundColor: '#E8F5E9' }]}
                >
                  <Text style={styles.footerEmoji}>👤</Text>
                </View>
                <Text style={styles.footerText}>Active</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.footerItem}>
                <View
                  style={[styles.statusCircle, { backgroundColor: '#FFEBEE' }]}
                >
                  <Text style={styles.footerEmoji}>🚫</Text>
                </View>
                <Text style={styles.footerText}>Inactive</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF' },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 25,
    marginBottom: 15,
  },
  title: {
    fontSize: 32,
    color: '#004d40',
    fontWeight: 'bold',
    fontStyle: 'italic',
    lineHeight: 36,
  },
  doneBtn: {
    borderWidth: 1.5,
    borderColor: '#4CAF50',
    borderRadius: 20,
    paddingHorizontal: 20,
    height: 36,
    justifyContent: 'center',
    backgroundColor: '#F1F8E9',
  },
  doneBtnText: { color: '#004d40', fontWeight: 'bold', fontSize: 13 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 46,
    marginBottom: 20,
  },
  searchIcon: { fontSize: 16, marginRight: 5 },
  input: { flex: 1, fontSize: 16, color: '#333' },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  headerText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 12 },
  actionFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFF',
    marginBottom: 10,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 25,
  },
  statusCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  footerEmoji: { fontSize: 18 },
  footerText: { color: '#004D40', fontSize: 15, fontWeight: '500' },
});

export default DemographicProfileScreen;
