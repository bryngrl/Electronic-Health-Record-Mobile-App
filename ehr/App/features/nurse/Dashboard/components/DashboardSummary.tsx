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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { AccountModal } from '@components/AccountModal';
import apiClient from '@api/apiClient';

const THEME_GREEN = '#035022';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const DashboardSummary = ({
  onNavigate,
  onPatientSelect,
}: {
  onNavigate: (route: string) => void;
  onPatientSelect: (id: number) => void;
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchLatestPatients();
  }, []);

  const fetchLatestPatients = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/patients/');
      if (response.data && Array.isArray(response.data)) {
        setPatients(response.data.reverse());
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
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, Jovilyn</Text>
            <Text style={styles.dateText}>{formatDate()}</Text>
          </View>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Icon name="keyboard-arrow-down" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* --- DYNAMIC REGISTERED PATIENTS SECTION --- */}
        <View style={styles.section}>
          {/* Search Bar - Now on top of the title */}
          <View style={styles.searchBarContainer}>
            <Ionicons
              name="search-outline"
              size={20}
              color="#CCC"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search patients..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#CCC"
            />
          </View>

          <Text style={styles.sectionTitle}>New Registered Patients</Text>

          {loading ? (
            <ActivityIndicator
              color={THEME_GREEN}
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
                        style={styles.patientItem}
                        onPress={() => {
                          onPatientSelect(item.patient_id || item.id);
                          onNavigate('PatientDetail');
                        }}
                      >
                        <View style={styles.patientLeft}>
                          <Icon
                            name="person"
                            size={20}
                            color={THEME_GREEN}
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

                {/* Fade effect at the bottom - only shown when content might be hidden */}
                {filteredPatients.length > (showAll ? 7 : 3) && (
                  <LinearGradient
                    colors={[
                      'rgba(255,255,255,0)',
                      'rgba(255,255,255,0.8)',
                      'rgba(255,255,255,1)',
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
                    color="#999"
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
                onPress={() => onNavigate('Register')}
              >
                <Text style={styles.addPatientText}>ADD PATIENT</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Recents</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={styles.recentCard}
              onPress={() => onNavigate('Register')}
            >
              <Icon name="person-add" size={28} color={THEME_GREEN} />
              <Text style={styles.cardText}>Register Patient</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.recentCard}
              onPress={() => onNavigate('Vital Signs')}
            >
              <Icon name="monitor-heart" size={28} color={THEME_GREEN} />
              <Text style={styles.cardText}>Vital Signs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.recentCard}
              onPress={() => onNavigate('IvsAndLines')}
            >
              <Icon name="medication" size={28} color={THEME_GREEN} />
              <Text style={styles.cardText}>IVs and Lines</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onNavigate('Dashboard')}
        >
          <View style={styles.btnContent}>
            <Image
              source={require('@assets/icons/document.png')}
              style={styles.btnIcon}
            />
            <Text style={styles.btnLabel}>Start documenting patient</Text>
          </View>
          <Icon name="arrow-forward-ios" size={20} color="#BDBDBD" />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 25 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 40,
  },
  greeting: {
    fontSize: 35,
    fontFamily: 'MinionPro-SemiboldItalic',
    color: '#035022',
  },
  dateText: {
    fontSize: 14,
    color: '#B2B2B2',
    marginTop: 4,
    fontFamily: 'AlteHaasGroteskBold',
  },
  section: { marginBottom: 30 },
  sectionTitle: {
    fontSize: 14,
    color: '#858583',
    marginBottom: 15,
    fontFamily: 'AlteHaasGroteskBold',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 125,
    paddingHorizontal: 15,
    height: 60,
    borderWidth: 0,
    borderColor: '#EFEFEF',
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
    color: '#292929',
    fontFamily: 'AlteHaasGrotesk',
  },
  patientListWrapper: {
    backgroundColor: '#fff',
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
  patientIcon: { marginRight: 15 },
  patientName: {
    fontSize: 15,
    color: '#333',
    fontFamily: 'AlteHaasGrotesk',
  },
  patientDate: {
    fontSize: 13,
    color: '#999',
    fontFamily: 'AlteHaasGrotesk',
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
    color: '#999',
    fontSize: 13,
    marginRight: 5,
    fontFamily: 'AlteHaasGrotesk',
  },
  noResultsText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontSize: 14,
    fontFamily: 'AlteHaasGrotesk',
  },
  emptyCard: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 15,
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    marginBottom: 15,
    fontFamily: 'AlteHaasGrotesk',
  },
  addPatientBtn: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingVertical: 8,
  },
  addPatientText: {
    color: '#333',
    fontSize: 12,
    fontFamily: 'AlteHaasGrotesk',
  },
  recentCard: {
    width: 110,
    height: 110,
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#D8F3DC',
    padding: 15,
    marginRight: 15,
    justifyContent: 'space-between',
  },
  cardText: {
    fontSize: 13,
    color: THEME_GREEN,
    lineHeight: 16,
    fontFamily: 'AlteHaasGrotesk',
  },
  actionBtn: {
    backgroundColor: '#F2F2F2',
    borderRadius: 15,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  btnContent: { flexDirection: 'row', alignItems: 'center' },
  btnIcon: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
  btnLabel: {
    marginLeft: 15,
    fontSize: 15,
    color: '#999696',
    fontFamily: 'AlteHaasGroteskBold',
  },
});

export default DashboardSummary;
