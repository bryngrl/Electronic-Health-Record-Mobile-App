import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export const PatientTableHeader = () => (
  <View style={styles.headerRow}>
    <Text style={[styles.headerText, { flex: 0.5 }]}>PATIENT ID</Text>
    <Text style={[styles.headerText, { flex: 2 }]}>NAME</Text>
    <Text style={[styles.headerText, { flex: 0.5 }]}>AGE</Text>
    <Text style={[styles.headerText, { flex: 1 }]}>SEX</Text>
    <Text style={[styles.headerText, { flex: 2, textAlign: 'center' }]}>ACTIONS</Text>
  </View>
);

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#004d26',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});