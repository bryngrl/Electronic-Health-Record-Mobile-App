import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppTheme } from '@App/theme/ThemeContext';

interface SearchResultsProps {
  data: any[];
  onItemPress: (item: any) => void;
}

export const SearchResults = ({ data, onItemPress }: SearchResultsProps) => {
  const { theme, isDarkMode } = useAppTheme();
  const styles = useMemo(
    () => createStyles(theme, isDarkMode),
    [theme, isDarkMode],
  );

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => onItemPress(item)}
    >
      <View style={styles.iconContainer}>
        <Icon name={item.icon || 'person'} size={24} color={theme.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={styles.resultType}>{item.type}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="search-off" size={60} color={theme.textMuted} />
      <Text style={styles.emptyText}>Nothing to show here</Text>
    </View>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={styles.list}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    />
  );
};

const createStyles = (theme: any, isDarkMode: boolean) =>
  StyleSheet.create({
    list: { paddingBottom: 100, flexGrow: 1 },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: -100,
    },
    emptyText: {
      marginTop: 10,
      fontSize: 16,
      color: theme.textMuted,
      fontFamily: 'AlteHaasGrotesk',
    },
    resultItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      marginBottom: 10,
    },
    iconContainer: {
      width: 45,
      height: 45,
      borderRadius: 10,
      backgroundColor: theme.card,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 2 },
    },
    textContainer: { marginLeft: 15 },
    resultName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.primary,
      fontFamily: 'AlteHaasGroteskBold',
    },
    resultType: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: 2,
      fontFamily: 'AlteHaasGrotesk',
    },
  });
