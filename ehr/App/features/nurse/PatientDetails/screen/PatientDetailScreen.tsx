import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import { usePatients } from '@nurse/DemographicProfile/hook/usePatients';
import DetailItem from '../components/DetailItem';
import { useAppTheme } from '@App/theme/ThemeContext';

const { width } = Dimensions.get('window');
const backArrow = require('@assets/icons/back_arrow.png');
const editIcon = require('@assets/icons/edit_icon.png');

interface PatientDetailsScreenProps {
  route?: any;
  navigation?: any;
  patientId?: number;
  patientData?: any;
  onBack?: () => void;
  onEdit?: (patientId: number) => void;
}

const PatientDetailsScreen: React.FC<PatientDetailsScreenProps> = ({
  route,
  navigation,
  patientId: propPatientId,
  patientData: propPatientData,
  onBack,
  onEdit,
}) => {
  const { isDarkMode, theme, commonStyles } = useAppTheme();
  const styles = useMemo(
    () => createStyles(theme, commonStyles, isDarkMode),
    [theme, commonStyles, isDarkMode],
  );

  const patientId = propPatientId || route?.params?.patientId || 1;
  const { getPatientById } = usePatients();

  const [patient, setPatient] = useState<any>(propPatientData || null);
  const [isLoading, setIsLoading] = useState(!propPatientData);

  useEffect(() => {
    const fetchDetails = async () => {
      // If we already have full patient data (from Demographic Profile),
      // we don't need to fetch from the API and risk a "No query results" error.
      if (propPatientData && propPatientData.first_name) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getPatientById(patientId);
        if (data) setPatient(data);
      } catch (error) {
        console.error('Error fetching patient details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [patientId, getPatientById, propPatientData]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const parseContactField = (value: unknown) => {
    if (Array.isArray(value)) {
      return value.map(item => String(item ?? '').trim());
    }
    if (typeof value !== 'string') {
      return value ? [String(value).trim()] : [];
    }

    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return [];
    }

    if (trimmedValue.startsWith('[') && trimmedValue.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmedValue);
        if (Array.isArray(parsed)) {
          return parsed.map(item => String(item ?? '').trim());
        }
      } catch (error) {
        console.error('Failed to parse patient contact field:', error);
      }
    }

    return [trimmedValue];
  };

  const emergencyContacts = useMemo(() => {
    const names = parseContactField(patient?.contact_name);
    const relationships = parseContactField(patient?.contact_relationship);
    const numbers = parseContactField(patient?.contact_number);
    const contactCount = Math.max(
      names.length,
      relationships.length,
      numbers.length,
    );

    return Array.from({ length: contactCount }, (_, index) => ({
      name: names[index] || 'N/A',
      relationship: relationships[index] || 'N/A',
      number: numbers[index] || 'N/A',
    }));
  }, [patient]);

  if (isLoading) {
    return (
      <View
        style={[styles.loaderContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
      />
      {/* Decorative Background Circles */}
      <View pointerEvents="none" style={[styles.circle1, styles.topCircle1]} />
      <View pointerEvents="none" style={[styles.circle2, styles.topCircle2]} />
      <View
        pointerEvents="none"
        style={[styles.circle1, styles.bottomCircle1]}
      />
      <View
        pointerEvents="none"
        style={[styles.circle2, styles.bottomCircle2]}
      />

      <ScrollView
        style={styles.scrollViewLayer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => (onBack ? onBack() : navigation?.goBack())}
              style={styles.backButton}
            >
              <Image source={backArrow} style={styles.backIcon} />
            </TouchableOpacity>
            <View>
              <Text style={styles.titleText}>Patient Details</Text>
              <Text style={styles.admittedDate}>
                Date admitted :{' '}
                {formatDate(patient?.admission_date) || 'January 12, 2026'}
              </Text>
            </View>
          </View>
        </View>

        {/* Profile Card Section */}
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>
              {patient?.first_name?.charAt(0) || 'R'}
            </Text>
          </View>
          <View style={styles.nameContainer}>
            <View style={styles.nameEditRow}>
              <Text style={styles.fullName}>
                {patient?.first_name} {patient?.last_name}
              </Text>
              <TouchableOpacity
                onPress={() => onEdit && onEdit(patientId)}
                style={styles.editButton}
              >
                <View style={styles.iconCircleWrapperSmall}>
                  <Image source={editIcon} style={styles.editIconStyle} />
                </View>
              </TouchableOpacity>
            </View>
            <Text style={styles.ageText}>{patient?.age || '67'} years old</Text>
          </View>
        </View>

        {/* Details Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.row}>
            <DetailItem
              label="Birthdate"
              value={formatDate(patient?.birthdate)}
              halfWidth
            />
            <DetailItem label="Sex" value={patient?.sex} halfWidth />
          </View>

          <DetailItem label="Address" value={patient?.address} />

          <View style={styles.row}>
            <DetailItem
              label="Birth Place"
              value={patient?.birthplace}
              halfWidth
            />
            <DetailItem label="Religion" value={patient?.religion} halfWidth />
          </View>

          <View style={styles.row}>
            <DetailItem
              label="Ethnicity"
              value={patient?.ethnicity}
              halfWidth
            />
            <DetailItem
              label="Chief of Complaints"
              value={patient?.chief_complaints}
              halfWidth
            />
          </View>

          <View style={styles.row}>
            <DetailItem
              label="Room Number"
              value={patient?.room_no}
              halfWidth
            />
            <DetailItem label="Bed Number" value={patient?.bed_no} halfWidth />
          </View>
        </View>

        {/* Emergency Contact Section */}
        <Text style={styles.sectionTitle}>EMERGENCY CONTACT</Text>

        {emergencyContacts.length > 0 ? (
          emergencyContacts.map((contact, index) => (
            <View key={`${contact.name}-${contact.number}-${index}`}>
              {emergencyContacts.length > 1 ? (
                <Text style={styles.contactLabel}>Contact {index + 1}:</Text>
              ) : null}
              <View style={styles.gridContainer}>
                <View style={styles.row}>
                  <DetailItem label="Name" value={contact.name} halfWidth />
                  <DetailItem
                    label="Relationship"
                    value={contact.relationship}
                    halfWidth
                  />
                </View>

                <View style={styles.contactSection}>
                  <DetailItem label="Contact Number" value={contact.number} />
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.contactSection}>
            <DetailItem label="Contact Number" value="N/A" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any, commonStyles: any, isDarkMode: boolean) =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollViewLayer: {
      zIndex: 1,
    },
    scrollContent: {
      paddingHorizontal: 40,
      paddingTop: 0,
      paddingBottom: 100,
    },
    circle1: {
      position: 'absolute',
      width: width * 0.7,
      height: width * 0.7,
      borderRadius: (width * 0.7) / 2,
      backgroundColor: isDarkMode
        ? 'rgba(73, 214, 91, 0.2)'
        : 'rgba(73, 214, 91, 1)',
      opacity: 0.5,
      zIndex: 0,
    },
    circle2: {
      position: 'absolute',
      width: width * 0.7,
      height: width * 0.7,
      borderRadius: (width * 0.7) / 2,
      backgroundColor: isDarkMode
        ? 'rgba(200, 255, 207, 0.1)'
        : 'rgba(200, 255, 207, 1)',
      opacity: 0.5,
      zIndex: 0,
    },
    topCircle1: { top: -270, right: -80 },
    topCircle2: { top: -150, right: -200 },
    bottomCircle1: { bottom: -240, left: -180 },
    bottomCircle2: { bottom: -280, left: -50 },
    header: {
      ...commonStyles.header,
      alignItems: 'center',
      zIndex: 10,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    backButton: {
      marginRight: 15,
      marginTop: 10,
      zIndex: 20,
    },
    backIcon: {
      width: 24,
      height: 24,
      resizeMode: 'contain',
      marginTop: 5,
    },
    titleText: commonStyles.title,
    admittedDate: {
      fontSize: 14,
      color: theme.textMuted,
      fontWeight: '600',
    },
    profileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 35,
      zIndex: 10,
    },
    avatar: {
      width: 85,
      height: 85,
      borderRadius: 28,
      backgroundColor: theme.avatarCard,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarLetter: {
      fontSize: 36,
      fontWeight: 'bold',
      color: theme.secondary,
    },
    nameContainer: {
      marginLeft: 20,
      flex: 1,
    },
    nameEditRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    editButton: {
      padding: 5,
      zIndex: 50,
    },
    editIconStyle: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    iconCircleWrapperSmall: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: '#FFD54F',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.card,
      overflow: 'hidden',
    },
    fullName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.secondary,
    },
    ageText: {
      fontSize: 14,
      color: theme.textMuted,
      marginTop: 2,
    },
    gridContainer: {
      marginTop: 5,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    sectionTitle: {
      ...commonStyles.sectionTitle,
      marginTop: 10,
      marginBottom: 20,
      letterSpacing: 0.5,
    },
    contactLabel: {
      ...commonStyles.sectionTitle,
      fontFamily: 'AlteHaasGroteskBold',
      marginTop: 4,
      marginBottom: 5,
    },
  });

export default PatientDetailsScreen;
