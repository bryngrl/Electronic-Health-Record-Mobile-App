import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface CDSSModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  category?: string;
  alertText: string;
}

const CDSSModal: React.FC<CDSSModalProps> = ({ visible, onClose, title = "Clinical Guidance", category, alertText }) => {
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
            {category && <Text style={styles.categoryText}>{category.toUpperCase()}</Text>}
            <Text style={styles.alertContent}>{alertText}</Text>
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
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  container: { width: '85%', backgroundColor: '#FFFBEB', borderRadius: 25, padding: 20, elevation: 10, borderWidth: 1, borderColor: '#FDE68A' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#FDE68A', paddingBottom: 10 },
  modalTitle: { color: '#B45309', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
  body: { marginBottom: 20 },
  categoryText: { color: '#D97706', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 5 },
  alertContent: { color: '#333', fontSize: 14, lineHeight: 20 },
  closeBtn: { backgroundColor: '#FDE68A', paddingVertical: 12, borderRadius: 20, alignItems: 'center' },
  closeBtnText: { color: '#B45309', fontWeight: 'bold', fontSize: 14 }
});

export default CDSSModal;