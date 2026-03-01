import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface Props {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
}

const MedicalReconCard = ({ label, value, onChangeText }: Props) => (
  <View style={styles.cardContainer}>
    <View style={styles.labelPill}>
      <Text style={styles.labelText}>{label}</Text>
    </View>
    
    {/* Binago natin ito para maging multiline at may lines sa background */}
    <View style={styles.inputWrapper}>
       {/* Background Lines (Static) */}
      <View style={styles.lineOverlay}>
        <View style={styles.line} />
        <View style={styles.line} />
        <View style={styles.line} />
      </View>

      <TextInput 
        style={styles.multilineInput}
        value={value}
        onChangeText={onChangeText}
        multiline={true}
        numberOfLines={3}
        textAlignVertical="top" // Para magsimula ang text sa taas (Android)
        placeholder="Type here..."
        placeholderTextColor="#DDD"
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  cardContainer: { 
    backgroundColor: '#FFFAED', 
    borderRadius: 20, 
    padding: 15, 
    marginBottom: 12,
    minHeight: 140 // Sinisiguro na malaki ang card
  },
  labelPill: { 
    backgroundColor: '#FFEDC1', 
    alignSelf: 'flex-start', 
    paddingHorizontal: 12, 
    paddingVertical: 4, 
    borderRadius: 15, 
    marginBottom: 10,
    zIndex: 2 // Para hindi matakpan ng lines
  },
  labelText: { color: '#EDB62C', fontWeight: 'bold', fontSize: 11 },
  
  inputWrapper: {
    position: 'relative',
    marginTop: 5,
  },
  multilineInput: { 
    color: '#333', 
    fontSize: 14, 
    lineHeight: 25, // Importante: dapat match ito sa spacing ng lines sa ibaba
    paddingTop: 0,
    zIndex: 1,
  },
  lineOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  line: {
    height: 25, // Match sa lineHeight ng TextInput
    borderBottomWidth: 1,
    borderBottomColor: '#F0E0B0', // Kulay ng lines (light gold/yellow)
  }
});

export default MedicalReconCard;