import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
  Alert,
  BackHandler,
  Platform,
  useColorScheme,
  Image,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Ionicon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const CARD_GAP = 20; // Kept the gap constant

import DiagnosticCard from '../components/DiagnosticCard';
import SweetAlert from '@components/SweetAlert';
import apiClient, { BASE_URL } from '@api/apiClient';
import { useDiagnostics, DiagnosticRecord } from '../hook/useDiagnostics';
import PatientSearchBar from '@components/PatientSearchBar';
import { useAppTheme } from '@App/theme/ThemeContext';

const backArrow = require('@assets/icons/back_arrow.png');
const nextArrow = require('@assets/icons/next_arrow.png');

export type ViewMode = 'grid' | 'list';

interface DiagnosticsProps {
  onBack: () => void;
}

const DiagnosticsScreen: React.FC<DiagnosticsProps> = ({ onBack }) => {
  const { isDarkMode, theme, commonStyles } = useAppTheme();
  const styles = useMemo(
    () => createStyles(theme, commonStyles, isDarkMode),
    [theme, commonStyles, isDarkMode],
  );

  const { width: windowWidth } = useWindowDimensions();
  const [viewMode, setViewMode] = useState<ViewMode>(
    windowWidth > 600 ? 'grid' : 'list',
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // --- DYNAMIC WIDTH CALCULATION ---
  const dynamicCardWidth = windowWidth - 80;

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

  useEffect(() => {
    if (windowWidth > 600) {
      setViewMode('grid');
    } else {
      setViewMode('list');
    }
  }, [windowWidth]);

  // Patient Search State
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
    type: 'success' | 'error' | 'delete';
    onConfirm?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'success',
  });

  const {
    diagnostics,
    loading,
    fetchDiagnostics,
    uploadDiagnostic,
    deleteDiagnostic,
  } = useDiagnostics();

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'delete',
    onConfirm?: () => void,
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      onConfirm,
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  // Fetch diagnostics when patient is selected
  useEffect(() => {
    if (selectedPatientId) {
      fetchDiagnostics(selectedPatientId);
    }
  }, [selectedPatientId, fetchDiagnostics]);

  const handleImport = async (imageType: string) => {
    if (!selectedPatientId) {
      showAlert(
        'Patient Required',
        'Please select a patient before importing a photo.',
        'error',
      );
      return;
    }
    const result = await uploadDiagnostic(selectedPatientId, imageType);
    if (result && result.success) {
      showAlert('Success', 'Image uploaded successfully', 'success');
    } else if (result && result.error) {
      const msg =
        typeof result.error === 'string'
          ? result.error
          : JSON.stringify(result.error);
      showAlert('Error', msg, 'error');
    }
  };

  const handleDelete = async (diagnosticId: number) => {
    if (!selectedPatientId) return;

    showAlert(
      'Delete Image',
      'Are you sure you want to delete this diagnostic image?',
      'delete',
      async () => {
        hideAlert();
        const result = await deleteDiagnostic(diagnosticId);
        if (result.success) {
          await fetchDiagnostics(selectedPatientId);
          showAlert('Deleted', 'Image has been removed.', 'success');
        } else {
          showAlert('Error', result.error || 'Failed to delete', 'error');
        }
      },
    );
  };

  const handlePatientSelect = (id: number | null, name: string) => {
    setSelectedPatientId(id ? id.toString() : null);
    setSearchText(name);
  };

  const diagnosticTypes = [
    { id: 'X-RAY', label: 'X-RAY' },
    { id: 'ULTRASOUND', label: 'ULTRASOUND' },
    { id: 'CT SCAN', label: 'CT SCAN' },
    { id: 'ECHOCARDIOGRAM', label: 'ECHOCARDIOGRAM' },
  ];

  const getDiagnosticForType = (type: string) => {
    return diagnostics.find(d => d.image_type === type);
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const scrollToIndex = (index: number) => {
    if (index >= 0 && index < diagnosticTypes.length) {
      setCurrentIndex(index);
      scrollViewRef.current?.scrollTo({
        x: index * (dynamicCardWidth + CARD_GAP),
        animated: true,
      });
    }
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
    <View style={styles.container}>
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
          <View style={[styles.headerRow, { marginBottom: 0 }]}>
            <View style={styles.titleContainer}>
              <Text style={styles.titleText}>Diagnostics</Text>
              <Text style={styles.dateText}>{formatDate()}</Text>
            </View>

            <View style={styles.toggleContainer}>
              <TouchableOpacity
                onPress={() => setViewMode('list')}
                style={[
                  styles.toggleBtn,
                  viewMode === 'list' && styles.toggleActive,
                ]}
              >
                <MaterialIcon
                  name="view-agenda"
                  size={22}
                  color={viewMode === 'list' ? '#f1c40f' : theme.textMuted}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setViewMode('grid')}
                style={[
                  styles.toggleBtn,
                  viewMode === 'grid' && styles.toggleActive,
                ]}
              >
                <MaterialIcon
                  name="grid-view"
                  size={22}
                  color={viewMode === 'grid' ? '#f1c40f' : theme.textMuted}
                />
              </TouchableOpacity>
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
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={scrollEnabled}
        >
          <View style={{ height: 20 }} />
          <PatientSearchBar
            initialPatientName={searchText}
            onPatientSelect={handlePatientSelect}
            onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
          />

          {loading && diagnostics.length === 0 && (
            <ActivityIndicator
              size="large"
              color={theme.primary}
              style={{ marginVertical: 20 }}
            />
          )}

          {/* DIAGNOSTIC CARDS GRID/LIST */}
          {viewMode === 'list' ? (
            <View style={styles.carouselContainer}>
              {currentIndex > 0 && (
                <TouchableOpacity
                  style={[styles.navArrow, { left: -15 }]}
                  onPress={() => scrollToIndex(currentIndex - 1)}
                >
                  <View style={styles.arrowCircle}>
                    <Image
                      source={backArrow}
                      style={[styles.arrowImg, { tintColor: theme.primary }]}
                    />
                  </View>
                </TouchableOpacity>
              )}

              <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
                snapToInterval={dynamicCardWidth + CARD_GAP}
                decelerationRate="fast"
                snapToAlignment="start"
                onMomentumScrollEnd={ev => {
                  const newIndex = Math.round(
                    ev.nativeEvent.contentOffset.x /
                      (dynamicCardWidth + CARD_GAP),
                  );
                  setCurrentIndex(newIndex);
                }}
              >
                {diagnosticTypes.map((item, index) => {
                  const diagnostic = getDiagnosticForType(item.id);
                  const imageUrl = diagnostic
                    ? `${BASE_URL}/diagnostics/${diagnostic.diagnostic_id}/file`
                    : null;

                  return (
                    <View
                      key={item.id}
                      style={{
                        width: dynamicCardWidth,
                        marginRight:
                          index === diagnosticTypes.length - 1 ? 0 : CARD_GAP,
                      }}
                    >
                      <DiagnosticCard
                        label={item.label}
                        viewMode={viewMode}
                        imageUrl={imageUrl}
                        onImport={() => handleImport(item.id)}
                        onDelete={() =>
                          diagnostic && handleDelete(diagnostic.diagnostic_id)
                        }
                        disabled={loading}
                      />
                    </View>
                  );
                })}
              </ScrollView>

              {currentIndex < diagnosticTypes.length - 1 && (
                <TouchableOpacity
                  style={[styles.navArrow, { right: -15 }]}
                  onPress={() => scrollToIndex(currentIndex + 1)}
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
          ) : (
            <View style={styles.gridWrap}>
              {diagnosticTypes.map(item => {
                const diagnostic = getDiagnosticForType(item.id);
                const imageUrl = diagnostic
                  ? `${BASE_URL}/diagnostics/${diagnostic.diagnostic_id}/file`
                  : null;

                return (
                  <View key={item.id} style={styles.gridCard}>
                    <DiagnosticCard
                      label={item.label}
                      viewMode={viewMode}
                      imageUrl={imageUrl}
                      onImport={() => handleImport(item.id)}
                      onDelete={() =>
                        diagnostic && handleDelete(diagnostic.diagnostic_id)
                      }
                      disabled={loading}
                    />
                  </View>
                );
              })}
            </View>
          )}
          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              !selectedPatientId && styles.disabledButton,
            ]}
            disabled={!selectedPatientId}
            onPress={onBack}
          >
            <Text
              style={[
                styles.submitText,
                !selectedPatientId && { color: theme.textMuted },
              ]}
            >
              DONE
            </Text>
          </TouchableOpacity>
        </ScrollView>
        <LinearGradient
          colors={fadeColors}
          style={styles.fadeBottom}
          pointerEvents="none"
        />
      </View>

      {/* SWEET ALERT */}
      <SweetAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onCancel={hideAlert}
        onConfirm={alertConfig.onConfirm || hideAlert}
        confirmText={alertConfig.type === 'delete' ? 'DELETE' : 'OK'}
      />
    </View>
  );
};

