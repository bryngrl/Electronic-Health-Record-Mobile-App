export const LAB_TESTS = [
  'WBC (×10⁹/L)',
  'RBC (×10¹²/L)',
  'Hgb (g/dL)',
  'Hct (%)',
  'Platelets (×10⁹/L)',
  'MCV (fL)',
  'MCH (pg)',
  'MCHC (g/dL)',
  'RDW (%)',
  'Neutrophils (%)',
  'Lymphocytes (%)',
  'Monocytes (%)',
  'Eosinophils (%)',
  'Basophils (%)',
];

export const getTestPrefix = (label: string): string => label.split(' ')[0].toLowerCase();
