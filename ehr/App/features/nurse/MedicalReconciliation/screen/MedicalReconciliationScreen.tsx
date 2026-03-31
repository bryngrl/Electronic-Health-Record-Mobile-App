import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
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
import { BlurView } from '@react-native-community/blur';
import {
  createDotsSettingsModalStyle,
  blurProps,
} from '../../styles/DotsSettingsModalStyle';

const backArrow = require('@assets/icons/back_arrow.png');
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import MedicalReconCard from '../component/MedicalReconCard';
import { useMedicalReconLogic } from '../hook/useMedicalReconLogic';
import SweetAlert from '@components/SweetAlert';
import PatientSearchBar from '@components/PatientSearchBar';
import { useAppTheme } from '@App/theme/ThemeContext';

import LoadingOverlay from '@components/LoadingOverlay';

const dotsIcon = require('@assets/icons/dots_icon.png');

interface MedicalReconciliationProps {
  onBack: () => void;
  readOnly?: boolean;
  patientId?: number;
  initialPatientName?: string;
  admissionDate?: string;
}

const MedicalReconciliationScreen: React.FC<MedicalReconciliationProps> = ({
  onBack,
  readOnly = false,
  patientId: patientIdProp,
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
    stageIndex,
    currentStage,
    values,
    patientName,
    setPatientName,
    patientId,
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
    isModified,
  } = useMedicalReconLogic();

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [isNA, setIsNA] = useState(false);
  const preNASnapshotRef = useRef<Record<number, any>>({});
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (readOnly && patientIdProp) {
      setPatientId(patientIdProp);
      setPatientName(initialPatientName || '');
    }
  }, [readOnly, patientIdProp, initialPatientName]);

  const calculateDayNumber = useCallback(() => {
    const dateToUse = admissionDate;
    if (!dateToUse) return '';
    try {
      const admission = new Date(dateToUse);
      const today = new Date();
      admission.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      const diffTime = today.getTime() - admission.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays > 0 ? diffDays.toString() : '1';
    } catch (e) {
      console.error('Error calculating day_no:', e);
      return '1';
    }
  }, [admissionDate]);

  const patientRequired = () => {
    if (!readOnly) {
      triggerPatientAlert();
    }
  };

  const toggleNA = () => {
    const newState = !isNA;
    setIsNA(newState);
    const fields = ['med', 'dose', 'route', 'freq', 'indication', 'extra'];
    if (newState) {
      // Save snapshot for CURRENT stage before setting to N/A
      preNASnapshotRef.current[stageIndex] = { ...values };

      fields.forEach(f => handleUpdate(f as any, 'N/A'));
    } else {
      if (preNASnapshotRef.current[stageIndex]) {
        // Restore from snapshot
        const snapshot = preNASnapshotRef.current[stageIndex];
        fields.forEach(f => {
          handleUpdate(f as any, snapshot[f]);
        });
        delete preNASnapshotRef.current[stageIndex];
      } else {
        fields.forEach(f => {
          if ((values as any)[f] === 'N/A') {
            handleUpdate(f as any, '');
          }
        });
      }
    }
  };

  useEffect(() => {
    if (patientId) {
      const fields = ['med', 'dose', 'route', 'freq', 'indication', 'extra'];
      const allNA = fields.every(f => {
        if (stageIndex === 2 && f === 'indication') return true;
        return (values as any)[f] === 'N/A';
      });
      setIsNA(allNA);
    } else {
      setIsNA(false);
    }
  }, [patientId, values, stageIndex]);

  const handleBackPress = useCallback(() => {
    if (isMenuVisible) {
      setIsMenuVisible(false);
      return true;
    }
    if (stageIndex > 0) {
      setStageIndex(stageIndex - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return true;
    }
    onBack();
    return true;
  }, [isMenuVisible, onBack, stageIndex, setStageIndex]);

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
            <View style={readOnly ? { paddingLeft: 18 } : undefined}>
              <Text style={styles.title}>Medical{'\n'}Reconciliation</Text>
              {!readOnly && <Text style={styles.subDate}>{currentDate}</Text>}
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
            {!readOnly && (
              <TouchableOpacity onPress={() => setIsMenuVisible(true)}>
                <Image source={dotsIcon} style={styles.dotsIcon} />
              </TouchableOpacity>
            )}
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
          <PatientSearchBar
            initialPatientName={
              readOnly ? initialPatientName || '' : patientName
            }
            onPatientSelect={handlePatientSelect}
            onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
          />

          {!readOnly && (
            <TouchableOpacity
              style={[styles.naRow, !patientId && { opacity: 0.5 }]}
              onPress={() => {
                if (!patientId) {
                  triggerPatientAlert();
                } else {
                  toggleNA();
                }
              }}
            >
              <Text
                style={[
                  styles.naText,
                  !patientId && { color: theme.textMuted },
                ]}
              >
                Mark all as N/A
              </Text>
              <Icon
                name={isNA ? 'check-box' : 'check-box-outline-blank'}
                size={22}
                color={patientId ? theme.primary : theme.textMuted}
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

          {/* STAGE Indicator */}
          <View style={styles.stageTab}>
            <Text style={styles.stageText}>{currentStage}</Text>
          </View>

          {/* INPUT Cards Flow - Wrapped in Pressable for validation */}
          <View style={{ opacity: 1 }}>
            <MedicalReconCard
              label="Medication"
              value={values.med}
              onChangeText={(v: string) => handleUpdate('med', v)}
              disabled={!patientId || isNA || readOnly}
              onDisabledPress={triggerPatientAlert}
              readOnly={readOnly}
            />
            <MedicalReconCard
              label="Dose"
              value={values.dose}
              onChangeText={(v: string) => handleUpdate('dose', v)}
              disabled={!patientId || isNA || readOnly}
              onDisabledPress={triggerPatientAlert}
              readOnly={readOnly}
            />
            <MedicalReconCard
              label="Route"
              value={values.route}
              onChangeText={(v: string) => handleUpdate('route', v)}
              disabled={!patientId || isNA || readOnly}
              onDisabledPress={triggerPatientAlert}
              readOnly={readOnly}
            />
            <MedicalReconCard
              label="Frequency"
              value={values.freq}
              onChangeText={(v: string) => handleUpdate('freq', v)}
              disabled={!patientId || isNA || readOnly}
              onDisabledPress={triggerPatientAlert}
              readOnly={readOnly}
            />

            {/* Indication is hidden in Stage 3 */}
            {stageIndex !== 2 && (
              <MedicalReconCard
                label="Indication"
                value={values.indication}
                onChangeText={(v: string) => handleUpdate('indication', v)}
                disabled={!patientId || isNA || readOnly}
                onDisabledPress={triggerPatientAlert}
                readOnly={readOnly}
              />
            )}

            <MedicalReconCard
              label={getExtraLabel()}
              value={values.extra}
              onChangeText={(v: string) => handleUpdate('extra', v)}
              disabled={!patientId || isNA || readOnly}
              onDisabledPress={triggerPatientAlert}
              readOnly={readOnly}
            />
          </View>

          {/* FOOTER */}
          {!readOnly ? (
            <View style={styles.footerAction}>
              <TouchableOpacity
                style={[
                  styles.backBtn,
                  stageIndex === 0 && {
                    backgroundColor: theme.buttonDisabledBg,
                    borderColor: theme.buttonDisabledBorder,
                  },
                ]}
                onPress={handleBackPress}
                disabled={isSubmitting || stageIndex === 0}
              >
                <Icon
                  name="arrow-back"
                  size={24}
                  color={stageIndex === 0 ? theme.textMuted : theme.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  { marginLeft: 10, marginRight: 0 },
                  (!isModified && !isDataEntered) && {
                    borderColor: theme.buttonDisabledBorder,
                    backgroundColor: theme.buttonDisabledBg,
                  },
                ]}
                onPress={handleNextPress}
                disabled={isSubmitting || (!isModified && !isDataEntered)}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <Text
                    style={[
                      styles.btnText,
                      (!isModified && !isDataEntered) && {
                        color: theme.textMuted,
                      },
                    ]}
                  >
                    {isLastStage ? 'SUBMIT' : 'NEXT'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ marginTop: 10 }}>
              <View style={styles.footerAction}>
                <TouchableOpacity
                  style={[
                    styles.backBtn,
                    stageIndex === 0 && {
                      backgroundColor: theme.buttonDisabledBg,
                      borderColor: theme.buttonDisabledBorder,
                    },
                  ]}
                  onPress={onBack}
                  disabled={isSubmitting || stageIndex === 0}
                >
                  <Icon
                    name="arrow-back"
                    size={24}
                    color={stageIndex === 0 ? theme.textMuted : theme.primary}
                  />
                </TouchableOpacity>

                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    gap: 10,
                    marginLeft: 10,
                  }}
                >
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      { marginHorizontal: 0 },
                      stageIndex === 0 && {
                        backgroundColor: theme.buttonDisabledBg,
                        borderColor: theme.buttonDisabledBorder,
                      },
                    ]}
                    onPress={() => {
                      setStageIndex(stageIndex - 1);
                      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                    }}
                    disabled={stageIndex === 0}
                  >
                    <Text
                      style={[
                        styles.btnText,
                        stageIndex === 0 && { color: theme.textMuted },
                      ]}
                    >
                      ‹ PREV
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      { marginHorizontal: 0 },
                      isLastStage && {
                        backgroundColor: theme.buttonDisabledBg,
                        borderColor: theme.buttonDisabledBorder,
                      },
                    ]}
                    onPress={() => {
                      setStageIndex(stageIndex + 1);
                      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                    }}
                    disabled={isLastStage}
                  >
                    <Text
                      style={[
                        styles.btnText,
                        isLastStage && { color: theme.textMuted },
                      ]}
                    >
                      NEXT ›
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  { marginHorizontal: 0, marginBottom: 0 },
                ]}
                onPress={onBack}
              >
                <Text style={styles.btnText}>CLOSE</Text>
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

      {/* Options Menu Modal */}
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
            <Text style={dotsModalStyles.menuTitle}>SELECT STAGE</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {RECON_STAGES.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={dotsModalStyles.menuItem}
                  onPress={() => handleSelectStage(index)}
                >
                  <Text
                    style={[
                      dotsModalStyles.menuItemText,
                      stageIndex === index && dotsModalStyles.activeMenuText,
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
        onConfirm={() => {
          setSuccessVisible(false);
          setStageIndex(0);
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }}
      />
      <LoadingOverlay
        visible={isSubmitting}
        message="Saving Medical Reconciliation..."
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: any, commonStyles: any, isDarkMode: boolean) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background },
    scrollContent: { paddingHorizontal: 40, paddingBottom: 50 },
    header: commonStyles.header,
    title: commonStyles.title,
    subDate: {
      color: theme.textMuted,
      fontFamily: 'AlteHaasGroteskBold',
      fontSize: 13,
    },
    section: { marginBottom: 15, zIndex: 10 },
    sectionLabel: {
      fontSize: 14,
      fontFamily: 'AlteHaasGroteskBold',
      color: theme.primary,
      marginBottom: 8,
    },
    pillInput: {
      height: 45,
      borderRadius: 25,
      borderWidth: 1.5,
      borderColor: theme.border,
      backgroundColor: theme.card,
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    dateVal: {
      color: theme.text,
      fontFamily: 'AlteHaasGrotesk',
      fontSize: 14,
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
      textAlign: 'center',
    },
    backBtn: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.buttonBg,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: theme.primary,
    },
    footerAction: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 20,
      marginBottom: 40,
    },
    actionBtn: {
      flex: 1,
      backgroundColor: theme.buttonBg,
      borderColor: theme.buttonBorder,
      borderWidth: 1.5,
      borderRadius: 50,
      paddingVertical: 15,
      marginHorizontal: 10,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 50,
      width: '100%',
    },
    btnText: {
      color: theme.primary,
      fontFamily: 'AlteHaasGroteskBold',
      fontSize: 16,
      letterSpacing: 1,
    },
    chevron: { color: theme.primary, fontSize: 20, marginLeft: 10 },
    fadeBottom: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
    },
    dotsIcon: { width: 18, height: 18, resizeMode: 'contain', marginTop: 8 },
  });

export default MedicalReconciliationScreen;
