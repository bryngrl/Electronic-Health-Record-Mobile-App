import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  ActivityIndicator,
  BackHandler,
  Image,
} from 'react-native';

const backArrow = require('../../../../assets/icons/back_arrow.png');
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useEditPatient } from '../hook/useEditPatient';
import SweetAlert from '../../../components/SweetAlert';

const THEME_GREEN = '#035022';
const BANNER_GREEN = '#E5FFE8';
const REQUIRED_RED = '#FF0000';
const PLACEHOLDER_COLOR = '#999';

// Dropdown Data
const religionData = [
  { label: 'Roman Catholic', value: 'Roman Catholic' },
  { label: 'Islam', value: 'Islam' },
  { label: 'Born Again', value: 'Born Again' },
  { label: 'Iglesia ni Cristo', value: 'Iglesia ni Cristo' },
  { label: 'Other', value: 'Other' },
];
const ethnicityData = [
  { label: 'Tagalog', value: 'Tagalog' },
  { label: 'Cebuano', value: 'Cebuano' },
  { label: 'Other', value: 'Other' },
];
const roomData = [
  { label: 'Room 101', value: '101' },
  { label: 'Room 102', value: '102' },
  { label: 'Room 103', value: '103' },
];
const bedData = [
  { label: 'Bed A', value: 'A' },
  { label: 'Bed B', value: 'B' },
  { label: 'Bed C', value: 'C' },
];

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
const years = Array.from({ length: 100 }, (_, i) => ({
  label: (new Date().getFullYear() - i).toString(),
  value: (new Date().getFullYear() - i).toString(),
}));
const sexData = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
];

interface Props {
  patientId: number;
  onBack: () => void;
}

