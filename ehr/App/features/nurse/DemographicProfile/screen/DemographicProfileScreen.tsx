import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
import Button from '@components/button';
import SweetAlert from '@components/SweetAlert';
import { useDemographicLogic } from '../hook/useDemographicLogic';
import PatientDetailsScreen from '@nurse/PatientDetails/screen/PatientDetailScreen';
import { useAppTheme } from '@App/theme/ThemeContext';

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
  onEdit?: (patientId: number) => void;
}

const activeIcon = require('@assets/icons/active_icon.png');
const inactiveIcon = require('@assets/icons/inactive_icon.png');
const dotsIcon = require('@assets/icons/dots_icon.png');
const selectImage = require('@assets/icons/select_icon.png');
const backArrow = require('@assets/icons/back_arrow.png');

const DemographicProfileScreen: React.FC<ProfileProps> = ({
  onBack,
  onSelectionChange,
  onPatientClick,
  onEdit,
}) => {
  const { isDarkMode, theme, commonStyles } = useAppTheme();
  const styles = useMemo(
    () => createStyles(theme, commonStyles),
    [theme, commonStyles],
  );

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
  }, [
    selectedPatientId,
    isSelectionMode,
    showSelectMenu,
    clearSelection,
    onBack,
  ]);

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
    const selectedPatient = typedPatients.find(p => (p.patient_id || (p as any).id) === selectedPatientId);
    return (
      <PatientDetailsScreen
        patientId={selectedPatientId}
        patientData={selectedPatient}
        onBack={() => setSelectedPatientId(null)}
        onEdit={id => {
          setSelectedPatientId(null);
          onPatientClick && onPatientClick(id);
        }}
      />
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
      />
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
                  <Image
                    source={dotsIcon}
                    style={styles.dotsIcon}
                  />
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
              color={theme.secondary}
              style={{ marginTop: 50 }}
            />
          ) : (
            <FlatList
              data={typedPatients}
              keyExtractor={item => (item.patient_id || (item as any).id).toString()}
              contentContainerStyle={{ paddingBottom: 100 }}
              renderItem={({ item }) => {
                const pId = item.patient_id || (item as any).id;
                return (
                  <PatientRow
                    item={{
                      ...item,
                      name: `${item.last_name}, ${item.first_name}`,
                      id: pId,
                      isActive:
                        typeof item.is_active === 'number'
                          ? item.is_active === 1
                          : (item.is_active === true || item.is_active === 'true' || item.is_active === '1'),
                    }}
                    isSelected={selectedIds.has(pId)}
                    isSelectionMode={isSelectionMode}
                    onPress={() =>
                      isSelectionMode
                        ? toggleSelection(pId)
                        : handlePatientClick(pId)
                    }
                    onLongPress={() => toggleSelection(pId)}
                    onEdit={id => onEdit && onEdit(id)}
                  />
                );
              }}
            />
          )}

          {/* Persistent Action Footer */}
          {isSelectionMode && (
            <View style={styles.actionFooter}>
              <TouchableOpacity
                style={styles.footerItem}
                onPress={() => updateStatus(true)}
              >
                <View
                  style={[
                    styles.statusCircle,
                    { backgroundColor: isDarkMode ? '#064E3B' : '#E8F5E9' },
                  ]}
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
                  style={[
                    styles.statusCircle,
                    { backgroundColor: isDarkMode ? '#7F1D1D' : '#FFEBEE' },
                  ]}
                >
                  <Image source={inactiveIcon} style={styles.footerIcon} />
                </View>
                <Text style={styles.footerText}>Inactive</Text>
              </TouchableOpacity>
            </View>
          )}
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

const createStyles = (theme: any, commonStyles: any) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background },

    darkOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.overlay,
      zIndex: 10,
    },

    safeArea: commonStyles.safeArea,

    container: commonStyles.container,

    header: commonStyles.header,

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

    title: commonStyles.title,

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

    tableHeader: commonStyles.tableHeader,

    headerText: {
      color: theme.secondary,
      fontFamily: 'AlteHaasGroteskBold',
      fontSize: 14,
      paddingRight: 10,
    },

    actionFooter: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 20,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.card,
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
    footerText: { color: theme.primary, fontSize: 15, fontWeight: '500' },
  });

export default DemographicProfileScreen;
