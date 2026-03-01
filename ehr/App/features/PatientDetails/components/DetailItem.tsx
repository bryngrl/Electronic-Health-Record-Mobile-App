import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DetailItemProps {
  label: string;
  value: string | number;
  halfWidth?: boolean;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, halfWidth }) => (
  <View style={[styles.container, halfWidth && { width: '48%' }]}>
    <Text style={styles.label}>{label} :</Text>
    <Text style={styles.value}>{value || 'N/A'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9B9B9B',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: '#7A7A7A',
    fontWeight: '500',
  },
});

export default DetailItem;
