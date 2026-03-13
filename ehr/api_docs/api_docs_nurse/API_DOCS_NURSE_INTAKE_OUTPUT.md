# 💧 Intake and Output — Nurse API Documentation

**Base URL:** `http://your-domain.com/api`  
**Auth:** All routes require `Authorization: Bearer {token}` header.  
**Database Table:** `intake_and_outputs`  
**Model:** `App\Models\IntakeAndOutput`

---

## 📋 Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/intake-and-output` | Save or update an I&O record (runs CDSS automatically) |
| GET | `/api/intake-and-output/patient/{patient_id}` | Get all I&O records for a patient |
| GET | `/api/intake-and-output/{id}/assessment` | Get a single record by ID |
| PUT | `/api/intake-and-output/{id}/assessment` | Update a record by ID (re-runs CDSS) |
| GET | `/api/intake-and-output/data-alert/patient/{patient_id}` | Get the latest CDSS alert for a patient |

---

## 📝 Request Body — POST `/api/intake-and-output`

All volume fields are **optional integers (mL)**. The CDSS alert is generated automatically — **do not send the `alert` field**.

```json
{
  "patient_id": 1,
  "day_no": 2,
  "oral_intake": 800,
  "iv_fluids_volume": 1000,
  "iv_fluids_type": "Normal Saline 0.9%",
  "urine_output": 300
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `patient_id` | integer | ✅ Yes | Must exist in `patients` table |
| `day_no` | integer | No | Hospital day number (defaults to `1`) |
| `oral_intake` | integer | No | Oral fluid intake in mL |
| `iv_fluids_volume` | integer | No | IV fluid volume administered in mL |
| `iv_fluids_type` | string | No | IV fluid type (e.g. `"Normal Saline 0.9%"`, `"D5LR"`, `"Plain LR"`) |
| `urine_output` | integer | No | Urine output in mL |

> **Upsert logic:** Records are matched by `patient_id + day_no`. If a record exists for that combination it is updated; otherwise a new one is created.  
> **Note:** The `other_output` field is supported by the web form but not currently stored in the API — use `urine_output` for primary output tracking.

---

## ✅ Response — POST 201 / PUT 200

```json
{
  "message": "Intake and Output saved",
  "data": {
    "id": 7,
    "patient_id": 1,
    "day_no": 2,
    "oral_intake": 800,
    "iv_fluids_volume": 1000,
    "iv_fluids_type": "Normal Saline 0.9%",
    "urine_output": 300,
    "alert": "🚨 CRITICAL: Severe oliguria (urine output < 200ml). Immediate renal assessment required.",
    "created_at": "2025-01-15T10:00:00.000000Z",
    "updated_at": "2025-01-15T10:00:00.000000Z"
  }
}
```

### Database Column Reference (`intake_and_outputs` table)

| Column | Type | Description |
|--------|------|-------------|
| `id` | integer | Auto-increment primary key |
| `patient_id` | integer | Foreign key → `patients.patient_id` |
| `day_no` | integer | Hospital day number |
| `oral_intake` | integer | Oral intake in mL |
| `iv_fluids_volume` | integer | IV fluids volume in mL |
| `iv_fluids_type` | string | IV fluid type/name |
| `urine_output` | integer | Urine output in mL |
| `alert` | string | CDSS-generated alert (auto-populated) |
| `created_at` | timestamp | Auto-managed by Laravel |
| `updated_at` | timestamp | Auto-managed by Laravel |

---

## 📥 GET All Records — `/api/intake-and-output/patient/{patient_id}`

Returns all I&O records for the patient, ordered by most recent first.

```http
GET /api/intake-and-output/patient/1
Authorization: Bearer {token}
```

**Response:** Array of I&O record objects (same structure as the `data` object above).

---

## 📥 GET Single Record — `/api/intake-and-output/{id}/assessment`

```http
GET /api/intake-and-output/7/assessment
Authorization: Bearer {token}
```

Returns a single I&O record object.

---

## 🔄 PUT Update — `/api/intake-and-output/{id}/assessment`

Same request body as POST. CDSS re-runs automatically and `alert` is updated.

```http
PUT /api/intake-and-output/7/assessment
Authorization: Bearer {token}
Content-Type: application/json

