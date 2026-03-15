import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import apiClient from '../../../api/apiClient';

interface Props {
  patientId: number;
  patientName: string;
  typeKey: string;
  updateTime: string;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  'vital-signs':   'Vital Signs',
  'physical-exam': 'Physical Exam',
  'lab-values':    'Laboratory Values',
  'intake-output': 'Intake & Output',
  'adl':           'Activities of Daily Living',
  'ivs-lines':     'IVs & Lines',
  'medication':    'Medical Administration',
};

// ─── Field card (mimics nurse input cards - disabled state) ──────────────────

const ROField = ({
  label,
  value,
  alert,
  half = false,
  multiline = false,
  unit,
}: {
  label: string;
  value?: any;
  alert?: any;
  half?: boolean;
  multiline?: boolean;
  unit?: string;
}) => (
  <View style={[styles.fieldCard, half && styles.halfCard]}>
    <View style={styles.fieldHeader}>
      <Text style={styles.fieldLabel}>{label.toUpperCase()}</Text>
    </View>
    <View style={[styles.fieldBody, multiline && styles.fieldBodyMultiline]}>
      {unit ? (
        <View style={styles.unitRow}>
          <Text style={styles.fieldValue}>{value != null && value !== '' ? String(value) : 'N/A'}</Text>
          <View style={styles.unitBadge}>
            <Text style={styles.unitText}>{unit}</Text>
          </View>
        </View>
      ) : (
        <Text style={[styles.fieldValue, multiline && styles.fieldValueMultiline]}>
          {value != null && value !== '' ? String(value) : 'N/A'}
        </Text>
      )}
    </View>
    {alert ? (
      <View style={styles.alertRow}>
        <Icon name="warning" size={11} color="#D32F2F" />
        <Text style={styles.alertText}> {alert}</Text>
      </View>
    ) : null}
  </View>
);

// ─── Lab card (2-col with result + normal range header) ──────────────────────

const LabCard = ({ label, value, alert }: { label: string; value?: any; alert?: any }) => (
  <View style={styles.labCard}>
    <View style={styles.labHeader}>
      <Text style={styles.labHeaderText}>{label}</Text>
    </View>
    <View style={styles.labResultHeader}>
      <Text style={styles.labSubLabel}>RESULT</Text>
    </View>
    <View style={styles.labBody}>
      <Text style={[styles.labValue, alert ? styles.labValueAlert : null]}>
        {value != null && value !== '' ? String(value) : 'N/A'}
      </Text>
      {alert ? (
        <Text style={styles.labAlertText}>{alert}</Text>
      ) : null}
    </View>
  </View>
);

// ─── ADPIE / Nursing Diagnosis ───────────────────────────────────────────────

const DiagnosisBlock = ({ data }: { data: any }) => {
  const diagnosis = data?.nursing_diagnoses?.diagnosis ?? data?.diagnosis;
  if (!diagnosis) return null;
  return (
    <View style={styles.diagnosisBlock}>
      <Text style={styles.diagnosisLabel}>NURSING DIAGNOSIS</Text>
      <Text style={styles.diagnosisText}>{diagnosis}</Text>
    </View>
  );
};

// ─── Content per type_key ────────────────────────────────────────────────────

