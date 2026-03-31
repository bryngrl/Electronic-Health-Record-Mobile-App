import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import apiClient from '../../../api/apiClient';

interface Props {
  patientId: number;
  category: string;
  recordId?: number;
  onBack: () => void;
}

const CATEGORY_TITLES: Record<string, string> = {
  vital_signs:     'Vital Signs',
  physical_exam:   'Physical Exam',
  lab_values:      'Laboratory Values',
  intake_output:   'Intake & Output',
  adl:             'Activities of Daily Living',
  ivs_lines:       'IVs & Lines',
  medication:      'Medical Administration',
  medical_history: 'Medical History',
};

const TYPE_KEY_MAP: Record<string, string> = {
  vital_signs:     'vital-signs',
  physical_exam:   'physical-exam',
  lab_values:      'lab-values',
  intake_output:   'intake-output',
  adl:             'adl',
  ivs_lines:       'ivs-lines',
  medication:      'medication',
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

const formatRecordDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  try {
    const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
    const date = new Date(normalized);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  } catch {
    return dateStr;
  }
};

const formatRecordTime = (timeStr?: string): string => {
  if (!timeStr) return '';
  try {
    // Handle "HH:MM:SS" format
    if (timeStr.includes(':') && !timeStr.includes('-')) {
      const [hours, minutes] = timeStr.split(':');
      const h = parseInt(hours, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayHours = h % 12 || 12;
      return `${displayHours}:${minutes} ${ampm}`;
    }
    // Handle full datetime
    const normalized = timeStr.includes('T') ? timeStr : timeStr.replace(' ', 'T');
    const date = new Date(normalized);
    if (isNaN(date.getTime())) return timeStr;
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  } catch {
    return timeStr;
  }
};

const normalizeDayNo = (dayNo: any): number | undefined => {
  if (dayNo === null || dayNo === undefined || dayNo === '') return undefined;
  const n = Number(dayNo);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

const pickFirstValidDate = (...candidates: Array<any>): string => {
  for (const raw of candidates) {
    if (typeof raw !== 'string') continue;
    const value = raw.trim();
    if (!value) continue;
    const normalized = value.includes('T') ? value : value.replace(' ', 'T');
    const parsed = new Date(normalized);
    if (!isNaN(parsed.getTime())) return value;
  }
  return '';
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader = ({ title, date, time, dayNo }: { title: string; date?: string; time?: string; dayNo?: number }) => (
  <View style={styles.sectionHeader}>
    <View style={{ flex: 1 }}>
      <Text style={styles.recordTitle}>{title}</Text>
      {(date || time || dayNo) && (
        <View style={styles.recordMeta}>
          {date && <Text style={styles.recordDate}>📅 {date}</Text>}
          {time && <Text style={styles.recordTime}>🕐 {time}</Text>}
          {dayNo && <Text style={styles.recordDayNo}>Day {dayNo}</Text>}
        </View>
      )}
    </View>
    <Text style={styles.readOnlyLabel}>[READ ONLY]</Text>
  </View>
);

const DetailItem = ({ label, value, alert }: { label: string; value?: any; alert?: any }) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value != null && value !== '' ? String(value) : 'N/A'}</Text>
    {alert ? (
      <View style={styles.alertRow}>
        <Icon name="warning" size={12} color="#D32F2F" />
        <Text style={styles.detailAlert}> {alert}</Text>
      </View>
    ) : null}
  </View>
);

const LabItem = ({ label, value, normalRange, alert }: { label: string; value?: any; normalRange?: any; alert?: any }) => (
  <View style={styles.labItem}>
    <Text style={styles.labLabel}>{label}</Text>
    <Text style={[styles.labValue, alert ? styles.labValueAlert : null]}>
      {value != null && value !== '' ? String(value) : 'N/A'}
    </Text>
    {normalRange && normalRange !== 'N/A' && normalRange !== '' && (
      <Text style={styles.labNormalRange}>Normal: {normalRange}</Text>
    )}
    {alert ? <Text style={styles.labAlert}>{alert}</Text> : null}
  </View>
);

const AdpieSection = ({ data }: { data: any }) => {
  const diagnosis = data?.nursing_diagnoses?.diagnosis ?? data?.diagnosis;
  if (!diagnosis) return null;
  return (
    <View style={styles.adpieSection}>
      <Text style={styles.adpieTitle}>Nursing Diagnosis</Text>
      <Text style={styles.adpieText}>{diagnosis}</Text>
    </View>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function DoctorPatientDetailScreen({ patientId, category, recordId, onBack }: Props) {
  const [loading, setLoading] = useState(true);
  const [data, setData]       = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);

  const fetchData = async () => {
    if (!patientId) { setLoading(false); return; }
    try {
      setLoading(true);
      const patientRes = await apiClient.get(`/doctor/patient/${patientId}`);
      setPatient(patientRes.data);

      const typeKey = TYPE_KEY_MAP[category];
      if (typeKey) {
        const formsRes = await apiClient.get(`/doctor/patient/${patientId}/forms/${typeKey}`);
        const list = Array.isArray(formsRes.data) ? formsRes.data : (formsRes.data?.data ?? []);
        if (list.length > 0) setData(list[0]);
      }
    } catch (error) {
      console.error('Error fetching detail data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [patientId, category, recordId]);

  const categoryTitle = CATEGORY_TITLES[category] ?? category.replace(/_/g, ' ');

  const renderContent = () => {
    if (!data) return <Text style={styles.noData}>No recent records found for this category.</Text>;

    switch (category) {
      case 'vital_signs':
        return (
          <>
            <SectionHeader 
              title={categoryTitle} 
              date={formatRecordDate(data.date || data.created_at)}
              time={formatRecordTime(data.time)}
              dayNo={data.day_no}
            />
            <View style={styles.grid}>
              <DetailItem label="Temperature"      value={data.temperature ? `${data.temperature}°C` : null} alert={data.temperature_alert} />
              <DetailItem label="Heart Rate"       value={data.hr ? `${data.hr} bpm` : null}                 alert={data.hr_alert} />
              <DetailItem label="Respiratory Rate" value={data.rr ? `${data.rr} bpm` : null}                 alert={data.rr_alert} />
              <DetailItem label="Blood Pressure"   value={data.bp}                                            alert={data.bp_alert} />
              <DetailItem label="SpO2"             value={data.spo2 ? `${data.spo2}%` : null}                alert={data.spo2_alert} />
            </View>
            <AdpieSection data={data} />
          </>
        );

      case 'physical_exam':
        return (
          <>
            <SectionHeader 
              title={categoryTitle}
              date={formatRecordDate(data.created_at)}
            />
            <DetailItem label="General Appearance" value={data.general_appearance} alert={data.general_appearance_alert} />
            <DetailItem label="Skin"               value={data.skin_condition}      alert={data.skin_alert} />
            <DetailItem label="Eyes"               value={data.eye_condition}       alert={data.eye_alert} />
            <DetailItem label="Oral"               value={data.oral_condition}      alert={data.oral_alert} />
            <DetailItem label="Cardiovascular"     value={data.cardiovascular}      alert={data.cardiovascular_alert} />
            <DetailItem label="Abdomen"            value={data.abdomen_condition}   alert={data.abdomen_alert} />
            <DetailItem label="Extremities"        value={data.extremities}         alert={data.extremities_alert} />
            <DetailItem label="Neurological"       value={data.neurological}        alert={data.neurological_alert} />
            <AdpieSection data={data} />
          </>
        );

      case 'intake_output':
        return (
          <>
            <SectionHeader 
              title={categoryTitle}
              date={formatRecordDate(data.date || data.created_at)}
              dayNo={data.day_no}
            />
            <DetailItem label="Oral Intake"      value={data.oral_intake      ? `${data.oral_intake} mL`      : null} />
            <DetailItem label="IV Fluids Volume" value={data.iv_fluids_volume ? `${data.iv_fluids_volume} mL` : null} />
            <DetailItem label="IV Fluids Type"   value={data.iv_fluids_type} />
            <DetailItem label="Urine Output"     value={data.urine_output     ? `${data.urine_output} mL`     : null} />
            {data.alert ? (
              <View style={styles.alertBox}>
                <Icon name="warning" size={14} color="#D32F2F" />
                <Text style={styles.alertBoxText}> {data.alert}</Text>
              </View>
            ) : null}
            <AdpieSection data={data} />
          </>
        );

      case 'lab_values':
        return (
          <>
            <SectionHeader 
              title={categoryTitle}
              date={formatRecordDate(data.created_at)}
            />
            <View style={styles.labGrid}>
              <LabItem label="WBC"         value={data.wbc_result}         normalRange={data.wbc_normal_range}         alert={data.wbc_alert} />
              <LabItem label="RBC"         value={data.rbc_result}         normalRange={data.rbc_normal_range}         alert={data.rbc_alert} />
              <LabItem label="HGB"         value={data.hgb_result}         normalRange={data.hgb_normal_range}         alert={data.hgb_alert} />
              <LabItem label="HCT"         value={data.hct_result}         normalRange={data.hct_normal_range}         alert={data.hct_alert} />
              <LabItem label="Platelets"   value={data.platelets_result}   normalRange={data.platelets_normal_range}   alert={data.platelets_alert} />
              <LabItem label="Neutrophils" value={data.neutrophils_result} normalRange={data.neutrophils_normal_range} alert={data.neutrophils_alert} />
              <LabItem label="Lymphocytes" value={data.lymphocytes_result} normalRange={data.lymphocytes_normal_range} alert={data.lymphocytes_alert} />
              <LabItem label="Monocytes"   value={data.monocytes_result}   normalRange={data.monocytes_normal_range}   alert={data.monocytes_alert} />
              <LabItem label="Eosinophils" value={data.eosinophils_result} normalRange={data.eosinophils_normal_range} alert={data.eosinophils_alert} />
              <LabItem label="Basophils"   value={data.basophils_result}   normalRange={data.basophils_normal_range}   alert={data.basophils_alert} />
            </View>
            <AdpieSection data={data} />
          </>
        );

      case 'adl':
        return (
          <>
            <SectionHeader 
              title={categoryTitle}
              date={formatRecordDate(pickFirstValidDate(data.date, data.created_at))}
              dayNo={normalizeDayNo(data.day_no)}
            />
            <DetailItem label="Mobility"     value={data.mobility_assessment}      alert={data.mobility_alert} />
            <DetailItem label="Hygiene"      value={data.hygiene_assessment}       alert={data.hygiene_alert} />
            <DetailItem label="Toileting"    value={data.toileting_assessment}     alert={data.toileting_alert} />
            <DetailItem label="Feeding"      value={data.feeding_assessment}       alert={data.feeding_alert} />
            <DetailItem label="Hydration"    value={data.hydration_assessment}     alert={data.hydration_alert} />
            <DetailItem label="Sleep Pattern" value={data.sleep_pattern_assessment} alert={data.sleep_pattern_alert} />
            <DetailItem label="Pain Level"   value={data.pain_level_assessment}    alert={data.pain_level_alert} />
            <AdpieSection data={data} />
          </>
        );

      case 'ivs_lines':
        return (
          <>
            <SectionHeader 
              title={categoryTitle}
              date={formatRecordDate(data.created_at)}
            />
            <DetailItem label="IV Fluid" value={data.iv_fluid} />
            <DetailItem label="Rate"     value={data.rate} />
            <DetailItem label="Site"     value={data.site} />
            <DetailItem label="Status"   value={data.status} />
            <AdpieSection data={data} />
          </>
        );

      case 'medication': {
        const meds = Array.isArray(data.medications) ? data.medications
          : Array.isArray(data) ? data
          : [data];
        return (
          <>
            <SectionHeader 
              title={categoryTitle}
              date={formatRecordDate(data.created_at || (meds[0]?.created_at))}
            />
            {meds.map((med: any, i: number) => (
              <View key={i} style={[styles.medCard, i > 0 && { marginTop: 10 }]}>
                {meds.length > 1 && <Text style={styles.medIndex}>Medication {i + 1}</Text>}
                <DetailItem label="Medication" value={med.medication} />
                <DetailItem label="Dose"       value={med.dose} />
                <DetailItem label="Route"      value={med.route} />
                <DetailItem label="Frequency"  value={med.frequency} />
                <DetailItem label="Comments"   value={med.comments} />
              </View>
            ))}
          </>
        );
      }

      case 'medical_history':
        return (
          <>
            <SectionHeader 
              title={categoryTitle}
              date={formatRecordDate(data.created_at)}
            />
            <DetailItem label="Present Illness"         value={data.present_illness} />
            <DetailItem label="Past Medical / Surgical" value={data.past_medical} />
            <DetailItem label="Allergies"               value={data.allergies} />
            <DetailItem label="Vaccination"             value={data.vaccination} />
            <DetailItem label="Developmental History"   value={data.developmental_history} />
          </>
        );

      default:
        return (
          <>
            <SectionHeader title={categoryTitle} />
            {Object.entries(data)
              .filter(([k]) => !k.endsWith('_at') && k !== 'id' && k !== 'patient_id' && k !== 'nursing_diagnoses')
              .map(([k, v]) => (
                <DetailItem key={k} label={k.replace(/_/g, ' ')} value={v != null ? String(v) : null} />
              ))}
            <AdpieSection data={data} />
          </>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#035022" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>View Record</Text>
          {patient && (
            <Text style={styles.headerSubtitle}>
              {patient.name ?? `${patient.first_name ?? ''} ${patient.last_name ?? ''}`.trim()} | ID: {String(patient.patient_id ?? patient.id ?? '').padStart(4, '0')}
            </Text>
          )}
        </View>
        <View style={styles.readOnlyBadge}>
          <Icon name="visibility" size={12} color="#035022" />
          <Text style={styles.readOnlyBadgeText}> READ ONLY</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#29A539" style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.recordContainer}>
            {renderContent()}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#035022' },
  headerSubtitle: { fontSize: 13, color: '#999', marginTop: 2 },
  readOnlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5FFE8',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#29A539',
  },
  readOnlyBadgeText: { fontSize: 10, color: '#035022', fontWeight: '700' },
  scrollContent: { padding: 20, paddingBottom: 60 },
  recordContainer: { 
    backgroundColor: '#F9FDF9', 
    borderRadius: 15, 
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5F3E5',
  },
  sectionHeader: { marginBottom: 20, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  recordTitle: { fontSize: 18, fontWeight: '700', color: '#035022' },
  recordMeta: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6, gap: 10 },
  recordDate: { fontSize: 12, color: '#666', fontWeight: '500' },
  recordTime: { fontSize: 12, color: '#666', fontWeight: '500' },
  recordDayNo: { fontSize: 12, color: '#29A539', fontWeight: '600', backgroundColor: '#E5FFE8', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  readOnlyLabel: { fontSize: 11, color: '#29A539', fontWeight: '600', marginTop: 3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  detailItem: { width: '100%', marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 8 },
  detailLabel: { fontSize: 11, color: '#999', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { fontSize: 15, color: '#333', fontWeight: '500' },
  alertRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  detailAlert: { fontSize: 11, color: '#D32F2F', fontStyle: 'italic' },
  labGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  labItem: { width: '48%', backgroundColor: '#FFF', borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E5F3E5' },
  labLabel: { fontSize: 11, color: '#999', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  labValue: { fontSize: 16, fontWeight: '700', color: '#035022' },
  labValueAlert: { color: '#D32F2F' },
  labNormalRange: { fontSize: 10, color: '#666', marginTop: 2 },
  labAlert: { fontSize: 10, color: '#D32F2F', marginTop: 3, fontStyle: 'italic' },
  adpieSection: { marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  adpieTitle: { fontSize: 13, fontWeight: '700', color: '#035022', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  adpieText: { fontSize: 14, color: '#444', lineHeight: 20 },
  alertBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3F3', borderRadius: 8, padding: 10, marginTop: 10, borderWidth: 1, borderColor: '#FFCDD2' },
  alertBoxText: { fontSize: 13, color: '#D32F2F' },
  medCard: { backgroundColor: '#FFF', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#E5F3E5' },
  medIndex: { fontSize: 12, fontWeight: '700', color: '#035022', marginBottom: 8 },
  noData: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 14 },
});
