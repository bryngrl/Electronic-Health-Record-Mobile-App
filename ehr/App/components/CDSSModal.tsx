import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface CDSSModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  category?: string;
  alertText: string;
  severity?: string;
  loading?: boolean;
  bulletFormat?: boolean;
}

const CDSSModal: React.FC<CDSSModalProps> = ({
  visible,
  onClose,
  title = 'Clinical Guidance',
  category,
  alertText,
  severity,
  loading = false,
  bulletFormat = false,
}) => {
  const getSeverityStyle = (sev?: string) => {
    switch ((sev || '').toUpperCase()) {
      case 'CRITICAL': return { bg: '#FDECEA', text: '#C62828', label: 'CRITICAL' };
      case 'WARNING':  return { bg: '#FFF3E0', text: '#E65100', label: 'WARNING' };
      case 'INFO':     return { bg: '#E8F5E9', text: '#2E7D32', label: 'INFO' };
      default:         return null;
    }
  };

  const severityStyle = getSeverityStyle(severity);
  const renderFormattedText = (text: string) => {
    if (!text) return null;
    
    // Ensure we are working with a string
    const stringText = Array.isArray(text) ? text.join('\n') : String(text);
    
    const rawLines = bulletFormat
      ? stringText.split(/[\n;]+| \| /).filter(l => l.trim())
      : stringText.split(/[\n;]| \| /).filter(l => l.trim());
    
    // Deduplicate lines while preserving order
    const lines = Array.from(new Set(rawLines));
    
    const isMultiple = bulletFormat && lines.length > 1;

    return lines.map((line, index) => {
      const upperLine = line.toUpperCase();
      let titleColor = '#333';
      let alertTitle = '';
      let alertDesc = line;

      if (line.includes('🔴') || upperLine.includes('CRITICAL') || upperLine.includes('SEVERE')) {
        titleColor = '#C62828';
      } else if (line.includes('🟠') || upperLine.includes('WARNING') || upperLine.includes('LOW')) {
        titleColor = '#E65100';
      } else if (line.includes('✓') || upperLine.includes('NORMAL') || upperLine.includes('INFO') || upperLine.includes('SUCCESS')) {
        titleColor = '#2E7D32';
      }

      const splitIndex = line.indexOf(':');
      if (splitIndex !== -1) {
        alertTitle = line.substring(0, splitIndex + 1);
        alertDesc = line.substring(splitIndex + 1);
      } else {
        const words = line.split(' ');
        if (words.length > 1 && (line.includes('🔴') || line.includes('🟠') || line.includes('✓'))) {
          alertTitle = words[0] + ' ' + (words[1] || '') + ' ';
          alertDesc = words.slice(2).join(' ');
        } else {
          alertTitle = line;
          alertDesc = '';
        }
      }

      return (
        <View key={index} style={isMultiple ? styles.bulletRow : undefined}>
          {isMultiple && <Text style={[styles.bullet, { color: titleColor }]}>{'•'}</Text>}
          <Text style={[styles.alertContent, isMultiple && styles.bulletText]}>
            <Text style={{ color: titleColor, fontWeight: 'bold' }}>{alertTitle}</Text>
            <Text style={{ color: '#333' }}>{alertDesc}</Text>
            {!isMultiple && index < lines.length - 1 ? '\n\n' : ''}
          </Text>
        </View>
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
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#B45309" />
                <Text style={styles.loadingText}>Analyzing...</Text>
              </View>
            ) : (
              <>
                {severityStyle && (
                  <View style={[styles.severityBadge, { backgroundColor: severityStyle.bg }]}>
                    <Text style={[styles.severityText, { color: severityStyle.text }]}>
                      [{severityStyle.label}]
                    </Text>
                  </View>
                )}
                <View>{renderFormattedText(alertText)}</View>
              </>
            )}
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: '#B45309',
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  categoryText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 5,
  },
  alertContent: { color: '#333', fontSize: 14, lineHeight: 20, flexShrink: 1 },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  normalRow: {
    marginBottom: 10,
  },
  textContent: {
    flex: 1,
  },
  bullet: {
    fontSize: 16,
    lineHeight: 20,
    marginRight: 8,
    fontWeight: 'bold',
  },
  bulletText: {
    flex: 1,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 8,
  },
  severityText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  closeBtn: {
    backgroundColor: '#FDE68A',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  closeBtnText: { color: '#B45309', fontWeight: 'bold', fontSize: 14 },
});

export default CDSSModal;
