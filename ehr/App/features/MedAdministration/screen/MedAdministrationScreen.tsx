// MedAdministration/screen/MedAdministrationScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MedAdministrationInputCard from '../components/MedAdministrationInputCard';
import { useMedAdministration } from '../hook/useMedAdministration';
import apiClient from '../../../api/apiClient';
import SweetAlert from '../../../components/SweetAlert';

const THEME_GREEN = '#035022';
const LIGHT_GREEN_BG = '#DCFCE7';

const MedAdministrationScreen = ({ onBack }: any) => {
  const {
    step,
    timeSlots,
    formData,
    setFormData,
    updateCurrentMed,
    nextStep,
    saveMedAdministration,
    fetchPatientData,
  } = useMedAdministration();

  const [patients, setPatients] = useState<any[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchText, setSearchText] = useState('');
  const lastFetched = useRef<{ id: number | null, date: string }>({ id: null, date: '' });

  // SweetAlert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'error',
  });

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' = 'error',
  ) => {
    setAlertConfig({ visible: true, title, message, type });
  };

  useEffect(() => {
    apiClient.get('/patients/').then(res => {
      const normalized = (res.data || []).map((p: any) => ({
        id: (p.patient_id ?? p.id).toString(),
        fullName: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
      }));
      setPatients(normalized);
    });
  }, []);

  // Fetch patient data when patient or date changes
  useEffect(() => {
    if (formData.patient_id && (formData.patient_id !== lastFetched.current.id || formData.date !== lastFetched.current.date)) {
      lastFetched.current = { id: formData.patient_id, date: formData.date };
      fetchPatientData(formData.patient_id, formData.date);
    }
  }, [formData.patient_id, formData.date, fetchPatientData]);

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.length > 0) {
      const filtered = patients.filter(p =>
        p.fullName.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredPatients(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
      setFormData({ ...formData, patient_id: null, patientName: '', medications: [
        { id: null, medication: '', dose: '', route: '', frequency: '', comments: '' },
        { id: null, medication: '', dose: '', route: '', frequency: '', comments: '' },
        { id: null, medication: '', dose: '', route: '', frequency: '', comments: '' },
      ] });
    }
  };

  const onSelectPatient = (patient: any) => {
    setSearchText(patient.fullName);
    setFormData(prev => ({
      ...prev,
      patient_id: parseInt(patient.id, 10),
      patientName: patient.fullName,
    }));
    setShowDropdown(false);
  };

  const currentMed = formData.medications[step];

  const handleAction = async () => {
    if (!formData.patient_id) {
      return showAlert(
        'Patient Required',
        'Please select a patient first in the search bar.',
      );
    }

    // Validation: Medication name is required to proceed
    if (!currentMed.medication || currentMed.medication.trim() === '') {
      return showAlert(
        'Input Required',
        'Please enter the medication name before proceeding.',
      );
    }

    if (step === 2) {
      try {
        await saveMedAdministration();
        showAlert(
          'Success',
          'Medication Administration records saved successfully.',
          'success',
        );
        setTimeout(() => {
          onBack();
        }, 1500);
      } catch (error: any) {
        showAlert(
          'Error',
          error.message || 'Failed to save medication administration.',
        );
      }
    } else {
      nextStep();
    }
  };

  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const onDisabledPress = () => {
    showAlert('Patient Required', 'Please select a patient first in the search bar.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Medication {'\n'}Administration</Text>
            <Text style={styles.dateText}>{formatDate()}</Text>
          </View>
          <TouchableOpacity onPress={onBack}>
            <Icon name="more-vert" size={35} color={THEME_GREEN} />
          </TouchableOpacity>
        </View>

        {/* Patient Selection & Date */}
        <View style={[styles.section, showDropdown && { zIndex: 9999 }]}>
          <Text style={styles.sectionLabel}>PATIENT NAME :</Text>
          <View style={styles.searchWrap}>
            <View style={styles.searchBar}>
              <TextInput
                style={styles.searchInput}
                placeholder="Select Patient name"
                placeholderTextColor="#BDBDBD"
                value={searchText}
                onChangeText={handleSearch}
                onFocus={() => {
                  if (patients.length > 0) {
                    setFilteredPatients(
                      searchText.length > 0
                        ? patients.filter(p =>
                            p.fullName
                              .toLowerCase()
                              .includes(searchText.toLowerCase()),
                          )
                        : patients,
                    );
                    setShowDropdown(true);
                  }
                }}
              />
            </View>

            {showDropdown && filteredPatients.length > 0 && (
              <View style={styles.dropdown}>
                {filteredPatients.map((item, index) => (
                  <Pressable
                    key={item.id ? item.id.toString() : `p-${index}`}
                    style={({ pressed }) => [
                      styles.dropdownItem,
                      pressed && { opacity: 0.6 },
                    ]}
                    onPress={() => onSelectPatient(item)}
                  >
                    <Text style={styles.dropdownText}>{item.fullName}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={[styles.section, { zIndex: 1 }]}>
          <Text style={styles.sectionLabel}>DATE :</Text>
          <TextInput
            style={styles.inputField}
            value={formData.date}
            onChangeText={t => setFormData({ ...formData, date: t })}
          />
        </View>

        {/* Time Progress Banner */}
        <View style={styles.timeBanner}>
          <Text style={styles.timeText}>{timeSlots[step]}</Text>
        </View>

        {/* Input Cards */}
        <MedAdministrationInputCard
          label="Medication"
          value={currentMed.medication}
          onChangeText={t => updateCurrentMed('medication', t)}
          editable={!!formData.patient_id}
          onDisabledPress={onDisabledPress}
        />
        <MedAdministrationInputCard
          label="Dose"
          value={currentMed.dose}
          onChangeText={t => updateCurrentMed('dose', t)}
          editable={!!formData.patient_id}
          onDisabledPress={onDisabledPress}
        />
        <MedAdministrationInputCard
          label="Route"
          value={currentMed.route}
          onChangeText={t => updateCurrentMed('route', t)}
          editable={!!formData.patient_id}
          onDisabledPress={onDisabledPress}
        />
        <MedAdministrationInputCard
          label="Frequency"
          value={currentMed.frequency}
          onChangeText={t => updateCurrentMed('frequency', t)}
          editable={!!formData.patient_id}
          onDisabledPress={onDisabledPress}
        />
        <MedAdministrationInputCard
          label="Comments"
          value={currentMed.comments}
          onChangeText={t => updateCurrentMed('comments', t)}
          multiline
          editable={!!formData.patient_id}
          onDisabledPress={onDisabledPress}
        />

        {/* Footer Navigation Button */}
        <TouchableOpacity style={styles.actionBtn} onPress={handleAction}>
          <Text style={styles.actionBtnText}>
            {step === 2 ? 'SUBMIT' : 'NEXT'}
          </Text>
          {step < 2 && (
            <Icon name="chevron-right" size={24} color={THEME_GREEN} />
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation Mockup */}
      <View style={styles.bottomNav}>
        <Icon name="home" size={28} color={THEME_GREEN} />
        <Icon name="search" size={28} color={THEME_GREEN} />
        <View style={styles.addBtnContainer}>
          <Icon name="person-add" size={28} color={THEME_GREEN} />
        </View>
        <Icon name="grid-view" size={28} color={THEME_GREEN} />
        <Icon name="calendar-today" size={28} color={THEME_GREEN} />
      </View>

      <SweetAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={() => setAlertConfig({ ...alertConfig, visible: false })}
        confirmText="OK"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 25 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 35,
    color: '#035022',
    fontFamily: 'MinionPro-SemiboldItalic',
  },
  dateText: { fontSize: 14, color: '#999', marginTop: 5 },
  section: { marginBottom: 15, zIndex: 10 },
  searchWrap: { position: 'relative', zIndex: 999 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME_GREEN,
    marginBottom: 8,
  },
  searchBar: {
    borderRadius: 25,
    paddingHorizontal: 20,
    height: 48,
    borderWidth: 1,
    borderColor: '#F2F2F2',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  searchInput: { fontSize: 14, color: '#333' },
  dropdown: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 56,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 8,
    zIndex: 9999,
    maxHeight: 220,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  dropdownText: { fontSize: 14, color: '#333' },
  inputField: {
    borderRadius: 25,
    paddingHorizontal: 20,
    height: 45,
    borderWidth: 1,
    borderColor: '#F2F2F2',
    fontSize: 14,
  },
  timeBanner: {
    backgroundColor: LIGHT_GREEN_BG,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginVertical: 15,
  },
  timeText: {
    color: THEME_GREEN,
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionBtn: {
    height: 52,
    backgroundColor: LIGHT_GREEN_BG,
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME_GREEN,
    marginTop: 10,
  },
  actionBtnText: {
    color: THEME_GREEN,
    fontWeight: 'bold',
    fontSize: 15,
    marginRight: 5,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 70,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 10,
  },
  addBtnContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    top: -20,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 4,
  },
});

export default MedAdministrationScreen;
