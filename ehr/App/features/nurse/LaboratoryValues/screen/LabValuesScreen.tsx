import React, { useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import LabResultCard from '../components/LabResultCard';
import CDSSModal from '@components/CDSSModal';
import ADPIEScreen from '@components/ADPIEScreen';
import SweetAlert from '@components/SweetAlert';
import PatientSearchBar from '@components/PatientSearchBar';
import { useAppTheme } from '@App/theme/ThemeContext';
import { useLabValuesScreen } from './useLabValuesScreen';
import { LAB_TESTS, getTestPrefix } from './constants';

const alertIcon = require('@assets/icons/alert.png');

const LabValuesScreen = ({ onBack }: any) => {
  const { isDarkMode, theme, commonStyles } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, commonStyles, isDarkMode), [theme, commonStyles, isDarkMode]);
  const scrollViewRef = useRef<ScrollView>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const {
    searchText,
    selectedPatientId,
    scrollEnabled, setScrollEnabled,
    isNA, toggleNA,
    labId,
    isExistingRecord,
    selectedTestIndex, setSelectedTestIndex,
    result, setResult,
    normalRange, setNormalRange,
    backendAlerts,
    backendSeverities,
    isAdpieActive, setIsAdpieActive,
    showLabList, setShowLabList,
    passedAlert, setPassedAlert,
    alertConfig, setAlertConfig,
    showAlert,
    dataAlert,
    handlePatientSelect,
    handleCDSSPress,
    handleNextOrSave,
    generateFindingsSummary,
  } = useLabValuesScreen(onBack);

  const selectedTest = LAB_TESTS[selectedTestIndex];
  const prefix = getTestPrefix(selectedTest);
  const currentAlert = backendAlerts[`${prefix}_alert`] ?? null;
  const currentSeverity = backendSeverities[`${prefix}_severity`] ?? null;
  const isClinicalAlert = !!(currentAlert || (dataAlert && dataAlert.trim() !== ''));
  const hasInputData = result.trim() !== '' && normalRange.trim() !== '';

  const fadeColors = isDarkMode
    ? ['rgba(18, 18, 18, 0)', 'rgba(18, 18, 18, 0.8)', 'rgba(18, 18, 18, 1)']
    : ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 1)'];

  const headerFadeColors = isDarkMode
    ? ['rgba(18, 18, 18, 1)', 'rgba(18, 18, 18, 0)']
    : ['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0)'];

  if (isAdpieActive && labId && selectedPatientId) {
    return (
      <ADPIEScreen
        recordId={labId}
        patientName={searchText}
        feature="lab-values"
        findingsSummary={generateFindingsSummary()}
        initialAlert={passedAlert || undefined}
        onBack={() => {
          setIsAdpieActive(false);
          setPassedAlert(null);
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={{ zIndex: 10 }}>
        <View
          style={{
            paddingHorizontal: 40,
            backgroundColor: theme.background,
            paddingBottom: 15,
          }}
        >
          <View style={[styles.header, { marginBottom: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Laboratory Values</Text>
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowLabList(!showLabList)}>
              <Icon name="more-vert" size={35} color={theme.primary} />
            </TouchableOpacity>
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
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={scrollEnabled}
        >
          <View style={{ height: 20 }} />
          {showLabList && (
            <View style={styles.dropdownOverlay}>
              <ScrollView nestedScrollEnabled={true}>
                {LAB_TESTS.map((test, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedTestIndex(index);
                      setShowLabList(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{test}</Text>
                    {selectedTestIndex === index && (
                      <Icon name="check" size={16} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <PatientSearchBar
            initialPatientName={searchText}
            onPatientSelect={handlePatientSelect}
            onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
          />

          <TouchableOpacity
            style={[styles.naRow, !selectedPatientId && { opacity: 0.5 }]}
            onPress={() => {
              if (!selectedPatientId) {
                showAlert(
                  'Patient Required',
                  'Please select a patient first in the search bar.',
                );
              } else {
                toggleNA();
              }
            }}
          >
            <Text
              style={[
                styles.naText,
                !selectedPatientId && { color: theme.textMuted },
              ]}
            >
              Mark all as N/A
            </Text>
            <Icon
              name={isNA ? 'check-box' : 'check-box-outline-blank'}
              size={22}
              color={selectedPatientId ? theme.primary : theme.textMuted}
            />
          </TouchableOpacity>

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

          <LabResultCard
            testLabel={selectedTest}
            resultValue={result}
            rangeValue={normalRange}
            onResultChange={setResult}
            onRangeChange={setNormalRange}
            disabled={!selectedPatientId || isNA}
            onDisabledPress={() => {
              if (!selectedPatientId) {
                showAlert(
                  'Patient Required',
                  'Please select a patient first in the search bar.',
                );
              }
            }}
          />

          <View style={styles.footerRow}>
            <TouchableOpacity
              style={[
                styles.alertIcon,
                {
                  backgroundColor: !selectedPatientId
                    ? theme.alertBellDisabledBg
                    : isClinicalAlert
                    ? theme.alertBellOnBg
                    : theme.alertBellOffBg,
                  borderColor: !selectedPatientId
                    ? theme.border
                    : '#EDB62C',
                  opacity: !selectedPatientId ? 1 : isClinicalAlert ? 1 : 0.3,
                },
              ]}
              disabled={!selectedPatientId}
              onPress={() => setModalVisible(true)}
            >
              <Image
                source={alertIcon}
                style={[
                  styles.fullImg,
                  !selectedPatientId
                    ? { tintColor: theme.textMuted }
                    : isClinicalAlert
                    ? { tintColor: '#EDB62C' }
                    : { tintColor: '#EDB62C' },
                ]}
              />
            </TouchableOpacity>

            {selectedTestIndex === LAB_TESTS.length - 1 ? (
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[
                    styles.cdssBtn,
                    (!selectedPatientId || (!hasInputData && !isNA)) && {
                      backgroundColor: theme.buttonDisabledBg,
                      borderColor: theme.buttonDisabledBorder,
                    },
                  ]}
                  onPress={handleCDSSPress}
                  disabled={!selectedPatientId}
                >
                  <Text
                    style={[
                      styles.cdssText,
                      (!selectedPatientId || (!hasInputData && !isNA))
                        ? { color: theme.textMuted }
                        : { color: theme.primary },
                    ]}
                  >
                    CDSS
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    !selectedPatientId && {
                      backgroundColor: theme.buttonDisabledBg,
                      borderColor: theme.buttonDisabledBorder,
                    },
                  ]}
                  onPress={handleNextOrSave}
                  disabled={!selectedPatientId}
                >
                  <Text
                    style={[
                      styles.submitText,
                      !selectedPatientId && { color: theme.textMuted },
                    ]}
                  >
                    {isExistingRecord ? 'UPDATE' : 'SUBMIT'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.nextBtn,
                  !selectedPatientId && {
                    backgroundColor: theme.buttonDisabledBg,
                    borderColor: theme.buttonDisabledBorder,
                  },
                ]}
                onPress={async () => {
                  await handleNextOrSave();
                  scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                }}
                disabled={!selectedPatientId}
              >
                <Text
                  style={[
                    styles.nextText,
                    !selectedPatientId && { color: theme.textMuted },
                  ]}
                >
                  NEXT
                </Text>
                <Icon
                  name="chevron-right"
                  size={20}
                  color={selectedPatientId ? theme.primary : theme.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
        <LinearGradient
          colors={fadeColors}
          style={styles.fadeBottom}
          pointerEvents="none"
        />
      </View>

      <CDSSModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        alertText={currentAlert || 'No clinical findings found.'}
        severity={currentSeverity ?? undefined}
      />

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

const createStyles = (theme: any, commonStyles: any, isDarkMode: boolean) => StyleSheet.create({
  safeArea: commonStyles.safeArea,
  container: commonStyles.container,
  scrollContent: { paddingBottom: 40 },
  header: commonStyles.header,
  title: commonStyles.title,
  dateText: { fontSize: 13, fontFamily: 'AlteHaasGroteskBold', color: theme.textMuted },
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
    marginBottom: 15,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 90,
    right: 0,
    width: 220,
    maxHeight: 300,
    backgroundColor: theme.card,
    borderRadius: 15,
    zIndex: 1000,
    elevation: 5,
    borderWidth: 1,
    borderColor: theme.border,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  dropdownItemText: { fontSize: 13, color: theme.primary, fontWeight: '500' },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingBottom: 40,
  },
  buttonGroup: { flex: 1, flexDirection: 'row', marginLeft: 10 },
  alertIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  fullImg: { width: '80%', height: '80%', resizeMode: 'contain' },
  cdssBtn: {
    flex: 1,
    height: 50,
    backgroundColor: theme.buttonBg,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.buttonBorder,
    marginRight: 5,
  },
  submitBtn: {
    flex: 1,
    height: 50,
    backgroundColor: theme.buttonBg,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.buttonBorder,
    marginLeft: 5,
  },
  nextBtn: {
    flex: 1,
    marginLeft: 15,
    height: 52,
    backgroundColor: theme.buttonBg,
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.buttonBorder,
  },
  disabledButton: {
    backgroundColor: theme.card,
    borderColor: theme.border,
    opacity: 0.6,
  },
  cdssText: { color: theme.textMuted, fontWeight: 'bold' },
  submitText: { color: theme.primary, fontWeight: 'bold', fontSize: 13 },
  nextText: {
    color: theme.primary,
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 5,
  },
  fadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
});

export default LabValuesScreen;
