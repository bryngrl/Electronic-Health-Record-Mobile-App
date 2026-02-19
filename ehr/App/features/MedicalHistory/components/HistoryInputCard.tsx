import React from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';

interface LinedInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  numberOfLines?: number;
  disabled?: boolean;
  onDisabledPress?: () => void;
}

const LinedInputCard = ({ 
  label, 
  value, 
  onChangeText, 
  numberOfLines = 4,
  disabled = false,
  onDisabledPress
}: LinedInputProps) => {
  const LINE_HEIGHT = 30;

  return (
    <Pressable 
      onPress={() => {
        if (disabled && onDisabledPress) {
          onDisabledPress();
        }
      }}
      style={styles.card}
    >
      <View style={styles.labelRow}>
        <View style={styles.labelBadge}>
          <Text style={styles.labelText}>{label}</Text>
        </View>
        <View style={styles.sideLine} />
      </View>
      
      <View style={styles.inputWrapper} pointerEvents={disabled ? 'none' : 'auto'}>
        {/* Background Lines */}
        <View style={StyleSheet.absoluteFill}>
          {[...Array(numberOfLines)].map((_, i) => (
            <View 
              key={i} 
              style={[styles.line, { top: (i + 1) * LINE_HEIGHT }]} 
            />
          ))}
        </View>

        {/* TextInput aligned to lines */}
        <TextInput
          style={[styles.input, { lineHeight: LINE_HEIGHT, minHeight: LINE_HEIGHT * numberOfLines }]}
          value={value}
          onChangeText={onChangeText}
          multiline
          scrollEnabled={false}
          placeholder=""
          editable={!disabled}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFBEB',
    borderRadius: 25,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  labelBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderRadius: 15,
    marginRight: 10,
  },
  labelText: {
    color: '#D97706',
    fontWeight: 'bold',
    fontSize: 12,
  },
  sideLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  inputWrapper: {
    marginTop: -10,
    position: 'relative',
  },
  line: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  input: {
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    paddingTop: 5,
  },
});

export default LinedInputCard;