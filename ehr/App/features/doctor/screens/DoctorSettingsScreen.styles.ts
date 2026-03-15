import { StyleSheet, Platform } from 'react-native';

export const createStyles = (theme: any, isDarkMode: boolean) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background },
    scrollContent: { paddingHorizontal: 40, paddingBottom: 140 },
    header: {
      marginBottom: 28,
      marginTop: Platform.OS === 'ios' ? 20 : 40,
    },
    headerTitle: { fontSize: 35, color: theme.primary, fontFamily: 'MinionPro-SemiboldItalic' },

    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    avatarCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    avatarText: { color: '#FFF', fontSize: 26, fontFamily: 'AlteHaasGroteskBold' },
    profileInfo: { flex: 1, flexShrink: 1 },
    profileName: { fontSize: 18, fontFamily: 'AlteHaasGroteskBold', color: theme.text },
    profileRole: { fontSize: 13, fontFamily: 'AlteHaasGrotesk', color: theme.secondary, marginTop: 2 },
    profileEmail: { fontSize: 12, fontFamily: 'AlteHaasGrotesk', color: theme.textMuted, marginTop: 2, flexWrap: 'wrap' },

    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 1,
    },
    divider: { height: 1, backgroundColor: theme.border, marginHorizontal: 16 },

    settingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    settingsIconLabel: { flexDirection: 'row', alignItems: 'center' },
    settingsIconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: theme.card2,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    logoutIconBox: { backgroundColor: isDarkMode ? '#3a1a1a' : '#fdecea' },
    settingsLabel: { fontSize: 15, fontFamily: 'AlteHaasGroteskBold', color: theme.text },
    logoutLabel: { fontSize: 15, fontFamily: 'AlteHaasGroteskBold', color: theme.error },

    footer: { alignItems: 'center', marginTop: 40 },
    footerText: { fontSize: 13, fontFamily: 'AlteHaasGroteskBold', color: theme.textMuted },
    footerSub: { fontSize: 11, fontFamily: 'AlteHaasGrotesk', color: theme.textMuted, marginTop: 4 },

  });

