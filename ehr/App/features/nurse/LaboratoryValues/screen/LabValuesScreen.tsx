import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Pressable,
  Image,
  BackHandler,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import LabResultCard from '../components/LabResultCard';
import apiClient from '@api/apiClient';
import { useLabValues } from '../hook/useLabValues';
import CDSSModal from '@components/CDSSModal';
import ADPIEScreen from './ADPIEScreen';
import SweetAlert from '@components/SweetAlert';
import PatientSearchBar from '@components/PatientSearchBar';
import { useAppTheme } from '@App/theme/ThemeContext';

const alertIcon = require('@assets/icons/alert.png');

const LAB_TESTS = [
  'WBC (×10⁹/L)',
  'RBC (×10¹²/L)',
  'Hgb (g/dL)',
  'Hct (%)',
  'Platelets (×10⁹/L)',
  'MCV (fL)',
  'MCH (pg)',
  'MCHC (g/dL)',
  'RDW (%)',
  'Neutrophils (%)',
  'Lymphocytes (%)',
  'Monocytes (%)',
  'Eosinophils (%)',
  'Basophils (%)',
];

const LabValuesScreen = ({ onBack }: any) => {
  const { isDarkMode, theme, commonStyles } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, commonStyles, isDarkMode), [theme, commonStyles, isDarkMode]);

  const { alerts, checkLabAlerts, saveLabAssessment } = useLabValues();
  const [labId, setLabId] = useState<number | null>(null);
  const [selectedTest, setSelectedTest] = useState(LAB_TESTS[0]);
  const [result, setResult] = useState('');
  const [normalRange, setNormalRange] = useState('');

  const [isAdpieActive, setIsAdpieActive] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showLabList, setShowLabList] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );
  const [scrollEnabled, setScrollEnabled] = useState(true);

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

  const getBackendPrefix = (label: string) => label.split(' ')[0].toLowerCase();

  useEffect(() => {
    if (!selectedPatientId || !result.trim() || !normalRange.trim()) return;

    const prefix = getBackendPrefix(selectedTest);
    const timer = setTimeout(async () => {
      try {
        await checkLabAlerts(labId as number, {
          [`${prefix}_result`]: result,
          [`${prefix}_normal_range`]: normalRange,
        });
      } catch (e) {
        console.error('Lab CDSS Error:', e);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [result, normalRange, selectedTest, labId, selectedPatientId]);

  const handleCDSSPress = async () => {
    if (!selectedPatientId) {
      return showAlert(
        'Patient Required',
        'Please select a patient first in the search bar.',
      );
    }
    const prefix = getBackendPrefix(selectedTest);
    const payload = {
      patient_id: parseInt(selectedPatientId, 10),
      [`${prefix}_result`]: result,
      [`${prefix}_normal_range`]: normalRange,
    };
    try {
      const res = await saveLabAssessment(payload);
      if (res && res.id) {
        setLabId(res.id);
        setIsAdpieActive(true);
      }
    } catch (e) {
      showAlert('Error', 'Could not initiate nursing process.');
    }
  };

  const handleNextOrSave = async () => {
    if (!selectedPatientId) {
      return showAlert(
        'Patient Required',
        'Please select a patient first in the search bar.',
      );
    }
    const prefix = getBackendPrefix(selectedTest);
    const payload: any = {
      patient_id: parseInt(selectedPatientId, 10),
      [`${prefix}_result`]: result,
      [`${prefix}_normal_range`]: normalRange,
    };
    try {
      if (!labId) {
        const res = await saveLabAssessment(payload);
        if (res && res.id) setLabId(res.id);
      } else {
        await checkLabAlerts(labId, {
          [`${prefix}_result`]: result,
          [`${prefix}_normal_range`]: normalRange,
        });
      }

      if (selectedTest === 'Basophils (%)') {
        showAlert('Success', 'Complete Lab Assessment Saved.', 'success');
        setTimeout(() => onBack(), 1500);
      } else {
        const idx = LAB_TESTS.indexOf(selectedTest);
        setSelectedTest(LAB_TESTS[idx + 1]);
        setResult('');
        setNormalRange('');
      }
    } catch (e) {
      showAlert('Error', 'Submission failed.');
    }
  };

  const handlePatientSelect = (id: number | null, name: string) => {
    setSelectedPatientId(id ? id.toString() : null);
    setSearchText(name);
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

  if (isAdpieActive && labId && selectedPatientId) {
    return (
      <ADPIEScreen
        labId={labId}
        patientId={selectedPatientId}
        patientName={searchText}
        onBack={() => setIsAdpieActive(false)}
      />
    );
  }

  const currentAlert = alerts[`${getBackendPrefix(selectedTest)}_alert`];
  const hasInputData = result.trim() !== '' && normalRange.trim() !== '';
  const isClinicalAlert =
    currentAlert &&
    currentAlert !== 'Normal' &&
    !currentAlert.includes('No result') &&
    !currentAlert.includes('Unable to compare');

  const isFormValid = selectedPatientId && hasInputData;

  return (
    <SafeAreaView style={styles.safeArea}>
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
              <Text style={styles.title}>Laboratory Values</Text>
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowLabList(!showLabList)}>
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
          keyboardShouldPersistTaps="handled"
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={scrollEnabled}
        >
          <View style={{ height: 20 }} />
          {showLabList && (
            <View style={styles.dropdownOverlay}>
              <ScrollView nestedScrollEnabled={true}>
                {LAB_TESTS.map((test, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedTest(test);
                      setShowLabList(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{test}</Text>
                    {selectedTest === test && (
                      <Icon name="check" size={16} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <PatientSearchBar
            initialPatientName={searchText}
            onPatientSelect={handlePatientSelect}
            onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
          />

          <LabResultCard
            testLabel={selectedTest}
            resultValue={result}
            rangeValue={normalRange}
            onResultChange={setResult}
            onRangeChange={setNormalRange}
            disabled={!selectedPatientId}
            onDisabledPress={() =>
              showAlert('Patient Required', 'Please select a patient first.')
            }
          />

          <View style={styles.footerRow}>
            <TouchableOpacity
              style={[
                styles.alertIcon,
                {
                  backgroundColor: isClinicalAlert
                    ? isDarkMode ? '#78350F' : '#FFECBD'
                    : hasInputData && selectedPatientId
                    ? isDarkMode ? '#78350F' : '#FFECBD'
                    : theme.card,
                  borderColor: isClinicalAlert || (hasInputData && selectedPatientId)
                    ? '#EDB62C'
                    : theme.border,
                },
              ]}
              disabled={!hasInputData || !selectedPatientId}
              onPress={() => setModalVisible(true)}
            >
              <Image
                source={alertIcon}
                style={[
                  styles.fullImg,
                  isClinicalAlert || (hasInputData && selectedPatientId)
                    ? { tintColor: '#EDB62C', opacity: 1 }
                    : { tintColor: theme.textMuted, opacity: 0.5 },
                ]}
              />
            </TouchableOpacity>

            {selectedTest === 'Basophils (%)' ? (
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[
                    styles.cdssBtn,
                    isFormValid && {
                      backgroundColor: theme.buttonBg,
                      borderColor: theme.buttonBorder,
                    },
                    !isFormValid && styles.disabledButton,
                  ]}
                  onPress={handleCDSSPress}
                  disabled={!isFormValid}
                >
                  <Text
                    style={[
                      styles.cdssText,
                      isFormValid && { color: theme.primary },
                      !isFormValid && { color: theme.textMuted },
                    ]}
                  >
                    CDSS
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    !isFormValid && styles.disabledButton,
                  ]}
                  onPress={handleNextOrSave}
                  disabled={!isFormValid}
                >
                  <Text
                    style={[
                      styles.submitText,
                      !isFormValid && { color: theme.textMuted },
                    ]}
                  >
                    SUBMIT
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.nextBtn, !isFormValid && styles.disabledButton]}
                onPress={handleNextOrSave}
                disabled={!isFormValid}
              >
                <Text
                  style={[styles.nextText, !isFormValid && { color: theme.textMuted }]}
                >
                  NEXT
                </Text>
                <Icon
                  name="chevron-right"
                  size={20}
                  color={isFormValid ? theme.primary : theme.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
        <LinearGradient
          colors={fadeColors}
          style={styles.fadeBottom}
          pointerEvents="none"
        />
      </View>

      <CDSSModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        alertText={currentAlert || ''}
      />

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

const createStyles = (theme: any, commonStyles: any, isDarkMode: boolean) => StyleSheet.create({
  safeArea: commonStyles.safeArea,
  container: commonStyles.container,
  scrollContent: { paddingBottom: 40 },
  header: commonStyles.header,
  title: commonStyles.title,
  dateText: { fontSize: 13, fontFamily: 'AlteHaasGroteskBold', color: theme.textMuted },
  dropdownOverlay: {
    position: 'absolute',
    top: 90,
    right: 0,
    width: 220,
    maxHeight: 300,
    backgroundColor: theme.card,
    borderRadius: 15,
    zIndex: 1000,
    elevation: 5,
    borderWidth: 1,
    borderColor: theme.border,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  dropdownItemText: { fontSize: 13, color: theme.primary, fontWeight: '500' },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingBottom: 40,
  },
  buttonGroup: { flex: 1, flexDirection: 'row', marginLeft: 10 },
  alertIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  fullImg: { width: '80%', height: '80%', resizeMode: 'contain' },
  cdssBtn: {
    flex: 1,
    height: 50,
    backgroundColor: theme.buttonBg,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.buttonBorder,
    marginRight: 5,
  },
  submitBtn: {
    flex: 1,
    height: 50,
    backgroundColor: theme.buttonBg,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.buttonBorder,
    marginLeft: 5,
  },
  nextBtn: {
    flex: 1,
    marginLeft: 15,
    height: 52,
    backgroundColor: theme.buttonBg,
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.buttonBorder,
  },
  disabledButton: {
    backgroundColor: theme.card,
    borderColor: theme.border,
    opacity: 0.6,
  },
  cdssText: { color: theme.textMuted, fontWeight: 'bold' },
  submitText: { color: theme.primary, fontWeight: 'bold', fontSize: 13 },
  nextText: {
    color: theme.primary,
    fontWeight: 'bold',
    fontSize: 14,
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

export default LabValuesScreen;
