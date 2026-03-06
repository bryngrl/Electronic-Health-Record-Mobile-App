import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  useColorScheme,
  StatusBar,
} from 'react-native';
import { SearchBar } from '@nurse/Search/component/SearchBar';
import { SearchResults } from '@nurse/Search/component/SearchResults';
import { SortModal } from '@nurse/Search/component/SortModal';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import apiClient from '@api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '@App/theme/ThemeContext';

const RECENT_SEARCHES_KEY = '@recent_searches';

const dashboardItems = [
  { id: 'Register', title: 'Register Patient', icon: 'person-add' },
  {
    id: 'Demographic Profile',
    title: 'Demographic Profile',
    icon: 'account-box',
  },
  { id: 'MedicalHistory', title: 'Medical History', icon: 'history' },
  { id: 'PhysicalExam', title: 'Physical Exam', icon: 'person-search' },
  { id: 'Vital Signs', title: 'Vital Signs', icon: 'monitor-heart' },
  { id: 'Intake and Output', title: 'Intake and Output', icon: 'water-drop' },
  { id: 'Activities', title: 'Activities of Daily Living', icon: 'extension' },
  { id: 'LabValues', title: 'Lab Values', icon: 'science' },
  { id: 'Diagnostics', title: 'Diagnostics', icon: 'biotech' },
  { id: 'IvsAndLines', title: 'IVs and Lines', icon: 'medication' },
  {
    id: 'Medication Administration',
    title: 'Medication Administration',
    icon: 'medical-services',
  },
  {
    id: 'Medical Reconciliation',
    title: 'Medical Reconciliation',
    icon: 'fact-check',
  },
];

export default function SearchScreen({
  onNavigate,
  onPatientSelect,
}: {
  onNavigate: (route: string) => void;
  onPatientSelect: (id: number) => void;
}) {
  const { isDarkMode, theme, commonStyles } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, commonStyles), [theme, commonStyles]);

  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState('Name (A-Z)');
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);

  const isPatientMode = ['Patients', 'Newest', 'Oldest'].includes(sortBy);
  const sortOptions = isPatientMode
    ? ['Newest', 'Oldest', 'Show All']
    : ['Name (A-Z)', 'Name (Z-A)', 'Features', 'Patients'];

  const handleSortSelect = (option: string) => {
    if (option === 'Show All') {
      setSortBy('Name (A-Z)');
    } else {
      setSortBy(option);
    }
  };

  useEffect(() => {
    loadRecentSearches();
    fetchPatients();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const saved = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load recent searches', e);
    }
  };

  const saveRecentSearches = async (searches: any[]) => {
    try {
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
    } catch (e) {
      console.error('Failed to save recent searches', e);
    }
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/patients/');
      let raw = [];
      if (Array.isArray(response.data)) {
        raw = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        raw = response.data.data;
      }

      const normalized = raw
        .map((p: any) => ({
          id: `p-${p.patient_id || p.id}`,
          name: `${p.last_name || ''}, ${p.first_name || ''}${
            p.middle_name ? ' ' + p.middle_name.charAt(0) + '.' : ''
          }`.trim(),
          type: 'Patient',
          icon: 'person',
          isPatient: true,
          createdAt: p.admission_date
            ? new Date(p.admission_date).getTime()
            : 0,
        }))
        .filter((p: any) => p.id !== null);

      setPatients(normalized);
    } catch (err) {
      console.error('SearchScreen Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const normalizedFeatures = dashboardItems.map(item => ({
      id: `f-${item.id}`,
      name: item.title,
      type: 'Feature',
      icon: item.icon,
      isPatient: false,
      createdAt: 0,
    }));

    const combined = [...normalizedFeatures, ...patients];
    let results = [];

    if (query.trim().length > 0) {
      const q = query.toLowerCase();
      const startsWith = combined.filter(item =>
        item.name.toLowerCase().startsWith(q),
      );
      const contains = combined.filter(
        item =>
          item.name.toLowerCase().includes(q) &&
          !item.name.toLowerCase().startsWith(q),
      );

      results = [...startsWith, ...contains];
    } else {
      results = recentSearches;
    }

    // Apply Filters
    if (sortBy === 'Features') {
      results = results.filter(item => item.type === 'Feature');
    } else if (['Patients', 'Newest', 'Oldest'].includes(sortBy)) {
      results = results.filter(item => item.type === 'Patient');
    }

    // Apply Sorts
    if (sortBy === 'Name (A-Z)') {
      results = [...results].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'Name (Z-A)') {
      results = [...results].sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'Newest' || sortBy === 'Patients') {
      results = [...results].sort(
        (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
      );
    } else if (sortBy === 'Oldest') {
      results = [...results].sort((a, b) => {
        const timeA = a.createdAt || 0;
        const timeB = b.createdAt || 0;
        if (timeA === 0) return 1;
        if (timeB === 0) return -1;
        return timeA - timeB;
      });
    }

    setFilteredResults(results);
  }, [query, patients, recentSearches, sortBy]);

  const handleItemPress = (item: any) => {
    const updatedRecent = [
      item,
      ...recentSearches.filter(i => i.id !== item.id),
    ].slice(0, 5);
    setRecentSearches(updatedRecent);
    saveRecentSearches(updatedRecent);

    if (item.type === 'Patient') {
      const patientId = parseInt(item.id.replace('p-', ''), 10);
      onPatientSelect(patientId);
      onNavigate('PatientDetail');
    } else if (item.type === 'Feature') {
      onNavigate(item.id.replace('f-', ''));
    }
  };

  const clearRecent = () => {
    setRecentSearches([]);
    saveRecentSearches([]);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
      />
      <SearchBar
        query={query}
        setQuery={setQuery}
        onFilterPress={() => setShowFilters(!showFilters)}
        isSortActive={showFilters}
      />

      <View style={styles.content}>
        {showFilters && (
          <TouchableOpacity
            style={styles.sortTrigger}
            onPress={() => setSortModalVisible(true)}
          >
            <MaterialIcon name="swap-vert" size={18} color={theme.textMuted} />
            <Text style={styles.sortLabel}>{sortBy}</Text>
            <Icon name="chevron-down" size={16} color={theme.textMuted} />
          </TouchableOpacity>
        )}

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            {query.length > 0 ? 'Search Results' : 'Recent Searches'}
          </Text>
          {query.length === 0 && recentSearches.length > 0 && (
            <TouchableOpacity onPress={clearRecent}>
              <Text style={styles.clearText}>Clear all</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading && patients.length === 0 ? (
          <ActivityIndicator size="large" color={theme.primary} />
        ) : (
          <SearchResults data={filteredResults} onItemPress={handleItemPress} />
        )}
      </View>

      <SortModal
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
        selectedOption={sortBy}
        onSelect={handleSortSelect}
        options={sortOptions}
      />
    </View>
  );
}

const createStyles = (theme: any, commonStyles: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 40,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
  },
  content: { flex: 1 },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    paddingTop: 15,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.textMuted,
    fontFamily: 'AlteHaasGroteskBold',
  },
  clearText: {
    fontSize: 12,
    color: theme.primary,
    fontFamily: 'AlteHaasGroteskBold',
  },
  sortTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 20,
    height: 50,
  },
  sortLabel: {
    marginHorizontal: 8,
    fontSize: 13,
    fontFamily: 'AlteHaasGrotesk',
    color: theme.textMuted,
  },
});
