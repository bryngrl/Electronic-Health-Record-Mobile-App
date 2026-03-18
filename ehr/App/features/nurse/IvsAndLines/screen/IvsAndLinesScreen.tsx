import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  BackHandler,
  Image,
  Platform,
  useColorScheme,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

import LoadingOverlay from '@components/LoadingOverlay';

const backArrow = require('@assets/icons/back_arrow.png');
import useIvsAndLinesData from '../hook/useIvsAndLinesData';
import DataCard from '../components/DataCard';
import PatientSearchBar from '@components/PatientSearchBar';
import SweetAlert from '@components/SweetAlert';
import { useAppTheme } from '@App/theme/ThemeContext';
import apiClient from '@api/apiClient'; // Import apiClient for manual fetch

// UPDATED INTERFACE
interface IvsAndLinesScreenProps {
  onBack: () => void;
  readOnly?: boolean;
  patientId?: number;
  initialPatientName?: string;
}

const IvsAndLinesScreen: React.FC<IvsAndLinesScreenProps> = ({ 
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
    isModified,
    isDataEntered,
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

  const [isNA, setIsNA] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Saving IVs and Lines...');
  const preNASnapshotRef = useRef<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // --- DOCTOR VIEWING LOGIC ---
  useEffect(() => {
    if (readOnly && patientId) {
      setSelectedPatientId(patientId);
      setPatientName(initialPatientName || '');
      
      // Manually fetch data for viewing since hook might rely on search selection
      const fetchData = async () => {
        try {
            const response = await apiClient.get(`/ivs-and-lines/patient/${patientId}`);
            if (response.data && response.data.length > 0) {
                const latest = response.data[0];
                setIvFluid(latest.iv_fluid || '');
                setRate(latest.rate || '');
                setSite(latest.site || '');
                setStatus(latest.status || '');
                
                if (latest.iv_fluid === 'N/A' && latest.rate === 'N/A' && latest.site === 'N/A') {
                    setIsNA(true);
                } else {
                    setIsNA(false);
                }
            } else {
                setIvFluid('');
                setRate('');
                setSite('');
                setStatus('');
                setIsNA(false);
            }
        } catch (error) {
            console.error("Error fetching IV data:", error);
        }
      };
      fetchData();
    }
  }, [readOnly, patientId, initialPatientName]);

  const toggleNA = () => {
    if (readOnly) return; // Disable in read-only
    const newState = !isNA;
    setIsNA(newState);
    if (newState) {
      // Save snapshot before setting to N/A
      preNASnapshotRef.current = {
        ivFluid,
        rate,
        site,
        status,
      };
      setIvFluid('N/A');
      setRate('N/A');
      setSite('N/A');
      setStatus('N/A');
    } else {
      if (preNASnapshotRef.current) {
        // Restore from snapshot
        setIvFluid(preNASnapshotRef.current.ivFluid);
        setRate(preNASnapshotRef.current.rate);
        setSite(preNASnapshotRef.current.site);
        setStatus(preNASnapshotRef.current.status);
        preNASnapshotRef.current = null;
      } else {
        if (ivFluid === 'N/A') setIvFluid('');
        if (rate === 'N/A') setRate('');
        if (site === 'N/A') setSite('');
        if (status === 'N/A') setStatus('');
      }
    }
  };

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

  useEffect(() => {
    if (selectedPatientId) {
      const allNA =
        ivFluid === 'N/A' &&
        rate === 'N/A' &&
        site === 'N/A' &&
        status === 'N/A';
      setIsNA(allNA);
    } else {
      setIsNA(false);
    }
  }, [selectedPatientId, ivFluid, rate, site, status]);

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
    if (!readOnly) {
      showAlert(
        'Patient Required',
        'Please select a patient first in the search bar.',
        'error',
      );
    }
  };

  const handleFormSubmit = async () => {
    if (readOnly) {
        onBack();
        return;
    }

    if (!selectedPatientId) {
      showDisabledAlert();
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Saving IVs and Lines...');
    try {
      const result = await handleSubmit();
      setIsLoading(false);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
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
      setIsLoading(false);
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
          ref={scrollViewRef}
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          scrollEnabled={scrollEnabled}
        >
          <View style={{ height: 20 }} />
          
          {/* SEARCH BAR TOGGLE */}
          {!readOnly ? (
            <PatientSearchBar
                onPatientSelect={(id, name) => {
                setSelectedPatientId(id);
                setPatientName(name);
                }}
                initialPatientName={patientName}
                onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
            />
          ) : (
            <View style={styles.staticPatientContainer}>
                <Text style={styles.staticPatientLabel}>PATIENT:</Text>
                <Text style={styles.staticPatientName}>{initialPatientName || "Unknown Patient"}</Text>
            </View>
          )}

          {/* HIDE TOGGLE IN READ ONLY */}
          {!readOnly && (
            <TouchableOpacity
                style={[styles.naRow, !selectedPatientId && { opacity: 0.5 }]}
                onPress={() => {
                if (!selectedPatientId) {
                    showDisabledAlert();
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

          {/* Form Sections */}
          <DataCard
            badgeText="IV FLUID"
            value={ivFluid}
            onChangeText={setIvFluid}
            placeholder="e.g., D5W, NS, LR"
            disabled={!selectedPatientId || isNA || readOnly}
            onDisabledPress={showDisabledAlert}
          />
          <DataCard
            badgeText="RATE"
            value={rate}
            onChangeText={setRate}
            placeholder="e.g., 100 ml/hr"
            disabled={!selectedPatientId || isNA || readOnly}
            onDisabledPress={showDisabledAlert}
          />
          <DataCard
            badgeText="SITE"
            value={site}
            onChangeText={setSite}
            placeholder="e.g., Left hand"
            disabled={!selectedPatientId || isNA || readOnly}
            onDisabledPress={showDisabledAlert}
          />
          <DataCard
            badgeText="STATUS"
            value={status}
            onChangeText={setStatus}
            placeholder="e.g., Running"
            disabled={!selectedPatientId || isNA || readOnly}
            onDisabledPress={showDisabledAlert}
          />

          {/* Submit/Close Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              !readOnly && !isModified && {
                backgroundColor: theme.buttonDisabledBg,
                borderColor: theme.buttonDisabledBorder,
              },
            ]}
            onPress={handleFormSubmit}
            disabled={isSubmitting || (!readOnly && !isModified)}
          >
            {isSubmitting ? (
              <ActivityIndicator color={theme.primary} />
            ) : (
              <Text
                style={[
                  styles.submitButtonText,
                  !readOnly && !isModified && { color: theme.textMuted },
                ]}
              >
                {readOnly ? 'CLOSE' : 'SUBMIT'}
              </Text>
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
        type={alertConfig.type as any}
        onConfirm={() => setAlertConfig({ ...alertConfig, visible: false })}
        onCancel={() => setAlertConfig({ ...alertConfig, visible: false })}
        confirmText="OK"
      />
      <LoadingOverlay visible={isLoading} message={loadingMessage} />
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
    submitButton: {
      backgroundColor: theme.buttonBg,
      borderColor: theme.buttonBorder,
      borderWidth: 1.5,
      borderRadius: 50,
      paddingVertical: 15,
      marginTop: 10,
      marginBottom: 70,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 30,
    },
    submitButtonText: {
      color: theme.primary,
      fontFamily: 'AlteHaasGroteskBold',
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