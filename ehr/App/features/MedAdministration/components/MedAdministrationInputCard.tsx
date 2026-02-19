// MedAdministration/components/MedAdministrationInputCard.tsx
import React from 'react';
import { StyleSheet, View, Text, TextInput, Pressable } from 'react-native';

interface MedAdministrationInputCardProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  editable?: boolean;
  onDisabledPress?: () => void;
}

const MedAdministrationInputCard: React.FC<MedAdministrationInputCardProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  editable = true,
  onDisabledPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Yellow Header Banner */}
      <View style={styles.labelBanner}>
        <Text style={styles.labelText}>{label}</Text>
      </View>

      {/* Input Body */}
      <Pressable 
        style={styles.inputBody} 
        onPress={() => !editable && onDisabledPress && onDisabledPress()}
      >
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          editable={editable}
          pointerEvents={editable ? 'auto' : 'none'}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    borderRadius: 25,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    overflow: 'hidden',
  },
  labelBanner: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    alignItems: 'center',
  },
  labelText: {
    color: '#D97706',
    fontWeight: 'bold',
    fontSize: 13,
  },
  inputBody: {
    minHeight: 50,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  input: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    paddingVertical: 10,
  },
  multilineInput: {
    minHeight: 80,
    textAlign: 'left',
  },
});

export default MedAdministrationInputCard;
