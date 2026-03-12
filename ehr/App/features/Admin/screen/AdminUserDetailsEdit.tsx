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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
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

// --- HELPER COMPONENTS ---

const ValidatedDropdown = ({
  value,
  placeholder,
  label,
  customWidth,
  theme,
  triggerRef,
  onOpen,
  isOpen,
  roleStyle,
  hasError,
}: any) => {
  return (
    <View style={[styles.inputGroup, customWidth && { width: customWidth }]}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={[styles.labelText, { color: theme.primary }]}>
            {label}
          </Text>
          <Text style={{ color: 'red' }}> *</Text>
        </View>
      )}
      <TouchableOpacity
        ref={triggerRef}
        activeOpacity={0.7}
        style={[
          styles.pickerField,
          {
            borderColor: hasError ? 'red' : theme.border,
            backgroundColor: theme.card,
          },
          roleStyle,
          isOpen && {
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderBottomColor: 'transparent',
            borderColor: PRIMARY_MED,
            borderWidth: 2,
            elevation: 0,
          },
        ]}
        onPress={onOpen}
      >
        <Text
          style={[
            styles.placeholderText,
            {
              color:
                roleStyle?.color ||
                (value !== '' ? theme.text : theme.textMuted),
            },
          ]}
        >
          {value || placeholder}
        </Text>
        <Icon
          name={isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color={roleStyle?.color || theme.primary}
        />
      </TouchableOpacity>
    </View>
  );
};

