import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  BackHandler,
  Image,
  Platform,
  useColorScheme,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const backArrow = require('@assets/icons/back_arrow.png');
import useIvsAndLinesData from '../hook/useIvsAndLinesData';
import DataCard from '../components/DataCard';
import PatientSearchBar from '@components/PatientSearchBar';
import SweetAlert from '@components/SweetAlert';
import { useAppTheme } from '@App/theme/ThemeContext';

interface IvsAndLinesScreenProps {
  onBack: () => void;
}

const IvsAndLinesScreen: React.FC<IvsAndLinesScreenProps> = ({ onBack }) => {
  const { isDarkMode, theme, commonStyles } = useAppTheme();
  const styles = useMemo(
    () => createStyles(theme, commonStyles, isDarkMode),
    [theme, commonStyles, isDarkMode],
  );

  // Use the custom hook
  const {
    patientName,
    setPatientName,
    setSelectedPatientId,
    selectedPatientId,
    ivFluid,
    setIvFluid,
    rate,
    setRate,
    site,
    setSite,
    status,
    setStatus,
    handleSubmit,
    isSubmitting,
  } = useIvsAndLinesData();

  // SweetAlert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const handleBackPress = useCallback(() => {
    onBack();
    return true;
  }, [onBack]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    return () => backHandler.remove();
  }, [handleBackPress]);

  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
  ) => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const showDisabledAlert = () => {
    showAlert(
      'Patient Required',
      'Please select a patient first in the search bar before filling out the form.',
      'error',
    );
  };

  const handleFormSubmit = async () => {
    if (!selectedPatientId) {
      showDisabledAlert();
      return;
    }

    try {
      const result = await handleSubmit();
      if (result.action === 'update') {
        showAlert(
          'Edit Success',
          'IVs and Lines record updated successfully!',
          'success',
        );
      } else {
        showAlert(
          'Success',
          'IVs and Lines record saved successfully!',
          'success',
        );
      }
    } catch (error: any) {
      showAlert(
        'Submission Failed',
        error.message || 'Something went wrong. Please try again.',
        'error',
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
    <SafeAreaView style={styles.mainContainer}>
      <View style={{ zIndex: 10 }}>
        <View
          style={{
            paddingHorizontal: 40,
            backgroundColor: theme.background,
            paddingBottom: 15,
          }}
        >
          <View style={[styles.headerContainer, { marginBottom: 0 }]}>
            <Text style={styles.titleText}>IVs and Lines</Text>
            <Text style={styles.dateText}>{formatDate()}</Text>
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
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          <View style={{ height: 20 }} />
          {/* Patient Name Section */}
          <PatientSearchBar
            onPatientSelect={(id, name) => {
              setSelectedPatientId(id);
              setPatientName(name);
            }}
            initialPatientName={patientName}
          />

          {/* Form Sections */}
          <DataCard
            badgeText="IV FLUID"
            value={ivFluid}
            onChangeText={setIvFluid}
            placeholder="e.g., D5W, NS, LR"
            disabled={!selectedPatientId}
            onDisabledPress={showDisabledAlert}
          />
          <DataCard
            badgeText="RATE"
            value={rate}
            onChangeText={setRate}
            placeholder="e.g., 100 ml/hr"
            disabled={!selectedPatientId}
            onDisabledPress={showDisabledAlert}
          />
          <DataCard
            badgeText="SITE"
            value={site}
            onChangeText={setSite}
            placeholder="e.g., Left hand"
            disabled={!selectedPatientId}
            onDisabledPress={showDisabledAlert}
          />
          <DataCard
            badgeText="STATUS"
            value={status}
            onChangeText={setStatus}
            placeholder="e.g., Running"
            disabled={!selectedPatientId}
            onDisabledPress={showDisabledAlert}
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (isSubmitting || !selectedPatientId) && { opacity: 0.7 },
            ]}
            onPress={handleFormSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={theme.surface} />
            ) : (
              <Text style={styles.submitButtonText}>SUBMIT</Text>
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
        onCancel={() => setAlertConfig({ ...alertConfig, visible: false })}
        confirmText="OK"
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: any, commonStyles: any, isDarkMode: boolean) =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 40,
      paddingTop: 0,
      paddingBottom: 20,
    },
    headerContainer: {
      ...commonStyles.header,
      flexDirection: 'column',
    },
    titleText: commonStyles.title,
    dateText: {
      color: theme.textMuted,
      fontSize: 13,
      fontFamily: 'AlteHaasGroteskBold',
      marginTop: 5,
    },
    submitButton: {
      backgroundColor: theme.tableHeader,
      borderColor: theme.primary,
      borderWidth: 1.5,
      borderRadius: 24,
      paddingVertical: 15,
      marginTop: 30,
      marginBottom: 30,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 56,
    },
    submitButtonText: {
      color: theme.primary,
      fontWeight: '700',
      fontSize: 16,
      letterSpacing: 1,
    },
    fadeBottom: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
    },
  });

export default IvsAndLinesScreen;