{
  "oral_intake": 1200,
  "iv_fluids_volume": 500,
  "iv_fluids_type": "D5LR",
  "urine_output": 450
}
```

---

## 🚨 Data Alert — `/api/intake-and-output/data-alert/patient/{patient_id}`

Returns only the CDSS alert from the patient's **latest** I&O record.

```http
GET /api/intake-and-output/data-alert/patient/1
Authorization: Bearer {token}
```

**Response:**
```json
{
  "alert": "⚠️ WARNING: Low oral intake detected. Patient may be at risk for dehydration."
}
```

Returns `"No findings."` if no abnormal values were detected.

---

## 🔬 CDSS Alert Engine — How It Works

The `IntakeAndOutputCdssService` runs on every save/update and compares fluid volumes against clinical thresholds. The result is stored in the single `alert` column.

### Alert Thresholds Reference

| Field | Condition | Threshold | Alert | Severity |
|-------|-----------|-----------|-------|----------|
| `oral_intake` | Critically low | < 500 mL | Very low oral intake. Immediate assessment for dehydration. | 🚨 CRITICAL |
| `oral_intake` | Low | < 1000 mL | Low oral intake. Patient may be at risk for dehydration. | ⚠️ WARNING |
| `oral_intake` | High | > 3000 mL | High oral intake. Monitor for fluid overload. | ℹ️ INFO |
| `iv_fluids_volume` | Very high | > 3000 mL | Very high IV fluid volume. Assess for fluid overload. | 🚨 CRITICAL |
| `iv_fluids_volume` | Large | > 2000 mL | Large volume of IV fluids. Monitor for fluid overload. | ⚠️ WARNING |
| `urine_output` | Severe oliguria | < 200 mL | Severe oliguria. Immediate renal assessment required. | 🚨 CRITICAL |
| `urine_output` | Oliguria | < 400 mL | Oliguria detected (urine output < 400 mL). | ⚠️ WARNING |
| `urine_output` | Polyuria | > 3000 mL | Polyuria detected. Monitor for diabetes insipidus. | ℹ️ INFO |

### Alert Severity Levels

| Prefix | Severity | Meaning |
|--------|----------|---------|
| 🚨 `CRITICAL:` | Highest | Urgent — escalate immediately |
| ⚠️ `WARNING:` | High | Requires prompt attention |
| ℹ️ `INFO:` | Medium | Monitor or document |
| `No findings.` | None | No abnormality detected |

---

## 🧠 ADPIE / Nursing Diagnosis

After saving an I&O record, the ADPIE workflow can be initiated using the record's `id`. The CDSS analyzes nurse-entered clinical text across all four steps and stores recommendations automatically.

> **Do not change the alerts** — they are generated automatically by the CDSS engine.

### Step 1 — Initialize ADPIE Record

Creates (or retrieves) the `nursing_diagnoses` row linked to this I&O record.

```http
GET /api/adpie/intake-and-output/{intake_and_output_id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "ADPIE record initialized",
  "data": {
    "id": 8,
    "intake_and_output_id": 7,
    "patient_id": 1,
    "diagnosis": "",
    "diagnosis_alert": "",
    "planning": "",
    "planning_alert": "",
    "intervention": "",
    "intervention_alert": "",
    "evaluation": "",
    "evaluation_alert": "",
    "created_at": "2025-01-15T10:05:00.000000Z",
    "updated_at": "2025-01-15T10:05:00.000000Z"
  },
  "assessment": { ...intake_and_output record... }
}
```

### Step 2 — Analyze a Single ADPIE Field (Optional Live Preview)

```http
POST /api/adpie/analyze
Authorization: Bearer {token}
Content-Type: application/json

