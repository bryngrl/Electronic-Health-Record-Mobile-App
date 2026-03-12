import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import { useAppTheme } from '@App/theme/ThemeContext';

interface DoctorBottomNavProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
}

const NAV_ITEMS = [
  {
    label: 'Home',
    route: 'DoctorHome',
    icon: require('@assets/doctors-page/doctor-home.png'),
  },
  {
    label: 'Patients',
    route: 'DoctorPatients',
    icon: require('@assets/doctors-page/doctor-patients.png'),
  },
  {
    label: 'Reports',
    route: 'DoctorReports',
    icon: require('@assets/doctors-page/doctor-reports.png'),
  },
  {
    label: 'Settings',
    route: 'DoctorSettings',
    icon: require('@assets/doctors-page/doctor-settings.png'),
  },
];

const DoctorBottomNav = ({ activeRoute, onNavigate }: DoctorBottomNavProps) => {
  const { theme, isDarkMode } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Shadow
      distance={7}
      startColor={'rgba(0,0,0,0.1)'}
      containerStyle={styles.shadowContainer}
      style={[styles.shadowShape, { backgroundColor: theme.card }]}
    >
      <View style={[styles.nav, { backgroundColor: theme.card }]}>
        {NAV_ITEMS.map(item => {
          const active = activeRoute === item.route;
          return (
            <TouchableOpacity
              key={item.route}
              onPress={() => !active && onNavigate(item.route)}
              style={styles.navItemWrapper}
            >
              <View style={[styles.navItem, active && styles.activeNavItem]}>
                <Image
                  source={item.icon}
                  style={[
                    styles.navIconImage,
                    !active && { tintColor: '#848484' },
                    active && !isDarkMode && { tintColor: '#29A539' },
                    active && isDarkMode && { tintColor: theme.primary },
                  ]}
                  resizeMode="contain"
                />
                <Text
                  style={[
                    styles.navLabel,
                    active && {
                      color: isDarkMode ? theme.primary : '#29A539',
                      fontWeight: 'bold',
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Shadow>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    shadowContainer: {
      position: 'absolute',
      bottom: 28,
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
    nav: {
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
      fontSize: 11,
      color: '#848484',
      fontFamily: 'AlteHaasGroteskBold',
      marginBottom: -4,
    },
  });

export default DoctorBottomNav;