const renderData = (typeKey: string, data: any) => {
  switch (typeKey) {
    case 'vital-signs':
      return (
        <>
          <View style={styles.row}>
            <ROField label="Temperature" value={data.temperature ? `${data.temperature}°C` : null} alert={data.temperature_alert} half />
            <ROField label="Heart Rate"  value={data.hr ? `${data.hr} bpm` : null}                 alert={data.hr_alert}          half />
          </View>
          <View style={styles.row}>
            <ROField label="Resp Rate"  value={data.rr ? `${data.rr} bpm` : null} alert={data.rr_alert} half />
            <ROField label="SpO2"       value={data.spo2 ? `${data.spo2}%` : null} alert={data.spo2_alert} half />
          </View>
          <ROField label="Blood Pressure" value={data.bp} alert={data.bp_alert} />
          <DiagnosisBlock data={data} />
        </>
      );

    case 'physical-exam':
      return (
        <>
          <ROField label="General Appearance" value={data.general_appearance} alert={data.general_appearance_alert} multiline />
          <ROField label="Skin"               value={data.skin_condition}      alert={data.skin_alert}               multiline />
          <ROField label="Eyes"               value={data.eye_condition}       alert={data.eye_alert}                multiline />
          <ROField label="Oral"               value={data.oral_condition}      alert={data.oral_alert}               multiline />
          <ROField label="Cardiovascular"     value={data.cardiovascular}      alert={data.cardiovascular_alert}     multiline />
          <ROField label="Abdomen"            value={data.abdomen_condition}   alert={data.abdomen_alert}            multiline />
          <ROField label="Extremities"        value={data.extremities}         alert={data.extremities_alert}        multiline />
          <ROField label="Neurological"       value={data.neurological}        alert={data.neurological_alert}       multiline />
          <DiagnosisBlock data={data} />
        </>
      );

    case 'intake-output':
      return (
        <>
          <ROField label="Day No." value={data.day_no} />
          <ROField label="Oral Intake"      value={data.oral_intake}      unit="mL" />
          <ROField label="IV Fluids Volume" value={data.iv_fluids_volume} unit="mL" />
          <ROField label="IV Fluids Type"   value={data.iv_fluids_type} />
          <ROField label="Urine Output"     value={data.urine_output}     unit="mL" />
          {data.alert ? (
            <View style={styles.ioAlertBox}>
              <Icon name="warning" size={14} color="#D32F2F" />
              <Text style={styles.ioAlertText}> {data.alert}</Text>
            </View>
          ) : null}
          <DiagnosisBlock data={data} />
        </>
      );

    case 'lab-values':
      return (
        <>
          <View style={styles.labGrid}>
            <LabCard label="WBC"         value={data.wbc_result}         alert={data.wbc_alert} />
            <LabCard label="RBC"         value={data.rbc_result}         alert={data.rbc_alert} />
            <LabCard label="HGB"         value={data.hgb_result}         alert={data.hgb_alert} />
            <LabCard label="HCT"         value={data.hct_result}         alert={data.hct_alert} />
            <LabCard label="Platelets"   value={data.platelets_result}   alert={data.platelets_alert} />
            <LabCard label="Neutrophils" value={data.neutrophils_result} alert={data.neutrophils_alert} />
            <LabCard label="Lymphocytes" value={data.lymphocytes_result} alert={data.lymphocytes_alert} />
            <LabCard label="Monocytes"   value={data.monocytes_result}   alert={data.monocytes_alert} />
            <LabCard label="Eosinophils" value={data.eosinophils_result} alert={data.eosinophils_alert} />
            <LabCard label="Basophils"   value={data.basophils_result}   alert={data.basophils_alert} />
          </View>
          <DiagnosisBlock data={data} />
        </>
      );

    case 'adl':
      return (
        <>
          <ROField label="Mobility"      value={data.mobility_assessment}       alert={data.mobility_alert}       multiline />
          <ROField label="Hygiene"       value={data.hygiene_assessment}        alert={data.hygiene_alert}        multiline />
          <ROField label="Toileting"     value={data.toileting_assessment}      alert={data.toileting_alert}      multiline />
          <ROField label="Feeding"       value={data.feeding_assessment}        alert={data.feeding_alert}        multiline />
          <ROField label="Hydration"     value={data.hydration_assessment}      alert={data.hydration_alert}      multiline />
          <ROField label="Sleep Pattern" value={data.sleep_pattern_assessment}  alert={data.sleep_pattern_alert}  multiline />
          <ROField label="Pain Level"    value={data.pain_level_assessment}     alert={data.pain_level_alert}     multiline />
          <DiagnosisBlock data={data} />
        </>
      );

    case 'ivs-lines':
      return (
        <>
          <View style={styles.row}>
            <ROField label="IV Fluid" value={data.iv_fluid} half />
            <ROField label="Rate"     value={data.rate}     half />
          </View>
          <View style={styles.row}>
            <ROField label="Site"   value={data.site}   half />
            <ROField label="Status" value={data.status} half />
          </View>
          <DiagnosisBlock data={data} />
        </>
      );

    case 'medication': {
      const meds = Array.isArray(data.medications) ? data.medications
        : Array.isArray(data) ? data : [data];
      return (
        <>
          {meds.map((med: any, i: number) => (
            <View key={i} style={i > 0 ? { marginTop: 8 } : undefined}>
              {meds.length > 1 && (
                <View style={styles.medHeader}>
                  <Text style={styles.medHeaderText}>MEDICATION {i + 1}</Text>
                </View>
              )}
              <ROField label="Medication" value={med.medication} />
              <View style={styles.row}>
                <ROField label="Dose"  value={med.dose}  half />
                <ROField label="Route" value={med.route} half />
              </View>
              <ROField label="Frequency" value={med.frequency} />
              <ROField label="Comments"  value={med.comments} multiline />
            </View>
          ))}
        </>
      );
    }

    default:
      return (
        <>
          {Object.entries(data)
            .filter(([k]) => !k.endsWith('_at') && k !== 'id' && k !== 'patient_id' && k !== 'nursing_diagnoses')
            .map(([k, v]) => (
              <ROField key={k} label={k.replace(/_/g, ' ')} value={v != null ? String(v) : null} />
            ))}
          <DiagnosisBlock data={data} />
        </>
      );
  }
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function DoctorReadOnlyPanel({ patientId, patientName, typeKey, updateTime, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await apiClient.get(`/doctor/patient/${patientId}/forms/${typeKey}`);
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        setData(list.length > 0 ? list[0] : null);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [patientId, typeKey]);

  const title = CATEGORY_LABELS[typeKey] ?? typeKey;

  return (
    <View style={styles.panel}>
      {/* Panel header */}
      <View style={styles.panelHeader}>
        <View style={styles.panelHeaderLeft}>
          <Text style={styles.panelTitle}>{title}</Text>
          <Text style={styles.panelSubtitle}>{patientName} · {updateTime}</Text>
          <View style={styles.readOnlyBadge}>
            <Icon name="lock" size={10} color="#035022" />
            <Text style={styles.readOnlyText}> READ ONLY</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Icon name="close" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Panel body */}
      {loading ? (
        <ActivityIndicator color="#EDB62C" size="small" style={{ marginVertical: 30 }} />
      ) : error || !data ? (
        <Text style={styles.emptyText}>No records found for this patient.</Text>
      ) : (
        <View style={styles.panelBody}>
          {renderData(typeKey, data)}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Panel wrapper ──────────────────────────────────────────────────────────
  panel: {
    marginTop: 20,
    backgroundColor: '#FFFAED',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    overflow: 'hidden',
  },

  // ── Panel header ───────────────────────────────────────────────────────────
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: '#FFEDC1',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  panelHeaderLeft: { flex: 1 },
  panelTitle: {
    fontSize: 17,
    fontFamily: 'AlteHaasGroteskBold',
    color: '#035022',
  },
  panelSubtitle: {
    fontSize: 12,
    color: '#B8860B',
    marginTop: 2,
  },
  readOnlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5FFE8',
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#29A539',
  },
  readOnlyText: {
    fontSize: 10,
    color: '#035022',
    fontFamily: 'AlteHaasGroteskBold',
  },
  closeBtn: { padding: 2, marginLeft: 10 },

  // ── Panel body ─────────────────────────────────────────────────────────────
  panelBody: { padding: 16 },
  emptyText: { textAlign: 'center', color: '#999', padding: 30, fontSize: 13 },

  // ── Layout helpers ─────────────────────────────────────────────────────────
  row: { flexDirection: 'row', justifyContent: 'space-between' },

  // ── ROField ────────────────────────────────────────────────────────────────
  fieldCard: {
    backgroundColor: '#FFEDC1',
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  halfCard: { width: '48%' },
  fieldHeader: {
    backgroundColor: '#FFEDC1',
    paddingVertical: 6,
    alignItems: 'center',
  },
  fieldLabel: {
    color: '#EDB62C',
    fontFamily: 'AlteHaasGroteskBold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  fieldBody: {
    backgroundColor: '#FFFAED',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  fieldBodyMultiline: {
    alignItems: 'flex-start',
    minHeight: 70,
    paddingVertical: 12,
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  fieldValueMultiline: {
    textAlign: 'left',
    lineHeight: 22,
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  unitBadge: {
    backgroundColor: '#FFEDC1',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginLeft: 8,
  },
  unitText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#EDB62C',
  },
  alertRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingBottom: 6 },
  alertText: { fontSize: 10, color: '#D32F2F', fontStyle: 'italic' },

  // ── Lab cards ──────────────────────────────────────────────────────────────
  labGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  labCard: {
    width: '48%',
    backgroundColor: '#FFFAED',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  labHeader: {
    backgroundColor: '#E5FFE8',
    paddingVertical: 6,
    alignItems: 'center',
  },
  labHeaderText: {
    color: '#29A539',
    fontFamily: 'AlteHaasGroteskBold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  labResultHeader: {
    backgroundColor: '#FFEDC1',
    paddingVertical: 4,
    alignItems: 'center',
  },
  labSubLabel: {
    color: '#EDB62C',
    fontFamily: 'AlteHaasGroteskBold',
    fontSize: 10,
  },
  labBody: { paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center' },
  labValue: { fontSize: 15, fontWeight: '700', color: '#035022', textAlign: 'center' },
  labValueAlert: { color: '#D32F2F' },
  labAlertText: { fontSize: 9, color: '#D32F2F', fontStyle: 'italic', textAlign: 'center', marginTop: 2 },

  // ── I/O alert box ──────────────────────────────────────────────────────────
  ioAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3F3',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  ioAlertText: { fontSize: 12, color: '#D32F2F' },

  // ── Nursing diagnosis ──────────────────────────────────────────────────────
  diagnosisBlock: {
    backgroundColor: '#F6FFF7',
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#D4F5D9',
  },
  diagnosisLabel: {
    fontSize: 10,
    fontFamily: 'AlteHaasGroteskBold',
    color: '#29A539',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  diagnosisText: { fontSize: 13, color: '#444', lineHeight: 20 },

  // ── Medication header ──────────────────────────────────────────────────────
  medHeader: {
    backgroundColor: '#E5FFE8',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  medHeaderText: {
    color: '#29A539',
    fontFamily: 'AlteHaasGroteskBold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
