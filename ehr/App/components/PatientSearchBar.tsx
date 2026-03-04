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
  middle_name?: string;
  is_active?: string | number | boolean;
  [key: string]: any;
}

interface PatientSearchBarProps {
  onPatientSelect: (
    patientId: number | null,
    patientName: string,
    patientObj?: Patient,
  ) => void;
  onToggleDropdown?: (isOpen: boolean) => void;
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
  onToggleDropdown,
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

  // NEW: State to track the dynamic height of the dropdown
  const [dropdownHeight, setDropdownHeight] = useState(0);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (initialPatientName !== undefined) {
      setSearchText(initialPatientName);
    }
  }, [initialPatientName]);

  useEffect(() => {
    onToggleDropdown?.(showDropdown);
  }, [showDropdown, onToggleDropdown]);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError(null);
      try {
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
            fullName: `${p.last_name || ''}, ${p.first_name || ''}${
              p.middle_name ? ' ' + p.middle_name.charAt(0) + '.' : ''
            }`.trim(),
          }))
          .filter((p: any) => {
            const hasId = p.id !== null;
            const isActive =
              String(p.is_active) === '1' ||
              p.is_active === true ||
              p.is_active === 1;
            return hasId && isActive;
          })
          .sort((a, b) => {
            const lastCompare = (a.last_name || '').localeCompare(
              b.last_name || '',
            );
            if (lastCompare !== 0) return lastCompare;
            return (a.first_name || '').localeCompare(b.first_name || '');
          });

        setPatients(normalized);
        setFilteredPatients(normalized);
      } catch (err: any) {
        console.error('PatientSearchBar Error:', err);
        setError('Connection failed.');
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
    setSearchText(patient.fullName);
    setShowDropdown(false);
    onPatientSelect(patient.id, patient.fullName, patient);
    Keyboard.dismiss();
  };

  const handleFocus = () => {
    setShowDropdown(true);
    setFilteredPatients(patients);
  };

  return (
    <View
      style={[
        styles.section,
        containerStyle,
        showDropdown && { marginBottom: -dropdownHeight + 15 },
      ]}
    >
      {label ? (
        <Text style={[styles.sectionLabel, labelStyle]}>{label}</Text>
      ) : null}
      <View style={styles.searchWrap}>
        <Pressable
          style={[styles.searchBar, inputBarStyle]}
          onPress={() => {
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
          <View
            style={styles.dropdown}
            onLayout={e => setDropdownHeight(e.nativeEvent.layout.height)}
            onTouchStart={e => e.stopPropagation()}
            onTouchMove={e => e.stopPropagation()}
            onTouchEnd={e => e.stopPropagation()}
          >
            <ScrollView
              style={styles.dropdownScroll}
              keyboardShouldPersistTaps="handled"
              overScrollMode="never"
              bounces={false}
            >
              {loading && patients.length === 0 ? (
                <View style={styles.infoContainer}>
                  <ActivityIndicator size="small" color={THEME_GREEN} />
                  <Text style={styles.infoText}>Loading...</Text>
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
                    {error || 'No patients found'}
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
    zIndex: 9999,
    elevation: Platform.OS === 'android' ? 50 : 0,
  },
  searchWrap: {
    position: 'relative',
    zIndex: 9999,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'AlteHaasGroteskBold',
    color: THEME_GREEN,
    marginBottom: 8,
  },
  searchBar: {
    borderRadius: 25,
    paddingHorizontal: 20,
    height: 48,
    borderWidth: 1.5,
    borderColor: '#EBEBEB',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    height: '100%',
    fontFamily: 'AlteHaasGrotesk',
  },
  loader: { marginLeft: 10 },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: SCREEN_HEIGHT * 0.24,
    zIndex: 10000,
    elevation: 1000,
    overflow: 'hidden',
  },
  dropdownScroll: {
    width: '100%',
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'AlteHaasGrotesk',
  },
  infoContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#d32f2f',
    fontFamily: 'AlteHaasGroteskBold',
    fontSize: 11,
    letterSpacing: 1,
  },
});

export default PatientSearchBar;
