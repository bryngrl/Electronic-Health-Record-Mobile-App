export const initialFormData = {
  general_appearance: '',
  skin_condition: '',
  eye_condition: '',
  oral_condition: '',
  cardiovascular: '',
  abdomen_condition: '',
  extremities: '',
  neurological: '',
};

// Maps form field → DB alert column name (as returned by the API)
export const ALERT_KEY_MAP: Record<string, string> = {
  general_appearance: 'general_appearance_alert',
  skin_condition:     'skin_alert',
  eye_condition:      'eye_alert',
  oral_condition:     'oral_alert',
  cardiovascular:     'cardiovascular_alert',
  abdomen_condition:  'abdomen_alert',
  extremities:        'extremities_alert',
  neurological:       'neurological_alert',
};
