import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, RefreshControl } from 'react-native';
import PatientUpdateCard from '../components/PatientUpdateCard';
import { useDoctorDashboardLogic } from '../hooks/useDoctorDashboardLogic';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AccountModal } from '../../../components/AccountModal';
import { useAuth } from '@features/Auth/AuthContext';
import { useAppTheme } from '@App/theme/ThemeContext';
import { createStyles } from './DoctorUpdatesScreen.styles';

const DoctorUpdatesScreen = ({ onBack, onNavigate }: { onBack?: () => void, onNavigate: (route: string, params?: any) => void }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useAuth();
  const { theme, isDarkMode } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, isDarkMode), [theme, isDarkMode]);
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

  const handleUpdatePress = (item: any) => {
    if (item.status === 'Unread') markAsRead(item.id, item.type_key, item.record_id);
    const typeKeyToRoute: Record<string, string> = {
      'vital-signs': 'VitalSigns',
      'physical-exam': 'PhysicalExam',
      'intake-output': 'IntakeOutput',
      'lab-values': 'LabValues',
      'adl': 'ADL',
      'ivs-lines': 'IvsLines',
      'medication': 'Medication',
      'medical-history': 'MedicalHistory',
      'diagnostics': 'Diagnostics',
      'medical-reconciliation': 'MedicationReconciliation',
    };
    const route = typeKeyToRoute[item.type_key] ?? 'DoctorPatientDetail';
    onNavigate(route, {
      patientId: item.patient_id,
      patientName: item.name,
    });
  };

  return (
    <View style={styles.root}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshUpdates} colors={[theme.secondary]} />
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
            <Icon name="keyboard-arrow-down" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBarWrapper}>
            <Ionicons name="search-outline" size={20} color={theme.textMuted} style={styles.searchIcon} />
            <TextInput 
              style={styles.searchBar} 
              placeholder="Search" 
              placeholderTextColor="#D9D9D9"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.filterSection}>
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
        </View>

        {/* Updates List */}
        {filteredUpdates.length > 0 ? (
          filteredUpdates.map(item => (
            <TouchableOpacity 
              key={item.id} 
              onPress={() => handleUpdatePress(item)}
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

      <View style={styles.bottomNav}>
        <NavItem label="Home" icon={require('../../../../assets/doctors-page/doctor-home.png')} active onPress={onBack} theme={theme} styles={styles} />
        <NavItem label="Patients" icon={require('../../../../assets/doctors-page/doctor-patients.png')} onPress={() => onNavigate('DoctorPatients')} theme={theme} styles={styles} />
        <NavItem label="Reports" icon={require('../../../../assets/doctors-page/doctor-reports.png')} onPress={() => onNavigate('DoctorReports')} theme={theme} styles={styles} />
        <NavItem label="Settings" icon={require('../../../../assets/doctors-page/doctor-settings.png')} onPress={() => onNavigate('DoctorSettings')} theme={theme} styles={styles} />
      </View>

      <AccountModal visible={modalVisible} onClose={() => setModalVisible(false)} onLogout={() => setModalVisible(false)} />
    </View>
  );
};

const NavItem = ({ label, icon, active, onPress, theme, styles }: any) => (
  <TouchableOpacity onPress={onPress} style={styles.navItemWrapper}>
    <View style={[styles.navItem, active && { ...styles.activeNavItem, backgroundColor: theme.navActiveBg }]}>
      <Image source={icon} style={[styles.navIconImage, { tintColor: active ? theme.secondary : theme.textMuted }]} resizeMode="contain" />
      <Text style={[styles.navLabel, { color: active ? theme.secondary : theme.textMuted }]}>{label}</Text>
    </View>
  </TouchableOpacity>
);

export default DoctorUpdatesScreen;