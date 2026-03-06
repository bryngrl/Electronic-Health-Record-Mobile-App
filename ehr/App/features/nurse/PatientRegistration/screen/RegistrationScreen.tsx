import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomButton from '@components/button';
import { useAppTheme } from '@App/theme/ThemeContext';

interface FormProps {
  updateField: (field: string, value: string) => void;
  onBack: () => void;
}

const genderData = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
];

export default function RegistrationForm({ updateField, onBack }: FormProps) {
  const { isDarkMode, theme, commonStyles } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, commonStyles, isDarkMode), [theme, commonStyles, isDarkMode]);

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
    <ScrollView style={styles.root} contentContainerStyle={styles.scrollContent}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
      />
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
                placeholderTextColor={theme.textMuted}
                onChangeText={v => updateField('firstName', v)}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Dela Cruz"
                placeholderTextColor={theme.textMuted}
                onChangeText={v => updateField('lastName', v)}
              />
            </View>
          </View>
          <Text style={styles.label}>Middle Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Optional"
            placeholderTextColor={theme.textMuted}
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
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                itemTextStyle={styles.itemTextStyle}
                containerStyle={{ backgroundColor: theme.card }}
                activeColor={theme.surface}
                value={null}
                onChange={item => updateField('sex', item.value)}
              />
            </View>
          </View>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Street, City, Province"
            placeholderTextColor={theme.textMuted}
            onChangeText={v => updateField('address', v)}
          />
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Birth Place</Text>
              <TextInput 
                style={styles.input} 
                placeholder="City" 
                placeholderTextColor={theme.textMuted}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Ethnicity</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ethnicity" 
                placeholderTextColor={theme.textMuted}
              />
            </View>
          </View>
          <Text style={styles.label}>Chief of Complaints</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            placeholder="Symptoms..."
            placeholderTextColor={theme.textMuted}
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
                  <Icon name="remove-circle" size={18} color={theme.error} />
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[styles.input, { marginBottom: 10 }]}
                placeholder="Full Name"
                placeholderTextColor={theme.textMuted}
              />
              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>Relationship</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>Contact Number</Text>
                  <TextInput 
                    style={styles.input} 
                    keyboardType="phone-pad" 
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.buttonRow}>
        <CustomButton title="BACK" onPress={onBack} variant="outlined" />
        <CustomButton
          title="SAVE"
          onPress={() => console.log('Saved')}
          variant="gradient"
        />
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: any, commonStyles: any, isDarkMode: boolean) => StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.background },
  scrollContent: { padding: 20 },
  card: {
    backgroundColor: theme.card,
    borderRadius: 10,
    elevation: 4,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardHeader: { backgroundColor: theme.primary, padding: 12 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: { color: theme.white, fontWeight: 'bold', fontSize: 16 },
  formPadding: { padding: 15 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  col: { width: '48%' },
  label: commonStyles.label,
  input: commonStyles.input,
  disabled: { backgroundColor: theme.surface, color: theme.textMuted },
  textArea: { height: 80, textAlignVertical: 'top' },
  dropdown: {
    height: 52,
    borderColor: theme.border,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: theme.inputBg,
  },
  placeholderStyle: {
    fontSize: 14,
    color: theme.textMuted,
  },
  selectedTextStyle: {
    fontSize: 14,
    color: theme.text,
  },
  itemTextStyle: {
    fontSize: 14,
    color: theme.text,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    marginTop: 15,
    paddingTop: 10,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 5,
  },
  removeText: { color: theme.error, fontSize: 12, marginLeft: 5 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 50,
  },
});
