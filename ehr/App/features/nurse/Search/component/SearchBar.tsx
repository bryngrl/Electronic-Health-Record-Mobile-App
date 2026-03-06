import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '@App/theme/ThemeContext';

interface SearchBarProps {
  query: string;
  setQuery: (text: string) => void;
  onFilterPress: () => void;
  isSortActive: boolean;
}

export const SearchBar = ({
  query,
  setQuery,
  onFilterPress,
  isSortActive,
}: SearchBarProps) => {
  const { theme, isDarkMode } = useAppTheme();
  const styles = useMemo(
    () => createStyles(theme, isDarkMode),
    [theme, isDarkMode],
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Icon
          name="search-outline"
          size={20}
          color={theme.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Search"
          value={query}
          onChangeText={setQuery}
          placeholderTextColor={theme.textMuted}
        />
      </View>
      <TouchableOpacity style={styles.filterBtn} onPress={onFilterPress}>
        <Image
          source={
            isSortActive
              ? require('@assets/icons/sort_active.png')
              : require('@assets/icons/sort.png')
          }
          style={[styles.sortIcon, isDarkMode && { tintColor: theme.primary }]}
        />
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: any, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
    },
    searchBar: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 225,
      paddingHorizontal: 15,
      height: 60,
      borderWidth: 1,
      borderColor: theme.border,
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
      color: theme.text,
    },
    filterBtn: {
      marginLeft: 20,
      width: 60,
      height: 60,
      borderRadius: 255,
      backgroundColor: theme.card,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 1, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
    },
    sortIcon: {
      width: 24,
      height: 24,
      resizeMode: 'contain',
    },
  });
