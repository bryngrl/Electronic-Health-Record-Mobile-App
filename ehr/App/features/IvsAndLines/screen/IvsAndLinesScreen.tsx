import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  BackHandler,
  Image,
} from 'react-native';

const backArrow = require('../../../../assets/icons/back_arrow.png');
import useIvsAndLinesData from '../hook/useIvsAndLinesData';
import DataCard from '../components/DataCard';
import PatientSearchBar from '../../../components/PatientSearchBar';
import SweetAlert from '../../../components/SweetAlert';

interface IvsAndLinesScreenProps {
  onBack: () => void;
}

const IvsAndLinesScreen: React.FC<IvsAndLinesScreenProps> = ({ onBack }) => {
  // Use the custom hook
  const {
    patientName,
    setPatientName,
    setSelectedPatientId,
    selectedPatientId,
    ivFluid,
    setIvFluid,
    rate,
    setRate,
    site,
    setSite,
    status,
    setStatus,
    handleSubmit,
    isSubmitting,
  } = useIvsAndLinesData();

  // SweetAlert State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const handleBackPress = useCallback(() => {
    onBack();
    return true;
  }, [onBack]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    return () => backHandler.remove();
  }, [handleBackPress]);

  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
  ) => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const showDisabledAlert = () => {
    showAlert(
      'Patient Required',
      'Please select a patient first in the search bar before filling out the form.',
      'error',
    );
  };

  const handleFormSubmit = async () => {
    if (!selectedPatientId) {
      showDisabledAlert();
      return;
    }

    try {
      const result = await handleSubmit();
      if (result.action === 'update') {
        showAlert(
          'Edit Success',
          'IVs and Lines record updated successfully!',
          'success',
        );
      } else {
        showAlert(
          'Success',
          'IVs and Lines record saved successfully!',
          'success',
        );
      }
    } catch (error: any) {
      showAlert(
        'Submission Failed',
        error.message || 'Something went wrong. Please try again.',
        'error',
      );
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        {/* Header and Date */}
        <View style={styles.headerContainer}>
          <Text style={styles.titleText}>IVs and Lines</Text>
          <Text style={styles.dateText}>{formatDate()}</Text>
        </View>

        {/* Patient Name Section */}
        <PatientSearchBar
          onPatientSelect={(id, name) => {
            setSelectedPatientId(id);
            setPatientName(name);
          }}
          initialPatientName={patientName}
        />

        {/* Form Sections */}
        <DataCard
          badgeText="IV FLUID"
          value={ivFluid}
          onChangeText={setIvFluid}
          placeholder="e.g., D5W, NS, LR"
          disabled={!selectedPatientId}
          onDisabledPress={showDisabledAlert}
        />
        <DataCard
          badgeText="RATE"
          value={rate}
          onChangeText={setRate}
          placeholder="e.g., 100 ml/hr"
          disabled={!selectedPatientId}
          onDisabledPress={showDisabledAlert}
        />
        <DataCard
          badgeText="SITE"
          value={site}
          onChangeText={setSite}
          placeholder="e.g., Left hand"
          disabled={!selectedPatientId}
          onDisabledPress={showDisabledAlert}
        />
        <DataCard
          badgeText="STATUS"
          value={status}
          onChangeText={setStatus}
          placeholder="e.g., Running"
          disabled={!selectedPatientId}
          onDisabledPress={showDisabledAlert}
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (isSubmitting || !selectedPatientId) && { opacity: 0.7 },
          ]}
          onPress={handleFormSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#E5FFE8" />
          ) : (
            <Text style={styles.submitButtonText}>SUBMIT</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <SweetAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={() => setAlertConfig({ ...alertConfig, visible: false })}
        onCancel={() => setAlertConfig({ ...alertConfig, visible: false })}
        confirmText="OK"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 100,
  },
  headerContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  backBtn: {
    marginTop: 12,
    marginRight: 10,
  },
  backIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  titleText: {
    marginBottom: -10,
    fontSize: 35,
    color: '#035022',
    fontFamily: 'MinionPro-SemiboldItalic',
  },
  dateText: {
    color: '#9B9B9B',
    fontSize: 13,
    fontFamily: 'AlteHaasGroteskBold',
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: '#EAF8EF',
    borderColor: '#29A539',
    borderWidth: 1.5,
    borderRadius: 24,
    paddingVertical: 15,
    marginTop: 30,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  submitButtonText: {
    color: '#035022',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
  },
});

export default IvsAndLinesScreen;
