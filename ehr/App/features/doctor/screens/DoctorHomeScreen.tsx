import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useDoctorDashboardLogic } from '../hooks/useDoctorDashboardLogic';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AccountModal } from '../../../components/AccountModal';
import { useAuth } from '@features/Auth/AuthContext';
import { useAppTheme } from '@App/theme/ThemeContext';
import { createStyles } from './DoctorHomeScreen.styles';
import DoctorBottomNav from '../components/DoctorBottomNav';

const DoctorHomeScreen = ({
  onBack: _onBack = () => {},
  onViewAll,
  onNavigate,
}: {
  onBack?: () => void;
  onViewAll?: () => void;
  onNavigate: (route: string, extraData?: any) => void;
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [showAllUpdates, setShowAllUpdates] = useState(false);
  const { user } = useAuth();
  const { theme, isDarkMode } = useAppTheme();
  const styles = useMemo(
    () => createStyles(theme, isDarkMode),
    [theme, isDarkMode],
  );
  const {
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    filteredUpdates,
    updates,
    loading,
    refreshUpdates,
    markAsRead,
  } = useDoctorDashboardLogic();

  const unreadCount = updates.filter(u => !u.isRead).length;
  const readCount = updates.filter(u => u.isRead).length;
  const shouldShowExpandedList =
    showAllUpdates || searchQuery.trim().length > 0;
  const visibleThreshold = shouldShowExpandedList ? 7 : 3;
  const hasOverflowingUpdates = filteredUpdates.length > visibleThreshold;

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No updates found</Text>
        <Text style={styles.emptySubtitle}>
          Check back later for patient records.
        </Text>
      </View>
    );
  };

  const handleUpdatePress = (item: any) => {
    if (item.status === 'Unread')
      markAsRead(item.id, item.type_key, item.record_id);
    const typeKeyToRoute: Record<string, string> = {
      'vital-signs': 'VitalSigns',
      'physical-exam': 'PhysicalExam',
      'intake-output': 'IntakeOutput',
      'lab-values': 'LabValues',
      adl: 'ADL',
      'ivs-lines': 'IvsLines',
      medication: 'Medication',
      'medical-history': 'MedicalHistory',
      diagnostics: 'Diagnostics',
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
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshUpdates}
            colors={[theme.secondary]}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>
              Hello, {user?.full_name || 'Doctor'}
            </Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{ marginTop: 10 }}
          >
            <Icon name="keyboard-arrow-down" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBarWrapper}>
            <Ionicons
              name="search-outline"
              size={20}
              color={theme.textMuted}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchBar}
              placeholder="Search"
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.greenVerticalLine} />
          <View style={styles.statsRow}>
            <StatItem
              label="Updates Today"
              count={updates.length.toString()}
              styles={styles}
            />
            <StatItem
              label="Unread Updates"
              count={unreadCount.toString()}
              styles={styles}
            />
            <StatItem
              label="Read Updates"
              count={readCount.toString()}
              styles={styles}
            />
          </View>
        </View>

        <View style={styles.filterHeader}>
          <Text style={styles.sectionTitle}>Patient Updates</Text>
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.viewAll}>View all ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chipsRow}>
          {['All', 'Unread', 'Read'].map(filter => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter as any)}
              style={[
                styles.chip,
                activeFilter === filter
                  ? styles.activeChip
                  : styles.inactiveChip,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  activeFilter === filter
                    ? styles.activeChipText
                    : styles.inactiveChipText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.listContainer}>
          {filteredUpdates.length > 0 ? (
            <View>
              <View
                style={[
                  styles.patientListWrapper,
                  {
                    maxHeight: shouldShowExpandedList ? 500 : 250,
                  },
                ]}
              >
                <ScrollView
                  style={styles.patientListScroll}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={false}
                >
                  {filteredUpdates.map((item, index) => (
                    <TouchableOpacity
                      key={item.id || index}
                      onPress={() => handleUpdatePress(item)}
                      activeOpacity={0.7}
                      style={[
                        styles.patientRow,
                        index === filteredUpdates.length - 1
                          ? styles.lastPatientRow
                          : null,
                      ]}
                    >
                      <View style={styles.patientLeftExpanded}>
                        <View
                          style={[
                            styles.statusDot,
                            item.status === 'Unread'
                              ? styles.unreadStatusDot
                              : styles.readStatusDot,
                          ]}
                        />
                        <View style={styles.avatarContainer}>
                          <Icon name="person" size={20} color={theme.primary} />
                        </View>
                        <Text
                          style={[
                            styles.patientName,
                            item.status === 'Unread'
                              ? styles.unreadPatientName
                              : styles.readPatientName,
                          ]}
                        >
                          {item.name}
                        </Text>
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
                  ))}
                </ScrollView>

                {hasOverflowingUpdates && (
                  <LinearGradient
                    colors={[
                      'rgba(0,0,0,0)',
                      isDarkMode
                        ? 'rgba(18,18,18,0.8)'
                        : 'rgba(255,255,255,0.8)',
                      isDarkMode ? 'rgba(18,18,18,1)' : 'rgba(255,255,255,1)',
                    ]}
                    style={styles.fadeBottom}
                    pointerEvents="none"
                  />
                )}
              </View>

              {searchQuery.trim().length === 0 &&
                filteredUpdates.length > 3 && (
                  <TouchableOpacity
                    style={styles.showMoreBtn}
                    onPress={() => setShowAllUpdates(prev => !prev)}
                  >
                    <Text style={styles.showMoreText}>
                      {showAllUpdates ? 'Show less' : 'View more'}
                    </Text>
                    <Icon
                      name={
                        showAllUpdates
                          ? 'keyboard-arrow-up'
                          : 'keyboard-arrow-down'
                      }
                      size={20}
                      color={theme.textMuted}
                    />
                  </TouchableOpacity>
                )}
            </View>
          ) : (
            renderEmptyState()
          )}
        </View>
      </ScrollView>

      <DoctorBottomNav activeRoute="DoctorHome" onNavigate={onNavigate} />

      <AccountModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onLogout={() => setModalVisible(false)}
      />
    </View>
  );
};

const StatItem = ({ label, count, styles }: any) => (
  <View style={styles.statItem}>
    <View style={styles.circle}>
      <Image
        source={require('../../../../assets/icons/doctor_updates.png')}
        style={[styles.statIcon]}
        resizeMode="contain"
      />
    </View>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statCount}>{count}</Text>
  </View>
);

export default DoctorHomeScreen;
