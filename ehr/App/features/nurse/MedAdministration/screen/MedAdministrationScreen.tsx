// MedAdministration/screen/MedAdministrationScreen.tsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  BackHandler,
  Modal,
  Image,
  Pressable,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import {
  createDotsSettingsModalStyle,
  blurProps,
} from '../../styles/DotsSettingsModalStyle';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MedAdministrationInputCard from '../components/MedAdministrationInputCard';
import { useMedAdministration } from '../hook/useMedAdministration';
import SweetAlert from '@components/SweetAlert';
import PatientSearchBar from '@components/PatientSearchBar';
import LinearGradient from 'react-native-linear-gradient';
import { useAppTheme } from '@App/theme/ThemeContext';

import LoadingOverlay from '@components/LoadingOverlay';

const dotsIcon = require('@assets/icons/dots_icon.png');

const MedAdministrationScreen = ({ onBack, readOnly = false, patientId, initialPatientName }: {
  onBack: any;
  readOnly?: boolean;
  patientId?: number;
  initialPatientName?: string;
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
    step,
    setStep,
    timeSlots,
    formData,
    setFormData,
    updateCurrentMed,
    nextStep,
    saveMedAdministration,
    fetchPatientData,
    isModified,
    isDataEntered,
  } = useMedAdministration();

  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [isNA, setIsNA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Saving Medication Administration...');
  const preNASnapshotRef = useRef<Record<number, any>>({});
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Dedicated state for selected patient ID to trigger fetching properly
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const lastFetchedRef = useRef<{ id: number | null; date: string }>({ id: null, date: '' });

  const toggleNA = () => {
    const newState = !isNA;
    setIsNA(newState);

    setFormData(prev => {
      const updatedMeds = [...prev.medications];
      const newMed = { ...updatedMeds[step] };
      const fields = ['medication', 'dose', 'route', 'frequency', 'comments'];

      if (newState) {
        // Save snapshot for CURRENT step before setting to N/A
        preNASnapshotRef.current[step] = { ...newMed };

        fields.forEach(f => {
          (newMed as any)[f] = 'N/A';
        });
      } else {
        if (preNASnapshotRef.current[step]) {
          // Restore from snapshot
          const snapshot = preNASnapshotRef.current[step];
          fields.forEach(f => {
            (newMed as any)[f] = snapshot[f];
          });
          delete preNASnapshotRef.current[step];
        } else {
          fields.forEach(f => {
            if ((newMed as any)[f] === 'N/A') {
              (newMed as any)[f] = '';
            }
          });
        }
      }

      updatedMeds[step] = newMed;
      return { ...prev, medications: updatedMeds };
    });
  };
  useEffect(() => {
    if (selectedPatientId) {
      const currentMed = formData.medications[step];
      const allNA = ['medication', 'dose', 'route', 'frequency', 'comments']
        .every(k => (currentMed as any)[k] === 'N/A');
      setIsNA(allNA);
    } else {
      setIsNA(false);
    }
  }, [selectedPatientId, step, formData.medications]);

  // SweetAlert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'error',
  });

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
    if (readOnly && patientId) {
      handlePatientSelect(patientId, initialPatientName || '');
    }
  }, [readOnly, patientId]);

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' = 'error',
  ) => {
    setAlertConfig({ visible: true, title, message, type });
  };

  // Robust fetching logic matching Medical History pattern
  useEffect(() => {
    if (selectedPatientId && (selectedPatientId !== lastFetchedRef.current.id || formData.date !== lastFetchedRef.current.date)) {
        lastFetchedRef.current = { id: selectedPatientId, date: formData.date };
        fetchPatientData(selectedPatientId, formData.date);
    }
  }, [selectedPatientId, formData.date, fetchPatientData]);

  const handlePatientSelect = (id: number | null, name: string) => {
    setSelectedPatientId(id);
    if (id) {
      setFormData(prev => ({
        ...prev,
        patient_id: id,
        patientName: name,
      }));
    } else {
      lastFetchedRef.current = { id: null, date: '' };
      setFormData(prev => ({
        ...prev,
        patient_id: null,
        patientName: '',
        medications: [
          { id: null, medication: '', dose: '', route: '', frequency: '', comments: '' },
          { id: null, medication: '', dose: '', route: '', frequency: '', comments: '' },
          { id: null, medication: '', dose: '', route: '', frequency: '', comments: '' },
        ],
      }));
    }
  };

  const currentMed = formData.medications[step];

  const handleAction = async () => {
    if (!selectedPatientId) {
      return showAlert(
        'Patient Required',
        'Please select a patient first in the search bar.',
      );
    }

    try {
      if (isModified) {
        setIsLoading(true);
        setLoadingMessage('Saving Medication Administration...');
        // Save current step data (uses POST updateOrCreate as per API guide)
        await saveMedAdministration();

        // Re-fetch data to ensure everything is in sync with server and cache
        await fetchPatientData(selectedPatientId, formData.date);
        setIsLoading(false);
      }

      if (step === 2) {
        showAlert(
          'Success',
          'Medication Administration records saved successfully.',
          'success',
        );
        // Reset to first stage after final submission
        setStep(0);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      } else {
        nextStep();
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    } catch (error: any) {
      setIsLoading(false);
      showAlert(
        'Error',
        error.message || 'Failed to save medication administration.',
      );
    }
  };

  const handleSelectStage = async (index: number) => {
    if (isModified && selectedPatientId) {
      try {
        await saveMedAdministration();
        await fetchPatientData(selectedPatientId, formData.date);
      } catch (error: any) {
        showAlert('Error', error.message || 'Failed to auto-save before navigation.');
        return;
      }
    }
    setStep(index);
    setIsMenuVisible(false);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const onDisabledPress = () => {
    showAlert(
      'Patient Required',
      'Please select a patient first in the search bar.',
    );
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
              <Text style={styles.title}>Medication {'\n'}Administration</Text>
              <Text style={styles.dateText}>{formatDate()}</Text>
              {readOnly && (
                <Text style={{ fontSize: 14, color: '#E8572A', fontFamily: 'AlteHaasGroteskBold', marginTop: 5 }}>
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
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={scrollEnabled}
        >
          <View style={{ height: 20 }} />
          {!readOnly ? (
            <PatientSearchBar
              initialPatientName={formData.patientName}
              onPatientSelect={handlePatientSelect}
              onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
            />
          ) : (
            <View style={styles.staticPatientContainer}>
              <Text style={styles.staticPatientLabel}>PATIENT:</Text>
              <Text style={styles.staticPatientName}>{initialPatientName || 'Unknown Patient'}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DATE :</Text>
            <View style={styles.pillInput}>
              <Text style={styles.dateVal}>{formData.date}</Text>
            </View>
          </View>

          {!readOnly && (
            <TouchableOpacity
              style={[styles.naRow, !selectedPatientId && { opacity: 0.5 }]}
              onPress={() => {
                if (!selectedPatientId) {
                  onDisabledPress();
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

          {/* Time Progress Banner */}
          <View style={styles.timeBanner}>
            <Text style={styles.timeText}>{timeSlots[step]}</Text>
          </View>

          {/* Input Cards */}
          <MedAdministrationInputCard
            label="Medication"
            value={currentMed?.medication || ''}
            onChangeText={t => updateCurrentMed('medication', t)}
            editable={!!selectedPatientId && !isNA && !readOnly}
            onDisabledPress={onDisabledPress}
          />
          <MedAdministrationInputCard
            label="Dose"
            value={currentMed?.dose || ''}
            onChangeText={t => updateCurrentMed('dose', t)}
            editable={!!selectedPatientId && !isNA && !readOnly}
            onDisabledPress={onDisabledPress}
          />
          <MedAdministrationInputCard
            label="Route"
            value={currentMed?.route || ''}
            onChangeText={t => updateCurrentMed('route', t)}
            editable={!!selectedPatientId && !isNA && !readOnly}
            onDisabledPress={onDisabledPress}
          />
          <MedAdministrationInputCard
            label="Frequency"
            value={currentMed?.frequency || ''}
            onChangeText={t => updateCurrentMed('frequency', t)}
            editable={!!selectedPatientId && !isNA && !readOnly}
            onDisabledPress={onDisabledPress}
          />
          <MedAdministrationInputCard
            label="Comments"
            value={currentMed?.comments || ''}
            onChangeText={t => updateCurrentMed('comments', t)}
            multiline
            editable={!!selectedPatientId && !isNA && !readOnly}
            onDisabledPress={onDisabledPress}
          />

          {!readOnly ? (
            <TouchableOpacity
              style={[
                styles.actionBtn,
                !isModified && {
                  backgroundColor: theme.buttonDisabledBg,
                  borderColor: theme.buttonDisabledBorder,
                },
              ]}
              onPress={handleAction}
              disabled={!isModified}
            >
              <Text
                style={[
                  styles.actionBtnText,
                  !isModified && { color: theme.textMuted },
                ]}
              >
                {step === 2 ? 'SUBMIT' : 'NEXT'}
              </Text>
              {step < 2 && (
                <Icon
                  name="chevron-right"
                  size={24}
                  color={isModified ? theme.primary : theme.textMuted}
                />
              )}
            </TouchableOpacity>
          ) : (
            <View style={{ marginTop: 20 }}>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                <TouchableOpacity
                  style={[
                    styles.navBtn,
                    step === 0 && {
                      backgroundColor: theme.buttonDisabledBg,
                      borderColor: theme.buttonDisabledBorder,
                    },
                  ]}
                  onPress={() => {
                    setStep(step - 1);
                    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                  }}
                  disabled={step === 0}
                >
                  <Text
                    style={[
                      styles.navBtnText,
                      step === 0 && { color: theme.textMuted },
                    ]}
                  >
                    ‹ PREV
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.navBtn,
                    step === 2 && {
                      backgroundColor: theme.buttonDisabledBg,
                      borderColor: theme.buttonDisabledBorder,
                    },
                  ]}
                  onPress={() => {
                    setStep(step + 1);
                    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                  }}
                  disabled={step === 2}
                >
                  <Text
                    style={[
                      styles.navBtnText,
                      step === 2 && { color: theme.textMuted },
                    ]}
                  >
                    NEXT ›
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.navBtn} onPress={onBack}>
                <Text style={styles.navBtnText}>CLOSE</Text>
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
        <Pressable style={dotsModalStyles.modalOverlay} onPress={() => setIsMenuVisible(false)}>
          <BlurView style={dotsModalStyles.blurView} {...blurProps} />
          <Pressable style={dotsModalStyles.menuContainer} onPress={e => e.stopPropagation()}>
            <Text style={dotsModalStyles.menuTitle}>SELECT TIME SLOT</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {timeSlots.map((item: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={dotsModalStyles.menuItem}
                  onPress={() => handleSelectStage(index)}
                >
                  <Text
                    style={[
                      dotsModalStyles.menuItemText,
                      step === index && dotsModalStyles.activeMenuText,
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

      <SweetAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={() => setAlertConfig({ ...alertConfig, visible: false })}
        confirmText="OK"
      />
      <LoadingOverlay visible={isLoading} message={loadingMessage} />
    </SafeAreaView>
  );
};

const createStyles = (theme: any, commonStyles: any, isDarkMode: boolean) =>
  StyleSheet.create({
    safeArea: commonStyles.safeArea,
    container: commonStyles.container,
    header: commonStyles.header,
    title: commonStyles.title,
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
    timeBanner: {
      backgroundColor: theme.tableHeader,
      paddingVertical: 10,
      borderRadius: 25,
      alignItems: 'center',
      marginBottom: 20,
    },
    timeText: {
      color: theme.secondary,
      fontFamily: 'AlteHaasGroteskBold',
      fontSize: 14,
    },
    actionBtn: {
      backgroundColor: theme.buttonBg,
      height: 55,
      borderRadius: 27.5,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: theme.buttonBorder,
      marginTop: 20,
    },
    actionBtnText: {
      color: theme.primary,
      fontFamily: 'AlteHaasGroteskBold',
      fontSize: 18,
    },
    navBtn: {
      flex: 1,
      backgroundColor: theme.buttonBg,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.buttonBorder,
    },
    navBtnText: {
      color: theme.primary,
      fontFamily: 'AlteHaasGroteskBold',
      fontSize: 15,
    },
    fadeBottom: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
    },
    dotsIcon: { width: 18, height: 18, resizeMode: 'contain', marginTop: 8 },
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

export default MedAdministrationScreen;
