# 🫀 Vital Signs — Nurse API Documentation

**Base URL:** `http://your-domain.com/api`  
**Auth:** All routes require `Authorization: Bearer {token}` header.  
**Database Table:** `vital_signs`  
**Model:** `App\Models\Vitals`

---

## 📋 Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/vital-signs` | Save or update a vital signs record (runs CDSS automatically) |
| GET | `/api/vital-signs/patient/{patient_id}` | Get all vital sign records for a patient |
| GET | `/api/vital-signs/{id}/assessment` | Get a single record by ID |
| PUT | `/api/vital-signs/{id}/assessment` | Update a record by ID (re-runs CDSS) |
| GET | `/api/vital-signs/data-alert/patient/{patient_id}` | Get the latest CDSS alert for a patient |

---

## 📝 Request Body — POST `/api/vital-signs`

All vital fields are **optional strings/numbers**. Empty or null values are stored as `"N/A"`. The CDSS alert is generated automatically — **do not send the `alerts` field**.

```json
{
  "patient_id": 1,
  "date": "2025-01-15",
  "time": "08:00",
  "day_no": 1,
  "temperature": 38.5,
  "hr": 95,
  "rr": 18,
  "bp": "120/80",
  "spo2": 97
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `patient_id` | integer | ✅ Yes | Must exist in `patients` table |
| `date` | string (Y-m-d) | No | Defaults to today's date |
| `time` | string (HH:MM) | No | Defaults to `"08:00"`. Common slots: `06:00`, `08:00`, `12:00`, `14:00`, `18:00`, `20:00`, `00:00`, `02:00` |
| `day_no` | integer | No | Hospital day number (starts at 1) |
| `temperature` | numeric | No | Body temperature in °C |
| `hr` | numeric | No | Heart rate in bpm |
| `rr` | numeric | No | Respiratory rate in breaths/min |
| `bp` | string | No | Blood pressure as `"systolic/diastolic"` (e.g. `"120/80"`) |
| `spo2` | numeric | No | Oxygen saturation in % |

> **Upsert logic:** Records are matched by `patient_id + date + time`. If a record exists for that combination it is updated; otherwise a new one is created.

---

## ✅ Response — POST 201 / PUT 200

```json
{
  "message": "Vitals saved",
  "data": {
    "id": 10,
    "patient_id": 1,
    "date": "2025-01-15",
    "time": "08:00",
    "day_no": 1,
    "temperature": "38.5",
    "hr": "95",
    "rr": "18",
    "bp": "120/80",
    "spo2": "97",
    "alerts": "⚠️ WARNING: Low-grade fever detected. Monitor temperature trend.",
    "created_at": "2025-01-15T08:00:00.000000Z",
    "updated_at": "2025-01-15T08:00:00.000000Z"
  }
}
```

### Database Column Reference (`vital_signs` table)

| Column | Type | Description |
|--------|------|-------------|
| `id` | integer | Auto-increment primary key |
| `patient_id` | integer | Foreign key → `patients.patient_id` |
| `date` | date | Date of recording |
| `time` | string | Time slot of recording |
| `day_no` | integer | Hospital day number |
| `temperature` | string | Temperature in °C |
| `hr` | string | Heart rate in bpm |
| `rr` | string | Respiratory rate in breaths/min |
| `bp` | string | Blood pressure (`systolic/diastolic`) |
| `spo2` | string | Oxygen saturation in % |
| `alerts` | string | CDSS-generated alert (auto-populated) |
| `created_at` | timestamp | Auto-managed by Laravel |
| `updated_at` | timestamp | Auto-managed by Laravel |

---

## 📥 GET All Records — `/api/vital-signs/patient/{patient_id}`

Returns all vital sign records for the patient, ordered by `date DESC`, then `time DESC` (newest first).

```http
GET /api/vital-signs/patient/1
Authorization: Bearer {token}
```

**Response:** Array of vital sign objects (same structure as the `data` object above).

---

## 📥 GET Single Record — `/api/vital-signs/{id}/assessment`

```http
GET /api/vital-signs/10/assessment
Authorization: Bearer {token}
```

Returns a single vital signs record object.

---

## 🔄 PUT Update — `/api/vital-signs/{id}/assessment`

Same request body as POST. CDSS re-runs automatically and `alerts` is updated.

```http
PUT /api/vital-signs/10/assessment
Authorization: Bearer {token}
Content-Type: application/json

