import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  StatusBar,
  Pressable,
  Modal as RNModal,
  Animated,
  Easing,
} from 'react-native';
import VitalCard from '../component/VitalCard';
import PreciseVitalChart from '../component/VitalSignsChart';
import { useVitalSignsLogic } from '../hook/useVitalSignsLogic';
import SweetAlert from '../../../components/SweetAlert';
import CDSSModal from '../../../components/CDSSModal';
import ADPIEScreen from './ADPIEScreen';
import PatientSearchBar from '../../../components/PatientSearchBar';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.72;
const ITEM_SPACING = 15;
const SNAP_INTERVAL = ITEM_WIDTH + ITEM_SPACING;

const alertIcon = require('../../../../assets/icons/alert.png');
const arrowIcon = require('../../../../assets/icons/ARROW.png');
const backArrow = require('../../../../assets/icons/back_arrow.png');
const nextArrow = require('../../../../assets/icons/next_arrow.png');

interface VitalSignsScreenProps {
  onBack: () => void;
}

const VitalSignsScreen: React.FC<VitalSignsScreenProps> = ({ onBack }) => {
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
    reset,
  } = useVitalSignsLogic();

  const [chartIndex, setChartIndex] = useState(0);
  const chartListRef = useRef<FlatList>(null);
  const [cdssVisible, setCdssVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [selectedPatient, setSelectedPatientFull] = useState<any | null>(null);

  const [isAdpieActive, setIsAdpieActive] = useState(false);
  const [recordId, setRecordId] = useState<number | null>(null);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isDataComplete) {
      triggerShake();
    }
  }, [isDataComplete]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
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

  const scrollChart = (direction: 'next' | 'prev') => {
    const nextIdx = direction === 'next' ? chartIndex + 1 : chartIndex - 1;
    if (nextIdx >= 0 && nextIdx < vitalKeys.length) {
      setChartIndex(nextIdx);
      chartListRef.current?.scrollToOffset({
        offset: nextIdx * SNAP_INTERVAL,
        animated: true,
      });
    }
  };

  const handleAlertPress = async () => {
    if (!selectedPatientId) {
      return setAlertVisible(true);
    }
    const res = await saveAssessment();
    if (res && res.id) setRecordId(res.id);
    setCdssVisible(true);
  };

  const handleSelectTimeSlot = (index: number) => {
    selectTime(index);
    setIsMenuVisible(false);
  };

  const handleNextPress = async () => {
    if (!selectedPatientId) {
      return setAlertVisible(true);
    }

    if (isDataEntered) {
      const res = await saveAssessment();
      if (res && res.id) {
        setRecordId(res.id);
        // If it's the last slot, show success message
        if (currentTimeIndex === TIME_SLOTS.length - 1) {
          setSuccessVisible(true);
          return;
        }
      }
    }
    handleNextTime();
  };

  const handleCDSSPress = async () => {
    if (!selectedPatientId) {
      return setAlertVisible(true);
    }
    const res = await saveAssessment();
    if (res && res.id) {
      setRecordId(res.id);
      setIsAdpieActive(true);
    } else if (recordId) {
      setIsAdpieActive(true);
    }
  };

  const isLastTimeSlot = currentTimeIndex === TIME_SLOTS.length - 1;

  if (isAdpieActive && recordId) {
    return (
      <ADPIEScreen
        recordId={recordId}
        patientName={patientName}
        onBack={() => setIsAdpieActive(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={scrollEnabled}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Vital Signs</Text>
            <Text style={styles.subDate}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setIsMenuVisible(true)}>
            <Text style={styles.menuDots}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Info Section / Search Bar */}
        <PatientSearchBar
          onPatientSelect={(id, name, patientObj) => {
            setSelectedPatient(id ? id.toString() : null, name);
            setSelectedPatientFull(patientObj);
          }}
          onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
          initialPatientName={patientName}
        />

        <View style={styles.row}>
          <View style={{ flex: 1.2, marginRight: 10 }}>
            <Text style={styles.fieldLabel}>DATE :</Text>
            <View style={styles.pillInput}>
              <Text style={styles.dateVal}>
                {new Date().toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>DAY NO. :</Text>
            <View style={[styles.pillInput, styles.dropdownRow]}>
              <Text style={styles.dateVal}>{calculateDayNumber()}</Text>
              <Image source={arrowIcon} style={styles.arrowIconImage} />
            </View>
          </View>
        </View>

        {/* CHART CAROUSEL */}
        <View style={styles.chartCarousel}>
          {chartIndex > 0 && (
            <TouchableOpacity
              style={[styles.navArrow, { left: -10 }]}
              onPress={() => scrollChart('prev')}
            >
              <View style={styles.arrowCircle}>
                <Image source={backArrow} style={styles.arrowImg} />
              </View>
            </TouchableOpacity>
          )}

          <FlatList
            ref={chartListRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={SNAP_INTERVAL}
            decelerationRate="fast"
            data={vitalKeys}
            extraData={vitals}
            keyExtractor={item => item}
            contentContainerStyle={{ paddingRight: 60 }}
            onMomentumScrollEnd={ev => {
              const newIndex = Math.round(
                ev.nativeEvent.contentOffset.x / SNAP_INTERVAL,
              );
              setChartIndex(newIndex);
            }}
            renderItem={({ item }) => (
              <View style={{ width: ITEM_WIDTH, marginRight: ITEM_SPACING }}>
                <PreciseVitalChart
                  label={item.toUpperCase()}
                  data={chartData[item]}
                />
              </View>
            )}
          />

          {chartIndex < vitalKeys.length - 1 && (
            <TouchableOpacity
              style={[styles.navArrow, { right: 0 }]}
              onPress={() => scrollChart('next')}
            >
              <View style={styles.arrowCircle}>
                <Image source={nextArrow} style={styles.arrowImg} />
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.timeBanner}>
          <Text style={styles.timeText}>{currentTime}</Text>
        </View>

        {/* Vital Cards */}
        <Pressable onPress={() => !selectedPatientId && setAlertVisible(true)}>
          <View
            pointerEvents={selectedPatientId ? 'auto' : 'none'}
            style={{ opacity: selectedPatientId ? 1 : 0.6 }}
          >
            <VitalCard
              label="Temperature"
              value={vitals.temperature}
              onChangeText={v => handleUpdateVital('temperature', v)}
            />
            <VitalCard
              label="HR"
              value={vitals.hr}
              onChangeText={v => handleUpdateVital('hr', v)}
            />
            <VitalCard
              label="RR"
              value={vitals.rr}
              onChangeText={v => handleUpdateVital('rr', v)}
            />
            <VitalCard
              label="BP"
              value={vitals.bp}
              onChangeText={v => handleUpdateVital('bp', v)}
            />
            <VitalCard
              label="SP02"
              value={vitals.spo2}
              onChangeText={v => handleUpdateVital('spo2', v)}
            />
          </View>
        </Pressable>

        {/* Footer Action Area */}
        <View style={styles.footerAction}>
          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            <TouchableOpacity
              style={[
                styles.alertIcon,
                {
                  backgroundColor: (currentAlert || isDataComplete)
                    ? '#FFECBD'
                    : isDataEntered
                    ? '#E5FFE8'
                    : '#EBEBEB',
                },
              ]}
              disabled={!isDataEntered}
              onPress={handleAlertPress}
            >
              <Image
                source={alertIcon}
                style={[
                  styles.fullImg,
                  (currentAlert || isDataComplete)
                    ? { tintColor: '#EDB62C', opacity: 1 }
                    : isDataEntered
                    ? { tintColor: '#29A539', opacity: 0.8 }
                    : { tintColor: '#999696', opacity: 0.5 },
                ]}
              />
            </TouchableOpacity>
          </Animated.View>

          {isLastTimeSlot ? (
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[
                  styles.cdssButton,
                  !isDataEntered && styles.disabledButton,
                ]}
                onPress={handleCDSSPress}
                disabled={!isDataEntered}
              >
                <Text style={styles.cdssBtnText}>CDSS</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !isDataEntered && styles.disabledButton,
                ]}
                onPress={handleNextPress}
                disabled={!isDataEntered}
              >
                <Text style={styles.submitBtnText}>SUBMIT</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.nextButton,
                !selectedPatientId && styles.disabledButton,
              ]}
              onPress={handleNextPress}
              disabled={!selectedPatientId}
            >
              <Text
                style={[
                  styles.nextBtnText,
                  !selectedPatientId && { color: '#666' },
                ]}
              >
                NEXT ›
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Alert Component */}
      <SweetAlert
        visible={alertVisible}
        title={
          !selectedPatientId
            ? 'Patient Required'
            : currentAlert?.title || 'ALERT'
        }
        message={
          !selectedPatientId
            ? 'Please select a patient first in the search bar.'
            : currentAlert?.message || 'No alerts.'
        }
        type={!selectedPatientId ? 'error' : currentAlert?.type || 'success'}
        onConfirm={() => setAlertVisible(false)}
        confirmText="OK"
      />

      {/* Success Alert */}
      <SweetAlert
        visible={successVisible}
        title="SUCCESS"
        message="Vital Signs Assessment has been saved successfully."
        type="success"
        onConfirm={() => {
          setSuccessVisible(false);
          setRecordId(null);
          reset(); // Returns to 6:00 AM and clears patient
          setSelectedPatientFull(null);
        }}
        confirmText="OK"
      />

      {/* Clinical Guidance Modal */}
      <CDSSModal
        visible={cdssVisible}
        onClose={() => setCdssVisible(false)}
        category="VITAL SIGNS ASSESSMENT"
        alertText={currentAlert?.message || 'Analyzing vital signs for potential risks...'}
      />

      {/* Time Selection Menu */}
      <RNModal transparent visible={isMenuVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>SELECT TIME SLOT</Text>
            <FlatList
              data={TIME_SLOTS}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleSelectTimeSlot(index)}
                >
                  <Text
                    style={[
                      styles.menuItemText,
                      currentTimeIndex === index && styles.activeMenuText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeMenuBtn}
              onPress={() => setIsMenuVisible(false)}
            >
              <Text style={styles.closeMenuText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </RNModal>

      {/* Navigation Bar */}
      <View style={styles.bottomNav}>
        <Text style={styles.navIcon}>🏠</Text>
        <Text style={styles.navIcon}>🔍</Text>
        <View style={styles.fab}>
          <Text style={styles.plusSign}>+</Text>
        </View>
        <Text style={styles.navIcon}>📊</Text>
        <Text style={styles.navIcon}>📅</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { paddingHorizontal: 25, paddingBottom: 160 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 25,
  },
  title: {
    fontSize: 35,
    color: '#035022',
    fontFamily: 'MinionPro-SemiboldItalic',
  },
  subDate: { color: '#999', fontSize: 16 },
  menuDots: { fontSize: 28, color: '#035022' },
  inputGroup: { marginBottom: 15, zIndex: 100 },
  fieldLabel: {
    color: '#0A8219',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 8,
  },
  pillInput: {
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 25,
    height: 45,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  dateVal: { color: '#333' },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 3,
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    zIndex: 99,
  },
  dropItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  row: { flexDirection: 'row' },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 15,
  },
  arrowIconImage: {
    width: 14,
    height: 8,
    resizeMode: 'contain',
    tintColor: '#606060',
  },
  chartCarousel: { height: 210, marginVertical: 20, position: 'relative' },
  navArrow: {
    position: 'absolute',
    top: '38%',
    zIndex: 10,
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(78, 139, 66, 0.28)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#138221',
  },
  arrowImg: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    tintColor: '#035022',
    backgroundColor: 'transparent',
  },

  timeBanner: {
    backgroundColor: '#E5FFE8',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  timeText: { color: '#29A539', fontWeight: 'bold', fontSize: 16 },
  footerAction: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
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
  buttonGroup: { flex: 1, flexDirection: 'row', marginLeft: 15 },
  cdssButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#DCFCE7',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#035022',
    marginRight: 5,
  },
  cdssBtnText: { color: '#035022', fontWeight: 'bold', fontSize: 14 },
  submitButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#DCFCE7',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#035022',
    marginLeft: 5,
  },
  submitBtnText: { color: '#035022', fontWeight: 'bold', fontSize: 14 },
  nextButton: {
    flex: 1,
    backgroundColor: '#E5FFE8',
    height: 48,
    borderRadius: 25,
    marginLeft: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  nextButtonDisabled: { backgroundColor: '#F0F0F0', borderColor: '#E0E0E0' },
  disabledButton: {
    backgroundColor: '#F0F0F0',
    borderColor: '#E0E0E0',
    opacity: 0.6,
  },
  nextBtnText: { color: '#035022', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 25,
    maxHeight: '80%',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#035022',
    marginBottom: 20,
    textAlign: 'center',
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemText: { fontSize: 16, color: '#333', textAlign: 'center' },
  activeMenuText: { color: '#29A539', fontWeight: 'bold' },
  closeMenuBtn: {
    marginTop: 20,
    backgroundColor: '#E5FFE8',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  closeMenuText: { color: '#035022', fontWeight: 'bold' },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderColor: '#EEE',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 10,
  },
  navIcon: { fontSize: 22, color: '#035022' },
  fab: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EEE',
    marginTop: -45,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  plusSign: { fontSize: 28, color: '#29A539', fontWeight: 'bold' },
});

export default VitalSignsScreen;
