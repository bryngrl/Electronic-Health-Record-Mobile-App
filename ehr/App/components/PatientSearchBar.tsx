import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import apiClient from '@api/apiClient';
import { useAppTheme } from '@App/theme/ThemeContext';

// Cache key derived from endpoint so nurse and doctor endpoints are stored separately
const getCacheKey = (endpoint: string) =>
  `psb_cache_${endpoint.replace(/[^a-z0-9]/gi, '_')}`;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  apiEndpoint?: string;
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
  apiEndpoint = '/patient?all=true',
}) => {
  const { theme, isDarkMode } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, isDarkMode), [theme, isDarkMode]);

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
    const cacheKey = getCacheKey(apiEndpoint);

    const loadAndFetch = async () => {
      // Load cache for instant display
      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const parsed: Patient[] = JSON.parse(cached);
          setPatients(parsed);
          setFilteredPatients(parsed);
          setLoading(false); // show cached data immediately
        }
      } catch {}

      // Always fetch fresh data in background
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(apiEndpoint);
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
        AsyncStorage.setItem(cacheKey, JSON.stringify(normalized)).catch(() => {});
      } catch (err: any) {
        console.error('PatientSearchBar Error:', err);
        setError('Connection failed.');
      } finally {
        setLoading(false);
      }
    };

    loadAndFetch();
  }, [apiEndpoint]);

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
          <Ionicons name="search-outline" size={20} color={theme.textMuted} style={styles.searchIconLeft} />
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, inputStyle]}
            placeholder={placeholder}
            placeholderTextColor={theme.textMuted}
            value={searchText}
            onChangeText={handleSearch}
            onFocus={handleFocus}
            onPressIn={() => setShowDropdown(true)}
            underlineColorAndroid="transparent"
          />
          {loading && (
            <ActivityIndicator
              size="small"
              color={theme.primary}
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
                  <ActivityIndicator size="small" color={theme.primary} />
                  <Text style={styles.infoText}>Loading...</Text>
                </View>
              ) : filteredPatients.length > 0 ? (
                filteredPatients.map((item, index) => (
                  <Pressable
                    key={item.id ? item.id.toString() : `p-${index}`}
                    style={({ pressed }) => [
                      styles.dropdownItem,
                      { backgroundColor: pressed ? (isDarkMode ? '#333' : '#f0f0f0') : theme.card },
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

const createStyles = (theme: any, isDarkMode: boolean) => StyleSheet.create({
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
    color: theme.primary,
    marginBottom: 8,
  },
  searchBar: {
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1.5,
    borderColor: theme.border,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
  },
  searchIconLeft: { marginRight: 10 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.text,
    height: '100%',
    fontFamily: 'AlteHaasGrotesk',
  },
  loader: { marginLeft: 10 },
  dropdown: {
    backgroundColor: theme.card,
    borderRadius: 12,
    marginTop: 5,
    borderWidth: 1,
    borderColor: theme.border,
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
    borderBottomColor: theme.border,
  },
  dropdownText: {
    fontSize: 14,
    color: theme.text,
    fontFamily: 'AlteHaasGrotesk',
  },
  infoContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: { color: theme.textMuted, fontSize: 13, textAlign: 'center' },
  closeDropdown: {
    padding: 12,
    backgroundColor: theme.surface,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  closeText: {
    color: theme.error,
    fontFamily: 'AlteHaasGroteskBold',
    fontSize: 11,
    letterSpacing: 1,
  },
});

export default PatientSearchBar;
