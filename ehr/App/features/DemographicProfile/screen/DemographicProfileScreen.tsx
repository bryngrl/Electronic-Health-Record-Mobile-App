import React, { useEffect, useState } from 'react';
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

interface Patient {
  patient_id: number;
  first_name: string;
  last_name: string;
  isActive?: boolean;
}

interface ProfileProps {
  onBack: () => void;
  onSelectionChange: (isSelecting: boolean) => void;
}

const activeIcon = require('../../../../assets/icons/active_icon.png');
const inactiveIcon = require('../../../../assets/icons/inactive_icon.png');
const dotsIcon = require('../../../../assets/icons/dots_icon.png');
const selectImage = require('../../../../assets/icons/select_icon.png');

const DemographicProfileScreen: React.FC<ProfileProps> = ({
  onBack,
  onSelectionChange,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [showSelectMenu, setShowSelectMenu] = useState(false);

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
    updateStatus,
  } = useDemographicLogic(onSelectionChange);

  // Cast patients to Patient[] to fix the "never" TypeScript error
  const typedPatients = patients as Patient[];

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const enterSelectionMode = () => {
    setShowSelectMenu(false);
    // patient_id is now recognized on the typed object
    if (typedPatients.length > 0) {
      toggleSelection(typedPatients[0].patient_id);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* 50% Dark Background Overlay - appears only when menu is shown */}
      {showSelectMenu && (
        <TouchableOpacity
          style={styles.darkOverlay}
          activeOpacity={1}
          onPress={() => setShowSelectMenu(false)}
        />
      )}

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Demographic{'\n'}Profile</Text>

            <View style={styles.headerActions}>
              {isSelectionMode ? (
                <Button title="DONE" onPress={clearSelection} />
              ) : (
                <TouchableOpacity
                  onPress={() => setShowSelectMenu(!showSelectMenu)}
                >
                  <Image source={dotsIcon} style={styles.dotsIcon} />
                </TouchableOpacity>
              )}

              {showSelectMenu && (
                <TouchableOpacity
                  style={styles.menuPopup}
                  onPress={enterSelectionMode}
                >
                  {/* Image now fills the container 100% */}
                  <Image source={selectImage} style={styles.fullSelectImage} />
                </TouchableOpacity>
              )}
            </View>
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
              data={typedPatients}
              keyExtractor={item => item.patient_id.toString()}
              /* REMOVED refreshControl HERE TO STOP AUTO-REFRESH ON SCROLL */
              renderItem={({ item }) => (
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
                onPress={() => updateStatus(true)}
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
                onPress={() => updateStatus(false)}
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
  // Dark Background Overlay Style
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 5,
  },
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
    zIndex: 10,
  },
  headerActions: {
    alignItems: 'flex-end',
    position: 'relative',
    marginTop: 10,
  },
  title: {
    fontSize: 39,
    color: '#035022',
    fontFamily: 'MinionPro-SemiboldItalic',
  },
  dotsIcon: { width: 24, height: 24, resizeMode: 'contain', marginTop: 5 },

  fullSelectImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  menuPopup: {
    position: 'absolute',
    top: 30,
    right: 10,
    width: 165,
    height: 60,
  },
  menuText: { color: '#29A539', fontSize: 16, fontWeight: '500' },
  checkIconContainer: { marginLeft: 10 },
  checkIcon: { color: '#29A539', fontSize: 18, fontWeight: 'bold' },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E5FFE8',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 20,
  },
  headerText: {
    color: '#29A539',
    fontWeight: 'bold',
    fontSize: 14,
    paddingRight: 10,
  },
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
