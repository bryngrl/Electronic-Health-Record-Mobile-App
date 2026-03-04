import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LabResultCard from '../components/LabResultCard';
import apiClient from '../../../api/apiClient';
import { useLabValues } from '../hook/useLabValues';
import CDSSModal from '../../../components/CDSSModal';
import ADPIEScreen from './ADPIEScreen';
import SweetAlert from '../../../components/SweetAlert';
import PatientSearchBar from '../../../components/PatientSearchBar';

const alertIcon = require('../../../../assets/icons/alert.png');

const THEME_GREEN = '#035022';
// ... (rest of tests and component)

const LAB_TESTS = [
  // ... (rest of the tests)
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
  // ... (rest of the component state and effects)
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

  /**
   * INTEGRATED FIX: REAL-TIME CDSS
// ... (rest of the file)
   * This effect now triggers the bell as you type, provided a patient is selected.
   * We removed the requirement for labId to exist first.
   */
  useEffect(() => {
    // Only proceed if patient is selected and both inputs are filled
    if (!selectedPatientId || !result.trim() || !normalRange.trim()) return;

    const prefix = getBackendPrefix(selectedTest);
    const timer = setTimeout(async () => {
      try {
        // We pass the labId if it exists (for updates), otherwise it sends as null
        await checkLabAlerts(labId as number, {
          [`${prefix}_result`]: result,
          [`${prefix}_normal_range`]: normalRange,
        });
      } catch (e) {
        console.error('Lab CDSS Error:', e);
      }
    }, 1000); // Debounce to prevent too many API calls while typing

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

  /**
   * INTEGRATED FIX: BELL LOGIC
   * The bell becomes active (Gold/Amber) if results are present and the CDSS returns an alert string
   */
  // 1. Get the raw alert string from your hook
  const currentAlert = alerts[`${getBackendPrefix(selectedTest)}_alert`];

  // 2. Check if the user has actually finished entering data
  const hasInputData = result.trim() !== '' && normalRange.trim() !== '';

  // 3. Determine if the alert is "Clinical" (High/Low/Abnormal)
  // vs "Neutral" (Normal/Pending/Error)
  const isClinicalAlert =
    currentAlert &&
    currentAlert !== 'Normal' &&
    !currentAlert.includes('No result') &&
    !currentAlert.includes('Unable to compare');

  const isFormValid = selectedPatientId && hasInputData;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
      >
        <View style={styles.header}>
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
            <Icon name="more-vert" size={35} color={THEME_GREEN} />
          </TouchableOpacity>
        </View>

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
                    <Icon name="check" size={16} color={THEME_GREEN} />
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
                  ? '#FFECBD'
                  : hasInputData && selectedPatientId
                  ? '#E5FFE8'
                  : '#F0F0F0',
              },
            ]}
            disabled={!hasInputData || !selectedPatientId}
            onPress={() => setModalVisible(true)}
          >
            <Image
              source={alertIcon}
              style={[
                styles.fullImg,
                isClinicalAlert
                  ? { tintColor: '#EDB62C', opacity: 1 }
                  : hasInputData && selectedPatientId
                  ? { tintColor: '#29A539', opacity: 0.8 }
                  : { tintColor: '#9E9E9E', opacity: 0.5 },
              ]}
            />
          </TouchableOpacity>

          {selectedTest === 'Basophils (%)' ? (
            // ... (rest of the TSX)
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[
                  styles.cdssBtn,
                  isFormValid && {
                    backgroundColor: '#DCFCE7',
                    borderColor: THEME_GREEN,
                  },
                  !isFormValid && styles.disabledButton,
                ]}
                onPress={handleCDSSPress}
                disabled={!isFormValid}
              >
                <Text
                  style={[
                    styles.cdssText,
                    isFormValid && { color: THEME_GREEN },
                    !isFormValid && { color: '#9E9E9E' },
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
                    !isFormValid && { color: '#9E9E9E' },
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
                style={[styles.nextText, !isFormValid && { color: '#9E9E9E' }]}
              >
                NEXT
              </Text>
              <Icon
                name="chevron-right"
                size={20}
                color={isFormValid ? THEME_GREEN : '#9E9E9E'}
              />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

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

const styles = StyleSheet.create({
  // ... (rest of the styles)
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 25 },
  scrollContent: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 25,
  },
  title: {
    fontSize: 35,
    color: THEME_GREEN,
    fontFamily: 'MinionPro-SemiboldItalic',
  },
  dateText: { fontSize: 13, fontFamily: 'AlteHaasGroteskBold', color: '#999' },
  dropdownOverlay: {
    position: 'absolute',
    top: 90,
    right: 0,
    width: 220,
    maxHeight: 300,
    backgroundColor: '#fff',
    borderRadius: 15,
    zIndex: 1000,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemText: { fontSize: 13, color: THEME_GREEN, fontWeight: '500' },
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
    borderColor: '#F0F0F0',
  },
  fullImg: { width: '80%', height: '80%', resizeMode: 'contain' },
  cdssBtn: {
    flex: 1,
    height: 50,
    backgroundColor: '#F3F4F6',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 5,
  },
  submitBtn: {
    flex: 1,
    height: 50,
    backgroundColor: '#DCFCE7',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME_GREEN,
    marginLeft: 5,
  },
  nextBtn: {
    flex: 1,
    marginLeft: 15,
    height: 52,
    backgroundColor: '#DCFCE7',
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME_GREEN,
  },
  disabledButton: {
    backgroundColor: '#F0F0F0',
    borderColor: '#E0E0E0',
    opacity: 0.6,
  },
  cdssText: { color: '#6B7280', fontWeight: 'bold' },
  submitText: { color: THEME_GREEN, fontWeight: 'bold', fontSize: 13 },
  nextText: {
    color: THEME_GREEN,
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 5,
  },
});

export default LabValuesScreen;
