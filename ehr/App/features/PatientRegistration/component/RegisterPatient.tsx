import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/MaterialIcons';
import apiClient from '../../../api/apiClient';

// Constants for Theme
const THEME_GREEN = '#035022';
const BANNER_GREEN = '#E5FFE8';
const REQUIRED_RED = '#FF0000';
const PLACEHOLDER_COLOR = '#999';

// Dropdown Helper Data
const months = [
  { label: 'January', value: '01' },
  { label: 'February', value: '02' },
  { label: 'March', value: '03' },
  { label: 'April', value: '04' },
  { label: 'May', value: '05' },
  { label: 'June', value: '06' },
  { label: 'July', value: '07' },
  { label: 'August', value: '08' },
  { label: 'September', value: '09' },
  { label: 'October', value: '10' },
  { label: 'November', value: '11' },
  { label: 'December', value: '12' },
];

const days = Array.from({ length: 31 }, (_, i) => ({
  label: (i + 1).toString(),
  value: (i + 1).toString().padStart(2, '0'),
}));

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => ({
  label: (currentYear - i).toString(),
  value: (currentYear - i).toString(),
}));

const sexData = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
];

interface Props {
  onBack: () => void;
}

const RegisterPatient: React.FC<Props> = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [birthParts, setBirthParts] = useState({
    month: '',
    day: '',
    year: '',
  });

  const [form, setForm] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    birthdate: '',
    age: '',
    sex: '',
    address: '',
    birth_place: '',
    religion: '',
    ethnicity: '',
    chief_complaints: '',
    room_no: '',
    bed_no: '',
    user_id: 1,
  });

  const [contacts, setContacts] = useState([
    { name: '', relationship: '', number: '' },
  ]);

  useEffect(() => {
    if (birthParts.month && birthParts.day && birthParts.year) {
      const bDate = new Date(
        `${birthParts.year}-${birthParts.month}-${birthParts.day}`,
      );
      const today = new Date();
      let age = today.getFullYear() - bDate.getFullYear();
      const m = today.getMonth() - bDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < bDate.getDate())) age--;
      setForm(prev => ({
        ...prev,
        age: age >= 0 ? age.toString() : '0',
        birthdate: `${birthParts.year}-${birthParts.month}-${birthParts.day}`,
      }));
    }
  }, [birthParts]);

  const updateContact = (index: number, key: string, value: string) => {
    const updated = [...contacts];
    (updated[index] as any)[key] = value;
    setContacts(updated);
  };

  const handleFinalRegister = async () => {
    try {
      const payload = {
        ...form,
        contact_name: contacts[0].name,
        contact_relationship: contacts[0].relationship,
        contact_number: contacts[0].number,
      };
      const response = await apiClient.post('/patients/', payload);
      if (response.status === 200 || response.status === 201) {
        Alert.alert('Success', 'Patient registered successfully!');
        onBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Registration failed. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section - Restructured for Middle Alignment */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Register Patient</Text>
                <Text style={styles.sectionTitle}>
                  {(step === 1
                    ? 'Patient Details'
                    : 'Patient Emergency Contact'
                  ).toUpperCase()}
                </Text>
              </View>

              {step === 2 && (
                <TouchableOpacity
                  onPress={() =>
                    setContacts([
                      ...contacts,
                      { name: '', relationship: '', number: '' },
                    ])
                  }
                  style={styles.addIconCircle}
                >
                  <Icon name="add" size={24} color={THEME_GREEN} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {step === 1 ? (
            /* STEP 1: PATIENT DETAILS */
            <View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter First Name"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  value={form.first_name}
                  onChangeText={v => setForm({ ...form, first_name: v })}
                />
                <TextInput
                  style={[styles.input, { marginTop: 12 }]}
                  placeholder="Enter Middle Name"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  value={form.middle_name}
                  onChangeText={v => setForm({ ...form, middle_name: v })}
                />
                <TextInput
                  style={[styles.input, { marginTop: 12 }]}
                  placeholder="Enter Last Name"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  value={form.last_name}
                  onChangeText={v => setForm({ ...form, last_name: v })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Birthday <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.row}>
                  <Dropdown
                    style={[styles.dropdown, { flex: 2 }]}
                    data={months}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Month"
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    value={birthParts.month}
                    onChange={item =>
                      setBirthParts({ ...birthParts, month: item.value })
                    }
                  />
                  <Dropdown
                    style={[styles.dropdown, { flex: 1, marginHorizontal: 8 }]}
                    data={days}
                    labelField="label"
                    valueField="value"
                    placeholder="Day"
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    value={birthParts.day}
                    onChange={item =>
                      setBirthParts({ ...birthParts, day: item.value })
                    }
                  />
                  <Dropdown
                    style={[styles.dropdown, { flex: 1.5 }]}
                    data={years}
                    labelField="label"
                    valueField="value"
                    placeholder="Year"
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    value={birthParts.year}
                    onChange={item =>
                      setBirthParts({ ...birthParts, year: item.value })
                    }
                  />
                </View>
              </View>

              <View style={[styles.row, styles.inputGroup]}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.inputLabel}>Age</Text>
                  <TextInput
                    style={[styles.input, styles.readOnlyInput]}
                    value={form.age}
                    editable={false}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>
                    Sex <Text style={styles.required}>*</Text>
                  </Text>
                  <Dropdown
                    style={styles.dropdown}
                    data={sexData}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Sex"
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    value={form.sex}
                    onChange={item => setForm({ ...form, sex: item.value })}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Address <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Address"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  value={form.address}
                  onChangeText={v => setForm({ ...form, address: v })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Birth Place <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Birth Place"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  value={form.birth_place}
                  onChangeText={v => setForm({ ...form, birth_place: v })}
                />
              </View>

              <View style={[styles.row, styles.inputGroup]}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.inputLabel}>
                    Religion <Text style={styles.required}>*</Text>
                  </Text>
                  <Dropdown
                    style={styles.dropdown}
                    data={[]}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Religion"
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    value={form.religion}
                    onChange={item =>
                      setForm({ ...form, religion: item.value })
                    }
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Ethnicity</Text>
                  <Dropdown
                    style={styles.dropdown}
                    data={[]}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Ethnicity"
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    value={form.ethnicity}
                    onChange={item =>
                      setForm({ ...form, ethnicity: item.value })
                    }
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Chief of Complaints</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Chief of Complaints"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  value={form.chief_complaints}
                  onChangeText={v => setForm({ ...form, chief_complaints: v })}
                />
              </View>

              <View
                style={[styles.row, styles.inputGroup, { marginBottom: 30 }]}
              >
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.inputLabel}>
                    Room No. <Text style={styles.required}>*</Text>
                  </Text>
                  <Dropdown
                    style={styles.dropdown}
                    data={[]}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Room"
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    value={form.room_no}
                    onChange={item => setForm({ ...form, room_no: item.value })}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>
                    Bed No. <Text style={styles.required}>*</Text>
                  </Text>
                  <Dropdown
                    style={styles.dropdown}
                    data={[]}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Bed"
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    value={form.bed_no}
                    onChange={item => setForm({ ...form, bed_no: item.value })}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={() => setStep(2)}
              >
                <Text style={styles.submitText}>NEXT</Text>
                <Icon name="chevron-right" size={22} color={THEME_GREEN} />
              </TouchableOpacity>
            </View>
          ) : (
            /* STEP 2: EMERGENCY CONTACT */
            <View>
              {contacts.map((contact, index) => (
                <View key={index} style={styles.contactBlock}>
                  {contacts.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() =>
                        setContacts(contacts.filter((_, i) => i !== index))
                      }
                    >
                      <Icon
                        name="remove-circle"
                        size={20}
                        color={REQUIRED_RED}
                      />
                    </TouchableOpacity>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      Name <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter Full Name"
                      placeholderTextColor={PLACEHOLDER_COLOR}
                      value={contact.name}
                      onChangeText={v => updateContact(index, 'name', v)}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      Relationship <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter Relationship"
                      placeholderTextColor={PLACEHOLDER_COLOR}
                      value={contact.relationship}
                      onChangeText={v =>
                        updateContact(index, 'relationship', v)
                      }
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      Contact Number <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter Contact Number"
                      placeholderTextColor={PLACEHOLDER_COLOR}
                      keyboardType="phone-pad"
                      value={contact.number}
                      onChangeText={v => updateContact(index, 'number', v)}
                    />
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleFinalRegister}
              >
                <Text style={styles.submitText}>REGISTER</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backLink}
                onPress={() => setStep(1)}
              >
                <Text style={styles.backLinkText}>Back to Patient Details</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 40 },
  header: {
    marginTop: Platform.OS === 'ios' ? 20 : 40,
    marginBottom: 35,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // This centers the (+) button vertically against Title + Subtitle
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 35,
    color: THEME_GREEN,
    fontFamily: 'MinionPro-SemiboldItalic',
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'AlteHaasGroteskBold',
    color: THEME_GREEN,
    fontWeight: 'bold',
    marginTop: 2,
  },
  addIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: THEME_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  inputGroup: { marginBottom: 20 },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'AlteHaasGroteskBold',
    color: THEME_GREEN,
    marginBottom: 8,
  },
  required: { color: REQUIRED_RED },
  input: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fff',
    fontFamily: 'AlteHaasGrotesk',
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'AlteHaasGrotesk',
  },
  selectedTextStyle: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'AlteHaasGroteskBold',
  },
  readOnlyInput: { backgroundColor: '#F5F5F5', color: '#777' },
  dropdown: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 52,
    backgroundColor: '#fff',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  contactBlock: { marginBottom: 10, position: 'relative' },
  removeBtn: { alignSelf: 'flex-end', marginBottom: 5 },
  submitBtn: {
    backgroundColor: BANNER_GREEN,
    height: 55,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: THEME_GREEN,
    marginTop: 10,
  },
  submitText: {
    color: THEME_GREEN,
    fontFamily: 'AlteHaasGroteskBold',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  backLink: { marginTop: 20 },
  backLinkText: {
    textAlign: 'center',
    color: '#666',
    textDecorationLine: 'underline',
  },
});

export default RegisterPatient;
