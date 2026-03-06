import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  RefreshControl,
  Dimensions
} from 'react-native';
import { useDoctorDashboardLogic } from '../hooks/useDoctorDashboardLogic';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AccountModal } from '../../../components/AccountModal';
import { useAuth } from '@features/Auth/AuthContext';

const { width } = Dimensions.get('window');

const DoctorHomeScreen = ({ onBack = () => {}, onViewAll, onNavigate }: { onBack?: () => void, onViewAll?: () => void, onNavigate: (route: string, extraData?: any) => void }) => {
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
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No updates found</Text>
        <Text style={styles.emptySubtitle}>Check back later for patient records.</Text>
      </View>
    );
  };

  const handleUpdatePress = (item: any) => {
    if (item.status === 'Unread') markAsRead(item.id);

    // MAPPING: Convert update_type to category
    let category = '';
    const type = item.type.toLowerCase();

    if (type.includes('vital')) category = 'vital_signs';
    else if (type.includes('physical')) category = 'physical_exam';
    else if (type.includes('lab')) category = 'lab_values';
    else if (type.includes('intake') || type.includes('output')) category = 'intake_output';
    else if (type.includes('adl')) category = 'adl';

    if (category) {
      if (category === 'vital_signs') {
        onNavigate('VitalSigns', {
            patientId: item.patient_id,
            patientName: item.name
        });
      } else if (category === 'physical_exam') {
        onNavigate('PhysicalExam', {
            patientId: item.patient_id,
            patientName: item.name
        });
      } else {
        onNavigate('DoctorPatientDetail', {
          patientId: item.patient_id,
          category: category
        });
      }
    } else {
      // Fallback for types we haven't mapped yet
      console.log('Unmapped update type:', item.type);
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

        <View style={styles.statsContainer}>
            <View style={styles.greenVerticalLine} />
            <View style={styles.statsRow}>
                <StatItem label="Updates Today" count={updates.length.toString()} />
                <StatItem label="Unread Updates" count={unreadCount.toString()} />
                <StatItem label="Read Updates" count={readCount.toString()} />
            </View>
        </View>

        <View style={styles.filterHeader}>
          <Text style={styles.sectionTitle}>Patient Updates</Text>
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.viewAll}>View all ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chipsRow}>
          {['All', 'Unread', 'Read'].map((filter) => (
            <TouchableOpacity 
              key={filter}
              onPress={() => setActiveFilter(filter as any)}
              style={[styles.chip, activeFilter === filter ? styles.activeChip : styles.inactiveChip]}
            >
              <Text style={[styles.chipText, activeFilter === filter ? styles.activeChipText : styles.inactiveChipText]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.listContainer}>
            {filteredUpdates.length > 0 ? (
            filteredUpdates.map((item, index) => (
                <TouchableOpacity 
                    key={item.id || index} 
                    onPress={() => handleUpdatePress(item)}
                    activeOpacity={0.7}
                    style={styles.patientRow}
                >
                    <View style={[styles.patientLeft, { flex: 1 }]}>
                        <View style={[styles.statusDot, { backgroundColor: item.status === 'Unread' ? '#29A539' : 'transparent' }]} />
                        <View style={styles.avatarContainer}>
                            <Icon name="person" size={20} color="#035022" />
                        </View>
                        <Text style={styles.patientName}>{item.name}</Text>
                    </View>

                    <View style={styles.patientRightContainer}>
                        <View style={styles.patientRight}>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{item.type}</Text>
                            </View>
                            <Text style={styles.timeText}>{item.time}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            ))
            ) : renderEmptyState()}
        </View>
      </ScrollView>

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

const StatItem = ({ label, count }: any) => (
  <View style={styles.statItem}>
    <View style={styles.circle}>
       <Icon name="person" size={24} color="#035022" />
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
  scrollContent: { paddingHorizontal: 40, paddingBottom: 150, paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 35, marginTop: 10 },
  welcome: { fontSize: 35, color: '#035022', fontFamily: 'MinionPro-SemiboldItalic' },
  date: { fontSize: 14, color: '#B2B2B2', marginTop: 4, fontWeight: 'bold' },
  searchContainer: { marginBottom: 25 },
  searchBarWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 30, paddingHorizontal: 15,
    borderWidth: 1, borderColor: '#F0F0F0', height: 50, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  searchIcon: { width: 18, height: 18, marginRight: 10, tintColor: '#D9D9D9' },
  searchBar: { flex: 1, height: 50, color: '#333', fontSize: 16 },
  statsContainer: { flexDirection: 'row', marginBottom: 30, alignItems: 'center' },
  greenVerticalLine: { width: 4, backgroundColor: '#29A539', height: '80%', marginRight: 15, borderRadius: 2 },
  statsRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center', flex: 1 },
  circle: { 
    width: 55, height: 55, borderRadius: 27.5, borderWidth: 1, borderColor: '#D4F5D9',
    backgroundColor: '#F6FFF7', justifyContent: 'center', alignItems: 'center', marginBottom: 8 
  },
  statLabel: { fontSize: 11, color: '#035022', fontWeight: 'bold', textAlign: 'center', marginBottom: 2 },
  statCount: { fontSize: 26, color: '#035022', fontWeight: 'bold' },
  filterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#858583' },
  viewAll: { color: '#999696', fontSize: 13 },
  chipsRow: { flexDirection: 'row', marginBottom: 20 },
  chip: { paddingHorizontal: 25, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 10 },
  activeChip: { backgroundColor: '#5EAE57', borderColor: '#5EAE57' },
  inactiveChip: { backgroundColor: 'transparent', borderColor: '#5EAE57' },
  chipText: { fontSize: 14, fontWeight: '500', color: '#5EAE57' },
  activeChipText: { color: '#FFF' },
  inactiveChipText: { color: '#5EAE57' },
  listContainer: { paddingBottom: 20 },
  patientRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  patientLeft: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  avatarContainer: { marginRight: 12 },
  patientName: { fontSize: 16, color: '#000', fontWeight: '500' },
  patientRightContainer: { flexDirection: 'row', alignItems: 'center' },
  patientRight: { alignItems: 'flex-end' },
  badge: { backgroundColor: '#FFF4C3', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 4 },
  badgeText: { color: '#E6B93D', fontSize: 12, fontWeight: 'bold' },
  timeText: { color: '#B2B2B2', fontSize: 12 },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyTitle: { color: '#999696', fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  emptySubtitle: { color: '#999696', fontSize: 14 },
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