{
  "fieldName": "diagnosis",
  "finding": "patient has decreased urine output of 180mL with oral intake of 400mL",
  "component": "intake-and-output"
}
```

Valid `fieldName` values: `diagnosis` · `planning` · `intervention` · `evaluation`

**Response:**
```json
{
  "level": "CRITICAL",
  "message": "RECOMMENDATION: Actual fluid volume deficit related to inadequate fluid intake.",
  "raw_message": "Actual fluid volume deficit related to inadequate fluid intake."
}
```

Returns `"No findings."` in `raw_message` if no CDSS rule matched.

### Step 3 — Analyze Multiple ADPIE Fields at Once

```http
POST /api/adpie/analyze-batch
Authorization: Bearer {token}
Content-Type: application/json

{
  "component": "intake-and-output",
  "batch": [
    { "fieldName": "diagnosis",    "finding": "fluid volume deficit, oliguria, dehydration" },
    { "fieldName": "planning",     "finding": "patient will maintain adequate urine output >30mL/hr" },
    { "fieldName": "intervention", "finding": "encourage oral fluid intake; administer IV fluids as ordered; monitor I&O hourly" },
    { "fieldName": "evaluation",   "finding": "urine output improved to 500mL over 8 hours" }
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
PUT /api/adpie/8/diagnosis

{
  "diagnosis": "Actual fluid volume deficit related to inadequate oral intake as evidenced by urine output of 180 mL/day",
  "component": "intake-and-output"
}
```

#### Save Planning
```http
PUT /api/adpie/8/planning

{
  "planning": "Patient will achieve fluid balance with urine output ≥ 30 mL/hr within 8 hours",
  "component": "intake-and-output"
}
```

#### Save Intervention
```http
PUT /api/adpie/8/intervention

{
  "intervention": "Administer IV fluids as ordered; encourage oral intake of 2000 mL/day; strict hourly I&O monitoring; weigh patient daily",
  "component": "intake-and-output"
}
```

#### Save Evaluation
```http
PUT /api/adpie/8/evaluation

{
  "evaluation": "Urine output increased to 480 mL over 8 hours. Fluid balance improving. Goal partially met.",
  "component": "intake-and-output"
}
```

**Response for each PUT:**
```json
{
  "message": "Diagnosis updated",
  "data": {
    "id": 8,
    "intake_and_output_id": 7,
    "patient_id": 1,
    "diagnosis": "Actual fluid volume deficit related to inadequate oral intake as evidenced by urine output of 180 mL/day",
    "diagnosis_alert": "Actual fluid volume deficit related to inadequate fluid intake",
    "planning": "",
    "planning_alert": "",
    "intervention": "",
    "intervention_alert": "",
    "evaluation": "",
    "evaluation_alert": "",
    "updated_at": "2025-01-15T10:10:00.000000Z"
  },
  "recommendation": {
    "level": "CRITICAL",
    "message": "RECOMMENDATION: Actual fluid volume deficit related to inadequate fluid intake.",
    "raw_message": "Actual fluid volume deficit related to inadequate fluid intake."
  }
}
```

### `nursing_diagnoses` Table — Field Reference

| Column | Type | Description |
|--------|------|-------------|
| `id` | integer | Auto-increment primary key |
| `intake_and_output_id` | integer | Foreign key → `intake_and_outputs.id` |
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
1. POST /api/intake-and-output
   → Saves record to `intake_and_outputs` table
   → CDSS auto-populates `alert` column
   → Response includes { data.id, data.alert }

2. GET /api/adpie/intake-and-output/{data.id}
   → Creates row in `nursing_diagnoses` with intake_and_output_id

3. PUT /api/adpie/{nursing_diagnosis.id}/diagnosis
   → Saves nurse diagnosis + CDSS alert in diagnosis_alert

4. PUT /api/adpie/{nursing_diagnosis.id}/planning
   → Saves planning + CDSS alert in planning_alert

5. PUT /api/adpie/{nursing_diagnosis.id}/intervention
   → Saves intervention + CDSS alert in intervention_alert

6. PUT /api/adpie/{nursing_diagnosis.id}/evaluation
   → Saves evaluation + CDSS alert in evaluation_alert
```
