import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  TextInput,
  Dimensions,
  Image,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { AccountModal } from '@components/AccountModal';
import apiClient from '@api/apiClient';
import { useAppTheme } from '@App/theme/ThemeContext';
import { useAuth } from '@features/Auth/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const DASHBOARD_FEATURES = [
  { id: 'Register', title: 'Register Patient', icon: 'person-add' },
  {
    id: 'Demographic Profile',
    title: 'Demographic Profile',
    icon: 'account-box',
  },
  { id: 'MedicalHistory', title: 'Medical History', icon: 'history' },
  { id: 'PhysicalExam', title: 'Physical Exam', icon: 'person-search' },
  { id: 'Vital Signs', title: 'Vital Signs', icon: 'monitor-heart' },
  { id: 'Intake and Output', title: 'Intake and Output', icon: 'water-drop' },
  { id: 'Activities', title: 'Activities of Daily Living', icon: 'extension' },
  { id: 'LabValues', title: 'Lab Values', icon: 'science' },
  { id: 'Diagnostics', title: 'Diagnostics', icon: 'biotech' },
  { id: 'IvsAndLines', title: 'IVs and Lines', icon: 'medication' },
  {
    id: 'Medication Administration',
    title: 'Medication Administration',
    icon: 'medical-services',
  },
  {
    id: 'Medical Reconciliation',
    title: 'Medical Reconciliation',
    icon: 'fact-check',
  },
  {
    id: 'Medication Reconciliation',
    title: 'Medication Reconciliation',
    icon: 'fact-check',
  },
];

const RECENT_FEATURES_KEY = '@recent_features';

