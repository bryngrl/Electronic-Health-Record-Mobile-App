import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '@App/theme/ThemeContext';
import { useAuth } from '@features/Auth/AuthContext';

const { height } = Dimensions.get('window');

interface AccountModalProps {
  visible: boolean;
  onClose: () => void;
  onLogout?: () => void; // Optional if we use useAuth directly
}

export const AccountModal = ({
  visible,
  onClose,
  onLogout,
}: AccountModalProps) => {
  const { theme, isDarkMode, toggleDarkMode } = useAppTheme();
  const { user, logout } = useAuth();
  
  const styles = useMemo(
    () => createStyles(theme, isDarkMode),
    [theme, isDarkMode],
  );

  const handleLogout = async () => {
    await logout();
    if (onLogout) onLogout();
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.handle} />

              <Text style={styles.titleText}>Account</Text>

              <View style={styles.profileSection}>
                <View style={styles.avatarBox}>
                  <Text style={styles.avatarText}>{user?.full_name?.charAt(0) || 'U'}</Text>
                </View>
                <View style={styles.profileText}>
                  <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
                  <Text style={styles.userRole}>{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Role'}</Text>
                </View>
              </View>

              <View style={styles.menuCard}>
                <View style={styles.menuItem}>
                  <View style={styles.switchRow}>
                    <Text style={styles.menuText}>Dark Mode</Text>
                    <Switch
                      trackColor={{ false: '#767577', true: theme.primary }}
                      thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
                      onValueChange={toggleDarkMode}
                      value={isDarkMode}
                    />
                  </View>
                </View>

                <View style={styles.separator} />

                <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                  <View style={styles.logoutRow}>
                    <Icon
                      name="log-out-outline"
                      size={24}
                      color={theme.error}
                    />
                    <Text style={styles.logoutLabel}>Log out</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const createStyles = (theme: any, isDarkMode: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: theme.modalBg,
      borderTopLeftRadius: 35,
      borderTopRightRadius: 35,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 40,
      minHeight: height * 0.42,
      zIndex: 9999,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
        },
        android: {
          elevation: 24,
        },
      }),
    },
    handle: {
      width: 45,
      height: 5,
      backgroundColor: theme.modalHandle,
      borderRadius: 3,
      alignSelf: 'center',
      marginBottom: 20,
    },
    titleText: {
      fontSize: 18,
      color: theme.primary,
      textAlign: 'center',
      marginBottom: 25,
      fontFamily: 'AlteHaasGroteskBold',
    },
    profileSection: {
      flexDirection: 'row',
      backgroundColor: theme.card,
      padding: 18,
      borderRadius: 20,
      alignItems: 'center',
      marginBottom: 15,
      borderWidth: 1,
      borderColor: theme.border,
    },
    avatarBox: {
      width: 52,
      height: 52,
      backgroundColor: theme.primary,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
    profileText: { marginLeft: 16 },
    userName: {
      fontSize: 18,
      color: theme.primary,
      fontFamily: 'AlteHaasGroteskBold',
    },
    userRole: {
      fontSize: 14,
      color: theme.textMuted,
      fontFamily: 'AlteHaasGrotesk',
    },
    menuCard: {
      backgroundColor: theme.card,
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.border,
    },
    menuItem: { padding: 20 },
    menuText: {
      fontSize: 16,
      color: theme.text,
      fontFamily: 'AlteHaasGroteskBold',
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    separator: {
      height: 1,
      backgroundColor: theme.border,
      marginHorizontal: 20,
    },
    logoutRow: { flexDirection: 'row', alignItems: 'center' },
    logoutLabel: {
      color: theme.error,
      fontSize: 16,
      marginLeft: 12,
      fontFamily: 'AlteHaasGroteskBold',
    },
  });
