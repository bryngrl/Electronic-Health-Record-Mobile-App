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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LabResultCard from '../components/LabResultCard';
import apiClient from '../../../api/apiClient';
import { useLabValues } from '../hook/useLabValues';
import CDSSModal from '../../../components/CDSSModal';
import ADPIEScreen from './ADPIEScreen';
import SweetAlert from '../../../components/SweetAlert';

const THEME_GREEN = '#035022';
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
  const { alerts, checkLabAlerts, saveLabAssessment } = useLabValues();
  const [labId, setLabId] = useState<number | null>(null);
  const [selectedTest, setSelectedTest] = useState(LAB_TESTS[0]);
  const [result, setResult] = useState('');
  const [normalRange, setNormalRange] = useState('');

  const [isAdpieActive, setIsAdpieActive] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showLabList, setShowLabList] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );

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

  const getBackendPrefix = (label: string) => label.split(' ')[0].toLowerCase();

  useEffect(() => {
    apiClient.get('/patients/').then(res => {
      const normalized = (res.data || []).map((p: any) => ({
        id: (p.patient_id ?? p.id).toString(),
        fullName: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
      }));
      setPatients(normalized);
    });
  }, []);

  /**
   * INTEGRATED FIX: REAL-TIME CDSS
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

  // 4. THE FIX: The bell is "Active" (clickable) if there is data.
  // It is "Highlighted" (Gold) only if there is a clinical alert.
  const isBellActive = hasInputData && isClinicalAlert;
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
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

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PATIENT NAME :</Text>
          <TextInput
            style={styles.searchBar}
            placeholder="Select or type Patient name"
            value={searchText}
            onChangeText={text => {
              setSearchText(text);
              setFilteredPatients(
                patients.filter(p =>
                  p.fullName.toLowerCase().includes(text.toLowerCase()),
                ),
              );
              setShowDropdown(true);
            }}
          />
          {showDropdown && filteredPatients.length > 0 && (
            <View style={styles.searchDropdown}>
              {filteredPatients.map(p => (
                <Pressable
                  key={p.id}
                  onPress={() => {
                    setSelectedPatientId(p.id);
                    setSearchText(p.fullName);
                    setShowDropdown(false);
                  }}
                  style={styles.dropItem}
                >
                  <Text>{p.fullName}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

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
            style={[styles.bellBtn, isBellActive && styles.activeBell]}
            onPress={() => isBellActive && setModalVisible(true)}
          >
            <Icon
              name={
                isBellActive ? 'notifications-active' : 'notifications-none'
              }
              size={24}
              color={isBellActive ? '#B45309' : '#6B7280'}
            />
          </TouchableOpacity>

          {selectedTest === 'Basophils (%)' ? (
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.cdssBtn}
                onPress={handleCDSSPress}
              >
                <Text style={styles.cdssText}>CDSS</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleNextOrSave}
              >
                <Text style={styles.submitText}>SUBMIT</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.nextBtn} onPress={handleNextOrSave}>
              <Text style={styles.nextText}>NEXT</Text>
              <Icon name="chevron-right" size={20} color={THEME_GREEN} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <CDSSModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        alertText={currentAlert}
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
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 25 },
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
  dateText: { fontSize: 13, color: '#999' },
  section: { marginBottom: 25, zIndex: 10 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME_GREEN,
    marginBottom: 8,
  },
  searchBar: {
    borderRadius: 25,
    paddingHorizontal: 20,
    height: 48,
    borderWidth: 1,
    borderColor: '#F2F2F2',
    fontSize: 13,
    color: '#333',
  },
  searchDropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    position: 'absolute',
    top: 75,
    left: 0,
    right: 0,
    zIndex: 99,
    elevation: 3,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 90,
    right: 25,
    width: 220,
    maxHeight: 300,
    backgroundColor: '#fff',
    borderRadius: 15,
    zIndex: 100,
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
  dropItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingBottom: 40,
  },
  buttonGroup: { flex: 1, flexDirection: 'row', marginLeft: 10 },
  bellBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6', // Default Gray-ish
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBell: {
    backgroundColor: '#FFFBEB', // Amber background
    borderColor: '#FDE68A',
  },
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
