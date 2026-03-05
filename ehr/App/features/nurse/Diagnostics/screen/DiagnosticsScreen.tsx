import React, { useState, useEffect, useMemo } from 'react';
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
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Ionicon from 'react-native-vector-icons/Ionicons';

const CARD_WIDTH = 350;
const CARD_GAP = 20;

import DiagnosticCard from '../components/DiagnosticCard';
import SweetAlert from '@components/SweetAlert';
import apiClient, { BASE_URL } from '@api/apiClient';
import { useDiagnostics, DiagnosticRecord } from '../hook/useDiagnostics';
import PatientSearchBar from '@components/PatientSearchBar';
import { useAppTheme } from '@App/theme/ThemeContext';

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

  const sidePadding = (windowWidth - CARD_WIDTH) / 4;

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

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={scrollEnabled}
      >
        {/* HEADER SECTION */}
        <View style={styles.headerRow}>
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.horizontalScroll,
              { paddingHorizontal: sidePadding },
            ]}
            snapToInterval={CARD_WIDTH + CARD_GAP}
            decelerationRate="fast"
            snapToAlignment="center"
          >
            {diagnosticTypes.map(item => {
              const diagnostic = getDiagnosticForType(item.id);
              const imageUrl = diagnostic
                ? `${BASE_URL}/diagnostics/${diagnostic.diagnostic_id}/file`
                : null;

              return (
                <View key={item.id} style={{ flexDirection: 'row' }}>
                  <View style={styles.horizontalCardLarge}>
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
                  <View style={{ width: CARD_GAP }} />
                </View>
              );
            })}
          </ScrollView>
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

const createStyles = (theme: any, commonStyles: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    scrollContent: { padding: 40, paddingBottom: 100 },
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
    horizontalScroll: {
      paddingBottom: 10,
      flexDirection: 'row',
    },
    horizontalCardLarge: {
      width: CARD_WIDTH,
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
  });

export default DiagnosticsScreen;
