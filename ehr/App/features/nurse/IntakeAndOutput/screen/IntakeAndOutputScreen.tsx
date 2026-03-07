import React, {
  useState,
  useEffect,
  useRef,
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
  Pressable,
  StatusBar,
  ActivityIndicator,
  Modal,
  FlatList,
  Image,
  Dimensions,
  BackHandler,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const backArrow = require('@assets/icons/back_arrow.png');
import IntakeOutputCard from '../component/IntakeOutputCard';
import SweetAlert from '@components/SweetAlert';
import PatientSearchBar from '@components/PatientSearchBar';
import { useIntakeAndOutputLogic } from '../hook/useIntakeAndOutputLogic';
import ADPIEScreen from '@nurse/VitalSigns/screen/ADPIEScreen';
import CDSSModal from '@components/CDSSModal';
import { useAppTheme } from '@App/theme/ThemeContext';

const alertIcon = require('@assets/icons/alert.png');

interface IntakeAndOutputScreenProps {
  onBack: () => void;
  readOnly?: boolean;
  patientId?: number;
  initialPatientName?: string;
}

const IntakeAndOutputScreen: React.FC<IntakeAndOutputScreenProps> = ({
  onBack,
  readOnly = false,
  patientId,
  initialPatientName,
}) => {
  const { isDarkMode, theme, commonStyles } = useAppTheme();
  const styles = useMemo(
    () => createStyles(theme, commonStyles, isDarkMode),
    [theme, commonStyles, isDarkMode],
  );

  const {
    patientName,
    selectedPatientId,
    handleSelectPatient,
    intakeOutput,
    handleUpdateField,
    isDataEntered,
    saveAssessment,
    checkRealTimeAlerts,
    assessmentAlert,
    currentAlert,
    setBackendAlert,
    triggerPatientAlert,
    loading,
    recordId,
    ADPIE_STAGES,
    setIntakeOutput,
  } = useIntakeAndOutputLogic();

  const [alertVisible, setAlertVisible] = useState(false);
  const [cdssModalVisible, setCdssModalVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState({
    title: '',
    message: '',
  });
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isAdpieActive, setIsAdpieActive] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [isNA, setIsNA] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // --- DOCTOR VIEWING LOGIC ---
  useEffect(() => {
    if (readOnly && patientId) {
      // Trigger selection logic in hook to load data
      handleSelectPatient(patientId, initialPatientName || '');
    }
  }, [readOnly, patientId, initialPatientName, handleSelectPatient]);

  const toggleNA = () => {
    if (readOnly) return; // Disable in read-only
    const newState = !isNA;
    setIsNA(newState);
    if (newState) {
      setIntakeOutput({
        oral_intake: 'N/A',
        iv_fluids: 'N/A',
        urine_output: 'N/A',
      });
    } else {
      setIntakeOutput(prev => ({
        oral_intake: prev.oral_intake === 'N/A' ? '' : prev.oral_intake,
        iv_fluids: prev.iv_fluids === 'N/A' ? '' : prev.iv_fluids,
        urine_output: prev.urine_output === 'N/A' ? '' : prev.urine_output,
      }));
    }
  };

  useEffect(() => {
    if (selectedPatientId) {
      const fields = ['oral_intake', 'iv_fluids', 'urine_output'];
      const allNA = fields.every(f => (intakeOutput as any)[f] === 'N/A');
      setIsNA(allNA);
    } else {
      setIsNA(false);
    }
  }, [selectedPatientId, intakeOutput]);

  const handleBackPress = useCallback(() => {
    if (isAdpieActive) {
      setIsAdpieActive(false);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return true;
    }
    if (cdssModalVisible) {
      setCdssModalVisible(false);
      return true;
    }
    onBack();
    return true;
  }, [isAdpieActive, cdssModalVisible, onBack]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    return () => backHandler.remove();
  }, [handleBackPress]);

  useEffect(() => {
    const now = new Date();
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    setCurrentDate(
      `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`,
    );
  }, []);

  // REAL-TIME CDSS: Disabled in Read Only
  useEffect(() => {
    if (!selectedPatientId || readOnly) return;

    const timer = setTimeout(async () => {
      if (isDataEntered) {
        try {
          await checkRealTimeAlerts({
            patient_id: parseInt(selectedPatientId, 10),
            oral_intake: parseInt(intakeOutput.oral_intake, 10) || 0,
            iv_fluids: parseInt(intakeOutput.iv_fluids, 10) || 0,
            urine_output: parseInt(intakeOutput.urine_output, 10) || 0,
          });
        } catch (e) {
          console.error('I&O CDSS Error:', e);
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [intakeOutput, selectedPatientId, isDataEntered, checkRealTimeAlerts, readOnly]);

  const handleSubmit = async () => {
    // READ ONLY LOGIC (Close)
    if (readOnly) {
        onBack();
        return;
    }

    if (!selectedPatientId) {
      triggerPatientAlert();
      setAlertVisible(true);
      return;
    }

    const result = await saveAssessment();
    if (result) {
      const isUpdate =
        recordId === result.id || result.updated_at !== result.created_at;
      setSuccessMessage({
        title: isUpdate ? 'SUCCESSFULLY UPDATED' : 'SUCCESSFULLY SUBMITTED',
        message: isUpdate
          ? 'Intake and output updated successfully.'
          : 'Intake and output submitted successfully.',
      });
      setSuccessVisible(true);
    } else {
      setAlertVisible(true);
    }
  };

  const handleCDSSPress = async () => {
    // READ ONLY LOGIC (View Only)
    if (readOnly) {
        if (recordId) {
            setIsAdpieActive(true);
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }
        return;
    }

    // NURSE LOGIC
    if (!selectedPatientId) {
      triggerPatientAlert();
      setAlertVisible(true);
      return;
    }
    const res = await saveAssessment();
    if (res && res.id) {
      setIsAdpieActive(true);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else if (recordId) {
      setIsAdpieActive(true);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      setAlertVisible(true);
    }
  };

  const handleAlertPress = async () => {
    if (readOnly) {
        setCdssModalVisible(true);
        return;
    }

    if (!selectedPatientId) {
      triggerPatientAlert();
      return setAlertVisible(true);
    }
    if (isDataEntered) {
      await saveAssessment();
    }
    setCdssModalVisible(true);
  };

  const handleAlertConfirm = () => {
    setAlertVisible(false);
  };

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

  if (isAdpieActive && recordId) {
    return (
      <ADPIEScreen
        recordId={recordId}
        patientName={patientName}
        onBack={() => setIsAdpieActive(false)}
        feature="intake-output"
        readOnly={readOnly} // Pass readOnly to ADPIE if supported
      />
    );
  }

  // Frontend-only cleaning of the alert string
  const getCleanedAlertText = () => {
    if (!assessmentAlert)
      return 'Continue documenting to receive real-time support.';

    // 1. Remove emojis
    let cleaned = assessmentAlert.replace(/[🔴🟠✓⚠️❌]/g, '').trim();

    // 2. Remove square brackets from status prefixes (e.g., [CRITICAL] -> CRITICAL)
    cleaned = cleaned.replace(/\[(CRITICAL|WARNING|INFO)\]/gi, '$1');

    return cleaned;
  };

  const hasRealAlert = assessmentAlert && assessmentAlert.trim() !== '';

  return (
    <SafeAreaView style={styles.root}>
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
              <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
                Intake and Output
              </Text>
              <Text style={styles.subDate}>{currentDate}</Text>
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
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={scrollEnabled}
        >
          <View style={{ height: 20 }} />
          
          {/* SEARCH BAR / STATIC PATIENT */}
          {!readOnly ? (
            <PatientSearchBar
                initialPatientName={patientName}
                onPatientSelect={handleSelectPatient}
                onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
            />
          ) : (
            <View style={styles.staticPatientContainer}>
                <Text style={styles.staticPatientLabel}>PATIENT:</Text>
                <Text style={styles.staticPatientName}>{initialPatientName || "Unknown Patient"}</Text>
            </View>
          )}

          {/* HIDE MARK AS N/A IN READ ONLY */}
          {!readOnly && (
            <TouchableOpacity
                style={[styles.naRow, !selectedPatientId && { opacity: 0.5 }]}
                onPress={() => {
                if (!selectedPatientId) {
                    triggerPatientAlert();
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

          <View
            pointerEvents={selectedPatientId ? 'auto' : 'none'}
            style={{ opacity: selectedPatientId ? 1 : 0.6 }}
          >
            <IntakeOutputCard
              label="ORAL INTAKE"
              value={intakeOutput.oral_intake}
              onChangeText={text => handleUpdateField('oral_intake', text)}
              disabled={!selectedPatientId || isNA || readOnly}
              onDisabledPress={() => {
                if (!readOnly && !selectedPatientId) {
                  triggerPatientAlert();
                  setAlertVisible(true);
                }
              }}
            />

            <IntakeOutputCard
              label="IV FLUIDS"
              value={intakeOutput.iv_fluids}
              onChangeText={text => handleUpdateField('iv_fluids', text)}
              disabled={!selectedPatientId || isNA || readOnly}
              onDisabledPress={() => {
                if (!readOnly && !selectedPatientId) {
                  triggerPatientAlert();
                  setAlertVisible(true);
                }
              }}
            />

            <IntakeOutputCard
              label="URINE OUTPUT"
              value={intakeOutput.urine_output}
              onChangeText={text => handleUpdateField('urine_output', text)}
              disabled={!selectedPatientId || isNA || readOnly}
              onDisabledPress={() => {
                if (!readOnly && !selectedPatientId) {
                  triggerPatientAlert();
                  setAlertVisible(true);
                }
              }}
            />
          </View>

          <View style={styles.footerAction}>
            {/* ALERT ICON: Visible in both Edit and ReadOnly */}
            <TouchableOpacity
              style={[
                styles.alertIcon,
                {
                  backgroundColor: hasRealAlert
                    ? isDarkMode
                      ? '#78350F'
                      : '#FFECBD'
                    : (isDataEntered || readOnly) && selectedPatientId
                    ? theme.surface
                    : isDarkMode
                    ? '#333'
                    : '#EBEBEB',
                  borderColor: theme.border,
                },
              ]}
              disabled={!selectedPatientId}
              onPress={handleAlertPress}
            >
              <Image
                source={alertIcon}
                style={[
                  styles.fullImg,
                  hasRealAlert
                    ? { tintColor: '#EDB62C', opacity: 1 }
                    : (isDataEntered || readOnly) && selectedPatientId
                    ? { tintColor: '#EDB62C', opacity: 0.8 }
                    : { tintColor: theme.textMuted, opacity: 0.5 },
                ]}
              />
            </TouchableOpacity>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[
                  styles.cdssButton,
                  (!selectedPatientId || (!isDataEntered && !isNA)) && !readOnly && {
                    backgroundColor: theme.buttonDisabledBg,
                    borderColor: theme.buttonDisabledBorder,
                  },
                ]}
                onPress={handleCDSSPress}
                // Allow press in ReadOnly if data exists
                disabled={!selectedPatientId && !readOnly}
              >
                <Text
                  style={[
                    styles.cdssBtnText,
                    (!selectedPatientId || (!isDataEntered && !isNA)) && !readOnly
                      ? { color: theme.textMuted }
                      : { color: theme.primary },
                  ]}
                >
                  CDSS
                </Text>
              </TouchableOpacity>

              {/* SUBMIT (Nurse) vs CLOSE (Doctor) */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !selectedPatientId && !readOnly && {
                    backgroundColor: theme.buttonDisabledBg,
                    borderColor: theme.buttonDisabledBorder,
                  },
                ]}
                onPress={handleSubmit}
                disabled={(!selectedPatientId && !readOnly) || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <Text
                    style={[
                      styles.submitBtnText,
                      !selectedPatientId && !readOnly && { color: theme.textMuted },
                    ]}
                  >
                    {readOnly ? 'CLOSE' : 'SUBMIT'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        <LinearGradient
          colors={fadeColors}
          style={styles.fadeBottom}
          pointerEvents="none"
        />
      </View>

      <CDSSModal
        visible={cdssModalVisible}
        onClose={() => setCdssModalVisible(false)}
        category="I&O Assessment"
        alertText={getCleanedAlertText()}
      />

      {/* Alert Component */}
      <SweetAlert
        visible={alertVisible}
        title={
          !selectedPatientId
            ? 'Patient Required'
            : currentAlert?.title || 'ALERT'
        }
        message={
          !selectedPatientId
            ? 'Please select a patient first in the search bar.'
            : currentAlert?.message || 'Please fill out the form.'
        }
        type={!selectedPatientId ? 'error' : currentAlert?.type || 'success'}
        onConfirm={handleAlertConfirm}
      />

      {/* Success Alert */}
      <SweetAlert
        visible={successVisible}
        title={successMessage.title}
        message={successMessage.message}
        type="success"
        onConfirm={() => {
          setSuccessVisible(false);
        }}
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: any, commonStyles: any, isDarkMode: boolean) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background },
    scrollContent: { paddingHorizontal: 40, paddingBottom: 130 },
    header: commonStyles.header,
    title: commonStyles.title,
    subDate: {
      color: theme.textMuted,
      fontFamily: 'AlteHaasGroteskBold',
      fontSize: 13,
    },
    // New Static Patient styles
    staticPatientContainer: {
        marginBottom: 20,
        backgroundColor: theme.card,
        padding: 15,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border
    },
    staticPatientLabel: {
        fontFamily: 'AlteHaasGroteskBold',
        color: theme.primary,
        fontSize: 12,
        marginRight: 10
    },
    staticPatientName: {
        fontFamily: 'AlteHaasGrotesk',
        color: theme.text,
        fontSize: 16,
        fontWeight: 'bold'
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
      marginBottom: 15,
    },
    footerAction: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    alertIcon: {
      width: 45,
      height: 45,
      borderRadius: 22.5,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
    },
    fullImg: { width: '80%', height: '80%', resizeMode: 'contain' },
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
    disabledButton: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      opacity: 0.6,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuContainer: {
      width: '85%',
      backgroundColor: theme.card,
      borderRadius: 25,
      padding: 25,
      maxHeight: '80%',
    },
    menuTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.primary,
      marginBottom: 20,
      textAlign: 'center',
    },
    menuItem: {
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    menuItemText: { fontSize: 16, color: theme.text, textAlign: 'center' },
    activeMenuText: { color: theme.secondary, fontWeight: 'bold' },
    closeMenuBtn: {
      marginTop: 20,
      backgroundColor: theme.surface,
      paddingVertical: 12,
      borderRadius: 20,
      alignItems: 'center',
    },
    closeMenuText: { color: theme.primary, fontWeight: 'bold' },
    fadeBottom: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
    },
  });

export default IntakeAndOutputScreen;