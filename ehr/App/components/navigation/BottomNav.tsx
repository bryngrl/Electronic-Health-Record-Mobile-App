import React from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  useWindowDimensions, // Use this for responsiveness
  Platform 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface BottomNavProps {
  onAddPatient?: () => void;
  activeRoute?: string;
  onNavigate?: (route: string) => void;
}

const BottomNav = ({ onAddPatient, onNavigate, activeRoute }: BottomNavProps) => {
  // Dynamically get width and height for orientation changes
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.container, { width: width }]}>
      {/* Main Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity 
          style={styles.iconContainer} 
          onPress={() => onNavigate?.('Home')}
        >
          <Icon 
            name="home" 
            size={26} 
            color={activeRoute === 'Home' ? '#2D6A4F' : '#B0B0B0'} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.iconContainer} 
          onPress={() => onNavigate?.('Search')}
        >
          <Icon 
            name="search" 
            size={26} 
            color={activeRoute === 'Search' ? '#2D6A4F' : '#B0B0B0'} 
          />
        </TouchableOpacity>

        {/* Dynamic Center Gap for FAB */}
        <View style={styles.placeholder} />

        <TouchableOpacity 
          style={styles.iconContainer}
          onPress={() => onNavigate?.('Grid')}
        >
          <Icon 
            name="dashboard" 
            size={26} 
            color={activeRoute === 'Grid' ? '#2D6A4F' : '#B0B0B0'} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.iconContainer}
          onPress={() => onNavigate?.('Calendar')}
        >
          <Icon 
            name="calendar-today" 
            size={26} 
            color={activeRoute === 'Calendar' ? '#2D6A4F' : '#B0B0B0'} 
          />
        </TouchableOpacity>
      </View>

      {/* Responsive FAB */}
      <TouchableOpacity 
        style={styles.fabWrapper} 
        activeOpacity={0.9}
        onPress={onAddPatient}
      >
        <View style={styles.fabInner}>
          <Icon name="person-add" size={28} color={activeRoute === 'Register' ? '#2D6A4F' : '#B0B0B0'}  />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    height: 90,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  navBar: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 80, // Slightly wider to ensure space in landscape
  },
  fabWrapper: {
    position: 'absolute',
    alignSelf: 'center',
    top: 0,
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  fabInner: {
  
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BottomNav;