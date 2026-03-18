import React, { useMemo, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppTheme } from '@App/theme/ThemeContext';
import PatientSearchBar from '@App/components/PatientSearchBar';
import ADPIEScreen from '@App/components/ADPIEScreen';
import SweetAlert from '@App/components/SweetAlert';
import LoadingOverlay from '@App/components/LoadingOverlay';
import { useADLScreen } from './useADLScreen';
import ADLCardsSection from './ADLCardsSection';

const ADLScreen = ({
  onBack,
  readOnly = false,
  patientId,
  initialPatientName,
  admissionDate,
}: {
  onBack: any;
  readOnly?: boolean;
  patientId?: number;
  initialPatientName?: string;
  admissionDate?: string;
}) => {
  const { isDarkMode, theme, commonStyles } = useAppTheme();
  const styles = useMemo(
    () => createStyles(theme, commonStyles, isDarkMode),
    [theme, commonStyles, isDarkMode],
  );
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    searchText,
    setSearchText,
    selectedPatient,
    setSelectedPatient,
    scrollEnabled,
    setScrollEnabled,
    alertConfig,
    setAlertConfig,
    showAlert,
    adlId,
    isExistingRecord,
    isAdpieActive,
    setIsAdpieActive,
    formData,
    isNA,
    getBackendAlert,
    getBackendSeverity,
    toggleNA,
    updateField,
    handleCDSSPress,
    handleSave,
    generateFindingsSummary,
    isDataEntered,
    calculateDayNumber,
    isModified,
    isLoading,
    loadingMessage,
    screenOpacity,
  } = useADLScreen(onBack);

  useEffect(() => {
    if (readOnly && patientId) {
      setSelectedPatient({
        id: patientId,
        full_name: initialPatientName || '',
      });
      setSearchText(initialPatientName || '');
    }
  }, [readOnly, patientId]);

  if (isAdpieActive && adlId && selectedPatient) {
    return (
      <ADPIEScreen
        recordId={adlId}
        patientName={searchText}
        feature="adl"
        findingsSummary={generateFindingsSummary()}
        onBack={() => {
          setIsAdpieActive(false);
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }}
      />
    );
  }

  const fadeColors = isDarkMode
    ? ['rgba(18,18,18,0)', 'rgba(18,18,18,0.8)', 'rgba(18,18,18,1)']
    : ['rgba(255,255,255,0)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,1)'];

  const headerFadeColors = isDarkMode
    ? ['rgba(18,18,18,1)', 'rgba(18,18,18,0)']
    : ['rgba(255,255,255,1)', 'rgba(255,255,255,0)'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <LoadingOverlay visible={isLoading} message={loadingMessage} />
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
      />

      <Animated.View style={{ flex: 1, opacity: screenOpacity }}>
        <View style={{ zIndex: 10 }}>
          <View style={styles.headerContainer}>
            <View style={commonStyles.header}>
              <View style={{ flex: 1 }}>
                <Text style={commonStyles.title}>
                  Activities of Daily Living
                </Text>
                <Text style={styles.dateText}>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
                {readOnly && (
                  <Text
                    style={{
                      fontSize: 14,
                      color: '#E8572A',
                      fontFamily: 'AlteHaasGroteskBold',
                      marginTop: 5,
                    }}
                  >
                    [READ ONLY]
                  </Text>
                )}
              </View>
            </View>
          </View>
          <LinearGradient
            colors={headerFadeColors}
            style={{ height: 20 }}
            pointerEvents="none"
          />
        </View>

        <View style={{ flex: 1, marginTop: -20 }}>
          <ScrollView
            ref={scrollViewRef}
            keyboardShouldPersistTaps="handled"
            style={styles.container}
            showsVerticalScrollIndicator={false}
            scrollEnabled={scrollEnabled}
          >
            <View style={{ height: 20 }} />
            {!readOnly ? (
              <PatientSearchBar
                onPatientSelect={(id, name, patientObj) => {
                  setSearchText(name);
                  setSelectedPatient(patientObj);
                }}
                onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
                initialPatientName={searchText}
              />
            ) : (
              <View style={styles.staticPatientContainer}>
                <Text style={styles.staticPatientLabel}>PATIENT:</Text>
                <Text style={styles.staticPatientName}>
                  {initialPatientName || 'Unknown Patient'}
                </Text>
              </View>
            )}

            <View style={styles.section}>
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.sectionLabel}>DATE :</Text>
                  <View style={styles.inputBox}>
                    <Text style={styles.inputText}>
                      {new Date().toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionLabel}>DAY NO. :</Text>
                  <View style={styles.inputBox}>
                    <Text style={styles.inputText}>{calculateDayNumber()}</Text>
                    <Icon
                      name="arrow-drop-down"
                      size={24}
                      color={theme.textMuted}
                      style={{ position: 'absolute', right: 10 }}
                    />
                  </View>
                </View>
              </View>
            </View>

            {!readOnly && (
              <TouchableOpacity
                style={[styles.naRow, !selectedPatient && { opacity: 0.5 }]}
                onPress={() =>
                  !selectedPatient
                    ? showAlert(
                        'Patient Required',
                        'Please select a patient first in the search bar.',
                      )
                    : toggleNA()
                }
              >
                <Text
                  style={[
                    styles.naText,
                    !selectedPatient && { color: theme.textMuted },
                  ]}
                >
                  Mark all as N/A
                </Text>
                <Icon
                  name={isNA ? 'check-box' : 'check-box-outline-blank'}
                  size={22}
                  color={selectedPatient ? theme.primary : theme.textMuted}
                />
              </TouchableOpacity>
            )}

            {!readOnly && (
              <Text
                style={[
                  styles.disabledTextAtBottom,
                  isNA && { color: theme.error },
                ]}
              >
                {isNA
                  ? 'All fields below are disabled.'
                  : 'Checking this will disable all fields below.'}
              </Text>
            )}

            <ADLCardsSection
              formData={formData}
              selectedPatient={selectedPatient}
              isNA={isNA}
              getBackendAlert={getBackendAlert}
              getBackendSeverity={getBackendSeverity}
              updateField={updateField}
              showAlert={showAlert}
              styles={styles}
              theme={theme}
              handleCDSSPress={handleCDSSPress}
              handleSave={handleSave}
              isDataEntered={isDataEntered}
              isModified={isModified}
              adlId={adlId}
              isExistingRecord={isExistingRecord}
              readOnly={readOnly}
              onBack={onBack}
            />
          </ScrollView>
          <LinearGradient
            colors={fadeColors}
            style={styles.fadeBottom}
            pointerEvents="none"
          />
        </View>
      </Animated.View>

      <SweetAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={() => setAlertConfig({ ...alertConfig, visible: false })}
        confirmText="OK"
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: any, commonStyles: any, isDarkMode: boolean) =>
  StyleSheet.create({
    headerContainer: {
      paddingHorizontal: 40,
      backgroundColor: theme.background,
      paddingBottom: 15,
    },
    inputBox: {
      height: 48,
      borderRadius: 25,
      borderWidth: 1.5,
      borderColor: theme.border,
      paddingHorizontal: 20,
      justifyContent: 'center',
      backgroundColor: theme.card,
      marginBottom: 15,
    },
    inputText: {
      fontSize: 14,
      color: theme.text,
      fontFamily: 'AlteHaasGrotesk',
    },
    row: { flexDirection: 'row', marginTop: 5 },
    safeArea: commonStyles.safeArea,
    container: commonStyles.container,
    dateText: {
      fontSize: 13,
      fontFamily: 'AlteHaasGroteskBold',
      color: theme.textMuted,
    },
    section: { marginBottom: 15, zIndex: 10 },
    sectionLabel: {
      fontSize: 14,
      fontFamily: 'AlteHaasGroteskBold',
      color: theme.primary,
      marginBottom: 8,
    },
    naRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginBottom: 5,
      marginTop: 5,
    },
    naText: {
      fontSize: 14,
      fontFamily: 'AlteHaasGroteskBold',
      color: theme.primary,
      marginRight: 8,
    },
    disabledTextAtBottom: {
      fontSize: 13,
      fontFamily: 'AlteHaasGroteskBold',
      color: theme.textMuted,
      textAlign: 'right',
      marginBottom: 25,
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
      paddingBottom: 40,
    },
    cdssBtn: {
      flex: 1,
      backgroundColor: theme.buttonBg,
      paddingVertical: 15,
      borderRadius: 25,
      alignItems: 'center',
      marginHorizontal: 5,
      borderWidth: 1.5,
      borderColor: theme.buttonBorder,
    },
    submitBtn: {
      flex: 1,
      backgroundColor: theme.buttonBg,
      paddingVertical: 15,
      borderRadius: 25,
      alignItems: 'center',
      marginHorizontal: 5,
      borderWidth: 1.5,
      borderColor: theme.buttonBorder,
    },
    cdssText: {
      color: theme.primary,
      fontFamily: 'AlteHaasGroteskBold',
      fontSize: 16,
    },
    submitText: {
      color: theme.primary,
      fontFamily: 'AlteHaasGroteskBold',
      fontSize: 16,
    },
    fadeBottom: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
    },
    staticPatientContainer: {
      marginBottom: 20,
      backgroundColor: theme.card,
      padding: 15,
      borderRadius: 15,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    staticPatientLabel: {
      fontFamily: 'AlteHaasGroteskBold',
      color: theme.primary,
      fontSize: 12,
      marginRight: 10,
    },
    staticPatientName: {
      fontFamily: 'AlteHaasGrotesk',
      color: theme.text,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

export default ADLScreen;
