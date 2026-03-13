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
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Ensure this is installed

import AdminBottomNav from '../components/AdminBottomNav';
import apiClient from '@api/apiClient';
import { AccountModal } from '@components/AccountModal';
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
  const [isAccountModalVisible, setAccountModalVisible] = useState(false);

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
      const response = await apiClient.get('/auth/users');
      const staffOnly = (response.data || []).filter((u: any) => u.role?.toLowerCase() !== 'admin');
      setUsers(staffOnly);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- RECENT SEARCHES LOGIC ---
  const loadRecentSearches = async () => {
    try {
      const saved = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) setRecentUsers(JSON.parse(saved));
    } catch (e) { console.warn(e); }
  };

  const saveToRecents = async (user: any) => {
    try {
      const filtered = recentUsers.filter(u => u.id !== user.id); // Remove duplicate if exists
      const newRecents = [user, ...filtered].slice(0, 5); // Keep top 5
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
    if (tab === 'Users') navigation.navigate('AdminMainScreen'); 
    else if (tab === 'Settings') setAccountModalVisible(true);
    else setActiveTab(tab);
  };

  if (activeTab === 'Register') {
    return <AdminRegisterScreen onNavigateTab={setActiveTab} navigation={navigation} />;
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.background }]}>
      <AccountModal visible={isAccountModalVisible} onClose={() => { setAccountModalVisible(false); setActiveTab('Users'); }} />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchUsers} colors={[theme.primary]} />}
      >
        <View style={styles.searchContainer}>
          <View style={[styles.searchBarWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Icon name="search" size={24} color={isDarkMode ? theme.textMuted : "#D9D9D9"} style={styles.searchIcon} />
            <TextInput 
              ref={searchInputRef}
              style={[styles.searchBar, { color: theme.text }]} 
              placeholder="Search User" 
              placeholderTextColor="#D9D9D9" 
              value={searchQuery} 
              onChangeText={setSearchQuery} 
            />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? theme.textMuted : '#B2B2B2' }]}>
            {searchQuery.length > 0 ? 'Results' : 'Recents'}
          </Text>
          {!searchQuery && recentUsers.length > 0 && (
            <TouchableOpacity onPress={clearRecents}>
              <Text style={{color: theme.primary, fontSize: 12, fontWeight: 'bold'}}>Clear</Text>
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

      <View style={styles.floatingNavContainer}>
        <AdminBottomNav activeTab="Users" navigation={navigation} onNavigate={handleTabNavigation} />
      </View>
    </SafeAreaView>
  );
};

// Sub-component for clean rendering
const UserCard = ({ item, theme, onPress }: any) => (
  <TouchableOpacity style={styles.userCard} activeOpacity={0.6} onPress={onPress}>
    <View style={[styles.iconBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Icon name="person" size={26} color={theme.primary} />
    </View>
    <View style={styles.info}>
      <Text style={[styles.userName, { color: theme.text }]}>{item.full_name}</Text>
      <Text style={[styles.userRole, { color: theme.textMuted }]}>{item.role}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { paddingHorizontal: 35, paddingTop: 20, paddingBottom: 150 },
  searchContainer: { marginBottom: 20 },
  searchBarWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 25, paddingHorizontal: 20, borderWidth: 1.5, height: 55 },
  searchIcon: { marginRight: 10 },
  searchBar: { flex: 1, fontSize: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 5 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold' },
  listSection: { marginTop: 5 },
  userCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: { width: 48, height: 48, borderRadius: 8, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  info: { marginLeft: 20 },
  userName: { fontSize: 16, fontWeight: 'bold' },
  userRole: { fontSize: 12, marginTop: 2, fontWeight: '500', textTransform: 'capitalize' },
  floatingNavContainer: { position: 'absolute', bottom: 20, left: 20, right: 20, elevation: 10, zIndex: 100 },
  emptyText: { textAlign: 'center', marginTop: 50 }
});

export default AdminUserSearchScreen;