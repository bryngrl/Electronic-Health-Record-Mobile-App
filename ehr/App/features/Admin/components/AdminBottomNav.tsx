import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@App/theme/ThemeContext';
import { Shadow } from 'react-native-shadow-2';

interface AdminBottomNavProps {
  activeTab: 'Users' | 'Register' | 'Settings';
  onNavigate?: (tab: 'Users' | 'Register' | 'Settings') => void;
}

const AdminBottomNav = ({ activeTab, onNavigate }: AdminBottomNavProps) => {
  const { theme, isDarkMode } = useAppTheme();
  const insets = useSafeAreaInsets();

  const styles = React.useMemo(
    () => createStyles(theme, isDarkMode, insets.bottom),
    [theme, isDarkMode, insets.bottom],
  );

  const tabs: {
    id: 'Users' | 'Register' | 'Settings';
    icon: string;
    label: string;
  }[] = [
    { id: 'Users', icon: 'account-circle', label: 'Users' },
    { id: 'Register', icon: 'person-add-alt-1', label: 'Register' },
    { id: 'Settings', icon: 'settings', label: 'Settings' },
  ];

  const NavItem = ({ label, id, icon }: any) => {
    const isActive = activeTab === id;

    return (
      <TouchableOpacity
        onPress={() => onNavigate?.(id)}
        style={styles.navItemWrapper}
      >
        <View style={[styles.navItem, isActive && styles.activeNavItem]}>
          <Icon
            name={icon}
            size={22}
            style={[
              !isActive && { color: '#848484' },
              isActive && !isDarkMode && { color: '#29A539' },
              isDarkMode && isActive && { color: theme.primary },
            ]}
          />
          <Text
            style={[
              styles.navLabel,
              isActive && { color: '#29A539', fontWeight: 'bold' },
              isDarkMode && isActive && { color: theme.primary },
            ]}
          >
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Shadow
      distance={7}
      startColor={'rgba(0, 0, 0, 0.1)'}
      containerStyle={styles.shadowContainer}
      style={[styles.shadowShape, { backgroundColor: theme.card || '#FFFFFF' }]}
    >
      <View
        style={[styles.bottomNav, { backgroundColor: theme.card || '#FFFFFF' }]}
      >
        {tabs.map(tab => (
          <NavItem
            key={tab.id}
            label={tab.label}
            id={tab.id}
            icon={tab.icon}
          />
        ))}
      </View>
    </Shadow>
  );
};

const createStyles = (theme: any, isDarkMode: boolean, bottomInset: number) =>
  StyleSheet.create({
    shadowContainer: {
      position: 'absolute',
      bottom: Math.max(bottomInset, 16) + 8,
      left: 20,
      right: 20,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    shadowShape: {
      width: '100%',
      alignSelf: 'stretch',
      borderRadius: 35,
    },
    bottomNav: {
      width: '100%',
      height: 70,
      borderRadius: 35,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 10,
    },
    navItemWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    navItem: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      width: '100%',
      height: '100%',
    },
    activeNavItem: {
      backgroundColor: theme.navActiveBg,
      borderRadius: 50,
      width: 85, // Fixed width matching the Nurse style
      height: 55, // Fixed height matching the Nurse style
    },
    navLabel: {
      fontSize: 11,
      color: '#848484',
      fontFamily: 'AlteHaasGroteskBold',
      marginBottom: -4,
    },
  });

export default AdminBottomNav;