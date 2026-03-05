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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ADLInputCard from '../components/ADLInputCard';
import ADLCDSSStepper from './ADPIEScreen';
import { useADL } from '../hook/useADL';
import SweetAlert from '@components/SweetAlert';
import PatientSearchBar from '@components/PatientSearchBar';
import { useAppTheme } from '@App/theme/ThemeContext';

const initialFormData = {
  mobility: '',
  hygiene: '',
  toileting: '',
  feeding: '',
  hydration: '',
  sleep_pattern: '',
  pain_level: '',
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
  } = useADL();

  const [searchText, setSearchText] = useState('');
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const prevPatientIdRef = useRef<number | null>(null);

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

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' = 'error',
  ) => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [adlId, setAdlId] = useState<number | null>(null);
  const [isAdpieActive, setIsAdpieActive] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

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
      const data = await fetchLatestADL(patientId);
      if (data) {
        setAdlId(data.id);
        setFormData({
          mobility: data.mobility || '',
          hygiene: data.hygiene || '',
          toileting: data.toileting || '',
          feeding: data.feeding || '',
          hydration: data.hydration || '',
          sleep_pattern: data.sleep_pattern || '',
          pain_level: data.pain_level || '',
        });
        setAlerts({
          mobility_alert: data.mobility_alert,
          hygiene_alert: data.hygiene_alert,
          toileting_alert: data.toileting_alert,
          feeding_alert: data.feeding_alert,
          hydration_alert: data.hydration_alert,
          sleep_pattern_alert: data.sleep_pattern_alert,
          pain_level_alert: data.pain_level_alert,
        });
      } else {
        setAdlId(null);
        setFormData(initialFormData);
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
    if (!selectedPatient?.id) return;
    const timer = setTimeout(async () => {
      const hasContent = Object.values(formData).some(
        v => v && v.trim().length > 0,
      );
      if (hasContent) {
        try {
          await checkADLAlerts({
            patient_id: selectedPatient.id,
            ...formData,
          });
        } catch (e) {
          console.error('ADL CDSS Error:', e);
        }
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData, selectedPatient, checkADLAlerts]);

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
      });
      const id = result.id || result.adl_id;
      if (id) {
        setAdlId(id);
        setIsAdpieActive(true);
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
      });

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
    } catch (e) {
      showAlert('Error', 'Submission failed.');
    }
  };

  if (isAdpieActive && adlId && selectedPatient) {
    return (
      <ADLCDSSStepper
        adlId={adlId}
        patientId={selectedPatient.id}
        patientName={searchText}
        onBack={() => setIsAdpieActive(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={styles.container}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
      >
        <View style={styles.header}>
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

        <ADLInputCard
          label="MOBILITY"
          value={formData.mobility}
          disabled={!selectedPatient}
          alertText={alerts.mobility_alert}
          onChangeText={t => setFormData({ ...formData, mobility: t })}
        />
        <ADLInputCard
          label="HYGIENE"
          value={formData.hygiene}
          disabled={!selectedPatient}
          alertText={alerts.hygiene_alert}
          onChangeText={t => setFormData({ ...formData, hygiene: t })}
        />
        <ADLInputCard
          label="TOILETING"
          value={formData.toileting}
          disabled={!selectedPatient}
          alertText={alerts.toileting_alert}
          onChangeText={t => setFormData({ ...formData, toileting: t })}
        />
        <ADLInputCard
          label="FEEDING"
          value={formData.feeding}
          disabled={!selectedPatient}
          alertText={alerts.feeding_alert}
          onChangeText={t => setFormData({ ...formData, feeding: t })}
        />
        <ADLInputCard
          label="HYDRATION"
          value={formData.hydration}
          disabled={!selectedPatient}
          alertText={alerts.hydration_alert}
          onChangeText={t => setFormData({ ...formData, hydration: t })}
        />
        <ADLInputCard
          label="SLEEP PATTERN"
          value={formData.sleep_pattern}
          disabled={!selectedPatient}
          alertText={alerts.sleep_pattern_alert}
          onChangeText={t => setFormData({ ...formData, sleep_pattern: t })}
        />
        <ADLInputCard
          label="PAIN LEVEL"
          value={formData.pain_level}
          disabled={!selectedPatient}
          alertText={alerts.pain_level_alert}
          onChangeText={t => setFormData({ ...formData, pain_level: t })}
        />

        <View style={styles.footerRow}>
          <TouchableOpacity
            style={[
              styles.cdssBtn,
              Object.values(formData).some(v => v) && {
                backgroundColor: theme.buttonBg,
                borderColor: theme.buttonBorder,
              },
            ]}
            onPress={handleCDSSPress}
          >
            <Text
              style={[
                styles.cdssText,
                Object.values(formData).some(v => v) && {
                  color: theme.primary,
                },
              ]}
            >
              CDSS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
            <Text style={styles.submitText}>SUBMIT</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 100 }} />
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
    section: { marginBottom: 15, zIndex: 10 },
    sectionLabel: {
      fontSize: 14,
      fontFamily: 'AlteHaasGroteskBold',
      color: theme.primary,
      marginBottom: 8,
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
      borderWidth: 1,
      borderColor: theme.buttonBorder,
    },
    submitBtn: {
      flex: 1,
      backgroundColor: theme.buttonBg,
      paddingVertical: 15,
      borderRadius: 25,
      alignItems: 'center',
      marginHorizontal: 5,
      borderWidth: 1,
      borderColor: theme.buttonBorder,
    },
    cdssText: { color: theme.textMuted, fontWeight: 'bold' },
    submitText: { color: theme.primary, fontWeight: 'bold' },
  });

export default ADLScreen;
