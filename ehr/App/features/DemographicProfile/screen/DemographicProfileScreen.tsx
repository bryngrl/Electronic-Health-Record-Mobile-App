import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  StatusBar,
  Platform,
  useColorScheme,
  Image,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';

import PatientRow from '../component/PatientRow';
import Button from '../../../components/button';
import { useDemographicLogic } from '../hook/useDemographicLogic';

interface ProfileProps {
  onBack: () => void;
  onSelectionChange: (isSelecting: boolean) => void;
}

// RESTORED: These definitions are necessary for the Image components below
const activeIcon = require('../../../../assets/icons/active_icon.png');
const inactiveIcon = require('../../../../assets/icons/inactive_icon.png');

const DemographicProfileScreen: React.FC<ProfileProps> = ({
  onBack,
  onSelectionChange,
}) => {
  const isDarkMode = useColorScheme() === 'dark';

  const {
    patients,
    isLoading,
    isRefreshing,
    selectedIds,
    isSelectionMode,
    loadPatients,
    toggleSelection,
    handleRefresh,
    clearSelection,
    updateStatus, // Ensure your hook provides this function
  } = useDemographicLogic(onSelectionChange);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Demographic{'\n'}Profile</Text>
            {isSelectionMode && (
              <Button title="DONE" onPress={clearSelection} />
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
              {' '}
              PATIENT NAME
            </Text>
            <Text
              style={[styles.headerText, { flex: 0.3, textAlign: 'center' }]}
            >
              ACTIONS
            </Text>
          </View>

          {isLoading && !isRefreshing ? (
            <ActivityIndicator
              size="large"
              color="#29A539"
              style={{ marginTop: 50 }}
            />
          ) : (
            <FlatList
              data={patients}
              keyExtractor={(item: any) => item.patient_id.toString()}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                />
              }
              renderItem={({ item }: any) => (
                <PatientRow
                  item={{
                    ...item,
                    name: `${item.last_name}, ${item.first_name}`,
                    id: item.patient_id,
                    isActive: item.isActive ?? true,
                  }}
                  isSelected={selectedIds.has(item.patient_id)}
                  isSelectionMode={isSelectionMode}
                  onPress={() =>
                    isSelectionMode && toggleSelection(item.patient_id)
                  }
                  onLongPress={() => toggleSelection(item.patient_id)}
                />
              )}
            />
          )}

          {/* Action Footer */}
          {isSelectionMode && (
            <View style={styles.actionFooter}>
              <TouchableOpacity
                style={styles.footerItem}
                onPress={() => updateStatus(true)} // Set as Active
              >
                <View
                  style={[styles.statusCircle, { backgroundColor: '#E8F5E9' }]}
                >
                  <Image source={activeIcon} style={styles.footerIcon} />
                </View>
                <Text style={styles.footerText}>Active</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.footerItem}
                onPress={() => updateStatus(false)} // Set as Inactive
              >
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
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 35,
    color: '#035022',
    fontFamily: 'MinionPro-SemiboldItalic',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E5FFE8',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 20,
  },
  headerText: { color: '#29A539', fontWeight: 'bold', fontSize: 12 },
  actionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFF',
  },
  footerItem: { flexDirection: 'row', alignItems: 'center' },
  statusCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  footerIcon: { width: '100%', height: '100%', resizeMode: 'cover' },
  footerText: { color: '#004D40', fontSize: 15, fontWeight: '500' },
});

export default DemographicProfileScreen;
