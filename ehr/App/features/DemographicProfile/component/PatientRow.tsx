import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Patient } from '../screen/DemographicProfileScreen';

interface PatientRowProps {
  item: Patient;
  isSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

const PatientRow: React.FC<PatientRowProps> = ({
  item,
  isSelected,
  onPress,
  onLongPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.tableRow,
        (pressed || isSelected) && { backgroundColor: '#F1F8E9' },
      ]}
    >
      <View style={styles.idCol}>
        {isSelected ? (
          <View style={styles.checkCircle}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
        ) : item.id ? (
          <Text style={styles.idText}>{String(item.id)}</Text>
        ) : (
          <View style={styles.emptyIdCircle} />
        )}
      </View>

      <View style={styles.nameCol}>
        <Text style={styles.nameText}>{item.name}</Text>
      </View>

      <View style={styles.actionsCol}>
        <TouchableOpacity style={styles.actionBtn}>
          <View style={[styles.iconCircle, { borderColor: '#FFD54F' }]}>
            <Text>📝</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <View
            style={[
              styles.iconCircle,
              {
                borderColor: item.isActive ? '#81C784' : '#E57373',
                backgroundColor: item.isActive ? '#E8F5E9' : '#FFEBEE',
              },
            ]}
          >
            <Text>{item.isActive ? '👤' : '🚫'}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  idCol: { flex: 0.15, alignItems: 'center' },
  nameCol: { flex: 0.55 },
  actionsCol: {
    flex: 0.3,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  idText: { color: '#2E7D32', fontSize: 14 },
  emptyIdCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  nameText: { color: '#004D40', fontSize: 15 },
  actionBtn: { padding: 2 },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PatientRow;
