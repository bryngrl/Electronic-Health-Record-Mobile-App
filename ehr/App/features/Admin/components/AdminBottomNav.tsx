import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; 
import { useAppTheme } from '@App/theme/ThemeContext'; // Import Added

interface AdminBottomNavProps {
  activeTab: 'Users' | 'Register' | 'Settings';
  onNavigate?: (tab: 'Users' | 'Register' | 'Settings') => void;
}

const AdminBottomNav = ({ activeTab, onNavigate }: AdminBottomNavProps) => {
  const { theme, isDarkMode } = useAppTheme(); // Access Theme

  // Theme-aware colors
  const primaryTheme = theme.primary; 
  const activeBg = isDarkMode ? 'rgba(41, 165, 57, 0.15)' : '#E0FFDD'; 
  const inactiveGrey = theme.textMuted; 
  const navContainerBg = theme.card;

  const tabs = [
    { id: 'Users', icon: 'account-circle', label: 'Users' },
    { id: 'Register', icon: 'person-add-alt-1', label: 'Register' },
    { id: 'Settings', icon: 'settings', label: 'Settings' },
  ];

  return (
    <View style={styles.navbarWrapper}>
      <View style={[styles.navbarContainer, { backgroundColor: navContainerBg, borderColor: theme.border }]}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <TouchableOpacity 
              key={tab.id}
              style={styles.navItem} 
              onPress={() => onNavigate?.(tab.id as any)}
              activeOpacity={0.7}
            >
              {/* The Active Capsule Background */}
              <View style={[
                styles.iconIndicator, 
                { backgroundColor: isActive ? activeBg : 'transparent' }
              ]}>
                <Icon 
                  name={tab.icon} 
                  size={25} 
                  color={isActive ? primaryTheme : inactiveGrey} 
                />
                
                <Text style={[
                  styles.navText, 
                  { 
                    color: isActive ? primaryTheme : inactiveGrey,
                    fontWeight: isActive ? '500' : '400' 
                  }
                ]}>
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbarWrapper: {
    position: 'absolute',
    bottom: 20, 
    left: 15,
    right: 15,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  navbarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 60, 
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconIndicator: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100, 
  },
  navText: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default AdminBottomNav;