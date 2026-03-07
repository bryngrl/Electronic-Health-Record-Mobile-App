import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Pressable,
  BackHandler,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MedAdministrationInputCard from '../components/MedAdministrationInputCard';
import { useMedAdministration } from '../hook/useMedAdministration';
import apiClient from '@api/apiClient';
import SweetAlert from '@components/SweetAlert';
import PatientSearchBar from '@components/PatientSearchBar';
import LinearGradient from 'react-native-linear-gradient';
import { useAppTheme } from '@App/theme/ThemeContext';

// UPDATED INTERFACE
interface MedAdministrationScreenProps {
  onBack: () => void;
  readOnly?: boolean;
  patientId?: number;
  initialPatientName?: string;
}

const MedAdministrationScreen = ({ 
  onBack,
  readOnly = false,
  patientId,
  initialPatientName
}: MedAdministrationScreenProps) => {
  const { isDarkMode, theme, commonStyles } = useAppTheme();
  const styles = useMemo(
    () => createStyles(theme, commonStyles, isDarkMode),
    [theme, commonStyles, isDarkMode],
  );

  const {
    step,
    timeSlots,
    formData,
    setFormData,
    updateCurrentMed,
    nextStep,
    saveMedAdministration,
    fetchPatientData,
  } = useMedAdministration();

  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [isNA, setIsNA] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const lastFetched = useRef<{ id: number | null; date: string }>({
    id: null,
    date: '',
  });

  // --- DOCTOR VIEWING LOGIC ---
  useEffect(() => {
    if (readOnly && patientId) {
      // Manually set patient info to trigger fetchPatientData
      setFormData(prev => ({
        ...prev,
        patient_id: patientId,
        patientName: initialPatientName || '',
      }));
    }
  }, [readOnly, patientId, initialPatientName, setFormData]);

  const toggleNA = () => {
    if (readOnly) return; // Disable in Read Only
    const newState = !isNA;
    setIsNA(newState);

    setFormData(prev => {
      const updatedMeds = [...prev.medications];
      const newMed = { ...updatedMeds[step] };
      const fields = ['medication', 'dose', 'route', 'frequency', 'comments'];

      if (newState) {
        fields.forEach(f => {
          (newMed as any)[f] = 'N/A';
        });
      } else {
        fields.forEach(f => {
          if ((newMed as any)[f] === 'N/A') {
            (newMed as any)[f] = '';
          }
        });
      }

      updatedMeds[step] = newMed;
      return { ...prev, medications: updatedMeds };
    });
  };

  useEffect(() => {
    if (formData.patient_id) {
      const currentMed = formData.medications[step];
      const allNA = Object.keys(currentMed)
        .filter(k => k !== 'id')
        .every(k => (currentMed as any)[k] === 'N/A');
      setIsNA(allNA);
    } else {
      setIsNA(false);
    }
  }, [formData.patient_id, step, formData.medications]);

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

  useEffect(() => {
    const backAction = () => {
      onBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [onBack]);

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' = 'error',
  ) => {
    setAlertConfig({ visible: true, title, message, type });
  };

  useEffect(() => {
    if (
      formData.patient_id &&
      (formData.patient_id !== lastFetched.current.id ||
        formData.date !== lastFetched.current.date)
    ) {
      lastFetched.current = { id: formData.patient_id, date: formData.date };
      fetchPatientData(formData.patient_id, formData.date);
    }
  }, [formData.patient_id, formData.date, fetchPatientData]);

  const handlePatientSelect = (id: number | null, name: string) => {
    if (id) {
      setFormData(prev => ({
        ...prev,
        patient_id: id,
        patientName: name,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        patient_id: null,
        patientName: '',
        medications: [
          {
            id: null,
            medication: '',
            dose: '',
            route: '',
            frequency: '',
            comments: '',
          },
          {
            id: null,
            medication: '',
            dose: '',
            route: '',
            frequency: '',
            comments: '',
          },
          {
            id: null,
            medication: '',
            dose: '',
            route: '',
            frequency: '',
            comments: '',
          },
        ],
      }));
    }
  };

  const currentMed = formData.medications[step];
  const isFormValid = !!formData.patient_id;

  const handleAction = async () => {
    // DOCTOR/VIEWING NAVIGATION
    if (readOnly) {
        if (step === 2) {
            onBack(); // Exit on last step
        } else {
            nextStep();
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }
        return;
    }

    // NORMAL NURSE LOGIC
    if (!formData.patient_id) {
      return showAlert(
        'Patient Required',
        'Please select a patient first in the search bar.',
      );
    }

    if (step === 2) {
      try {
        await saveMedAdministration();
        showAlert(
          'Success',
          'Medication Administration records saved successfully.',
          'success',
        );
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      } catch (error: any) {
        showAlert(
          'Error',
          error.message || 'Failed to save medication administration.',
        );
      }
    } else {
      nextStep();
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
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
    if (!readOnly) {
        showAlert(
        'Patient Required',
        'Please select a patient first in the search bar.',
        );
    }
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
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={scrollEnabled}
        >
          <View style={{ height: 20 }} />
          
          {/* SEARCH BAR / STATIC PATIENT */}
          {!readOnly ? (
            <PatientSearchBar
                initialPatientName={formData.patientName}
                onPatientSelect={handlePatientSelect}
                onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
            />
          ) : (
            <View style={styles.staticPatientContainer}>
                <Text style={styles.staticPatientLabel}>PATIENT:</Text>
                <Text style={styles.staticPatientName}>{initialPatientName || "Unknown Patient"}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DATE :</Text>
            <View style={styles.pillInput}>
              <Text style={styles.dateVal}>{formData.date}</Text>
            </View>
          </View>

          {/* HIDE MARK AS N/A IN READ ONLY */}
          {!readOnly && (
            <TouchableOpacity
                style={[styles.naRow, !formData.patient_id && { opacity: 0.5 }]}
                onPress={() => {
                if (!formData.patient_id) {
                    onDisabledPress();
                } else {
                    toggleNA();
                }
                }}
            >
                <Text
                style={[
                    styles.naText,
                    !formData.patient_id && { color: theme.textMuted },
                ]}
                >
                Mark all as N/A
                </Text>
                <Icon
                name={isNA ? 'check-box' : 'check-box-outline-blank'}
                size={22}
                color={formData.patient_id ? theme.primary : theme.textMuted}
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

          {/* Time Progress Banner */}
          <View style={styles.timeBanner}>
            <Text style={styles.timeText}>{timeSlots[step]}</Text>
          </View>

          {/* Input Cards */}
          <MedAdministrationInputCard
            label="Medication"
            value={currentMed.medication}
            onChangeText={t => updateCurrentMed('medication', t)}
            editable={!!formData.patient_id && !isNA && !readOnly}
            onDisabledPress={onDisabledPress}
          />
          <MedAdministrationInputCard
            label="Dose"
            value={currentMed.dose}
            onChangeText={t => updateCurrentMed('dose', t)}
            editable={!!formData.patient_id && !isNA && !readOnly}
            onDisabledPress={onDisabledPress}
          />
          <MedAdministrationInputCard
            label="Route"
            value={currentMed.route}
            onChangeText={t => updateCurrentMed('route', t)}
            editable={!!formData.patient_id && !isNA && !readOnly}
            onDisabledPress={onDisabledPress}
          />
          <MedAdministrationInputCard
            label="Frequency"
            value={currentMed.frequency}
            onChangeText={t => updateCurrentMed('frequency', t)}
            editable={!!formData.patient_id && !isNA && !readOnly}
            onDisabledPress={onDisabledPress}
          />
          <MedAdministrationInputCard
            label="Comments"
            value={currentMed.comments}
            onChangeText={t => updateCurrentMed('comments', t)}
            multiline
            editable={!!formData.patient_id && !isNA && !readOnly}
            onDisabledPress={onDisabledPress}
          />

          {/* Footer Navigation Button */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              (!formData.patient_id && !readOnly) && {
                backgroundColor: theme.buttonDisabledBg,
                borderColor: theme.buttonDisabledBorder,
              },
            ]}
            onPress={handleAction}
            // Allow press if readOnly (for navigation) OR if form valid (for submit)
            disabled={!readOnly && (!isFormValid || (isFormValid && currentMed.medication === '' && !isNA))}
          >
            <Text
              style={[
                styles.actionBtnText,
                (!formData.patient_id && !readOnly) && { color: theme.textMuted },
              ]}
            >
              {/* Logic: 
                  - Step 2 + ReadOnly = CLOSE
                  - Step 2 + Not ReadOnly = SUBMIT
                  - Step < 2 = NEXT
              */}
              {step === 2 ? (readOnly ? 'CLOSE' : 'SUBMIT') : 'NEXT'}
            </Text>
            
            {/* Show Arrow only if NOT on last step */}
            {step < 2 && (
              <Icon
                name="chevron-right"
                size={24}
                color={formData.patient_id || readOnly ? theme.primary : theme.textMuted}
              />
            )}
          </TouchableOpacity>
        </ScrollView>
        <LinearGradient
          colors={fadeColors}
          style={styles.fadeBottom}
          pointerEvents="none"
        />
      </View>

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
    safeArea: commonStyles.safeArea,
    container: commonStyles.container,
    header: commonStyles.header,
    title: commonStyles.title,
    dateText: {
      fontSize: 13,
      fontFamily: 'AlteHaasGroteskBold',
      color: theme.textMuted,
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
    section: { marginBottom: 15, zIndex: 10 },
    sectionLabel: {
      fontSize: 14,
      fontFamily: 'AlteHaasGroteskBold',
      color: theme.primary,
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
    dateVal: {
      color: theme.text,
      fontFamily: 'AlteHaasGrotesk',
      fontSize: 14,
    },
    timeBanner: {
      backgroundColor: theme.tableHeader,
      paddingVertical: 10,
      borderRadius: 20,
      alignItems: 'center',
      marginVertical: 15,
    },
    timeText: {
      color: theme.secondary,
      fontFamily: 'AlteHaasGroteskBold',
      fontSize: 14,
    },
    actionBtn: {
      height: 52,
      backgroundColor: theme.buttonBg,
      borderRadius: 26,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.buttonBorder,
      marginTop: 10,
    },
    disabledButton: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      opacity: 0.6,
    },
    actionBtnText: {
      color: theme.primary,
      fontWeight: 'bold',
      fontSize: 15,
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

export default MedAdministrationScreen;