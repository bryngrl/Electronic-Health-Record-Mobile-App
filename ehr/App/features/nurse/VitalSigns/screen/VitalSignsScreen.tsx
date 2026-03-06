import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Pressable,
  StatusBar,
  ActivityIndicator,
  Modal,
  FlatList,
  Image,
  Dimensions,
  BackHandler,
  Animated,
  Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import VitalCard from '@nurse/VitalSigns/component/VitalCard';
import PreciseVitalChart from '@nurse/VitalSigns/component/VitalSignsChart';
import { useVitalSignsLogic } from '@nurse/VitalSigns/hook/useVitalSignsLogic';
import SweetAlert from '@components/SweetAlert';
import CDSSModal from '@components/CDSSModal';
import ADPIEScreen from '@nurse/VitalSigns/screen/ADPIEScreen';
import PatientSearchBar from '@components/PatientSearchBar';
import { useAppTheme } from '@App/theme/ThemeContext';
import apiClient from '@api/apiClient';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.72;
const ITEM_SPACING = 15;
const SNAP_INTERVAL = ITEM_WIDTH + ITEM_SPACING;

const alertIcon = require('@assets/icons/alert.png');
const arrowIcon = require('@assets/icons/ARROW.png');
const backArrow = require('@assets/icons/back_arrow.png');
const nextArrow = require('@assets/icons/next_arrow.png');

interface VitalSignsScreenProps {
  onBack: () => void;
  readOnly?: boolean;
  patientId?: number;
  initialPatientName?: string;
  initialRecordId?: number;
}

