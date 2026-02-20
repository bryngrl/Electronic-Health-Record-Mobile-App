import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SearchBar } from '../component/SearchBar';
import { SearchResults } from '../component/SearchResults';
import { SortModal } from '../component/SortModal';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState('Best matches');

  return (
    <View style={styles.container}>
      <SearchBar 
        query={query} 
        setQuery={setQuery} 
        onFilterPress={() => setShowFilters(!showFilters)} 
      />

      <View style={styles.content}>
        <Text style={styles.resultsTitle}>Results</Text>

        {/* Search Results Filter Header */}
        {showFilters && (
          <TouchableOpacity 
            style={styles.sortTrigger} 
            onPress={() => setSortModalVisible(true)}
          >
            <MaterialIcon name="swap-vert" size={18} color="#666" />
            <Text style={styles.sortLabel}>{sortBy}</Text>
            <Icon name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
        )}

        <SearchResults data={[]} />
      </View>

      {/* The Sort Modal */}
      <SortModal 
        visible={sortModalVisible} 
        onClose={() => setSortModalVisible(false)}
        selectedOption={sortBy}
        onSelect={setSortBy}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 15 },
  content: { flex: 1 },
  resultsTitle: { fontSize: 14, fontWeight: '700', color: '#999', marginBottom: 15 },
  sortTrigger: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA',
    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 15, borderWidth: 1, borderColor: '#EEE', marginBottom: 20,
  },
  sortLabel: { marginHorizontal: 8, fontSize: 13, color: '#666' },
});