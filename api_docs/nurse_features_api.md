# Nurse Features API Documentation

This document explains how the nurse features in the mobile application interact with the backend API. This can serve as a guide for implementing the same features in a website version.

## Overview

The nurse features (Physical Exam, Vital Signs, ADL, etc.) follow a standardized **ADPIE** (Assessment, Diagnosis, Planning, Implementation/Intervention, Evaluation) workflow. 

- **Base URL**: `http://<your-ip>:8000`
- **Content-Type**: `application/json`

---

## 1. Data Sanitization

Before sending data to the backend, the mobile app "sanitizes" the form data. Any empty or whitespace-only string is converted to the string `"N/A"`.

**Example Logic (TypeScript):**
```typescript
const sanitize = (data: any) => {
  const sanitized = { ...data };
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string' && sanitized[key].trim() === '') {
      sanitized[key] = 'N/A';
    }
  });
  return sanitized;
};
```

---

## 2. Standard ADPIE Workflow

Each feature typically uses a single database record per patient per day (or per time slot) to store the entire ADPIE process.

### Step 1: Assessment (POST)
When the nurse fills out the initial assessment form and clicks "Submit" or "CDSS", a `POST` request is sent.

- **Endpoint**: `/<feature-prefix>/` (e.g., `/physical-exam/`, `/vital-signs/`)
- **Method**: `POST`
- **Body**: JSON object containing `patient_id` and all assessment fields.
- **Behavior**: 
  - If a record exists for that patient today, it **updates** the existing record.
  - If no record exists, it **creates** a new one.
  - The backend automatically runs **CDSS (Clinical Decision Support System)** rules on the inputs and returns the record with generated `alerts`.

**Example Request (Physical Exam):**
```json
{
  "patient_id": 20,
  "general_appearance": "pale",
  "skin_condition": "jaundice",
  "eye_condition": "blurry eyes",
  "oral_condition": "N/A",
  "cardiovascular": "N/A",
  "abdomen_condition": "N/A",
  "extremities": "N/A",
  "neurological": "N/A"
}
```

### Steps 2-5: DPIE Updates (PUT)
After the assessment is saved, the `id` of the created record is used to update the subsequent steps (Diagnosis, Planning, Intervention, Evaluation).

- **Endpoints**: 
  - `PUT /<feature-prefix>/{id}/diagnosis`
  - `PUT /<feature-prefix>/{id}/planning`
  - `PUT /<feature-prefix>/{id}/intervention`
  - `PUT /<feature-prefix>/{id}/evaluation`
- **Method**: `PUT`
- **Body**: JSON object with a single key matching the step.
- **Behavior**: The backend updates the field and re-runs CDSS rules specifically for that step (e.g., generating a `diagnosis_alert`).

**Example Request (Diagnosis):**
```json
{
  "diagnosis": "Impaired liver function"
}
```

---

## 3. Feature Endpoints

### Physical Exam
- **Prefix**: `/physical-exam`
- **Fields**: `general_appearance`, `skin_condition`, `eye_condition`, `oral_condition`, `cardiovascular`, `abdomen_condition`, `extremities`, `neurological`.

### Vital Signs
- **Prefix**: `/vital-signs`
- **Fields**: `date`, `time`, `day_no`, `temperature`, `hr` (Heart Rate), `rr` (Respiratory Rate), `bp` (Blood Pressure), `spo2` (Oxygen Saturation).
- **Note**: Vital Signs often uses a specific date and time slot to uniquely identify a record.

### Intake and Output
- **Prefix**: `/intake-and-output`
- **Fields**: `day_no`, `oral_intake`, `iv_fluids_volume`, `iv_fluids_type`, `urine_output`.

---

## 4. Reading Data

### Fetch All Records for a Patient
- **Endpoint**: `GET /<feature-prefix>/patient/{patient_id}`
- **Returns**: A list of records sorted by `created_at` descending.

### Fetch Single Record
- **Endpoint**: `GET /<feature-prefix>/{id}`
- **Returns**: The full record including all ADPIE fields and alerts.

### Extract/Print ADPIE
- **Endpoint**: `GET /<feature-prefix>/{id}/extract-adpie`
- **Returns**: A formatted JSON object containing patient info and a grouped ADPIE structure, ideal for a "Report" view or printing.

---

## 5. CDSS (Clinical Decision Support)

The backend uses a YAML-based rules engine. When you `POST` or `PUT` data, the response will include `*_alert` fields. 

**Response Example Fragment:**
```json
{
  "id": 1,
  "general_appearance": "pale",
  "general_appearance_alert": "Abnormal Circulation (Pallor): Patient appears pale. Assess perfusion status immediately.",
  "diagnosis": "pain",
  "diagnosis_alert": "— Recommend pain assessment (e.g., PQRST, 0-10 scale)."
}
```
Your website version should display these alerts prominently to the nurse.
