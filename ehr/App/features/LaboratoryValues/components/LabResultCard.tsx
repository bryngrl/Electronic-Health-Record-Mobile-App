import React from 'react';
import { StyleSheet, View, Text, TextInput, Pressable } from 'react-native';

// Synchronize these names with the screen
interface LabInputProps {
  testLabel: string;
  resultValue: string;      // Changed from 'result'
  rangeValue: string;       // Changed from 'range'
  onResultChange: (text: string) => void;
  onRangeChange: (text: string) => void;
  disabled?: boolean;
  onDisabledPress?: () => void;
}

const LabResultCard: React.FC<LabInputProps> = ({ 
  testLabel, 
  resultValue, 
  rangeValue, 
  onResultChange, 
  onRangeChange,
  disabled = false,
  onDisabledPress
}) => {
  return (
    <Pressable 
      onPress={() => {
        if (disabled && onDisabledPress) {
          onDisabledPress();
        }
      }}
      style={styles.container}
    >
      {/* Label Banner matching image_e5b9e3.png */}
      <View style={styles.testHeader}>
        <Text style={styles.testHeaderText}>{testLabel}</Text>
      </View>

      {/* Result Section */}
      <View style={styles.inputGroup} pointerEvents={disabled ? 'none' : 'auto'}>
        <View style={styles.boxHeader}><Text style={styles.boxHeaderText}>Result</Text></View>
        <View style={styles.boxBody}>
          <TextInput 
            style={styles.input} 
            value={resultValue} 
            onChangeText={onResultChange}
            editable={!disabled}
          />
        </View>
      </View>

      {/* Normal Range Section */}
      <View style={styles.inputGroup} pointerEvents={disabled ? 'none' : 'auto'}>
        <View style={styles.boxHeader}><Text style={styles.boxHeaderText}>Normal Range</Text></View>
        <View style={styles.boxBody}>
          <TextInput 
            style={styles.input} 
            value={rangeValue} 
            onChangeText={onRangeChange}
            editable={!disabled}
          />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  testHeader: { backgroundColor: '#E8F5E9', paddingVertical: 12, borderRadius: 25, alignItems: 'center', marginBottom: 15 },
  testHeaderText: { color: '#1B5E20', fontWeight: 'bold', fontSize: 13 },
  inputGroup: { backgroundColor: '#FFFBEB', borderRadius: 25, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#FEF3C7' },
  boxHeader: { backgroundColor: '#FEF3C7', paddingVertical: 6, alignItems: 'center' },
  boxHeaderText: { color: '#D97706', fontWeight: 'bold', fontSize: 11 },
  boxBody: { height: 60, justifyContent: 'center', paddingHorizontal: 20 },
  input: { fontSize: 16, color: '#333', textAlign: 'center' }
});

export default LabResultCard;