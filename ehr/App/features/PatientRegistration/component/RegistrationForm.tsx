import React, { useState } from 'react';
import { 
  StyleSheet, View, Text, TextInput, 
  TouchableOpacity, ScrollView 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker'; 
import { Dropdown } from 'react-native-element-dropdown'; 
import Icon from 'react-native-vector-icons/MaterialIcons'; 

interface FormProps {
  updateField: (field: string, value: string) => void;
  onBack: () => void;
}

const genderData = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
];

// Export as default to match your Screen's import
export default function RegistrationForm({ updateField, onBack }: FormProps) {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedSex, setSelectedSex] = useState(null);
  const [age, setAge] = useState('');

  // --- EMERGENCY CONTACT STATE MANAGEMENT ---
  const [emergencyContacts, setEmergencyContacts] = useState([
    { id: Date.now().toString(), name: '', relationship: '', contactNumber: '' }
  ]);

  const addContact = () => {
    setEmergencyContacts([...emergencyContacts, { 
      id: Date.now().toString(), name: '', relationship: '', contactNumber: '' 
    }]);
  };

  const removeContact = (id: string) => {
    if (emergencyContacts.length > 1) {
      setEmergencyContacts(emergencyContacts.filter(c => c.id !== id));
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      const today = new Date();
      let calcAge = today.getFullYear() - selectedDate.getFullYear();
      setAge(calcAge.toString());
      updateField('birthdate', selectedDate.toLocaleDateString());
      updateField('age', calcAge.toString());
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* --- PATIENT DETAILS CARD --- */}
      <View style={styles.card}>
        <View style={styles.cardHeader}><Text style={styles.headerText}>PATIENT DETAILS</Text></View>
        <View style={styles.formPadding}>
          <View style={styles.row}>
            <View style={styles.col}><Text style={styles.label}>First Name *</Text>
              <TextInput style={styles.input} placeholder="Juan" onChangeText={(v) => updateField('firstName', v)} />
            </View>
            <View style={styles.col}><Text style={styles.label}>Last Name *</Text>
              <TextInput style={styles.input} placeholder="Dela Cruz" onChangeText={(v) => updateField('lastName', v)} />
            </View>
          </View>

          <Text style={styles.label}>Middle Name</Text>
          <TextInput style={styles.input} placeholder="Optional" onChangeText={(v) => updateField('middleName', v)} />

          <View style={styles.row}>
            <View style={styles.col}><Text style={styles.label}>Age</Text>
              <TextInput style={[styles.input, styles.disabled]} value={age} editable={false} />
            </View>
            <View style={styles.col}><Text style={styles.label}>Sex</Text>
              <Dropdown style={styles.dropdown} data={genderData} labelField="label" valueField="value" value={selectedSex} onChange={item => setSelectedSex(item.value)} />
            </View>
          </View>

          <Text style={styles.label}>Birthdate *</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
            <Text>{date.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} />}

          <Text style={styles.label}>Address</Text>
          <TextInput style={styles.input} placeholder="Street, City, Province" onChangeText={(v) => updateField('address', v)} />

          <View style={styles.row}>
            <View style={styles.col}><Text style={styles.label}>Birth Place</Text>
              <TextInput style={styles.input} placeholder="City" onChangeText={(v) => updateField('birthPlace', v)} />
            </View>
            <View style={styles.col}><Text style={styles.label}>Ethnicity</Text>
              <TextInput style={styles.input} placeholder="Ethnicity" onChangeText={(v) => updateField('ethnicity', v)} />
            </View>
          </View>

          <Text style={styles.label}>Chief of Complaints</Text>
          <TextInput style={[styles.input, styles.textArea]} multiline placeholder="Primary symptoms..." onChangeText={(v) => updateField('chiefComplaints', v)} />

          <View style={styles.row}>
            <View style={styles.col}><Text style={styles.label}>Room No.</Text>
              <TextInput style={styles.input} placeholder="Room #" onChangeText={(v) => updateField('roomNo', v)} />
            </View>
            <View style={styles.col}><Text style={styles.label}>Bed No.</Text>
              <TextInput style={styles.input} placeholder="Bed #" onChangeText={(v) => updateField('bedNo', v)} />
            </View>
          </View>

          <Text style={styles.label}>Admission Date</Text>
          <TextInput style={[styles.input, styles.disabled]} value={new Date().toLocaleDateString()} editable={false} />
        </View>
      </View>

      {/* --- EMERGENCY CONTACT CARD --- */}
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
                <TouchableOpacity onPress={() => removeContact(contact.id)} style={styles.removeBtn}>
                  <Icon name="remove-circle" size={18} color="red" /><Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              )}
              {/* Full Name in 1 Column layout */}
              <Text style={styles.label}>Full Name</Text>
              <TextInput style={[styles.input, { marginBottom: 10 }]} placeholder="Full Name" />

              {/* Relationship & Number in 2 Column layout */}
              <View style={styles.row}>
                <View style={styles.col}><Text style={styles.label}>Relationship</Text>
                  <TextInput style={styles.input} placeholder="e.g. Parent" />
                </View>
                <View style={styles.col}><Text style={styles.label}>Contact Number</Text>
                  <TextInput style={styles.input} placeholder="09XX..." keyboardType="phone-pad" />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.buttonRow}>
       <TouchableOpacity 
  style={[styles.actionBtn, styles.backBtn]} 
  onPress={onBack} // Triggers the setActiveTab("Home") in the parent
>
  <Text style={styles.backBtnText}>BACK</Text>
</TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]}>
          <Text style={styles.saveBtnText}>SAVE</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f8f9fa' },
  card: { backgroundColor: '#fff', borderRadius: 10, elevation: 4, marginBottom: 15, overflow: 'hidden' },
  cardHeader: { backgroundColor: '#004d26', padding: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  formPadding: { padding: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  col: { width: '48%' },
  label: { fontSize: 13, fontWeight: '700', color: '#333', marginBottom: 5, marginTop: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 14, minHeight: 45, justifyContent: 'center', backgroundColor: '#fff' },
  disabled: { backgroundColor: '#f5f5f5', color: '#666' },
  textArea: { height: 80, textAlignVertical: 'top' },
  dropdown: { height: 45, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, backgroundColor: '#fff' },
  divider: { borderTopWidth: 1, borderTopColor: '#eee', marginTop: 15, paddingTop: 10 },
  removeBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginBottom: 5 },
  removeText: { color: 'red', fontSize: 12, marginLeft: 5 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 50 },
  actionBtn: { width: '48%', padding: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  saveBtn: { backgroundColor: '#004d26' },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  backBtn: { backgroundColor: '#e0e0e0', borderWidth: 1, borderColor: '#ccc' },
  backBtnText: { color: '#333', fontWeight: 'bold', fontSize: 16 }
});