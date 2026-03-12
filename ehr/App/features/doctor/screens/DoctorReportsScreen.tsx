import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNBlobUtil from 'react-native-blob-util';
import { AccountModal } from '../../../components/AccountModal';
import PatientSearchBar from '../../../components/PatientSearchBar';
import { BASE_URL } from '../../../api/apiClient';
import { useAppTheme } from '@App/theme/ThemeContext';
import { createStyles } from './DoctorReportsScreen.styles';

const DoctorReportsScreen = ({
  onNavigate,
}: {
  onNavigate: (route: string) => void;
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null,
  );
  const [patientName, setPatientName] = useState('');
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { theme, isDarkMode } = useAppTheme();
  const styles = useMemo(
    () => createStyles(theme, isDarkMode),
    [theme, isDarkMode],
  );

  const handleGeneratePDF = async () => {
    if (!selectedPatientId) return;
    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');
      const pdfUrl = `${BASE_URL}/doctor/patient/${selectedPatientId}/pdf`;
      const fileName = `${patientName.replace(/\s+/g, '_')}_Results.pdf`;

      const dirs = RNBlobUtil.fs.dirs;
      const filePath = `${dirs.CacheDir}/${fileName}`;

      const res = await RNBlobUtil.config({
        path: filePath,
        fileCache: true,
      }).fetch('GET', pdfUrl, {
        Authorization: `Bearer ${token}`,
      });

      if (Platform.OS === 'android') {
        await RNBlobUtil.android.actionViewIntent(
          res.path(),
          'application/pdf',
        );
      } else {
        await RNBlobUtil.ios.openDocument(res.path());
      }
    } catch (error: any) {
      console.error('PDF generation error:', error);
      Alert.alert(
        'Error',
        `Failed to generate PDF report.\n\n${error.message}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={scrollEnabled}
      >
        {/* Header - Consistent with Home */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Reports</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Dynamic Search Bar with Dropdown */}
        <PatientSearchBar
          onPatientSelect={(id, name) => {
            setSelectedPatientId(id);
            setPatientName(name);
          }}
          onToggleDropdown={isOpen => setScrollEnabled(!isOpen)}
          initialPatientName={patientName}
          label=""
          placeholder="Search"
          containerStyle={styles.searchBarContainer}
          inputBarStyle={styles.searchBarWrapper}
          apiEndpoint="/doctor/patients"
        />

        {/* Conditional Content based on selection */}
        {!selectedPatientId ? (
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              Choose Patient to generate report.
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.generateButton, isLoading && { opacity: 0.6 }]}
            onPress={handleGeneratePDF}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.generateText}>GENERATE PDF</Text>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.blankSection} />
      </ScrollView>

      <View style={styles.bottomNav}>
        <NavItem
          label="Home"
          icon={require('../../../../assets/doctors-page/doctor-home.png')}
          onPress={() => onNavigate('DoctorHome')}
          theme={theme}
          styles={styles}
        />
        <NavItem
          label="Patients"
          icon={require('../../../../assets/doctors-page/doctor-patients.png')}
          onPress={() => onNavigate('DoctorPatients')}
          theme={theme}
          styles={styles}
        />
        <NavItem
          label="Reports"
          icon={require('../../../../assets/doctors-page/doctor-reports.png')}
          active
          theme={theme}
          styles={styles}
        />
        <NavItem
          label="Settings"
          icon={require('../../../../assets/doctors-page/doctor-settings.png')}
          onPress={() => onNavigate('DoctorSettings')}
          theme={theme}
          styles={styles}
        />
      </View>

      <AccountModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onLogout={() => setModalVisible(false)}
      />
    </View>
  );
};

const NavItem = ({ label, icon, active, onPress, theme, styles }: any) => (
  <TouchableOpacity onPress={onPress} style={styles.navItemWrapper}>
    <View
      style={[
        styles.navItem,
        active && {
          ...styles.activeNavItem,
          backgroundColor: theme.navActiveBg,
        },
      ]}
    >
      <Image
        source={icon}
        style={[
          styles.navIconImage,
          { tintColor: active ? theme.secondary : theme.textMuted },
        ]}
        resizeMode="contain"
      />
      <Text
        style={[
          styles.navLabel,
          { color: active ? theme.secondary : theme.textMuted },
        ]}
      >
        {label}
      </Text>
    </View>
  </TouchableOpacity>
);

export default DoctorReportsScreen;
