# 🧍 Activities of Daily Living (ADL) — Nurse API Documentation

**Base URL:** `http://your-domain.com/api`  
**Auth:** All routes require `Authorization: Bearer {token}` header.  
**Database Table:** `act_of_daily_living`  
**Model:** `App\Models\ActOfDailyLiving`

---

## 📋 Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/adl` | Save or update an ADL record (runs CDSS automatically) |
| GET | `/api/adl/patient/{patient_id}` | Get all ADL records for a patient |
| GET | `/api/adl/{id}/assessment` | Get a single record by ID |
| PUT | `/api/adl/{id}/assessment` | Update a record by ID (re-runs CDSS) |
| GET | `/api/adl/data-alert/patient/{patient_id}` | Get the latest CDSS alerts for a patient |

---

## 📝 Request Body — POST `/api/adl`

All assessment fields are **optional strings**. Empty or null values are stored as `"N/A"`. CDSS alerts are generated automatically for each field — **do not send the `*_alert` fields**.

```json
{
  "patient_id": 1,
  "day_no": 3,
  "date": "2025-01-15",
  "mobility_assessment": "patient is unable to ambulate independently, requires assistance with transfers",
  "hygiene_assessment": "patient is unable to bathe self, full assistance required",
  "toileting_assessment": "incontinent of urine, requires bedpan assistance",
  "feeding_assessment": "patient can feed self with setup, uses adaptive utensils",
  "hydration_assessment": "oral intake adequate, drinking approximately 1200mL per day",
  "sleep_pattern_assessment": "patient reports difficulty sleeping, wakes frequently at night",
  "pain_level_assessment": "patient reports acute pain of 7/10, located at surgical site"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `patient_id` | integer | ✅ Yes | Must exist in `patients` table |
| `day_no` | integer | No | Hospital day number |
| `date` | string (Y-m-d) | No | Defaults to today's date |
| `mobility_assessment` | string | No | Patient's ability to move, ambulate, transfer |
| `hygiene_assessment` | string | No | Patient's ability to bathe and groom self |
| `toileting_assessment` | string | No | Patient's continence and toilet use |
| `feeding_assessment` | string | No | Patient's ability to eat and feed self |
| `hydration_assessment` | string | No | Patient's fluid intake and hydration status |
| `sleep_pattern_assessment` | string | No | Patient's sleep quality and patterns |
| `pain_level_assessment` | string | No | Patient's pain level, location, and description |

> **Upsert logic:** Records are matched by `patient_id + date`. If a record exists for that date it is updated; otherwise a new one is created.

---

## ✅ Response — POST 201 / PUT 200

```json
{
  "message": "ADL record saved",
  "data": {
    "id": 12,
    "patient_id": 1,
    "day_no": 3,
    "date": "2025-01-15",
    "mobility_assessment": "patient is unable to ambulate independently, requires assistance with transfers",
    "mobility_alert": "⚠️ WARNING: Risk for falls related to impaired physical mobility.",
    "hygiene_assessment": "patient is unable to bathe self, full assistance required",
    "hygiene_alert": "ℹ️ INFO: Bathing self-care deficit related to inability to wash body.",
    "toileting_assessment": "incontinent of urine, requires bedpan assistance",
    "toileting_alert": "ℹ️ INFO: Toileting self-care deficit related to impaired mobility.",
    "feeding_assessment": "patient can feed self with setup, uses adaptive utensils",
    "feeding_alert": "No findings.",
    "hydration_assessment": "oral intake adequate, drinking approximately 1200mL per day",
    "hydration_alert": "No findings.",
    "sleep_pattern_assessment": "patient reports difficulty sleeping, wakes frequently at night",
    "sleep_pattern_alert": "⚠️ WARNING: Disturbed sleep pattern related to pain or environmental factors.",
    "pain_level_assessment": "patient reports acute pain of 7/10, located at surgical site",
    "pain_level_alert": "⚠️ WARNING: Acute pain related to surgical incision.",
    "created_at": "2025-01-15T09:00:00.000000Z",
    "updated_at": "2025-01-15T09:00:00.000000Z"
  }
}
```

### Database Column Reference (`act_of_daily_living` table)

| Column | Type | Description |
|--------|------|-------------|
| `id` | integer | Auto-increment primary key |
| `patient_id` | integer | Foreign key → `patients.patient_id` |
| `day_no` | integer | Hospital day number |
| `date` | date | Date of assessment |
| `mobility_assessment` | text | Nurse-entered mobility finding |
| `mobility_alert` | text | CDSS alert for mobility (auto-populated) |
| `hygiene_assessment` | text | Nurse-entered hygiene finding |
| `hygiene_alert` | text | CDSS alert for hygiene (auto-populated) |
| `toileting_assessment` | text | Nurse-entered toileting finding |
| `toileting_alert` | text | CDSS alert for toileting (auto-populated) |
| `feeding_assessment` | text | Nurse-entered feeding finding |
| `feeding_alert` | text | CDSS alert for feeding (auto-populated) |
| `hydration_assessment` | text | Nurse-entered hydration finding |
| `hydration_alert` | text | CDSS alert for hydration (auto-populated) |
| `sleep_pattern_assessment` | text | Nurse-entered sleep pattern finding |
| `sleep_pattern_alert` | text | CDSS alert for sleep pattern (auto-populated) |
| `pain_level_assessment` | text | Nurse-entered pain assessment |
| `pain_level_alert` | text | CDSS alert for pain level (auto-populated) |
| `created_at` | timestamp | Auto-managed by Laravel |
| `updated_at` | timestamp | Auto-managed by Laravel |

> **Alert field naming rule:** Each `*_assessment` field has a corresponding `*_alert` field. The CDSS service maps `mobility_assessment` → `mobility_alert`, `hygiene_assessment` → `hygiene_alert`, etc. (strips `_assessment`, appends `_alert`).

---

## 📥 GET All Records — `/api/adl/patient/{patient_id}`

Returns all ADL records for the patient, ordered by most recent first.

```http
GET /api/adl/patient/1
Authorization: Bearer {token}
```

**Response:** Array of ADL record objects (same structure as the `data` object above).

---

## 📥 GET Single Record — `/api/adl/{id}/assessment`

```http
GET /api/adl/12/assessment
Authorization: Bearer {token}
```

Returns a single ADL record object.

---

## 🔄 PUT Update — `/api/adl/{id}/assessment`

Same request body as POST. CDSS re-runs automatically and all `*_alert` fields are updated.

```http
PUT /api/adl/12/assessment
Authorization: Bearer {token}
Content-Type: application/json