const VitalSignsScreen: React.FC<VitalSignsScreenProps> = ({ 
  onBack, 
  readOnly = false, 
  patientId,
  initialPatientName,
  initialRecordId
}) => {
  const { isDarkMode, theme, commonStyles } = useAppTheme();
  const styles = useMemo(
    () => createStyles(theme, commonStyles, isDarkMode),
    [theme, commonStyles, isDarkMode],
  );

  const {
    vitals,
    handleUpdateVital,
    patientName,
    selectedPatientId,
    setSelectedPatient,
    currentTime,
    currentTimeIndex,
    vitalKeys,
    chartData,
    handleNextTime,
    selectTime,
    TIME_SLOTS,
    isDataEntered,
    isDataComplete,
    currentAlert,
    saveAssessment,
    isMenuVisible,
    setIsMenuVisible,
  } = useVitalSignsLogic();

  const [chartIndex, setChartIndex] = useState(0);
  const chartListRef = useRef<FlatList>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [cdssVisible, setCdssVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [selectedPatient, setSelectedPatientFull] = useState<any | null>(null);

  const [isAdpieActive, setIsAdpieActive] = useState(false);
  const [recordId, setRecordId] = useState<number | null>(initialRecordId || null);
  const [isNA, setIsNA] = useState(false);

  const toggleNA = () => {
    if (readOnly) return;
    const newState = !isNA;
    setIsNA(newState);
    if (newState) {
      vitalKeys.forEach(k => handleUpdateVital(k as any, 'N/A'));
    } else {
      vitalKeys.forEach(k => {
        if (vitals[k as keyof typeof vitals] === 'N/A') {
          handleUpdateVital(k as any, '');
        }
      });
    }
  };

  useEffect(() => {
    if (patientId) {
      setSelectedPatient(patientId.toString(), initialPatientName || '');
      apiClient.get(`/patients/${patientId}`).then(res => {
        setSelectedPatientFull(res.data);
      });
      if (!initialRecordId) {
        apiClient.get(`/vital-signs/patient/${patientId}`).then(res => {
          if (res.data && res.data.length > 0) setRecordId(res.data[0].id);
        });
      }
    }
  }, [patientId, initialPatientName, initialRecordId]);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (selectedPatientId) {
      const allNA = Object.values(vitals).every(v => v === 'N/A');
      setIsNA(allNA);
    } else {
      setIsNA(false);
    }
  }, [selectedPatientId, vitals]);

  useEffect(() => {
    if (isDataComplete && !readOnly) triggerShake();
  }, [isDataComplete, readOnly]);

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true, easing: Easing.linear }),
    ]).start();
  };

  const calculateDayNumber = () => {
    if (!selectedPatient?.admission_date) return '1';
    const admission = new Date(selectedPatient.admission_date);
    const today = new Date();
    admission.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - admission.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays.toString() : '1';
  };

  const scrollChart = (direction: 'next' | 'prev') => {
    const nextIdx = direction === 'next' ? chartIndex + 1 : chartIndex - 1;
    if (nextIdx >= 0 && nextIdx < vitalKeys.length) {
      setChartIndex(nextIdx);
      chartListRef.current?.scrollToOffset({ offset: nextIdx * SNAP_INTERVAL, animated: true });
    }
  };

  const handleAlertPress = async () => {
    if (readOnly) { setCdssVisible(true); return; }
    if (!selectedPatientId) return setAlertVisible(true);
    const dayNo = parseInt(calculateDayNumber(), 10);
    const res = await saveAssessment(dayNo);
    if (res && res.id) {
      setRecordId(res.id);
      setCdssVisible(true);
    }
  };

  const handleNextPress = async () => {
    if (readOnly) {
        if (currentTimeIndex === TIME_SLOTS.length - 1) onBack();
        else handleNextTime();
        return;
    }
    if (!selectedPatientId) return setAlertVisible(true);
    if (isDataEntered || isNA) {
      const dayNo = parseInt(calculateDayNumber(), 10);
      const res = await saveAssessment(dayNo);
      if (res && res.id) {
        setRecordId(res.id);
        if (currentTimeIndex === TIME_SLOTS.length - 1) {
          setSuccessVisible(true);
          return;
        }
      }
    }
    handleNextTime();
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleCDSSPress = async () => {
    if (readOnly) {
        if (recordId) setIsAdpieActive(true);
        return;
    }
    if (!selectedPatientId) return setAlertVisible(true);
    const dayNo = parseInt(calculateDayNumber(), 10);
    const res = await saveAssessment(dayNo);
    if (res && res.id) {
      setRecordId(res.id);
      setIsAdpieActive(true);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else if (recordId) {
      setIsAdpieActive(true);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleBackPress = useCallback(() => {
    if (isAdpieActive) {
      setIsAdpieActive(false);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return true;
    }
    if (isMenuVisible) {
      setIsMenuVisible(false);
      return true;
    }
    onBack();
    return true;
  }, [isAdpieActive, isMenuVisible, onBack]);

  useEffect(() => {
    const bh = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => bh.remove();
  }, [handleBackPress]);

  if (isAdpieActive && recordId) {
    return (
      <ADPIEScreen
        recordId={recordId}
        patientName={patientName}
        readOnly={readOnly}
        onBack={() => {
          setIsAdpieActive(false);
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor="transparent" translucent={true} />
      <View style={{ zIndex: 10 }}>
        <View style={{ paddingHorizontal: 40, backgroundColor: theme.background, paddingBottom: 15 }}>
          <View style={[styles.header, { marginBottom: 0 }]}>
            <View style={{ flex: 1 }}>
                <Text style={styles.title}>Vital Signs</Text>
                <Text style={styles.subDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
            </View>
            <TouchableOpacity onPress={() => setIsMenuVisible(true)}><Text style={styles.menuDots}>⋮</Text></TouchableOpacity>
          </View>
        </View>
        <LinearGradient colors={isDarkMode ? ['#121212', 'transparent'] : ['#FFF', 'transparent']} style={{ height: 20 }} pointerEvents="none" />
      </View>

      <View style={{ flex: 1, marginTop: -20 }}>
        <ScrollView ref={scrollViewRef} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} scrollEnabled={scrollEnabled}>
          <View style={{ height: 20 }} />
          <PatientSearchBar
            onPatientSelect={(id, name, patientObj) => {
              if (!readOnly) {
                setSelectedPatient(id ? id.toString() : null, name);
                setSelectedPatientFull(patientObj);
              }
            }}
            onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
            initialPatientName={patientName}
          />

          <View style={styles.row}>
            <View style={{ flex: 1.2, marginRight: 10 }}>
              <Text style={styles.fieldLabel}>DATE :</Text>
              <View style={styles.pillInput}><Text style={styles.dateVal}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text></View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>DAY NO :</Text>
              <View style={[styles.pillInput, styles.dropdownRow]}>
                <Text style={styles.dateVal}>{calculateDayNumber()}</Text>
                <Image source={arrowIcon} style={[styles.arrowIconImage, { tintColor: theme.textMuted }]} />
              </View>
            </View>
          </View>

          <View style={styles.chartCarousel}>
            {chartIndex > 0 && (
              <TouchableOpacity style={[styles.navArrow, { left: -10 }]} onPress={() => scrollChart('prev')}>
                <View style={styles.arrowCircle}><Image source={backArrow} style={[styles.arrowImg, { tintColor: theme.primary }]} /></View>
              </TouchableOpacity>
            )}
            <FlatList
              ref={chartListRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={SNAP_INTERVAL}
              decelerationRate="fast"
              data={vitalKeys}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <View style={{ width: ITEM_WIDTH, marginRight: ITEM_SPACING }}>
                  <PreciseVitalChart label={item.toUpperCase()} data={chartData[item as keyof typeof chartData]} />
                </View>
              )}
            />
            {chartIndex < vitalKeys.length - 1 && (
              <TouchableOpacity style={[styles.navArrow, { right: 0 }]} onPress={() => scrollChart('next')}>
                <View style={styles.arrowCircle}><Image source={nextArrow} style={[styles.arrowImg, { tintColor: theme.primary }]} /></View>
              </TouchableOpacity>
            )}
          </View>

          {!readOnly && (
            <>
              <TouchableOpacity
                style={[styles.naRow, !selectedPatientId && { opacity: 0.5 }]}
                onPress={() => { if (!selectedPatientId) setAlertVisible(true); else toggleNA(); }}
              >
                <Text style={[styles.naText, !selectedPatientId && { color: theme.textMuted }]}>Mark all as N/A</Text>
                <Icon name={isNA ? 'check-box' : 'check-box-outline-blank'} size={22} color={selectedPatientId ? theme.primary : theme.textMuted} />
              </TouchableOpacity>
              <Text style={[styles.disabledTextAtBottom, isNA && { color: theme.error }]}>
                {isNA ? 'All fields below are disabled.' : 'Checking this will disable all fields below.'}
              </Text>
            </>
          )}

          <View style={styles.timeBanner}><Text style={styles.timeText}>{currentTime}</Text></View>

          <View style={{ opacity: selectedPatientId ? 1 : 0.6 }}>
            {vitalKeys.map(key => (
              <VitalCard
                key={key}
                label={key.toUpperCase()}
                value={vitals[key as keyof typeof vitals]}
                onChangeText={v => handleUpdateVital(key as any, v)}
                disabled={!selectedPatientId || isNA || readOnly}
                onDisabledPress={() => { if (!selectedPatientId) setAlertVisible(true); }}
              />
            ))}
          </View>

          <View style={styles.footerAction}>
            <TouchableOpacity
                style={[styles.alertIcon, { backgroundColor: currentAlert ? '#FFECBD' : (isDarkMode ? '#333' : '#EBEBEB'), borderColor: '#EDB62C' }]}
                onPress={handleAlertPress}
              >
                <Image source={alertIcon} style={[styles.fullImg, { tintColor: '#EDB62C' }]} />
            </TouchableOpacity>

            <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[styles.cdssButton, (!selectedPatientId || (!isDataEntered && !isNA && !readOnly)) && { backgroundColor: theme.buttonDisabledBg, borderColor: theme.buttonDisabledBorder }]}
                  onPress={handleCDSSPress}
                  disabled={!selectedPatientId}
                >
                  <Text style={[styles.cdssBtnText, (!selectedPatientId || (!isDataEntered && !isNA && !readOnly)) && { color: theme.textMuted }]}>
                    {readOnly ? 'VIEW ADPIE' : 'CDSS'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.submitButton, (!selectedPatientId || (!isDataEntered && !isNA && !readOnly)) && styles.disabledButton]}
                  onPress={handleNextPress}
                  disabled={!selectedPatientId}
                >
                  <Text style={[styles.submitBtnText, !selectedPatientId && { color: theme.textMuted }]}>
                    {currentTimeIndex === TIME_SLOTS.length - 1 ? (readOnly ? 'FINISH' : 'SUBMIT') : 'NEXT'}
                  </Text>
                </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        <LinearGradient colors={fadeColors} style={styles.fadeBottom} pointerEvents="none" />
      </View>

      <SweetAlert visible={alertVisible} title="Alert" message="Please select a patient first." type="error" onConfirm={() => setAlertVisible(false)} />
      <SweetAlert visible={successVisible} title="Success" message="Vital Signs saved successfully." type="success" onConfirm={() => { setSuccessVisible(false); onBack(); }} />
      <CDSSModal visible={cdssVisible} onClose={() => setCdssVisible(false)} category="VITAL SIGNS ASSESSMENT" alertText={currentAlert?.message || 'Stable findings.'} />

      <Modal transparent visible={isMenuVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>SELECT TIME SLOT</Text>
            <FlatList
              data={TIME_SLOTS}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity style={styles.menuItem} onPress={() => { selectTime(index); setIsMenuVisible(false); }}>
                  <Text style={[styles.menuItemText, currentTimeIndex === index && styles.activeMenuText]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeMenuBtn} onPress={() => setIsMenuVisible(false)}><Text style={styles.closeMenuText}>CLOSE</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (theme: any, commonStyles: any, isDarkMode: boolean) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background },
    scrollContent: { paddingHorizontal: 40, paddingBottom: 20 },
    header: commonStyles.header,
    title: commonStyles.title,
    subDate: { color: theme.textMuted, fontSize: 13, fontFamily: 'AlteHaasGroteskBold' },
    menuDots: { fontSize: 28, color: theme.primary },
    fieldLabel: { color: theme.primary, fontFamily: 'AlteHaasGroteskBold', fontSize: 14, marginBottom: 8 },
    pillInput: { borderWidth: 1.5, borderColor: theme.border, borderRadius: 25, height: 45, paddingHorizontal: 20, justifyContent: 'center', backgroundColor: theme.card },
    dateVal: { color: theme.text, fontFamily: 'AlteHaasGrotesk' },
    row: { flexDirection: 'row' },
    dropdownRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 15 },
    arrowIconImage: { width: 12, height: 12, resizeMode: 'contain' },
    naRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 5, marginTop: 5 },
    naText: { fontSize: 14, fontFamily: 'AlteHaasGroteskBold', color: theme.primary, marginRight: 8 },
    disabledTextAtBottom: { fontSize: 13, fontFamily: 'AlteHaasGroteskBold', color: theme.textMuted, textAlign: 'right', marginBottom: 25 },
    chartCarousel: { height: 210, marginVertical: 20, position: 'relative' },
    navArrow: { position: 'absolute', top: '38%', zIndex: 10 },
    arrowCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#c6e9c289', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: theme.secondary },
    arrowImg: { width: 25, height: 25, resizeMode: 'contain', backgroundColor: 'transparent' },
    timeBanner: { backgroundColor: theme.tableHeader, paddingVertical: 10, borderRadius: 20, alignItems: 'center', marginBottom: 10 },
    timeText: { color: theme.secondary, fontFamily: 'AlteHaasGroteskBold', fontSize: 14 },
    footerAction: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 30 },
    alertIcon: { width: 45, height: 45, justifyContent: 'center', alignItems: 'center', borderRadius: 22.5, borderWidth: 1 },
    fullImg: { width: '70%', height: '70%', resizeMode: 'contain' },
    buttonGroup: { flex: 1, flexDirection: 'row', marginLeft: 15 },
    cdssButton: { flex: 1, height: 48, backgroundColor: theme.buttonBg, borderRadius: 25, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: theme.buttonBorder, marginRight: 5 },
    cdssBtnText: { color: theme.primary, fontFamily: 'AlteHaasGroteskBold', fontSize: 14 },
    submitButton: { flex: 1, height: 48, backgroundColor: theme.buttonBg, borderRadius: 25, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: theme.buttonBorder, marginLeft: 5 },
    submitBtnText: { color: theme.primary, fontFamily: 'AlteHaasGroteskBold', fontSize: 14 },
    disabledButton: { backgroundColor: theme.surface, borderColor: theme.border, opacity: 0.6 },
    modalOverlay: { flex: 1, backgroundColor: theme.overlay, justifyContent: 'center', alignItems: 'center' },
    menuContainer: { width: '85%', backgroundColor: theme.card, borderRadius: 25, padding: 25, maxHeight: '80%' },
    menuTitle: { fontSize: 18, fontWeight: 'bold', color: theme.primary, marginBottom: 20, textAlign: 'center' },
    menuItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: theme.border },
    menuItemText: { fontSize: 16, color: theme.text, textAlign: 'center' },
    activeMenuText: { color: theme.secondary, fontWeight: 'bold' },
    closeMenuBtn: { marginTop: 20, backgroundColor: theme.surface, paddingVertical: 12, borderRadius: 20, alignItems: 'center' },
    closeMenuText: { color: theme.primary, fontWeight: 'bold' },
    fadeBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 },
  });

export default VitalSignsScreen;
