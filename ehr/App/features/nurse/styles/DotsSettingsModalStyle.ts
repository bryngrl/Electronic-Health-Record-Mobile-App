import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

/**
 * Unified styles for the "3 dots" settings/options modal.
 * Centered card, dark blurred background.
 */
export const createDotsSettingsModalStyle = (theme: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark background for contrast
    },
    blurView: {
      ...StyleSheet.absoluteFillObject,
    },
    menuContainer: {
      width: width * 0.85,
      backgroundColor: theme.card,
      borderRadius: 25,
      padding: 25,
      maxHeight: '80%',
      zIndex: 100,
    },
    menuTitle: {
      fontSize: 18,
      fontFamily: 'AlteHaasGroteskBold',
      color: theme.primary,
      marginBottom: 20,
      textAlign: 'center',
    },
    menuItem: {
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    menuItemText: {
      fontSize: 16,
      color: theme.text,
      textAlign: 'center',
      fontFamily: 'AlteHaasGrotesk',
    },
    activeMenuText: {
      color: theme.secondary,
      fontFamily: 'AlteHaasGroteskBold',
    },
    closeMenuBtn: {
      marginTop: 20,
      backgroundColor: theme.surface,
      paddingVertical: 12,
      borderRadius: 20,
      alignItems: 'center',
    },
    closeMenuText: {
      color: theme.primary,
      fontFamily: 'AlteHaasGroteskBold',
    },
  });

/**
 * Unified props for BlurView used in settings modals.
 */
export const blurProps = {
  blurType: 'dark' as const,
  blurAmount: 1,
  reducedTransparencyFallbackColor: 'black',
};
