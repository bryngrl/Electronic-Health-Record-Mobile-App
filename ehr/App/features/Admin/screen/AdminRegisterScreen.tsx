import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  BackHandler,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AdminBottomNav from '../components/AdminBottomNav';
import { useAuth } from '@features/Auth/AuthContext';
import apiClient from '@api/apiClient';
import SweetAlert from '@components/SweetAlert';
import { AccountModal } from '@components/AccountModal';
import { useAppTheme } from '@App/theme/ThemeContext';

const PRIMARY_DARK = '#035022';
const PRIMARY_LIGHT = '#E8F5E9';
const PRIMARY_MED = '#5EAE57';

const NURSE_GOLD_BG = '#FFEEC2';
const NURSE_TEXT = '#EDB62C';
const DOCTOR_BLUE_BG = '#D6EAFF';
const DOCTOR_TEXT = '#0075C3';
const ADMIN_RED_BG = '#FFEBEE';
const ADMIN_TEXT_RED = '#D32F2F';

// --- HELPER COMPONENTS ---

const Label = ({ title, theme }: { title: string; theme: any }) => (
  <View style={styles.labelRow}>
    <Text
      style={[
        styles.labelText,
        { color: theme.primary, fontFamily: 'AlteHaasGroteskBold' },
      ]}
    >
      {title}
    </Text>
    <Text style={{ color: 'red' }}> *</Text>
  </View>
);

const ValidatedDropdown = ({
  value,
  placeholder,
  label,
  customWidth,
  theme,
  triggerRef,
  onOpen,
  hasError,
  errorMsg,
  isOpen,
  roleStyle,
}: any) => {
  return (
    <View style={[styles.inputGroup, customWidth && { width: customWidth }]}>
      {label && <Label title={label} theme={theme} />}
      <TouchableOpacity
        ref={triggerRef}
        activeOpacity={0.7}
        style={[
          styles.pickerField,
          {
            borderColor: isOpen ? PRIMARY_MED : theme.border,
            backgroundColor: theme.card,
            borderWidth: isOpen ? 2 : 1,
          },
          hasError && styles.inputError,
          roleStyle,
          isOpen && {
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderBottomColor: 'transparent',
            elevation: 0,
          },
        ]}
        onPress={onOpen}
      >
        <Text
          style={[
            styles.placeholderText,
            {
              color: roleStyle?.color || (value !== '' ? theme.text : theme.textMuted),
              fontFamily: 'AlteHaasGroteskBold',
            },
          ]}
        >
          {value || placeholder}
        </Text>
        <Icon
          name={isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color={roleStyle?.color || (hasError ? 'red' : theme.primary)}
        />
      </TouchableOpacity>
      {!isOpen && hasError && <Text style={styles.errorText}>{errorMsg}</Text>}
    </View>
  );
};

const ValidatedInput = ({
  label,
  value,
  field,
  placeholder,
  secureTextEntry,
  keyboardType,
  editable = true,
  errors,
  onTextChange,
  onBlur,
  children,
  theme,
  isDarkMode,
}: any) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);
  const hasError = !!errors[field];

  return (
    <View style={styles.inputGroup}>
      {label && <Label title={label} theme={theme} />}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: isFocused ? PRIMARY_MED : theme.border,
              backgroundColor: theme.card,
              color: theme.text,
              borderWidth: isFocused ? 2 : 1,
              fontFamily: 'AlteHaasGrotesk',
            },
            hasError && styles.inputError,
            !editable && {
              backgroundColor: isDarkMode ? theme.border : '#F9F9F9',
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          value={value}
          editable={editable}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          onChangeText={val => onTextChange(field, val)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            if (onBlur) onBlur();
          }}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Icon
              name={isPasswordVisible ? 'visibility' : 'visibility-off'}
              size={22}
              color={theme.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
      {children}
      {hasError && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );
};

