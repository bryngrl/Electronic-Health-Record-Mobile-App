import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Platform,
  RefreshControl,
  StatusBar,
  useWindowDimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

import AdminBottomNav from '../components/AdminBottomNav';
import apiClient from '@api/apiClient';
import { useAppTheme } from '@App/theme/ThemeContext';
import AdminRegisterScreen from './AdminRegisterScreen';


const RECENT_SEARCHES_KEY = '@admin_recent_users';

const AdminUserSearchScreen = ({ navigation }: any) => {
  const { theme, isDarkMode } = useAppTheme();
  const searchInputRef = useRef<TextInput>(null);
  
  const [activeTab, setActiveTab] = useState<'Users' | 'Register' | 'Settings'>('Users');
  const [users, setUsers] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const { height: windowHeight } = useWindowDimensions();

  useEffect(() => {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 200);
    fetchUsers();
    loadRecentSearches();
    return () => clearTimeout(timer);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/users');
      const staffOnly = (response.data || []).filter((u: any) => u.role?.toLowerCase() !== 'admin');
      setUsers(staffOnly);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentSearches = async () => {
    try {
      const saved = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) setRecentUsers(JSON.parse(saved));
    } catch (e) { console.warn(e); }
  };

  const saveToRecents = async (user: any) => {
    try {
      const filtered = recentUsers.filter(u => u.id !== user.id);
      const newRecents = [user, ...filtered].slice(0, 5);
      setRecentUsers(newRecents);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newRecents));
    } catch (e) { console.warn(e); }
  };

  const clearRecents = async () => {
    setRecentUsers([]);
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return [];
    return users.filter(u => 
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const handleSelectUser = (item: any) => {
    saveToRecents(item);
    navigation.navigate('UserDetails', { userId: item.id, userData: item });
  };

  const handleTabNavigation = (tab: 'Users' | 'Register' | 'Settings') => {
    if (tab === 'Settings') {
      // Navigate to the settings screen instead of toggling a modal
      navigation.navigate('AdminSettingsScreen');
    } else {
      // Toggle between Users and Register internally
      setActiveTab(tab);
    }
  };

  // Logic to render the Register sub-screen
  if (activeTab === 'Register') {
    return <AdminRegisterScreen onNavigateTab={setActiveTab} navigation={navigation} />;
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
      />
      <SafeAreaView style={styles.root}>
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchUsers} colors={[theme.primary]} />}
        >
          <View style={styles.searchContainer}>
            <View style={[styles.searchBarWrapper, { backgroundColor: theme.card }]}>
              <Ionicons name="search-outline" size={20} color={theme.textMuted} style={styles.searchIcon} />
              <TextInput 
                ref={searchInputRef}
                style={[styles.searchBar, { color: theme.text }]} 
                placeholder="Search User" 
                placeholderTextColor={theme.textMuted} 
                value={searchQuery} 
                onChangeText={setSearchQuery} 
              />
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
              {searchQuery.length > 0 ? 'Results' : 'Recents'}
            </Text>
            {!searchQuery && recentUsers.length > 0 && (
              <TouchableOpacity onPress={clearRecents}>
                <Text style={{color: theme.primary, fontSize: 12, fontWeight: 'bold', fontFamily: 'AlteHaasGroteskBold'}}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.listSection}>
            {searchQuery.length > 0 ? (
              filteredUsers.length > 0 ? (
                filteredUsers.map((item) => (
                  <UserCard key={item.id} item={item} theme={theme} onPress={() => handleSelectUser(item)} />
                ))
              ) : (
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>No matches found</Text>
              )
            ) : (
              recentUsers.map((item) => (
                <UserCard key={`recent-${item.id}`} item={item} theme={theme} onPress={() => handleSelectUser(item)} />
              ))
            )}
          </View>
        </ScrollView>

        <View style={styles.floatingNavContainer} pointerEvents="box-none">
          <View style={{ height: windowHeight, width: '100%' }} pointerEvents="box-none">
            {/* activeTab passed as Users because this is the root Users screen */}
            <AdminBottomNav activeTab="Users" onNavigate={handleTabNavigation} />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const UserCard = ({ item, theme, onPress }: any) => (
  <TouchableOpacity style={styles.userCard} activeOpacity={0.6} onPress={onPress}>
    <View style={styles.avatarCircle}>
      <Icon name="person" size={24} color={theme.primary} />
    </View>
    <View style={styles.info}>
      <Text style={[styles.userName, { color: theme.text }]}>{item.full_name}</Text>
      <Text style={[styles.userRole, { color: theme.textMuted }]}>{item.role}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { paddingHorizontal: 40, paddingTop: Platform.OS === 'ios' ? 20 : 40, paddingBottom: 150 },
  searchContainer: { marginBottom: 25 },
  searchBarWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 125, 
    paddingHorizontal: 15, 
    height: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  searchIcon: { marginRight: 10 },
  searchBar: { flex: 1, fontSize: 15, fontFamily: 'AlteHaasGrotesk' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5 },
  sectionTitle: { fontSize: 14, fontFamily: 'AlteHaasGroteskBold' },
  listSection: { marginTop: 5 },
  userCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingVertical: 5 },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: { marginLeft: 10 },
  userName: { fontSize: 16, fontFamily: 'AlteHaasGrotesk' },
  userRole: { fontSize: 12, marginTop: 2, textTransform: 'capitalize', fontFamily: 'AlteHaasGroteskBold' },
  floatingNavContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
  emptyText: { textAlign: 'center', marginTop: 50, fontFamily: 'AlteHaasGrotesk' }
});

export default AdminUserSearchScreen;