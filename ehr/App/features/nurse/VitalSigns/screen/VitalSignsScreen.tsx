import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  FlatList,
  Image,
  Dimensions,
  BackHandler,
  Animated,
  Pressable,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import {
  createDotsSettingsModalStyle,
  blurProps,
} from '../../styles/DotsSettingsModalStyle';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import VitalCard from '@nurse/VitalSigns/component/VitalCard';
import PreciseVitalChart from '@nurse/VitalSigns/component/VitalSignsChart';
import {
  useVitalSignsLogic,
  convertTo24h,
} from '@nurse/VitalSigns/hook/useVitalSignsLogic';
import SweetAlert from '@components/SweetAlert';
import CDSSModal from '@components/CDSSModal';
import ADPIEScreen from '@components/ADPIEScreen';
import PatientSearchBar from '@components/PatientSearchBar';
import LoadingOverlay from '@components/LoadingOverlay';
import { useAppTheme } from '@App/theme/ThemeContext';

const dotsIcon = require('@assets/icons/dots_icon.png');

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.72;
const ITEM_SPACING = 15;
const SNAP_INTERVAL = ITEM_WIDTH + ITEM_SPACING;

const alertBellActiveIcon = require('@assets/icons/alert_bell_icon.png');
const alertBellInactiveIcon = require('@assets/icons/alert_bell_icon_inactive.png');
const arrowIcon = require('@assets/icons/ARROW.png');
const backArrow = require('@assets/icons/back_arrow.png');
const nextArrow = require('@assets/icons/next_arrow.png');

interface VitalSignsScreenProps {
  onBack: () => void;
  readOnly?: boolean;
  patientId?: number;
  initialPatientName?: string;
  admissionDate?: string;
}

