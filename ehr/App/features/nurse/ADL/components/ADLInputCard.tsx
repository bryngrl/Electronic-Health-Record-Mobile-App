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

const alert1 = require('@assets/icons/alert_bell_icon.png');

interface ExamInputProps {
  label: string;
  value: string;
  disabled: boolean;
  alertText?: string;
  onChangeText: (text: string) => void;
  readOnly?: boolean;
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
  readOnly = false,
  onDisabledPress,
}: ExamInputProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [inputHeight, setInputHeight] = useState(
    4 * LINE_HEIGHT + INPUT_PADDING_BOTTOM,
  );

  const isAlertActive = value.trim().length > 0 && value !== 'N/A';
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
    <View style={[styles.card, (disabled || readOnly) && { opacity: 0.9 }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.headerText}>{label}</Text>
      </View>

      <View style={styles.content}>
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
            onChangeText={(t) => { if (!readOnly) onChangeText(t); }}
            multiline
            editable={!disabled && !readOnly}
            placeholder={readOnly ? "No findings recorded" : "Type findings..."}
            placeholderTextColor="#999"
            onContentSizeChange={e => {
              setInputHeight(e.nativeEvent.contentSize.height);
            }}
          />
        </Pressable>

        <TouchableOpacity
          style={[
            styles.alertIcon,
            { opacity: (isAlertActive || hasBackendAlert) ? 1.0 : 0.3 },
            hasBackendAlert && styles.activeAlert,
          ]}
          onPress={() => (isAlertActive || hasBackendAlert) && setModalVisible(true)}
          disabled={!isAlertActive && !hasBackendAlert}
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
    fontSize: 13,
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
