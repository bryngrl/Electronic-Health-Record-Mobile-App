import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import ADLInputCard from '../components/ADLInputCard';
import { ADL_CARDS } from './constants';

interface ADLCardsSectionProps {
  formData: Record<string, string>;
  selectedPatient: any | null;
  isNA: boolean;
  getBackendAlert: (field: string) => string | null;
  getBackendSeverity: (field: string) => string | null;
  updateField: (field: string, val: string) => void;
  showAlert: (title: string, message: string) => void;
  styles: any;
  theme: any;
  handleCDSSPress: () => void;
  handleSave: () => void;
  isDataEntered: boolean;
  adlId: number | null;
  isExistingRecord: boolean;
  readOnly?: boolean;
  onBack?: () => void;
}

const ADLCardsSection: React.FC<ADLCardsSectionProps> = ({
  formData,
  selectedPatient,
  isNA,
  getBackendAlert,
  getBackendSeverity,
  updateField,
  showAlert,
  styles,
  theme,
  handleCDSSPress,
  handleSave,
  isDataEntered,
  adlId,
  isExistingRecord,
  readOnly = false,
  onBack,
}) => {
  const patientRequired = () =>
    !selectedPatient && showAlert('Patient Required', 'Please select a patient first.');

  return (
    <>
      {ADL_CARDS.map(({ label, field }) => (
        <ADLInputCard
          key={field}
          label={label}
          value={formData[field] ?? ''}
          disabled={!selectedPatient || isNA || readOnly}
          dataAlert={getBackendAlert(field)}
          alertSeverity={getBackendSeverity(field)}
          onChangeText={val => updateField(field, val)}
          onDisabledPress={patientRequired}
        />
      ))}

      {!readOnly ? (
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={[
              styles.cdssBtn,
              (!selectedPatient || !isDataEntered) && {
                backgroundColor: theme.buttonDisabledBg,
                borderColor: theme.buttonDisabledBorder,
              },
            ]}
            onPress={handleCDSSPress}
            disabled={!selectedPatient || !isDataEntered}
          >
            <Text
              style={[
                styles.cdssText,
                (!selectedPatient || !isDataEntered) && { color: theme.textMuted },
              ]}
            >
              CDSS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.submitBtn,
              !selectedPatient && {
                backgroundColor: theme.buttonDisabledBg,
                borderColor: theme.buttonDisabledBorder,
              },
            ]}
            onPress={handleSave}
            disabled={!selectedPatient}
          >
            <Text
              style={[
                styles.submitText,
                !selectedPatient && { color: theme.textMuted },
              ]}
            >
              {isExistingRecord ? 'UPDATE' : 'SUBMIT'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.submitBtn} onPress={onBack}>
          <Text style={[styles.submitText, { color: theme.primary }]}>CLOSE</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 100 }} />
    </>
  );
};

export default ADLCardsSection;
