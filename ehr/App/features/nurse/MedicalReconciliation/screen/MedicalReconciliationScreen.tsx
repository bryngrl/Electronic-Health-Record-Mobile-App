import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  FlatList,
  Modal,
  TextInput,
  Pressable,
  BackHandler,
  Image,
  Platform,
} from 'react-native';

const backArrow = require('@assets/icons/back_arrow.png');
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import MedicalReconCard from '../component/MedicalReconCard';
import { useMedicalReconLogic } from '../hook/useMedicalReconLogic';
import SweetAlert from '@components/SweetAlert';
import PatientSearchBar from '@components/PatientSearchBar';
import { useAppTheme } from '@App/theme/ThemeContext';

interface MedicalReconciliationProps {
  onBack: () => void;
}

const MedicalReconciliationScreen: React.FC<MedicalReconciliationProps> = ({
  onBack,
}) => {
  const { isDarkMode, theme, commonStyles } = useAppTheme();
  const styles = useMemo(
    () => createStyles(theme, commonStyles),
    [theme, commonStyles],
  );

  const {
    stageIndex,
    currentStage,
    values,
    patientName,
    setPatientName,
    patientId,
    setPatientId,
    isLoading,
    isSubmitting,
    handleUpdate,
    handleNext,
    isDataEntered,
    isLastStage,
    alertConfig,
    closeAlert,
    triggerPatientAlert,
    setStageIndex,
    RECON_STAGES,
    successMessage,
    successVisible,
    setSuccessVisible,
  } = useMedicalReconLogic();

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const handleBackPress = useCallback(() => {
    if (isMenuVisible) {
      setIsMenuVisible(false);
      return true;
    }
    onBack();
    return true;
  }, [isMenuVisible, onBack]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    return () => backHandler.remove();
  }, [handleBackPress]);

  useEffect(() => {
    const now = new Date();
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    setCurrentDate(
      `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`,
    );
  }, []);

  const getExtraLabel = () => {
    if (stageIndex === 0) return 'Administered during stay?';
    if (stageIndex === 1) return 'Discontinued on admission?';
    return 'Reason for change';
  };

  const handleAlertConfirm = () => {
    closeAlert();
  };

  const handleSelectStage = (index: number) => {
    setStageIndex(index);
    setIsMenuVisible(false);
  };

  const handlePatientSelect = (id: number | null, name: string) => {
    setPatientId(id);
    setPatientName(name);
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

  return (
    <SafeAreaView style={styles.root}>
      <View style={{ zIndex: 10 }}>
        <View
          style={{
            paddingHorizontal: 40,
            backgroundColor: theme.background,
            paddingBottom: 15,
          }}
        >
          {/* HEADER Section */}
          <View style={[styles.header, { marginBottom: 0 }]}>
            <View>
              <Text style={styles.title}>Medical{'\n'}Reconciliation</Text>
              <Text style={styles.subDate}>{currentDate}</Text>
            </View>
            <TouchableOpacity onPress={() => setIsMenuVisible(true)}>
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
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={scrollEnabled}
        >
          <View style={{ height: 20 }} />
          <PatientSearchBar
            initialPatientName={patientName}
            onPatientSelect={handlePatientSelect}
            onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
          />

          {/* STAGE Indicator */}
          <View style={styles.stageTab}>
            <Text style={styles.stageText}>{currentStage}</Text>
          </View>

          {/* INPUT Cards Flow - Wrapped in Pressable for validation */}
          <Pressable onPress={() => !patientId && triggerPatientAlert()}>
            <View
              pointerEvents={patientId ? 'auto' : 'none'}
              style={{ opacity: patientId ? 1 : 0.6 }}
            >
              <MedicalReconCard
                label="Medication"
                value={values.med}
                onChangeText={(v: string) => handleUpdate('med', v)}
              />
              <MedicalReconCard
                label="Dose"
                value={values.dose}
                onChangeText={(v: string) => handleUpdate('dose', v)}
              />
              <MedicalReconCard
                label="Route"
                value={values.route}
                onChangeText={(v: string) => handleUpdate('route', v)}
              />
              <MedicalReconCard
                label="Frequency"
                value={values.freq}
                onChangeText={(v: string) => handleUpdate('freq', v)}
              />

              {/* Indication is hidden in Stage 3 */}
              {stageIndex !== 2 && (
                <MedicalReconCard
                  label="Indication"
                  value={values.indication}
                  onChangeText={(v: string) => handleUpdate('indication', v)}
                />
              )}

              <MedicalReconCard
                label={getExtraLabel()}
                value={values.extra}
                onChangeText={(v: string) => handleUpdate('extra', v)}
              />
            </View>
          </Pressable>

          {/* FOOTER: Disabled until data is entered or while submitting */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              (!isDataEntered || isSubmitting || !patientId) &&
                styles.btnDisabled,
            ]}
            onPress={handleNext}
            disabled={!isDataEntered || isSubmitting || !patientId}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <>
                <Text
                  style={[
                    styles.btnText,
                    (!isDataEntered || isSubmitting || !patientId) && {
                      color: theme.textMuted,
                    },
                  ]}
                >
                  {isLastStage ? 'SUBMIT' : 'NEXT'}
                </Text>
                {!isLastStage && (
                  <Text
                    style={[
                      styles.chevron,
                      (!isDataEntered || isSubmitting || !patientId) && {
                        color: theme.textMuted,
                    },
                    ]}
                  >
                    ›
                  </Text>
                )}
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
        <LinearGradient
          colors={fadeColors}
          style={styles.fadeBottom}
          pointerEvents="none"
        />
      </View>

      {/* Options Menu Modal */}
      <Modal transparent visible={isMenuVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>SELECT STAGE</Text>

            <FlatList
              data={RECON_STAGES}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleSelectStage(index)}
                >
                  <Text
                    style={[
                      styles.menuItemText,
                      stageIndex === index && styles.activeMenuText,
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

      {/* SweetAlert Components */}
      <SweetAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={handleAlertConfirm}
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

const createStyles = (theme: any, commonStyles: any, isDarkMode: boolean) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background },
    scrollContent: { paddingHorizontal: 40, paddingBottom: 20 },
    header: commonStyles.header,
    title: commonStyles.title,
    subDate: {
      color: theme.textMuted,
      fontFamily: 'AlteHaasGroteskBold',
      fontSize: 13,
    },
    stageTab: {
      backgroundColor: theme.tableHeader,
      paddingVertical: 12,
      borderRadius: 20,
      alignItems: 'center',
      marginBottom: 20,
    },
    stageText: {
      color: theme.secondary,
      fontFamily: 'AlteHaasGroteskBold',
      fontSize: 14,
    },
    actionBtn: {
      backgroundColor: theme.buttonBg,
      height: 50,
      borderRadius: 25,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 10,
      borderWidth: 1,
      borderColor: theme.buttonBorder,
    },
    btnDisabled: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      opacity: 0.6,
    },
    btnText: { color: theme.primary, fontWeight: 'bold', fontSize: 16 },
    chevron: { color: theme.primary, fontSize: 20, marginLeft: 10 },

    // Menu Modal Styles
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

export default MedicalReconciliationScreen;
