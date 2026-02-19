import React from 'react';
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

const THEME_GREEN = '#1B5E20';
const BORDER_COLOR = '#C8E6C9';
const TEXT_MUTED = '#9E9E9E';

const dashboardItems = [
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
  { id: 'IVs & Lines', title: 'IVs and Lines', icon: 'medication' },
  {
    id: 'Medication Administration',
    title: 'Medication Administration',
    icon: 'medical-services',
  },
  {
    id: 'Medication Reconciliation',
    title: 'Medication Reconciliation',
    icon: 'fact-check',
  },
];

interface DashboardGridProps {
  onPressItem: (id: string) => void;
}

export const DashboardGrid = ({ onPressItem }: DashboardGridProps) => {
  // Hook listens for orientation changes and provides new dimensions
  const { width, height } = useWindowDimensions();

  // Determine if we are in landscape
  const isLandscape = width > height;

  // Logic: 2 columns for portrait, 4 for landscape
  const numColumns = isLandscape ? 4 : 2;

  // Calculate dynamic card width based on current columns and 20px gaps
  const horizontalPadding = 40; // listContainer horizontal padding (20 * 2)
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

  const renderItem = ({ item }: { item: (typeof dashboardItems)[0] }) => (
    <Pressable
      onPress={() => onPressItem(item.id)}
      style={({ pressed }) => [
        styles.card,
        { width: cardWidth }, // Responsive card width
        pressed && { backgroundColor: '#F1F8E9' },
      ]}
    >
      <View style={styles.iconContainer}>
        <Icon name={item.icon} size={32} color={THEME_GREEN} />
      </View>

      <Text style={styles.cardTitle}>{item.title}</Text>

      <View style={styles.footerRow}>
        <Text style={styles.proceedText}>Proceed</Text>
        <Icon name="chevron-right" size={16} color={TEXT_MUTED} />
      </View>
    </Pressable>
  );

  return (
    <FlatList
      key={numColumns} // IMPORTANT: Re-renders the list layout when columns change
      data={dashboardItems}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      numColumns={numColumns}
      ListHeaderComponent={renderHeader}
      contentContainerStyle={styles.listContainer}
      columnWrapperStyle={styles.columnWrapper}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    paddingVertical: 45,
    marginRight: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mainTitle: {
    fontSize: 35,
    color: '#035022',
    fontFamily: 'MinionPro-SemiboldItalic',
    lineHeight: 34,
  },
  text: {},

  bulbContainer: {
    padding: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#FFF59D',
    backgroundColor: '#FFFDE7',
    marginLeft: 0,
  },
  subTitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginTop: 10,
  },
  columnWrapper: {
    justifyContent: 'flex-start', // Changed to flex-start for consistent spacing
    gap: 20, // Modern gap property supported in newer RN versions
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    padding: 18,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    height: 180,
    justifyContent: 'space-between',
  },
  iconContainer: {
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME_GREEN,
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
    color: TEXT_MUTED,
  },
});
