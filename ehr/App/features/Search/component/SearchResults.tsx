import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const THEME_GREEN = '#1B4332';

export const SearchResults = ({ data }: { data: any[] }) => {
  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.resultItem}>
      <View style={styles.iconContainer}>
        {item.isSpecial ? (
          <MaterialIcon name="show-chart" size={24} color={THEME_GREEN} />
        ) : (
          <Icon name={item.icon} size={24} color={THEME_GREEN} />
        )}
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
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: { paddingBottom: 100 },
  resultItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    marginBottom: 10 
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
    elevation: 1,
  },
  textContainer: { marginLeft: 15 },
  resultName: { fontSize: 16, fontWeight: 'bold', color: THEME_GREEN },
  resultType: { fontSize: 12, color: '#BBB', marginTop: 2 },
});