{
  "mobility_assessment": "patient can now stand with minimal assistance",
  "pain_level_assessment": "pain reduced to 4/10 after medication"
}
```

---

## 🚨 Data Alert — `/api/adl/data-alert/patient/{patient_id}`

Returns a combined CDSS alert string from the patient's **latest** ADL record. All non-empty, non-"N/A" alerts across all 7 fields are joined with `; `.

```http
GET /api/adl/data-alert/patient/1
Authorization: Bearer {token}
```

**Response:**
```json
{
  "alert": "Risk for falls related to impaired physical mobility.; Acute pain related to surgical incision.; Disturbed sleep pattern related to pain or environmental factors."
}
```

Returns `"No findings."` if all alert fields are empty or have no abnormalities.

---

## 🔬 CDSS Alert Engine — How It Works

The `ActOfDailyLivingCdssService` (`AdlCdssService`) runs on every save/update. It analyzes each assessment field using YAML-based keyword rules and stores the result in the corresponding `*_alert` column.

### Alert Examples by Field

#### `mobility_assessment`
| Input Keywords | Alert | Severity |
|----------------|-------|----------|
| `"impaired physical mobility"` | Risk for falls related to impaired physical mobility. | ⚠️ WARNING |
| `"unable to ambulate"` | Impaired physical mobility related to musculoskeletal impairment. | ⚠️ WARNING |
| `"paralysis"` / `"hemiplegia"` | Impaired physical mobility related to neuromuscular impairment. | 🚨 CRITICAL |

#### `hygiene_assessment`
| Input Keywords | Alert | Severity |
|----------------|-------|----------|
| `"unable to bathe"` / `"self-care deficit"` | Bathing self-care deficit related to inability to wash body. | ℹ️ INFO |
| `"skin breakdown"` / `"pressure ulcer"` | Risk for impaired skin integrity related to immobility. | ⚠️ WARNING |

#### `toileting_assessment`
| Input Keywords | Alert | Severity |
|----------------|-------|----------|
| `"incontinent"` | Toileting self-care deficit related to impaired mobility. | ℹ️ INFO |
| `"urinary retention"` | Urinary retention related to neurological impairment. | ⚠️ WARNING |

#### `feeding_assessment`
| Input Keywords | Alert | Severity |
|----------------|-------|----------|
| `"unable to feed"` / `"NPO"` | Feeding self-care deficit related to physical limitation. | ℹ️ INFO |
| `"dysphagia"` / `"difficulty swallowing"` | Risk for aspiration related to impaired swallowing reflex. | 🚨 CRITICAL |

#### `hydration_assessment`
| Input Keywords | Alert | Severity |
|----------------|-------|----------|
| `"poor intake"` / `"dehydrated"` | Risk for deficient fluid volume related to inadequate intake. | ⚠️ WARNING |
| `"refusing fluids"` | Deficient fluid volume related to patient's refusal to drink. | ⚠️ WARNING |

#### `sleep_pattern_assessment`
| Input Keywords | Alert | Severity |
|----------------|-------|----------|
| `"difficulty sleeping"` / `"insomnia"` | Disturbed sleep pattern related to pain or environmental factors. | ⚠️ WARNING |
| `"sleep deprivation"` | Sleep deprivation related to environmental disturbances. | ⚠️ WARNING |

#### `pain_level_assessment`
| Input Keywords | Alert | Severity |
|----------------|-------|----------|
| `"acute pain"` | Acute pain related to surgical incision. | ⚠️ WARNING |
| `"chronic pain"` | Chronic pain related to underlying disease process. | ⚠️ WARNING |
| `"severe pain"` / `"pain 8"` / `"pain 9"` / `"pain 10"` | Acute pain — severe (8–10/10). Immediate intervention required. | 🚨 CRITICAL |

### Alert Severity Levels

| Prefix | Severity | Meaning |
|--------|----------|---------|
| 🚨 `CRITICAL:` | Highest | Urgent — escalate immediately |
| ⚠️ `WARNING:` | High | Requires prompt attention |
| ℹ️ `INFO:` | Medium | Monitor or document |
| `No findings.` | None | No abnormality detected |

---

## 🧠 ADPIE / Nursing Diagnosis

After saving an ADL record, the ADPIE workflow can be initiated using the record's `id`. The CDSS analyzes nurse-entered clinical text across all four steps and stores recommendations automatically.

> **Do not change the alerts** — they are generated automatically by the CDSS engine.

### Step 1 — Initialize ADPIE Record

Creates (or retrieves) the `nursing_diagnoses` row linked to this ADL record.

```http
GET /api/adpie/adl/{adl_id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "ADPIE record initialized",
  "data": {
    "id": 15,
    "adl_id": 12,
    "patient_id": 1,
    "diagnosis": "",
    "diagnosis_alert": "",
    "planning": "",
    "planning_alert": "",
    "intervention": "",
    "intervention_alert": "",
    "evaluation": "",
    "evaluation_alert": "",
    "created_at": "2025-01-15T09:05:00.000000Z",
    "updated_at": "2025-01-15T09:05:00.000000Z"
  },
  "assessment": { ...act_of_daily_living record... }
}
```

### Step 2 — Analyze a Single ADPIE Field (Optional Live Preview)

```http
POST /api/adpie/analyze
Authorization: Bearer {token}
Content-Type: application/json

