// MedAdministration/screen/MedAdministrationScreen.tsx
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MedAdministrationInputCard from '../components/MedAdministrationInputCard';
import { useMedAdministration } from '../hook/useMedAdministration';

const THEME_GREEN = '#035022';
const LIGHT_GREEN_BG = '#DCFCE7';

const MedAdministrationScreen = ({ onBack }: any) => {
  const { step, timeSlots, formData, setFormData, updateCurrentMed, nextStep } =
    useMedAdministration();

  const currentMed = formData.medications[step];

  const handleAction = () => {
    if (step === 2) {
      console.log('Submitting Med Administration Data:', formData);
      // Logic for API submission goes here
    } else {
      nextStep();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Medication {'\n'}Administration</Text>
            <Text style={styles.dateText}>Monday, January 26</Text>
          </View>
          <TouchableOpacity>
            <Icon name="more-vert" size={35} color={THEME_GREEN} />
          </TouchableOpacity>
        </View>

        {/* Patient Selection & Date */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PATIENT NAME :</Text>
          <TextInput
            style={styles.inputField}
            placeholder="Select or type Patient name"
            value={formData.patientName}
            onChangeText={t => setFormData({ ...formData, patientName: t })}
          />
        </View>

        <View style={styles.section}>
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
        />
        <MedAdministrationInputCard
          label="Dose"
          value={currentMed.dose}
          onChangeText={t => updateCurrentMed('dose', t)}
        />
        <MedAdministrationInputCard
          label="Route"
          value={currentMed.route}
          onChangeText={t => updateCurrentMed('route', t)}
        />
        <MedAdministrationInputCard
          label="Frequency"
          value={currentMed.frequency}
          onChangeText={t => updateCurrentMed('frequency', t)}
        />
        <MedAdministrationInputCard
          label="Comments"
          value={currentMed.comments}
          onChangeText={t => updateCurrentMed('comments', t)}
          multiline
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
  section: { marginBottom: 15 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: THEME_GREEN,
    marginBottom: 8,
  },
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
