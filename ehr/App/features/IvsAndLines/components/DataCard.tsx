import React from 'react';
import { StyleSheet, View, Text, TextInput, Pressable } from 'react-native';

interface DataCardProps {
  badgeText: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onDisabledPress?: () => void;
}

const DataCard: React.FC<DataCardProps> = ({
  badgeText,
  value,
  onChangeText,
  placeholder = 'Enter details here...',
  disabled = false,
  onDisabledPress,
}) => {
  return (
    <View style={styles.card}>
      {/* Top Header Section: Badge + Line */}
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
        <View style={styles.headerLine} />
      </View>

      {/* Input Section: Simulating the horizontal lines from the image */}
      <Pressable
        style={styles.inputContainer}
        onPress={() => {
          if (disabled && onDisabledPress) {
            onDisabledPress();
          }
        }}
      >
        {/* Visual guide lines moved behind the text for better alignment */}
        <View style={styles.linesContainer}>
          <View style={styles.guideLine} />
          <View style={styles.guideLine} />
          <View style={styles.guideLine} />
        </View>

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#D1D1D1"
          multiline={true}
          blurOnSubmit={true}
          editable={!disabled}
          pointerEvents={disabled ? 'none' : 'auto'}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFAED',
    borderRadius: 18,
    padding: 16,
    marginBottom: 15,
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    backgroundColor: '#FFEEC2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 10,
  },
  badgeText: {
    color: '#EDB62C',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F2E8D5',
  },
  inputContainer: {
    marginTop: 0,
    marginBottom: 10,

    minHeight: 90,
    position: 'relative',
  },
  linesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  input: {
    fontSize: 15,
    color: '#444',
    paddingVertical: 0,
    paddingTop: 0,
    textAlignVertical: 'top',
    lineHeight: 30,
    zIndex: 1,
  },
  guideLine: {
    height: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#F2E8D5',
  },
});

export default DataCard;
