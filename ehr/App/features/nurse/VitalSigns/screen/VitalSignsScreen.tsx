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
  Platform,
  Animated,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import VitalCard from '@nurse/VitalSigns/component/VitalCard';
import PreciseVitalChart from '@nurse/VitalSigns/component/VitalSignsChart';
import { useVitalSignsLogic } from '@nurse/VitalSigns/hook/useVitalSignsLogic';
import SweetAlert from '@components/SweetAlert';
import CDSSModal from '@components/CDSSModal';
import ADPIEScreen from '@nurse/VitalSigns/screen/ADPIEScreen';
import PatientSearchBar from '@components/PatientSearchBar';
import { useAppTheme } from '@App/theme/ThemeContext';

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
}

const VitalSignsScreen: React.FC<VitalSignsScreenProps> = ({ onBack }) => {
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
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
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

  const [successMessage, setSuccessMessage] = useState({
    title: '',
    message: '',
  });

  const handleAlertPress = async () => {
    if (!selectedPatientId) {
      return setAlertVisible(true);
    }
    const dayNo = parseInt(calculateDayNumber(), 10);
    const res = await saveAssessment(dayNo);
    if (res && res.id) {
      setRecordId(res.id);
      setCdssVisible(true);
    }
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
      const dayNo = parseInt(calculateDayNumber(), 10);
      const res = await saveAssessment(dayNo);
      if (res && res.id) {
        setRecordId(res.id);

        if (currentTimeIndex === TIME_SLOTS.length - 1) {
          const isUpdate = res.updated_at !== res.created_at;
          setSuccessMessage({
            title: isUpdate ? 'Successully Updated' : 'Successfully Submitted',
            message: isUpdate
              ? 'Vital signs updated successfully.'
              : 'Vital signs submitted successfully.',
          });
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
    const dayNo = parseInt(calculateDayNumber(), 10);
    const res = await saveAssessment(dayNo);
    if (res && res.id) {
      setRecordId(res.id);
      setIsAdpieActive(true);
    } else if (recordId) {
      setIsAdpieActive(true);
    }
  };

  const handleBackPress = useCallback(() => {
    if (isAdpieActive) {
      setIsAdpieActive(false);
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
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    return () => backHandler.remove();
  }, [handleBackPress]);

  const isLastTimeSlot = currentTimeIndex === TIME_SLOTS.length - 1;

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
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={scrollEnabled}
        >
          <View style={{ height: 20 }} />
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
                  {new Date().toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>DAY NO :</Text>
              <View style={[styles.pillInput, styles.dropdownRow]}>
                <Text style={styles.dateVal}>{calculateDayNumber()}</Text>
                <Image
                  source={arrowIcon}
                  style={[styles.arrowIconImage, { tintColor: theme.textMuted }]}
                />
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
                  <Image
                    source={backArrow}
                    style={[styles.arrowImg, { tintColor: theme.primary }]}
                  />
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
                  <Image
                    source={nextArrow}
                    style={[styles.arrowImg, { tintColor: theme.primary }]}
                  />
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
                    backgroundColor:
                      currentAlert || isDataComplete
                        ? isDarkMode
                          ? '#78350F'
                          : '#FFECBD'
                        : isDataEntered
                        ? '#FFECBD'
                        : isDarkMode
                        ? '#333'
                        : '#EBEBEB',
                    borderColor:
                      currentAlert || isDataComplete
                        ? '#EDB62C'
                        : isDataEntered
                        ? '#EDB62C'
                        : theme.border,
                  },
                ]}
                disabled={!isDataEntered}
                onPress={handleAlertPress}
              >
                <Image
                  source={alertIcon}
                  style={[
                    styles.fullImg,
                    currentAlert || isDataComplete
                      ? { tintColor: '#EDB62C', opacity: 1 }
                      : isDataEntered
                      ? { tintColor: '#EDB62C', opacity: 1 }
                      : { tintColor: theme.textMuted, opacity: 1 },
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
                    !selectedPatientId && { color: theme.textMuted },
                  ]}
                >
                  NEXT ›
                </Text>
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
        title={successMessage.title || 'SUCCESS'}
        message={
          successMessage.message ||
          'Vital Signs Assessment has been saved successfully.'
        }
        type="success"
        onConfirm={() => {
          setSuccessVisible(false);
          if (currentTimeIndex === TIME_SLOTS.length - 1) {
            setRecordId(null);
            reset();
            setSelectedPatientFull(null);
          }
        }}
        confirmText="OK"
      />

      {/* Clinical Guidance Modal */}
      <CDSSModal
        visible={cdssVisible}
        onClose={() => setCdssVisible(false)}
        category="VITAL SIGNS ASSESSMENT"
        alertText={
          currentAlert?.message ||
          'Analyzing vital signs for potential risks...'
        }
      />

      {/* Time Selection Menu */}
      <Modal transparent visible={isMenuVisible} animationType="fade">
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
    subDate: {
      color: theme.textMuted,
      fontSize: 13,
      fontFamily: 'AlteHaasGroteskBold',
    },
    menuDots: { fontSize: 28, color: theme.primary },
    fieldLabel: {
      color: theme.primary,
      fontFamily: 'AlteHaasGroteskBold',
      fontSize: 14,
      marginBottom: 8,
    },
    pillInput: {
      borderWidth: 1.5,
      borderColor: theme.border,
      borderRadius: 25,
      height: 45,
      paddingHorizontal: 20,
      justifyContent: 'center',
      backgroundColor: theme.card,
    },
    dateVal: { color: theme.text, fontFamily: 'AlteHaasGrotesk' },
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
      backgroundColor: '#c6e9c289',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.secondary,
    },
    arrowImg: {
      width: 25,
      height: 25,
      resizeMode: 'contain',
      backgroundColor: 'transparent',
    },

    timeBanner: {
      backgroundColor: theme.tableHeader,
      paddingVertical: 10,
      borderRadius: 20,
      alignItems: 'center',
      marginBottom: 20,
    },
    timeText: {
      color: theme.secondary,
      fontFamily: 'AlteHaasGroteskBold',
      fontSize: 14,
    },
    footerAction: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    alertIcon: {
      width: 45,
      height: 45,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 22.5,
      borderWidth: 1,
      marginBottom: 40,
    },
    fullImg: { width: '70%', height: '70%', resizeMode: 'contain' },
    buttonGroup: { flex: 1, flexDirection: 'row', marginLeft: 15 },
    cdssButton: {
      flex: 1,
      height: 48,
      backgroundColor: theme.buttonBg,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.buttonBorder,
      marginRight: 5,
    },
    cdssBtnText: { color: theme.primary, fontWeight: 'bold', fontSize: 14 },
    submitButton: {
      flex: 1,
      height: 48,
      backgroundColor: theme.buttonBg,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.buttonBorder,
      marginLeft: 5,
    },
    submitBtnText: { color: theme.primary, fontWeight: 'bold', fontSize: 14 },
    nextButton: {
      flex: 1,
      backgroundColor: theme.buttonBg,
      height: 48,
      borderRadius: 25,
      marginLeft: 15,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.buttonBorder,
      marginBottom: 40,
    },
    disabledButton: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      opacity: 0.6,
    },
    nextBtnText: { color: theme.primary, fontWeight: 'bold', fontSize: 16 },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuContainer: {
      width: '85%',
      backgroundColor: theme.card,
      borderRadius: 25,
      padding: 25,
      maxHeight: '80%',
    },
    menuTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.primary,
      marginBottom: 20,
      textAlign: 'center',
    },
    menuItem: {
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    menuItemText: { fontSize: 16, color: theme.text, textAlign: 'center' },
    activeMenuText: { color: theme.secondary, fontWeight: 'bold' },
    closeMenuBtn: {
      marginTop: 20,
      backgroundColor: theme.surface,
      paddingVertical: 12,
      borderRadius: 20,
      alignItems: 'center',
    },
    closeMenuText: { color: theme.primary, fontWeight: 'bold' },
    fadeBottom: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
    },
  });

export default VitalSignsScreen;
