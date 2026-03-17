import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
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
import { LAB_TESTS, LAB_CATEGORIES, getTestPrefix } from './constants';
import { createStyles } from './styles';

const alertBellActiveIcon = require('@assets/icons/alert_bell_icon.png');
const alertBellInactiveIcon = require('@assets/icons/alert_bell_icon_inactive.png');

const LabValuesScreen = ({ onBack, readOnly = false, patientId, initialPatientName }: {
  onBack: any;
  readOnly?: boolean;
  patientId?: number;
  initialPatientName?: string;
}) => {
  const { isDarkMode, theme, commonStyles } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, commonStyles, isDarkMode), [theme, commonStyles, isDarkMode]);
  const scrollViewRef = useRef<ScrollView>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const bellFadeAnim = useRef(new Animated.Value(1)).current;

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
    isAlertLoading,
    isModified,
  } = useLabValuesScreen(onBack);

  useEffect(() => {
    if (readOnly && patientId) {
      handlePatientSelect(patientId, initialPatientName || '');
    }
  }, [readOnly, patientId]);

  const selectedTest = LAB_TESTS[selectedTestIndex];
  const prefix = getTestPrefix(selectedTest);
  const currentAlert = backendAlerts[`${prefix}_alert`] ?? null;
  const currentSeverity = backendSeverities[`${prefix}_severity`] ?? null;
  const isValidAlert = (v: string | null | undefined): v is string =>
    !!v &&
    !v.toLowerCase().includes('no findings') &&
    !v.toLowerCase().includes('no result') &&
    !v.toLowerCase().includes('no alert') &&
    v.toLowerCase() !== 'normal' &&
    v.trim() !== '';

  const isClinicalAlert = isValidAlert(currentAlert) || isValidAlert(dataAlert);
  const hasInputData = result.trim() !== '' || normalRange.trim() !== '';
  const isAlertActive = !!selectedPatientId && isClinicalAlert && hasInputData;

  useEffect(() => {
    bellFadeAnim.setValue(0.35);
    Animated.timing(bellFadeAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [bellFadeAnim, isAlertActive, selectedPatientId]);

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
              {readOnly && (
                <Text style={{ fontSize: 14, color: '#E8572A', fontFamily: 'AlteHaasGroteskBold', marginTop: 5 }}>
                  [READ ONLY]
                </Text>
              )}
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
                {LAB_CATEGORIES.map((category, catIndex) => (
                  <View key={catIndex}>
                    <View style={styles.categoryHeader}>
                      <Text style={styles.categoryHeaderText}>
                        {category.title}
                      </Text>
                    </View>
                    {category.tests.map(test => {
                      const globalIndex = LAB_TESTS.indexOf(test);
                      return (
                        <TouchableOpacity
                          key={globalIndex}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setSelectedTestIndex(globalIndex);
                            setShowLabList(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{test}</Text>
                          {selectedTestIndex === globalIndex && (
                            <Icon name="check" size={16} color={theme.primary} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {!readOnly ? (
            <PatientSearchBar
              initialPatientName={searchText}
              onPatientSelect={handlePatientSelect}
              onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
            />
          ) : (
            <View style={styles.staticPatientContainer}>
              <Text style={styles.staticPatientLabel}>PATIENT:</Text>
              <Text style={styles.staticPatientName}>{initialPatientName || 'Unknown Patient'}</Text>
            </View>
          )}

          {!readOnly && (
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

          <LabResultCard
            testLabel={selectedTest}
            resultValue={result}
            rangeValue={normalRange}
            onResultChange={setResult}
            onRangeChange={setNormalRange}
            disabled={!selectedPatientId || isNA || readOnly}
            onDisabledPress={() => {
              if (!selectedPatientId) {
                showAlert(
                  'Patient Required',
                  'Please select a patient first in the search bar.',
                );
              }
            }}
          />

          {!readOnly ? (
            <View style={styles.footerRow}>
              <Animated.View style={{ opacity: bellFadeAnim }}>
                <TouchableOpacity
                  style={styles.alertIcon}
                  disabled={!selectedPatientId}
                  onPress={() => setModalVisible(true)}
                >
                  <Image
                    source={
                      isAlertActive
                        ? alertBellActiveIcon
                        : alertBellInactiveIcon
                    }
                    style={styles.fullImg}
                  />
                </TouchableOpacity>
              </Animated.View>

              {selectedTestIndex === LAB_TESTS.length - 1 ? (
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={[
                      styles.cdssBtn,
                      !isModified && {
                        backgroundColor: theme.buttonDisabledBg,
                        borderColor: theme.buttonDisabledBorder,
                      },
                    ]}
                    onPress={handleCDSSPress}
                    disabled={!isModified}
                  >
                    <Text
                      style={[
                        styles.cdssText,
                        !isModified
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
                      !isModified && {
                        backgroundColor: theme.buttonDisabledBg,
                        borderColor: theme.buttonDisabledBorder,
                      },
                    ]}
                    onPress={handleNextOrSave}
                    disabled={!isModified}
                  >
                    <Text
                      style={[
                        styles.submitText,
                        !isModified && { color: theme.textMuted },
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
                    !isModified && {
                      backgroundColor: theme.buttonDisabledBg,
                      borderColor: theme.buttonDisabledBorder,
                    },
                  ]}
                  onPress={async () => {
                    await handleNextOrSave();
                    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                  }}
                  disabled={!isModified}
                >
                  <Text
                    style={[
                      styles.nextText,
                      !isModified && { color: theme.textMuted },
                    ]}
                  >
                    NEXT
                  </Text>
                  <Icon
                    name="chevron-right"
                    size={20}
                    color={isModified ? theme.primary : theme.textMuted}
                  />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.submitBtn, { marginTop: 10 }]}
              onPress={onBack}
            >
              <Text style={[styles.submitText, { color: theme.primary }]}>CLOSE</Text>
            </TouchableOpacity>
          )}
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
        loading={isAlertLoading}
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

export default LabValuesScreen;
