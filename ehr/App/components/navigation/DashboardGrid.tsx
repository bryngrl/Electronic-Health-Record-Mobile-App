import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Pressable,
  useWindowDimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppTheme } from '@App/theme/ThemeContext';

interface DashboardItem {
  id: string;
  title: string;
  icon: string;
}

const dashboardItems: DashboardItem[] = [
  { id: 'Register', title: 'Register Patient', icon: 'person-add' },
  {
    id: 'Demographic Profile',
    title: 'Demographic Profile',
    icon: 'account-box',
  },
  { id: 'MedicalHistory', title: 'Medical History', icon: 'history' },
  { id: 'PhysicalExam', title: 'Physical Exam', icon: 'person-search' },
  { id: 'Vital Signs', title: 'Vital Signs', icon: 'monitor-heart' },
  { id: 'Intake and Output', title: 'Intake and Output', icon: 'water-drop' },
  { id: 'Activities', title: 'Activities of Daily Living', icon: 'extension' },
  { id: 'LabValues', title: 'Lab Values', icon: 'science' },
  { id: 'Diagnostics', title: 'Diagnostics', icon: 'biotech' },
  { id: 'IvsAndLines', title: 'IVs and Lines', icon: 'medication' },
  {
    id: 'Medication Administration',
    title: 'Medication Administration',
    icon: 'medical-services',
  },
  {
    id: 'Medical Reconciliation',
    title: 'Medical Reconciliation',
    icon: 'fact-check',
  },
];

interface DashboardGridProps {
  onPressItem: (id: string) => void;
}

export const DashboardGrid = ({ onPressItem }: DashboardGridProps) => {
  const { theme, commonStyles, isDarkMode } = useAppTheme();
  const styles = useMemo(
    () => createStyles(theme, commonStyles, isDarkMode),
    [theme, commonStyles, isDarkMode],
  );

  // Hook listens for orientation changes and provides new dimensions
  const { width, height } = useWindowDimensions();

  // Determine if we are in landscape
  const isLandscape = width > height;

  // Logic: 2 columns for portrait, 4 for landscape
  const numColumns = isLandscape ? 4 : 2;

  // Calculate dynamic card width based on current columns and 20px gaps
  const horizontalPadding = 80; // listContainer horizontal padding (40 * 2)
  const totalGapWidth = 20 * (numColumns - 1);
  const cardWidth = (width - horizontalPadding - totalGapWidth) / numColumns;

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.mainTitle}>Electronic Health {'\n'}Record</Text>
        <View style={styles.bulbContainer}>
          <Icon name="lightbulb-outline" size={24} color="#FBC02D" />
        </View>
      </View>
      <Text style={styles.subTitle}>You are currently logged in as nurse.</Text>
    </View>
  );

  const renderItem = ({ item }: { item: DashboardItem }) => (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { width: cardWidth, opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={() => onPressItem(item.id)}
    >
      <View style={styles.iconContainer}>
        <Icon name={item.icon} size={32} color={theme.primary} />
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>

      <View style={styles.footerRow}>
        <Text style={styles.proceedText}>Proceed</Text>
        <Icon name="chevron-right" size={16} color={theme.textMuted} />
      </View>
    </Pressable>
  );

  return (
    <FlatList
      data={dashboardItems}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      numColumns={numColumns}
      key={numColumns} // Re-render when columns change
      ListHeaderComponent={renderHeader}
      contentContainerStyle={styles.listContainer}
      columnWrapperStyle={styles.columnWrapper}
      showsVerticalScrollIndicator={false}
    />
  );
};

const createStyles = (theme: any, commonStyles: any, isDarkMode: boolean) =>
  StyleSheet.create({
    listContainer: {
      paddingHorizontal: 40,
      paddingBottom: 120,
      backgroundColor: theme.background,
    },
    headerContainer: {
      paddingTop: 10,
      marginTop: Platform.OS === 'ios' ? 20 : 40,
      marginBottom: 35,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    mainTitle: {
      fontSize: 35,
      color: theme.primary,
      fontFamily: 'MinionPro-SemiboldItalic',
      lineHeight: 34,
    },
    bulbContainer: {
      padding: 8,
      borderRadius: 50,
      borderWidth: 1,
      borderColor: isDarkMode ? theme.border : '#EBEBEB',
      backgroundColor: isDarkMode ? theme.card : '#fff',
      marginLeft: 0,
    },
    subTitle: {
      fontSize: 14,
      color: theme.textMuted,
      marginTop: 10,
    },
    columnWrapper: {
      justifyContent: 'flex-start', // Changed to flex-start for consistent spacing
      gap: 20, // Modern gap property supported in newer RN versions
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      elevation: 4, // Android shadow
      shadowColor: '#000', // iOS shadow
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      justifyContent: 'space-between',
      height: 180,
      borderWidth: isDarkMode ? 1 : 0,
      borderColor: theme.border,
    },
    iconContainer: {
      width: 50,
      height: 50,
      borderRadius: 12,
      backgroundColor: theme.iconBg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardTitle: {
      fontSize: 16,
      fontFamily: 'AlteHaasGroteskBold',
      color: theme.primary,
      lineHeight: 20,
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 10,
    },
    proceedText: {
      fontSize: 12,
      color: theme.textMuted,
    },
  });
