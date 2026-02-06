import React from 'react';
import { 
  StyleSheet, View, Text, FlatList, 
  Dimensions, Pressable, useWindowDimensions 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Use a dynamic margin
const CARD_MARGIN = 10;

const dashboardItems = [
  { id: 'Register', title: 'REGISTER', icon: 'person-add', desc: 'This is where new patients are registered into the system.' },
  { id: 'Demographic Profile', title: 'DEMOGRAPHIC PROFILE', icon: 'badge', desc: 'Store and manage patient information.' },
  { id: 'History', title: 'MEDICAL HISTORY', icon: 'history', desc: 'Document past illnesses, surgeries, and family medical background.' },
  { id: 'Physical Exam', title: 'PHYSICAL EXAM', icon: 'person-search', desc: 'Record findings from clinical examinations.' },
  { id: 'Vital Signs', title: 'VITAL SIGNS', icon: 'monitor-heart', desc: 'Track and update measurements such as BP and pulse.' },
  { id: 'Intake and Output', title: 'INTAKE AND OUTPUT', icon: 'water-drop', desc: "Monitor and log a patient's fluid intake and output." },
  { id: 'Activities of Daily Living', title: 'ACTIVITIES OF DAILY LIVING', icon: 'accessibility', desc: 'Assess a patient’s ability to perform daily tasks.' },
  { id: 'Lab Values', title: 'LAB VALUES', icon: 'science', desc: 'Record laboratory test results.' },
];

interface DashboardGridProps {
  onPressItem: (id: string) => void;
}

export const DashboardGrid = ({ onPressItem }: DashboardGridProps) => {
  // 1. Get current screen dimensions
  const { width, height } = useWindowDimensions();
  
  // 2. Determine column count based on orientation
  const isLandscape = width > height;
  const numColumns = isLandscape ? 4 : 2;

  // 3. Calculate dynamic card width
  const cardWidth = (width - (CARD_MARGIN * (numColumns * 2))) / numColumns;

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.mainTitle}>EHR - COMPONENTS</Text>
      <Text style={styles.subTitle}>
        Our system offers a set of integrated components that make patient data management simple.
      </Text>
      <View style={styles.greenUnderline} />
    </View>
  );

  const renderItem = ({ item }: { item: typeof dashboardItems[0] }) => (
    <Pressable 
      onPress={() => onPressItem(item.id)}
      style={({ pressed }) => [
        styles.card,
        { width: cardWidth }, // Dynamic width
        pressed && { borderColor: '#1A6A24', borderWidth: 2, elevation: 8 }
      ]}
    >
      <View>
        <Icon name={item.icon} size={36} color="#1A6A24" style={styles.cardIcon} />
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc} numberOfLines={3}>{item.desc}</Text>
      </View>
      
      <View style={styles.proceedButton}>
        <Text style={styles.proceedText}>PROCEED</Text>
        <Icon name="chevron-right" size={16} color="#1A6A24" />
      </View>
    </Pressable>
  );

  return (
    <FlatList
      key={numColumns} // Force re-render when column count changes
      data={dashboardItems}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      ListHeaderComponent={renderHeader}
      contentContainerStyle={styles.listPadding}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listPadding: { paddingBottom: 40, backgroundColor: '#fff' },
  headerContainer: { padding: 20, alignItems: 'center', backgroundColor: '#fff' },
  mainTitle: { fontSize: 22, fontWeight: '900', color: '#000000' },
  subTitle: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 8 },
  greenUnderline: { height: 2, width: '100%', backgroundColor: '#1A6A24', marginTop: 15 },
  card: {
    backgroundColor: '#fff',
    margin: CARD_MARGIN,
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'space-between',
    minHeight: 200, // Reduced slightly for landscape
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardIcon: { marginBottom: 10 },
  cardTitle: { fontSize: 12, fontWeight: '800', color: '#000000', marginBottom: 6 },
  cardDesc: { fontSize: 10, color: '#555', lineHeight: 14 },
  proceedButton: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  proceedText: { fontSize: 11, fontWeight: '700', color: '#1A6A24', marginRight: 4 },
});