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
} from 'react-native';
import { usePatients } from '../../DemographicProfile/hook/usePatients';
import DetailItem from '../components/DetailItem';

const { width } = Dimensions.get('window');

interface PatientDetailsScreenProps {
  route: any;
  navigation: any;
}

const PatientDetailsScreen: React.FC<PatientDetailsScreenProps> = ({
  route,
  navigation,
}) => {
  const { patientId } = route.params || { patientId: 1 };
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
      <View style={[styles.circle, styles.topCircle]} />
      <View style={[styles.circle, styles.bottomCircle]} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.titleText}>Patient Details</Text>
            <Text style={styles.admittedDate}>
              Date admitted : {patient?.date_admitted || 'January 12, 2026'}
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
              value={patient?.birthdate}
              halfWidth
            />
            <DetailItem label="Sex" value={patient?.sex} halfWidth />
          </View>

          <DetailItem label="Address" value={patient?.address} />

          <View style={styles.row}>
            <DetailItem
              label="Birth Place"
              value={patient?.birth_place}
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
              value={patient?.chief_complaint}
              halfWidth
            />
          </View>

          <View style={styles.row}>
            <DetailItem
              label="Room Number"
              value={patient?.room_number}
              halfWidth
            />
            <DetailItem
              label="Bed Number"
              value={patient?.bed_number}
              halfWidth
            />
          </View>
        </View>

        {/* Emergency Contact Section */}
        <Text style={styles.sectionTitle}>EMERGENCY CONTACT</Text>

        <View style={styles.gridContainer}>
          <View style={styles.row}>
            <DetailItem
              label="Name"
              value={patient?.emergency_name}
              halfWidth
            />
            <DetailItem
              label="Relationship"
              value={patient?.emergency_relationship}
              halfWidth
            />
          </View>
          <DetailItem
            label="Contact Number"
            value={patient?.emergency_contact}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 50,
  },
  // Decorative Circles Styling
  circle: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    backgroundColor: '#C8F2C8',
    opacity: 0.5,
  },
  topCircle: {
    top: -50,
    right: -80,
  },
  bottomCircle: {
    bottom: -100,
    left: -100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 35,
  },
  backButton: {
    marginRight: 15,
    marginTop: 5,
  },
  backArrow: {
    fontSize: 24,
    color: '#8E8E8E',
  },
  titleText: {
    fontSize: 34,
    color: '#035022',
    fontFamily: 'serif', // Mimicking Minion Pro
    fontStyle: 'italic',
    fontWeight: 'bold',
  },
  admittedDate: {
    fontSize: 14,
    color: '#9B9B9B',
    marginTop: 4,
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
    color: '#9B9B9B',
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
    color: '#9B9B9B',
    marginTop: 15,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
});

export default PatientDetailsScreen;
