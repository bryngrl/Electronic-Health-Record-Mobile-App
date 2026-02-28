// File: src/screens/IvsAndLinesScreen.tsx (TSX for main screen)
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import useIvsAndLinesData from '../hook/useIvsAndLinesData'; // Assuming same directory for simplicity
import DataCard from '../components/DataCard';

interface IvsAndLinesScreenProps {
  onBack: () => void;
}

const IvsAndLinesScreen: React.FC<IvsAndLinesScreenProps> = ({ onBack }) => {
  // Use the custom hook
  const { patientName, setPatientName, handleSubmit } = useIvsAndLinesData();

  const handleNavPress = (index: number) => {
    console.log('Pressed nav item:', index);
    // Add logic to change screens or manage state
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header and Date */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.titleText}>IVs and Lines</Text>
          <Text style={styles.dateText}>Monday, January 26</Text>
        </View>

        {/* Patient Name Section */}
        <View style={styles.patientNameSection}>
          <Text style={styles.patientLabel}>PATIENT NAME :</Text>
          <TextInput
            style={styles.patientInput}
            value={patientName}
            onChangeText={setPatientName}
            placeholder="Select or type Patient name"
            placeholderTextColor="#D1D1D1"
          />
        </View>

        {/* Form Sections using DataCard component */}
        <DataCard badgeText="IV FLUID" />
        <DataCard badgeText="RATE" />
        <DataCard badgeText="SITE" />
        <DataCard badgeText="STATUS" />

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>SUBMIT</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 50, // Enough space for the status bar
    paddingBottom: 100, // Space for the bottom navbar
  },
  headerContainer: {
    marginBottom: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: '#227145',
    fontWeight: 'bold',
  },
  titleText: {
    color: '#227145', // Main green
    fontWeight: 'bold',
    fontSize: 28, // Matches the title's visual weight
  },
  dateText: {
    color: '#9B9B9B', // Gray color
    fontSize: 16,
    marginTop: 5,
  },
  patientNameSection: {
    marginBottom: 20,
  },
  patientLabel: {
    color: '#227145', // Main green
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 8,
  },
  patientInput: {
    borderColor: '#E0E0E0', // Light gray border
    borderWidth: 1,
    borderRadius: 16, // Rounded input like in image
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: 'black',
  },
  submitButton: {
    backgroundColor: '#EAF8EF', // Light green background
    borderColor: '#227145', // Dark green border
    borderWidth: 1.5,
    borderRadius: 24, // Highly rounded corners
    paddingVertical: 15,
    marginTop: 30,
    marginBottom: 30, // Extra bottom padding
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#227145', // Dark green text
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1, // Matching the text's character spacing
  },
});

export default IvsAndLinesScreen;
