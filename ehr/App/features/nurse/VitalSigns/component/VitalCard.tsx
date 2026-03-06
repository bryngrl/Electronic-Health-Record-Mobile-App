import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface VitalCardProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
}

const VitalCard: React.FC<VitalCardProps> = ({
  label,
  value,
  onChangeText,
  editable = true,
}) => (
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
        editable={editable}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFEDC1',
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
    color: '#EDB62C',
    fontFamily: 'AlteHaasGroteskBold',
    fontSize: 13,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#FFFAED',
    borderRadius: 20,
    justifyContent: 'center',
    marginHorizontal: 0,
  },
  innerInput: {
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
});

export default VitalCard;