const AdminRegisterScreen = ({ navigation, onNavigateTab }: any) => {
  const { theme, isDarkMode } = useAppTheme();
  const stylesObj = useMemo(
    () => createStyles(theme, isDarkMode),
    [theme, isDarkMode],
  );

  const { height: windowHeight } = useWindowDimensions();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isAccountModalVisible, setAccountModalVisible] = useState(false);

  const [alertConfig, setAlertConfig] = useState<any>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const [openDropdown, setOpenDropdown] = useState<
    'role' | 'gender' | 'mm' | 'dd' | 'yyyy' | null
  >(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRefs = useRef<{ [key: string]: TouchableOpacity | null }>({});

  const roles = ['nurse', 'doctor', 'admin'];
  const genders = ['Male', 'Female'];
  const months = [
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
  ];
  const days = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, '0'),
  );
  const years = Array.from({ length: 100 }, (_, i) =>
    (new Date().getFullYear() - i).toString(),
  );

  const [formData, setFormData] = useState({
    role: '',
    full_name: '',
    email: '',
    mm: '',
    dd: '',
    yyyy: '',
    age: '',
    sex: '',
    address: '',
    birthplace: '',
    username: '',
    password: '',
    confirm_password: '',
  });

  const passwordCriteria = useMemo(() => {
    const p = formData.password;
    return {
      length: p.length >= 8 && p.length <= 16,
      lowercase: /[a-z]/.test(p),
      uppercase: /[A-Z]/.test(p),
      numeric: /[0-9]/.test(p),
      special: /[$@#%^&.?\-+=]/.test(p),
    };
  }, [formData.password]);

  const allCriteriaMet = useMemo(
    () => Object.values(passwordCriteria).every(Boolean),
    [passwordCriteria],
  );

  const validateField = (name: string, value: string) => {
    let error = '';
    if (!value || value.trim() === '') {
      error = `${name.replace(/_/g, ' ')} is required`;
    } else if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) error = 'Invalid email format';
    } else if (name === 'confirm_password' && value !== formData.password) {
      error = 'Passwords do not match';
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleTextChange = (field: string, val: string) => {
    let finalVal = val;
    if (['full_name', 'address', 'birthplace'].includes(field)) {
      finalVal = val.replace(/\b\w/g, char => char.toUpperCase());
    }
    setFormData(prev => ({ ...prev, [field]: finalVal }));
    validateField(field, finalVal);
  };

  const resetForm = () => {
    setFormData({
      role: '',
      full_name: '',
      email: '',
      mm: '',
      dd: '',
      yyyy: '',
      age: '',
      sex: '',
      address: '',
      birthplace: '',
      username: '',
      password: '',
      confirm_password: '',
    });
    setSubmitted(false);
    setErrors({});
    setRefreshing(false);
    setAlertConfig({ visible: false });
  };

  const roleStyle =
    formData.role === 'nurse' && !isDarkMode
      ? {
          backgroundColor: NURSE_GOLD_BG,
          color: NURSE_TEXT,
          borderColor: NURSE_TEXT,
        }
      : formData.role === 'doctor' && !isDarkMode
      ? {
          backgroundColor: DOCTOR_BLUE_BG,
          color: DOCTOR_TEXT,
          borderColor: DOCTOR_TEXT,
        }
      : formData.role === 'admin' && !isDarkMode
      ? {
          backgroundColor: ADMIN_RED_BG,
          color: ADMIN_TEXT_RED,
          borderColor: ADMIN_TEXT_RED,
        }
      : null;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setAlertConfig({
      visible: true,
      title: 'Clear Form?',
      message: 'Reset all fields?',
      type: 'warning',
      showCancel: true,
      onConfirm: resetForm,
      onCancel: () => {
        setRefreshing(false);
        setAlertConfig({ visible: false });
      },
    });
  }, [formData]);

  useEffect(() => {
    if (formData.mm && formData.dd && formData.yyyy) {
      const birthDate = new Date(
        parseInt(formData.yyyy),
        parseInt(formData.mm) - 1,
        parseInt(formData.dd),
      );
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      if (
        today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() &&
          today.getDate() < birthDate.getDate())
      )
        age--;
      setFormData(prev => ({ ...prev, age: age >= 0 ? age.toString() : '0' }));
    }
  }, [formData.mm, formData.dd, formData.yyyy]);

  const handleCreateAccount = async () => {
    setSubmitted(true);
    let hasErrors = false;

    Object.keys(formData).forEach(key => {
      if (validateField(key, formData[key as keyof typeof formData]))
        hasErrors = true;
    });

    if (hasErrors || !allCriteriaMet) return;

    try {
      setLoading(true);
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        username: formData.username,
        birthdate: `${formData.yyyy}-${formData.mm}-${formData.dd}`,
        age: parseInt(formData.age, 10),
        sex: formData.sex,
        address: formData.address,
        birthplace: formData.birthplace,
      };

      const response = await apiClient.post('/admin/users', payload);
      if (response.status === 200 || response.status === 201) {
        setAlertConfig({
          visible: true,
          title: 'Success',
          message: 'User created successfully.',
          type: 'success',
          onConfirm: resetForm,
        });
      }
    } catch (error: any) {
      const serverMsg = error.response?.data?.detail;
      const errorMsg = Array.isArray(serverMsg)
        ? serverMsg[0].msg
        : serverMsg || 'An error occurred during save.';

      setAlertConfig({
        visible: true,
        title: 'Registration Failed',
        message: errorMsg,
        type: 'error',
        onConfirm: () => setAlertConfig({ visible: false }),
      });
    } finally {
      setLoading(false);
    }
  };

  const openDropdownMenu = (type: any) => {
    triggerRefs.current[type]?.measureInWindow((x, y, width, height) => {
      setDropdownPos({ top: y + height - 1, left: x, width });
      setOpenDropdown(type);
    });
  };

  const Requirement = ({ label, met }: { label: string; met: boolean }) => {
    if (met) return null;
    return (
      <View style={styles.requirementRow}>
        <Icon name="close" size={16} color="#FF0000" style={styles.checkIcon} />
        <Text
          style={[
            styles.requirementText,
            { color: '#FF0000', fontFamily: 'AlteHaasGrotesk' },
          ]}
        >
          {label}
        </Text>
      </View>
    );
  };

  return (
    <View style={stylesObj.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
      />
      <SafeAreaView style={stylesObj.container}>
        <AccountModal
          visible={isAccountModalVisible}
          onClose={() => setAccountModalVisible(false)}
        />
        <SweetAlert
          visible={alertConfig.visible}
          {...alertConfig}
          confirmText="OK"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={stylesObj.scrollContent}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={openDropdown === null}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.primary]}
              />
            }
          >
            <View style={stylesObj.header}>
              <View>
                <Text style={[stylesObj.headerTitle, { color: theme.primary }]}>
                  Registration
                </Text>
                <Text style={stylesObj.headerDate}>
                  {new Date().toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setAccountModalVisible(true)}
                style={{ marginTop: 10 }}
              >
                <Icon name="keyboard-arrow-down" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ValidatedDropdown
              label="Role"
              value={formData.role.toUpperCase()}
              placeholder="SELECT ROLE"
              theme={theme}
              triggerRef={(el: any) => {
                triggerRefs.current['role'] = el;
              }}
              onOpen={() => openDropdownMenu('role')}
              isOpen={openDropdown === 'role'}
              hasError={submitted && errors['role']}
              errorMsg={errors['role']}
              roleStyle={roleStyle}
            />

            <ValidatedInput
              label="Full Name"
              field="full_name"
              value={formData.full_name}
              placeholder="Enter Full Name"
              errors={errors}
              onTextChange={handleTextChange}
              theme={theme}
              isDarkMode={isDarkMode}
            />
            <ValidatedInput
              label="Email"
              field="email"
              value={formData.email}
              placeholder="Enter Email"
              keyboardType="email-address"
              errors={errors}
              onTextChange={handleTextChange}
              theme={theme}
              isDarkMode={isDarkMode}
            />

            <Label title="Birthday" theme={theme} />
            <View style={styles.dateRow}>
              {['mm', 'dd', 'yyyy'].map(type => (
                <ValidatedDropdown
                  key={type}
                  value={formData[type as keyof typeof formData]}
                  placeholder={type.toUpperCase()}
                  customWidth="31%"
                  theme={theme}
                  triggerRef={(el: any) => {
                    triggerRefs.current[type] = el;
                  }}
                  onOpen={() => openDropdownMenu(type)}
                  isOpen={openDropdown === type}
                  hasError={submitted && errors[type]}
                />
              ))}
            </View>

            <View style={styles.row}>
              <View style={{ width: '48%' }}>
                <Label title="Age" theme={theme} />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDarkMode ? theme.border : '#F9F9F9',
                      color: theme.text,
                      borderColor: theme.border,
                      fontFamily: 'AlteHaasGrotesk',
                    },
                  ]}
                  value={formData.age}
                  editable={false}
                />
              </View>
              <View style={{ width: '48%' }}>
                <ValidatedDropdown
                  label="Gender"
                  value={formData.sex}
                  placeholder="Gender"
                  theme={theme}
                  triggerRef={(el: any) => {
                    triggerRefs.current['gender'] = el;
                  }}
                  onOpen={() => openDropdownMenu('gender')}
                  isOpen={openDropdown === 'gender'}
                  hasError={submitted && errors['sex']}
                  errorMsg={errors['sex']}
                />
              </View>
            </View>

            <ValidatedInput
              label="Address"
              field="address"
              value={formData.address}
              placeholder="Enter Address"
              errors={errors}
              onTextChange={handleTextChange}
              theme={theme}
              isDarkMode={isDarkMode}
            />
            <ValidatedInput
              label="Birth Place"
              field="birthplace"
              value={formData.birthplace}
              placeholder="Enter Birth Place"
              errors={errors}
              onTextChange={handleTextChange}
              theme={theme}
              isDarkMode={isDarkMode}
            />
            <ValidatedInput
              label="Username"
              field="username"
              value={formData.username}
              placeholder="Enter Username"
              errors={errors}
              onTextChange={handleTextChange}
              theme={theme}
              isDarkMode={isDarkMode}
            />

            <ValidatedInput
              label="Password"
              field="password"
              value={formData.password}
              placeholder="Enter Password"
              secureTextEntry
              errors={errors}
              onTextChange={handleTextChange}
              theme={theme}
              isDarkMode={isDarkMode}
            >
              {!allCriteriaMet && formData.password.length > 0 && (
                <View style={styles.requirementContainer}>
                  <Requirement
                    label="8-16 characters"
                    met={passwordCriteria.length}
                  />
                  <Requirement
                    label="Lowercase letter"
                    met={passwordCriteria.lowercase}
                  />
                  <Requirement
                    label="Uppercase letter"
                    met={passwordCriteria.uppercase}
                  />
                  <Requirement
                    label="Numeric character"
                    met={passwordCriteria.numeric}
                  />
                  <Requirement
                    label="Special character"
                    met={passwordCriteria.special}
                  />
                </View>
              )}
            </ValidatedInput>

            <ValidatedInput
              label="Confirm Password"
              field="confirm_password"
              value={formData.confirm_password}
              placeholder="Re-enter Password"
              secureTextEntry
              errors={errors}
              onTextChange={handleTextChange}
              theme={theme}
              isDarkMode={isDarkMode}
            />

            <TouchableOpacity
              style={[
                stylesObj.submitBtn,
                { backgroundColor: isDarkMode ? theme.primary : PRIMARY_LIGHT },
              ]}
              onPress={handleCreateAccount}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator
                  color={isDarkMode ? '#FFF' : theme.primary}
                />
              ) : (
                <Text
                  style={[
                    stylesObj.submitBtnText,
                    { color: isDarkMode ? '#FFF' : PRIMARY_DARK },
                  ]}
                >
                  CREATE ACCOUNT
                </Text>
              )}
            </TouchableOpacity>
            <View style={{ height: 100 }} />
          </ScrollView>
        </KeyboardAvoidingView>

        <Modal visible={openDropdown !== null} transparent animationType="none">
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setOpenDropdown(null)}
          >
            <View
              style={[
                styles.modalDropdown,
                {
                  top: dropdownPos.top,
                  left: dropdownPos.left,
                  width: dropdownPos.width,
                  backgroundColor: theme.card,
                  borderColor: PRIMARY_MED,
                  borderTopWidth: 0,
                },
              ]}
            >
              <ScrollView
                nestedScrollEnabled
                keyboardShouldPersistTaps="always"
              >
                {(openDropdown === 'role'
                  ? roles
                  : openDropdown === 'gender'
                  ? genders
                  : openDropdown === 'mm'
                  ? months
                  : openDropdown === 'dd'
                  ? days
                  : years
                ).map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.dropdownOption,
                      { borderBottomColor: theme.border },
                    ]}
                    onPress={() => {
                      const key =
                        openDropdown === 'gender' ? 'sex' : openDropdown!;
                      setFormData(prev => ({ ...prev, [key]: opt }));
                      validateField(key, opt);
                      setOpenDropdown(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: theme.text, fontFamily: 'AlteHaasGroteskBold' },
                        openDropdown === 'role' &&
                          opt === 'nurse' && { color: NURSE_TEXT },
                        openDropdown === 'role' &&
                          opt === 'doctor' && { color: DOCTOR_TEXT },
                        openDropdown === 'role' &&
                          opt === 'admin' && { color: ADMIN_TEXT_RED },
                      ]}
                    >
                      {opt.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        <View style={stylesObj.floatingNavContainer} pointerEvents="box-none">
          <View
            style={{ height: windowHeight, width: '100%' }}
            pointerEvents="box-none"
          >
            <AdminBottomNav
              activeTab="Register"
              navigation={navigation}
              onNavigate={onNavigateTab}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const createStyles = (theme: any, isDarkMode: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    scrollContent: { paddingHorizontal: 40, paddingBottom: 150 },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginTop: Platform.OS === 'ios' ? 20 : 40,
      marginBottom: 35,
    },
    headerTitle: {
      fontSize: 35,
      color: theme.primary,
      fontFamily: 'MinionPro-SemiboldItalic',
    },
    headerDate: {
      fontSize: 14,
      color: theme.textMuted,
      marginTop: 4,
      fontFamily: 'AlteHaasGroteskBold',
    },
    submitBtn: {
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
      borderWidth: 1,
      borderColor: PRIMARY_MED,
      marginBottom: 20,
    },
    submitBtnText: {
      fontWeight: 'bold',
      fontSize: 14,
      fontFamily: 'AlteHaasGroteskBold',
    },
    floatingNavContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'transparent',
      zIndex: 1000,
    },
  });

const styles = StyleSheet.create({
  labelRow: { flexDirection: 'row', marginTop: 15, marginBottom: 5 },
  labelText: { fontSize: 15 },
  inputGroup: { marginBottom: 5 },
  inputWrapper: { position: 'relative', justifyContent: 'center' },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 15,
    width: '100%',
  },
  eyeIcon: { position: 'absolute', right: 15 },
  inputError: { borderColor: 'red' },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 5,
    fontFamily: 'AlteHaasGrotesk',
  },
  pickerField: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeholderText: { fontSize: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between' },
  requirementContainer: { marginTop: 10, paddingHorizontal: 5 },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkIcon: { marginRight: 8 },
  requirementText: { fontSize: 12, fontWeight: '500' },
  modalDropdown: {
    position: 'absolute',
    borderWidth: 2,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    elevation: 5,
    maxHeight: 180,
    overflow: 'hidden',
    zIndex: 9999,
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
  },
  optionText: { fontSize: 14, fontWeight: 'bold' },
});

export default AdminRegisterScreen;
