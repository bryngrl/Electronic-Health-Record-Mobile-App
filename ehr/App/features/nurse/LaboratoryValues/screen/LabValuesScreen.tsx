import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
  Modal,
  Pressable,
  BackHandler,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import LabResultCard from '../components/LabResultCard';
import CDSSModal from '@components/CDSSModal';
import ADPIEScreen from '@components/ADPIEScreen';
import SweetAlert from '@components/SweetAlert';
import PatientSearchBar from '@components/PatientSearchBar';
import LoadingOverlay from '@components/LoadingOverlay';
import { useAppTheme } from '@App/theme/ThemeContext';
import { useLabValuesScreen } from './useLabValuesScreen';
import { LAB_TESTS, LAB_CATEGORIES, getTestPrefix } from './constants';
import { createStyles } from './styles';
import {
  createDotsSettingsModalStyle,
  blurProps,
} from '../../styles/DotsSettingsModalStyle';

const alertBellActiveIcon = require('@assets/icons/alert_bell_icon.png');
const alertBellInactiveIcon = require('@assets/icons/alert_bell_icon_inactive.png');
const dotsIcon = require('@assets/icons/dots_icon.png');

const LabValuesScreen = ({
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
  const dotsModalStyles = useMemo(
    () => createDotsSettingsModalStyle(theme),
    [theme],
  );
  const scrollViewRef = useRef<ScrollView>(null);
  const bellFadeAnim = useRef(new Animated.Value(1)).current;

  const {
    searchText,
    selectedPatientId,
    scrollEnabled,
    setScrollEnabled,
    isNA,
    toggleNA,
    labId,
    isExistingRecord,
    selectedTestIndex,
    setSelectedTestIndex,
    result,
    setResult,
    normalRange,
    setNormalRange,
    backendAlerts,
    backendSeverities,
    isAdpieActive,
    setIsAdpieActive,
    showLabList,
    setShowLabList,
    passedAlert,
    setPassedAlert,
    alertConfig,
    setAlertConfig,
    showAlert,
    dataAlert,
    modalVisible,
    setModalVisible,
    handlePatientSelect,
    handleCDSSPress,
    handleNextOrSave,
    generateFindingsSummary,
    isAlertLoading,
    isModified,
    isDataEntered,
    isLoading,
    loadingMessage,
    screenOpacity,
  } = useLabValuesScreen(onBack, readOnly);

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
    !v.toLowerCase().includes('n/a') &&
    v.toLowerCase() !== 'normal' &&
    v.trim() !== '';

  // Check if current inputs are N/A or empty
  const isResultNA = result.trim().toLowerCase() === 'n/a' || result.trim() === '';
  const isRangeNA = normalRange.trim().toLowerCase() === 'n/a' || normalRange.trim() === '';
  const inputsAreNA = isResultNA && isRangeNA;

  const isClinicalAlert = !inputsAreNA && (isValidAlert(currentAlert) || isValidAlert(dataAlert));
  const hasInputData = result.trim() !== '' || normalRange.trim() !== '';
  const isAlertActive = !!selectedPatientId && isClinicalAlert && hasInputData && !inputsAreNA;

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
    : [
        'rgba(255, 255, 255, 0)',
        'rgba(255, 255, 255, 0.8)',
        'rgba(255, 255, 255, 1)',
      ];

  const headerFadeColors = isDarkMode
    ? ['rgba(18, 18, 18, 1)', 'rgba(18, 18, 18, 0)']
    : ['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0)'];

  const handleBackPress = useCallback(() => {
    if (isAdpieActive) {
      setIsAdpieActive(false);
      setPassedAlert(null);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return true;
    }
    if (showLabList) {
      setShowLabList(false);
      return true;
    }
    if (selectedTestIndex > 0) {
      setSelectedTestIndex(selectedTestIndex - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return true;
    }
    onBack();
    return true;
  }, [
    isAdpieActive,
    showLabList,
    selectedTestIndex,
    onBack,
    setPassedAlert,
    setShowLabList,
    setSelectedTestIndex,
  ]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    return () => backHandler.remove();
  }, [handleBackPress]);

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
      <LoadingOverlay visible={isLoading} message={loadingMessage} />
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
      />
      <Animated.View style={{ flex: 1, opacity: screenOpacity }}>
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
              <TouchableOpacity onPress={() => setShowLabList(!showLabList)}>
                <Image source={dotsIcon} style={styles.dotsIcon} />
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
            <Modal
              transparent
              visible={showLabList}
              animationType="fade"
              statusBarTranslucent
            >
              <Pressable
                style={dotsModalStyles.modalOverlay}
                onPress={() => setShowLabList(false)}
              >
                <BlurView style={dotsModalStyles.blurView} {...blurProps} />
                <Pressable
                  style={dotsModalStyles.menuContainer}
                  onPress={e => e.stopPropagation()}
                >
                  <Text style={dotsModalStyles.menuTitle}>
                    SELECT LABORATORY
                  </Text>
                  <ScrollView showsVerticalScrollIndicator={false}>
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
                              style={dotsModalStyles.menuItem}
                              onPress={() => {
                                setSelectedTestIndex(globalIndex);
                                setShowLabList(false);
                              }}
                            >
                              <Text
                                style={[
                                  dotsModalStyles.menuItemText,
                                  selectedTestIndex === globalIndex &&
                                    dotsModalStyles.activeMenuText,
                                ]}
                              >
                                {test}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ))}
                  </ScrollView>
                  <TouchableOpacity
                    style={dotsModalStyles.closeMenuBtn}
                    onPress={() => setShowLabList(false)}
                  >
                    <Icon name="close" size={20} color={theme.primary} />
                  </TouchableOpacity>
                </Pressable>
              </Pressable>
            </Modal>

            {!readOnly ? (
              <PatientSearchBar
                initialPatientName={searchText}
                onPatientSelect={handlePatientSelect}
                onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
              />
            ) : (
              <View style={styles.staticPatientContainer}>
                <Text style={styles.staticPatientLabel}>PATIENT:</Text>
                <Text style={styles.staticPatientName}>
                  {initialPatientName || 'Unknown Patient'}
                </Text>
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
                if (!selectedPatientId && !readOnly) {
                  showAlert(
                    'Patient Required',
                    'Please select a patient first in the search bar.',
                  );
                }
              }}
            />

            {!readOnly ? (
              <View style={styles.footerRow}>
                <TouchableOpacity
                  style={[
                    styles.backBtn,
                    selectedTestIndex === 0 && {
                      backgroundColor: theme.buttonDisabledBg,
                      borderColor: theme.buttonDisabledBorder,
                    },
                  ]}
                  onPress={handleBackPress}
                  disabled={isLoading || selectedTestIndex === 0}
                >
                  <Icon
                    name="arrow-back"
                    size={24}
                    color={
                      selectedTestIndex === 0 ? theme.textMuted : theme.primary
                    }
                  />
                </TouchableOpacity>

                {selectedTestIndex === LAB_TESTS.length - 1 ? (
                  <View style={styles.buttonGroup}>
                    <TouchableOpacity
                      style={[
                        styles.cdssBtn,
                        !isDataEntered && {
                          backgroundColor: theme.buttonDisabledBg,
                          borderColor: theme.buttonDisabledBorder,
                        },
                      ]}
                      onPress={handleCDSSPress}
                      disabled={!isDataEntered}
                    >
                      <Text
                        style={[
                          styles.cdssText,
                          !isDataEntered
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
                        !isModified &&
                          !isDataEntered && {
                            backgroundColor: theme.buttonDisabledBg,
                            borderColor: theme.buttonDisabledBorder,
                          },
                      ]}
                      onPress={handleNextOrSave}
                      disabled={!isModified && !isDataEntered}
                    >
                      <Text
                        style={[
                          styles.submitText,
                          !isModified &&
                            !isDataEntered && { color: theme.textMuted },
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
                      !isModified &&
                        !isDataEntered && {
                          backgroundColor: theme.buttonDisabledBg,
                          borderColor: theme.buttonDisabledBorder,
                        },
                    ]}
                    onPress={async () => {
                      await handleNextOrSave();
                      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                    }}
                    disabled={!isModified && !isDataEntered}
                  >
                    <Text
                      style={[
                        styles.nextText,
                        !isModified &&
                          !isDataEntered && { color: theme.textMuted },
                      ]}
                    >
                      NEXT
                    </Text>
                    <Icon
                      name="chevron-right"
                      size={20}
                      color={
                        isModified || isDataEntered
                          ? theme.primary
                          : theme.textMuted
                      }
                    />
                  </TouchableOpacity>
                )}

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
              </View>
            ) : (
              <View>
                <View style={[styles.footerRow, { marginTop: 10 }]}>
                  <TouchableOpacity
                    style={[
                      styles.backBtn,
                      selectedTestIndex === 0 && {
                        backgroundColor: theme.buttonDisabledBg,
                        borderColor: theme.buttonDisabledBorder,
                      },
                    ]}
                    onPress={onBack}
                    disabled={isLoading || selectedTestIndex === 0}
                  >
                    <Icon
                      name="arrow-back"
                      size={24}
                      color={
                        selectedTestIndex === 0
                          ? theme.textMuted
                          : theme.primary
                      }
                    />
                  </TouchableOpacity>

                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      gap: 10,
                      marginHorizontal: 10,
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.nextBtn,
                        { marginHorizontal: 0 },
                        selectedTestIndex === 0 && {
                          backgroundColor: theme.buttonDisabledBg,
                          borderColor: theme.buttonDisabledBorder,
                        },
                      ]}
                      onPress={() => {
                        if (selectedTestIndex > 0) {
                          setSelectedTestIndex(prev => prev - 1);
                          scrollViewRef.current?.scrollTo({
                            y: 0,
                            animated: true,
                          });
                        }
                      }}
                      disabled={selectedTestIndex === 0}
                    >
                      <Icon
                        name="chevron-left"
                        size={20}
                        color={
                          selectedTestIndex > 0
                            ? theme.primary
                            : theme.textMuted
                        }
                      />
                      <Text
                        style={[
                          styles.nextText,
                          selectedTestIndex === 0 && { color: theme.textMuted },
                        ]}
                      >
                        PREV
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.nextBtn,
                        { marginHorizontal: 0 },
                        selectedTestIndex === LAB_TESTS.length - 1 && {
                          backgroundColor: theme.buttonDisabledBg,
                          borderColor: theme.buttonDisabledBorder,
                        },
                      ]}
                      onPress={() => {
                        if (selectedTestIndex < LAB_TESTS.length - 1) {
                          setSelectedTestIndex(prev => prev + 1);
                          scrollViewRef.current?.scrollTo({
                            y: 0,
                            animated: true,
                          });
                        }
                      }}
                      disabled={selectedTestIndex === LAB_TESTS.length - 1}
                    >
                      <Text
                        style={[
                          styles.nextText,
                          selectedTestIndex === LAB_TESTS.length - 1 && {
                            color: theme.textMuted,
                          },
                        ]}
                      >
                        NEXT
                      </Text>
                      <Icon
                        name="chevron-right"
                        size={20}
                        color={
                          selectedTestIndex < LAB_TESTS.length - 1
                            ? theme.primary
                            : theme.textMuted
                        }
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={{ width: 50 }} />
                </View>
                <TouchableOpacity
                  style={[styles.submitBtn, { marginTop: 10, marginLeft: 0 }]}
                  onPress={onBack}
                >
                  <Text style={[styles.submitText, { color: theme.primary }]}>
                    CLOSE
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
          <LinearGradient
            colors={fadeColors}
            style={styles.fadeBottom}
            pointerEvents="none"
          />
        </View>
      </Animated.View>

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