{
  "temperature": 39.2,
  "hr": 110,
  "rr": 22,
  "bp": "90/60",
  "spo2": 94
}
```

---

## 🚨 Data Alert — `/api/vital-signs/data-alert/patient/{patient_id}`

Returns only the CDSS alert from the patient's **latest** vital signs record.

```http
GET /api/vital-signs/data-alert/patient/1
Authorization: Bearer {token}
```

**Response:**
```json
{
  "alert": "🚨 CRITICAL: Severe Hypotension (Possible shock). Immediate assessment required."
}
```

Returns `"No findings."` if no abnormal values were detected.

---

## 🔬 CDSS Alert Engine — How It Works

The `VitalCdssService` runs on every save/update and analyzes the numeric vital values against clinical thresholds. The result is stored in the `alerts` column.

### Alert Thresholds Reference

| Vital | Condition | Threshold | Alert | Severity |
|-------|-----------|-----------|-------|----------|
| `temperature` | Hyperpyrexia | > 40°C | Risk of febrile seizure | 🚨 CRITICAL |
| `temperature` | High Fever | > 39°C | High fever — monitor closely | ⚠️ WARNING |
| `temperature` | Low-grade Fever | > 37.5°C | Low-grade fever detected | ⚠️ WARNING |
| `temperature` | Hypothermia | < 35°C | Hypothermia — assess for exposure/sepsis | 🚨 CRITICAL |
| `hr` | Severe Tachycardia | > 170 bpm | Possible shock or dehydration | 🚨 CRITICAL |
| `hr` | Tachycardia | > 100 bpm | Elevated heart rate — assess for cause | ⚠️ WARNING |
| `hr` | Bradycardia | < 50 bpm | Low heart rate — assess cardiac status | ⚠️ WARNING |
| `rr` | Severe Bradypnea | < 8 breaths/min | Possible CNS depression | 🚨 CRITICAL |
| `rr` | Tachypnea | > 24 breaths/min | Increased respiratory rate | ⚠️ WARNING |
| `bp` (systolic) | Severe Hypotension | < 85 mmHg | Possible shock | 🚨 CRITICAL |
| `bp` (systolic) | Hypotension | < 90 mmHg | Low blood pressure | ⚠️ WARNING |
| `bp` (systolic) | Hypertensive Crisis | > 180 mmHg | Hypertensive emergency | 🚨 CRITICAL |
| `spo2` | Severe Hypoxemia | < 90% | Apply O₂, urgent evaluation | 🚨 CRITICAL |
| `spo2` | Hypoxemia | < 95% | Low oxygen saturation | ⚠️ WARNING |

### Alert Severity Levels

| Prefix | Severity | Meaning |
|--------|----------|---------|
| 🚨 `CRITICAL:` | Highest | Urgent — escalate immediately |
| ⚠️ `WARNING:` | High | Requires prompt attention |
| ℹ️ `INFO:` | Medium | Monitor or document |
| `No findings.` | None | No abnormality detected |

---

## 🧠 ADPIE / Nursing Diagnosis

After saving a vital signs record, the ADPIE workflow can be initiated using the record's `id`. The CDSS analyzes nurse-entered clinical text across all four steps and stores recommendations automatically.

> **Do not change the alerts** — they are generated automatically by the CDSS engine.

### Step 1 — Initialize ADPIE Record

Creates (or retrieves) the `nursing_diagnoses` row linked to this vital signs record.

```http
GET /api/adpie/vital-signs/{vital_signs_id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "ADPIE record initialized",
  "data": {
    "id": 5,
    "vital_signs_id": 10,
    "patient_id": 1,
    "diagnosis": "",
    "diagnosis_alert": "",
    "planning": "",
    "planning_alert": "",
    "intervention": "",
    "intervention_alert": "",
    "evaluation": "",
    "evaluation_alert": "",
    "created_at": "2025-01-15T08:05:00.000000Z",
    "updated_at": "2025-01-15T08:05:00.000000Z"
  },
  "assessment": { ...vital_signs record... }
}
```

### Step 2 — Analyze a Single ADPIE Field (Optional Live Preview)

```http
POST /api/adpie/analyze
Authorization: Bearer {token}
Content-Type: application/json

{
  "fieldName": "diagnosis",
  "finding": "patient has tachycardia with HR of 120, spo2 at 91%",
  "component": "vital-signs"
}
```

Valid `fieldName` values: `diagnosis` · `planning` · `intervention` · `evaluation`

**Response:**
```json
{
  "level": "CRITICAL",
  "message": "RECOMMENDATION: Ineffective Airway Clearance related to tachycardia and hypoxemia.",
  "raw_message": "Ineffective Airway Clearance related to tachycardia and hypoxemia."
}
```

Returns `"No findings."` in `raw_message` if no CDSS rule matched.

### Step 3 — Analyze Multiple ADPIE Fields at Once

```http
POST /api/adpie/analyze-batch
Authorization: Bearer {token}
Content-Type: application/json

