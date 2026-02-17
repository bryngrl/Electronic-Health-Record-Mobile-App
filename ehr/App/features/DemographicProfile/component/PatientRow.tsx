import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { Patient } from '../screen/demographicprofilescreen';

interface PatientRowProps {
  item: Patient;
}

const PatientRow: React.FC<PatientRowProps> = ({ item }) => {
  return (
    <View style={styles.tableRow}>
      <View style={styles.idCol}>
        {item.id ? (
          <Text style={styles.idText}>{String(item.id)}</Text>
        ) : (
          <View style={styles.emptyIdCircle} />
        )}
      </View>

      <View style={styles.nameCol}>
        <Text style={styles.nameText}>{item.name}</Text>
      </View>

      <View style={styles.actionsCol}>
        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.icon}>✏️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusBtn,
            item.isActive ? styles.statusActive : styles.statusInactive,
          ]}
        >
          <Text style={styles.icon}>{item.isActive ? '👤' : '🚫'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  idCol: { flex: 0.15, alignItems: 'center' },
  nameCol: { flex: 0.55 },
  actionsCol: {
    flex: 0.3,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  idText: { color: '#2e7d32', fontWeight: 'bold' },
  emptyIdCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E0E0E0',
  },
  nameText: { color: '#004d40', fontSize: 14 },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusActive: { backgroundColor: '#E8F5E9' },
  statusInactive: { backgroundColor: '#FFEBEE' },
  icon: { fontSize: 14 },
});

export default PatientRow;
