import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import LabResultCard from '../components/LabResultCard';
import apiClient from '@api/apiClient';
import { useLabValues } from '../hook/useLabValues';
import CDSSModal from '@components/CDSSModal';
import ADPIEScreen from '@components/ADPIEScreen';
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

// UPDATED INTERFACE
interface LabValuesScreenProps {
  onBack: () => void;
  readOnly?: boolean;
  patientId?: number;
  initialPatientName?: string;
}

const LabValuesScreen = ({ 
  onBack, 
  readOnly = false, 
  patientId, 
  initialPatientName 
}: LabValuesScreenProps) => {
  const { isDarkMode, theme, commonStyles } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, commonStyles, isDarkMode), [theme, commonStyles, isDarkMode]);

  const {
    alerts,
    checkLabAlerts,
    saveLabAssessment,
    fetchLatestLabValues,
    setAlerts,
    dataAlert,
    fetchDataAlert,
  } = useLabValues();
  const [labId, setLabId] = useState<number | null>(null);
  const [selectedTest, setSelectedTest] = useState(LAB_TESTS[0]);
  const [result, setResult] = useState('');
  const [normalRange, setNormalRange] = useState('');
  const [allLabData, setAllLabData] = useState<any>({});

  const [isAdpieActive, setIsAdpieActive] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showLabList, setShowLabList] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [isNA, setIsNA] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const getBackendPrefix = (label: string) => label.split(' ')[0].toLowerCase();

  // --- DOCTOR VIEWING LOGIC ---
  // Initialize with passed props if in readOnly mode
  useEffect(() => {
    if (readOnly && patientId) {
      setSelectedPatientId(patientId.toString());
      setSearchText(initialPatientName || '');
    }
  }, [readOnly, patientId, initialPatientName]);

  // Fetch data when test changes in Read Only mode
  useEffect(() => {
    if (readOnly && selectedPatientId) {
      // Helper to fetch data for the selected test
      const fetchTestData = async () => {
        try {
          // Assuming endpoint /lab-values/patient/:id returns list of records
          // We will fetch the latest one and extract the specific test data
          const prefix = getBackendPrefix(selectedTest);
          const response = await apiClient.get(`/lab-values/patient/${selectedPatientId}`);
          
          if (response.data && response.data.length > 0) {
            // Get the latest record (assuming sorted desc or first item)
            const latest = response.data[0];
            const resVal = latest[`${prefix}_result`];
            const rangeVal = latest[`${prefix}_normal_range`];
            
            setResult(resVal || '');
            setNormalRange(rangeVal || '');
            
            if (resVal === 'N/A' && rangeVal === 'N/A') {
                setIsNA(true);
            } else {
                setIsNA(false);
            }
          } else {
             setResult('');
             setNormalRange('');
          }
        } catch (error) {
          console.log("Error fetching lab data:", error);
          // Fallback if fetch fails
          setResult('');
          setNormalRange('');
        }
      };
      fetchTestData();
    }
  }, [selectedTest, selectedPatientId, readOnly]);


  const toggleNA = () => {
    if (readOnly) return;
    const newState = !isNA;
    setIsNA(newState);
    if (newState) {
      setResult('N/A');
      setNormalRange('N/A');
    } else {
      if (result === 'N/A') setResult('');
      if (normalRange === 'N/A') setNormalRange('');
    }
  };

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

  // CDSS Check - Disable in Read Only to avoid unnecessary API calls
  useEffect(() => {
    if (readOnly) return; 
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
  }, [result, normalRange, selectedTest, labId, selectedPatientId, readOnly]);

  const [passedAlert, setPassedAlert] = useState<string | null>(null);

  const handleCDSSPress = async () => {
    if (readOnly) return;

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
      const res = await saveLabAssessment(payload, labId);
      if (res && res.id) {
        setLabId(res.id);
        if (res.assessment_alert || res.alert) {
          setPassedAlert(res.assessment_alert || res.alert);
        }
        setIsAdpieActive(true);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    } catch (e) {
      showAlert('Error', 'Could not initiate nursing process.');
    }
  };

  const handleNextOrSave = async () => {
    // READ ONLY NAVIGATION LOGIC
    if (readOnly) {
        if (selectedTest === LAB_TESTS[LAB_TESTS.length - 1]) {
            onBack(); // Exit on last item
        } else {
            const idx = LAB_TESTS.indexOf(selectedTest);
            setSelectedTest(LAB_TESTS[idx + 1]);
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }
        return;
    }

    // NORMAL LOGIC
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
      let finalRes;
      if (!labId) {
        finalRes = await saveLabAssessment(payload, labId);
        if (finalRes && finalRes.id) setLabId(finalRes.id);
      } else {
        finalRes = await saveLabAssessment(payload, labId);
        await checkLabAlerts(labId, {
          [`${prefix}_result`]: result,
          [`${prefix}_normal_range`]: normalRange,
        });
      }

      // Update local storage of all results
      if (finalRes) {
          setAllLabData(finalRes);
      }

      if (selectedTest === 'Basophils (%)') {
        showAlert('Success', 'Complete Lab Assessment Saved.', 'success');
        setTimeout(() => onBack(), 1500);
      } else {
        const idx = LAB_TESTS.indexOf(selectedTest);
        const nextTest = LAB_TESTS[idx + 1];
        setSelectedTest(nextTest);
        
        // Load data for NEXT test if it exists
        const nextPrefix = getBackendPrefix(nextTest);
        setResult(allLabData[`${nextPrefix}_result`] || (isNA ? 'N/A' : ''));
        setNormalRange(allLabData[`${nextPrefix}_normal_range`] || (isNA ? 'N/A' : ''));
        
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    } catch (e) {
      showAlert('Error', 'Submission failed.');
    }
  };

  const handlePatientSelect = async (id: number | null, name: string) => {
    setSelectedPatientId(id ? id.toString() : null);
    setSearchText(name);
    if (id) {
      fetchDataAlert(id);
      const data = await fetchLatestLabValues(id);
      if (data) {
        setLabId(data.id);
        setAllLabData(data);
        const prefix = getBackendPrefix(selectedTest);
        setResult(data[`${prefix}_result`] || '');
        setNormalRange(data[`${prefix}_normal_range`] || '');
        setAlerts(data);
      } else {
        setLabId(null);
        setAllLabData({});
        setResult('');
        setNormalRange('');
        setAlerts({});
      }
    } else {
      setLabId(null);
      setAllLabData({});
      setResult('');
      setNormalRange('');
      setAlerts({});
    }
  };

  // Sync inputs when test changes
  useEffect(() => {
      const prefix = getBackendPrefix(selectedTest);
      setResult(allLabData[`${prefix}_result`] || (isNA ? 'N/A' : ''));
      setNormalRange(allLabData[`${prefix}_normal_range`] || (isNA ? 'N/A' : ''));
  }, [selectedTest]);

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
    const findings = Object.entries(allLabData)
      .filter(([key, value]) => key.endsWith('_result') && typeof value === 'string' && value.trim() !== '' && value !== 'N/A')
      .map(([key, value]) => {
          const test = key.replace('_result', '').toUpperCase();
          return `${test}: ${value}`;
      });
    
    if (dataAlert) {
      findings.push(dataAlert);
    }

    return findings.join('. ');
  };

  if (isAdpieActive && labId && selectedPatientId) {
    return (
      <ADPIEScreen
        recordId={labId}
        patientName={searchText}
        feature="lab-values"
        findingsSummary={generateFindingsSummary()}
        initialAlert={passedAlert || undefined}
        onBack={() => {
          setIsAdpieActive(false);
          setPassedAlert(null);
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }}
        readOnly={readOnly} // Pass readOnly if supported by ADPIE
      />
    );
  }

  const currentAlert = alerts[`${getBackendPrefix(selectedTest)}_alert`];
  // In read only, we rely on fetched data
  const hasInputData = result.trim() !== '' && normalRange.trim() !== '';
  const isClinicalAlert =
    (currentAlert &&
    currentAlert !== 'Normal' &&
    !currentAlert.includes('No result') &&
    !currentAlert.includes('Unable to compare')) || (dataAlert && dataAlert.trim() !== '');

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
          ref={scrollViewRef}
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

          {/* PATIENT SEARCH BAR TOGGLE */}
          {!readOnly ? (
            <PatientSearchBar
                initialPatientName={searchText}
                onPatientSelect={handlePatientSelect}
                onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
            />
          ) : (
             <View style={styles.staticPatientContainer}>
                <Text style={styles.staticPatientLabel}>PATIENT:</Text>
                <Text style={styles.staticPatientName}>{initialPatientName || "Unknown Patient"}</Text>
             </View>
          )}

          {/* HIDE MARK AS N/A IN READ ONLY */}
          {!readOnly && (
            <TouchableOpacity
                style={[styles.naRow, !selectedPatientId && { opacity: 0.5 }]}
                onPress={() => {
                if (!selectedPatientId) {
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

          <LabResultCard
            testLabel={selectedTest}
            resultValue={result}
            rangeValue={normalRange}
            onResultChange={setResult}
            onRangeChange={setNormalRange}
            // Disable inputs in Read Only
            disabled={!selectedPatientId || isNA || readOnly}
            onDisabledPress={() => {
              if (!readOnly && !selectedPatientId) {
                showAlert(
                  'Patient Required',
                  'Please select a patient first in the search bar.',
                );
              }
            }}
          />

          <View style={styles.footerRow}>
            {/* ALERT BUTTON: Visible in both Edit and ReadOnly */}
            <TouchableOpacity
              style={[
                styles.alertIcon,
                {
                  backgroundColor: isClinicalAlert
                    ? isDarkMode
                      ? '#78350F'
                      : '#FFECBD'
                    : selectedPatientId
                    ? isDarkMode
                      ? '#78350F'
                      : '#FFECBD'
                    : isDarkMode
                    ? '#333'
                    : '#EBEBEB',
                  borderColor:
                    isClinicalAlert || selectedPatientId
                      ? '#EDB62C'
                      : theme.border,
                },
              ]}
              disabled={!selectedPatientId}
              onPress={() => setModalVisible(true)}
            >
              <Image
                source={alertIcon}
                style={[
                  styles.fullImg,
                  isClinicalAlert || selectedPatientId
                    ? { tintColor: '#EDB62C', opacity: 1 }
                    : { tintColor: theme.textMuted, opacity: 0.5 },
                ]}
              />
            </TouchableOpacity>

            {/* BUTTON LOGIC: 
                - In Read Only: Always show NEXT (until last item which becomes FINISH)
                - In Nurse Mode: Show CDSS/SUBMIT for last item, NEXT for others
            */}
            
            {!readOnly && selectedTest === 'Basophils (%)' ? (
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[
                    styles.cdssBtn,
                    (!selectedPatientId || (!hasInputData && !isNA)) && {
                      backgroundColor: theme.buttonDisabledBg,
                      borderColor: theme.buttonDisabledBorder,
                    },
                  ]}
                  onPress={handleCDSSPress}
                  disabled={!selectedPatientId}
                >
                  <Text
                    style={[
                      styles.cdssText,
                      (!selectedPatientId || (!hasInputData && !isNA))
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
                    !selectedPatientId && {
                      backgroundColor: theme.buttonDisabledBg,
                      borderColor: theme.buttonDisabledBorder,
                    },
                  ]}
                  onPress={handleNextOrSave}
                  disabled={!selectedPatientId}
                >
                  <Text
                    style={[
                      styles.submitText,
                      !selectedPatientId && { color: theme.textMuted },
                    ]}
                  >
                    SUBMIT
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              // READ ONLY or NOT LAST ITEM
              <TouchableOpacity
                style={[
                  styles.nextBtn,
                  !selectedPatientId && {
                    backgroundColor: theme.buttonDisabledBg,
                    borderColor: theme.buttonDisabledBorder,
                  },
                ]}
                onPress={handleNextOrSave}
                disabled={!selectedPatientId}
              >
                <Text
                  style={[
                    styles.nextText,
                    !selectedPatientId && { color: theme.textMuted },
                  ]}
                >
                  {readOnly && selectedTest === LAB_TESTS[LAB_TESTS.length - 1] ? 'FINISH' : 'NEXT'}
                </Text>
                <Icon
                  name={readOnly && selectedTest === LAB_TESTS[LAB_TESTS.length - 1] ? "check" : "chevron-right"}
                  size={20}
                  color={selectedPatientId ? theme.primary : theme.textMuted}
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
        alertText={dataAlert ? `${dataAlert}${currentAlert ? '\n\n' + currentAlert : ''}` : (currentAlert || 'No clinical findings found.')}
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
  // Static Patient Styles
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