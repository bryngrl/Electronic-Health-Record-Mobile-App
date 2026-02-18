import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Ionicon from 'react-native-vector-icons/Ionicons';

import DiagnosticCard from '../components/DiagnosticCard';

export type ViewMode = 'grid' | 'list';

interface DiagnosticsProps {
  onBack: () => void;
}

const DiagnosticsScreen: React.FC<DiagnosticsProps> = ({ onBack }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [patientName, setPatientName] = useState<string>('');

  // Mock data for the cards
  const diagnosticTypes = [
    { id: 'xray', label: 'X-RAY', hasImage: true },
    { id: 'ultrasound', label: 'ULTRASOUND', hasImage: false },
    { id: 'ctscan', label: 'CT SCAN', hasImage: false },
    { id: 'echo', label: 'ECHOCARDIOGRAM', hasImage: false },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HEADER SECTION */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicon name="chevron-back" size={28} color="#14532d" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Diagnostics</Text>
            <Text style={styles.dateText}>Monday, January 26</Text>
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

        {/* PATIENT INPUT */}
        <View style={styles.inputArea}>
          <Text style={styles.inputLabel}>PATIENT NAME :</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Select or type Patient name"
            placeholderTextColor="#C7C7CD"
            value={patientName}
            onChangeText={setPatientName}
          />
        </View>

        {/* DIAGNOSTIC CARDS GRID/LIST */}
        <View style={viewMode === 'grid' ? styles.gridWrap : styles.listWrap}>
          {diagnosticTypes.map(item => (
            <DiagnosticCard
              key={item.id}
              label={item.label}
              viewMode={viewMode}
              hasImage={item.hasImage}
            />
          ))}
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitText}>SUBMIT</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  inputArea: { marginBottom: 25 },
  inputLabel: {
    fontWeight: 'bold',
    color: '#14532d',
    marginBottom: 8,
    fontSize: 13,
  },
  textInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 25,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
  submitText: { color: '#14532d', fontWeight: 'bold', fontSize: 16 },
});

export default DiagnosticsScreen;
