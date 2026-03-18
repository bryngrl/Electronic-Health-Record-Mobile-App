import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
  StatusBar,
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
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [stickyHeaderHeight, setStickyHeaderHeight] = useState(0);
  const stickyOpacity = useRef(new Animated.Value(0)).current;
  const stickyTranslateY = useRef(new Animated.Value(-12)).current;
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

  useEffect(() => {
    Animated.parallel([
      Animated.timing(stickyOpacity, {
        toValue: showStickyHeader ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(stickyTranslateY, {
        toValue: showStickyHeader ? 0 : -12,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [showStickyHeader, stickyOpacity, stickyTranslateY]);

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
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
      />
      <Animated.View
        pointerEvents={showStickyHeader ? 'auto' : 'none'}
        onLayout={event => {
          setStickyHeaderHeight(event.nativeEvent.layout.height);
        }}
        style={[
          styles.stickyOverlay,
          {
            opacity: stickyOpacity,
            transform: [{ translateY: stickyTranslateY }],
          },
        ]}
      >
        <View style={styles.stickyHeaderRow}>
          <View>
            <Text style={styles.welcome}>
              Hello, {user?.full_name?.split(' ')[0] || 'Doctor'}
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
            style={{ marginTop: 10, padding: 5 }}
            activeOpacity={0.6}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Icon name="keyboard-arrow-down" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.stickySearchContainer}>
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

        <View style={styles.stickyPillsRow}>
          {['All', 'Unread', 'Read'].map(filter => (
            <TouchableOpacity
              key={`sticky-${filter}`}
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
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.stickyFadeWrapper,
          {
            top: stickyHeaderHeight - 4,
            opacity: stickyOpacity,
            transform: [{ translateY: stickyTranslateY }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.73)',
            'rgba(255, 255, 255, 0.51)',
            'rgba(255, 255, 255, 0.32)',
          ]}
          style={styles.stickyFadeBottom}
        />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        onScroll={event => {
          setShowStickyHeader(event.nativeEvent.contentOffset.y > 170);
        }}
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
              Hello, {user?.full_name?.split(' ')[0] || 'Doctor'}
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
            style={{ marginTop: 10, padding: 5 }}
            activeOpacity={0.6}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Icon name="keyboard-arrow-down" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* !!! SEARCH BAR !!! */}

        {/* <View style={styles.searchContainer}>
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
        </View> */}
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
        <View style={styles.stickyControls}>
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
        </View>
        <View style={styles.listContainer}>
          {filteredUpdates.length > 0
            ? filteredUpdates.map((item, index) => (
                <TouchableOpacity
                  key={item.id || index}
                  onPress={() => handleUpdatePress(item)}
                  activeOpacity={0.7}
                  style={styles.patientRow}
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
              ))
            : renderEmptyState()}
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