const DashboardSummary = ({
  onNavigate,
  onPatientSelect,
}: {
  onNavigate: (route: string) => void;
  onPatientSelect: (id: number) => void;
}) => {
  const { isDarkMode, theme, commonStyles } = useAppTheme();
  const { user } = useAuth();
  const styles = createStyles(theme, commonStyles);

  const [modalVisible, setModalVisible] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [recentFeatures, setRecentFeatures] = useState<any[]>([]);

  useEffect(() => {
    fetchLatestPatients();
    loadRecentFeatures();
  }, []);

  const loadRecentFeatures = async () => {
    try {
      const saved = await AsyncStorage.getItem(RECENT_FEATURES_KEY);
      if (saved) {
        const featureIds = JSON.parse(saved);
        const features = featureIds
          .map((id: string) => DASHBOARD_FEATURES.find(f => f.id === id))
          .filter(Boolean);
        setRecentFeatures(features);
      } else {
        // Default recents if none saved
        const defaults = [
          DASHBOARD_FEATURES.find(f => f.id === 'Register'),
          DASHBOARD_FEATURES.find(f => f.id === 'Vital Signs'),
          DASHBOARD_FEATURES.find(f => f.id === 'IvsAndLines'),
        ].filter(Boolean);
        setRecentFeatures(defaults);
      }
    } catch (e) {
      console.error('Failed to load recent features', e);
    }
  };

  const saveRecentFeature = async (featureId: string) => {
    try {
      const saved = await AsyncStorage.getItem(RECENT_FEATURES_KEY);
      let featureIds = saved ? JSON.parse(saved) : [];

      // Remove if already exists to move to front
      featureIds = featureIds.filter((id: string) => id !== featureId);
      // Add to front
      featureIds.unshift(featureId);
      // Keep only top 5
      featureIds = featureIds.slice(0, 5);

      await AsyncStorage.setItem(
        RECENT_FEATURES_KEY,
        JSON.stringify(featureIds),
      );

      // Update local state
      const features = featureIds
        .map((id: string) => DASHBOARD_FEATURES.find(f => f.id === id))
        .filter(Boolean);
      setRecentFeatures(features);
    } catch (e) {
      console.error('Failed to save recent feature', e);
    }
  };

  const handleFeaturePress = (featureId: string) => {
    saveRecentFeature(featureId);
    onNavigate(featureId);
  };

  const fetchLatestPatients = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/patients/');
      if (response.data && Array.isArray(response.data)) {
        const activePatients = response.data.filter(
          (patient: any) =>
            patient.is_active === '1' ||
            patient.is_active === 1 ||
            patient.is_active === true,
        );
        setPatients(activePatients.reverse());
      }
    } catch (error) {
      console.error('Connection Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.first_name || ''} ${
      patient.last_name || ''
    }`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const formatPatientDate = (dateStr: string) => {
    if (!dateStr) return 'January 1, 2026';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        scrollEnabled={searchQuery.length === 0}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.full_name?.split(' ')[0] || 'User'}
            </Text>
            <Text style={styles.dateText}>{formatDate()}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{ marginTop: 10 }}
          >
            <Icon name="keyboard-arrow-down" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.searchBarContainer}>
            <Ionicons
              name="search-outline"
              size={20}
              color={theme.textMuted}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search patients..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={theme.textMuted}
            />
          </View>

          <Text style={styles.sectionTitle}>New Registered Patients</Text>

          {loading ? (
            <ActivityIndicator
              color={theme.primary}
              style={{ marginVertical: 20 }}
            />
          ) : patients && patients.length > 0 ? (
            <View>
              <View
                style={[
                  styles.patientListWrapper,
                  { maxHeight: showAll || searchQuery.length > 0 ? 450 : 180 },
                ]}
              >
                <ScrollView
                  style={styles.patientListScroll}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={false}
                >
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.patientItem,
                          index === filteredPatients.length - 1 && {
                            marginBottom: 40,
                          },
                        ]}
                        onPress={() => {
                          onPatientSelect(item.patient_id || item.id);
                          onNavigate('PatientDetail');
                        }}
                      >
                        <View style={styles.patientLeft}>
                          <Icon
                            name="person"
                            size={20}
                            color={theme.primary}
                            style={styles.patientIcon}
                          />
                          <Text style={styles.patientName}>
                            {item.first_name} {item.last_name}
                          </Text>
                        </View>
                        <Text style={styles.patientDate}>
                          {formatPatientDate(item.admission_date)}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.noResultsText}>
                      No patients found matching "{searchQuery}"
                    </Text>
                  )}
                </ScrollView>

                {/* Fade effect at the bottom */}
                {filteredPatients.length > (showAll ? 7 : 3) && (
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

              {/* Bring back Show More button */}
              {searchQuery.length === 0 && filteredPatients.length > 3 && (
                <TouchableOpacity
                  style={styles.showMoreBtn}
                  onPress={() => setShowAll(!showAll)}
                >
                  <Text style={styles.showMoreText}>
                    {showAll ? 'Show less' : 'Show more'}
                  </Text>
                  <Icon
                    name={showAll ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={20}
                    color={theme.textMuted}
                  />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                There is no existing patient.
              </Text>
              <TouchableOpacity
                style={styles.addPatientBtn}
                onPress={() => handleFeaturePress('Register')}
              >
                <Text style={styles.addPatientText}>ADD PATIENT</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Recents</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentFeatures.map((feature, index) => (
              <TouchableOpacity
                key={feature.id + index}
                style={styles.recentCard}
                onPress={() => handleFeaturePress(feature.id)}
              >
                <Icon name={feature.icon} size={28} color={theme.primary} />
                <Text
                  style={styles.cardText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {feature.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onNavigate('Dashboard')}
        >
          <View style={styles.btnContent}>
            <Image
              source={require('@assets/icons/document.png')}
              style={[styles.btnIcon]}
            />
            <Text style={styles.btnLabel}>Start documenting patient</Text>
          </View>
          <Icon name="arrow-forward-ios" size={15} color={theme.textMuted} />
        </TouchableOpacity>
      </ScrollView>

      <AccountModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onLogout={() => setModalVisible(false)}
      />
    </View>
  );
};

const createStyles = (theme: any, commonStyles: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingHorizontal: 40,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginTop: Platform.OS === 'ios' ? 20 : 40,
      marginBottom: 35,
    },
    greeting: {
      fontSize: 35,
      fontFamily: 'MinionPro-SemiboldItalic',
      color: theme.primary,
    },
    dateText: {
      fontSize: 14,
      color: theme.textMuted,
      marginTop: 4,
      fontFamily: 'AlteHaasGroteskBold',
    },
    section: { marginBottom: 30 },
    sectionTitle: {
      fontSize: 14,
      color: theme.textMuted,
      marginBottom: 15,
      fontFamily: 'AlteHaasGroteskBold',
    },
    searchBarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 125,
      paddingHorizontal: 15,
      height: 60,
      borderWidth: 0,
      borderColor: theme.border,
      marginBottom: 25,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
    },
    searchIcon: { marginRight: 10 },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: theme.text,
      fontFamily: 'AlteHaasGrotesk',
    },
    patientListWrapper: {
      backgroundColor: theme.background,
    },
    patientListScroll: {
      width: '100%',
    },
    patientItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    },
    patientLeft: { flexDirection: 'row', alignItems: 'center' },
    patientIcon: { marginRight: 25 },
    patientName: {
      fontSize: 14,
      color: theme.text,
      fontFamily: 'AlteHaasGrotesk',
    },
    patientDate: {
      fontSize: 13,
      color: theme.textMuted,
      fontFamily: 'AlteHaasGroteskBold',
    },
    fadeBottom: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 40,
    },
    showMoreBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
    },
    showMoreText: {
      color: theme.textMuted,
      fontSize: 13,
      marginRight: 5,
      fontFamily: 'AlteHaasGrotesk',
    },
    noResultsText: {
      textAlign: 'center',
      color: theme.textMuted,
      marginTop: 20,
      fontSize: 14,
      fontFamily: 'AlteHaasGrotesk',
    },
    emptyCard: {
      paddingVertical: 30,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 15,
    },
    emptyText: {
      color: theme.textMuted,
      fontSize: 14,
      marginBottom: 15,
      fontFamily: 'AlteHaasGrotesk',
    },
    addPatientBtn: {
      borderWidth: 1,
      borderColor: theme.primary,
      borderRadius: 20,
      paddingHorizontal: 30,
      paddingVertical: 8,
    },
    addPatientText: {
      color: theme.primary,
      fontSize: 12,
      fontFamily: 'AlteHaasGrotesk',
    },
    recentCard: {
      width: 110,
      height: 110,
      backgroundColor: theme.card2,
      borderRadius: 15,
      borderWidth: 1.5,
      borderColor: theme.cardBorder,
      padding: 15,
      marginRight: 15,
      justifyContent: 'space-between',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 1, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      marginBottom: 10,
    },
    cardText: {
      fontSize: 12,
      color: theme.primary,
      lineHeight: 16,
      fontFamily: 'AlteHaasGroteskBold',
    },
    actionBtn: {
      backgroundColor: theme.surface,
      borderRadius: 15,
      padding: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 100,
    },

    btnContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    btnIcon: {
      width: 30,
      height: 30,
      resizeMode: 'contain',
    },
    btnLabel: {
      marginLeft: 15,
      fontSize: 14,
      color: theme.textMuted,
      fontFamily: 'AlteHaasGroteskBold',
    },
  });

export default DashboardSummary;
