import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ViewStyle,
  TextStyle,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  Platform,
} from 'react-native';
import apiClient from '@api/apiClient';
import { useAppTheme } from '@App/theme/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface UserStaff {
  id: number;
  full_name: string;
  role: string;
  email: string;
  [key: string]: any;
}

interface AdminSearchBarProps {
  onUserSelect: (
    userId: number | null,
    userName: string,
    userObj?: UserStaff,
  ) => void;
  onToggleDropdown?: (isOpen: boolean) => void;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputBarStyle?: ViewStyle;
  inputStyle?: TextStyle;
  label?: string;
  initialUserName?: string;
  placeholder?: string;
}

const AdminSearchBar: React.FC<AdminSearchBarProps> = ({
  onUserSelect,
  onToggleDropdown,
  containerStyle,
  labelStyle,
  inputBarStyle,
  inputStyle,
  label = 'STAFF NAME :',
  initialUserName = '',
  placeholder = 'Select staff member',
}) => {
  const { theme, isDarkMode } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, isDarkMode), [theme, isDarkMode]);

  const [searchText, setSearchText] = useState(initialUserName);
  const [staffList, setStaffList] = useState<UserStaff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<UserStaff[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dropdownHeight, setDropdownHeight] = useState(0);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (initialUserName !== undefined) {
      setSearchText(initialUserName);
    }
  }, [initialUserName]);

  useEffect(() => {
    onToggleDropdown?.(showDropdown);
  }, [showDropdown, onToggleDropdown]);

  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      setError(null);
      try {
        // Updated to fetch from auth/users instead of patients
        const response = await apiClient.get('/auth/users');
        
        // Filter out actual 'admin' roles if you only want to search for staff (Nurses/Doctors)
        const normalized = (response.data || [])
          .filter((u: any) => u.role?.toLowerCase() !== 'admin')
          .sort((a: any, b: any) => (a.full_name || '').localeCompare(b.full_name || ''));

        setStaffList(normalized);
        setFilteredStaff(normalized);
      } catch (err: any) {
        console.error('AdminSearchBar Error:', err);
        setError('Connection failed.');
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.length > 0) {
      const filtered = staffList.filter(s =>
        s.full_name.toLowerCase().includes(text.toLowerCase()) ||
        s.role.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredStaff(filtered);
    } else {
      setFilteredStaff(staffList);
      onUserSelect(null, '');
    }
    setShowDropdown(true);
  };

  const onSelectUser = (staff: UserStaff) => {
    setSearchText(staff.full_name);
    setShowDropdown(false);
    onUserSelect(staff.id, staff.full_name, staff);
    Keyboard.dismiss();
  };

  return (
    <View
      style={[
        styles.section,
        containerStyle,
        showDropdown && { marginBottom: -dropdownHeight + 15 },
      ]}
    >
      {label ? (
        <Text style={[styles.sectionLabel, labelStyle]}>{label}</Text>
      ) : null}
      <View style={styles.searchWrap}>
        <Pressable
          style={[styles.searchBar, inputBarStyle]}
          onPress={() => {
            setShowDropdown(true);
            inputRef.current?.focus();
          }}
        >
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, inputStyle]}
            placeholder={placeholder}
            placeholderTextColor={theme.textMuted}
            value={searchText}
            onChangeText={handleSearch}
            onFocus={() => setShowDropdown(true)}
            underlineColorAndroid="transparent"
          />
          {loading && (
            <ActivityIndicator
              size="small"
              color={theme.primary}
              style={styles.loader}
            />
          )}
        </Pressable>

        {showDropdown && (
          <View
            style={styles.dropdown}
            onLayout={e => setDropdownHeight(e.nativeEvent.layout.height)}
          >
            <ScrollView
              style={styles.dropdownScroll}
              keyboardShouldPersistTaps="handled"
              overScrollMode="never"
              bounces={false}
            >
              {loading && staffList.length === 0 ? (
                <View style={styles.infoContainer}>
                  <ActivityIndicator size="small" color={theme.primary} />
                  <Text style={styles.infoText}>Fetching staff...</Text>
                </View>
              ) : filteredStaff.length > 0 ? (
                filteredStaff.map((item, index) => (
                  <Pressable
                    key={item.id ? item.id.toString() : `s-${index}`}
                    style={({ pressed }) => [
                      styles.dropdownItem,
                      { backgroundColor: pressed ? (isDarkMode ? '#333' : '#f0f0f0') : theme.card },
                    ]}
                    onPress={() => onSelectUser(item)}
                  >
                    <View>
                      <Text style={styles.dropdownText}>{item.full_name}</Text>
                      <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
                    </View>
                  </Pressable>
                ))
              ) : (
                <View style={styles.infoContainer}>
                  <Text style={styles.infoText}>
                    {error || 'No staff members found'}
                  </Text>
                </View>
              )}
            </ScrollView>
            <Pressable
              style={styles.closeDropdown}
              onPress={() => setShowDropdown(false)}
            >
              <Text style={styles.closeText}>CLOSE RESULTS</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
};

const createStyles = (theme: any, isDarkMode: boolean) => StyleSheet.create({
  section: {
    marginBottom: 15,
    zIndex: 9999,
    elevation: Platform.OS === 'android' ? 50 : 0,
  },
  searchWrap: {
    position: 'relative',
    zIndex: 9999,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'AlteHaasGroteskBold',
    color: theme.primary,
    marginBottom: 8,
  },
  searchBar: {
    borderRadius: 25,
    paddingHorizontal: 20,
    height: 48,
    borderWidth: 1.5,
    borderColor: theme.border,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.text,
    height: '100%',
    fontFamily: 'AlteHaasGrotesk',
  },
  loader: { marginLeft: 10 },
  dropdown: {
    backgroundColor: theme.card,
    borderRadius: 12,
    marginTop: 5,
    borderWidth: 1,
    borderColor: theme.border,
    maxHeight: SCREEN_HEIGHT * 0.28,
    zIndex: 10000,
    elevation: 1000,
    overflow: 'hidden',
  },
  dropdownScroll: {
    width: '100%',
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  dropdownText: {
    fontSize: 14,
    color: theme.text,
    fontFamily: 'AlteHaasGroteskBold',
  },
  roleText: {
    fontSize: 11,
    color: theme.primary,
    marginTop: 2,
    fontFamily: 'AlteHaasGrotesk',
  },
  infoContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: { color: theme.textMuted, fontSize: 13, textAlign: 'center' },
  closeDropdown: {
    padding: 12,
    backgroundColor: isDarkMode ? theme.border : theme.surface,
    alignItems: 'center',
  },
  closeText: {
    color: theme.error,
    fontFamily: 'AlteHaasGroteskBold',
    fontSize: 11,
    letterSpacing: 1,
  },
});

export default AdminSearchBar;