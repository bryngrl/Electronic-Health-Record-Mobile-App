export const initialFormData = {
  mobility_assessment: '',
  hygiene_assessment: '',
  toileting_assessment: '',
  feeding_assessment: '',
  hydration_assessment: '',
  sleep_pattern_assessment: '',
  pain_level_assessment: '',
};

export const ALERT_KEY_MAP: Record<string, string> = {
  mobility_assessment:      'mobility_alert',
  hygiene_assessment:       'hygiene_alert',
  toileting_assessment:     'toileting_alert',
  feeding_assessment:       'feeding_alert',
  hydration_assessment:     'hydration_alert',
  sleep_pattern_assessment: 'sleep_pattern_alert',
  pain_level_assessment:    'pain_level_alert',
};

export const ADL_CARDS = [
  { label: 'MOBILITY',      field: 'mobility_assessment' },
  { label: 'HYGIENE',       field: 'hygiene_assessment' },
  { label: 'TOILETING',     field: 'toileting_assessment' },
  { label: 'FEEDING',       field: 'feeding_assessment' },
  { label: 'HYDRATION',     field: 'hydration_assessment' },
  { label: 'SLEEP PATTERN', field: 'sleep_pattern_assessment' },
  { label: 'PAIN LEVEL',    field: 'pain_level_assessment' },
];
