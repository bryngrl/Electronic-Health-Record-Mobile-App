import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  LayoutRectangle,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppTheme } from '@App/theme/ThemeContext';
import { useTutorial } from '@App/context/TutorialContext';

const TutorialOverlay = () => {
  const { theme, isDarkMode } = useAppTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const {
    isActive,
    currentStep,
    steps,
    nextStep,
    prevStep,
    endTutorial,
    getTargetLayout,
  } = useTutorial();

  const [targetLayout, setTargetLayout] = useState<LayoutRectangle | null>(null);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [showCongrats, setShowCongrats] = useState(false);

  const styles = useMemo(
    () => createStyles(theme, isDarkMode, screenWidth, screenHeight),
    [theme, isDarkMode, screenWidth, screenHeight]
  );

  useEffect(() => {
    if (isActive) {
      const step = steps[currentStep];
      
      // Delay measurement to allow navigation to complete first
      const measureTimeout = setTimeout(() => {
        getTargetLayout(step.id).then(layout => {
          setTargetLayout(layout);
        });
      }, 200);

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      return () => clearTimeout(measureTimeout);
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive, currentStep, steps, getTargetLayout, pulseAnim]);

  const handleFinish = () => {
    setShowCongrats(true);
  };

  const handleCloseCongrats = () => {
    setShowCongrats(false);
    endTutorial();
  };

  // Show congrats screen
  if (showCongrats) {
    return (
      <View style={styles.overlay}>
        <View style={styles.backdrop} />
        <View style={styles.congratsOverlay}>
          <View style={styles.congratsCard}>
            <Text style={styles.congratsEmoji}>🎉</Text>
            <Text style={styles.congratsTitle}>You're All Set!</Text>
            <Text style={styles.congratsMessage}>
              You've completed the tutorial. Start exploring the app and manage patient records with ease.
            </Text>
            <TouchableOpacity style={styles.congratsButton} onPress={handleCloseCongrats}>
              <Text style={styles.congratsButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (!isActive) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const getTooltipPosition = () => {
    if (!targetLayout) {
      // Center the tooltip when target is not visible
      return {
        top: screenHeight / 2 - 100,
        left: 20,
        right: 20,
      };
    }

    const tooltipHeight = 180;
    const padding = 20;
    const arrowOffset = 15;
    const bottomNavHeight = 90;

    // If target is in the bottom portion of screen (likely bottom nav), position tooltip higher
    const isBottomNavTarget = targetLayout.y > screenHeight - bottomNavHeight - 50;
    
    if (isBottomNavTarget) {
      // Position tooltip well above the bottom nav
      return {
        top: screenHeight - bottomNavHeight - tooltipHeight - 40,
        left: padding,
        right: padding,
      };
    }

    if (step.position === 'bottom' || targetLayout.y < screenHeight / 3) {
      return {
        top: targetLayout.y + targetLayout.height + arrowOffset,
        left: padding,
        right: padding,
      };
    }
    return {
      top: targetLayout.y - tooltipHeight - arrowOffset,
      left: padding,
      right: padding,
    };
  };

  const tooltipPos = getTooltipPosition();
  const bottomNavHeight = 90;
  const isBottomNavTarget = targetLayout && targetLayout.y > screenHeight - bottomNavHeight - 50;
  const showAbove = targetLayout && (isBottomNavTarget || (step.position !== 'bottom' && targetLayout.y >= screenHeight / 3));

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={endTutorial}
      />

      {targetLayout && (
        <View
          style={[
            styles.spotlightContainer,
            {
              top: targetLayout.y - 8,
              left: targetLayout.x - 8,
              width: targetLayout.width + 16,
              height: targetLayout.height + 16,
            },
          ]}
          pointerEvents="none"
        >
          <Animated.View
            style={[
              styles.spotlight,
              { transform: [{ scale: pulseAnim }] },
            ]}
          />
        </View>
      )}

      <View
        style={[
          styles.tooltipContainer,
          {
            top: tooltipPos.top,
            left: tooltipPos.left,
            right: tooltipPos.right,
          },
        ]}
        pointerEvents="box-none"
      >
        {!showAbove && targetLayout && (
          <View style={[styles.arrow, styles.arrowUp]} />
        )}

        <View style={styles.tooltip}>
          <View style={styles.tooltipHeader}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepText}>
                {currentStep + 1} / {steps.length}
              </Text>
            </View>
            <TouchableOpacity onPress={endTutorial} style={styles.closeButton}>
              <Icon name="close" size={20} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.tooltipTitle}>{step.title}</Text>
          <Text style={styles.tooltipDescription}>{step.description}</Text>

          <View style={styles.buttonRow}>
            {!isFirstStep && (
              <TouchableOpacity style={styles.secondaryButton} onPress={prevStep}>
                <Icon name="chevron-left" size={20} color={theme.primary} />
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            <View style={styles.buttonSpacer} />
            <TouchableOpacity style={styles.primaryButton} onPress={isLastStep ? handleFinish : nextStep}>
              <Text style={styles.primaryButtonText}>
                {isLastStep ? 'Finish' : 'Next'}
              </Text>
              {!isLastStep && (
                <Icon name="chevron-right" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {showAbove && (
          <View style={[styles.arrow, styles.arrowDown]} />
        )}
      </View>
    </View>
  );
};

const createStyles = (
  theme: any,
  isDarkMode: boolean,
  screenWidth: number,
  screenHeight: number
) =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 9999,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    spotlightContainer: {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
    },
    spotlight: {
      width: '100%',
      height: '100%',
      borderRadius: 12,
      borderWidth: 3,
      borderColor: theme.primary,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    tooltipContainer: {
      position: 'absolute',
      alignItems: 'center',
    },
    tooltip: {
      backgroundColor: isDarkMode ? theme.card : '#fff',
      borderRadius: 16,
      padding: 20,
      width: '100%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 10,
      borderWidth: 1,
      borderColor: theme.border,
    },
    tooltipHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    stepIndicator: {
      backgroundColor: theme.primary + '20',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    stepText: {
      color: theme.primary,
      fontSize: 12,
      fontFamily: 'AlteHaasGroteskBold',
    },
    closeButton: {
      padding: 4,
    },
    tooltipTitle: {
      fontSize: 20,
      fontFamily: 'AlteHaasGroteskBold',
      color: theme.primary,
      marginBottom: 8,
    },
    tooltipDescription: {
      fontSize: 14,
      fontFamily: 'AlteHaasGrotesk',
      color: theme.text,
      lineHeight: 20,
      marginBottom: 20,
    },
    congratsOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 30,
    },
    congratsCard: {
      backgroundColor: isDarkMode ? theme.card : '#fff',
      borderRadius: 24,
      padding: 32,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 15,
      maxWidth: 320,
      width: '100%',
    },
    congratsEmoji: {
      fontSize: 56,
      marginBottom: 16,
    },
    congratsTitle: {
      fontSize: 24,
      fontFamily: 'AlteHaasGroteskBold',
      color: theme.primary,
      marginBottom: 12,
      textAlign: 'center',
    },
    congratsMessage: {
      fontSize: 15,
      fontFamily: 'AlteHaasGrotesk',
      color: theme.text,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 24,
    },
    congratsButton: {
      backgroundColor: theme.primary,
      paddingVertical: 14,
      paddingHorizontal: 40,
      borderRadius: 30,
    },
    congratsButtonText: {
      color: '#fff',
      fontSize: 16,
      fontFamily: 'AlteHaasGroteskBold',
    },
    buttonRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    buttonSpacer: {
      flex: 1,
    },
    primaryButton: {
      backgroundColor: theme.primary,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 25,
    },
    primaryButtonText: {
      color: '#fff',
      fontSize: 14,
      fontFamily: 'AlteHaasGroteskBold',
    },
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: theme.primary,
    },
    secondaryButtonText: {
      color: theme.primary,
      fontSize: 14,
      fontFamily: 'AlteHaasGroteskBold',
    },
    arrow: {
      width: 0,
      height: 0,
      borderLeftWidth: 12,
      borderRightWidth: 12,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
    },
    arrowUp: {
      borderBottomWidth: 12,
      borderBottomColor: isDarkMode ? theme.card : '#fff',
      marginBottom: -1,
    },
    arrowDown: {
      borderTopWidth: 12,
      borderTopColor: isDarkMode ? theme.card : '#fff',
      marginTop: -1,
    },
  });

export default TutorialOverlay;
