import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

interface Patient {
  id: string;
  name: string;
  age: string;
  sex: string;
}

export const PatientRow = ({ patient }: { patient: Patient }) => (
  <View style={styles.row}>
    <Text style={[styles.cellText, { flex: 0.6, textAlign: 'center' }]}>{patient.id}</Text>
    <Text style={[styles.cellText, styles.nameText]}>{patient.name}</Text>
    <Text style={[styles.cellText, { flex: 0.6, textAlign: 'center' }]}>{patient.age}</Text>
    <Text style={[styles.cellText, { flex: 1, textAlign: 'center' }]}>{patient.sex}</Text>
    
    <View style={styles.actionContainer}>
      <TouchableOpacity style={styles.editBtn}>
        <Text style={styles.btnText}>EDIT</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.inactiveBtn}>
        <Text style={styles.btnText}>SET INACTIVE</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Light cream background from image
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff',
  },
  cellText: {
    fontSize: 14,
    color: '#AAA',
    fontWeight: '500',
  },
  nameText: {
    flex: 2.5,
    color: '#AAA', // Brownish color for names from image
    fontWeight: '700',
    paddingLeft: 10,
  },
  actionContainer: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  editBtn: {
    backgroundColor: '#00C853',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  inactiveBtn: {
    backgroundColor: '#FF0000',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  btnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
  },
});