const FocusedInput = ({
  label,
  value,
  onChangeText,
  theme,
  isDarkMode,
  placeholder,
  editable = true,
  error,
}: any) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={styles.inputGroup}>
      <View style={styles.labelRow}>
        <Text style={[styles.labelText, { color: theme.primary }]}>
          {label}
        </Text>
        <Text style={{ color: 'red' }}> *</Text>
      </View>
      <TextInput
        style={[
          styles.input,
          {
            borderColor: error ? 'red' : isFocused ? PRIMARY_MED : theme.border,
            backgroundColor: theme.card,
            color: theme.text,
            borderWidth: isFocused ? 2 : 1,
          },
          !editable && {
            backgroundColor: isDarkMode ? theme.border : '#F9F9F9',
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        editable={editable}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const AdminUserDetailsEdit = ({ route, navigation }: any) => {
  const { userData } = route.params;
  const { theme, isDarkMode } = useAppTheme();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isAccountModalVisible, setAccountModalVisible] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [alertConfig, setAlertConfig] = useState<any>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const [openDropdown, setOpenDropdown] = useState<
    'role' | 'gender' | 'month' | 'day' | 'year' | null
  >(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRefs = useRef<{ [key: string]: TouchableOpacity | null }>({});

  const roles = ['nurse', 'doctor'];
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
    role: userData.role || 'nurse',
    full_name: userData.full_name || '',
    email: userData.email || '',
    month: '',
    day: '',
    year: '',
    age: userData.age?.toString() || '',
    sex: userData.sex || 'Male',
    address: userData.address || '',
    birth_place: userData.birth_place || '',
    username: userData.username || '',
  });

  // --- REAL-TIME VALIDATION ---
  useEffect(() => {
    const newErrors: any = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.month || !formData.day || !formData.year)
      newErrors.birthday = 'Required';
    setErrors(newErrors);
  }, [formData]);

  // --- AGE CALCULATION ---
  useEffect(() => {
    if (formData.month && formData.day && formData.year) {
      const birthDate = new Date(
        parseInt(formData.year),
        parseInt(formData.month) - 1, // Correct month index
        parseInt(formData.day),
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
  }, [formData.month, formData.day, formData.year]);

  const processUpdate = async () => {
    try {
      setLoading(true);
      const payload = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        sex: formData.sex,
        birth_place: formData.birth_place.trim(),
        age: parseInt(formData.age, 10) || 0,
        birthday: `${formData.year}-${formData.month}-${formData.day}`, // Format: YYYY-MM-DD
        username: formData.username.trim(),
      };

      if (formData.role !== userData.role) {
        await apiClient.put(`/auth/users/${userData.id}/role`, {
          role: formData.role.toLowerCase(),
        });
      }

      const response = await apiClient.put(
        `/auth/users/${userData.id}`,
        payload,
      );
      if (response.status === 200 || response.status === 204) {
        setAlertConfig({
          visible: true,
          title: 'Success!',
          message: 'Information saved.',
          type: 'success',
          onConfirm: () => {
            setAlertConfig({ visible: false });
            navigation.navigate('UserDetails', {
              userData: { ...userData, ...payload, role: formData.role },
            });
          },
        });
      }
    } catch (error) {
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Update failed.',
        type: 'error',
        onConfirm: () => setAlertConfig({ visible: false }),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePress = () => {
    if (Object.keys(errors).length > 0) return;
    setAlertConfig({
      visible: true,
      title: 'Confirm Changes',
      message: 'Save profile updates?',
      type: 'warning',
      showCancel: true,
      onConfirm: () => {
        setAlertConfig({ visible: false });
        processUpdate();
      },
      onCancel: () => setAlertConfig({ visible: false }),
    });
  };

  const handleResetPassword = () => {
    setAlertConfig({
      visible: true,
      title: 'Reset Password?',
      message: 'Confirm reset for this user?',
      type: 'warning',
      showCancel: true,
      onConfirm: () => {
        setAlertConfig({ visible: false });
        confirmPasswordReset();
      },
      onCancel: () => setAlertConfig({ visible: false }),
    });
  };

  const confirmPasswordReset = async () => {
    try {
      setLoading(true);
      const tempPass = Math.random().toString(36).slice(-8);
      await apiClient.put(`/auth/users/${userData.id}/reset-password`, {
        new_password: tempPass,
      });
      setAlertConfig({
        visible: true,
        title: 'Done!',
        message: `New Password: ${tempPass}`,
        type: 'success',
        onConfirm: () => setAlertConfig({ visible: false }),
      });
    } catch (error) {
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Reset failed.',
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

  useEffect(() => {
    if (userData.birthday) {
      const d = new Date(userData.birthday);
      setFormData(prev => ({
        ...prev,
        month: (d.getMonth() + 1).toString().padStart(2, '0'),
        day: d.getDate().toString().padStart(2, '0'),
        year: d.getFullYear().toString(),
      }));
    }
  }, [userData.birthday]);

  const roleStyle =
    formData.role === 'nurse' && !isDarkMode
      ? { backgroundColor: NURSE_GOLD_BG, color: NURSE_TEXT }
      : formData.role === 'doctor' && !isDarkMode
      ? { backgroundColor: DOCTOR_BLUE_BG, color: DOCTOR_TEXT }
      : null;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <AccountModal
        visible={isAccountModalVisible}
        onClose={() => setAccountModalVisible(false)}
      />
      <SweetAlert
        visible={alertConfig.visible}
        {...alertConfig}
        confirmText="OK"
        cancelText="CANCEL"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          scrollEnabled={openDropdown === null}
        >
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: theme.primary }]}>
                Edit Information
              </Text>
              <Text style={[styles.headerDate, { color: theme.textMuted }]}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>

          <ValidatedDropdown
            label="Role"
            value={formData.role.toUpperCase()}
            theme={theme}
            triggerRef={(el: any) => {
              triggerRefs.current['role'] = el;
            }}
            onOpen={() => openDropdownMenu('role')}
            isOpen={openDropdown === 'role'}
            roleStyle={roleStyle}
          />

          <FocusedInput
            label="Full Name"
            value={formData.full_name}
            onChangeText={(v: any) =>
              setFormData({ ...formData, full_name: v })
            }
            theme={theme}
            error={errors.full_name}
            isDarkMode={isDarkMode}
          />

          <View style={styles.labelRow}>
            <Text style={[styles.labelText, { color: theme.primary }]}>
              Birthday
            </Text>
            <Text style={{ color: 'red' }}> *</Text>
          </View>
          <View style={styles.dateRow}>
            {['month', 'day', 'year'].map(t => (
              <ValidatedDropdown
                key={t}
                value={formData[t as keyof typeof formData]}
                placeholder={t.toUpperCase()}
                customWidth="31%"
                theme={theme}
                triggerRef={(el: any) => {
                  triggerRefs.current[t] = el;
                }}
                onOpen={() => openDropdownMenu(t)}
                isOpen={openDropdown === t}
                hasError={errors.birthday}
              />
            ))}
          </View>

          <View style={styles.row}>
            <View style={{ width: '48%' }}>
              <View style={styles.labelRow}>
                <Text style={[styles.labelText, { color: theme.primary }]}>
                  Age
                </Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDarkMode ? theme.border : '#F9F9F9',
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={formData.age}
                editable={false}
              />
            </View>
            <View style={{ width: '48%' }}>
              <ValidatedDropdown
                label="Sex"
                value={formData.sex}
                theme={theme}
                triggerRef={(el: any) => {
                  triggerRefs.current['gender'] = el;
                }}
                onOpen={() => openDropdownMenu('gender')}
                isOpen={openDropdown === 'gender'}
              />
            </View>
          </View>

          <FocusedInput
            label="Address"
            value={formData.address}
            onChangeText={(v: any) => setFormData({ ...formData, address: v })}
            theme={theme}
            error={errors.address}
            isDarkMode={isDarkMode}
          />
          <FocusedInput
            label="Birth Place"
            value={formData.birth_place}
            onChangeText={(v: any) =>
              setFormData({ ...formData, birth_place: v })
            }
            theme={theme}
            isDarkMode={isDarkMode}
          />
          <FocusedInput
            label="Email"
            value={formData.email}
            onChangeText={(v: any) => setFormData({ ...formData, email: v })}
            theme={theme}
            error={errors.email}
            isDarkMode={isDarkMode}
          />
          <FocusedInput
            label="Username"
            value={formData.username}
            onChangeText={(v: any) => setFormData({ ...formData, username: v })}
            theme={theme}
            error={errors.username}
            isDarkMode={isDarkMode}
          />

          <TouchableOpacity
            style={styles.resetPass}
            onPress={handleResetPassword}
          >
            <Text style={[styles.resetPassText, { color: theme.textMuted }]}>
              Reset Password
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.cancelBtn,
                { backgroundColor: isDarkMode ? theme.border : PRIMARY_LIGHT },
              ]}
              onPress={() => navigation.goBack()}
            >
              <Text
                style={[
                  styles.cancelBtnText,
                  { color: isDarkMode ? theme.text : PRIMARY_DARK },
                ]}
              >
                CANCEL
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSavePress}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveBtnText}>SAVE CHANGES</Text>
              )}
            </TouchableOpacity>
          </View>
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
            <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="always">
              {(openDropdown === 'role'
                ? roles
                : openDropdown === 'gender'
                ? genders
                : openDropdown === 'month'
                ? months
                : openDropdown === 'day'
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
                    setFormData({ ...formData, [key]: opt });
                    setOpenDropdown(null);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: theme.text },
                      openDropdown === 'role' &&
                        opt === 'nurse' && { color: NURSE_TEXT },
                      openDropdown === 'role' &&
                        opt === 'doctor' && { color: DOCTOR_TEXT },
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 40, paddingBottom: 150 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 35,
    color: '#035022',
    fontFamily: 'MinionPro-SemiboldItalic',
  },
  headerDate: {
    fontSize: 14,
    color: '#B2B2B2',
    marginTop: 4,
    fontWeight: 'bold',
  },
  labelRow: { flexDirection: 'row', marginTop: 15, marginBottom: 5 },
  labelText: { fontSize: 15, fontWeight: 'bold' },
  inputGroup: { marginBottom: 5 },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 15,
    width: '100%',
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
  resetPass: { alignSelf: 'flex-end', marginTop: 10, marginBottom: 10 },
  resetPassText: { textDecorationLine: 'underline', fontSize: 13 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  cancelBtn: {
    width: '48%',
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: PRIMARY_MED,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: { fontWeight: 'bold' },
  saveBtn: {
    width: '48%',
    height: 50,
    borderRadius: 25,
    backgroundColor: PRIMARY_MED,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: { color: '#FFF', fontWeight: 'bold' },
  errorText: { color: 'red', fontSize: 12, marginTop: 4, marginLeft: 5 },
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

export default AdminUserDetailsEdit;
