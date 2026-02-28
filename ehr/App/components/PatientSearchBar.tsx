import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ViewStyle,
  TextStyle,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  Platform,
} from 'react-native';
import apiClient from '../api/apiClient';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const THEME_GREEN = '#0A8219';

interface Patient {
  id: number;
  fullName: string;
  patient_id?: number;
  first_name?: string;
  last_name?: string;
  [key: string]: any;
}

interface PatientSearchBarProps {
  onPatientSelect: (patientId: number | null, patientName: string) => void;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputBarStyle?: ViewStyle;
  inputStyle?: TextStyle;
  label?: string;
  initialPatientName?: string;
  placeholder?: string;
}

const PatientSearchBar: React.FC<PatientSearchBarProps> = ({
  onPatientSelect,
  containerStyle,
  labelStyle,
  inputBarStyle,
  inputStyle,
  label = 'PATIENT NAME :',
  initialPatientName = '',
  placeholder = 'Select Patient name',
}) => {
  const [searchText, setSearchText] = useState(initialPatientName);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  // Sync with initialPatientName if it changes from parent
  useEffect(() => {
    if (initialPatientName !== undefined) {
      setSearchText(initialPatientName);
    }
  }, [initialPatientName]);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('PatientSearchBar: Fetching patients from /patients/');
        const response = await apiClient.get('/patients/');

        let raw = [];
        if (Array.isArray(response.data)) {
          raw = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          raw = response.data.data;
        } else if (response.data && typeof response.data === 'object') {
          raw = [response.data];
        }

        const normalized = raw
          .map((p: any) => ({
            ...p,
            id: p.patient_id ?? p.id ?? null,
            fullName: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
          }))
          .filter((p: any) => p.id !== null);

        console.log(`PatientSearchBar: Loaded ${normalized.length} patients`);
        setPatients(normalized);
        setFilteredPatients(normalized);
      } catch (err: any) {
        console.error('PatientSearchBar: Fetch Error:', err);
        setError('Connection failed. Please check backend.');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.length > 0) {
      const filtered = patients.filter(p =>
        p.fullName.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
      onPatientSelect(null, '');
    }
    setShowDropdown(true);
  };

  const onSelectPatient = (patient: Patient) => {
    console.log('PatientSearchBar: Selected', patient.fullName);
    setSearchText(patient.fullName);
    setShowDropdown(false);
    onPatientSelect(patient.id, patient.fullName);
    Keyboard.dismiss();
  };

  const handleFocus = () => {
    console.log('PatientSearchBar: Input Focused');
    setShowDropdown(true);
    // Show all patients when focusing, regardless of current text,
    // so the user can see the list to select from.
    setFilteredPatients(patients);
  };

  return (
    <View style={[styles.section, containerStyle]}>
      {label ? (
        <Text style={[styles.sectionLabel, labelStyle]}>{label}</Text>
      ) : null}
      <View style={styles.searchWrap}>
        <Pressable
          style={[styles.searchBar, inputBarStyle]}
          onPress={() => {
            console.log('PatientSearchBar: Bar Pressed');
            setShowDropdown(true);
            inputRef.current?.focus();
          }}
        >
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, inputStyle]}
            placeholder={placeholder}
            placeholderTextColor="#BDBDBD"
            value={searchText}
            onChangeText={handleSearch}
            onFocus={handleFocus}
            onPressIn={() => setShowDropdown(true)}
            underlineColorAndroid="transparent"
          />
          {loading && (
            <ActivityIndicator
              size="small"
              color={THEME_GREEN}
              style={styles.loader}
            />
          )}
        </Pressable>

        {showDropdown && (
          <View style={styles.dropdown}>
            <ScrollView
              style={styles.dropdownScroll}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="always"
              contentContainerStyle={
                filteredPatients.length === 0 ? { flexGrow: 1 } : null
              }
            >
              {loading && patients.length === 0 ? (
                <View style={styles.infoContainer}>
                  <ActivityIndicator size="small" color={THEME_GREEN} />
                  <Text style={styles.infoText}>Loading patients...</Text>
                </View>
              ) : filteredPatients.length > 0 ? (
                filteredPatients.map((item, index) => (
                  <Pressable
                    key={item.id ? item.id.toString() : `p-${index}`}
                    style={({ pressed }) => [
                      styles.dropdownItem,
                      { backgroundColor: pressed ? '#f0f0f0' : '#fff' },
                    ]}
                    onPress={() => onSelectPatient(item)}
                  >
                    <Text style={styles.dropdownText}>{item.fullName}</Text>
                  </Pressable>
                ))
              ) : (
                <View style={styles.infoContainer}>
                  <Text style={styles.infoText}>
                    {error || 'No matching patients found'}
                  </Text>
                </View>
              )}
            </ScrollView>
            <Pressable
              style={styles.closeDropdown}
              onPress={() => setShowDropdown(false)}
            >
              <Text style={styles.closeText}>CLOSE DROPDOWN</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 15,
    zIndex: 1000,
    elevation: Platform.OS === 'android' ? 10 : undefined,
  },
  searchWrap: {
    position: 'relative',
    zIndex: 1001,
    elevation: Platform.OS === 'android' ? 11 : undefined,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME_GREEN,
    marginBottom: 8,
  },
  searchBar: {
    borderRadius: 25,
    paddingHorizontal: 20,
    height: 48,
    borderWidth: 1,
    borderColor: '#F2F2F2',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#333', height: '100%' },
  loader: { marginLeft: 10 },
  dropdown: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 52,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 100, // Highest for Android
    zIndex: 9999,
    maxHeight: SCREEN_HEIGHT * 0.4,
    overflow: 'hidden',
    minHeight: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  dropdownScroll: {
    flexGrow: 0,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownText: { fontSize: 14, color: '#333' },
  infoContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  infoText: { color: '#666', fontSize: 13, textAlign: 'center' },
  closeDropdown: {
    padding: 12,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  closeText: {
    color: '#d32f2f', // Red for close
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 1,
  },
});

export default PatientSearchBar;
