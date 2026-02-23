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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import apiClient from '../../../api/apiClient';
import Button from '../../../components/button';
import SweetAlert from '../../../components/SweetAlert';

interface Props {
  onBack: () => void;
}

const RegisterPatient: React.FC<Props> = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [displayDate, setDisplayDate] = useState('');
  const [calculatedAge, setCalculatedAge] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [indexToDelete, setIndexToDelete] = useState<number | null>(null);

  const [showPicker, setShowPicker] = useState(false);
  const [dateValue, setDateValue] = useState(new Date());

  const [form, setForm] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    birthdate: '',
    age: '',
    sex: '',
    address: '',
    religion: '',
    ethnicity: '',
    chief_complaints: '',
    room_no: '',
    bed_no: '',

    user_id: 1,
  });

  // Initialization as an array fixes the "contacts.map is not a function" error
  const [contacts, setContacts] = useState([
    { name: '', relationship: '', number: '' },
  ]);

  useEffect(() => {
    const today = new Date();
    setDisplayDate(
      today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    );
  }, []);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setDateValue(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];

      const today = new Date();
      let age = today.getFullYear() - selectedDate.getFullYear();
      const m = today.getMonth() - selectedDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < selectedDate.getDate())) {
        age--;
      }

      const finalAge = age >= 0 ? age.toString() : '0';
      setCalculatedAge(finalAge);
      setForm({ ...form, birthdate: formattedDate, age: finalAge });
    }
  };

  const isFormValid = () => {
    const {
      first_name,
      last_name,
      birthdate,
      age,
      sex,
      address,
      religion,
      ethnicity,
      chief_complaints,
      room_no,
      bed_no,
    } = form;
    if (
      !first_name ||
      !last_name ||
      !birthdate ||
      !age ||
      !sex ||
      !address ||
      !religion ||
      !ethnicity ||
      !chief_complaints ||
      !room_no ||
      !bed_no
    ) {
      Alert.alert('Error', 'All fields are required.');
      return false;
    }
    return true;
  };

  const updateContact = (index: number, key: string, value: string) => {
    const updated = [...contacts];
    (updated[index] as any)[key] = value;
    setContacts(updated);
  };

  const handleRegister = async () => {
    if (!isFormValid()) return;
    try {
      const payload = {
        ...form,
        age: parseInt(form.age) || 0,
        admission_date: new Date().toISOString().split('T')[0],
        contact_name: contacts[0].name,
        contact_relationship: contacts[0].relationship,
        contact_number: contacts[0].number,
      };
      // Endpoint call to your backend
      const response = await apiClient.post('/patients/', payload);
      if (response.status === 200 || response.status === 201) {
        Alert.alert('Success', 'Patient record saved successfully.');
        onBack();
      }
    } catch (error) {
      // Catch matches the Network Error in your logs
      Alert.alert('Connection Error', 'Check USB Tethering IP: 192.168.47.251');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <SweetAlert
        visible={alertVisible}
        title="Delete Contact?"
        message="Are you sure you want to delete this contact? All information entered will be deleted."
        onCancel={() => setAlertVisible(false)}
        onConfirm={() => {
          setContacts(contacts.filter((_, i) => i !== indexToDelete));
          setAlertVisible(false);
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Register Patient</Text>

        {step === 1 ? (
          <View>
            <Text style={styles.sectionLabel}>PATIENT & ADMISSION DETAILS</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name *</Text>
              <TextInput
                style={styles.input}
                placeholderTextColor="#EBEBEB"
                placeholder="Enter First Name"
                value={form.first_name}
                onChangeText={v => setForm({ ...form, first_name: v })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Middle Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Middle Name"
                placeholderTextColor="#EBEBEB"
                value={form.middle_name}
                onChangeText={v => setForm({ ...form, middle_name: v })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name *</Text>
              <TextInput
                style={styles.input}
                placeholderTextColor="#EBEBEB"
                placeholder="Enter Last Name"
                value={form.last_name}
                onChangeText={v => setForm({ ...form, last_name: v })}
              />
            </View>

            <View style={styles.row}>
              <View style={{ width: '48%' }}>
                <Text style={styles.inputLabel}>Birthdate *</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowPicker(true)}
                >
                  <Text style={{ color: form.birthdate ? '#333' : '#EBEBEB' }}>
                    {form.birthdate || 'Select Date'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ width: '48%' }}>
                <Text style={styles.inputLabel}>Age*</Text>
                <View style={styles.readOnlyBox}>
                  <Text style={styles.readOnlyText}>
                    {calculatedAge || '--'}
                  </Text>
                </View>
              </View>
            </View>

            {showPicker && (
              <DateTimePicker
                value={dateValue}
                mode="date"
                display="default"
                maximumDate={new Date()}
                onChange={handleDateChange}
              />
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sex *</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[
                    styles.genderBtn,
                    form.sex === 'Male' && styles.genderBtnActive,
                  ]}
                  onPress={() => setForm({ ...form, sex: 'Male' })}
                >
                  <Text
                    style={
                      form.sex === 'Male'
                        ? styles.genderTextActive
                        : styles.genderText
                    }
                  >
                    Male
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.genderBtn,
                    form.sex === 'Female' && styles.genderBtnActive,
                  ]}
                  onPress={() => setForm({ ...form, sex: 'Female' })}
                >
                  <Text
                    style={
                      form.sex === 'Female'
                        ? styles.genderTextActive
                        : styles.genderText
                    }
                  >
                    Female
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address *</Text>
              <TextInput
                style={styles.input}
                placeholderTextColor="#EBEBEB"
                placeholder="Enter address"
                value={form.address}
                onChangeText={v => setForm({ ...form, address: v })}
              />
            </View>

            <View style={styles.row}>
              <View style={{ width: '48%' }}>
                <Text style={styles.inputLabel}>Religion *</Text>
                <TextInput
                  style={styles.input}
                  placeholderTextColor="#EBEBEB"
                  placeholder="Religion"
                  value={form.religion}
                  onChangeText={v => setForm({ ...form, religion: v })}
                />
              </View>
              <View style={{ width: '48%' }}>
                <Text style={styles.inputLabel}>Ethnicity *</Text>
                <TextInput
                  style={styles.input}
                  placeholderTextColor="#EBEBEB"
                  placeholder="Ethnicity"
                  value={form.ethnicity}
                  onChangeText={v => setForm({ ...form, ethnicity: v })}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Chief of Complaints *</Text>
              <TextInput
                style={styles.input}
                placeholderTextColor="#EBEBEB"
                placeholder="Enter symptoms"
                value={form.chief_complaints}
                onChangeText={v => setForm({ ...form, chief_complaints: v })}
              />
            </View>

            <View style={styles.row}>
              <View style={{ width: '48%' }}>
                <Text style={styles.inputLabel}>Room No. *</Text>
                <TextInput
                  style={styles.input}
                  placeholderTextColor="#EBEBEB"
                  placeholder="Room #"
                  value={form.room_no}
                  onChangeText={v => setForm({ ...form, room_no: v })}
                />
              </View>
              <View style={{ width: '48%' }}>
                <Text style={styles.inputLabel}>Bed No. *</Text>
                <TextInput
                  style={styles.input}
                  placeholderTextColor="#EBEBEB"
                  placeholder="Bed #"
                  value={form.bed_no}
                  onChangeText={v => setForm({ ...form, bed_no: v })}
                />
              </View>
            </View>

            <View style={styles.dateDisplayContainer}>
              <Text style={styles.dateDisplayLabel}>Admission Date :</Text>
              <Text style={styles.dateDisplayText}>{displayDate}</Text>
            </View>

            <Button title="NEXT" onPress={() => setStep(2)} />
          </View>
        ) : (
          <View>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionLabel}>PATIENT EMERGENCY CONTACT</Text>
              <TouchableOpacity
                onPress={() =>
                  setContacts([
                    ...contacts,
                    { name: '', relationship: '', number: '' },
                  ])
                }
                style={styles.addIconCircle}
              >
                <Text style={styles.addPlusText}>+</Text>
              </TouchableOpacity>
            </View>

            {contacts.map((contact, index) => (
              <View key={index} style={styles.contactWrapper}>
                <View style={styles.rowBetween}>
                  <Text style={styles.contactHeader}>Contact #{index + 1}</Text>
                  {contacts.length > 1 && (
                    <TouchableOpacity
                      onPress={() => {
                        setIndexToDelete(index);
                        setAlertVisible(true);
                      }}
                      style={styles.removeCircle}
                    >
                      <Text style={styles.removeText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="#EBEBEB"
                    placeholder="Enter Name"
                    value={contact.name}
                    onChangeText={v => updateContact(index, 'name', v)}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Relationship *</Text>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="#EBEBEB"
                    placeholder="Enter Relationship"
                    value={contact.relationship}
                    onChangeText={v => updateContact(index, 'relationship', v)}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Contact Number *</Text>
                  <TextInput
                    style={styles.input}
                    placeholderTextColor="#EBEBEB"
                    placeholder="Enter Number"
                    value={contact.number}
                    keyboardType="phone-pad"
                    onChangeText={v => updateContact(index, 'number', v)}
                  />
                </View>
              </View>
            ))}

            <Button title="REGISTER" onPress={handleRegister} />
            <TouchableOpacity onPress={() => setStep(1)} style={styles.backBtn}>
              <Text style={styles.backBtnText}>Back to Details</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContent: { padding: 25, paddingBottom: 120, backgroundColor: '#fff' },
  headerTitle: {
    fontSize: 35,
    color: '#035022',
    fontFamily: 'MinionPro-SemiboldItalic',
    marginBottom: 5,
    marginTop: 20,
  },
  placeholder: { color: '#EBEBEB', fontSize: 14, marginBottom: 15 },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a521e',
    marginBottom: 20,
  },
  inputGroup: { marginBottom: 15 },
  inputLabel: { fontSize: 13, color: '#1a521e', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
    color: '#333',
    justifyContent: 'center',
    minHeight: 48,
  },
  readOnlyBox: {
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#EBEBEB',
    height: 48,
    justifyContent: 'center',
  },
  readOnlyText: { color: '#1B5E20', fontWeight: 'bold', fontSize: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  genderContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 10,
    height: 45,
    overflow: 'hidden',
  },
  genderBtn: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  genderBtnActive: { backgroundColor: '#E5FFE8' },
  genderText: { color: '#999', fontWeight: 'bold' },
  genderTextActive: { color: '#2d6a4f', fontWeight: 'bold' },
  dateDisplayContainer: { marginTop: 10, marginBottom: 25 },
  dateDisplayLabel: { fontSize: 14, color: '#2d6a4f', marginBottom: 2 },
  dateDisplayText: { fontSize: 16, fontWeight: 'bold', color: '#1b4332' },
  contactWrapper: { marginBottom: 20 },
  contactHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1b4332',
    marginBottom: 10,
  },
  addIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2d6a4f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPlusText: { color: '#2d6a4f', fontSize: 22 },
  removeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff4d4d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: { color: '#ff4d4d', fontSize: 12 },
  backBtn: { marginTop: 20 },
  backBtnText: {
    textAlign: 'center',
    color: '#666',
    textDecorationLine: 'underline',
  },
});

export default RegisterPatient;
