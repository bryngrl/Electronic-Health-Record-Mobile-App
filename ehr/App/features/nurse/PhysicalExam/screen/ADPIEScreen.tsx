import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { usePhysicalExam } from '../hook/usePhysicalExam';
import LinearGradient from 'react-native-linear-gradient';
import CDSSGuidanceModal from '@components/CDSSGuidanceModal';
import SweetAlert from '@components/SweetAlert';
import { useAppTheme } from '@App/theme/ThemeContext';

const STEPS = [
  { id: 1, label: 'Diagnosis', key: 'diagnosis' },
  { id: 2, label: 'Planning', key: 'planning' },
  { id: 3, label: 'Intervention', key: 'intervention' },
  { id: 4, label: 'Evaluation', key: 'evaluation' },
];

const ADPIEScreen = ({ onBack, examId, patientName }: any) => {
  const { isDarkMode, theme, commonStyles } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, commonStyles, isDarkMode), [theme, commonStyles, isDarkMode]);

  const { updateDPIE: updateStep } = usePhysicalExam();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [text, setText] = useState('');
  const [alert, setAlert] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // SweetAlert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
    onConfirm?: () => void;
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
    onConfirm?: () => void,
  ) => {
    setAlertConfig({ visible: true, title, message, type, onConfirm });
  };

  useEffect(() => {
    if (text.trim().length < 3) return;
    const timer = setTimeout(async () => {
      try {
        const step = STEPS[currentIdx];
        const res = await updateStep(examId, step.key, text);
        if (res) setAlert((res as any)[`${step.key}_alert`]);
      } catch (e) {
        console.error('Real-time CDSS Error:', e);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [text, currentIdx, examId, updateStep]);

  const handleNext = async () => {
    try {
      const step = STEPS[currentIdx];
      await updateStep(examId, step.key, text);
      if (currentIdx < 3) {
        setCurrentIdx(currentIdx + 1);
        setText('');
        setAlert(null);
      } else {
        showAlert('Complete', 'ADPIE Workflow Finished.', 'success', () => {
          onBack();
        });
      }
    } catch (e: any) {
      showAlert('Error', 'Workflow update failed.');
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setAlert(null);
      setText('');
    } else {
      onBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Physical Exam</Text>
            <Text style={styles.subtitle}>
              CLINICAL DECISION SUPPORT SYSTEM
            </Text>
          </View>

          <View style={styles.patientSection}>
            <Text style={styles.patientLabel}>PATIENT NAME :</Text>
            <View style={styles.patientDisplay}>
              <Text style={styles.patientNameText}>
                {patientName || 'Select or type Patient name'}
              </Text>
            </View>
          </View>

          <View style={styles.stepperContainer}>
            <View style={styles.progressLineTrack}>
              <View style={styles.progressLineGray} />
              <View
                style={[
                  styles.progressLineActive,
                  {
                    width:
                      currentIdx === STEPS.length - 1
                        ? '100%'
                        : `${((currentIdx + 0.5) / (STEPS.length - 1)) * 100}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.stepperRow}>
              {STEPS.map((s, idx) => (
                <View key={s.id} style={styles.stepGroup}>
                  <View
                    style={[
                      styles.circle,
                      idx <= currentIdx
                        ? styles.activeCircle
                        : styles.inactiveCircle,
                    ]}
                  >
                    <Text
                      style={
                        idx <= currentIdx
                          ? styles.activeCircleText
                          : styles.inactiveCircleText
                      }
                    >
                      {s.id}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      idx === currentIdx && styles.activeStepLabel,
                    ]}
                  >
                    {s.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <LinearGradient
            colors={isDarkMode ? ['#064E3B', '#065F46', '#047857'] : ['#0A8219', '#6CCA77', '#C8FFCF']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.clinicalBanner}
          >
            <View style={styles.bannerLeft}>
              <View style={styles.iconCircle}>
                <Icon name="info-outline" size={22} color="#fff" />
              </View>
              <View style={styles.bannerTextContent}>
                <Text style={styles.bannerTitle}>Clinical Support</Text>
                <Text style={styles.bannerSubText}>
                  {alert ? 'Recommendation ready' : 'Analyzing findings...'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.viewBtnText}>VIEW</Text>
              <Icon name="play-arrow" size={14} color={isDarkMode ? '#4ADE80' : '#10B981'} />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.notepad}>
            <View style={styles.notepadHeader}>
              <Text style={styles.headerText}>
                {STEPS[currentIdx].label.toUpperCase()}
              </Text>
            </View>
            <View style={styles.inputArea}>
              <View style={styles.linesContainer}>
                {[...Array(10)].map((_, i) => (
                  <View key={i} style={styles.line} />
                ))}
              </View>
              <TextInput
                multiline
                style={styles.input}
                value={text}
                onChangeText={setText}
                scrollEnabled={false}
                placeholder={`Document ${STEPS[currentIdx].label.toLowerCase()}...`}
                placeholderTextColor={theme.textMuted}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
              <Icon name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextText}>
                {currentIdx === 3 ? 'SUBMIT' : 'NEXT'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CDSSGuidanceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        category={STEPS[currentIdx].label}
        alertText={
          alert || 'Continue documenting to receive real-time support.'
        }
      />

      <SweetAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={() => {
          setAlertConfig({ ...alertConfig, visible: false });
          if (alertConfig.onConfirm) alertConfig.onConfirm();
        }}
        confirmText="OK"
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: any, commonStyles: any, isDarkMode: boolean) => StyleSheet.create({
  safeArea: commonStyles.safeArea,
  container: commonStyles.container,
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: commonStyles.header,
  title: commonStyles.title,
  subtitle: { fontSize: 10, color: theme.textMuted, letterSpacing: 0.5 },
  patientSection: { marginBottom: 20 },
  patientLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.primary,
    marginBottom: 8,
  },
  patientDisplay: {
    borderRadius: 25,
    paddingHorizontal: 20,
    height: 45,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.card,
  },
  patientNameText: { color: theme.text, fontSize: 13 },
  stepperContainer: {
    marginBottom: 30,
    paddingHorizontal: 10,
    position: 'relative',
  },
  progressLineTrack: {
    position: 'absolute',
    top: 18,
    left: 40,
    right: 40,
    height: 2,
    zIndex: 0,
  },
  progressLineGray: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: theme.border,
  },
  progressLineActive: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FDE68A',
    zIndex: 1,
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  stepGroup: { alignItems: 'center' },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    zIndex: 3,
  },
  activeCircle: { backgroundColor: '#FDE68A' },
  inactiveCircle: { backgroundColor: isDarkMode ? '#333' : '#F3F4F6' },
  activeCircleText: { color: '#B45309', fontWeight: 'bold' },
  inactiveCircleText: { color: theme.textMuted },
  stepLabel: { fontSize: 9, marginTop: 6, color: theme.textMuted },
  activeStepLabel: { color: isDarkMode ? '#FDE68A' : '#B45309' },
  clinicalBanner: {
    borderRadius: 15,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTextContent: {
    marginLeft: 12,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  bannerSubText: {
    color: '#fff',
    fontSize: 11,
    opacity: 0.95,
  },
  viewBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewBtnText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '800',
    marginRight: 4,
  },
  notepad: {
    minHeight: 250,
    backgroundColor: isDarkMode ? '#1F2937' : '#FFFBEB',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: isDarkMode ? '#374151' : '#FEF3C7',
    overflow: 'hidden',
    marginBottom: 20,
  },
  notepadHeader: {
    backgroundColor: isDarkMode ? '#374151' : '#FEF3C7',
    paddingVertical: 8,
    alignItems: 'center',
  },
  headerText: { color: isDarkMode ? '#FDE68A' : '#B45309', fontWeight: 'bold', fontSize: 11 },
  inputArea: { flex: 1, position: 'relative' },
  input: {
    flex: 1,
    padding: 20,
    textAlignVertical: 'top',
    fontSize: 15,
    color: theme.text,
    zIndex: 2,
    minHeight: 200,
  },
  linesContainer: { ...StyleSheet.absoluteFillObject, paddingTop: 40 },
  line: { height: 1, backgroundColor: isDarkMode ? '#374151' : '#FEF3C7', marginBottom: 30 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 120,
    alignItems: 'center',
  },
  backBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  nextBtn: {
    backgroundColor: theme.buttonBg,
    paddingHorizontal: 65,
    paddingVertical: 15,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.buttonBorder,
  },
  nextText: { color: theme.primary, fontWeight: 'bold', fontSize: 14 },
});
export default ADPIEScreen;
