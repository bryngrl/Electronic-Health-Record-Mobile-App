import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import DoctorBottomNav from '../components/DoctorBottomNav';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccountModal } from '../../../components/AccountModal';
import PatientSearchBar from '../../../components/PatientSearchBar';
import LoadingOverlay from '../../../components/LoadingOverlay';
import { BASE_URL } from '../../../api/config';
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
      const RNBlobUtil = require('react-native-blob-util').default;
      if (!RNBlobUtil) {
        Alert.alert(
          'Unavailable',
          'PDF generation is not available in this build. Please reinstall the app.',
        );
        return;
      }

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
            <Text style={styles.generateText}>
              {isLoading ? 'GENERATING...' : 'GENERATE PDF'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.blankSection} />
      </ScrollView>

      <DoctorBottomNav activeRoute="DoctorReports" onNavigate={onNavigate} />

      <AccountModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onLogout={() => setModalVisible(false)}
      />

      <LoadingOverlay visible={isLoading} message="Generating PDF..." />
    </View>
  );
};

export default DoctorReportsScreen;

