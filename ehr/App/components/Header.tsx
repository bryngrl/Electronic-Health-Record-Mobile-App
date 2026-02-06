import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';

interface HeaderProps {
  name: string;
  role: string;
  onMenuPress: () => void; // Function to open/close sidebar
}

export const Header = ({ name, role, onMenuPress }: HeaderProps) => {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuIcon} onPress={onMenuPress} activeOpacity={0.7}>
        <View style={styles.bar} />
        <View style={styles.bar} />
        <View style={styles.bar} />
      </TouchableOpacity>

      <View style={styles.textGroup}>
        <Text style={styles.greetingText}>
          Hello, <Text style={styles.italicText}>{name}, {role}!</Text>
        </Text>
        <Text style={styles.dateText}>{formattedDate}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    zIndex: 100,
  },
  menuIcon: { width: 24, height: 16, justifyContent: 'space-between', marginRight: 15 },
  bar: { width: '100%', height: 3, backgroundColor: '#1A6A24', borderRadius: 2 },
  textGroup: { flex: 1 },
  greetingText: { fontSize: 22, color: '#333' },
  italicText: { fontStyle: 'italic', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  dateText: { fontSize: 13, color: '#999', marginTop: -2 },
});