import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  BackHandler,
  Platform,
  StatusBar,
  Image,
} from 'react-native';

const alertIcon = require('@assets/icons/alert.png');

const initialFormData = {
  mobility_assessment: '',
  hygiene_assessment: '',
  toileting_assessment: '',
  feeding_assessment: '',
  hydration_assessment: '',
  sleep_pattern_assessment: '',
  pain_level_assessment: '',
};

const ADLScreen = ({ onBack }: any) => {
  const { isDarkMode, theme, commonStyles } = useAppTheme();
  const styles = useMemo(
    () => createStyles(theme, commonStyles, isDarkMode),
    [theme, commonStyles, isDarkMode],
  );

  const {
    alerts,
    setAlerts,
    checkADLAlerts,
    saveADLAssessment,
    fetchLatestADL,
    dataAlert,
    fetchDataAlert,
  } = useADL();

  const [searchText, setSearchText] = useState('');
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const prevPatientIdRef = useRef<number | null>(null);

  // SweetAlert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'error',
  });

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' = 'error',
  ) => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [adlId, setAdlId] = useState<number | null>(null);
  const [isAdpieActive, setIsAdpieActive] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [isNA, setIsNA] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const toggleNA = () => {
    const newState = !isNA;
    setIsNA(newState);

    if (newState) {
      // Set all fields to "N/A"
      const updatedData = { ...formData };
      Object.keys(initialFormData).forEach(key => {
        (updatedData as any)[key] = 'N/A';
      });
      setFormData(updatedData);
    } else {
      // Clear fields if they were "N/A"
      const updatedData = { ...formData };
      Object.keys(initialFormData).forEach(key => {
        if ((updatedData as any)[key] === 'N/A') {
          (updatedData as any)[key] = '';
        }
      });
      setFormData(updatedData);
    }
  };

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

  const loadPatientData = useCallback(
    async (patientId: number) => {
      fetchDataAlert(patientId);
      const data = await fetchLatestADL(patientId);
      if (data) {
        setAdlId(data.id);
        const newFormData = {
          mobility_assessment: data.mobility_assessment || data.mobility || '',
          hygiene_assessment: data.hygiene_assessment || data.hygiene || '',
          toileting_assessment: data.toileting_assessment || data.toileting || '',
          feeding_assessment: data.feeding_assessment || data.feeding || '',
          hydration_assessment: data.hydration_assessment || data.hydration || '',
          sleep_pattern_assessment: data.sleep_pattern_assessment || data.sleep_pattern || '',
          pain_level_assessment: data.pain_level_assessment || data.pain_level || '',
        };
        setFormData(newFormData);

        // Check if all fields are N/A
        const allNA = Object.values(newFormData).every(v => v === 'N/A');
        setIsNA(allNA);

        setAlerts({
          mobility_assessment_alert: data.mobility_assessment_alert || data.mobility_alert,
          hygiene_assessment_alert: data.hygiene_assessment_alert || data.hygiene_alert,
          toileting_assessment_alert: data.toileting_assessment_alert || data.toileting_alert,
          feeding_assessment_alert: data.feeding_assessment_alert || data.feeding_alert,
          hydration_assessment_alert: data.hydration_assessment_alert || data.hydration_alert,
          sleep_pattern_assessment_alert: data.sleep_pattern_assessment_alert || data.sleep_pattern_alert,
          pain_level_assessment_alert: data.pain_level_assessment_alert || data.pain_level_alert,
        });
      } else {
        setAdlId(null);
        setFormData(initialFormData);
        setIsNA(false);
        setAlerts({});
      }
    },
    [fetchLatestADL, setAlerts],
  );

  useEffect(() => {
    if (selectedPatient?.id !== prevPatientIdRef.current) {
      prevPatientIdRef.current = selectedPatient?.id || null;
      if (selectedPatient?.id) {
        loadPatientData(selectedPatient.id);
      } else {
        setAdlId(null);
        setFormData(initialFormData);
        setIsNA(false);
        setAlerts({});
      }
    }
  }, [selectedPatient, loadPatientData, setAlerts]);

  const getCurrentDateFormatted = () => {
    return new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateDayNumber = () => {
    if (!selectedPatient?.admission_date) return '';
    const admission = new Date(selectedPatient.admission_date);
    const today = new Date();
    admission.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - admission.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays.toString() : '1';
  };

  useEffect(() => {
    if (!selectedPatient?.id || isNA) return;
    const timer = setTimeout(async () => {
      const hasContent = Object.values(formData).some(
        v => v && v.trim().length > 0 && v !== 'N/A',
      );
      if (hasContent) {
        try {
          await checkADLAlerts({
            patient_id: selectedPatient.id,
            ...formData,
          }, adlId);
        } catch (e) {
          console.error('ADL CDSS Error:', e);
        }
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData, selectedPatient, checkADLAlerts, isNA, adlId]);

  const handleCDSSPress = async () => {
    if (!selectedPatient) {
      return showAlert(
        'Patient Required',
        'Please select a patient first in the search bar.',
      );
    }
    try {
      const result = await saveADLAssessment({
        patient_id: selectedPatient.id,
        ...formData,
      }, adlId);
      const id = result.id || result.adl_id;
      if (id) {
        setAdlId(id);
        setIsAdpieActive(true);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    } catch (e) {
      showAlert('Error', 'Could not initiate clinical support.');
    }
  };

  const handleSave = async () => {
    if (!selectedPatient) {
      return showAlert(
        'Patient Required',
        'Please select a patient first in the search bar.',
      );
    }
    try {
      const result = await saveADLAssessment({
        patient_id: selectedPatient.id,
        ...formData,
      }, adlId);

      const newId = result.id || result.adl_id;
      const isUpdate = !!adlId || result.updated_at !== result.created_at;

      if (newId) setAdlId(newId);

      showAlert(
        isUpdate ? 'Successfully Updated' : 'Successfully Submitted',
        `ADL Assessment has been ${
          isUpdate ? 'updated' : 'submitted'
        } successfully.`,
        'success',
      );

      loadPatientData(selectedPatient.id);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } catch (e) {
      showAlert('Error', 'Submission failed.');
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

  const generateFindingsSummary = () => {
    const findings = Object.entries(formData)
      .filter(([_, value]) => value && value.trim() !== '' && value !== 'N/A')
      .map(([key, value]) => {
        const label = key.replace(/_assessment/g, '').replace(/_/g, ' ').toUpperCase();
        return `${label}: ${value}`;
      });
    
    // Also include alerts if they are critical
    const criticalAlerts = Object.entries(alerts)
      .filter(([_, value]) => typeof value === 'string' && value.trim() !== '' && !value.toLowerCase().includes('normal'))
      .map(([_, value]) => value as string);

    const summary = [...findings, ...criticalAlerts];
    if (dataAlert) summary.push(dataAlert);

    return summary.join('. ');
  };

  if (isAdpieActive && adlId && selectedPatient) {
    return (
      <ADPIEScreen
        recordId={adlId}
        patientName={searchText}
        feature="adl"
        findingsSummary={generateFindingsSummary()}
        onBack={() => {
          setIsAdpieActive(false);
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }}
      />
    );
  }

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
              <Text style={styles.title}>Activities of Daily Living</Text>
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
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
          style={styles.container}
          showsVerticalScrollIndicator={false}
          scrollEnabled={scrollEnabled}
        >
          <View style={{ height: 20 }} />
          <PatientSearchBar
            onPatientSelect={(id, name, patientObj) => {
              setSearchText(name);
              setSelectedPatient(patientObj);
            }}
            onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
            initialPatientName={searchText}
          />

          <View style={styles.section}>
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.sectionLabel}>DATE :</Text>
                <View style={styles.inputBox}>
                  <Text style={styles.inputText}>
                    {getCurrentDateFormatted()}
                  </Text>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionLabel}>DAY NO. :</Text>
                <View style={styles.inputBox}>
                  <Text style={styles.inputText}>{calculateDayNumber()}</Text>
                  <Icon
                    name="arrow-drop-down"
                    size={24}
                    color={theme.primary}
                    style={{ position: 'absolute', right: 10 }}
                  />
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.naRow, !selectedPatient && { opacity: 0.5 }]}
            onPress={() => {
              if (!selectedPatient) {
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
                !selectedPatient && { color: theme.textMuted },
              ]}
            >
              Mark all as N/A
            </Text>
            <Icon
              name={isNA ? 'check-box' : 'check-box-outline-blank'}
              size={22}
              color={selectedPatient ? theme.primary : theme.textMuted}
            />
          </TouchableOpacity>

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

          <ADLInputCard
            label="MOBILITY"
            value={formData.mobility_assessment}
            disabled={!selectedPatient || isNA}
            alertText={alerts.mobility_assessment_alert}
            dataAlert={dataAlert}
            onChangeText={t => setFormData({ ...formData, mobility_assessment: t })}
            onDisabledPress={() => {
              if (!selectedPatient) {
                showAlert(
                  'Patient Required',
                  'Please select a patient first in the search bar.',
                );
              }
            }}
          />
          <ADLInputCard
            label="HYGIENE"
            value={formData.hygiene_assessment}
            disabled={!selectedPatient || isNA}
            alertText={alerts.hygiene_assessment_alert}
            dataAlert={dataAlert}
            onChangeText={t => setFormData({ ...formData, hygiene_assessment: t })}
            onDisabledPress={() => {
              if (!selectedPatient) {
                showAlert(
                  'Patient Required',
                  'Please select a patient first in the search bar.',
                );
              }
            }}
          />
          <ADLInputCard
            label="TOILETING"
            value={formData.toileting_assessment}
            disabled={!selectedPatient || isNA}
            alertText={alerts.toileting_assessment_alert}
            dataAlert={dataAlert}
            onChangeText={t => setFormData({ ...formData, toileting_assessment: t })}
            onDisabledPress={() => {
              if (!selectedPatient) {
                showAlert(
                  'Patient Required',
                  'Please select a patient first in the search bar.',
                );
              }
            }}
          />
          <ADLInputCard
            label="FEEDING"
            value={formData.feeding_assessment}
            disabled={!selectedPatient || isNA}
            alertText={alerts.feeding_assessment_alert}
            dataAlert={dataAlert}
            onChangeText={t => setFormData({ ...formData, feeding_assessment: t })}
            onDisabledPress={() => {
              if (!selectedPatient) {
                showAlert(
                  'Patient Required',
                  'Please select a patient first in the search bar.',
                );
              }
            }}
          />
          <ADLInputCard
            label="HYDRATION"
            value={formData.hydration_assessment}
            disabled={!selectedPatient || isNA}
            alertText={alerts.hydration_assessment_alert}
            dataAlert={dataAlert}
            onChangeText={t => setFormData({ ...formData, hydration_assessment: t })}
            onDisabledPress={() => {
              if (!selectedPatient) {
                showAlert(
                  'Patient Required',
                  'Please select a patient first in the search bar.',
                );
              }
            }}
          />
          <ADLInputCard
            label="SLEEP PATTERN"
            value={formData.sleep_pattern_assessment}
            disabled={!selectedPatient || isNA}
            alertText={alerts.sleep_pattern_assessment_alert}
            dataAlert={dataAlert}
            onChangeText={t => setFormData({ ...formData, sleep_pattern_assessment: t })}
            onDisabledPress={() => {
              if (!selectedPatient) {
                showAlert(
                  'Patient Required',
                  'Please select a patient first in the search bar.',
                );
              }
            }}
          />
          <ADLInputCard
            label="PAIN LEVEL"
            value={formData.pain_level_assessment}
            disabled={!selectedPatient || isNA}
            alertText={alerts.pain_level_assessment_alert}
            dataAlert={dataAlert}
            onChangeText={t => setFormData({ ...formData, pain_level_assessment: t })}
            onDisabledPress={() => {
              if (!selectedPatient) {
                showAlert(
                  'Patient Required',
                  'Please select a patient first in the search bar.',
                );
              }
            }}
          />

          <View style={styles.footerRow}>
            <TouchableOpacity
              style={[
                styles.cdssBtn,
                !selectedPatient && {
                  backgroundColor: theme.buttonDisabledBg,
                  borderColor: theme.buttonDisabledBorder,
                },
              ]}
              onPress={handleCDSSPress}
              disabled={!selectedPatient}
            >
              <Text
                style={[
                  styles.cdssText,
                  !selectedPatient
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
                !selectedPatient && {
                  backgroundColor: theme.buttonDisabledBg,
                  borderColor: theme.buttonDisabledBorder,
                },
              ]}
              onPress={handleSave}
              disabled={!selectedPatient}
            >
              <Text
                style={[
                  styles.submitText,
                  !selectedPatient && { color: theme.textMuted },
                ]}
              >
                SUBMIT
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 100 }} />
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
    inputBox: {
      height: 48,
      borderRadius: 25,
      borderWidth: 1.5,
      borderColor: theme.border,
      paddingHorizontal: 20,
      justifyContent: 'center',
      backgroundColor: theme.card,
      marginBottom: 15,
    },
    inputText: {
      fontSize: 14,
      color: theme.text,
      fontFamily: 'AlteHaasGrotesk',
    },
    row: { flexDirection: 'row', marginTop: 5 },
    safeArea: commonStyles.safeArea,
    container: commonStyles.container,
    header: commonStyles.header,
    title: commonStyles.title,
    dateText: {
      fontSize: 13,
      fontFamily: 'AlteHaasGroteskBold',
      color: theme.textMuted,
    },
    alertIcon: {
      width: 45,
      height: 45,
      borderRadius: 22.5,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
    },
    fullImg: { width: '80%', height: '80%', resizeMode: 'contain' },
    section: { marginBottom: 15, zIndex: 10 },
    sectionLabel: {
      fontSize: 14,
      fontFamily: 'AlteHaasGroteskBold',
      color: theme.primary,
      marginBottom: 8,
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
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
      paddingBottom: 40,
    },
    cdssBtn: {
      flex: 1,
      backgroundColor: theme.buttonBg,
      paddingVertical: 15,
      borderRadius: 25,
      alignItems: 'center',
      marginHorizontal: 5,
      borderWidth: 1.5,
      borderColor: theme.buttonBorder,
    },
    submitBtn: {
      flex: 1,
      backgroundColor: theme.buttonBg,
      paddingVertical: 15,
      borderRadius: 25,
      alignItems: 'center',
      marginHorizontal: 5,
      borderWidth: 1.5,
      borderColor: theme.buttonBorder,
    },
    cdssText: {
      color: theme.primary,
      fontFamily: 'AlteHaasGroteskBold',
      fontSize: 16,
    },
    submitText: {
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
  });

export default ADLScreen;
