import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';

interface Props {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  disabled?: boolean;
  onDisabledPress?: () => void;
}

const LINE_HEIGHT = 28;
const INPUT_PADDING_BOTTOM = 20;

const MedicalReconCard = ({
  label,
  value,
  onChangeText,
  disabled = false,
  onDisabledPress,
}: Props) => {
  // Initialized to exactly 4 visible lines (4 * 28) plus the padding
  const [inputHeight, setInputHeight] = useState(
    4 * LINE_HEIGHT + INPUT_PADDING_BOTTOM,
  );

  // Subtract the padding so numLines accurately reflects the visual typing area
  const visibleTypingHeight = Math.max(0, inputHeight - INPUT_PADDING_BOTTOM);
  const numLines = Math.max(4, Math.ceil(visibleTypingHeight / LINE_HEIGHT));

  const renderLines = () => {
    const lines = [];
    for (let i = 0; i < numLines; i++) {
      const topPosition = (i + 1) * LINE_HEIGHT;

      lines.push(
        <View
          key={i}
          style={[
            styles.line,
            {
              top: topPosition,
              left: 10,
              right: 10, // Full width padding on both sides
            },
          ]}
        />,
      );
    }
    return lines;
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.headerText}>{label}</Text>
      </View>

      <View style={styles.content}>
        <Pressable
          style={styles.inputArea}
          onPress={() => {
            if (disabled && onDisabledPress) {
              onDisabledPress();
            }
          }}
        >
          <View style={styles.linesContainer} pointerEvents="none">
            {renderLines()}
          </View>

          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            multiline
            editable={!disabled}
            placeholder="Type here..."
            placeholderTextColor="#D1D1D1"
            pointerEvents={disabled ? 'none' : 'auto'}
            onContentSizeChange={e => {
              setInputHeight(e.nativeEvent.contentSize.height);
            }}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFAED',
    borderRadius: 25,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  cardHeader: {
    backgroundColor: '#FFEDC1',
    paddingVertical: 6,
    alignItems: 'center',
  },
  headerText: {
    color: '#EDB62C',
    fontFamily: 'AlteHaasGroteskBold',
    fontSize: 14,
  },
  content: {
    padding: 15,
    position: 'relative',
  },
  inputArea: {
    minHeight: 112,
    position: 'relative',
  },
  input: {
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
    zIndex: 2,
    padding: 10,
    paddingTop: 0,
    paddingBottom: INPUT_PADDING_BOTTOM,
    lineHeight: LINE_HEIGHT,
    minHeight: 112,
    includeFontPadding: false,
  },
  linesContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  line: {
    height: 1,
    backgroundColor: '#D9D9D9',
    position: 'absolute',
  },
});

export default MedicalReconCard;
