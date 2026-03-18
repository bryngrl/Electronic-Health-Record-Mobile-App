import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Modal,
  Animated,
  StatusBar,
  Platform,
  BackHandler,
  useWindowDimensions,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AdminBottomNav from '../components/AdminBottomNav';
import AdminRegisterScreen from './AdminRegisterScreen';
import { AdminUserDetails } from './AdminUserDetails';
import AdminUserDetailsEdit from './AdminUserDetailsEdit';
import AdminUserSearchScreen from './AdminUserSearchScreen';
import AdminSettingsScreen from './AdminSettingsScreen';
import apiClient from '@api/apiClient';
import { useAuth } from '@features/Auth/AuthContext';
import SweetAlert from '@components/SweetAlert';
import { AccountModal } from '@components/AccountModal';
import { useAppTheme } from '@App/theme/ThemeContext';

interface UserAccount {
  id: number;
  full_name: string;
  role: string;
  email: string;
  username?: string;
  address?: string;
  birthdate?: string;
  birthplace?: string;
  age?: number;
}

interface AdminStats {
  total_users: number;
  total_nurses: number;
  total_doctors: number;
  total_admins: number;
  total_patients: number;
  active_patients: number;
  audit_logs_today: number;
}

const AdminMainScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { theme, isDarkMode } = useAppTheme();
  const { height: windowHeight } = useWindowDimensions();
  const styles = useMemo(
    () => createStyles(theme, isDarkMode),
    [theme, isDarkMode],
  );

  const [activeTab, setActiveTab] = useState<'Users' | 'Register' | 'Settings'>(
    'Users',
  );
  const [navigationHistory, setNavigationHistory] = useState<string[]>([
    'Users',
  ]);

  const [isUserDetailsVisible, setIsUserDetailsVisible] = useState(false);
  const [targetUser, setTargetUser] = useState<UserAccount | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] =
    useState<UserAccount | null>(null);

  const [showUserSearchScreen, setShowUserSearchScreen] = useState(false);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const [isAccountModalVisible, setAccountModalVisible] = useState(false);
  const [isRoleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [modalPos, setModalPos] = useState({ y: 0, x: 0, w: 0 });

  const animValue = useRef(new Animated.Value(0)).current;

  const handleNavigation = useCallback((tab: any) => {
    setActiveTab(prev => {
      if (prev !== tab) {
        setNavigationHistory(h => [...h, tab]);
      }
      return tab;
    });
  }, []);

  const handleBack = useCallback(() => {
    if (selectedUserForEdit) {
      setSelectedUserForEdit(null);
      return true;
    }
    if (showUserSearchScreen) {
      setShowUserSearchScreen(false);
      return true;
    }
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop();
      const previousTab = newHistory[newHistory.length - 1] as any;
      setNavigationHistory(newHistory);
      setActiveTab(previousTab);
      return true;
    }
    return false;
  }, [navigationHistory, selectedUserForEdit, showUserSearchScreen]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBack,
    );
    return () => backHandler.remove();
  }, [handleBack]);

  useEffect(() => {
    if (isRoleModalVisible) {
      Animated.spring(animValue, {
        toValue: 1,
        tension: 80,
        friction: 9,
        useNativeDriver: true,
      }).start();
    } else {
      animValue.setValue(0);
    }
  }, [isRoleModalVisible]);

  const scaleY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });
  const opacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-15, 0],
  });

  const [alertConfig, setAlertConfig] = useState<any>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        apiClient.get('/admin/users'),
        apiClient.get('/admin/stats'),
      ]);
      setUsers(usersRes.data || []);
      setStats(statsRes.data || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (
      activeTab === 'Users' &&
      !showUserSearchScreen &&
      !selectedUserForEdit
    ) {
      fetchData();
    }
  }, [activeTab, showUserSearchScreen, selectedUserForEdit]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const handleUpdateRole = async (nextRole: string) => {
    if (!selectedUser) return;
    setRoleModalVisible(false);
    if (selectedUser.role?.toLowerCase() === nextRole.toLowerCase()) return;

    setAlertConfig({
      visible: true,
      title: 'Change Role',
      message: `Update ${selectedUser.full_name} to ${nextRole.toUpperCase()}?`,
      type: 'warning',
      showCancel: true,
      onConfirm: async () => {
        setAlertConfig({ visible: false });
        try {
          setLoading(true);
          await apiClient.patch(`/admin/users/${selectedUser.id}/role`, {
            role: nextRole,
          });
          setAlertConfig({
            visible: true,
            title: 'Success!',
            message: 'Updated.',
            type: 'success',
            onConfirm: () => {
              setAlertConfig({ visible: false });
              fetchData();
            },
          });
          setUsers(prev =>
            prev.map(u =>
              u.id === selectedUser.id ? { ...u, role: nextRole } : u,
            ),
          );
        } catch (error) {
          setAlertConfig({
            visible: true,
            title: 'Error',
            message: 'Failed.',
            type: 'error',
            onConfirm: () => setAlertConfig({ visible: false }),
          });
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => setAlertConfig({ visible: false }),
    });
  };

  const filteredUsers = users.filter(u => {
    const role = u.role?.toLowerCase();
    if (role === 'admin') return false;
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Nurses') return role === 'nurse';
    if (activeFilter === 'Doctors') return role === 'doctor';
    return false;
  });

  const UserItem = ({ user }: { user: UserAccount }) => {
    const isNurse = user.role?.toLowerCase() === 'nurse';
    return (
      <View style={styles.userRow}>
        <TouchableOpacity
          style={styles.userLeft}
          activeOpacity={0.6}
          onPress={() => {
            setTargetUser(user);
            setIsUserDetailsVisible(true);
          }}
        >
          <View style={styles.avatarCircle}>
            <Icon name="person" size={24} color={theme.primary} />
          </View>
          <Text style={[styles.userName, { color: theme.text }]}>
            {user.full_name}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.roleBadge,
            isNurse ? styles.nurseBadge : styles.doctorBadge,
          ]}
          onPress={e => {
            e.currentTarget.measureInWindow((x, y, width, height) => {
              setModalPos({ x, y, w: width });
              setSelectedUser(user);
              setRoleModalVisible(true);
            });
          }}
        >
          <Text
            style={[
              styles.roleBadgeText,
              isNurse ? styles.nurseText : styles.doctorText,
              { flex: 1 },
            ]}
          >
            {user.role?.toUpperCase()}
          </Text>
          <Icon
            name="keyboard-arrow-down"
            size={18}
            color={isNurse ? '#EDB62C' : '#0075C3'}
          />
        </TouchableOpacity>
      </View>
    );
  };

  // --- CONDITIONAL VIEW RENDERING ---
  if (activeTab === 'Register')
    return (
      <AdminRegisterScreen
        onNavigateTab={handleNavigation}
        navigation={navigation}
      />
    );

  if (activeTab === 'Settings')
    return (
      <AdminSettingsScreen
        onNavigateTab={handleNavigation}
        navigation={navigation}
      />
    );

  if (showUserSearchScreen)
    return (
      <AdminUserSearchScreen
        navigation={{
          goBack: () => setShowUserSearchScreen(false),
          navigate: (s: any, p: any) => {
            setShowUserSearchScreen(false);
            if (s === 'UserDetails') {
              setTargetUser(p.userData);
              setIsUserDetailsVisible(true);
            } else if (s === 'AdminUserDetailsEdit') {
              setSelectedUserForEdit(p.userData);
            }
          },
        }}
      />
    );

  if (selectedUserForEdit)
    return (
      <AdminUserDetailsEdit
        route={{ params: { userData: selectedUserForEdit } }}
        navigation={{
          goBack: () => setSelectedUserForEdit(null),
          navigate: (s: any, p: any) => {
            if (s === 'UserDetails') {
              setSelectedUserForEdit(null);
              setTargetUser(p.userData);
              setIsUserDetailsVisible(true);
            }
          },
        }}
      />
    );

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
      />
      <SafeAreaView style={styles.root}>
        <AccountModal
          visible={isAccountModalVisible}
          onClose={() => setAccountModalVisible(false)}
        />

        <AdminUserDetails
          visible={isUserDetailsVisible}
          onClose={() => setIsUserDetailsVisible(false)}
          userData={targetUser}
          navigation={{
            navigate: (screen: string, params: any) => {
              setIsUserDetailsVisible(false);
              if (screen === 'AdminUserDetailsEdit')
                setSelectedUserForEdit(params.userData);
            },
          }}
        />

        <SweetAlert
          visible={alertConfig.visible}
          {...alertConfig}
          onCancel={() => setAlertConfig({ visible: false })}
        />

        <Modal visible={isRoleModalVisible} transparent animationType="none">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setRoleModalVisible(false)}
          >
            <Animated.View
              style={[
                styles.dropdownContainer,
                {
                  top: modalPos.y,
                  left: modalPos.x,
                  width: modalPos.w,
                  opacity,
                  transform: [{ scaleY }, { translateY }],
                },
              ]}
            >
              <View
                style={[
                  styles.roleBadge,
                  selectedUser?.role?.toLowerCase() === 'nurse'
                    ? styles.nurseBadge
                    : styles.doctorBadge,
                  { marginBottom: 8 },
                ]}
              >
                <Text
                  style={[
                    styles.roleBadgeText,
                    selectedUser?.role?.toLowerCase() === 'nurse'
                      ? styles.nurseText
                      : styles.doctorText,
                    { flex: 1 },
                  ]}
                >
                  {selectedUser?.role?.toUpperCase()}
                </Text>
                <Icon
                  name="keyboard-arrow-up"
                  size={18}
                  color={
                    selectedUser?.role?.toLowerCase() === 'nurse'
                      ? '#EDB62C'
                      : '#0075C3'
                  }
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.dropdownPill,
                  styles.nurseBadge,
                  selectedUser?.role?.toLowerCase() === 'nurse' &&
                    styles.selectedBorderNurse,
                ]}
                onPress={() => handleUpdateRole('nurse')}
              >
                <Text style={[styles.roleBadgeText, styles.nurseText]}>
                  Nurse
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.dropdownPill,
                  styles.doctorBadge,
                  selectedUser?.role?.toLowerCase() === 'doctor' &&
                    styles.selectedBorderDoctor,
                  { marginTop: 8 },
                ]}
                onPress={() => handleUpdateRole('doctor')}
              >
                <Text style={[styles.roleBadgeText, styles.doctorText]}>
                  Doctor
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Modal>

        <View style={styles.fixedHeaderContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.welcome}>
                Hello, {user?.full_name?.split(' ')[0] || 'Admin'}
              </Text>
              <Text style={styles.date}>
                {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setAccountModalVisible(true)}
              style={{ marginTop: 10, padding: 5 }}
              activeOpacity={0.6}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Icon name="keyboard-arrow-down" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.searchBarContainer}
            activeOpacity={0.8}
            onPress={() => setShowUserSearchScreen(true)}
          >
            <Ionicons
              name="search-outline"
              size={20}
              color={theme.textMuted}
              style={styles.searchIcon}
            />
            <Text style={styles.searchInputPlaceholder}>Search User</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredUsers}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => <UserItem user={item} />}
          ListHeaderComponent={() => (
            <View>
              <View style={styles.statsRow}>
                {[
                  {
                    label: 'Users',
                    count:
                      (stats?.total_nurses || 0) + (stats?.total_doctors || 0),
                  },
                  { label: 'Nurses', count: stats?.total_nurses || 0 },
                  { label: 'Doctors', count: stats?.total_doctors || 0 },
                ].map((item, idx) => (
                  <View key={idx} style={styles.card}>
                    <Text style={styles.cardTitle}>
                      <Text style={{ color: theme.primary }}>
                        Total of{'\n'}
                        <Text style={styles.boldText}>{item.label}</Text>
                      </Text>
                    </Text>
                    <Text style={styles.cardCount}>{item.count}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.chipsRow}>
                {['All', 'Nurses', 'Doctors'].map(filter => (
                  <TouchableOpacity
                    key={filter}
                    onPress={() => setActiveFilter(filter)}
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
          )}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
            />
          }
        />

        <View style={styles.floatingNavContainer} pointerEvents="box-none">
          <View
            style={{ height: windowHeight, width: '100%' }}
            pointerEvents="box-none"
          >
            <AdminBottomNav activeTab="Users" onNavigate={handleNavigation} />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const createStyles = (theme: any, isDarkMode: boolean) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background },
    fixedHeaderContainer: {
      paddingHorizontal: 40,
      backgroundColor: theme.background,
      zIndex: 10,
    },
    scrollContent: { paddingHorizontal: 40, paddingBottom: 150 },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginTop: Platform.OS === 'ios' ? 20 : 40,
      marginBottom: 35,
    },
    welcome: {
      fontSize: 35,
      color: theme.primary,
      fontFamily: 'MinionPro-SemiboldItalic',
    },
    date: {
      fontSize: 14,
      color: theme.textMuted,
      marginTop: 4,
      fontFamily: 'AlteHaasGroteskBold',
    },
    searchBarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 125,
      paddingHorizontal: 15,
      height: 50,
      marginBottom: 25,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
    },
    searchIcon: { marginRight: 10 },
    searchInputPlaceholder: {
      fontSize: 15,
      color: theme.textMuted,
      fontFamily: 'AlteHaasGrotesk',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 20,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 15,
      padding: 16,
      width: '31%',
      borderWidth: 1,
      borderColor: isDarkMode ? theme.border : '#7AF489',
      elevation: 2,
    },
    cardTitle: { fontSize: 11, marginBottom: 5 },
    boldText: { fontWeight: 'bold', fontSize: 14 },
    cardCount: {
      fontSize: 40,
      color: theme.primary,
      textAlign: 'center',
      fontFamily: 'AnekGujarati',
    },
    chipsRow: { flexDirection: 'row', marginBottom: 20 },
    chip: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: '#5EAE57',
      marginRight: 10,
    },
    activeChip: { backgroundColor: '#5EAE57' },
    inactiveChip: { backgroundColor: 'transparent' },
    chipText: { fontSize: 14, fontWeight: 'bold' },
    activeChipText: { color: '#FFF' },
    inactiveChipText: { color: '#5EAE57' },
    userRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    },
    userLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatarCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    userName: {
      fontSize: 14,
      marginLeft: 8,
      width:120,
      color: theme.text,
      fontFamily: 'AlteHaasGrotesk',
    },
    roleBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 25,
      minWidth: 105,
    },
    roleBadgeText: { fontSize: 12, fontFamily: 'AlteHaasGroteskBold' },
    nurseBadge: {
      backgroundColor: isDarkMode ? 'rgba(255, 238, 194, 0.2)' : '#FFEEC2',
    },
    nurseText: { color: '#EDB62C' },
    doctorBadge: {
      backgroundColor: isDarkMode ? 'rgba(214, 234, 255, 0.2)' : '#D6EAFF',
    },
    doctorText: { color: '#0075C3' },
    floatingNavContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'transparent',
      zIndex: 1000,
    },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    dropdownContainer: { position: 'absolute' },
    dropdownPill: {
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 25,
      width: '100%',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    selectedBorderNurse: { borderColor: '#EDB62C' },
    selectedBorderDoctor: { borderColor: '#0075C3' },
  });

export default AdminMainScreen;