const EditPatientScreen: React.FC<Props> = ({ patientId, onBack }) => {
  const {
    step,
    setStep,
    form,
    setForm,
    contacts,
    setContacts,
    contactErrors,
    isLoading,
    loadPatientData,
    formatNameOnBlur,
    handleNumberChange,
    validateNumberOnBlur,
    updatePatient,
    capitalize,
  } = useEditPatient(patientId);

  const [birthParts, setBirthParts] = useState({
    month: '',
    day: '',
    year: '',
  });

  // SweetAlert state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info' | 'delete';
    onConfirm?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  // Refs for Keyboard Navigation
  const middleNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const birthplaceRef = useRef<TextInput>(null);
  const contactRelRef = useRef<TextInput>(null);
  const contactNumRef = useRef<TextInput>(null);

  useEffect(() => {
    loadPatientData();
  }, [loadPatientData]);

  useEffect(() => {
    if (form.birthdate) {
      const parts = form.birthdate.split('-');
      if (parts.length === 3) {
        setBirthParts({
          year: parts[0],
          month: parts[1],
          day: parts[2],
        });
      }
    }
  }, [form.birthdate]);

  useEffect(() => {
    if (birthParts.month && birthParts.day && birthParts.year) {
      const bDate = new Date(
        `${birthParts.year}-${birthParts.month}-${birthParts.day}`,
      );
      const today = new Date();
      let age = today.getFullYear() - bDate.getFullYear();
      if (
        today.getMonth() < bDate.getMonth() ||
        (today.getMonth() === bDate.getMonth() &&
          today.getDate() < bDate.getDate())
      )
        age--;
      setForm(prev => ({
        ...prev,
        age: age >= 0 ? age.toString() : '0',
        birthdate: `${birthParts.year}-${birthParts.month}-${birthParts.day}`,
      }));
    }
  }, [birthParts, setForm]);

  const formatContactNameOnBlur = (index: number) => {
    const updated = [...contacts];
    updated[index].name = capitalize(updated[index].name);
    setContacts(updated);
  };

  const handleUpdate = async () => {
    try {
      const response = await updatePatient();
      if (response.status === 200 || response.status === 201) {
        setAlertConfig({
          visible: true,
          title: 'Success',
          message: 'Patient details updated successfully!',
          type: 'success',
          onConfirm: () => {
            setAlertConfig(prev => ({ ...prev, visible: false }));
            onBack();
          },
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail 
        ? (Array.isArray(error.response.data.detail) 
            ? error.response.data.detail.map((d: any) => `${d.loc.join('.')}: ${d.msg}`).join('\n') 
            : JSON.stringify(error.response.data.detail))
        : (error.message || 'Update failed.');
      
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: errorMessage,
        type: 'error',
        onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
      });
    }
  };

  const handleBackPress = useCallback(() => {
    if (step === 2) {
      setStep(1);
      return true;
    }
    onBack();
    return true;
  }, [step, onBack, setStep]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    return () => backHandler.remove();
  }, [handleBackPress]);

  if (isLoading && step === 1 && !form.first_name) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={THEME_GREEN} />
      </View>
    );
  }

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
          {/* SweetAlert Component */}
          <SweetAlert
            visible={alertConfig.visible}
            title={alertConfig.title}
            message={alertConfig.message}
            type={alertConfig.type}
            onConfirm={alertConfig.onConfirm}
            confirmText="OK"
          />

          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Edit Patient</Text>
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
                  onBlur={() => formatNameOnBlur('first_name')}
                  returnKeyType="next"
                  onSubmitEditing={() => middleNameRef.current?.focus()}
                />
                <TextInput
                  ref={middleNameRef}
                  style={[styles.input, { marginTop: 12 }]}
                  placeholder="Enter Middle Name"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  value={form.middle_name}
                  onChangeText={v => setForm({ ...form, middle_name: v })}
                  onBlur={() => formatNameOnBlur('middle_name')}
                  returnKeyType="next"
                  onSubmitEditing={() => lastNameRef.current?.focus()}
                />
                <TextInput
                  ref={lastNameRef}
                  style={[styles.input, { marginTop: 12 }]}
                  placeholder="Enter Last Name"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  value={form.last_name}
                  onChangeText={v => setForm({ ...form, last_name: v })}
                  onBlur={() => formatNameOnBlur('last_name')}
                  returnKeyType="done"
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
                    itemTextStyle={styles.itemTextStyle}
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
                    itemTextStyle={styles.itemTextStyle}
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
                    itemTextStyle={styles.itemTextStyle}
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
                    placeholder="Select"
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    itemTextStyle={styles.itemTextStyle}
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
                  returnKeyType="next"
                  onSubmitEditing={() => birthplaceRef.current?.focus()}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Birth Place <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  ref={birthplaceRef}
                  style={styles.input}
                  placeholder="Enter Birth Place"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  value={form.birthplace}
                  onChangeText={v => setForm({ ...form, birthplace: v })}
                  returnKeyType="done"
                />
              </View>

              <View style={[styles.row, styles.inputGroup]}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.inputLabel}>
                    Religion <Text style={styles.required}>*</Text>
                  </Text>
                  <Dropdown
                    style={styles.dropdown}
                    data={religionData}
                    labelField="label"
                    valueField="value"
                    placeholder="Select"
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    itemTextStyle={styles.itemTextStyle}
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
                    data={ethnicityData}
                    labelField="label"
                    valueField="value"
                    placeholder="Select"
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    itemTextStyle={styles.itemTextStyle}
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
                    data={roomData}
                    labelField="label"
                    valueField="value"
                    placeholder="Select"
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    itemTextStyle={styles.itemTextStyle}
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
                    data={bedData}
                    labelField="label"
                    valueField="value"
                    placeholder="Select"
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    itemTextStyle={styles.itemTextStyle}
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
              
              <TouchableOpacity
                style={styles.backLink}
                onPress={onBack}
              >
                <Text style={styles.backLinkText}>Cancel Edit</Text>
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
                      onChangeText={v => {
                        const updated = [...contacts];
                        updated[index].name = v;
                        setContacts(updated);
                      }}
                      onBlur={() => formatContactNameOnBlur(index)}
                      returnKeyType="next"
                      onSubmitEditing={() => contactRelRef.current?.focus()}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      Relationship <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      ref={contactRelRef}
                      style={styles.input}
                      placeholder="Enter Relationship"
                      placeholderTextColor={PLACEHOLDER_COLOR}
                      value={contact.relationship}
                      onChangeText={v => {
                        const updated = [...contacts];
                        updated[index].relationship = v;
                        setContacts(updated);
                      }}
                      returnKeyType="next"
                      onSubmitEditing={() => contactNumRef.current?.focus()}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      Contact Number <Text style={styles.required}>*</Text>
                    </Text>
                    <View
                      style={[
                        styles.phoneInputRow,
                        contactErrors[index] ? styles.inputError : null,
                      ]}
                    >
                      <View style={styles.prefixContainer}>
                        <Text style={styles.prefixText}>+63</Text>
                      </View>
                      <TextInput
                        ref={contactNumRef}
                        style={styles.flexInput}
                        placeholder="9193420569"
                        placeholderTextColor={PLACEHOLDER_COLOR}
                        keyboardType="number-pad"
                        maxLength={11}
                        value={contact.number}
                        onChangeText={v => handleNumberChange(index, v)}
                        onBlur={() => validateNumberOnBlur(index)}
                        returnKeyType="done"
                      />
                    </View>
                    {contactErrors[index] ? (
                      <Text style={styles.errorText}>
                        {contactErrors[index]}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleUpdate}
              >
                <Text style={styles.submitText}>SAVE CHANGES</Text>
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
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 40 },
  header: { marginTop: Platform.OS === 'ios' ? 20 : 40, marginBottom: 35 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 15,
  },
  backIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  titleContainer: { flex: 1 },
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
  phoneInputRow: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  prefixContainer: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRightWidth: 1.5,
    borderRightColor: '#E0E0E0',
  },
  prefixText: {
    color: THEME_GREEN,
    fontFamily: 'AlteHaasGroteskBold',
    fontSize: 14,
  },
  flexInput: {
    flex: 1,
    padding: 14,
    fontSize: 14,
    color: '#333',
    fontFamily: 'AlteHaasGrotesk',
  },
  inputError: { borderColor: REQUIRED_RED },
  errorText: {
    color: REQUIRED_RED,
    fontSize: 12,
    marginTop: 5,
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
  itemTextStyle: {
    fontSize: 14,
    color: '#555555',
    fontFamily: 'AlteHaasGrotesk',
  },
  readOnlyInput: {
    backgroundColor: '#F5F5F5',
    color: '#555',
    fontFamily: 'AlteHaasGroteskBold',
  },
  dropdown: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 52,
    backgroundColor: '#fff',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  contactBlock: { marginBottom: 10 },
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

export default EditPatientScreen;
