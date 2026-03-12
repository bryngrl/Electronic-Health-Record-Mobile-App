import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRegistration } from '../hook/useRegistration';
import SweetAlert from '@components/SweetAlert';
import { useAppTheme } from '@App/theme/ThemeContext';
import { LAYOUT } from '@App/theme/theme';

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
  { label: 'Bisaya', value: 'Bisaya' },
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
  onBack: () => void;
}

const RegisterPatient: React.FC<Props> = ({ onBack }) => {
  const { isDarkMode, theme, commonStyles } = useAppTheme();
  const styles = useMemo(
    () => createStyles(theme, commonStyles),
    [theme, commonStyles],
  );

  const {
    step,
    setStep,
    form,
    setForm,
    formErrors,
    setFormErrors,
    contacts,
    setContacts,
    contactErrors,
    formatNameOnBlur,
    handleNumberChange,
    validateNumberOnBlur,
    validateStep1,
    validateStep2,
    registerPatient,
    capitalize,
  } = useRegistration();

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

  const formatContactNameOnBlur = (index: number) => {
    const updated = [...contacts];
    updated[index].name = capitalize(updated[index].name);
    setContacts(updated);
  };

  useEffect(() => {
    const backAction = () => {
      onBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [onBack]);

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

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleFinalRegister = async () => {
    if (!validateStep2()) {
      return;
    }
    try {
      const response = await registerPatient();
      if (response.status === 200 || response.status === 201) {
        setAlertConfig({
          visible: true,
          title: 'Success',
          message:
            response.data?.message || 'Patient registered successfully!',
          type: 'success',
          onConfirm: () => {
            setAlertConfig(prev => ({ ...prev, visible: false }));
            onBack();
          },
        });
      }
    } catch (error: any) {
      const detail = error.response?.data;
      const validationErrors = detail?.errors
        ? Object.entries(detail.errors)
            .map(([field, messages]) => {
              const messageText = Array.isArray(messages)
                ? messages.join(', ')
                : String(messages);
              return `${field}: ${messageText}`;
            })
            .join('\n')
        : null;
      const errorMessage =
        validationErrors ||
        detail?.message ||
        (detail?.detail
          ? Array.isArray(detail.detail)
            ? detail.detail
                .map((d: any) =>
                  Array.isArray(d.loc) ? `${d.loc.join('.')}: ${d.msg}` : d.msg,
                )
                .join('\n')
            : String(detail.detail)
          : null) ||
        error.message ||
        'Registration failed.';

      setAlertConfig({
        visible: true,
        title: 'Error',
        message: errorMessage,
        type: 'error',
        onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
      });
    }
  };

  const fadeColors = isDarkMode
    ? ['rgba(18, 18, 18, 0)', 'rgba(18, 18, 18, 0.8)', 'rgba(18, 18, 18, 1)']
    : [
        'rgba(255, 255, 255, 0)',
        'rgba(255, 255, 255, 0.8)',
        'rgba(255, 255, 255, 1)',
      ];

  const headerFadeColors = isDarkMode
    ? ['rgba(18, 18, 18, 1)', 'rgba(18, 18, 18, 0)']
    : ['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0)'];

  return (
    <View style={styles.mainContainer}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
      />
      <SweetAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={alertConfig.onConfirm}
        confirmText="OK"
      />

      <View style={{ zIndex: 10 }}>
        <View
          style={{
            paddingHorizontal: 40,
            backgroundColor: theme.background,
            paddingBottom: 15,
          }}
        >
          <View style={[styles.header, { marginBottom: 0 }]}>
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
                  onPress={() => {
                    setContacts([
                      { name: '', relationship: '', number: '' },
                      ...contacts,
                    ]);
                    setContactErrors(['', ...contactErrors]);
                  }}
                  style={styles.addIconCircle}
                >
                  <Icon name="add" size={24} color={theme.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        <LinearGradient
          colors={headerFadeColors}
          style={{ height: 20 }}
          pointerEvents="none"
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, marginTop: -20 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ height: 20 }} />

          {step === 1 ? (
            <View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Name <Text style={styles.required}>*</Text>
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    formErrors.first_name ? styles.inputError : null,
                  ]}
                  placeholder="Enter First Name"
                  placeholderTextColor={theme.textMuted}
                  value={form.first_name}
                  onChangeText={v => {
                    setForm({ ...form, first_name: v });
                    if (formErrors.first_name)
                      setFormErrors({ ...formErrors, first_name: '' });
                  }}
                  onBlur={() => formatNameOnBlur('first_name')}
                  returnKeyType="next"
                  onSubmitEditing={() => middleNameRef.current?.focus()}
                />
                {formErrors.first_name ? (
                  <Text style={styles.errorTextSmall}>
                    {formErrors.first_name}
                  </Text>
                ) : null}

                <TextInput
                  ref={middleNameRef}
                  style={[
                    styles.input,
                    { marginTop: 12 },
                    formErrors.middle_name ? styles.inputError : null,
                  ]}
                  placeholder="Enter Middle Name"
                  placeholderTextColor={theme.textMuted}
                  value={form.middle_name}
                  onChangeText={v => {
                    setForm({ ...form, middle_name: v });
                    if (formErrors.middle_name)
                      setFormErrors({ ...formErrors, middle_name: '' });
                  }}
                  onBlur={() => formatNameOnBlur('middle_name')}
                  returnKeyType="next"
                  onSubmitEditing={() => lastNameRef.current?.focus()}
                />
                {formErrors.middle_name ? (
                  <Text style={styles.errorTextSmall}>
                    {formErrors.middle_name}
                  </Text>
                ) : null}

                <TextInput
                  ref={lastNameRef}
                  style={[
                    styles.input,
                    { marginTop: 12 },
                    formErrors.last_name ? styles.inputError : null,
                  ]}
                  placeholder="Enter Last Name"
                  placeholderTextColor={theme.textMuted}
                  value={form.last_name}
                  onChangeText={v => {
                    setForm({ ...form, last_name: v });
                    if (formErrors.last_name)
                      setFormErrors({ ...formErrors, last_name: '' });
                  }}
                  onBlur={() => formatNameOnBlur('last_name')}
                  returnKeyType="done"
                />
                {formErrors.last_name ? (
                  <Text style={styles.errorTextSmall}>
                    {formErrors.last_name}
                  </Text>
                ) : null}
              </View>

              <View style={[styles.inputGroup, { zIndex: 5000 }]}>
                <Text style={styles.inputLabel}>
                  Birthday <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.row}>
                  <Dropdown
                    style={[
                      styles.dropdown,
                      { flex: 2 },
                      formErrors.birthdate ? styles.inputError : null,
                    ]}
                    data={months}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Month"
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    itemTextStyle={styles.itemTextStyle}
                    containerStyle={{ backgroundColor: theme.card }}
                    activeColor={theme.surface}
                    value={birthParts.month}
                    onChange={item => {
                      setBirthParts({ ...birthParts, month: item.value });
                      if (formErrors.birthdate)
                        setFormErrors({ ...formErrors, birthdate: '' });
                    }}
                  />
                  <Dropdown
                    style={[
                      styles.dropdown,
                      { flex: 1, marginHorizontal: 8 },
                      formErrors.birthdate ? styles.inputError : null,
                    ]}
                    data={days}
                    labelField="label"
                    valueField="value"
                    placeholder="Day"
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    itemTextStyle={styles.itemTextStyle}
                    containerStyle={{ backgroundColor: theme.card }}
                    activeColor={theme.surface}
                    value={birthParts.day}
                    onChange={item => {
                      setBirthParts({ ...birthParts, day: item.value });
                      if (formErrors.birthdate)
                        setFormErrors({ ...formErrors, birthdate: '' });
                    }}
                  />
                  <Dropdown
                    style={[
                      styles.dropdown,
                      { flex: 1.5 },
                      formErrors.birthdate ? styles.inputError : null,
                    ]}
                    data={years}
                    labelField="label"
                    valueField="value"
                    placeholder="Year"
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    itemTextStyle={styles.itemTextStyle}
                    containerStyle={{ backgroundColor: theme.card }}
                    activeColor={theme.surface}
                    value={birthParts.year}
                    onChange={item => {
                      setBirthParts({ ...birthParts, year: item.value });
                      if (formErrors.birthdate)
                        setFormErrors({ ...formErrors, birthdate: '' });
                    }}
                  />
                </View>
                {formErrors.birthdate ? (
                  <Text style={styles.errorTextSmall}>
                    {formErrors.birthdate}
                  </Text>
                ) : null}
              </View>

              <View style={[styles.row, styles.inputGroup, { zIndex: 4000 }]}>
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
                    Gender <Text style={styles.required}>*</Text>
                  </Text>
                  <Dropdown
                    style={[
                      styles.dropdown,
                      formErrors.sex ? styles.inputError : null,
                    ]}
                    data={sexData}
                    labelField="label"
                    valueField="value"
                    placeholder="Select"
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    itemTextStyle={styles.itemTextStyle}
                    containerStyle={{ backgroundColor: theme.card }}
                    activeColor={theme.surface}
                    value={form.sex}
                    onChange={item => {
                      setForm({ ...form, sex: item.value });
                      if (formErrors.sex)
                        setFormErrors({ ...formErrors, sex: '' });
                    }}
                  />
                  {formErrors.sex ? (
                    <Text style={styles.errorTextSmall}>{formErrors.sex}</Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Address <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    formErrors.address ? styles.inputError : null,
                  ]}
                  placeholder="Enter Address"
                  placeholderTextColor={theme.textMuted}
                  value={form.address}
                  onChangeText={v => {
                    setForm({ ...form, address: v });
                    if (formErrors.address)
                      setFormErrors({ ...formErrors, address: '' });
                  }}
                  returnKeyType="next"
                  onSubmitEditing={() => birthplaceRef.current?.focus()}
                />
                {formErrors.address ? (
                  <Text style={styles.errorTextSmall}>
                    {formErrors.address}
                  </Text>
                ) : null}
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Birth Place <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  ref={birthplaceRef}
                  style={[
                    styles.input,
                    formErrors.birthplace ? styles.inputError : null,
                  ]}
                  placeholder="Enter Birth Place"
                  placeholderTextColor={theme.textMuted}
                  value={form.birthplace}
                  onChangeText={v => {
                    setForm({ ...form, birthplace: v });
                    if (formErrors.birthplace)
                      setFormErrors({ ...formErrors, birthplace: '' });
                  }}
                  returnKeyType="done"
                />
                {formErrors.birthplace ? (
                  <Text style={styles.errorTextSmall}>
                    {formErrors.birthplace}
                  </Text>
                ) : null}
              </View>

              <View style={[styles.row, styles.inputGroup, { zIndex: 3000 }]}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.inputLabel}>
                    Religion <Text style={styles.required}>*</Text>
                  </Text>
                  <Dropdown
                    style={[
                      styles.dropdown,
                      formErrors.religion ? styles.inputError : null,
                    ]}
                    data={religionData}
                    labelField="label"
                    valueField="value"
                    placeholder="Select"
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    itemTextStyle={styles.itemTextStyle}
                    containerStyle={{ backgroundColor: theme.card }}
                    activeColor={theme.surface}
                    value={form.religion}
                    onChange={item => {
                      setForm({ ...form, religion: item.value });
                      if (formErrors.religion)
                        setFormErrors({ ...formErrors, religion: '' });
                    }}
                  />
                  {formErrors.religion ? (
                    <Text style={styles.errorTextSmall}>
                      {formErrors.religion}
                    </Text>
                  ) : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>
                    Ethnicity <Text style={styles.required}>*</Text>
                  </Text>
                  <Dropdown
                    style={[
                      styles.dropdown,
                      formErrors.ethnicity ? styles.inputError : null,
                    ]}
                    data={ethnicityData}
                    labelField="label"
                    valueField="value"
                    placeholder="Select"
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    itemTextStyle={styles.itemTextStyle}
                    containerStyle={{ backgroundColor: theme.card }}
                    activeColor={theme.surface}
                    value={form.ethnicity}
                    onChange={item => {
                      setForm({ ...form, ethnicity: item.value });
                      if (formErrors.ethnicity)
                        setFormErrors({ ...formErrors, ethnicity: '' });
                    }}
                  />
                  {formErrors.ethnicity ? (
                    <Text style={styles.errorTextSmall}>
                      {formErrors.ethnicity}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Chief of Complaints <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    formErrors.chief_complaints ? styles.inputError : null,
                  ]}
                  placeholder="Enter Chief of Complaints"
                  placeholderTextColor={theme.textMuted}
                  value={form.chief_complaints}
                  onChangeText={v => {
                    setForm({ ...form, chief_complaints: v });
                    if (formErrors.chief_complaints)
                      setFormErrors({ ...formErrors, chief_complaints: '' });
                  }}
                />
                {formErrors.chief_complaints ? (
                  <Text style={styles.errorTextSmall}>
                    {formErrors.chief_complaints}
                  </Text>
                ) : null}
              </View>

              <View
                style={[
                  styles.row,
                  styles.inputGroup,
                  { marginBottom: 30, zIndex: 2000 },
                ]}
              >
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.inputLabel}>
                    Room No. <Text style={styles.required}>*</Text>
                  </Text>
                  <Dropdown
                    style={[
                      styles.dropdown,
                      formErrors.room_no ? styles.inputError : null,
                    ]}
                    data={roomData}
                    labelField="label"
                    valueField="value"
                    placeholder="Select"
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    itemTextStyle={styles.itemTextStyle}
                    containerStyle={{ backgroundColor: theme.card }}
                    activeColor={theme.surface}
                    value={form.room_no}
                    onChange={item => {
                      setForm({ ...form, room_no: item.value });
                      if (formErrors.room_no)
                        setFormErrors({ ...formErrors, room_no: '' });
                    }}
                  />
                  {formErrors.room_no ? (
                    <Text style={styles.errorTextSmall}>
                      {formErrors.room_no}
                    </Text>
                  ) : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>
                    Bed No. <Text style={styles.required}>*</Text>
                  </Text>
                  <Dropdown
                    style={[
                      styles.dropdown,
                      formErrors.bed_no ? styles.inputError : null,
                    ]}
                    data={bedData}
                    labelField="label"
                    valueField="value"
                    placeholder="Select"
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    itemTextStyle={styles.itemTextStyle}
                    containerStyle={{ backgroundColor: theme.card }}
                    activeColor={theme.surface}
                    value={form.bed_no}
                    onChange={item => {
                      setForm({ ...form, bed_no: item.value });
                      if (formErrors.bed_no)
                        setFormErrors({ ...formErrors, bed_no: '' });
                    }}
                  />
                  {formErrors.bed_no ? (
                    <Text style={styles.errorTextSmall}>
                      {formErrors.bed_no}
                    </Text>
                  ) : null}
                </View>
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleNextStep}
              >
                <Text style={styles.submitText}>NEXT</Text>
                <Icon name="chevron-right" size={22} color={theme.primary} />
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
                      onPress={() => {
                        setContacts(contacts.filter((_, i) => i !== index));
                        setContactErrors(
                          contactErrors.filter((_, i) => i !== index),
                        );
                      }}
                    >
                      <Icon
                        name="remove-circle"
                        size={20}
                        color={theme.error}
                      />
                    </TouchableOpacity>
                  )}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      Name <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        contactErrors[index] ? styles.inputError : null,
                      ]}
                      placeholder="Enter Full Name"
                      placeholderTextColor={theme.textMuted}
                      value={contact.name}
                      onChangeText={v => {
                        const updated = [...contacts];
                        updated[index].name = v;
                        setContacts(updated);
                        if (contactErrors[index]) {
                          const errors = [...contactErrors];
                          errors[index] = '';
                          setContactErrors(errors);
                        }
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
                      style={[
                        styles.input,
                        contactErrors[index] ? styles.inputError : null,
                      ]}
                      placeholder="Enter Relationship"
                      placeholderTextColor={theme.textMuted}
                      value={contact.relationship}
                      onChangeText={v => {
                        const updated = [...contacts];
                        updated[index].relationship = v;
                        setContacts(updated);
                        if (contactErrors[index]) {
                          const errors = [...contactErrors];
                          errors[index] = '';
                          setContactErrors(errors);
                        }
                      }}
                      returnKeyType="next"
                      onSubmitEditing={() => contactNumRef.current?.focus()}
                    />
                  </View>

                  {/* CONTACT NUMBER WITH +63 PREFIX */}
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
                        placeholderTextColor={theme.textMuted}
                        keyboardType="number-pad"
                        maxLength={11} // Limits user input to 11 digits
                        value={contact.number}
                        onChangeText={v => handleNumberChange(index, v)}
                        onBlur={() => validateNumberOnBlur(index)}
                        returnKeyType="done"
                      />
                    </View>
                    {contactErrors[index] ? (
                      <Text style={styles.errorTextSmall}>
                        {contactErrors[index]}
                      </Text>
                    ) : null}
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
        <LinearGradient
          colors={fadeColors}
          style={styles.fadeBottom}
          pointerEvents="none"
        />
      </KeyboardAvoidingView>
    </View>
  );
};

