import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const THEME_GREEN = '#035022';

interface SearchResultsProps {
  data: any[];
  onItemPress: (item: any) => void;
}

export const SearchResults = ({ data, onItemPress }: SearchResultsProps) => {
  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => onItemPress(item)}
    >
      <View style={styles.iconContainer}>
        <Icon name={item.icon || 'person'} size={24} color={THEME_GREEN} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={styles.resultType}>{item.type}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    />
  );
};

const styles = StyleSheet.create({
  list: { paddingBottom: 100 },
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
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
  },
  textContainer: { marginLeft: 15 },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME_GREEN,
    fontFamily: 'AlteHaasGroteskBold',
  },
  resultType: {
    fontSize: 12,
    color: '#BBB',
    marginTop: 2,
    fontFamily: 'AlteHaasGrotesk',
  },
});