{
  "component": "vital-signs",
  "batch": [
    { "fieldName": "diagnosis",     "finding": "tachycardia, fever 39.5" },
    { "fieldName": "planning",      "finding": "monitor vital signs every 2 hours" },
    { "fieldName": "intervention",  "finding": "administer antipyretics as ordered" },
    { "fieldName": "evaluation",    "finding": "temperature normalized to 37.2" }
  ]
}
```

**Response:** Array of recommendation objects in the same order as the batch.

### Step 4 — Save Each ADPIE Step

Updates one step at a time. The CDSS runs automatically and saves the alert alongside the nurse's input.

```http
PUT /api/adpie/{nursing_diagnosis_id}/{step}
Authorization: Bearer {token}
Content-Type: application/json
```

**Valid `{step}` values:** `diagnosis` · `planning` · `intervention` · `evaluation`

#### Save Diagnosis
```http
PUT /api/adpie/5/diagnosis
Content-Type: application/json

{
  "diagnosis": "Hyperthermia related to infectious process as evidenced by temperature of 39.5°C",
  "component": "vital-signs"
}
```

#### Save Planning
```http
PUT /api/adpie/5/planning

{
  "planning": "Patient will maintain temperature within normal range (36–37.5°C) within 4 hours",
  "component": "vital-signs"
}
```

#### Save Intervention
```http
PUT /api/adpie/5/intervention

{
  "intervention": "Administer prescribed antipyretics; apply cool compress; encourage oral fluids; monitor temperature q2h",
  "component": "vital-signs"
}
```

#### Save Evaluation
```http
PUT /api/adpie/5/evaluation

{
  "evaluation": "Temperature decreased to 37.1°C after 3 hours. Goal met.",
  "component": "vital-signs"
}
```

**Response for each PUT:**
```json
{
  "message": "Diagnosis updated",
  "data": {
    "id": 5,
    "vital_signs_id": 10,
    "patient_id": 1,
    "diagnosis": "Hyperthermia related to infectious process as evidenced by temperature of 39.5°C",
    "diagnosis_alert": "Risk for hyperthermia related to severe fever as evidenced by temperature > 39°C.",
    "planning": "",
    "planning_alert": "",
    "intervention": "",
    "intervention_alert": "",
    "evaluation": "",
    "evaluation_alert": "",
    "updated_at": "2025-01-15T08:10:00.000000Z"
  },
  "recommendation": {
    "level": "WARNING",
    "message": "RECOMMENDATION: Risk for hyperthermia related to severe fever.",
    "raw_message": "Risk for hyperthermia related to severe fever as evidenced by temperature > 39°C."
  }
}
```

### `nursing_diagnoses` Table — Field Reference

| Column | Type | Description |
|--------|------|-------------|
| `id` | integer | Auto-increment primary key |
| `vital_signs_id` | integer | Foreign key → `vital_signs.id` |
| `patient_id` | integer | Foreign key → `patients.patient_id` |
| `diagnosis` | text | Nurse-entered nursing diagnosis |
| `diagnosis_alert` | text | CDSS-generated recommendation for diagnosis |
| `planning` | text | Nurse-entered care plan goal |
| `planning_alert` | text | CDSS-generated recommendation for planning |
| `intervention` | text | Nurse-entered nursing interventions |
| `intervention_alert` | text | CDSS-generated recommendation for intervention |
| `evaluation` | text | Nurse-entered evaluation of outcomes |
| `evaluation_alert` | text | CDSS-generated recommendation for evaluation |
| `created_at` | timestamp | Auto-managed by Laravel |
| `updated_at` | timestamp | Auto-managed by Laravel |

---

## 📖 Complete Flow Example

```
1. POST /api/vital-signs
   → Saves record to `vital_signs` table
   → CDSS auto-populates `alerts` column
   → Response includes { data.id, data.alerts }

2. GET /api/adpie/vital-signs/{data.id}
   → Creates row in `nursing_diagnoses` with vital_signs_id

3. PUT /api/adpie/{nursing_diagnosis.id}/diagnosis
   → Saves nurse diagnosis + CDSS alert in diagnosis_alert

4. PUT /api/adpie/{nursing_diagnosis.id}/planning
   → Saves planning + CDSS alert in planning_alert

5. PUT /api/adpie/{nursing_diagnosis.id}/intervention
   → Saves intervention + CDSS alert in intervention_alert

6. PUT /api/adpie/{nursing_diagnosis.id}/evaluation
   → Saves evaluation + CDSS alert in evaluation_alert
```
