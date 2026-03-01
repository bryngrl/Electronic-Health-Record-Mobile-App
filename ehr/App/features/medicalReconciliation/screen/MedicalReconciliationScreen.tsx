import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, FlatList, Modal, TextInput, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MedicalReconCard from '../component/MedicalReconCard';
import { useMedicalReconLogic } from '../hook/useMedicalReconLogic';
import SweetAlert from '../../../components/SweetAlert';

interface MedicalReconciliationProps {
  onBack: () => void;
}

const MedicalReconciliationScreen: React.FC<MedicalReconciliationProps> = ({ onBack }) => {
  const {
    stageIndex, currentStage, values,
    patientName, setPatientName,
    patientId, setPatientId,
    patients, fetchPatients,
    isLoading, isSubmitting,
    handleUpdate,
    handleNext, isDataEntered, isLastStage,
    alertConfig, closeAlert, resetForm,
    triggerPatientAlert,
    setStageIndex, RECON_STAGES,
    searchText, handleSearch, filteredPatients, 
    showDropdown, setShowDropdown, selectPatient
  } = useMedicalReconLogic();

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    fetchPatients();
    // Simplified date formatting that's safer for React Native
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    setCurrentDate(`${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`);
  }, [fetchPatients]);

  // Dynamic label para sa ika-anim na field
  const getExtraLabel = () => {
    if (stageIndex === 0) return "Administered during stay?";
    if (stageIndex === 1) return "Discontinued on admission?";
    return "Reason for change";
  };

  const handleAlertConfirm = () => {
    if (alertConfig.type === 'success') {
      onBack();
    }
    closeAlert();
  };

  const handleSelectStage = (index: number) => {
    setStageIndex(index);
    setIsMenuVisible(false);
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Medical{"\n"}Reconciliation</Text>
            <Text style={styles.subDate}>{currentDate}</Text>
          </View>
          <TouchableOpacity onPress={() => setIsMenuVisible(true)}>
            <Icon name="more-vert" size={35} color="#035022" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>PATIENT NAME :</Text>
          <TextInput 
            style={styles.pillInput} 
            placeholder="Select Patient" 
            value={searchText} 
            onChangeText={handleSearch} 
          />
          {showDropdown && filteredPatients.length > 0 && (
            <View style={styles.dropdown}>
              {filteredPatients.map(p => (
                <Pressable
                  key={p.id}
                  onPress={() => selectPatient(p)}
                  style={styles.dropItem}
                >
                  <Text>{p.fullName}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* STAGE Indicator */}
        <View style={styles.stageTab}>
          <Text style={styles.stageText}>{currentStage}</Text>
        </View>

        {/* INPUT Cards Flow - Wrapped in Pressable for validation */}
        <Pressable onPress={() => !patientId && triggerPatientAlert()}>
          <View pointerEvents={patientId ? 'auto' : 'none'} style={{ opacity: patientId ? 1 : 0.6 }}>
            <MedicalReconCard label="Medication" value={values.med} onChangeText={(v: string) => handleUpdate('med', v)} />
            <MedicalReconCard label="Dose" value={values.dose} onChangeText={(v: string) => handleUpdate('dose', v)} />
            <MedicalReconCard label="Route" value={values.route} onChangeText={(v: string) => handleUpdate('route', v)} />
            <MedicalReconCard label="Frequency" value={values.freq} onChangeText={(v: string) => handleUpdate('freq', v)} />
            
            {/* Indication is hidden in Stage 3 */}
            {stageIndex !== 2 && (
              <MedicalReconCard label="Indication" value={values.indication} onChangeText={(v: string) => handleUpdate('indication', v)} />
            )}

            <MedicalReconCard label={getExtraLabel()} value={values.extra} onChangeText={(v: string) => handleUpdate('extra', v)} />
          </View>
        </Pressable>

        {/* FOOTER: Disabled until data is entered or while submitting */}
        <TouchableOpacity 
          style={[styles.actionBtn, (!isDataEntered || isSubmitting || !patientId) && styles.btnDisabled]} 
          onPress={handleNext}
          disabled={!isDataEntered || isSubmitting || !patientId}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#035022" />
          ) : (
            <>
              <Text style={styles.btnText}>{isLastStage ? 'SUBMIT' : 'NEXT'}</Text>
              {!isLastStage && <Text style={styles.chevron}>›</Text>}
            </>
          )}
        </TouchableOpacity>

      </ScrollView>

      {/* Options Menu Modal */}
      <Modal transparent visible={isMenuVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>SELECT STAGE</Text>
            
            <FlatList 
              data={RECON_STAGES}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => handleSelectStage(index)}
                >
                  <Text style={[styles.menuItemText, stageIndex === index && styles.activeMenuText]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity 
              style={styles.closeMenuBtn}
              onPress={() => setIsMenuVisible(false)}
            >
              <Text style={styles.closeMenuText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SweetAlert Component */}
      <SweetAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={handleAlertConfirm}
      />

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
          <Text style={styles.navIcon}>🏠</Text><Text style={styles.navIcon}>🔍</Text>
          <View style={styles.fab}><Text style={styles.plusSign}>+</Text></View>
          <Text style={styles.navIcon}>📊</Text><Text style={styles.navIcon}>📅</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { paddingHorizontal: 25, paddingBottom: 130 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40, marginBottom: 25 },
  title: { 
    fontSize: 35, 
    color: '#035022', 
    fontFamily: 'MinionPro-SemiboldItalic',
    lineHeight: 38
  },
  subDate: { color: '#999', fontSize: 13 },
  menuDots: { fontSize: 32, color: '#035022' },
  inputGroup: { marginBottom: 20, zIndex: 100 },
  fieldLabel: { color: '#29A539', fontWeight: 'bold', fontSize: 13, marginBottom: 5 },
  pillInput: { borderWidth: 1, borderColor: '#F0F0F0', borderRadius: 25, height: 45, paddingHorizontal: 20, fontSize: 14, color: '#333' },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 3,
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    zIndex: 99,
  },
  dropItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  stageTab: { backgroundColor: '#E5FFE8', paddingVertical: 10, borderRadius: 20, alignItems: 'center', marginBottom: 20 },
  stageText: { color: '#29A539', fontWeight: 'bold', fontSize: 12 },
  actionBtn: { backgroundColor: '#E5FFE8', height: 50, borderRadius: 25, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#C8E6C9' },
  btnDisabled: { backgroundColor: '#F0F0F0', borderColor: '#E0E0E0' },
  btnText: { color: '#035022', fontWeight: 'bold', fontSize: 16 },
  chevron: { color: '#035022', fontSize: 20, marginLeft: 10 },
  bottomNav: { position: 'absolute', bottom: 0, width: '100%', height: 70, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  navIcon: { fontSize: 22, color: '#035022' },
  fab: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF', elevation: 5, marginTop: -35, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
  plusSign: { fontSize: 24, color: '#29A539', fontWeight: 'bold' },
  
  // Menu Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  menuContainer: { width: '85%', backgroundColor: '#FFF', borderRadius: 25, padding: 25, maxHeight: '80%' },
  menuTitle: { fontSize: 18, fontWeight: 'bold', color: '#035022', marginBottom: 20, textAlign: 'center' },
  menuItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  menuItemText: { fontSize: 16, color: '#333', textAlign: 'center' },
  activeMenuText: { color: '#29A539', fontWeight: 'bold' },
  closeMenuBtn: { marginTop: 20, backgroundColor: '#E5FFE8', paddingVertical: 12, borderRadius: 20, alignItems: 'center' },
  closeMenuText: { color: '#035022', fontWeight: 'bold' }
});

export default MedicalReconciliationScreen;