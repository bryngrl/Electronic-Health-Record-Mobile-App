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
      paddingTop: 45, // Extra space for top close icon
      maxHeight: '80%',
      zIndex: 100,
      position: 'relative',
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
      position: 'absolute',
      top: 15,
      right: 15,
      zIndex: 110,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    closeMenuText: {
      display: 'none', // Hide the word CLOSE
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
