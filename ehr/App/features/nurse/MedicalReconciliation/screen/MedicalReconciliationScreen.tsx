import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  FlatList,
  Modal,
  TextInput,
  Pressable,
  BackHandler,
  Image,
  Platform,
} from 'react-native';

const backArrow = require('@assets/icons/back_arrow.png');
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import MedicalReconCard from '../component/MedicalReconCard';
import { useMedicalReconLogic } from '../hook/useMedicalReconLogic';
import SweetAlert from '@components/SweetAlert';
import PatientSearchBar from '@components/PatientSearchBar';
import { useAppTheme } from '@App/theme/ThemeContext';

// UPDATED INTERFACE
interface MedicalReconciliationProps {
  onBack: () => void;
  readOnly?: boolean;
  patientId?: number;
  initialPatientName?: string;
}

const MedicalReconciliationScreen: React.FC<MedicalReconciliationProps> = ({
  onBack,
  readOnly = false,
  patientId,
  initialPatientName
}) => {
  const { isDarkMode, theme, commonStyles } = useAppTheme();
  const styles = useMemo(
    () => createStyles(theme, commonStyles, isDarkMode),
    [theme, commonStyles, isDarkMode],
  );

  const {
    stageIndex,
    currentStage,
    values,
    patientName,
    setPatientName,
    patientId: logicPatientId,
    setPatientId,
    isLoading,
    isSubmitting,
    handleUpdate,
    handleNext,
    isDataEntered,
    isLastStage,
    alertConfig,
    closeAlert,
    triggerPatientAlert,
    setStageIndex,
    RECON_STAGES,
    successMessage,
    successVisible,
    setSuccessVisible,
  } = useMedicalReconLogic();

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [isNA, setIsNA] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // --- DOCTOR VIEWING LOGIC ---
  useEffect(() => {
    if (readOnly && patientId) {
      // Manually set patient ID to trigger data fetching in hook
      setPatientId(patientId);
      setPatientName(initialPatientName || '');
    }
  }, [readOnly, patientId, initialPatientName, setPatientId, setPatientName]);

  const toggleNA = () => {
    if (readOnly) return; // Disable in read-only
    const newState = !isNA;
    setIsNA(newState);
    const fields = ['med', 'dose', 'route', 'freq', 'indication', 'extra'];
    if (newState) {
      fields.forEach(f => handleUpdate(f as any, 'N/A'));
    } else {
      fields.forEach(f => {
        if ((values as any)[f] === 'N/A') {
          handleUpdate(f as any, '');
        }
      });
    }
  };

  useEffect(() => {
    if (logicPatientId) {
      const fields = ['med', 'dose', 'route', 'freq', 'indication', 'extra'];
      const allNA = fields.every(f => {
        if (stageIndex === 2 && f === 'indication') return true;
        return (values as any)[f] === 'N/A';
      });
      setIsNA(allNA);
    } else {
      setIsNA(false);
    }
  }, [logicPatientId, values, stageIndex]);

  const handleBackPress = useCallback(() => {
    if (isMenuVisible) {
      setIsMenuVisible(false);
      return true;
    }
    onBack();
    return true;
  }, [isMenuVisible, onBack]);

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

  const getExtraLabel = () => {
    if (stageIndex === 0) return 'Administered during stay?';
    if (stageIndex === 1) return 'Discontinued on admission?';
    return 'Reason for change';
  };

  const handleAlertConfirm = () => {
    closeAlert();
  };

  const handleSelectStage = (index: number) => {
    setStageIndex(index);
    setIsMenuVisible(false);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handlePatientSelect = (id: number | null, name: string) => {
    setPatientId(id);
    setPatientName(name);
  };

  const handleNextPress = () => {
    // READ ONLY NAVIGATION
    if (readOnly) {
        if (isLastStage) {
            onBack();
        } else {
            // Manually advance stage since handleNext might have save logic
            setStageIndex(stageIndex + 1); 
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }
        return;
    }

    // NORMAL LOGIC
    handleNext();
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
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
          {/* HEADER Section */}
          <View style={[styles.header, { marginBottom: 0 }]}>
            <View>
              <Text style={styles.title}>Medical{'\n'}Reconciliation</Text>
              <Text style={styles.subDate}>{currentDate}</Text>
            </View>
            <TouchableOpacity onPress={() => setIsMenuVisible(true)}>
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
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={scrollEnabled}
        >
          <View style={{ height: 20 }} />
          
          {/* SEARCH BAR / STATIC PATIENT */}
          {!readOnly ? (
            <PatientSearchBar
                initialPatientName={patientName}
                onPatientSelect={handlePatientSelect}
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
                style={[styles.naRow, !logicPatientId && { opacity: 0.5 }]}
                onPress={() => {
                if (!logicPatientId) {
                    triggerPatientAlert();
                } else {
                    toggleNA();
                }
                }}
            >
                <Text
                style={[
                    styles.naText,
                    !logicPatientId && { color: theme.textMuted },
                ]}
                >
                Mark all as N/A
                </Text>
                <Icon
                name={isNA ? 'check-box' : 'check-box-outline-blank'}
                size={22}
                color={logicPatientId ? theme.primary : theme.textMuted}
                />
            </TouchableOpacity>
          )}

          {/* HIDE WARNING TEXT IN READ ONLY */}
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

          {/* STAGE Indicator */}
          <View style={styles.stageTab}>
            <Text style={styles.stageText}>{currentStage}</Text>
          </View>

          {/* INPUT Cards Flow - Wrapped in Pressable for validation */}
          <View
            style={{ opacity: logicPatientId ? 1 : 0.6 }}
          >
            <MedicalReconCard
              label="Medication"
              value={values.med}
              onChangeText={(v: string) => handleUpdate('med', v)}
              disabled={!logicPatientId || isNA || readOnly}
              onDisabledPress={triggerPatientAlert}
            />
            <MedicalReconCard
              label="Dose"
              value={values.dose}
              onChangeText={(v: string) => handleUpdate('dose', v)}
              disabled={!logicPatientId || isNA || readOnly}
              onDisabledPress={triggerPatientAlert}
            />
            <MedicalReconCard
              label="Route"
              value={values.route}
              onChangeText={(v: string) => handleUpdate('route', v)}
              disabled={!logicPatientId || isNA || readOnly}
              onDisabledPress={triggerPatientAlert}
            />
            <MedicalReconCard
              label="Frequency"
              value={values.freq}
              onChangeText={(v: string) => handleUpdate('freq', v)}
              disabled={!logicPatientId || isNA || readOnly}
              onDisabledPress={triggerPatientAlert}
            />

            {/* Indication is hidden in Stage 3 */}
            {stageIndex !== 2 && (
              <MedicalReconCard
                label="Indication"
                value={values.indication}
                onChangeText={(v: string) => handleUpdate('indication', v)}
                disabled={!logicPatientId || isNA || readOnly}
                onDisabledPress={triggerPatientAlert}
              />
            )}

            <MedicalReconCard
              label={getExtraLabel()}
              value={values.extra}
              onChangeText={(v: string) => handleUpdate('extra', v)}
              disabled={!logicPatientId || isNA || readOnly}
              onDisabledPress={triggerPatientAlert}
            />
          </View>

          {/* FOOTER BUTTON */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              (isSubmitting || (!logicPatientId && !readOnly)) &&
                styles.btnDisabled,
            ]}
            onPress={handleNextPress}
            // Allow press if readOnly (navigation) OR if logicPatientId exists (submit)
            disabled={!readOnly && (isSubmitting || !logicPatientId)}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <>
                <Text
                  style={[
                    styles.btnText,
                    (isSubmitting || (!logicPatientId && !readOnly)) && {
                      color: theme.textMuted,
                    },
                  ]}
                >
                  {/* Logic: Last Stage + ReadOnly = CLOSE, Last Stage + Nurse = SUBMIT, Else = NEXT */}
                  {isLastStage ? (readOnly ? 'CLOSE' : 'SUBMIT') : 'NEXT'}
                </Text>
                {!isLastStage && (
                  <Text
                    style={[
                      styles.chevron,
                      (isSubmitting || (!logicPatientId && !readOnly)) && {
                        color: theme.textMuted,
                      },
                    ]}
                  >
                    ›
                  </Text>
                )}
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
        <LinearGradient
          colors={fadeColors}
          style={styles.fadeBottom}
          pointerEvents="none"
        />
      </View>

      {/* Options Menu Modal */}
      <Modal transparent visible={isMenuVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>SELECT STAGE</Text>

            <FlatList
              data={RECON_STAGES}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleSelectStage(index)}
                >
                  <Text
                    style={[
                      styles.menuItemText,
                      stageIndex === index && styles.activeMenuText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.closeMenuBtn}
              onPress={() => setIsMenuVisible(false)}
            >
              <Text style={styles.closeMenuText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SweetAlert Components */}
      <SweetAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type as any}
        onConfirm={handleAlertConfirm}
      />

      <SweetAlert
        visible={successVisible}
        title={successMessage.title}
        message={successMessage.message}
        type="success"
        onConfirm={() => setSuccessVisible(false)}
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: any, commonStyles: any, isDarkMode: boolean) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background },
    scrollContent: { paddingHorizontal: 40, paddingBottom: 20 },
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
    stageTab: {
      backgroundColor: theme.tableHeader,
      paddingVertical: 12,
      borderRadius: 20,
      alignItems: 'center',
      marginBottom: 20,
    },
    stageText: {
      color: theme.secondary,
      fontFamily: 'AlteHaasGroteskBold',
      fontSize: 14,
    },
    actionBtn: {
      backgroundColor: theme.buttonBg,
      height: 50,
      borderRadius: 25,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 5,
      marginBottom: 70,
      borderWidth: 1,
      borderColor: theme.buttonBorder,
    },
    btnDisabled: {
      backgroundColor: theme.buttonDisabledBg,
      borderColor: theme.buttonDisabledBorder,
    },
    btnText: { color: theme.primary, fontWeight: 'bold', fontSize: 16 },
    chevron: { color: theme.primary, fontSize: 20, marginLeft: 10 },

    // Menu Modal Styles
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

export default MedicalReconciliationScreen;