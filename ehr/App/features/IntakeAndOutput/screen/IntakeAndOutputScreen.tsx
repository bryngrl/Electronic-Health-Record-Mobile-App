import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Pressable,
  StatusBar,
  ActivityIndicator,
  Modal,
  FlatList,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IntakeOutputCard from '../component/IntakeOutputCard';
import SweetAlert from '../../../components/SweetAlert';
import { useIntakeAndOutputLogic } from '../hook/useIntakeAndOutputLogic';
import ADPIEScreen from '../../VitalSigns/screen/ADPIEScreen'; // Re-using ADPIE screen structure

const alertIcon = require('../../../../assets/icons/alert.png'); 

interface IntakeAndOutputScreenProps {
  onBack: () => void;
}

const IntakeAndOutputScreen: React.FC<IntakeAndOutputScreenProps> = ({
  onBack,
}) => {
  const {
    searchText,
    patientName,
    selectedPatientId,
    filteredPatients,
    showDropdown,
    setShowDropdown,
    handleSearchPatient,
    selectPatient,
    intakeOutput,
    handleUpdateField,
    isDataEntered,
    saveAssessment,
    currentAlert,
    assessmentAlert,
    setBackendAlert,
    triggerPatientAlert,
    loading,
    recordId,
    ADPIE_STAGES,
  } = useIntakeAndOutputLogic();

  const [alertVisible, setAlertVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isAdpieActive, setIsAdpieActive] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Simplified date formatting that's safer for React Native
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    setCurrentDate(`${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`);
  }, []);

  const handleSubmit = async () => {
    if (!selectedPatientId) {
      triggerPatientAlert();
      setAlertVisible(true);
      return;
    }

    if (!isDataEntered) {
      setBackendAlert({
        title: 'Form Empty',
        message: 'Please enter at least one value.',
        type: 'error',
      });
      setAlertVisible(true);
      return;
    }

    const result = await saveAssessment();
    if (result) {
      setSuccessVisible(true);
    } else {
      setAlertVisible(true);
    }
  };

  const handleCDSSPress = async () => {
    if (!selectedPatientId) {
      triggerPatientAlert();
      setAlertVisible(true);
      return;
    }
    const res = await saveAssessment();
    if (res && res.id) {
      setIsAdpieActive(true);
    } else if (recordId) {
      setIsAdpieActive(true);
    } else {
      setAlertVisible(true);
    }
  };

  const handleAlertPress = async () => {
    if (!selectedPatientId) {
      triggerPatientAlert();
      return setAlertVisible(true);
    }
    if (isDataEntered) {
      await saveAssessment();
    }
    setAlertVisible(true);
  };

  const handleAlertConfirm = () => {
    setAlertVisible(false);
  };

  if (isAdpieActive && recordId) {
    return (
      <ADPIEScreen 
        recordId={recordId}
        patientName={patientName}
        onBack={() => setIsAdpieActive(false)}
        feature="intake-output" // Tell ADPIE screen which API to use
      />
    );
  }

  const hasRealAlert = assessmentAlert && assessmentAlert.trim() !== '';

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text 
              style={styles.title} 
              numberOfLines={1} 
              adjustsFontSizeToFit
            >
              Intake and Output
            </Text>
            <Text style={styles.subDate}>{currentDate}</Text>
          </View>
        </View>

        {/* Patient Name Section */}
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>PATIENT NAME :</Text>
          <TextInput
            style={styles.pillInput}
            placeholder="Select Patient"
            value={searchText}
            onChangeText={handleSearchPatient}
            placeholderTextColor="#999"
          />
          {showDropdown && filteredPatients.length > 0 && (
            <View style={styles.dropdown}>
              {filteredPatients.map(p => (
                <Pressable
                  key={p.id}
                  onPress={() => selectPatient(p)}
                  style={styles.dropItem}
                >
                  <Text>{p.fullName}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Intake and Output Cards */}
        <Pressable
          onPress={() => !selectedPatientId && (triggerPatientAlert(), setAlertVisible(true))}
        >
          <View
            pointerEvents={selectedPatientId ? 'auto' : 'none'}
            style={{ opacity: 1 }}
          >
            <IntakeOutputCard
              label="ORAL INTAKE"
              value={intakeOutput.oral_intake}
              onChangeText={text => handleUpdateField('oral_intake', text)}
            />

            <IntakeOutputCard
              label="IV FLUIDS"
              value={intakeOutput.iv_fluids}
              onChangeText={text => handleUpdateField('iv_fluids', text)}
            />

            <IntakeOutputCard
              label="URINE OUTPUT"
              value={intakeOutput.urine_output}
              onChangeText={text => handleUpdateField('urine_output', text)}
            />
          </View>
        </Pressable>

        {/* Action Buttons */}
        <View style={styles.footerAction}>
            <TouchableOpacity 
              style={[
                styles.alertIcon, 
                { backgroundColor: hasRealAlert ? '#FFECBD' : (isDataEntered && selectedPatientId ? '#E5FFE8' : '#F0F0F0') }
              ]}
              disabled={!isDataEntered || !selectedPatientId}
              onPress={handleAlertPress}
            >
              <Image 
                source={alertIcon} 
                style={[
                  styles.fullImg, 
                  hasRealAlert
                    ? { tintColor: '#EDB62C', opacity: 1 } 
                    : (isDataEntered && selectedPatientId ? { tintColor: '#29A539', opacity: 0.8 } : { tintColor: '#9E9E9E', opacity: 0.5 })
                ]} 
              />
            </TouchableOpacity>

            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={[styles.cdssButton, (!isDataEntered || !selectedPatientId) && styles.disabledButton]} 
                onPress={handleCDSSPress}
                disabled={!isDataEntered || !selectedPatientId}
              >
                <Text style={styles.cdssBtnText}>CDSS</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, (!isDataEntered || !selectedPatientId) && styles.disabledButton]} 
                onPress={handleSubmit}
                disabled={!isDataEntered || !selectedPatientId || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#035022" />
                ) : (
                  <Text style={styles.submitBtnText}>SUBMIT</Text>
                )}
              </TouchableOpacity>
            </View>
        </View>
      </ScrollView>

      {/* Options Menu Modal */}
      <Modal transparent visible={isMenuVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>SELECT STAGE</Text>
            <FlatList 
              data={ADPIE_STAGES}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    if (index > 0) handleCDSSPress();
                    setIsMenuVisible(false);
                  }}
                >
                  <Text style={[styles.menuItemText, index === 0 && styles.activeMenuText]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity 
              style={styles.closeMenuBtn}
              onPress={() => setIsMenuVisible(false)}
            >
              <Text style={styles.closeMenuText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Alert Component */}
      <SweetAlert
        visible={alertVisible}
        title={!selectedPatientId ? 'Patient Required' : (hasRealAlert ? 'CDSS ASSESSMENT' : (currentAlert?.title || 'ALERT'))}
        message={!selectedPatientId ? 'Please select a patient first in the search bar.' : (hasRealAlert ? assessmentAlert : (currentAlert?.message || 'Please fill out the form.'))}
        type={!selectedPatientId ? 'error' : (hasRealAlert ? 'warning' : (currentAlert?.type || 'success'))}
        onConfirm={handleAlertConfirm}
      />

      {/* Success Alert */}
      <SweetAlert
        visible={successVisible}
        title="SUCCESS"
        message="Intake and Output record saved successfully!"
        type="success"
        onConfirm={() => {
          setSuccessVisible(false);
          onBack();
        }}
      />

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
          <Text style={styles.navIcon}>🏠</Text><Text style={styles.navIcon}>🔍</Text>
          <View style={styles.fab}><Text style={styles.plusSign}>+</Text></View>
          <Text style={styles.navIcon}>📊</Text><Text style={styles.navIcon}>📅</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingHorizontal: 25, paddingBottom: 130 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40, marginBottom: 25 },
  title: { 
    fontSize: 35, 
    color: '#035022', 
    fontFamily: 'MinionPro-SemiboldItalic',
    lineHeight: 38
  },
  subDate: { color: '#999', fontSize: 13 },
  inputGroup: { marginBottom: 20, zIndex: 100 },
  fieldLabel: { color: '#29A539', fontWeight: 'bold', fontSize: 13, marginBottom: 5 },
  pillInput: { borderWidth: 1, borderColor: '#F0F0F0', borderRadius: 25, height: 45, paddingHorizontal: 20, fontSize: 14, color: '#333' },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 3,
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    zIndex: 99,
  },
  dropItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  footerAction: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  alertIcon: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0' },
  fullImg: { width: '80%', height: '80%', resizeMode: 'contain' },
  buttonGroup: { flex: 1, flexDirection: 'row', marginLeft: 15 },
  cdssButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#DCFCE7',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#035022',
    marginRight: 5,
  },
  cdssBtnText: { color: '#035022', fontWeight: 'bold', fontSize: 14 },
  submitButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#DCFCE7',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#035022',
    marginLeft: 5,
  },
  submitBtnText: { color: '#035022', fontWeight: 'bold', fontSize: 14 },
  disabledButton: { backgroundColor: '#F0F0F0', borderColor: '#E0E0E0', opacity: 0.6 },
  
  // Menu Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  menuContainer: { width: '85%', backgroundColor: '#FFF', borderRadius: 25, padding: 25, maxHeight: '80%' },
  menuTitle: { fontSize: 18, fontWeight: 'bold', color: '#035022', marginBottom: 20, textAlign: 'center' },
  menuItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  menuItemText: { fontSize: 16, color: '#333', textAlign: 'center' },
  activeMenuText: { color: '#29A539', fontWeight: 'bold' },
  closeMenuBtn: { marginTop: 20, backgroundColor: '#E5FFE8', paddingVertical: 12, borderRadius: 20, alignItems: 'center' },
  closeMenuText: { color: '#035022', fontWeight: 'bold' },
  
  bottomNav: { position: 'absolute', bottom: 0, width: '100%', left: 0, right: 0, height: 70, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  navIcon: { fontSize: 22, color: '#035022' },
  fab: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF', elevation: 5, marginTop: -35, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
  plusSign: { fontSize: 24, color: '#29A539', fontWeight: 'bold' },
});

export default IntakeAndOutputScreen;