const createStyles = (theme: any, commonStyles: any) =>
  StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: theme.background },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 40, paddingBottom: 20 },
    header: {
      marginTop: LAYOUT.headerMarginTop,
      marginBottom: LAYOUT.headerMarginBottom,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    titleContainer: { flex: 1 },
    title: {
      fontSize: 35,
      color: theme.primary,
      fontFamily: 'MinionPro-SemiboldItalic',
      marginBottom: 2,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: 'AlteHaasGroteskBold',
      color: theme.primary,
    },
    addIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1.5,
      borderColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 15,
    },
    inputGroup: { marginBottom: 20 },
    inputLabel: commonStyles.label,
    required: { color: theme.error },
    input: commonStyles.input,
    phoneInputRow: {
      flexDirection: 'row',
      borderWidth: 1.5,
      borderColor: theme.border,
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: theme.inputBg,
    },
    prefixContainer: {
      backgroundColor: theme.surface,
      paddingHorizontal: 12,
      justifyContent: 'center',
      borderRightWidth: 1.5,
      borderRightColor: theme.border,
    },
    prefixText: {
      color: theme.primary,
      fontFamily: 'AlteHaasGroteskBold',
      fontSize: 14,
    },
    flexInput: {
      flex: 1,
      padding: 14,
      fontSize: 14,
      color: theme.text,
      fontFamily: 'AlteHaasGrotesk',
    },
    inputError: { borderColor: theme.error },
    errorText: {
      color: theme.error,
      fontSize: 12,
      marginTop: 5,
      fontFamily: 'AlteHaasGrotesk',
    },
    errorTextSmall: {
      color: theme.error,
      fontSize: 10,
      marginTop: 2,
      fontFamily: 'AlteHaasGrotesk',
      marginLeft: 5,
    },
    placeholderStyle: {
      fontSize: 14,
      color: theme.textMuted,
      fontFamily: 'AlteHaasGrotesk',
    },
    selectedTextStyle: {
      fontSize: 14,
      color: theme.text,
      fontFamily: 'AlteHaasGroteskBold',
    },
    itemTextStyle: {
      fontSize: 14,
      color: theme.text,
      fontFamily: 'AlteHaasGrotesk',
    },
    readOnlyInput: {
      backgroundColor: theme.surface,
      color: theme.text,
      fontFamily: 'AlteHaasGroteskBold',
    },
    dropdown: {
      borderWidth: 1.5,
      borderColor: theme.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      height: 52,
      backgroundColor: theme.inputBg,
    },
    row: { flexDirection: 'row', alignItems: 'center' },
    contactBlock: { marginBottom: 10 },
    removeBtn: { alignSelf: 'flex-end', marginBottom: 5 },
    submitBtn: commonStyles.submitBtn,
    submitText: commonStyles.submitText,
    backLink: { marginTop: 20 },
    backLinkText: {
      textAlign: 'center',
      color: theme.textMuted,
      textDecorationLine: 'underline',
    },
    fadeBottom: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
    },
  });

export default RegisterPatient;