{
  "fieldName": "diagnosis",
  "finding": "patient has impaired physical mobility and acute pain at surgical site rated 7/10",
  "component": "adl"
}
```

Valid `fieldName` values: `diagnosis` · `planning` · `intervention` · `evaluation`

**Response:**
```json
{
  "level": "WARNING",
  "message": "RECOMMENDATION: Acute pain related to surgical incision affecting mobility.",
  "raw_message": "Acute pain related to surgical incision affecting mobility."
}
```

Returns `"No findings."` in `raw_message` if no CDSS rule matched.

### Step 3 — Analyze Multiple ADPIE Fields at Once

```http
POST /api/adpie/analyze-batch
Authorization: Bearer {token}
Content-Type: application/json

{
  "component": "adl",
  "batch": [
    { "fieldName": "diagnosis",    "finding": "impaired physical mobility, unable to ambulate, risk for falls" },
    { "fieldName": "planning",     "finding": "patient will ambulate 10 feet with assistance by end of shift" },
    { "fieldName": "intervention", "finding": "assist with ROM exercises; use gait belt for transfers; ensure call bell within reach" },
    { "fieldName": "evaluation",   "finding": "patient ambulated 15 feet with minimal assistance, no falls" }
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
PUT /api/adpie/15/diagnosis

{
  "diagnosis": "Impaired physical mobility related to post-operative pain as evidenced by inability to ambulate independently",
  "component": "adl"
}
```

#### Save Planning
```http
PUT /api/adpie/15/planning

{
  "planning": "Patient will demonstrate safe ambulation of 20 feet with assistive device by Day 2",
  "component": "adl"
}
```

#### Save Intervention
```http
PUT /api/adpie/15/intervention

{
  "intervention": "Assist with passive and active ROM exercises BID; encourage early ambulation with gait belt; maintain safe environment; educate on fall prevention",
  "component": "adl"
}
```

#### Save Evaluation
```http
PUT /api/adpie/15/evaluation

{
  "evaluation": "Patient ambulated 25 feet with gait belt and one assist on Day 2. Goal met. No falls reported.",
  "component": "adl"
}
```

**Response for each PUT:**
```json
{
  "message": "Diagnosis updated",
  "data": {
    "id": 15,
    "adl_id": 12,
    "patient_id": 1,
    "diagnosis": "Impaired physical mobility related to post-operative pain as evidenced by inability to ambulate independently",
    "diagnosis_alert": "Risk for falls related to impaired physical mobility.",
    "planning": "",
    "planning_alert": "",
    "intervention": "",
    "intervention_alert": "",
    "evaluation": "",
    "evaluation_alert": "",
    "updated_at": "2025-01-15T09:10:00.000000Z"
  },
  "recommendation": {
    "level": "WARNING",
    "message": "RECOMMENDATION: Risk for falls related to impaired physical mobility.",
    "raw_message": "Risk for falls related to impaired physical mobility."
  }
}
```

### `nursing_diagnoses` Table — Field Reference

| Column | Type | Description |
|--------|------|-------------|
| `id` | integer | Auto-increment primary key |
| `adl_id` | integer | Foreign key → `act_of_daily_living.id` |
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
1. POST /api/adl
   → Saves record to `act_of_daily_living` table
   → CDSS auto-populates all 7 *_alert columns
   → Response includes { data.id, data.mobility_alert, data.pain_level_alert, ... }

2. GET /api/adpie/adl/{data.id}
   → Creates row in `nursing_diagnoses` with adl_id

3. PUT /api/adpie/{nursing_diagnosis.id}/diagnosis
   → Saves nurse diagnosis + CDSS alert in diagnosis_alert

4. PUT /api/adpie/{nursing_diagnosis.id}/planning
   → Saves planning + CDSS alert in planning_alert

5. PUT /api/adpie/{nursing_diagnosis.id}/intervention
   → Saves intervention + CDSS alert in intervention_alert

6. PUT /api/adpie/{nursing_diagnosis.id}/evaluation
   → Saves evaluation + CDSS alert in evaluation_alert
```
