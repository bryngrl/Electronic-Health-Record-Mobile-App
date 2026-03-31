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

const CARD_GAP = 20;

import DiagnosticCard from '../components/DiagnosticCard';
import SweetAlert from '@components/SweetAlert';
import apiClient, { BASE_URL } from '@api/apiClient';
import { useDiagnostics, DiagnosticRecord } from '../hook/useDiagnostics';
import PatientSearchBar from '@components/PatientSearchBar';
import { useAppTheme } from '@App/theme/ThemeContext';

import LoadingOverlay from '@components/LoadingOverlay';

const backArrow = require('@assets/icons/back_arrow.png');
const nextArrow = require('@assets/icons/next_arrow.png');

export type ViewMode = 'grid' | 'list';

// UPDATED INTERFACE
interface DiagnosticsProps {
  onBack: () => void;
  readOnly?: boolean;
  patientId?: number;
  initialPatientName?: string;
}

const DiagnosticsScreen: React.FC<DiagnosticsProps> = ({
  onBack,
  readOnly = false,
  patientId,
  initialPatientName,
}) => {
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

  const dynamicCardWidth = windowWidth - 80;

  // --- DOCTOR VIEWING LOGIC ---
  useEffect(() => {
    if (readOnly && patientId) {
      setSelectedPatientId(patientId.toString());
      setSearchText(initialPatientName || '');
    }
  }, [readOnly, patientId, initialPatientName]);

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

  const [searchText, setSearchText] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Saving Diagnostics...');
  const [pendingImages, setPendingImages] = useState<
    Record<string, { uri: string; name: string; type: string; id: string }[]>
  >({});

  const isModified = useMemo(() => {
    const hasPending = Object.values(pendingImages).some(arr => arr.length > 0);
    return hasChanges || hasPending;
  }, [hasChanges, pendingImages]);

  const {
    diagnostics,
    loading,
    fetchDiagnostics,
    selectImage,
    uploadDiagnostic,
    deleteDiagnostic,
  } = useDiagnostics();

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

  const isDataEntered = useMemo(() => {
    return (
      diagnostics.length > 0 ||
      Object.values(pendingImages).some(arr => arr.length > 0)
    );
  }, [diagnostics, pendingImages]);

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

  useEffect(() => {
    if (selectedPatientId) {
      fetchDiagnostics(selectedPatientId);
      setHasChanges(false);
      setPendingImages({});
    }
  }, [selectedPatientId, fetchDiagnostics]);

  const handleImport = async (imageType: string) => {
    if (readOnly) return; // Block in read-only

    if (!selectedPatientId) {
      showAlert(
        'Patient Required',
        'Please select a patient before importing a photo.',
        'error',
      );
      return;
    }

    const asset = await selectImage();
    if (asset) {
      const newPending = {
        ...asset,
        id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      setPendingImages(prev => ({
        ...prev,
        [imageType]: [...(prev[imageType] || []), newPending],
      }));
    }
  };

  const handleDelete = async (
    diagnosticId: number | string,
    imageType?: string,
  ) => {
    if (readOnly) return; // Block in read-only
    if (!selectedPatientId) return;

    if (
      typeof diagnosticId === 'string' &&
      diagnosticId.startsWith('pending_')
    ) {
      // Handle pending deletion
      setPendingImages(prev => {
        const updated = { ...prev };
        for (const type in updated) {
          updated[type] = updated[type].filter(img => img.id !== diagnosticId);
        }
        return updated;
      });
      return;
    }

    showAlert(
      'Delete Image',
      'Are you sure you want to delete this diagnostic image?',
      'delete',
      async () => {
        hideAlert();
        const result = await deleteDiagnostic(Number(diagnosticId));
        if (result.success) {
          setHasChanges(true);
          await fetchDiagnostics(selectedPatientId);
          showAlert('Deleted', 'Image has been removed.', 'success');
        } else {
          showAlert('Error', result.error || 'Failed to delete', 'error');
        }
      },
    );
  };

  const handleDeleteAll = async (imageType: string) => {
    if (readOnly) return;
    if (!selectedPatientId) return;

    const serverImages = diagnostics.filter(d => d.type === imageType);
    const hasPending = (pendingImages[imageType] || []).length > 0;

    if (serverImages.length === 0 && !hasPending) return;

    showAlert(
      'Delete All',
      `Are you sure you want to delete all ${imageType.replace(
        '_',
        ' ',
      )} images?`,
      'delete',
      async () => {
        hideAlert();
        setIsLoading(true);
        setLoadingMessage('Deleting Images...');

        // Clear pending first
        setPendingImages(prev => ({
          ...prev,
          [imageType]: [],
        }));

        // Delete server images
        for (const img of serverImages) {
          if (img.id) {
            await deleteDiagnostic(img.id);
          }
        }

        await fetchDiagnostics(selectedPatientId);
        setIsLoading(false);
        showAlert(
          'Success',
          'All selected images have been deleted.',
          'success',
        );
      },
    );
  };

  const handlePatientSelect = (id: number | null, name: string) => {
    setSelectedPatientId(id ? id.toString() : null);
    setSearchText(name);
    setHasChanges(false);
    setPendingImages({});
  };

  const diagnosticTypes = [
    { id: 'xray', label: 'X-RAY' },
    { id: 'ultrasound', label: 'ULTRASOUND' },
    { id: 'ct_scan', label: 'CT SCAN' },
    { id: 'echocardiogram', label: 'ECHOCARDIOGRAM' },
  ];

  const getDiagnosticsForType = (type: string) => {
    const storageBase = BASE_URL.replace('/api', '/storage');
    const serverImages = diagnostics
      .filter(d => d.type === type)
      .map(d => ({
        id: d.id as number,
        url: d.image_url || (d.path ? `${storageBase}/${d.path}` : ''),
      }));

    const pending = (pendingImages[type] || []).map(img => ({
      id: img.id,
      url: img.uri,
    }));

    return [...serverImages, ...pending];
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
            <View style={[styles.titleContainer, readOnly ? { paddingLeft: 18 } : null]}>
              <Text style={styles.titleText}>Diagnostics</Text>
              {!readOnly && <Text style={styles.dateText}>{formatDate()}</Text>}
              {readOnly && (
                <Text
                  style={{
                    fontSize: 14,
                    color: '#E8572A',
                    fontFamily: 'AlteHaasGroteskBold',
                    marginTop: 5,
                  }}
                >
                  [READ ONLY]
                </Text>
              )}
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

          {/* SEARCH BAR TOGGLE */}
          {!readOnly ? (
            <PatientSearchBar
              initialPatientName={searchText}
              onPatientSelect={handlePatientSelect}
              onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
            />
          ) : (
            <View style={styles.staticPatientContainer}>
              <Text style={styles.staticPatientLabel}>PATIENT:</Text>
              <Text style={styles.staticPatientName}>
                {initialPatientName || 'Unknown Patient'}
              </Text>
            </View>
          )}

          {loading && diagnostics.length === 0 && (
            <ActivityIndicator
              size="large"
              color={theme.primary}
              style={{ marginVertical: 20 }}
            />
          )}

          {/* DIAGNOSTIC CARDS */}
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
                  const images = getDiagnosticsForType(item.id);

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
                        images={images}
                        onImport={() => handleImport(item.id)}
                        onDelete={id => handleDelete(id, item.id)}
                        onDeleteAll={() => handleDeleteAll(item.id)}
                        disabled={loading || readOnly}
                        hideImport={readOnly}
                        readOnly={readOnly}
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
                const images = getDiagnosticsForType(item.id);

                return (
                  <View key={item.id} style={styles.gridCard}>
                    <DiagnosticCard
                      label={item.label}
                      viewMode={viewMode}
                      images={images}
                      onImport={() => handleImport(item.id)}
                      onDelete={id => handleDelete(id, item.id)}
                      onDeleteAll={() => handleDeleteAll(item.id)}
                      disabled={loading || readOnly}
                      hideImport={readOnly}
                      readOnly={readOnly}
                    />
                  </View>
                );
              })}
            </View>
          )}

          {/* BUTTON: SUBMIT (Nurse) / CLOSE (Doctor) */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              !readOnly &&
                !isModified && {
                  backgroundColor: theme.buttonDisabledBg,
                  borderColor: theme.buttonDisabledBorder,
                },
            ]}
            disabled={!readOnly && !isModified}
            onPress={async () => {
              if (readOnly) {
                onBack();
              } else if (selectedPatientId) {
                showAlert(
                  'Confirm Submission',
                  'Are you sure you want to save these diagnostic records?',
                  'success',
                  async () => {
                    hideAlert();
                    setIsLoading(true);
                    setLoadingMessage('Uploading Images...');

                    let hasError = false;
                    let errorMsg = '';

                    // Upload all pending images
                    for (const type in pendingImages) {
                      for (const asset of pendingImages[type]) {
                        const result = await uploadDiagnostic(
                          selectedPatientId,
                          type,
                          asset,
                        );
                        if (!result?.success) {
                          hasError = true;
                          errorMsg =
                            result?.error || 'Failed to upload some images.';
                          break;
                        }
                      }
                      if (hasError) break;
                    }

                    if (hasError) {
                      setIsLoading(false);
                      showAlert('Error', errorMsg, 'error');
                    } else {
                      await fetchDiagnostics(selectedPatientId);
                      setIsLoading(false);
                      showAlert(
                        'Success',
                        'Diagnostic records have been saved successfully.',
                        'success',
                      );
                      setHasChanges(false);
                      setPendingImages({});
                    }
                  },
                );
              }
            }}
          >
            <Text
              style={[
                styles.submitText,
                !readOnly && !isModified && { color: theme.textMuted },
              ]}
            >
              {readOnly ? 'CLOSE' : 'SUBMIT'}
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
      <LoadingOverlay visible={isLoading} message={loadingMessage} />
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
    // New Static Patient styles
    staticPatientContainer: {
      marginBottom: 20,
      backgroundColor: theme.card,
      padding: 15,
      borderRadius: 15,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    staticPatientLabel: {
      fontFamily: 'AlteHaasGroteskBold',
      color: theme.primary,
      fontSize: 12,
      marginRight: 10,
    },
    staticPatientName: {
      fontFamily: 'AlteHaasGrotesk',
      color: theme.text,
      fontSize: 16,
      fontWeight: 'bold',
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
      borderWidth: 1.5,
      borderColor: theme.buttonBorder,
      borderRadius: 50,
      paddingVertical: 15,
      minHeight: 30,
      justifyContent: 'center',
      alignItems: 'center',
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
