import React, { useEffect, useState, useCallback } from 'react';
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
  TouchableOpacity,
  BackHandler,
} from 'react-native';

import PatientRow from '../component/PatientRow';
import Button from '../../../components/button';
import SweetAlert from '../../../components/SweetAlert';
import { useDemographicLogic } from '../hook/useDemographicLogic';
import PatientDetailsScreen from '../../PatientDetails/screen/PatientDetailScreen';

interface Patient {
  patient_id: number;
  first_name: string;
  last_name: string;
  is_active: number | boolean;
}

interface ProfileProps {
  onBack: () => void;
  onSelectionChange: (isSelecting: boolean) => void;
  onPatientClick?: (patientId: number) => void;
}

const activeIcon = require('../../../../assets/icons/active_icon.png');
const inactiveIcon = require('../../../../assets/icons/inactive_icon.png');
const dotsIcon = require('../../../../assets/icons/dots_icon.png');
const selectImage = require('../../../../assets/icons/select_icon.png');
const backArrow = require('../../../../assets/icons/back_arrow.png');

const DemographicProfileScreen: React.FC<ProfileProps> = ({
  onBack,
  onSelectionChange,
  onPatientClick,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const [showSelectMenu, setShowSelectMenu] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null,
  );

  const {
    patients,
    isLoading,
    isRefreshing,
    selectedIds,
    isSelectionMode,
    loadPatients,
    toggleSelection,
    clearSelection,
    updateStatus,
    alertConfig,
    closeAlert,
  } = useDemographicLogic(onSelectionChange);

  const typedPatients = patients as Patient[];

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleBackPress = useCallback(() => {
    if (selectedPatientId) {
      setSelectedPatientId(null);
      return true;
    }
    if (isSelectionMode) {
      clearSelection();
      return true;
    }
    if (showSelectMenu) {
      setShowSelectMenu(false);
      return true;
    }
    onBack();
    return true;
  }, [selectedPatientId, isSelectionMode, showSelectMenu, clearSelection, onBack]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    return () => backHandler.remove();
  }, [handleBackPress]);

  const enterSelectionMode = () => {
    setShowSelectMenu(false);
    if (typedPatients.length > 0) {
      toggleSelection(typedPatients[0].patient_id);
    }
  };

  const handlePatientClick = (patientId: number) => {
    setSelectedPatientId(patientId);
  };

  if (selectedPatientId) {
    return (
      <PatientDetailsScreen 
        patientId={selectedPatientId} 
        onBack={() => setSelectedPatientId(null)} 
        onEdit={(id) => {
          setSelectedPatientId(null);
          onPatientClick && onPatientClick(id);
        }}
      />
    );
  }


  return (
    <View style={styles.root}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* MAIN CONTENT */}
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
            </View>
          </View>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text
              style={[styles.headerText, { flex: 0.15, textAlign: 'center' }]}
            >
              ID
            </Text>
            <Text style={[styles.headerText, { flex: 0.55, paddingLeft: 20 }]}>
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
              renderItem={({ item }) => (
                <PatientRow
                  item={{
                    ...item,
                    name: `${item.last_name}, ${item.first_name}`,
                    id: item.patient_id,
                    isActive:
                      typeof item.is_active === 'number'
                        ? item.is_active === 1
                        : Boolean(item.is_active ?? true),
                  }}
                  isSelected={selectedIds.has(item.patient_id)}
                  isSelectionMode={isSelectionMode}
                  onPress={() =>
                    isSelectionMode
                      ? toggleSelection(item.patient_id)
                      : handlePatientClick(item.patient_id)
                  }
                  onLongPress={() => toggleSelection(item.patient_id)}
                  onEdit={(id) => onPatientClick && onPatientClick(id)}
                />
              )}
            />
          )}

          {/* Persistent Action Footer */}
          <View
            style={[styles.actionFooter, !isSelectionMode && { opacity: 0.5 }]}
          >
            <TouchableOpacity
              style={styles.footerItem}
              onPress={() => isSelectionMode && updateStatus(true)}
              disabled={!isSelectionMode}
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
              onPress={() => isSelectionMode && updateStatus(false)}
              disabled={!isSelectionMode}
            >
              <View
                style={[styles.statusCircle, { backgroundColor: '#FFEBEE' }]}
              >
                <Image source={inactiveIcon} style={styles.footerIcon} />
              </View>
              <Text style={styles.footerText}>Inactive</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* OVERLAY LAYER - Kept outside SafeAreaView to manage Z-index easily */}
      {showSelectMenu && (
        <>
          <TouchableOpacity
            style={styles.darkOverlay}
            activeOpacity={1}
            onPress={() => setShowSelectMenu(false)}
          />
          <TouchableOpacity
            style={styles.menuPopup}
            onPress={enterSelectionMode}
          >
            <Image source={selectImage} style={styles.fullSelectImage} />
          </TouchableOpacity>
        </>
      )}

      {/* Alert Modal */}
      <SweetAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={closeAlert}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF' },

  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },

  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },

  container: { flex: 1, paddingHorizontal: 8, marginTop: -5 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 50,
    paddingHorizontal: 20,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  backBtn: {
    marginTop: 12,
    marginRight: 10,
  },

  backIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },

  headerActions: {
    alignItems: 'flex-end',
    marginTop: 10,
  },

  title: {
    fontSize: 35,
    color: '#035022',
    fontFamily: 'MinionPro-SemiboldItalic',
  },

  dotsIcon: { width: 24, height: 24, resizeMode: 'contain', marginTop: 5 },

  menuPopup: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 90,
    right: 45,
    width: 165,
    height: 60,
    zIndex: 20,
    elevation: 10,
  },

  fullSelectImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E5FFE8',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 20,
  },

  headerText: {
    color: '#29A539',
    fontFamily: 'AlteHaasGroteskBold',
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
