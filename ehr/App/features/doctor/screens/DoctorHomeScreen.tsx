import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Image, RefreshControl } from 'react-native';
import PatientUpdateCard from '../components/PatientUpdateCard';
import { useDoctorDashboardLogic } from '../hooks/useDoctorDashboardLogic';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AccountModal } from '../../../components/AccountModal';
import { useAuth } from '@features/Auth/AuthContext';

const DoctorHomeScreen = ({ onBack, onViewAll, onNavigate }: { onBack?: () => void, onViewAll?: () => void, onNavigate: (route: string) => void }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useAuth();
  const { 
    activeFilter, 
    setActiveFilter, 
    searchQuery, 
    setSearchQuery, 
    filteredUpdates, 
    updates,
    loading, 
    refreshUpdates, 
    markAsRead 
  } = useDoctorDashboardLogic();

  const unreadCount = updates.filter(u => u.status === 'Unread').length;
  const readCount = updates.filter(u => u.status === 'Read').length;

  const renderEmptyState = () => {
    if (activeFilter === 'Unread') {
      if (updates.length === 0) {
        return (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>no unread updates</Text>
          </View>
        );
      } else {
        return (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>You're all caught up</Text>
            <Text style={styles.emptySubtitle}>no unread updates right now.</Text>
          </View>
        );
      }
    } else if (activeFilter === 'Read') {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>no read updates yet</Text>
          <Text style={styles.emptySubtitle}>updates you will open will appear here</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No updates today</Text>
          <Text style={styles.emptySubtitle}>Patient records haven't been updated yet.</Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshUpdates} colors={['#29A539']} />
        }
      >

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Hello, {user?.full_name || 'Doctor'}</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Icon name="keyboard-arrow-down" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Search Bar with Icon */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBarWrapper}>
            <Image 
              source={require('../../../../assets/doctors-page/search.png')} 
              style={styles.searchIcon} 
              resizeMode="contain"
            />
            <TextInput 
              style={styles.searchBar} 
              placeholder="Search" 
              placeholderTextColor="#D9D9D9"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Stats Circles */}
        <View style={styles.statsRow}>
          <StatCircle label="Updates Today" count={updates.length.toString()} />
          <StatCircle label="Unread Updates" count={unreadCount.toString()} />
          <StatCircle label="Read Updates" count={readCount.toString()} />
        </View>

        {/* Filters Section */}
        <View style={styles.filterHeader}>
          <Text style={styles.sectionTitle}>Patient Updates</Text>
          <TouchableOpacity onPress={onViewAll}><Text style={styles.viewAll}>View all ›</Text></TouchableOpacity>
        </View>

        <View style={styles.chipsRow}>
          {['All', 'Unread', 'Read'].map((filter) => (
            <TouchableOpacity 
              key={filter}
              onPress={() => setActiveFilter(filter as any)}
              style={[styles.chip, activeFilter === filter && styles.activeChip]}
            >
              <Text style={[styles.chipText, activeFilter === filter && styles.activeChipText]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Updates List */}
        {filteredUpdates.length > 0 ? (
          filteredUpdates.map(item => (
            <TouchableOpacity 
              key={item.id} 
              onPress={() => item.status === 'Unread' && markAsRead(item.id)}
              activeOpacity={0.7}
            >
              <PatientUpdateCard 
                name={item.name}
                type={item.type}
                time={item.time}
                isUnread={item.status === 'Unread'}
              />
            </TouchableOpacity>
          ))
        ) : renderEmptyState()}

      </ScrollView>

      {/* Doctor Internal Bottom Nav */}
      <View style={styles.bottomNav}>
        <NavItem label="Home" icon={require('../../../../assets/doctors-page/doctor-home.png')} active />
        <NavItem label="Patients" icon={require('../../../../assets/doctors-page/doctor-patients.png')} onPress={() => onNavigate('DoctorPatients')} />
        <NavItem label="Reports" icon={require('../../../../assets/doctors-page/doctor-reports.png')} onPress={() => onNavigate('DoctorReports')} />
        <NavItem label="Settings" icon={require('../../../../assets/doctors-page/doctor-settings.png')} />
      </View>

      <AccountModal visible={modalVisible} onClose={() => setModalVisible(false)} onLogout={() => setModalVisible(false)} />
    </SafeAreaView>
  );
};

const StatCircle = ({ label, count }: any) => (
  <View style={styles.statItem}>
    <View style={styles.circle}>
       <Image source={require('../../../../assets/doctors-page/middle.png')} style={{ width: 20, height: 20 }} resizeMode="contain" />
    </View>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statCount}>{count}</Text>
  </View>
);

const NavItem = ({ label, icon, active, onPress }: any) => (
  <TouchableOpacity onPress={onPress} style={styles.navItemWrapper}>
    <View style={[styles.navItem, active && styles.activeNavItem]}>
      <Image source={icon} style={[styles.navIconImage, active && { tintColor: '#29A539' }]} resizeMode="contain" />
      <Text style={[styles.navLabel, active && { color: '#29A539' }]}>{label}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { paddingHorizontal: 25, paddingBottom: 150, paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  welcome: { fontSize: 35, color: '#035022', fontFamily: 'MinionPro-SemiboldItalic' },
  date: { fontSize: 14, color: '#B2B2B2', marginTop: 4, fontWeight: 'bold' },
  searchContainer: { marginBottom: 25 },
  searchBarWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 25, paddingHorizontal: 15,
    borderWidth: 1, borderColor: '#EBEBEB', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  searchIcon: { width: 18, height: 18, marginRight: 10, tintColor: '#D9D9D9' },
  searchBar: { flex: 1, height: 45, color: '#333' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statItem: { alignItems: 'center', flex: 1 },
  circle: { 
    width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#7AF489',
    backgroundColor: '#F6FFF7', justifyContent: 'center', alignItems: 'center', marginBottom: 8 
  },
  statLabel: { fontSize: 12, color: '#035022', fontWeight: 'bold', textAlign: 'center', marginTop: 5 },
  statCount: { fontSize: 24, color: '#035022', fontWeight: 'bold' },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#858583' },
  viewAll: { color: '#999696', fontSize: 12 },
  chipsRow: { flexDirection: 'row', marginBottom: 20 },
  chip: { paddingHorizontal: 20, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#5EAE57', marginRight: 10 },
  activeChip: { backgroundColor: '#5EAE57' },
  chipText: { color: '#5EAE57', fontSize: 12, fontWeight: 'bold' },
  activeChipText: { color: '#FFF' },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyTitle: { color: '#999696', fontWeight: 'bold', fontSize: 16, marginBottom: 5, textAlign: 'center' },
  emptySubtitle: { color: '#999696', fontSize: 14, textAlign: 'center' },
  bottomNav: { 
    position: 'absolute', bottom: 20, left: 20, right: 20, height: 70, backgroundColor: '#FFF', 
    borderRadius: 35, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 10, elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 
  },
  navItemWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navItem: { alignItems: 'center', justifyContent: 'center', paddingVertical: 8, width: '100%' },
  activeNavItem: { backgroundColor: '#E5FFE8', borderRadius: 20 },
  navIconImage: { width: 24, height: 24, marginBottom: 4 },
  navLabel: { fontSize: 10, color: '#999' }
});

export default DoctorHomeScreen;