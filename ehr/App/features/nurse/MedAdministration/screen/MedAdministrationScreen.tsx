// MedAdministration/screen/MedAdministrationScreen.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
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
import { useAppTheme } from '@App/theme/ThemeContext';

const MedAdministrationScreen = ({ onBack }: any) => {
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
  const lastFetched = useRef<{ id: number | null; date: string }>({
    id: null,
    date: '',
  });

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
  const isFormValid =
    formData.patient_id &&
    currentMed.medication &&
    currentMed.medication.trim() !== '';

  const handleAction = async () => {
    if (!formData.patient_id) {
      return showAlert(
        'Patient Required',
        'Please select a patient first in the search bar.',
      );
    }

    if (!currentMed.medication || currentMed.medication.trim() === '') {
      return showAlert(
        'Input Required',
        'Please enter the medication name before proceeding.',
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
      } catch (error: any) {
        showAlert(
          'Error',
          error.message || 'Failed to save medication administration.',
        );
      }
    } else {
      nextStep();
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
    showAlert(
      'Patient Required',
      'Please select a patient first in the search bar.',
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={scrollEnabled}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Medication {'\n'}Administration</Text>
            <Text style={styles.dateText}>{formatDate()}</Text>
          </View>
        </View>

        <PatientSearchBar
          initialPatientName={formData.patientName}
          onPatientSelect={handlePatientSelect}
          onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
        />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DATE :</Text>
          <View style={styles.pillInput}>
            <Text style={styles.dateVal}>{formData.date}</Text>
          </View>
        </View>

        {/* Time Progress Banner */}
        <View style={styles.timeBanner}>
          <Text style={styles.timeText}>{timeSlots[step]}</Text>
        </View>

        {/* Input Cards */}
        <MedAdministrationInputCard
          label="Medication"
          value={currentMed.medication}
          onChangeText={t => updateCurrentMed('medication', t)}
          editable={!!formData.patient_id}
          onDisabledPress={onDisabledPress}
        />
        <MedAdministrationInputCard
          label="Dose"
          value={currentMed.dose}
          onChangeText={t => updateCurrentMed('dose', t)}
          editable={!!formData.patient_id}
          onDisabledPress={onDisabledPress}
        />
        <MedAdministrationInputCard
          label="Route"
          value={currentMed.route}
          onChangeText={t => updateCurrentMed('route', t)}
          editable={!!formData.patient_id}
          onDisabledPress={onDisabledPress}
        />
        <MedAdministrationInputCard
          label="Frequency"
          value={currentMed.frequency}
          onChangeText={t => updateCurrentMed('frequency', t)}
          editable={!!formData.patient_id}
          onDisabledPress={onDisabledPress}
        />
        <MedAdministrationInputCard
          label="Comments"
          value={currentMed.comments}
          onChangeText={t => updateCurrentMed('comments', t)}
          multiline
          editable={!!formData.patient_id}
          onDisabledPress={onDisabledPress}
        />

        {/* Footer Navigation Button */}
        <TouchableOpacity
          style={[styles.actionBtn, !isFormValid && styles.disabledButton]}
          onPress={handleAction}
          disabled={
            !isFormValid &&
            !!formData.patient_id &&
            currentMed.medication !== ''
          }
        >
          <Text
            style={[
              styles.actionBtnText,
              !isFormValid && { color: theme.textMuted },
            ]}
          >
            {step === 2 ? 'SUBMIT' : 'NEXT'}
          </Text>
          {step < 2 && (
            <Icon
              name="chevron-right"
              size={24}
              color={isFormValid ? theme.primary : theme.textMuted}
            />
          )}
        </TouchableOpacity>
      </ScrollView>

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
  });

export default MedAdministrationScreen;
