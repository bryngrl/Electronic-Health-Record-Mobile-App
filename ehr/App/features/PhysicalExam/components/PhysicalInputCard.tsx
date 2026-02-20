import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CDSSModal from '../../../components/CDSSModal';
import SweetAlert from '../../../components/SweetAlert';

interface ExamInputProps {
  label: string;
  value: string;
  disabled: boolean;
  alertText?: string;
  onChangeText: (text: string) => void;
}

const ExamInputCard = ({ label, value, disabled, alertText, onChangeText }: ExamInputProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  
  // LOGIC: The bell is only active if the input is not empty
  const isBellActive = value.trim().length > 0;
  // Keyword match: Backend found a specific clinical risk
  const hasBackendAlert = !!alertText && alertText.trim().length > 0;

  return (
    <View style={[styles.card, disabled && {}]}>
      <View style={styles.cardHeader}><Text style={styles.headerText}>{label}</Text></View>
      <View style={styles.content}>
        <View style={styles.badge}><Text style={styles.badgeText}>Findings</Text></View>
        <Pressable 
          style={styles.inputArea}
          onPress={() => {
            if (disabled) {
              setShowAlert(true);
            }
          }}
        >
          <View style={styles.linesContainer}>
            {[...Array(3)].map((_, i) => <View key={i} style={styles.line} />)}
          </View>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            multiline
            editable={!disabled}
            placeholder="Type findings..."
            pointerEvents={disabled ? 'none' : 'auto'}
          />
        </Pressable>
        
        {/* The Bell: Faded/Disabled by default, Gold/Active only when typing */}
        <TouchableOpacity 
          style={[
            styles.bellBtn, 
            !isBellActive && { opacity: 0.3 }, // Visual feedback for inactive state
            hasBackendAlert && styles.activeBell // Gold state for matched risks
          ]} 
          onPress={() => isBellActive && setModalVisible(true)}
          disabled={!isBellActive} // Strictly prevents interaction when empty
        >
          <Icon 
            name={isBellActive ? "notifications-active" : "notifications"} 
            size={22} 
            color={hasBackendAlert ? "#B45309" : (isBellActive ? "#B45309" : "#E5E7EB")} 
          />
        </TouchableOpacity>
      </View>

      <CDSSModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        category={label} 
        alertText={alertText || "Analyzing findings for potential risks..."} 
      />

      <SweetAlert
        visible={showAlert}
        title="Patient Required"
        message="Please select a patient first in the search bar before entering findings."
        type="error"
        onConfirm={() => setShowAlert(false)}
        confirmText="OK"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFBEB', borderRadius: 25, marginBottom: 20, overflow: 'hidden', elevation: 2, borderWidth: 1, borderColor: '#FEF3C7' },
  cardHeader: { backgroundColor: '#FEF3C7', paddingVertical: 6, alignItems: 'center' },
  headerText: { color: '#D97706', fontWeight: 'bold', fontSize: 11 },
  content: { padding: 15, flexDirection: 'row' },
  badge: { backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 15, marginRight: 10, alignSelf: 'flex-start' },
  badgeText: { color: '#D97706', fontSize: 10, fontWeight: 'bold' },
  inputArea: { flex: 1, minHeight: 100, position: 'relative' },
  input: { fontSize: 14, color: '#333', textAlignVertical: 'top', flex: 1, zIndex: 2 },
  linesContainer: { ...StyleSheet.absoluteFillObject, paddingTop: 28 },
  line: { height: 1, backgroundColor: '#FEF3C7', marginBottom: 28, marginRight: 10 },
  bellBtn: { alignSelf: 'flex-end', backgroundColor: '#FEF3C7', borderRadius: 20, padding: 8 },
  activeBell: { backgroundColor: '#FDE68A', borderWidth: 1, borderColor: '#B45309' } 
});

export default ExamInputCard;