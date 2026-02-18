import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

interface SweetAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const SweetAlert: React.FC<SweetAlertProps> = ({ visible, title, message, onCancel, onConfirm }) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          <View style={styles.errorIconCircle}>
            <Text style={styles.errorX}>✕</Text>
          </View>
          <Text style={styles.alertTitle}>{title}</Text>
          <Text style={styles.alertMessage}>{message}</Text>
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelBtnText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
              <Text style={styles.confirmBtnText}>DELETE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  alertBox: { width: '85%', backgroundColor: '#fff', borderRadius: 25, padding: 25, alignItems: 'center' },
  errorIconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#d93025', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  errorX: { color: '#fff', fontSize: 35, fontWeight: 'bold' },
  alertTitle: { fontSize: 22, fontWeight: 'bold', color: '#d93025', marginBottom: 15 },
  alertMessage: { fontSize: 14, color: '#5f6368', textAlign: 'center', marginBottom: 25, lineHeight: 20 },
  btnRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  cancelBtn: { flex: 1, height: 45, borderWidth: 1, borderColor: '#3c4043', borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  cancelBtnText: { color: '#3c4043', fontWeight: 'bold' },
  confirmBtn: { flex: 1, height: 45, borderWidth: 1, borderColor: '#d93025', borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  confirmBtnText: { color: '#d93025', fontWeight: 'bold' },
});

export default SweetAlert;