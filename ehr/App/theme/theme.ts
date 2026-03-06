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

    card: '#FFFFFF', //nagamit na sa ibang components e nakakatamad irename
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
    avatarCard: 'rgba(144, 255, 158, 0.32)',
    navActiveBg: '#E0FFDD',
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
    avatarCard: '#035022',
    navActiveBg: '#1A2E1C',
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

// Common styles that depend on the theme can be generated via a function
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
