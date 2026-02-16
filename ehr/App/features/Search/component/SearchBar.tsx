import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

interface SearchBarProps {
  query: string;
  setQuery: (text: string) => void;
  onFilterPress: () => void;
}

export const SearchBar = ({ query, setQuery, onFilterPress }: SearchBarProps) => (
  <View style={styles.container}>
    <View style={styles.searchBar}>
      <Icon name="search-outline" size={20} color="#CCC" style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        placeholder="Search"
        value={query}
        onChangeText={setQuery}
        placeholderTextColor="#CCC"
      />
    </View>
    <TouchableOpacity style={styles.filterBtn} onPress={onFilterPress}>
      <MaterialIcon name="tune" size={24} color="#333" />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  searchIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#333' },
  filterBtn: {
    marginLeft: 15,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 2,
  },
});