import React, { useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import ADPIEScreen from '@components/ADPIEScreen';
import SweetAlert from '@components/SweetAlert';
import PatientSearchBar from '@components/PatientSearchBar';
import LoadingOverlay from '@components/LoadingOverlay';
import { useAppTheme } from '@App/theme/ThemeContext';
import { usePhysicalExamScreen } from './usePhysicalExamScreen';
import ExamCardsSection from './ExamCardsSection';
import { createStyles } from './styles';

interface PhysicalExamProps {
  onBack: () => void;
  readOnly?: boolean;
  patientId?: string;
  initialPatientName?: string;
}

const PhysicalExamScreen: React.FC<PhysicalExamProps> = ({ onBack, readOnly = false, patientId, initialPatientName }) => {
  const { isDarkMode, theme, commonStyles } = useAppTheme();
  const styles = useMemo(
    () => createStyles(theme, commonStyles, isDarkMode),
    [theme, commonStyles, isDarkMode],
  );
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    searchText, setSearchText,
    selectedPatientId, setSelectedPatientId,
    scrollEnabled, setScrollEnabled,
    alertConfig, setAlertConfig,
    showAlert,
    examId,
    assessmentAlert, setAssessmentAlert,
    isAdpieActive, setIsAdpieActive,
    formData,
    isNA,
    toggleNA,
    getBackendAlert,
    getBackendSeverity,
    updateField, handleCDSSPress, handleSave,
    generateFindingsSummary, isDataEntered, getCurrentDate,
    isModified,
    isLoading, loadingMessage, screenOpacity,
    } = usePhysicalExamScreen(onBack);


  useEffect(() => {
    if (readOnly && patientId) {
      setSelectedPatientId(patientId);
      setSearchText(initialPatientName || '');
    }
  }, [readOnly, patientId, setSelectedPatientId, setSearchText, initialPatientName]);

  const fadeColors = isDarkMode
    ? ['rgba(18, 18, 18, 0)', 'rgba(18, 18, 18, 0.8)', 'rgba(18, 18, 18, 1)']
    : ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 1)'];

  const headerFadeColors = isDarkMode
    ? ['rgba(18, 18, 18, 1)', 'rgba(18, 18, 18, 0)']
    : ['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0)'];

  if (isAdpieActive && examId && selectedPatientId) {
    return (
      <ADPIEScreen
        recordId={typeof examId === 'string' ? parseInt(examId, 10) : examId}
        patientName={searchText}
        feature="physical-exam"
        findingsSummary={generateFindingsSummary()}
        initialAlert={assessmentAlert || undefined}
        onBack={() => {
          setIsAdpieActive(false);
          setAssessmentAlert(null);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LoadingOverlay visible={isLoading} message={loadingMessage} />
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
      />

      <Animated.View style={{ flex: 1, opacity: screenOpacity }}>
        <View style={{ zIndex: 10 }}>
          <View style={{ paddingHorizontal: 40, backgroundColor: theme.background, paddingBottom: 15 }}>
            <View style={[styles.header, { marginBottom: 0 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Physical Exam</Text>
                <Text style={styles.subTitleDate}>{getCurrentDate()}</Text>
                {readOnly && (
                  <Text style={{ fontSize: 14, color: '#E8572A', fontFamily: 'AlteHaasGroteskBold', marginTop: 5 }}>
                    [READ ONLY]
                  </Text>
                )}
              </View>
            </View>
          </View>
          <LinearGradient colors={headerFadeColors} style={{ height: 20 }} pointerEvents="none" />
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
            {!readOnly ? (
              <PatientSearchBar
                onPatientSelect={(id, name) => {
                  setSelectedPatientId(id ? id.toString() : null);
                  setSearchText(name);
                }}
                initialPatientName={searchText}
                onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
              />
            ) : (
              <View style={styles.staticPatientContainer}>
                <Text style={styles.staticPatientLabel}>PATIENT:</Text>
                <Text style={styles.staticPatientName}>{initialPatientName || 'Unknown Patient'}</Text>
              </View>
            )}

            {!readOnly && (
              <TouchableOpacity
                style={[styles.naRow, !selectedPatientId && { opacity: 0.5 }]}
                onPress={() => {
                  if (!selectedPatientId) showAlert('Patient Required', 'Please select a patient first in the search bar.');
                  else toggleNA();
                }}
              >
                <Text style={[styles.naText, !selectedPatientId && { color: theme.textMuted }]}>
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
              <Text style={[styles.disabledTextAtBottom, isNA && { color: theme.error }]}>
                {isNA ? 'All fields below are disabled.' : 'Checking this will disable all fields below.'}
              </Text>
            )}

            <ExamCardsSection
              formData={formData}
              selectedPatientId={selectedPatientId}
              isNA={isNA}
              getBackendAlert={getBackendAlert}
              getBackendSeverity={getBackendSeverity}
              updateField={updateField}
              showAlert={showAlert}
              styles={styles}
              theme={theme}
              handleCDSSPress={handleCDSSPress}
              handleSave={handleSave}
              isDataEntered={isDataEntered}
              isModified={isModified}
              readOnly={readOnly}
              onBack={onBack}
            />
          </ScrollView>
          <LinearGradient colors={fadeColors} style={styles.fadeBottom} pointerEvents="none" />
        </View>
      </Animated.View>

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

export default PhysicalExamScreen;
