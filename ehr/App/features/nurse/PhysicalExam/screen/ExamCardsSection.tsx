import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import ExamInputCard from '../components/PhysicalInputCard';

interface ExamCardsSectionProps {
  formData: Record<string, string>;
  selectedPatientId: string | null;
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
  isModified: boolean;
  readOnly?: boolean;
  onBack?: () => void;
}

const ExamCardsSection: React.FC<ExamCardsSectionProps> = ({
  formData,
  selectedPatientId,
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
  isModified,
  readOnly = false,
  onBack,
}) => {
  const patientRequired = () =>
    !selectedPatientId && showAlert('Patient Required', 'Please select a patient first.');

  const cards = [
    { label: 'GENERAL APPEARANCE', field: 'general_appearance' },
    { label: 'SKIN',               field: 'skin_condition' },
    { label: 'EYES',               field: 'eye_condition' },
    { label: 'ORAL CAVITY',        field: 'oral_condition' },
    { label: 'CARDIOVASCULAR',     field: 'cardiovascular' },
    { label: 'ABDOMEN',            field: 'abdomen_condition' },
    { label: 'EXTREMITIES',        field: 'extremities' },
    { label: 'NEUROLOGICAL',       field: 'neurological' },
  ];

  return (
    <>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>PHYSICAL EXAMINATION</Text>
      </View>

      {cards.map(({ label, field }) => (
        <ExamInputCard
          key={field}
          label={label}
          value={formData[field] ?? ''}
          disabled={!selectedPatientId || isNA || readOnly}
          dataAlert={getBackendAlert(field)}
          alertSeverity={getBackendSeverity(field)}
          onChangeText={t => updateField(field, t)}
          onDisabledPress={patientRequired}
        />
      ))}

      {!readOnly ? (
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={[
              styles.cdssBtn,
              !isModified && {
                backgroundColor: theme.buttonDisabledBg,
                borderColor: theme.buttonDisabledBorder,
              },
            ]}
            onPress={handleCDSSPress}
            disabled={!isModified}
          >
            <Text
              style={[
                styles.cdssText,
                !isModified && { color: theme.textMuted },
              ]}
            >
              CDSS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.submitBtn,
              !isModified && {
                backgroundColor: theme.buttonDisabledBg,
                borderColor: theme.buttonDisabledBorder,
              },
            ]}
            onPress={handleSave}
            disabled={!isModified}
          >
            <Text
              style={[
                styles.submitText,
                !isModified && { color: theme.textMuted },
              ]}
            >
              SUBMIT
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

export default ExamCardsSection;
