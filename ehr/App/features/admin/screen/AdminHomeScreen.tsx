import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '@features/Auth/AuthContext';
import { useAppTheme } from '../../../theme/ThemeContext';

export default function AdminHomeScreen() {
  const { user, logout } = useAuth();
  const { theme } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Admin Dashboard</Text>
      <Text style={[styles.subtitle, { color: theme.subText }]}>
        Welcome, {user?.full_name}
      </Text>
      <Text style={[styles.placeholder, { color: theme.subText }]}>
        Admin features coming soon.
      </Text>
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  placeholder: {
    fontSize: 14,
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: '#035022',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});
