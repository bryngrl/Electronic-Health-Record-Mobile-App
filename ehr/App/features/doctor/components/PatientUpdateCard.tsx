import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface Props {
  name: string;
  type: string;
  time: string;
  isUnread: boolean;
}

const PatientUpdateCard = ({ name, type, time, isUnread }: Props) => (
  <View style={styles.container}>
    <View style={styles.leftSection}>
      <View
        style={[
          styles.dot,
          { backgroundColor: isUnread ? '#29A539' : 'transparent' },
        ]}
      />
      <View style={styles.avatarPlaceholder}>
        <Image
          source={require('../../../../assets/doctors-page/patients-logo.png')}
          style={{ width: 28, height: 28, tintColor: '#035022' }}
          resizeMode="contain"
        />
      </View>
      <View style={styles.info}>
        <Text
          style={[
            styles.patientName,
            { fontWeight: isUnread ? 'bold' : 'normal' },
          ]}
        >
          {name}
        </Text>
      </View>
    </View>
    <View style={styles.rightSection}>
      <View style={styles.typeBadge}>
        <Text
          style={[
            styles.typeText,
            { fontWeight: isUnread ? 'bold' : 'normal' },
          ]}
        >
          {type}
        </Text>
      </View>
      <Text style={styles.timeText}>{time}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    alignItems: 'center',
  },
  leftSection: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  avatarPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  info: { marginLeft: 12 },
  patientName: { color: '#333', fontSize: 14 },
  patientId: { color: '#999', fontSize: 11 },
  rightSection: { alignItems: 'flex-end' },
  typeBadge: {
    backgroundColor: '#FFECBD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  typeText: { color: '#EDB62C', fontSize: 10 },
  timeText: { color: '#999', fontSize: 10 },
});

export default PatientUpdateCard;
