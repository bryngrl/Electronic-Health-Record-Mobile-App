import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const THEME_GREEN = '#1B5E20';

interface DoctorBottomNavProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
}

const DoctorBottomNav = ({ activeRoute, onNavigate }: DoctorBottomNavProps) => {
  const navItems = [
    { label: 'Home', icon: 'home', route: 'Doctor' },
    { label: 'Patients', icon: 'people', route: 'DoctorPatients' },
    { label: 'Assessments', icon: 'assignment', route: 'DoctorAssessments' },
    { label: 'Schedules', icon: 'event-note', route: 'DoctorSchedules' },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const isActive = activeRoute === item.route;
        return (
          <TouchableOpacity
            key={item.route}
            style={styles.navItem}
            onPress={() => onNavigate(item.route)}
          >
            <Icon
              name={item.icon}
              size={24}
              color={isActive ? THEME_GREEN : '#999'}
            />
            <Text style={[styles.label, { color: isActive ? THEME_GREEN : '#999' }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 85 : 65,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
});

export default DoctorBottomNav;
