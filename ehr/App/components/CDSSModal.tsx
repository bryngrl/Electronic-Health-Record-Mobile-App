import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface CDSSModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  category?: string;
  alertText: string;
}

const CDSSModal: React.FC<CDSSModalProps> = ({
  visible,
  onClose,
  title = 'Clinical Guidance',
  category,
  alertText,
}) => {
  const renderFormattedText = (text: string) => {
    if (!text || typeof text !== 'string') return null;
    // Split by " | " or newlines in case there are multiple concatenated alerts
    const lines = text.split(/ \| |\n/);

    return lines.map((line, index) => {
      if (!line.trim()) return null;

      const upperLine = line.toUpperCase();
      let titleColor = '#333'; // Default black for text
      let alertTitle = '';
      let alertDesc = line;

      // 1. Identify Severity and set Title Color
      if (
        line.includes('🔴') ||
        upperLine.includes('CRITICAL') ||
        upperLine.includes('SEVERE')
      ) {
        titleColor = '#C62828'; // Deep Red
      } else if (
        line.includes('🟠') ||
        upperLine.includes('WARNING') ||
        upperLine.includes('LOW')
      ) {
        titleColor = '#E65100'; // Deep Orange
      } else if (
        line.includes('✓') ||
        upperLine.includes('NORMAL') ||
        upperLine.includes('INFO') ||
        upperLine.includes('SUCCESS')
      ) {
        titleColor = '#2E7D32'; // Deep Green
      }

      // 2. Try to split into Title and Description at the colon
      const splitIndex = line.indexOf(':');
      if (splitIndex !== -1) {
        alertTitle = line.substring(0, splitIndex + 1);
        alertDesc = line.substring(splitIndex + 1);
      } else {
        // Fallback: If no colon, try to color the first part if it has an emoji
        const words = line.split(' ');
        if (
          words.length > 1 &&
          (line.includes('🔴') || line.includes('🟠') || line.includes('✓'))
        ) {
          alertTitle = words[0] + ' ' + (words[1] || '') + ' ';
          alertDesc = words.slice(2).join(' ');
        } else {
          alertTitle = line;
          alertDesc = '';
        }
      }

      return (
        <Text key={index} style={styles.alertContent}>
          <Text style={{ color: titleColor, fontWeight: 'bold' }}>
            {alertTitle}
          </Text>
          <Text style={{ color: '#333' }}>{alertDesc}</Text>
          {index < lines.length - 1 ? '\n\n' : ''}
        </Text>
      );
    });
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Icon name="psychology" size={24} color="#B45309" />
            <Text style={styles.modalTitle}>{title}</Text>
          </View>
          <View style={styles.body}>
            {category && (
              <Text style={styles.categoryText}>{category.toUpperCase()}</Text>
            )}
            <View>{renderFormattedText(alertText)}</View>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>DISMISS</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: '#FFFBEB',
    borderRadius: 25,
    padding: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    paddingBottom: 10,
  },
  modalTitle: {
    color: '#B45309',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  body: { marginBottom: 20 },
  categoryText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 5,
  },
  alertContent: { color: '#333', fontSize: 14, lineHeight: 20 },
  closeBtn: {
    backgroundColor: '#FDE68A',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  closeBtnText: { color: '#B45309', fontWeight: 'bold', fontSize: 14 },
});

export default CDSSModal;
