import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Platform,
  useColorScheme,
  Image,
} from 'react-native';

import PatientRow from '../component/PatientRow';
import Button from '../../../components/button';

export interface Patient {
  id: number | string | null;
  name: string;
  isActive: boolean;
}

interface ProfileProps {
  onBack: () => void;
  onSelectionChange: (isSelecting: boolean) => void;
}

// Assets
const activeIcon = require('../../../../assets/icons/active_icon.png');
const inactiveIcon = require('../../../../assets/icons/inactive_icon.png');

const MOCK_PATIENTS: Patient[] = [
  { id: 1, name: 'Esquerra, Jovilyn F.', isActive: false },
  { id: 2, name: 'Robles, Rain Louie', isActive: true },
  { id: 3, name: 'Esquerra, Jovilyn F.', isActive: false },
  { id: 4, name: 'Robles, Rain Louie', isActive: true },
  { id: 5, name: 'Esquerra, Jovilyn F.', isActive: false },
];

const DemographicProfileScreen: React.FC<ProfileProps> = ({
  onBack,
  onSelectionChange,
}) => {
  const [patients] = useState<Patient[]>(MOCK_PATIENTS);
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(
    new Set(),
  );

  const isSelectionMode = selectedIds.size > 0;
  const isDarkMode = useColorScheme() === 'dark';

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
              <Button title="DONE" onPress={() => setSelectedIds(new Set())} />
            )}
          </View>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text
              style={[styles.headerText, { flex: 0.15, textAlign: 'center' }]}
            >
              ID
            </Text>
            <Text style={[styles.headerText, { flex: 0.55, paddingLeft: 10 }]}>
              {'    '}
              PATIENT NAME
            </Text>
            <Text
              style={[styles.headerText, { flex: 0.3, textAlign: 'center' }]}
            >
              ACTIONS
            </Text>
          </View>

          <FlatList
            data={patients}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <PatientRow
                item={item}
                isSelected={item.id !== null && selectedIds.has(item.id)}
                isSelectionMode={isSelectionMode}
                onPress={() => isSelectionMode && toggleSelection(item.id)}
                onLongPress={() => toggleSelection(item.id)}
              />
            )}
            showsVerticalScrollIndicator={false}
            extraData={selectedIds}
          />

          {/* Action Footer */}
          {isSelectionMode && (
            <View style={styles.actionFooter}>
              <TouchableOpacity style={styles.footerItem}>
                <View
                  style={[styles.statusCircle, { backgroundColor: '#E8F5E9' }]}
                >
                  <Image source={activeIcon} style={styles.footerIcon} />
                </View>
                <Text style={styles.footerText}>Active</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.footerItem}>
                <View
                  style={[styles.statusCircle, { backgroundColor: '#FFEBEE' }]}
                >
                  <Image source={inactiveIcon} style={styles.footerIcon} />
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
  container: { flex: 1, paddingHorizontal: 10 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 0,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 42,
    color: '#035022',
    lineHeight: 36,
    fontFamily: 'MinionPro-SemiboldItalic',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E5FFE8',
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderRadius: 8,
    marginBottom: 8,
    marginHorizontal: 20,
  },
  headerText: { color: '#29A539', fontWeight: 'bold', fontSize: 12 },
  actionFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFF',
    gap: 125,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  footerIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  footerText: { color: '#004D40', fontSize: 15, fontWeight: '500' },
});

export default DemographicProfileScreen;
