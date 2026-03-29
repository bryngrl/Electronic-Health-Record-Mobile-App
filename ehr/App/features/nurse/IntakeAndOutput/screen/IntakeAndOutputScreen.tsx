import React, { useMemo } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

import IntakeOutputCard from '../component/IntakeOutputCard';
import SweetAlert from '@components/SweetAlert';
import PatientSearchBar from '@components/PatientSearchBar';
import ADPIEScreen from '@components/ADPIEScreen';
import CDSSModal from '@components/CDSSModal';
import LoadingOverlay from '@components/LoadingOverlay';
import { useAppTheme } from '@App/theme/ThemeContext';
import { useIntakeAndOutputScreen } from './useIntakeAndOutputScreen';
import { createStyles } from './styles';

const alertBellActiveIcon = require('@assets/icons/alert_bell_icon.png');
const alertBellInactiveIcon = require('@assets/icons/alert_bell_icon_inactive.png');
const arrowIcon = require('@assets/icons/ARROW.png');

interface IntakeAndOutputScreenProps {
  onBack: () => void;
  readOnly?: boolean;
  patientId?: number;
  initialPatientName?: string;
  admissionDate?: string;
}

const IntakeAndOutputScreen: React.FC<IntakeAndOutputScreenProps> = ({
  onBack,
  readOnly = false,
  patientId,
  initialPatientName,
  admissionDate,
}) => {
  const { isDarkMode, theme, commonStyles } = useAppTheme();
  const styles = useMemo(
    () => createStyles(theme, commonStyles, isDarkMode),
    [theme, commonStyles, isDarkMode],
  );

  const {
    patientName,
    selectedPatientId,
    handleSelectPatient,
    intakeOutput,
    isDataEntered,
    loading,
    recordId,
    currentDayNo,
    isExistingRecord,
    alertVisible, setAlertVisible,
    cdssModalVisible, setCdssModalVisible,
    successVisible, setSuccessVisible,
    successMessage,
    isAdpieActive, setIsAdpieActive,
    currentDate,
    scrollEnabled, setScrollEnabled,
    isNA, toggleNA,
    scrollViewRef,
    isAlertLoading,
    bellFadeAnim,
    handleFieldChange,
    calculateDayNumber,
    handleAlertPress,
    handleCDSSPress,
    handleSubmit,
    getCleanedAlertText,
    backendSeverity,
    assessmentSeverity,
    assessmentAlert,
    isAlertActive,
    isModified,
    loadingMessage,
    screenOpacity,
  } = useIntakeAndOutputScreen(onBack, readOnly, patientId, initialPatientName, admissionDate);

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

  if (isAdpieActive && recordId && selectedPatientId) {
    return (
      <ADPIEScreen
        recordId={recordId}
        patientName={patientName}
        feature="intake-and-output"
        findingsSummary={`Oral: ${intakeOutput.oral_intake}, IV: ${intakeOutput.iv_fluids_volume}, Urine: ${intakeOutput.urine_output}`}
        initialAlert={assessmentAlert || undefined}
        onBack={() => {
          setIsAdpieActive(false);
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <LoadingOverlay visible={loading} message={loadingMessage} />
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
      />
      <Animated.View style={{ flex: 1, opacity: screenOpacity }}>
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
                <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
                  Intake and Output
                </Text>
                <Text style={styles.subDate}>{currentDate}</Text>
                {readOnly && (
                  <Text style={{ fontSize: 14, color: '#E8572A', fontFamily: 'AlteHaasGroteskBold', marginTop: 5 }}>
                    [READ ONLY]
                  </Text>
                )}
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
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            scrollEnabled={scrollEnabled}
          >
            <View style={{ height: 20 }} />
            {!readOnly ? (
              <PatientSearchBar
                initialPatientName={patientName}
                onPatientSelect={handleSelectPatient}
                onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
              />
            ) : (
              <View style={styles.staticPatientContainer}>
                <Text style={styles.staticPatientLabel}>PATIENT:</Text>
                <Text style={styles.staticPatientName}>{initialPatientName || 'Unknown Patient'}</Text>
              </View>
            )}

            <View style={{ width: '100%', marginBottom: 15 }}>
              <Text style={styles.fieldLabel}>DAY NO :</Text>
              <View style={[styles.pillInput, styles.dropdownRow]}>
                <Text style={styles.dateVal}>
                  {currentDayNo || calculateDayNumber() || ''}
                </Text>
                <Image
                  source={arrowIcon}
                  style={[
                    styles.arrowIconImage,
                    { tintColor: theme.textMuted },
                  ]}
                />
              </View>
            </View>

            {!readOnly && (
              <TouchableOpacity
                style={[styles.naRow, !selectedPatientId && { opacity: 0.5 }]}
                onPress={() => {
                  if (!selectedPatientId) {
                    setAlertVisible(true);
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

            <View
              style={{ opacity: 1 }}
            >
              <IntakeOutputCard
                label="ORAL INTAKE"
                value={intakeOutput.oral_intake}
                onChangeText={text => handleFieldChange('oral_intake', text)}
                disabled={!selectedPatientId || isNA || readOnly}
                onDisabledPress={() => {
                  if (!selectedPatientId && !readOnly) {
                    setAlertVisible(true);
                  }
                }}
              />

              <IntakeOutputCard
                label="IV FLUIDS"
                value={intakeOutput.iv_fluids_volume}
                onChangeText={text => handleFieldChange('iv_fluids_volume', text)}
                disabled={!selectedPatientId || isNA || readOnly}
                onDisabledPress={() => {
                  if (!selectedPatientId && !readOnly) {
                    setAlertVisible(true);
                  }
                }}
              />

              <IntakeOutputCard
                label="URINE OUTPUT"
                value={intakeOutput.urine_output}
                onChangeText={text => handleFieldChange('urine_output', text)}
                disabled={!selectedPatientId || isNA || readOnly}
                onDisabledPress={() => {
                  if (!selectedPatientId && !readOnly) {
                    setAlertVisible(true);
                  }
                }}
              />
            </View>

            {!readOnly ? (
              <View style={styles.footerAction}>
                <Animated.View style={{ opacity: bellFadeAnim }}>
                  <TouchableOpacity
                    style={styles.alertIcon}
                    disabled={!isDataEntered || !selectedPatientId}
                    onPress={handleAlertPress}
                  >
                    <Image
                      source={
                        isAlertActive
                          ? alertBellActiveIcon
                          : alertBellInactiveIcon
                      }
                      style={styles.fullImg}
                    />
                  </TouchableOpacity>
                </Animated.View>

                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={[
                      styles.cdssButton,
                      !isDataEntered && {
                        backgroundColor: theme.buttonDisabledBg,
                        borderColor: theme.buttonDisabledBorder,
                      },
                    ]}
                    onPress={handleCDSSPress}
                    disabled={!isDataEntered}
                  >
                    <Text
                      style={[
                        styles.cdssBtnText,
                        !isDataEntered && { color: theme.textMuted },
                      ]}
                    >
                      CDSS
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      !isModified && {
                        backgroundColor: theme.buttonDisabledBg,
                        borderColor: theme.buttonDisabledBorder,
                      },
                    ]}
                    onPress={handleSubmit}
                    disabled={!isModified || loading}
                  >
                    <Text
                      style={[
                        styles.submitBtnText,
                        !isModified && { color: theme.textMuted },
                      ]}
                    >
                      {isExistingRecord ? 'UPDATE' : 'SUBMIT'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.submitButton, { marginTop: 20 }]}
                onPress={onBack}
              >
                <Text style={styles.submitBtnText}>CLOSE</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
          <LinearGradient
            colors={fadeColors}
            style={styles.fadeBottom}
            pointerEvents="none"
          />
        </View>
      </Animated.View>

      <CDSSModal
        visible={cdssModalVisible}
        onClose={() => setCdssModalVisible(false)}
        category="I&O Assessment"
        loading={isAlertLoading}
        alertText={getCleanedAlertText()}
        severity={backendSeverity || assessmentSeverity || undefined}
      />

      <SweetAlert
        visible={alertVisible}
        title="Patient Required"
        message="Please select a patient first in the search bar."
        type="error"
        onConfirm={() => setAlertVisible(false)}
      />

      <SweetAlert
        visible={successVisible}
        title={successMessage.title}
        message={successMessage.message}
        type="success"
        onConfirm={() => setSuccessVisible(false)}
      />
    </SafeAreaView>
  );
};

export default IntakeAndOutputScreen;
