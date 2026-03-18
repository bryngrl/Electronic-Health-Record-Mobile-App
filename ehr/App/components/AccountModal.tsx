import React, { useMemo, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
  Switch,
  Animated,
  PanResponder,
  StatusBar,
} from 'react-native';
import { BlurView } from '@react-native-community/blur'; // New Import
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '@App/theme/ThemeContext';
import { useAuth } from '@features/Auth/AuthContext';
import SweetAlert from './SweetAlert';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const AccountModal = ({ visible, onClose, onLogout }: any) => {
  const { theme, isDarkMode, toggleDarkMode } = useAppTheme();
  const { user, logout } = useAuth();
  const [showLogoutAlert, setShowLogoutAlert] = React.useState(false);

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const styles = useMemo(
    () => createStyles(theme, isDarkMode),
    [theme, isDarkMode],
  );

  useEffect(() => {
    if (visible) {
      // Optimized for a faster, snappier "scroll up"
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,    // Controlled bounce
        stiffness: 150, // Higher stiffness for faster entry
        mass: 0.8,      // Lower mass for less "weight" during movement
      }).start();
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 150,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only capture if user is dragging down more than 5 pixels
        return Math.abs(gestureState.dy) > 5 && gestureState.dy > 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) translateY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          handleDismiss();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 8,
            speed: 12,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  // Backdrop Interpolation
  const backdropOpacity = translateY.interpolate({
    inputRange: [0, SCREEN_HEIGHT * 0.4],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <>
      <Modal
        transparent
        visible={visible}
        animationType="none"
        onRequestClose={handleDismiss}
        statusBarTranslucent
      >
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent={true}
        />
        <View style={styles.overlay}>
          {/* Animated Blur/Dim Backdrop */}
          <Animated.View
            style={[StyleSheet.absoluteFill, { opacity: backdropOpacity }]}
          >
            {Platform.OS === 'ios' ? (
              <BlurView
                style={StyleSheet.absoluteFill}
                blurType={isDarkMode ? 'dark' : 'light'}
                blurAmount={10}
                reducedTransparencyFallbackColor="black"
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

          {/* Liquid Container */}
          <Animated.View
            style={[styles.modalContainer, { transform: [{ translateY }] }]}
          >
            {/* Gesture Handle Area - Only this part handles dragging */}
            <View {...panResponder.panHandlers} style={styles.gestureHeader}>
              <View style={styles.handle} />
              <Text style={styles.titleText}>Account</Text>
            </View>

            <View style={styles.profileSection}>
              <View style={styles.avatarBox}>
                <Text style={styles.avatarText}>
                  {user?.full_name?.charAt(0) || 'U'}
                </Text>
              </View>
              <View style={styles.profileText}>
                <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
                <Text style={styles.userRole}>
                  {user?.role
                    ? user.role.charAt(0).toUpperCase() +
                      user.role.slice(1).toLowerCase()
                    : 'Role'}
                </Text>
              </View>
            </View>

            <View style={styles.menuCard}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={toggleDarkMode}
                activeOpacity={0.6}
                hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
              >
                <View style={styles.switchRow}>
                  <View style={styles.iconLabelRow}>
                    <Icon name="moon-outline" size={24} color={theme.primary} />
                    <Text style={styles.menuText}>Dark Mode</Text>
                  </View>
                  <Switch
                    trackColor={{ false: '#767577', true: theme.primary }}
                    thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
                    onValueChange={toggleDarkMode}
                    value={isDarkMode}
                  />
                </View>
              </TouchableOpacity>
              <View style={styles.separator} />
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setShowLogoutAlert(true)}
                activeOpacity={0.6}
                hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
              >
                <View style={styles.logoutRow}>
                  <Icon name="log-out-outline" size={24} color={theme.error} />
                  <Text style={styles.logoutLabel}>Log out</Text>
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <SweetAlert
        visible={showLogoutAlert}
        title="Logout"
        message="Are you sure you want to log out?"
        type="warning"
        confirmText="Logout"
        onConfirm={async () => {
          setShowLogoutAlert(false);
          await logout();
          if (onLogout) onLogout();
          handleDismiss();
        }}
        onCancel={() => setShowLogoutAlert(false)}
      />
    </>
  );
};

const createStyles = (theme: any, isDarkMode: boolean) =>
  StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    modalContainer: {
      backgroundColor: theme.modalBg,
      borderTopLeftRadius: 35,
      borderTopRightRadius: 35,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 40,
      minHeight: SCREEN_HEIGHT * 0.45,
      elevation: 24,
    },
    gestureHeader: {
      width: '100%',
      paddingTop: 15,
      paddingBottom: 25,
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    handle: {
      width: 45,
      height: 5,
      backgroundColor: theme.modalHandle,
      borderRadius: 3,
      alignSelf: 'center',
    },
    titleText: {
      fontSize: 18,
      color: theme.primary,
      textAlign: 'center',
      marginTop: 20,
      fontWeight: 'bold',
    },
    profileSection: {
      flexDirection: 'row',
      backgroundColor: theme.card,
      padding: 18,
      borderRadius: 22,
      alignItems: 'center',
      marginBottom: 15,
      borderWidth: 1,
      borderColor: theme.border,
    },
    avatarBox: {
      width: 55,
      height: 55,
      backgroundColor: theme.primary,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
    profileText: { marginLeft: 16 },
    userName: { fontSize: 18, color: theme.primary, fontWeight: 'bold' },
    userRole: {
      fontSize: 13,
      color: theme.textMuted,
      fontWeight: '600',
      marginTop: 2,
    },
    menuCard: {
      backgroundColor: theme.card,
      borderRadius: 22,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.border,
    },
    menuItem: { padding: 20 },
    menuText: {
      fontSize: 16,
      color: theme.text,
      marginLeft: 12,
      fontWeight: 'bold',
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    iconLabelRow: { flexDirection: 'row', alignItems: 'center' },
    separator: {
      height: 1,
      backgroundColor: theme.border,
      marginHorizontal: 20,
    },
    logoutRow: { flexDirection: 'row', alignItems: 'center' },
    logoutLabel: {
      color: theme.error,
      fontSize: 16,
      marginLeft: 12,
      fontWeight: 'bold',
    },
  });
