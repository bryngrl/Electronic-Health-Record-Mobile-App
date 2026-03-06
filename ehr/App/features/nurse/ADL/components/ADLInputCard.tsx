import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Image,
} from 'react-native';
import CDSSModal from '@components/CDSSModal';
import SweetAlert from '@components/SweetAlert';

const alert1 = require('@assets/icons/alert_bell_icon.png');

interface ExamInputProps {
  label: string;
  value: string;
  disabled: boolean;
  alertText?: string;
  onChangeText: (text: string) => void;
  onDisabledPress?: () => void;
}

const LINE_HEIGHT = 28;
const INPUT_PADDING_BOTTOM = 65;

const ADLInputCard = ({
  label,
  value,
  disabled,
  alertText,
  onChangeText,
  onDisabledPress,
}: ExamInputProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputHeight, setInputHeight] = useState(
    4 * LINE_HEIGHT + INPUT_PADDING_BOTTOM,
  );

  // LOGIC: The bell is only active if the input is not empty
  const isAlertActive = value.trim().length > 0 && value !== 'N/A';
  // Keyword match: Backend found a specific clinical risk
  const hasBackendAlert = !!alertText && alertText.trim().length > 0;

  const visibleTypingHeight = Math.max(0, inputHeight - INPUT_PADDING_BOTTOM);
  const numLines = Math.max(
    4,
    Math.ceil(visibleTypingHeight / LINE_HEIGHT) + 2,
  );

  const renderLines = () => {
    const lines = [];
    for (let i = 0; i < numLines; i++) {
      const topPosition = (i + 1) * LINE_HEIGHT;
      const isNearAlert = i >= numLines - 2;

      lines.push(
        <View
          key={i}
          style={[
            styles.line,
            {
              top: topPosition,
              left: 10,
              right: isNearAlert ? 60 : 10,
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
        {/* Badge is stacked above the input to allow full-width text below */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Findings</Text>
        </View>

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
            placeholder="Type findings..."
            pointerEvents={disabled ? 'none' : 'auto'}
            onContentSizeChange={e => {
              setInputHeight(e.nativeEvent.contentSize.height);
            }}
          />
        </Pressable>

        {/* The Alert Icon Button */}
        <TouchableOpacity
          style={[
            styles.alertIcon,
            { opacity: isAlertActive ? 1.0 : 0.3 },
            hasBackendAlert && styles.activeAlert,
          ]}
          onPress={() => isAlertActive && !disabled && setModalVisible(true)}
          disabled={!isAlertActive || disabled}
        >
          <Image source={alert1} style={styles.alertImage} />
        </TouchableOpacity>
      </View>

      <CDSSModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        category={label}
        alertText={alertText || 'Analyzing findings for potential risks...'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFAED',
    borderRadius: 25,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
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
    fontSize: 14, // Copied from ExamInputCard
  },
  content: {
    padding: 15,
    position: 'relative',
  },
  badge: {
    backgroundColor: '#FFEEC2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    alignSelf: 'flex-start',
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeText: {
    color: '#EDB62C',
    fontSize: 13, // Copied from ExamInputCard
    fontFamily: 'AlteHaasGroteskBold',
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
  alertIcon: {
    position: 'absolute',
    bottom: 10,
    right: 15,
    backgroundColor: '#FEF3C7',
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  alertImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    resizeMode: 'cover',
  },
  activeAlert: {
    backgroundColor: '#FDE68A',
  },
});

export default ADLInputCard;