const VitalSignsScreen: React.FC<VitalSignsScreenProps> = ({
  onBack,
  readOnly = false,
  patientId,
  initialPatientName,
  admissionDate,
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

  const {
    vitals,
    handleUpdateVital,
    patientName,
    selectedPatientId,
    setSelectedPatient,
    currentTime,
    currentTimeIndex,
    vitalKeys,
    chartData,
    handleNextTime,
    handlePrevTime,
    selectTime,
    TIME_SLOTS,
    isDataEntered,
    currentAlert,
    backendSeverity,
    realtimeAlert,
    realtimeSeverity,
    setRealtimeAlert,
    setRealtimeSeverity,
    analyzeField,
    dataAlert,
    saveAssessment,
    saveAllAssessments,
    isMenuVisible,
    setIsMenuVisible,
    reset,
    isExistingRecord,
    setIsExistingRecord,
    isModified,
    dayNo,
  } = useVitalSignsLogic();

  const [chartIndex, setChartIndex] = useState(0);
  const chartListRef = useRef<FlatList>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [cdssVisible, setCdssVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [selectedPatient, setSelectedPatientFull] = useState<any | null>(null);
  const [isAdpieActive, setIsAdpieActive] = useState(false);
  const [recordId, setRecordId] = useState<number | null>(null);
  const [isNA, setIsNA] = useState(false);
  const preNASnapshotRef = useRef<any>(null);

  const toggleNA = useCallback(async () => {
    const newState = !isNA;
    setIsNA(newState);

    // Clear any pending CDSS analysis timers
    Object.values(fieldTimers.current).forEach(clearTimeout);
    fieldTimers.current = {};

    const naVitals = {
      temperature: 'N/A',
      hr: 'N/A',
      rr: 'N/A',
      bp: 'N/A',
      spo2: 'N/A',
    };

    if (newState) {
      // Save current state before setting to N/A
      preNASnapshotRef.current = { ...vitals };

      Object.keys(naVitals).forEach(key => {
        handleUpdateVital(key as any, 'N/A');
      });

      if (selectedPatientId) {
        await saveAssessment(dayNo);
      }
    } else {
      // Restore from snapshot
      if (preNASnapshotRef.current) {
        Object.keys(preNASnapshotRef.current).forEach(key => {
          handleUpdateVital(key as any, preNASnapshotRef.current[key]);
        });
        preNASnapshotRef.current = null;
      } else {
        // Fallback: Clear if no snapshot
        Object.keys(naVitals).forEach(key => {
          handleUpdateVital(key as any, '');
        });
      }
    }
  }, [
    isNA,
    handleUpdateVital,
    selectedPatientId,
    dayNo,
    saveAssessment,
    vitals,
  ]);
  const [isAlertLoading, setIsAlertLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Processing...');
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const fieldTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const analyzeCountRef = useRef(0);
  const bellFadeAnim = useRef(new Animated.Value(1)).current;

  const vitalsRef = useRef(vitals);
  useEffect(() => {
    vitalsRef.current = vitals;
  }, [vitals]);

  const [backendAlerts, setBackendAlerts] = useState<
    Record<string, string | null>
  >({});

  useEffect(() => {
    if (readOnly && patientId) {
      setSelectedPatient(
        patientId.toString(),
        initialPatientName || '',
        admissionDate,
      );
    }
  }, [
    readOnly,
    patientId,
    setSelectedPatient,
    initialPatientName,
    admissionDate,
  ]);

  const handleVitalChange = useCallback(
    (key: string, value: string) => {
      handleUpdateVital(key as any, value);
      if (!selectedPatientId) return;
      if (fieldTimers.current[key]) clearTimeout(fieldTimers.current[key]);
      setIsAlertLoading(true);
      analyzeCountRef.current += 1;
      const thisCount = analyzeCountRef.current;
      fieldTimers.current[key] = setTimeout(async () => {
        const today = new Date().toLocaleDateString('en-CA');
        const time24 = convertTo24h(TIME_SLOTS[currentTimeIndex]);
        const currentData = { ...vitalsRef.current, [key]: value };
        const sanitized: Record<string, string> = {};
        Object.entries(currentData).forEach(([k, v]) => {
          sanitized[k] = v && v.trim() ? v : 'N/A';
        });
        const payload = {
          patient_id: parseInt(selectedPatientId, 10),
          date: today,
          time: time24,
          day_no: dayNo,
          ...sanitized,
        };
        const res = await analyzeField(payload, true);
        if (res) {
          const updatedAlerts = { ...res.alerts };
          if (!value.trim()) {
            updatedAlerts[`${key}_alert`] = null;
          }
          setBackendAlerts(prev => ({ ...prev, ...updatedAlerts }));
          const alertString = Object.values(updatedAlerts)
            .filter(v => v && !v.toLowerCase().includes('no findings'))
            .join('\n');
          setRealtimeAlert(alertString);
          setRealtimeSeverity(res.severity);
        }
        if (thisCount === analyzeCountRef.current) {
          setIsAlertLoading(false);
        }
      }, 800);
    },
    [
      selectedPatientId,
      analyzeField,
      handleUpdateVital,
      TIME_SLOTS,
      currentTimeIndex,
      setRealtimeAlert,
      setRealtimeSeverity,
      dayNo,
    ],
  );

  const scrollChart = (direction: 'next' | 'prev') => {
    const nextIdx = direction === 'next' ? chartIndex + 1 : chartIndex - 1;
    if (nextIdx >= 0 && nextIdx < vitalKeys.length) {
      setChartIndex(nextIdx);
      chartListRef.current?.scrollToOffset({
        offset: nextIdx * SNAP_INTERVAL,
        animated: true,
      });
    }
  };

  const [successMessage, setSuccessMessage] = useState({
    title: '',
    message: '',
  });
  const isAlertActive = !!selectedPatientId && isDataEntered;

  useEffect(() => {
    bellFadeAnim.setValue(0.35);
    Animated.timing(bellFadeAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [bellFadeAnim, isAlertActive, selectedPatientId]);

  const handleAlertPress = () => {
    if (!selectedPatientId) {
      return setAlertVisible(true);
    }
    setCdssVisible(true);
  };

  const handleSelectTimeSlot = (index: number) => {
    selectTime(index);
    setIsMenuVisible(false);
  };

  const handleNextPress = () => {
    handleNextTime();
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handlePrevPress = () => {
    handlePrevTime();
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleSubmitPress = async () => {
    if (!selectedPatientId) {
      return setAlertVisible(true);
    }

    Object.values(fieldTimers.current).forEach(t => clearTimeout(t));
    fieldTimers.current = {};

    setIsLoading(true);
    try {
      const res = await (saveAllAssessments
        ? saveAllAssessments(dayNo)
        : saveAssessment(dayNo));
      const actualData = res?.data || res;
      const id = actualData?.id || actualData?.vital_id;

      if (id) {
        setRecordId(id);
        setIsExistingRecord(true);
        setSuccessMessage({
          title: isExistingRecord
            ? 'Successfully Updated'
            : 'Successfully Submitted',
          message: isExistingRecord
            ? 'Vital signs updated successfully.'
            : 'Vital signs submitted successfully.',
        });
        setSuccessVisible(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCDSSPress = async () => {
    if (!selectedPatientId) {
      return setAlertVisible(true);
    }
    setIsLoading(true);
    setLoadingMessage('Saving Assessment...');
    try {
      const res = await saveAssessment(dayNo);
      const actualData = res?.data || res;
      const id = actualData?.id || actualData?.vital_id;
      if (id || recordId) {
        if (id) setRecordId(id);
        setLoadingMessage('Initializing ADPIE...');
        Animated.timing(screenOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          setIsAdpieActive(true);
          screenOpacity.setValue(1);
          setIsLoading(false);
        });
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      } else {
        setIsLoading(false);
      }
    } catch {
      setIsLoading(false);
    }
  };

  const handleBackPress = useCallback(() => {
    if (isAdpieActive) {
      setIsAdpieActive(false);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return true;
    }
    if (isMenuVisible) {
      setIsMenuVisible(false);
      return true;
    }
    onBack();
    return true;
  }, [isAdpieActive, isMenuVisible, onBack, setIsMenuVisible]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    return () => backHandler.remove();
  }, [handleBackPress]);

  const isLastTimeSlot = currentTimeIndex === TIME_SLOTS.length - 1;
  const isFirstTimeSlot = currentTimeIndex === 0;

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

  const generateFindingsSummary = () => {
    const findings = Object.entries(vitals)
      .filter(
        ([_, value]) =>
          typeof value === 'string' && value.trim() !== '' && value !== 'N/A',
      )
      .map(([key, value]) => `${key.toUpperCase()}: ${value}`);
    const alert = realtimeAlert || currentAlert?.message;
    if (alert) findings.push(alert);
    if (dataAlert) findings.push(dataAlert);
    return findings.join('. ');
  };

  if (isAdpieActive && recordId) {
    return (
      <ADPIEScreen
        recordId={recordId}
        patientName={patientName}
        feature="vital-signs"
        findingsSummary={generateFindingsSummary()}
        initialAlert={currentAlert?.message}
        onBack={() => {
          setIsAdpieActive(false);
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.root}>
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
              <View>
                <Text style={styles.title}>Vital Signs</Text>
                <Text style={styles.subDate}>
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
              <TouchableOpacity onPress={() => setIsMenuVisible(true)}>
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
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            scrollEnabled={scrollEnabled}
          >
            <View style={{ height: 20 }} />
            {!readOnly ? (
              <PatientSearchBar
                onPatientSelect={(id, name, patientObj) => {
                  setSelectedPatient(
                    id ? id.toString() : null,
                    name,
                    patientObj?.admission_date,
                  );
                  setSelectedPatientFull(patientObj);
                }}
                onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
                initialPatientName={patientName}
              />
            ) : (
              <View style={styles.staticPatientContainer}>
                <Text style={styles.staticPatientLabel}>PATIENT:</Text>
                <Text style={styles.staticPatientName}>
                  {initialPatientName || 'Unknown Patient'}
                </Text>
              </View>
            )}

            <View style={styles.row}>
              <View style={{ flex: 1.2, marginRight: 10 }}>
                <Text style={styles.fieldLabel}>DATE :</Text>
                <View style={styles.pillInput}>
                  <Text style={styles.dateVal}>
                    {new Date().toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>DAY NO :</Text>
                <View style={[styles.pillInput, styles.dropdownRow]}>
                  <Text style={styles.dateVal}>{dayNo}</Text>
                  <Image
                    source={arrowIcon}
                    style={[
                      styles.arrowIconImage,
                      { tintColor: theme.textMuted },
                    ]}
                  />
                </View>
              </View>
            </View>

            <View style={styles.chartCarousel}>
              {chartIndex > 0 && (
                <TouchableOpacity
                  style={[styles.navArrow, { left: -10 }]}
                  onPress={() => scrollChart('prev')}
                >
                  <View style={styles.arrowCircle}>
                    <Image
                      source={backArrow}
                      style={[styles.arrowImg, { tintColor: theme.primary }]}
                    />
                  </View>
                </TouchableOpacity>
              )}

              <FlatList
                ref={chartListRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={SNAP_INTERVAL}
                decelerationRate="fast"
                data={vitalKeys}
                extraData={vitals}
                keyExtractor={item => item}
                contentContainerStyle={{ paddingRight: 60 }}
                onMomentumScrollEnd={ev => {
                  const newIndex = Math.round(
                    ev.nativeEvent.contentOffset.x / SNAP_INTERVAL,
                  );
                  setChartIndex(newIndex);
                }}
                renderItem={({ item }) => (
                  <View
                    style={{ width: ITEM_WIDTH, marginRight: ITEM_SPACING }}
                  >
                    <PreciseVitalChart
                      label={item.toUpperCase()}
                      data={chartData[item]}
                    />
                  </View>
                )}
              />

              {chartIndex < vitalKeys.length - 1 && (
                <TouchableOpacity
                  style={[styles.navArrow, { right: 0 }]}
                  onPress={() => scrollChart('next')}
                >
                  <View style={styles.arrowCircle}>
                    <Image
                      source={nextArrow}
                      style={[styles.arrowImg, { tintColor: theme.primary }]}
                    />
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {!readOnly && (
              <TouchableOpacity
                style={[styles.naRow, !selectedPatientId && { opacity: 0.5 }]}
                onPress={() => {
                  if (!selectedPatientId) {
                    setAlertVisible(true);
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

            <View style={styles.timeBanner}>
              <Text style={styles.timeText}>{currentTime}</Text>
            </View>

            <View style={{ opacity: 1 }}>
              <VitalCard
                label="Temperature"
                value={vitals.temperature}
                onChangeText={v => handleVitalChange('temperature', v)}
                disabled={!selectedPatientId || isNA || readOnly}
                onDisabledPress={() => {
                  if (!selectedPatientId && !readOnly) {
                    setAlertVisible(true);
                  }
                }}
              />
              <VitalCard
                label="HR"
                value={vitals.hr}
                onChangeText={v => handleVitalChange('hr', v)}
                disabled={!selectedPatientId || isNA || readOnly}
                onDisabledPress={() => {
                  if (!selectedPatientId && !readOnly) {
                    setAlertVisible(true);
                  }
                }}
              />
              <VitalCard
                label="RR"
                value={vitals.rr}
                onChangeText={v => handleVitalChange('rr', v)}
                disabled={!selectedPatientId || isNA || readOnly}
                onDisabledPress={() => {
                  if (!selectedPatientId && !readOnly) {
                    setAlertVisible(true);
                  }
                }}
              />
              <VitalCard
                label="BP"
                value={vitals.bp}
                onChangeText={v => handleVitalChange('bp', v)}
                keyboardType="numbers-and-punctuation"
                disabled={!selectedPatientId || isNA || readOnly}
                onDisabledPress={() => {
                  if (!selectedPatientId && !readOnly) {
                    setAlertVisible(true);
                  }
                }}
              />
              <VitalCard
                label="SP02"
                value={vitals.spo2}
                onChangeText={v => handleVitalChange('spo2', v)}
                disabled={!selectedPatientId || isNA || readOnly}
                onDisabledPress={() => {
                  if (!selectedPatientId && !readOnly) {
                    setAlertVisible(true);
                  }
                }}
              />
            </View>

            {!readOnly ? (
              <View style={styles.footerAction}>
                <Animated.View style={{ opacity: bellFadeAnim }}>
                  <TouchableOpacity
                    style={styles.alertIcon}
                    disabled={!isDataEntered}
                    onPress={handleAlertPress}
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

                {isLastTimeSlot ? (
                  <View style={styles.buttonGroup}>
                    <TouchableOpacity
                      style={[
                        styles.cdssButton,
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
                          styles.cdssBtnText,
                          !isDataEntered && {
                            color: theme.textMuted,
                          },
                        ]}
                      >
                        CDSS
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.submitButton,
                        !isModified && {
                          backgroundColor: theme.buttonDisabledBg,
                          borderColor: theme.buttonDisabledBorder,
                        },
                      ]}
                      onPress={handleSubmitPress}
                      disabled={!isModified}
                    >
                      <Text
                        style={[
                          styles.submitBtnText,
                          !isModified && { color: theme.textMuted },
                        ]}
                      >
                        SUBMIT
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.nextButton,
                      !isModified && {
                        backgroundColor: theme.buttonDisabledBg,
                        borderColor: theme.buttonDisabledBorder,
                      },
                    ]}
                    onPress={handleNextPress}
                    disabled={!isModified}
                  >
                    <Text
                      style={[
                        styles.nextBtnText,
                        !isModified && { color: theme.textMuted },
                      ]}
                    >
                      NEXT ›
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={{ marginTop: 20 }}>
                <View style={[styles.footerAction, { marginBottom: 10 }]}>
                  <TouchableOpacity
                    style={[
                      styles.nextButton,
                      isFirstTimeSlot && {
                        backgroundColor: theme.buttonDisabledBg,
                        borderColor: theme.buttonDisabledBorder,
                      },
                    ]}
                    onPress={handlePrevPress}
                    disabled={isFirstTimeSlot}
                  >
                    <Text
                      style={[
                        styles.nextBtnText,
                        isFirstTimeSlot && { color: theme.textMuted },
                      ]}
                    >
                      ‹ PREV
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.nextButton,
                      isLastTimeSlot && {
                        backgroundColor: theme.buttonDisabledBg,
                        borderColor: theme.buttonDisabledBorder,
                      },
                    ]}
                    onPress={handleNextPress}
                    disabled={isLastTimeSlot}
                  >
                    <Text
                      style={[
                        styles.nextBtnText,
                        isLastTimeSlot && { color: theme.textMuted },
                      ]}
                    >
                      NEXT ›
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.submitButton} onPress={onBack}>
                  <Text style={styles.submitBtnText}>CLOSE</Text>
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

      <SweetAlert
        visible={alertVisible}
        title={
          !selectedPatientId
            ? 'Patient Required'
            : dataAlert
            ? 'CLINICAL ALERT'
            : currentAlert?.title || 'ALERT'
        }
        message={
          !selectedPatientId
            ? 'Please select a patient first in the search bar.'
            : dataAlert
            ? `${dataAlert}${
                currentAlert?.message ? '\n\n' + currentAlert.message : ''
              }`
            : currentAlert?.message || 'No alerts.'
        }
        type={
          !selectedPatientId
            ? 'error'
            : dataAlert
            ? 'error'
            : currentAlert?.type || 'success'
        }
        onConfirm={() => setAlertVisible(false)}
        confirmText="OK"
      />

      <SweetAlert
        visible={successVisible}
        title={successMessage.title || 'SUCCESS'}
        message={
          successMessage.message ||
          'Vital Signs Assessment has been saved successfully.'
        }
        type="success"
        onConfirm={() => {
          setSuccessVisible(false);
          setRecordId(null);
          reset();
          setSelectedPatientFull(null);
        }}
        confirmText="OK"
      />

      <CDSSModal
        visible={cdssVisible}
        onClose={() => setCdssVisible(false)}
        category="VITAL SIGNS ASSESSMENT"
        loading={isAlertLoading}
        bulletFormat
        alertText={(() => {
          const validDataAlert =
            dataAlert &&
            !dataAlert.toLowerCase().includes('no findings') &&
            !dataAlert.toLowerCase().includes('no result')
              ? dataAlert
              : null;
          const parts = [
            realtimeAlert,
            validDataAlert,
            currentAlert?.message,
          ].filter(Boolean);
          return parts.length
            ? parts.join('\n\n')
            : 'No clinical findings found.';
        })()}
        severity={realtimeSeverity || backendSeverity || undefined}
      />

      <Modal
        transparent
        visible={isMenuVisible}
        animationType="fade"
        statusBarTranslucent
      >
        <Pressable
          style={dotsModalStyles.modalOverlay}
          onPress={() => setIsMenuVisible(false)}
        >
          <BlurView style={dotsModalStyles.blurView} {...blurProps} />
          <Pressable
            style={dotsModalStyles.menuContainer}
            onPress={e => e.stopPropagation()}
          >
            <Text style={dotsModalStyles.menuTitle}>SELECT TIME SLOT</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {TIME_SLOTS.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={dotsModalStyles.menuItem}
                  onPress={() => handleSelectTimeSlot(index)}
                >
                  <Text
                    style={[
                      dotsModalStyles.menuItemText,
                      currentTimeIndex === index &&
                        dotsModalStyles.activeMenuText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={dotsModalStyles.closeMenuBtn}
              onPress={() => setIsMenuVisible(false)}
            >
              <Icon name="close" size={20} color={theme.primary} />
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (theme: any, commonStyles: any, _isDarkMode: boolean) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background },
    scrollContent: { paddingHorizontal: 40, paddingBottom: 20 },
    header: commonStyles.header,
    title: commonStyles.title,
    subDate: {
      color: theme.textMuted,
      fontSize: 13,
      fontFamily: 'AlteHaasGroteskBold',
    },
    dotsIcon: { width: 18, height: 18, resizeMode: 'contain', marginTop: 8 },
    fieldLabel: {
      color: theme.primary,
      fontFamily: 'AlteHaasGroteskBold',
      fontSize: 14,
      marginBottom: 8,
    },
    pillInput: {
      borderWidth: 1.5,
      borderColor: theme.border,
      borderRadius: 25,
      height: 45,
      paddingHorizontal: 20,
      justifyContent: 'center',
      backgroundColor: theme.card,
    },
    dateVal: { color: theme.text, fontFamily: 'AlteHaasGrotesk' },
    row: { flexDirection: 'row' },
    dropdownRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingRight: 15,
    },
    arrowIconImage: {
      width: 14,
      height: 8,
      resizeMode: 'contain',
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
    chartCarousel: { height: 210, marginVertical: 20, position: 'relative' },
    navArrow: {
      position: 'absolute',
      top: '38%',
      zIndex: 10,
    },
    arrowCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#c6e9c289',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.secondary,
      display: 'none', //hide for now as per new design
    },
    arrowImg: {
      width: 25,
      height: 25,
      resizeMode: 'contain',
      backgroundColor: 'transparent',
      display: 'none', //hide for now as per new design
    },

    timeBanner: {
      backgroundColor: theme.tableHeader,
      paddingVertical: 10,
      borderRadius: 20,
      alignItems: 'center',
      marginBottom: 10,
    },
    timeText: {
      color: theme.secondary,
      fontFamily: 'AlteHaasGroteskBold',
      fontSize: 14,
    },
    footerAction: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 40,
    },
    alertIcon: {
      width: 45,
      height: 45,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 22.5,
      overflow: 'hidden',
    },
    fullImg: { width: '100%', height: '100%', resizeMode: 'contain' },
    buttonGroup: { flex: 1, flexDirection: 'row', marginLeft: 15 },
    cdssButton: {
      flex: 1,
      height: 48,
      backgroundColor: theme.buttonBg,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: theme.buttonBorder,
      marginRight: 5,
    },
    cdssBtnText: {
      color: theme.primary,
      fontFamily: 'AlteHaasGroteskBold',
      fontSize: 14,
    },
    submitButton: {
      flex: 1,
      height: 48,
      backgroundColor: theme.buttonBg,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: theme.buttonBorder,
      marginLeft: 5,
    },
    submitBtnText: {
      color: theme.primary,
      fontFamily: 'AlteHaasGroteskBold',
      fontSize: 14,
    },
    nextButton: {
      flex: 1,
      backgroundColor: theme.buttonBg,
      height: 48,
      borderRadius: 25,
      marginLeft: 15,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: theme.buttonBorder,
    },
    disabledButton: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      opacity: 0.6,
    },
    nextBtnText: {
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

export default VitalSignsScreen;
