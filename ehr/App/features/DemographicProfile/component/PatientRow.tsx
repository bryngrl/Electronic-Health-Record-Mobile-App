import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Image,
} from 'react-native';

export interface PatientDisplay {
  id: number;
  name: string;
  isActive: boolean;
}

interface PatientRowProps {
  item: PatientDisplay;
  isSelected: boolean;
  isSelectionMode: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

// Asset Paths
const editIcon = require('../../../../assets/icons/edit_icon.png');
const activeIcon = require('../../../../assets/icons/active_icon.png');
const inactiveIcon = require('../../../../assets/icons/inactive_icon.png');
const checkedIcon = require('../../../../assets/icons/checked_icon.png');
const uncheckedIcon = require('../../../../assets/icons/unchecked_icon.png');

const PatientRow: React.FC<PatientRowProps> = ({
  item,
  isSelected,
  isSelectionMode,
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
        {isSelectionMode ? (
          <View style={isSelected ? styles.checkCircle : styles.uncheckCircle}>
            <Image
              source={isSelected ? checkedIcon : uncheckedIcon}
              style={styles.fullIcon}
            />
          </View>
        ) : item.id ? (
          // Use item.id (mapped from patient_id in backend)
          <Text style={styles.idText}>{String(item.id)}</Text>
        ) : (
          <View style={styles.emptyIdCircle} />
        )}
      </View>

      <View style={styles.nameCol}>
        <Text style={styles.nameText}>{item.name}</Text>
      </View>

      <View style={[styles.actionsCol, isSelectionMode && { opacity: 0.5 }]}>
        <TouchableOpacity style={styles.actionBtn} disabled={isSelectionMode}>
          <View style={[styles.iconCircle, { borderColor: '#FFD54F' }]}>
            <Image source={editIcon} style={styles.fullIcon} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} disabled={isSelectionMode}>
          <View
            style={[
              styles.iconCircle,
              {
                borderColor: item.isActive ? '#81C784' : '#E57373',
                backgroundColor: item.isActive ? '#E8F5E9' : '#FFEBEE',
              },
            ]}
          >
            <Image
              source={item.isActive ? activeIcon : inactiveIcon}
              style={styles.fullIcon}
            />
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
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    marginHorizontal: 20,
  },
  idCol: { flex: 0.15, alignItems: 'center', justifyContent: 'center' },
  nameCol: { flex: 0.55, paddingLeft: 30 },
  actionsCol: {
    flex: 0.3,
    paddingRight: 25,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  idText: {
    color: '#035022',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyIdCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  uncheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  nameText: { color: '#035022', fontSize: 15 },
  actionBtn: { padding: 0 },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  fullIcon: { width: '100%', height: '100%', resizeMode: 'cover' },
});

export default PatientRow;
