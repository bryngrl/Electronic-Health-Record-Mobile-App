import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Ionicon from 'react-native-vector-icons/Ionicons';

const CARD_WIDTH = 350;
const CARD_GAP = 20;

import DiagnosticCard from '../components/DiagnosticCard';
import SweetAlert from '../../../components/SweetAlert';
import apiClient, { BASE_URL } from '../../../api/apiClient';
import { useDiagnostics, DiagnosticRecord } from '../hook/useDiagnostics';

export type ViewMode = 'grid' | 'list';

interface DiagnosticsProps {
  onBack: () => void;
}

const DiagnosticsScreen: React.FC<DiagnosticsProps> = ({ onBack }) => {
  const { width: windowWidth } = useWindowDimensions();
  const [viewMode, setViewMode] = useState<ViewMode>(
    windowWidth > 600 ? 'grid' : 'list',
  );

  const sidePadding = (windowWidth - CARD_WIDTH) / 4;

  // Auto-switch viewMode when screen size changes
  useEffect(() => {
    if (windowWidth > 600) {
      setViewMode('grid');
    } else {
      setViewMode('list');
    }
  }, [windowWidth]);

  // Patient Search State (Copied logic from PhysicalExam)
  const [searchText, setSearchText] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );

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

  // Load patient list on mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await apiClient.get('/patients/');
        const normalized = (response.data || []).map((p: any) => ({
          id: (p.patient_id ?? p.id).toString(),
          fullName: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
        }));
        setPatients(normalized);
      } catch (e) {
        console.error('Failed to load patients');
      }
    };
    fetchPatients();
  }, []);

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
      const msg = typeof result.error === 'string' 
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
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
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
                color={viewMode === 'list' ? '#f1c40f' : '#ccc'}
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
                color={viewMode === 'grid' ? '#f1c40f' : '#ccc'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* PATIENT SEARCH (Copied from PhysicalExam) */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PATIENT NAME :</Text>
          <TextInput
            style={styles.searchBar}
            placeholder="Select or type Patient name"
            placeholderTextColor="#afafaf"
            value={searchText}
            onChangeText={(text: string) => {
              setSearchText(text);
              setFilteredPatients(
                patients.filter(p =>
                  p.fullName.toLowerCase().includes(text.toLowerCase()),
                ),
              );
              setShowDropdown(true);
            }}
          />
          {showDropdown && filteredPatients.length > 0 && (
            <View style={styles.dropdown}>
              {filteredPatients.map(p => (
                <Pressable
                  key={p.id}
                  onPress={() => {
                    setSearchText(p.fullName);
                    setSelectedPatientId(p.id);
                    setShowDropdown(false);
                  }}
                  style={styles.dropItem}
                >
                  <Text>{p.fullName}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {loading && diagnostics.length === 0 && (
          <ActivityIndicator
            size="large"
            color="#14532d"
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
          <Text style={styles.submitText}>DONE</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { padding: 30, paddingBottom: 100 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  backButton: { marginRight: 10 },
  titleContainer: { flex: 1 },
  titleText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#14532d',
    fontStyle: 'italic',
  },
  dateText: { fontSize: 16, color: '#A1A1A1', marginTop: -5 },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    padding: 4,
  },
  toggleBtn: { padding: 8, borderRadius: 8 },
  toggleActive: {
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  // Patient Search Styles
  section: { marginBottom: 25, zIndex: 10 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#14532d',
    marginBottom: 8,
  },
  searchBar: {
    borderRadius: 25,
    paddingHorizontal: 20,
    height: 50,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: '#FFF',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 3,
    position: 'absolute',
    top: 75,
    left: 0,
    right: 0,
    zIndex: 99,
  },
  dropItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
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
    backgroundColor: '#e6f9ed',
    borderWidth: 1,
    borderColor: '#22c55e',
    borderRadius: 25,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.5,
    borderColor: '#ccc',
  },
  submitText: { color: '#14532d', fontWeight: 'bold', fontSize: 16 },
});

export default DiagnosticsScreen;
