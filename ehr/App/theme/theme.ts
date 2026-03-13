import { Platform } from 'react-native';

export const COLORS = {
  light: {
    primary: '#035022',
    secondary: '#29A539',
    background: '#FFFFFF',
    surface: '#F2F1EF',
    error: '#FF0000',
    text: '#333333',
    tableHeader: '#E5FFE8',
    textMuted: '#999696',
    border: '#E0E0E0',
    filterBg: '#5EAE57',

    card: '#FFFFFF',
    card2: '#F6FFF7', // features card bg color
    cardBorder: '#7AF489',

    white: '#FFFFFF',
    inputBg: '#FFFFFF',
    icon: '#035022',
    iconBg: '#FFFFFF',
    modalBg: '#F1F1F1',
    modalHandle: '#747474',
    buttonBg: '#E5FFE8',
    buttonBorder: '#035022',
    buttonDisabledBg: '#F2F1EF',
    buttonDisabledBorder: '#E0E0E0',
    avatarCard: 'rgba(144, 255, 158, 0.32)',
    navActiveBg: '#E0FFDD',
    updateBadgeBg: '#FFEEC2',
    updateBadgeText: '#EDB62C',

    // Alert Bell Icon states
    alertBellDisabledBg: '#F2F1EF', // no patient selected
    alertBellOffBg: '#FEF3C7', // patient selected, no findings / unmatched alert
    alertBellOnBg: '#FFECBD', // patient selected, alert triggered

    // Toast / Snackbar
    toastSuccessBg: '#ECFDF5',
    toastSuccessText: '#065F46',
    toastSuccessBorder: '#6EE7B7',
    toastErrorBg: '#FEF2F2',
    toastErrorText: '#991B1B',
    toastErrorBorder: '#FCA5A5',
    toastWarningBg: '#FFFBEB',
    toastWarningText: '#92400E',
    toastWarningBorder: '#FCD34D',
    toastInfoBg: '#EFF6FF',
    toastInfoText: '#1E40AF',
    toastInfoBorder: '#BFDBFE',
    toastOfflineBg: '#F3F4F6',
    toastOfflineText: '#374151',
    toastOfflineBorder: '#D1D5DB',
  },
  dark: {
    primary: '#4ADE80',
    secondary: '#22C55E',
    background: '#121212',
    surface: '#2b2b2b',
    error: '#FF5252',
    text: '#F9FAFB',
    tableHeader: '#757575',
    textMuted: '#9CA3AF',
    border: '#3a5137',
    filterBg: '#5EAE57',

    card: '#1E1E1E',
    card2: '#1A2E1C', // features card bg color
    cardBorder: '#2D5A30',

    white: '#FFFFFF',
    inputBg: '#1E1E1E',
    iconBg: '#1E1E1E',
    modalBg: '#131313',
    modalHandle: '#363535',
    buttonBg: '#E5FFE8',
    buttonBorder: '#4ADE80',
    buttonDisabledBg: '#2b2b2b',
    buttonDisabledBorder: '#3a5137',
    avatarCard: '#035022',
    navActiveBg: '#1A2E1C',
    updateBadgeBg: '#3D2800',
    updateBadgeText: '#F59E0B',

    // Alert Bell Icon states
    alertBellDisabledBg: '#2b2b2b', // no patient selected
    alertBellOffBg: '#3D2800', // patient selected, no findings / unmatched alert
    alertBellOnBg: '#78350F', // patient selected, alert triggered

    // Toast / Snackbar
    toastSuccessBg: '#064E3B',
    toastSuccessText: '#6EE7B7',
    toastSuccessBorder: '#065F46',
    toastErrorBg: '#450A0A',
    toastErrorText: '#FCA5A5',
    toastErrorBorder: '#991B1B',
    toastWarningBg: '#451A03',
    toastWarningText: '#FDE68A',
    toastWarningBorder: '#92400E',
    toastInfoBg: '#1E3A5F',
    toastInfoText: '#93C5FD',
    toastInfoBorder: '#1E40AF',
    toastOfflineBg: '#1F2937',
    toastOfflineText: '#D1D5DB',
    toastOfflineBorder: '#374151',
  },
};

export const getTheme = (isDark: boolean) =>
  isDark ? COLORS.dark : COLORS.light;

export const LAYOUT = {
  paddingHorizontal: 40,
  paddingBottom: 20,
  headerMarginTop: Platform.OS === 'ios' ? 20 : 40,
  headerMarginBottom: 35,
};

export const getCommonStyles = (isDark: boolean) => {
  const theme = getTheme(isDark);
  return {
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
      paddingHorizontal: LAYOUT.paddingHorizontal,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      marginTop: LAYOUT.headerMarginTop,
      marginBottom: LAYOUT.headerMarginBottom,
    },
    title: {
      fontSize: 35,
      fontFamily: 'MinionPro-SemiboldItalic',
      color: theme.primary,
      marginBottom: 2,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: 'AlteHaasGroteskBold',
      color: theme.primary,
      fontWeight: 'bold' as const,
    },
    tableHeader: {
      flexDirection: 'row' as const,
      backgroundColor: theme.tableHeader,
      paddingVertical: 12,
      borderRadius: 8,
    },
    input: {
      borderWidth: 1.5,
      borderColor: theme.border,
      borderRadius: 10,
      padding: 14,
      backgroundColor: theme.inputBg,
      color: theme.text,
      fontFamily: 'AlteHaasGrotesk',
    },
    label: {
      fontSize: 14,
      fontFamily: 'AlteHaasGroteskBold',
      color: theme.primary,
      marginBottom: 8,
    },
    submitBtn: {
      backgroundColor: theme.buttonBg,
      height: 55,
      borderRadius: 30,
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      borderWidth: 1.5,
      borderColor: theme.buttonBorder,
      marginTop: 10,
    },
    submitText: {
      color: theme.primary,
      fontFamily: 'AlteHaasGroteskBold',
      fontSize: 16,
      fontWeight: 'bold' as const,
    },
  };
};
