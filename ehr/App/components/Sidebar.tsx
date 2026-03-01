import React from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, 
  ScrollView, Dimensions, SafeAreaView, Image 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

interface SidebarProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
  onLogout: () => void;
}

const navItems = [
  { name: "Home", icon: "home" },
  { name: "Demographic Profile", icon: "account-box" },
  { name: "History", icon: "history" },
  { name: "Physical Exam", icon: "person-search" },
  { name: "Vital Signs", icon: "monitor-heart" },
  { name: "Intake and Output", icon: "water-drop" },
  { name: "Activities of Daily Living", icon: "extension" },
  { name: "Lab Values", icon: "science" },
  { name: "Diagnostics", icon: "biotech" },
  { name: "IV's & Lines", icon: "medication" },
  { name: "Medication Administration", icon: "medical-services" },
  { name: "Medical Reconciliation", icon: "fact-check" },
];

export const Sidebar = ({ activeRoute, onNavigate, onLogout }: SidebarProps) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* LOGO SECTION - REMAINING AT TOP */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/ehr-logo.png')} 
            style={styles.logo} 
            resizeMode="contain" 
          />
        </View>

        {/* SCROLLABLE NAV LIST */}
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          {navItems.map((item) => {
            const isActive = activeRoute === item.name;
            return (
              <TouchableOpacity 
                key={item.name} 
                onPress={() => onNavigate(item.name)}
                style={[styles.navItem, isActive && styles.activeNavItem]}
              >
                <Icon 
                  name={item.icon} 
                  size={24} 
                  color={isActive ? "#ffffff" : "#1A6A24"} 
                />
                <Text style={[styles.navText, isActive && styles.activeNavText]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* FOOTER SECTION */}
        <View style={styles.footer}>
          <View style={styles.separator} />
          <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
            <Icon name="logout" size={24} color="#1A6A24" />
            <Text style={styles.logoutText}>LOG OUT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  container: { 
    width: width * 0.75, 
    height: '100%', 
    backgroundColor: '#ffffff' 
  },
  logoContainer: { 
    alignItems: 'center', 
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 10
  },
  logo: { width: 90, height: 90 },
  scroll: { flex: 1 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    borderRadius: 10,
    marginBottom: 4,
  },
  activeNavItem: { backgroundColor: '#1A6A24' },
  navText: {
    marginLeft: 15,
    fontSize: 15,
    color: '#1A6A24',
    fontWeight: '600',
  },
  activeNavText: { color: '#ffffff' },
  footer: { padding: 20 },
  separator: { 
    height: 1.5, 
    backgroundColor: '#1A6A24', 
    marginBottom: 15,
    opacity: 0.2 
  },
  logoutButton: { flexDirection: 'row', alignItems: 'center' },
  logoutText: { 
    marginLeft: 15, 
    fontSize: 16, 
    color: '#1A6A24', 
    fontWeight: 'bold' 
  },
});