import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface VitalCardProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}

const VitalCard: React.FC<VitalCardProps> = ({ label, value, onChangeText }) => (
  <View style={styles.cardContainer}>
    {/* Outer Box / Label Header Area */}
    <View style={styles.labelWrapper}>
      <Text style={styles.labelText}>{label}</Text>
    </View>
    {/* Inner Box / Input Field Area */}
    <View style={styles.inputWrapper}>
      <TextInput 
        style={styles.innerInput} 
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        placeholder="--"
        placeholderTextColor="#C7C7CD"
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFEDC1', // FFEDC1 bg of the text
    borderRadius: 25,
    marginBottom: 15,
    height: 75,
    overflow: 'hidden',
  },
  labelWrapper: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  labelText: {
    color: '#EDB62C', // EDB62C for text label
    fontWeight: 'bold',
    fontSize: 12,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#FFFAED', // FFFAED color of the input box
    borderRadius: 20, // Border radius for the inner box
    justifyContent: 'center',
    marginHorizontal: 0, // Same width with FFEDC1 box
  },
  innerInput: {
    textAlign: 'center',
    fontSize: 20,
    color: '#333',
    fontWeight: '600',
  },
});

export default VitalCard;