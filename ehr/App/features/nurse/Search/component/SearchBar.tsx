import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface SearchBarProps {
  query: string;
  setQuery: (text: string) => void;
  onFilterPress: () => void;
  isSortActive: boolean; // Updated prop name
}

export const SearchBar = ({
  query,
  setQuery,
  onFilterPress,
  isSortActive, // Destructure here
}: SearchBarProps) => (
  <View style={styles.container}>
    <View style={styles.searchBar}>
      <Icon
        name="search-outline"
        size={20}
        color="#CCC"
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.input}
        placeholder="Search"
        value={query}
        onChangeText={setQuery}
        placeholderTextColor="#CCC"
      />
    </View>
    <TouchableOpacity style={styles.filterBtn} onPress={onFilterPress}>
      <Image
        source={
          isSortActive
            ? require('@assets/icons/sort_active.png')
            : require('@assets/icons/sort.png')
        }
        style={styles.sortIcon}
      />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 225,
    paddingHorizontal: 15,
    height: 60,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  searchIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'AlteHaasGrotesk',
    color: '#292929',
  },
  filterBtn: {
    marginLeft: 20,
    width: 60,
    height: 60,
    borderRadius: 255,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  sortIcon: {
    width: 24, // Standard icon size
    height: 24,
    resizeMode: 'contain',
  },
});
