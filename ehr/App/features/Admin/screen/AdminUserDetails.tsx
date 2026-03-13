import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Platform,
  PanResponder,
  Animated,
  useWindowDimensions,
  TouchableWithoutFeedback,
  Dimensions,
  StatusBar,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import apiClient from '@api/apiClient';
import SweetAlert from '@components/SweetAlert';
import { useAppTheme } from '@App/theme/ThemeContext';

const NURSE_TEXT = '#EDB62C';
const DOCTOR_TEXT = '#0075C3';
const TABLE_HEADER_BG_LIGHT = '#E2FBE5';

export const AdminUserDetails = ({
  visible,
  onClose,
  userData,
  navigation,
}: any) => {
  const { theme, isDarkMode } = useAppTheme();
  const { height: windowHeight } = useWindowDimensions();
  const styles = useMemo(
    () => createStyles(theme, isDarkMode, windowHeight),
    [theme, isDarkMode, windowHeight],
  );

  const [loading, setLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isRoleModalVisible, setRoleModalVisible] = useState(false);

  // --- POSITIONING STATES ---
  const [modalY, setModalY] = useState(0);
  const [modalX, setModalX] = useState(0);
  const [modalWidth, setModalWidth] = useState(0);
  const [alertConfig, setAlertConfig] = useState<any>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const translateY = useRef(new Animated.Value(windowHeight)).current;
  const roleAnimValue = useRef(new Animated.Value(0)).current;
  const scrollOffset = useRef(0);

  const [currentUser, setCurrentUser] = useState<any>(userData || {});

  useEffect(() => {
    if (visible) {
      setCurrentUser(userData || {});
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 25,
        stiffness: 120,
      }).start();
      fetchAllData();
    }
  }, [visible, userData]);

  useEffect(() => {
    if (isRoleModalVisible) {
      Animated.spring(roleAnimValue, {
        toValue: 1,
        tension: 80,
        friction: 9,
        useNativeDriver: true,
      }).start();
    } else {
      roleAnimValue.setValue(0);
    }
  }, [isRoleModalVisible]);

  const scaleY = roleAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });
  const roleTranslateY = roleAnimValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-15, 0],
  });

  const handleDismiss = useCallback(() => {
    Animated.timing(translateY, {
      toValue: windowHeight,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onClose());
  }, [onClose, windowHeight]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 0 && scrollOffset.current <= 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) translateY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) handleDismiss();
        else
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 6,
          }).start();
      },
    }),
  ).current;

  const fetchAllData = async () => {
    if (!userData?.id || !userData?.username) return;
    try {
      setLoading(true);
      const [userRes, logsRes] = await Promise.all([
        apiClient.get(`/admin/users/${userData.id}`),
        apiClient.get(`/admin/audit-logs?search=${userData.username}`),
      ]);
      setCurrentUser(userRes.data);
      setAuditLogs(logsRes.data?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (nextRole: string) => {
    setRoleModalVisible(false);
    if (nextRole.toLowerCase() === currentUser.role?.toLowerCase()) return;

    setAlertConfig({
      visible: true,
      title: 'Update Role?',
      message: `Change user role to ${nextRole.toUpperCase()}?`,
      type: 'warning',
      showCancel: true,
      onConfirm: async () => {
        setAlertConfig({ visible: false });
        try {
          setLoading(true);
          await apiClient.patch(`/admin/users/${currentUser.id}/role`, {
            role: nextRole.toLowerCase(),
          });
          await fetchAllData();

          setTimeout(() => {
            setAlertConfig({
              visible: true,
              title: 'Success!',
              message: 'Role updated successfully.',
              type: 'success',
              showCancel: false,
              onConfirm: () => setAlertConfig({ visible: false }),
            });
          }, 500);
        } catch (error) {
          setAlertConfig({
            visible: true,
            title: 'Error',
            message: 'Failed to update.',
            type: 'error',
            onConfirm: () => setAlertConfig({ visible: false }),
          });
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => setAlertConfig({ visible: false }),
    });
  };

  const isNurse = currentUser.role?.toLowerCase() === 'nurse';
  const isDoctor = currentUser.role?.toLowerCase() === 'doctor';

  const backdropOpacity = translateY.interpolate({
    inputRange: [0, windowHeight * 0.4],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleDismiss}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent={true}
        />
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: backdropOpacity }]}
        >
          {Platform.OS === 'ios' ? (
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType={isDarkMode ? 'dark' : 'light'}
              blurAmount={10}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: 'rgba(0,0,0,0.6)' },
              ]}
            />
          )}
          <TouchableWithoutFeedback onPress={handleDismiss}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
        </Animated.View>

        <Animated.View
          style={[styles.modalContainer, { transform: [{ translateY }] }]}
        >
          <SweetAlert
            visible={alertConfig.visible}
            {...alertConfig}
            onCancel={() => setAlertConfig({ visible: false })}
            confirmText="OK"
            cancelText="CANCEL"
          />

          <Modal visible={isRoleModalVisible} transparent animationType="none">
            <TouchableOpacity
              style={styles.roleModalOverlay}
              activeOpacity={1}
              onPress={() => setRoleModalVisible(false)}
            >
              <Animated.View
                style={[
                  styles.dropdownContainer,
                  {
                    top: modalY,
                    left: modalX,
                    width: modalWidth,
                    transform: [{ scaleY }, { translateY: roleTranslateY }],
                  },
                ]}
              >
                {['nurse', 'doctor', 'admin'].map(role => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.dropdownPill,
                      role === 'nurse'
                        ? styles.nurseBadge
                        : role === 'doctor'
                        ? styles.doctorBadge
                        : {
                            backgroundColor: theme.card,
                            borderWidth: 1,
                            borderColor: theme.border,
                          },
                      currentUser.role?.toLowerCase() === role &&
                        (role === 'nurse'
                          ? styles.selectedBorderNurse
                          : role === 'doctor'
                          ? styles.selectedBorderDoctor
                          : { borderColor: theme.primary }),
                      { marginTop: role === 'nurse' ? 4 : 8 },
                    ]}
                    onPress={() => handleUpdateRole(role)}
                  >
                    <Text
                      style={[
                        styles.roleBadgeText,
                        role === 'nurse'
                          ? styles.nurseText
                          : role === 'doctor'
                          ? styles.doctorText
                          : { color: theme.text },
                      ]}
                    >
                      {role.charAt(0).toUpperCase() +
                        role.slice(1).toLowerCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            </TouchableOpacity>
          </Modal>

          <View style={styles.handleWrapper} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollPadding}
            onScroll={e => {
              scrollOffset.current = e.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}
            bounces={false}
          >
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {currentUser.full_name?.charAt(0) || 'U'}
                </Text>
              </View>
              <View style={styles.nameSection}>
                <Text style={[styles.userNameText, { color: theme.text }]}>
                  {currentUser.full_name || 'Loading...'}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.roleBadge,
                    isNurse
                      ? styles.nurseBadge
                      : isDoctor
                      ? styles.doctorBadge
                      : {
                          backgroundColor: theme.card,
                          borderWidth: 1,
                          borderColor: theme.border,
                        },
                  ]}
                  onPress={e => {
                    e.currentTarget.measureInWindow((x, y, width, height) => {
                      const statusBarHeight =
                        Platform.OS === 'android'
                          ? StatusBar.currentHeight || 0
                          : 0;
                      setModalY(y - statusBarHeight + height + 5);
                      setModalX(x);
                      setModalWidth(width);
                      setRoleModalVisible(true);
                    });
                  }}
                >
                  <Text
                    style={[
                      styles.roleBadgeText,
                      isNurse
                        ? styles.nurseText
                        : isDoctor
                        ? styles.doctorText
                        : { color: theme.text },
                      { flex: 1 },
                    ]}
                  >
                    {currentUser.role
                      ? currentUser.role.charAt(0).toUpperCase() +
                        currentUser.role.slice(1).toLowerCase()
                      : ''}
                  </Text>
                  <Icon
                    name="keyboard-arrow-down"
                    size={18}
                    color={
                      isNurse ? NURSE_TEXT : isDoctor ? DOCTOR_TEXT : theme.text
                    }
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  handleDismiss();
                  navigation.navigate('AdminUserDetailsEdit', {
                    userData: currentUser,
                  });
                }}
              >
                <Icon name="edit-note" size={35} color="#29A539" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { color: theme.primary }]}>
              Account Information
            </Text>

            <View style={styles.infoGrid}>
              <View style={styles.infoBox}>
                <Text style={styles.label}>Username :</Text>
                <Text style={[styles.value, { color: theme.text }]}>
                  {currentUser.username || '---'}
                </Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.label}>Sex :</Text>
                <Text style={[styles.value, { color: theme.text }]}>
                  {currentUser.sex || '---'}
                </Text>
              </View>
            </View>

            <View style={styles.infoBoxFull}>
              <Text style={styles.label}>Email :</Text>
              <Text style={[styles.value, { color: theme.text }]}>
                {currentUser.email || '---'}
              </Text>
            </View>
            <View style={styles.infoBoxFull}>
              <Text style={styles.label}>Address :</Text>
              <Text style={[styles.value, { color: theme.text }]}>
                {currentUser.address || '---'}
              </Text>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoBox}>
                <Text style={styles.label}>Birth Place :</Text>
                <Text style={[styles.value, { color: theme.text }]}>
                  {currentUser.birthplace || '---'}
                </Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.label}>Age :</Text>
                <Text style={[styles.value, { color: theme.text }]}>
                  {currentUser.age ? `${currentUser.age} years old` : '---'}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.auditTableContainer,
                { borderColor: theme.border, backgroundColor: theme.card },
              ]}
            >
              <View
                style={[
                  styles.auditTableHeader,
                  {
                    backgroundColor: isDarkMode
                      ? theme.border
                      : TABLE_HEADER_BG_LIGHT,
                  },
                ]}
              >
                <Text style={styles.auditHeaderTitle}>Audit Log</Text>
              </View>
              <View
                style={[
                  styles.auditSubHeader,
                  {
                    backgroundColor: isDarkMode ? theme.background : '#F9FFF9',
                    borderBottomColor: theme.border,
                  },
                ]}
              >
                <Text style={styles.columnLabel}>Action</Text>
                <Text
                  style={[styles.columnLabel, { flex: 1.5, marginLeft: 15 }]}
                >
                  Details
                </Text>
                <Text
                  style={[
                    styles.columnLabel,
                    { flex: 1.2, textAlign: 'right' },
                  ]}
                >
                  Date & Time
                </Text>
              </View>
              <View style={{ height: 280 }}>
                {loading ? (
                  <ActivityIndicator
                    style={{ marginTop: 40 }}
                    color="#29A539"
                  />
                ) : (
                  <ScrollView
                    nestedScrollEnabled
                    showsVerticalScrollIndicator={true}
                  >
                    {auditLogs.map((log: any, index) => (
                      <View
                        key={index}
                        style={[
                          styles.logRow,
                          { borderBottomColor: theme.border },
                        ]}
                      >
                        <Text
                          style={[
                            styles.logText,
                            { flex: 1, color: theme.text },
                          ]}
                        >
                          {log.action}
                        </Text>
                        <Text
                          style={[
                            styles.logText,
                            {
                              flex: 1.5,
                              color: theme.textMuted,
                              marginLeft: 15,
                            },
                          ]}
                        >
                          {log.sentence}
                        </Text>
                        <Text
                          style={[
                            styles.logText,
                            {
                              flex: 1.2,
                              textAlign: 'right',
                              color: theme.textMuted,
                            },
                          ]}
                        >
                          {log.date}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>

            <View style={styles.footerTimeline}>
              <View style={styles.timelineItem}>
                <View
                  style={[styles.verticalBar, { backgroundColor: '#29A539' }]}
                />
                <View>
                  <Text style={styles.timelineLabel}>Created date</Text>
                  <Text
                    style={[styles.timelineValue, { color: theme.textMuted }]}
                  >
                    {currentUser.created_at
                      ? new Date(currentUser.created_at).toLocaleDateString(
                          'en-US',
                          { month: 'long', day: 'numeric', year: 'numeric' },
                        )
                      : '---'}
                  </Text>
                </View>
              </View>
              <View style={[styles.timelineItem, { marginTop: 30 }]}>
                <View
                  style={[styles.verticalBar, { backgroundColor: '#29A539' }]}
                />
                <View>
                  <Text style={styles.timelineLabel}>Last Login</Text>
                  <Text
                    style={[styles.timelineValue, { color: theme.textMuted }]}
                  >
                    3 hours ago
                  </Text>
                </View>
              </View>
            </View>
            <View style={{ height: 60 }} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: any, isDarkMode: boolean, windowHeight: number) =>
  StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    modalContainer: {
      backgroundColor: theme.background,
      borderTopLeftRadius: 35,
      borderTopRightRadius: 35,
      height: windowHeight * 0.9,
      elevation: 24,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 10,
      overflow: 'hidden',
    },
    handleWrapper: {
      width: '100%',
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    handle: {
      width: 60,
      height: 5,
      backgroundColor: isDarkMode ? theme.border : '#CCC',
      borderRadius: 3,
    },
    scrollPadding: { paddingHorizontal: 40, paddingBottom: 60 },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 30,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      paddingBottom: 20,
    },
    avatarContainer: {
      width: 80,
      height: 80,
      borderRadius: 25,
      backgroundColor: isDarkMode ? theme.card : '#EFFFF2',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      fontSize: 36,
      color: '#29A539',
      fontWeight: 'bold',
      fontFamily: 'AlteHaasGroteskBold',
    },
    nameSection: { flex: 1, marginLeft: 20 },
    userNameText: {
      fontSize: 20,
      color: theme.text,
      fontFamily: 'AlteHaasGroteskBold',
    },
    roleBadge: {
      flexDirection: 'row',
      paddingHorizontal: 15,
      paddingVertical: 5,
      borderRadius: 25,
      alignSelf: 'flex-start',
      marginTop: 8,
      alignItems: 'center',
      minWidth: 105,
    },
    roleBadgeText: {
      fontSize: 12,
      fontFamily: 'AlteHaasGroteskBold',
    },
    editButton: {
      width: 45,
      height: 45,
      borderRadius: 15,
      borderWidth: 1.5,
      borderColor: '#49D65B',
      justifyContent: 'center',
      alignItems: 'center',
    },
    sectionTitle: {
      fontSize: 18,
      marginBottom: 25,
      color: theme.primary,
      fontFamily: 'AlteHaasGroteskBold',
    },
    infoGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    infoBox: { width: '48%' },
    infoBoxFull: { width: '100%', marginBottom: 15 },
    label: {
      fontSize: 14,
      color: theme.textMuted,
      fontFamily: 'AlteHaasGroteskBold',
    },
    value: {
      fontSize: 14,
      color: theme.text,
      marginTop: 4,
      fontFamily: 'AlteHaasGrotesk',
    },
    auditTableContainer: {
      borderRadius: 15,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
      marginTop: 25,
      marginBottom: 40,
      elevation: 3,
      shadowOpacity: 0.05,
    },
    auditTableHeader: { paddingVertical: 12, paddingHorizontal: 15 },
    auditHeaderTitle: {
      color: theme.primary,
      fontSize: 14,
      fontFamily: 'AlteHaasGroteskBold',
    },
    auditSubHeader: {
      flexDirection: 'row',
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderBottomWidth: 1,
    },
    columnLabel: {
      fontSize: 13,
      color: theme.primary,
      fontFamily: 'AlteHaasGroteskBold',
    },
    logRow: {
      flexDirection: 'row',
      paddingHorizontal: 15,
      paddingVertical: 12,
      borderBottomWidth: 0.5,
    },
    logText: { fontSize: 12, fontFamily: 'AlteHaasGrotesk' },
    footerTimeline: { paddingHorizontal: 5 },
    timelineItem: { flexDirection: 'row', alignItems: 'center' },
    verticalBar: { width: 3, height: 50, marginRight: 20, borderRadius: 2 },
    timelineLabel: {
      fontSize: 16,
      color: theme.primary,
      fontFamily: 'AlteHaasGroteskBold',
    },
    timelineValue: {
      fontSize: 14,
      marginTop: 4,
      fontFamily: 'AlteHaasGrotesk',
    },
    roleModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
    dropdownContainer: {
      position: 'absolute',
      backgroundColor: 'transparent',
      padding: 0,
    },
    dropdownPill: {
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 25,
      width: '100%',
      borderWidth: 2,
      borderColor: 'transparent',
      alignItems: 'center',
    },
    selectedBorderNurse: { borderColor: '#EDB62C' },
    selectedBorderDoctor: { borderColor: '#0075C3' },
    nurseBadge: {
      backgroundColor: isDarkMode ? 'rgba(255, 238, 194, 0.2)' : '#FFEEC2',
    },
    doctorBadge: {
      backgroundColor: isDarkMode ? 'rgba(214, 234, 255, 0.2)' : '#D6EAFF',
    },
    nurseText: { color: '#EDB62C' },
    doctorText: { color: '#0075C3' },
  });
