import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Theme constants aligned with PhysicalExamScreen
const THEME_GREEN = '#1B5E20';
const LIGHT_GREEN_BG = '#DCFCE7'; 
const BORDER_GREEN = '#A7F3D0';

interface CDSSModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  category?: string; // This will display the ADPIE phase
  alertText: string | null;
}

const CDSSGuidanceModal: React.FC<CDSSModalProps> = ({ 
  visible, 
  onClose, 
  title = "Clinical Guidance", 
  category, 
  alertText 
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.container}>
          {/* Header section with Psychology/AI icon */}
          <View style={styles.header}>
            <Icon name="info-outline" size={24} color={THEME_GREEN} />
            <Text style={styles.modalTitle}>{title}</Text>
          </View>

          <View style={styles.body}>
            {/* Phase indicator (Diagnosis, Planning, etc.) */}
            {category && <Text style={styles.categoryText}>{category.toUpperCase()} PHASE</Text>}
            <Text style={styles.alertContent}>
              {alertText || "No specific risks detected. Continue documenting findings to receive real-time support."}
            </Text>
          </View>

          {/* Action button styled to match your NEXT/SUBMIT buttons */}
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
    alignItems: 'center' 
  },
  container: { 
    width: '85%', 
    backgroundColor: '#F0FDF4', // Very light green background
    borderRadius: 25, 
    padding: 20, 
    elevation: 10, 
    borderWidth: 1, 
    borderColor: BORDER_GREEN 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: BORDER_GREEN, 
    paddingBottom: 10 
  },
  modalTitle: { 
    color: THEME_GREEN, 
    fontWeight: 'bold', 
    fontSize: 16, 
    marginLeft: 10,
    fontFamily: 'serif' 
  },
  body: { marginBottom: 20 },
  categoryText: { 
    color: '#059669', 
    fontSize: 10, 
    fontWeight: 'bold', 
    letterSpacing: 1, 
    marginBottom: 5 
  },
  alertContent: { 
    color: '#374151', 
    fontSize: 14, 
    lineHeight: 20 
  },
  closeBtn: { 
    backgroundColor: LIGHT_GREEN_BG, 
    paddingVertical: 12, 
    borderRadius: 20, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME_GREEN
  },
  closeBtnText: { 
    color: THEME_GREEN, 
    fontWeight: 'bold', 
    fontSize: 14 
  }
});

export default CDSSGuidanceModal;