import React from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';

interface IntakeOutputCardProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  disabled?: boolean;
  onDisabledPress?: () => void;
}

const IntakeOutputCard: React.FC<IntakeOutputCardProps> = ({
  label,
  value,
  onChangeText,
  disabled,
  onDisabledPress,
}) => (
  <View style={styles.cardContainer}>
    {/* Outer Box / Label Header Area */}
    <View style={styles.labelWrapper}>
      <Text style={styles.labelText}>{label}</Text>
    </View>
    {/* Inner Box / Input Field Area */}
    <Pressable
      style={styles.inputWrapper}
      onPress={() => {
        if (disabled && onDisabledPress) {
          onDisabledPress();
        }
      }}
    >
      {/* Spacer to balance the unitBadge on the right for true centering */}
      <View style={{ width: 95 }} />
      <TextInput
        style={styles.innerInput}
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        placeholder="--"
        placeholderTextColor="#C7C7CD"
        editable={!disabled}
        pointerEvents={disabled ? 'none' : 'auto'}
      />
      <View style={styles.unitBadge}>
        <Text style={styles.unitText}>mL</Text>
      </View>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  cardContainer: {
    marginTop: 10,
    backgroundColor: '#FFEDC1',
    borderRadius: 25,
    marginBottom: 15,
    height: 100,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  innerInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  unitBadge: {
    backgroundColor: '#FFEDC1',
    width: 90,
    height: 40,
    borderRadius: 20, // To make it a circle (half of 40)
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5, // Shifting it slightly left from the edge
  },
  unitText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#EDB62C',
  },
});

export default IntakeOutputCard;
