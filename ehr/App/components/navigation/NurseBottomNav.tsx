import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@App/theme/ThemeContext';
import { Shadow } from 'react-native-shadow-2';

interface NurseBottomNavProps {
  activeRoute?: string;
  onNavigate: (route: string) => void;
  onAddPatient?: () => void;
}

const icons: { [key: string]: any } = {
  Home: {
    active: require('@assets/icons/home_active.png'),
    inactive: require('@assets/icons/home.png'),
  },
  Search: {
    active: require('@assets/icons/search_active.png'),
    inactive: require('@assets/icons/search.png'),
  },
  Dashboard: {
    active: require('@assets/icons/dashboard_active.png'),
    inactive: require('@assets/icons/dashboard.png'),
  },
  Register: {
    active: require('@assets/icons/add_patient_active.png'),
    inactive: require('@assets/icons/add_patient.png'),
  },
};

const NurseBottomNav = ({
  activeRoute,
  onNavigate,
  onAddPatient,
}: NurseBottomNavProps) => {
  const { theme, isDarkMode } = useAppTheme();
  const insets = useSafeAreaInsets();

  const styles = React.useMemo(() => createStyles(theme, isDarkMode, insets.bottom), [theme, isDarkMode, insets.bottom]);

  const NavItem = ({ label, route, iconKey, onPress }: any) => {
    const isActive = activeRoute === route;
    const source = isActive ? icons[iconKey].active : icons[iconKey].inactive;

    return (
      <TouchableOpacity
        onPress={() => (onPress ? onPress() : onNavigate(route))}
        style={styles.navItemWrapper}
      >
        <View style={[styles.navItem, isActive && styles.activeNavItem]}>
          <Image
            source={source}
            style={[
              styles.navIconImage,
              !isActive && { tintColor: '#848484' },
              isActive && !isDarkMode && { tintColor: '#29A539' },
              isDarkMode && isActive && { tintColor: theme.primary },
            ]}
            resizeMode="contain"
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
        <NavItem label="Home" route="Home" iconKey="Home" />
        <NavItem label="Search" route="Search" iconKey="Search" />
        <NavItem label="Dashboard" route="Dashboard" iconKey="Dashboard" />
        <NavItem
          label="Add Patient"
          route="Register"
          iconKey="Register"
          onPress={onAddPatient}
        />
      </View>
    </Shadow>
  );
};

const createStyles = (theme: any, isDarkMode: boolean, bottomInset: number) => StyleSheet.create({
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
    width: 85,
    height: 55,
  },
  navIconImage: { width: 20, height: 20, marginBottom: 6 },
  navLabel: {
    fontSize: 10,
    color: '#848484',
    fontFamily: 'AlteHaasGroteskBold',
    marginBottom: -4,
  },
});

export default NurseBottomNav;
