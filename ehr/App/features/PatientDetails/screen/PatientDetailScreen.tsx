import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { usePatients } from '../../DemographicProfile/hook/usePatients';
import DetailItem from '../components/DetailItem';

const { width } = Dimensions.get('window');
const backArrow = require('../../../../assets/icons/back_arrow.png');

interface PatientDetailsScreenProps {
  route?: any;
  navigation?: any;
  patientId?: number;
  onBack?: () => void;
}

const PatientDetailsScreen: React.FC<PatientDetailsScreenProps> = ({
  route,
  navigation,
  patientId: propPatientId,
  onBack,
}) => {
  const patientId = propPatientId || route?.params?.patientId || 1;
  const { getPatientById } = usePatients();

  const [patient, setPatient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        const data = await getPatientById(patientId);
        setPatient(data);
      } catch (error) {
        console.error('Error fetching patient:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [patientId, getPatientById]);

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

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#035022" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      {/* Decorative Background Circles from Image */}
      <View style={[styles.circle1, styles.topCircle1]} />
      <View style={[styles.circle2, styles.topCircle2]} />
      <View style={[styles.circle1, styles.bottomCircle1]} />
      <View style={[styles.circle2, styles.bottomCircle2]} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => (onBack ? onBack() : navigation?.goBack())}
            style={styles.backButton}
          >
            <Image source={backArrow} style={styles.backIcon} />
          </TouchableOpacity>
          <View>
            <Text style={styles.titleText}>Patient Details</Text>
            <Text style={styles.admittedDate}>
              Date admitted : {formatDate(patient?.admission_date) || 'January 12, 2026'}
            </Text>
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
            <Text style={styles.fullName}>
              {patient?.first_name} {patient?.last_name}
            </Text>
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

        <View style={styles.gridContainer}>
          <View style={styles.row}>
            <DetailItem label="Name" value={patient?.contact_name} halfWidth />
            <DetailItem
              label="Relationship"
              value={patient?.contact_relationship}
              halfWidth
            />
          </View>
          <DetailItem label="Contact Number" value={patient?.contact_number} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    marginTop: 40,
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 40,
    paddingTop: 0,
    paddingBottom: 50,
  },
  // Decorative Circles Styling
  circle1: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    backgroundColor: 'rgba(73, 214, 91, 1)',

    opacity: 0.5,
  },
  circle2: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    backgroundColor: 'rgba(200, 255, 207, 1)',
    opacity: 0.5,
  },
  topCircle1: {
    top: -270,
    right: -80,
  },
  topCircle2: {
    top: -150,
    right: -200,
    zIndex: 100,
  },
  bottomCircle1: {
    bottom: -170,
    left: -180,
  },
  bottomCircle2: {
    bottom: -220,
    left: -50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 20,
    marginBottom: 40,
  },
  backButton: {
    marginRight: 15,
    marginTop: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginTop: 5,
  },
  titleText: {
    fontSize: 35,
    color: '#035022',
    fontFamily: 'MinionPro-SemiboldItalic',
  },
  admittedDate: {
    fontSize: 14,
    color: '#9B9B9B',
    fontWeight: '600',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 35,
  },
  avatar: {
    width: 85,
    height: 85,
    borderRadius: 28,
    backgroundColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#9B9B9B',
  },
  nameContainer: {
    marginLeft: 20,
  },
  fullName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#035022',
  },
  ageText: {
    fontSize: 14,
    color: '#9B9B9B',
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
    fontSize: 16,
    fontWeight: '800',
    color: '#29A539',
    marginTop: 15,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
});

export default PatientDetailsScreen;
