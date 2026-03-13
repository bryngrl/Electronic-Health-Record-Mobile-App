import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '@App/theme/ThemeContext';
import { useAuth } from '@features/Auth/AuthContext';
import DoctorBottomNav from '../components/DoctorBottomNav';
import SweetAlert from '../../../components/SweetAlert';
import { createStyles } from './DoctorSettingsScreen.styles';

const APP_VERSION = '1.0.0';
const APP_NAME = 'Electronic Health Record';
const APP_MADE_BY = 'BSCS-3A Students';

const DoctorSettingsScreen = ({
  onNavigate,
}: {
  onNavigate: (route: string) => void;
}) => {
  const { theme, isDarkMode, toggleDarkMode } = useAppTheme();
  const { user, logout } = useAuth();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const styles = useMemo(
    () => createStyles(theme, isDarkMode),
    [theme, isDarkMode],
  );

  const avatarInitial = user?.full_name?.charAt(0)?.toUpperCase() || 'D';

  const confirmLogout = async () => {
    setShowLogoutAlert(false);
    await logout();
  };

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.full_name || 'Doctor'}
            </Text>
            <Text style={styles.profileRole}>Doctor</Text>
            <Text style={styles.profileEmail}>{user?.email || ''}</Text>
          </View>
        </View>

        {/* About App */}
        <SectionHeader title="About" theme={theme} />
        <View style={styles.card}>
          <InfoRow
            icon="phone-android"
            label="App Name"
            value={APP_NAME}
            theme={theme}
          />
          <View style={styles.divider} />
          <InfoRow
            icon="info-outline"
            label="Version"
            value={`v${APP_VERSION}`}
            theme={theme}
          />
          <View style={styles.divider} />
          <InfoRow
            icon="school"
            label="Developed by"
            value={APP_MADE_BY}
            theme={theme}
          />
          <View style={styles.divider} />
          <InfoRow
            icon="person-outline"
            label="Your Role"
            value="Doctor"
            theme={theme}
          />
        </View>

        {/* Support */}
        <SectionHeader title="Support" theme={theme} />
        <View style={styles.card}>
          <TouchableOpacity
            onPress={() => Linking.openURL('mailto:support@ehr.com')}
          >
            <InfoRow
              icon="email"
              label="Contact Support"
              value="support@ehr.com"
              theme={theme}
              chevron
            />
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <SectionHeader title="Preferences" theme={theme} />
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={toggleDarkMode}
            activeOpacity={0.7}
          >
            <View style={styles.settingsIconLabel}>
              <View style={styles.settingsIconBox}>
                <Ionicons name="moon-outline" size={20} color={theme.primary} />
              </View>
              <Text style={styles.settingsLabel}>Dark Mode</Text>
            </View>
            <Switch
              trackColor={{ false: '#767577', true: theme.primary }}
              thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
              onValueChange={toggleDarkMode}
              value={isDarkMode}
            />
          </TouchableOpacity>
        </View>

        {/* Account */}
        <SectionHeader title="Account" theme={theme} />
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.settingsRow}
            onPress={() => setShowLogoutAlert(true)}
            activeOpacity={0.7}
          >
            <View style={styles.settingsIconLabel}>
              <View style={[styles.settingsIconBox, styles.logoutIconBox]}>
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={theme.error}
                />
              </View>
              <Text style={styles.logoutLabel}>Log out</Text>
            </View>
            <Icon name="chevron-right" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{APP_NAME}</Text>
          <Text style={styles.footerSub}>{APP_MADE_BY}</Text>
        </View>
      </ScrollView>

      <DoctorBottomNav activeRoute="DoctorSettings" onNavigate={onNavigate} />

      <SweetAlert
        visible={showLogoutAlert}
        title="Logout"
        message="Are you sure you want to log out of your account?"
        type="warning"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutAlert(false)}
      />
    </View>
  );
};

const SectionHeader = ({ title, theme }: { title: string; theme: any }) => (
  <Text
    style={{
      fontSize: 12,
      fontFamily: 'AlteHaasGroteskBold',
      color: theme.textMuted,
      marginBottom: 8,
      marginTop: 22,
      letterSpacing: 0.8,
    }}
  >
    {title.toUpperCase()}
  </Text>
);

const InfoRow = ({
  icon,
  label,
  value,
  theme,
  chevron,
}: {
  icon: string;
  label: string;
  value: string;
  theme: any;
  chevron?: boolean;
}) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
    }}
  >
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: theme.card2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
      }}
    >
      <Icon name={icon} size={20} color={theme.primary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text
        style={{
          fontSize: 13,
          fontFamily: 'AlteHaasGrotesk',
          color: theme.textMuted,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 15,
          fontFamily: 'AlteHaasGroteskBold',
          color: theme.text,
          marginTop: 2,
        }}
      >
        {value}
      </Text>
    </View>
    {chevron && <Icon name="chevron-right" size={20} color={theme.textMuted} />}
  </View>
);

export default DoctorSettingsScreen;