const createStyles = (theme: any, commonStyles: any, isDarkMode: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    scrollContent: { paddingHorizontal: 40, paddingBottom: 100 },
    headerRow: {
      ...commonStyles.header,
      alignItems: 'center',
    },
    titleContainer: { flex: 1 },
    titleText: commonStyles.title,
    dateText: {
      fontSize: 13,
      fontFamily: 'AlteHaasGroteskBold',
      color: theme.textMuted,
      marginTop: 0,
    },
    toggleContainer: {
      flexDirection: 'row',
      backgroundColor: theme.surface,
      borderRadius: 10,
      padding: 4,
    },
    toggleBtn: { padding: 8, borderRadius: 8 },
    toggleActive: {
      backgroundColor: theme.card,
      elevation: 3,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    carouselContainer: {
      position: 'relative',
      marginVertical: 10,
    },
    navArrow: {
      position: 'absolute',
      top: '45%',
      zIndex: 10,
    },
    arrowCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#c6e9c22e',
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
    horizontalScroll: {
      paddingBottom: 10,
      flexDirection: 'row',
    },
    gridWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    gridCard: {
      width: '46%',
    },
    listWrap: { flexDirection: 'column' },
    submitButton: {
      backgroundColor: theme.buttonBg,
      borderWidth: 1,
      borderColor: theme.primary,
      borderRadius: 25,
      height: 55,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
    disabledButton: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      opacity: 0.6,
    },
    submitText: { color: theme.primary, fontWeight: 'bold', fontSize: 16 },
    fadeBottom: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
    },
  });

export default DiagnosticsScreen;
