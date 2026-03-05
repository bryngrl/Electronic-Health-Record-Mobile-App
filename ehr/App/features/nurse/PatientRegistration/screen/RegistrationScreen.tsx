import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/MaterialIcons';
// Call your new reusable button component
import CustomButton from '@components/button';

interface FormProps {
  updateField: (field: string, value: string) => void;
  onBack: () => void;
}

const genderData = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
];

export default function RegistrationForm({ updateField, onBack }: FormProps) {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [age, setAge] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState([
    {
      id: Date.now().toString(),
      name: '',
      relationship: '',
      contactNumber: '',
    },
  ]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      const calcAge = new Date().getFullYear() - selectedDate.getFullYear();
      setAge(calcAge.toString());
      updateField('birthdate', selectedDate.toLocaleDateString());
      updateField('age', calcAge.toString());
    }
  };

  const addContact = () =>
    setEmergencyContacts([
      ...emergencyContacts,
      {
        id: Date.now().toString(),
        name: '',
        relationship: '',
        contactNumber: '',
      },
    ]);

  const removeContact = (id: string) =>
    emergencyContacts.length > 1 &&
    setEmergencyContacts(emergencyContacts.filter(c => c.id !== id));

  return (
    <View>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.headerText}>PATIENT DETAILS</Text>
        </View>
        <View style={styles.formPadding}>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Juan"
                onChangeText={v => updateField('firstName', v)}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Dela Cruz"
                onChangeText={v => updateField('lastName', v)}
              />
            </View>
          </View>
          <Text style={styles.label}>Middle Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Optional"
            onChangeText={v => updateField('middleName', v)}
          />
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={[styles.input, styles.disabled]}
                value={age}
                editable={false}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Sex</Text>
              <Dropdown
                style={styles.dropdown}
                data={genderData}
                labelField="label"
                valueField="value"
                placeholder="Select"
                onChange={item => updateField('sex', item.value)}
              />
            </View>
          </View>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Street, City, Province"
            onChangeText={v => updateField('address', v)}
          />
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Birth Place</Text>
              <TextInput style={styles.input} placeholder="City" />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Ethnicity</Text>
              <TextInput style={styles.input} placeholder="Ethnicity" />
            </View>
          </View>
          <Text style={styles.label}>Chief of Complaints</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            placeholder="Symptoms..."
          />
        </View>
      </View>

      <View style={styles.card}>
        <View style={[styles.cardHeader, styles.headerRow]}>
          <Text style={styles.headerText}>EMERGENCY CONTACT</Text>
          <TouchableOpacity onPress={addContact}>
            <Icon name="library-add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.formPadding}>
          {emergencyContacts.map((contact, index) => (
            <View key={contact.id} style={index > 0 ? styles.divider : null}>
              {index > 0 && (
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeContact(contact.id)}
                >
                  <Icon name="remove-circle" size={18} color="red" />
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[styles.input, { marginBottom: 10 }]}
                placeholder="Full Name"
              />
              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>Relationship</Text>
                  <TextInput style={styles.input} />
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Contact Number</Text>
                  <TextInput style={styles.input} keyboardType="phone-pad" />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* FIXED 2-COLUMN BUTTON LAYOUT USING CUSTOM COMPONENTS */}
      <View style={styles.buttonRow}>
        <CustomButton title="BACK" onPress={onBack} variant="outlined" />
        <CustomButton
          title="SAVE"
          onPress={() => console.log('Saved')}
          variant="gradient"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 4,
    marginBottom: 15,
    overflow: 'hidden',
  },
  cardHeader: { backgroundColor: '#1A6A24', padding: 12 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  formPadding: { padding: 15 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  col: { width: '48%' },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
    marginTop: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    minHeight: 45,
    backgroundColor: '#EBEBEB',
  },
  disabled: { backgroundColor: '#f5f5f5', color: '#666' },
  textArea: { height: 80, textAlignVertical: 'top' },
  dropdown: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 15,
    paddingTop: 10,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 5,
  },
  removeText: { color: 'red', fontSize: 12, marginLeft: 5 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 50,
  },
});
