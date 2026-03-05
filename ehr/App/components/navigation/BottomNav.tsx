import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Platform,
  Image,
} from 'react-native';

const icons: { [key: string]: any } = {
  home: require('@assets/icons/home.png'),
  home_active: require('@assets/icons/home_active.png'),
  search: require('@assets/icons/search.png'),
  search_active: require('@assets/icons/search_active.png'),
  dashboard: require('@assets/icons/dashboard.png'),
  dashboard_active: require('@assets/icons/dashboard_active.png'),
  calendar: require('@assets/icons/calendar.png'),
  calendar_active: require('@assets/icons/calendar_active.png'),
  add_patient: require('@assets/icons/add_patient.png'),
  add_patient_active: require('@assets/icons/add_patient_active.png'),
};

interface BottomNavProps {
  onAddPatient?: () => void;
  activeRoute?: string;
  onNavigate?: (route: string) => void;
}

const BottomNav = ({
  onAddPatient,
  onNavigate,
  activeRoute,
}: BottomNavProps) => {
  const { width } = useWindowDimensions();

  const renderNavIcon = (
    routeName: string,
    activeIconKey: string,
    inactiveIconKey: string,
  ) => {
    const isActive = activeRoute === routeName;
    const iconSource = isActive ? icons[activeIconKey] : icons[inactiveIconKey];

    return (
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => onNavigate?.(routeName)}
        hitSlop={{ top: 20, bottom: 20, left: 15, right: 15 }}
      >
        <Image
          source={iconSource}
          style={styles.navIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { width: width }]}>
      <View style={styles.navBar}>
        {renderNavIcon('Home', 'home_active', 'home')}
        {renderNavIcon('Search', 'search_active', 'search')}

        <View style={styles.placeholder} />

        {renderNavIcon('Dashboard', 'dashboard_active', 'dashboard')}
        {renderNavIcon('Calendar', 'calendar_active', 'calendar')}
      </View>

      <TouchableOpacity
        style={[
          styles.fabWrapper,
          activeRoute === 'Register'
            ? styles.fabActiveBorder
            : styles.fabInactiveBorder,
        ]}
        activeOpacity={0.8}
        onPress={onAddPatient}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={styles.fabInner}>
          <Image
            source={
              activeRoute === 'Register'
                ? icons.add_patient_active
                : icons.add_patient
            }
            style={styles.fabIcon}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'transparent',
    height: 100,
    justifyContent: 'flex-end',
  },
  navBar: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  iconContainer: {
    flex: 1,
    height: '100%', // Makes the entire height of the bar touchable
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    width: 20,
    height: 20,
  },
  placeholder: {
    width: 70,
  },
  fabWrapper: {
    position: 'absolute',
    alignSelf: 'center',
    top: 0,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  fabInactiveBorder: {
    borderColor: '#E0E0E0',
  },
  fabActiveBorder: {
    borderColor: '#1B5E20',
    borderWidth: 2,
  },
  fabInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    width: 32,
    height: 32,
  },
});

export default BottomNav;
