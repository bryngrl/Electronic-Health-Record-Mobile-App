# 🔬 Lab Values — Nurse API Documentation

**Base URL:** `http://your-domain.com/api`  
**Auth:** All routes require `Authorization: Bearer {token}` header.  
**Database Table:** `lab_values`  
**Model:** `App\Models\LabValues`

---

## 📋 Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/lab-values` | Save or update a lab values record (runs CDSS automatically) |
| GET | `/api/lab-values/patient/{patient_id}` | Get all lab records for a patient |
| GET | `/api/lab-values/{id}/assessment` | Get a single record by ID |
| PUT | `/api/lab-values/{id}/assessment` | Update a record by ID (re-runs CDSS) |
| GET | `/api/lab-values/data-alert/patient/{patient_id}` | Get combined CDSS alerts for a patient |

---

## 📝 Request Body — POST `/api/lab-values`

All result and normal range fields are **optional**. CDSS alerts are generated automatically for each parameter — **do not send the `*_alert` fields**. The CDSS is age-group aware and uses the patient's age to determine reference ranges automatically.

```json
{
  "patient_id": 1,
  "wbc_result": 3.2,
  "wbc_normal_range": "4.0-11.0 x10³/µL",
  "rbc_result": 3.8,
  "rbc_normal_range": "4.5-5.5 x10⁶/µL",
  "hgb_result": 9.5,
  "hgb_normal_range": "13.5-17.5 g/dL",
  "hct_result": 28.0,
  "hct_normal_range": "41-53%",
  "platelets_result": 45,
  "platelets_normal_range": "150-400 x10³/µL",
  "mcv_result": 72,
  "mcv_normal_range": "80-100 fL",
  "mch_result": 24,
  "mch_normal_range": "27-33 pg",
  "mchc_result": 30,
  "mchc_normal_range": "32-36 g/dL",
  "rdw_result": 16,
  "rdw_normal_range": "11.5-14.5%",
  "neutrophils_result": 80,
  "neutrophils_normal_range": "50-70%",
  "lymphocytes_result": 15,
  "lymphocytes_normal_range": "20-40%",
  "monocytes_result": 3,
  "monocytes_normal_range": "2-8%",
  "eosinophils_result": 1,
  "eosinophils_normal_range": "1-4%",
  "basophils_result": 1,
  "basophils_normal_range": "0-1%"
}
```

### Field Reference Table

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `patient_id` | integer | ✅ Yes | Must exist in `patients` table |
| `wbc_result` | numeric | No | White Blood Cell count (x10³/µL) |
| `wbc_normal_range` | string (max 50) | No | Normal range label (e.g. `"4.0-11.0 x10³/µL"`) |
| `rbc_result` | numeric | No | Red Blood Cell count (x10⁶/µL) |
| `rbc_normal_range` | string (max 50) | No | Normal range label |
| `hgb_result` | numeric | No | Hemoglobin (g/dL) |
| `hgb_normal_range` | string (max 50) | No | Normal range label |
| `hct_result` | numeric | No | Hematocrit (%) |
| `hct_normal_range` | string (max 50) | No | Normal range label |
| `platelets_result` | numeric | No | Platelet count (x10³/µL) |
| `platelets_normal_range` | string (max 50) | No | Normal range label |
| `mcv_result` | numeric | No | Mean Corpuscular Volume (fL) |
| `mcv_normal_range` | string (max 50) | No | Normal range label |
| `mch_result` | numeric | No | Mean Corpuscular Hemoglobin (pg) |
| `mch_normal_range` | string (max 50) | No | Normal range label |
| `mchc_result` | numeric | No | Mean Corpuscular Hemoglobin Concentration (g/dL) |
| `mchc_normal_range` | string (max 50) | No | Normal range label |
| `rdw_result` | numeric | No | Red Cell Distribution Width (%) |
| `rdw_normal_range` | string (max 50) | No | Normal range label |
| `neutrophils_result` | numeric | No | Neutrophils (%) |
| `neutrophils_normal_range` | string (max 50) | No | Normal range label |
| `lymphocytes_result` | numeric | No | Lymphocytes (%) |
| `lymphocytes_normal_range` | string (max 50) | No | Normal range label |
| `monocytes_result` | numeric | No | Monocytes (%) |
| `monocytes_normal_range` | string (max 50) | No | Normal range label |
| `eosinophils_result` | numeric | No | Eosinophils (%) |
| `eosinophils_normal_range` | string (max 50) | No | Normal range label |
| `basophils_result` | numeric | No | Basophils (%) |
| `basophils_normal_range` | string (max 50) | No | Normal range label |

> **Upsert logic:** Records are matched by `patient_id` only (one lab record per patient). Submitting again updates the existing record.

---

## ✅ Response — POST 201 / PUT 200

```json
{
  "message": "Lab Values saved",
  "data": {
    "id": 6,
    "patient_id": 1,
    "wbc_result": "3.2",
    "wbc_normal_range": "4.0-11.0 x10³/µL",
    "wbc_alert": "🚨 CRITICAL: Leukopenia (Adult): WBC 3.2 — Significant risk of infection.",
    "rbc_result": "3.8",
    "rbc_normal_range": "4.5-5.5 x10⁶/µL",
    "rbc_alert": "⚠️ WARNING: Low RBC count. Possible anemia — evaluate further.",
    "hgb_result": "9.5",
    "hgb_normal_range": "13.5-17.5 g/dL",
    "hgb_alert": "🚨 CRITICAL: Anemia: Hgb 9.5 — Significant drop. Check for iron deficiency or blood loss.",
    "hct_result": "28.0",
    "hct_normal_range": "41-53%",
    "hct_alert": "⚠️ WARNING: Low hematocrit. Possible anemia.",
    "platelets_result": "45",
    "platelets_normal_range": "150-400 x10³/µL",
    "platelets_alert": "🚨 CRITICAL: Severe Thrombocytopenia: Platelets 45 — Risk for spontaneous bleeding.",
    "mcv_result": "72",
    "mcv_normal_range": "80-100 fL",
    "mcv_alert": "⚠️ WARNING: Microcytosis detected. Consider iron deficiency or thalassemia.",
    "mch_result": "24",
    "mch_normal_range": "27-33 pg",
    "mch_alert": "⚠️ WARNING: Low MCH — Hypochromic anemia suspected.",
    "mchc_result": "30",
    "mchc_normal_range": "32-36 g/dL",
    "mchc_alert": "⚠️ WARNING: Low MCHC — Hypochromic anemia suspected.",
    "rdw_result": "16",
    "rdw_normal_range": "11.5-14.5%",
    "rdw_alert": "ℹ️ INFO: Elevated RDW — Anisocytosis present. Mixed deficiency possible.",
    "neutrophils_result": "80",
    "neutrophils_normal_range": "50-70%",
    "neutrophils_alert": "⚠️ WARNING: Neutrophilia detected. Possible bacterial infection or inflammation.",
    "lymphocytes_result": "15",
    "lymphocytes_normal_range": "20-40%",
    "lymphocytes_alert": "⚠️ WARNING: Lymphopenia detected. Evaluate immune status.",
    "monocytes_result": "3",
    "monocytes_normal_range": "2-8%",
    "monocytes_alert": "No findings.",
    "eosinophils_result": "1",
    "eosinophils_normal_range": "1-4%",
    "eosinophils_alert": "No findings.",
    "basophils_result": "1",
    "basophils_normal_range": "0-1%",
    "basophils_alert": "No findings.",
    "created_at": "2025-01-15T11:00:00.000000Z",
    "updated_at": "2025-01-15T11:00:00.000000Z"
  }
}
```

### Database Column Reference (`lab_values` table)

| Column | Type | Description |
|--------|------|-------------|
| `id` | integer | Auto-increment primary key |
| `patient_id` | integer | Foreign key → `patients.patient_id` |
| `wbc_result` | string/numeric | WBC result value |
| `wbc_normal_range` | string | WBC normal range label |
| `wbc_alert` | text | CDSS alert for WBC (auto-populated) |
| `rbc_result` | string/numeric | RBC result value |
| `rbc_normal_range` | string | RBC normal range label |
| `rbc_alert` | text | CDSS alert for RBC (auto-populated) |
| `hgb_result` | string/numeric | Hemoglobin result value |
| `hgb_normal_range` | string | Hgb normal range label |
| `hgb_alert` | text | CDSS alert for Hgb (auto-populated) |
| `hct_result` | string/numeric | Hematocrit result value |
| `hct_normal_range` | string | Hct normal range label |
| `hct_alert` | text | CDSS alert for Hct (auto-populated) |
| `platelets_result` | string/numeric | Platelet count result |
| `platelets_normal_range` | string | Platelets normal range label |
| `platelets_alert` | text | CDSS alert for platelets (auto-populated) |
| `mcv_result` | string/numeric | MCV result value |
| `mcv_normal_range` | string | MCV normal range label |
| `mcv_alert` | text | CDSS alert for MCV (auto-populated) |
| `mch_result` | string/numeric | MCH result value |
| `mch_normal_range` | string | MCH normal range label |
| `mch_alert` | text | CDSS alert for MCH (auto-populated) |
| `mchc_result` | string/numeric | MCHC result value |
| `mchc_normal_range` | string | MCHC normal range label |
| `mchc_alert` | text | CDSS alert for MCHC (auto-populated) |
| `rdw_result` | string/numeric | RDW result value |
| `rdw_normal_range` | string | RDW normal range label |
| `rdw_alert` | text | CDSS alert for RDW (auto-populated) |
| `neutrophils_result` | string/numeric | Neutrophils result (%) |
| `neutrophils_normal_range` | string | Neutrophils normal range label |
| `neutrophils_alert` | text | CDSS alert for neutrophils (auto-populated) |
| `lymphocytes_result` | string/numeric | Lymphocytes result (%) |
| `lymphocytes_normal_range` | string | Lymphocytes normal range label |
| `lymphocytes_alert` | text | CDSS alert for lymphocytes (auto-populated) |
| `monocytes_result` | string/numeric | Monocytes result (%) |
| `monocytes_normal_range` | string | Monocytes normal range label |
| `monocytes_alert` | text | CDSS alert for monocytes (auto-populated) |
| `eosinophils_result` | string/numeric | Eosinophils result (%) |
| `eosinophils_normal_range` | string | Eosinophils normal range label |
| `eosinophils_alert` | text | CDSS alert for eosinophils (auto-populated) |
| `basophils_result` | string/numeric | Basophils result (%) |
| `basophils_normal_range` | string | Basophils normal range label |
| `basophils_alert` | text | CDSS alert for basophils (auto-populated) |
| `created_at` | timestamp | Auto-managed by Laravel |
| `updated_at` | timestamp | Auto-managed by Laravel |

---

## 📥 GET All Records — `/api/lab-values/patient/{patient_id}`

Returns all lab value records for the patient, ordered by most recent first.

```http
GET /api/lab-values/patient/1
Authorization: Bearer {token}
```

**Response:** Array of lab value record objects (same structure as the `data` object above).

---

## 📥 GET Single Record — `/api/lab-values/{id}/assessment`

```http
GET /api/lab-values/6/assessment
Authorization: Bearer {token}
```

Returns a single lab values record object.

---

## 🔄 PUT Update — `/api/lab-values/{id}/assessment`

Same request body as POST. CDSS re-runs automatically and all `*_alert` fields are updated.

```http
PUT /api/lab-values/6/assessment
Authorization: Bearer {token}
Content-Type: application/json

{
  "wbc_result": 5.2,
  "hgb_result": 12.0,
  "platelets_result": 180
}
```

---

## 🚨 Data Alert — `/api/lab-values/data-alert/patient/{patient_id}`

Returns a combined CDSS alert string from the patient's **latest** lab values record. All non-empty, non-"No findings." alerts across all 14 parameters are joined with `; `.

```http
GET /api/lab-values/data-alert/patient/1
Authorization: Bearer {token}
```

**Response:**
```json
{
  "alert": "Leukopenia (Adult): WBC 3.2 — Significant risk of infection.; Anemia: Hgb 9.5 — Check for iron deficiency.; Severe Thrombocytopenia: Platelets 45 — Risk for spontaneous bleeding."
}
```

Returns `"No findings."` if all alert fields are normal.

---

## 🔬 CDSS Alert Engine — How It Works

The `LabValuesCdssService` is **age-group aware**. It automatically determines the patient's age group using their `birthdate` from the `patients` table, then compares each lab result against the age-appropriate reference range.

### Age Groups

| Age Group | Age Range |
|-----------|-----------|
| `neonate` | 0–30 days |
| `infant` | 1 month – 2 years |
| `child` | 2 years – 12 years |
| `adolescent` | 12 years – 18 years |
| `adult` | > 18 years |

### Age-Specific Reference Ranges (Key Parameters)

| Parameter | Neonate | Infant | Child | Adolescent | Adult |
|-----------|---------|--------|-------|------------|-------|
| WBC (x10³/µL) | 9.0–34.0 | 6.0–17.5 | 4.0–15.5 | 4.0–13.5 | 4.0–11.0 |
| Hgb (g/dL) | 13.5–24.0 | 9.0–14.0 | 11.5–15.5 | 12.0–16.1 | 13.5–17.5 |
| Platelets (x10³/µL) | 150–400 | 150–400 | 150–400 | 150–400 | 150–400 |

### Alert Examples by Parameter

| Parameter | Condition | Threshold (Adult) | Alert | Severity |
|-----------|-----------|-------------------|-------|----------|
| `wbc_result` | Leukopenia | < 4.0 | Leukopenia: Significant risk of infection. | 🚨 CRITICAL |
| `wbc_result` | Leukocytosis | > 11.0 | Leukocytosis: Possible infection or inflammatory process. | ⚠️ WARNING |
| `rbc_result` | Low RBC | < 4.5 (M) / < 4.0 (F) | Low RBC count. Possible anemia. | ⚠️ WARNING |
| `hgb_result` | Severe Anemia | < 8.0 | Severe Anemia — Immediate intervention required. | 🚨 CRITICAL |
| `hgb_result` | Moderate Anemia | < 10.0 | Anemia — Significant drop. Check for iron deficiency or blood loss. | 🚨 CRITICAL |
| `hgb_result` | Mild Anemia | < 12.0 | Mild Anemia — Monitor closely. | ⚠️ WARNING |
| `hct_result` | Low | < 41% | Low hematocrit. Possible anemia. | ⚠️ WARNING |
| `platelets_result` | Severe Thrombocytopenia | < 50 | Severe Thrombocytopenia — Risk for spontaneous bleeding. | 🚨 CRITICAL |
| `platelets_result` | Thrombocytopenia | < 150 | Thrombocytopenia — Risk for Bleeding. | 🚨 CRITICAL |
| `platelets_result` | Thrombocytosis | > 400 | Thrombocytosis — Risk for thrombosis. | ⚠️ WARNING |
| `mcv_result` | Microcytosis | < 80 fL | Microcytosis — Consider iron deficiency or thalassemia. | ⚠️ WARNING |
| `mcv_result` | Macrocytosis | > 100 fL | Macrocytosis — Consider B12/folate deficiency. | ⚠️ WARNING |
| `neutrophils_result` | Neutrophilia | > 70% | Neutrophilia — Possible bacterial infection or inflammation. | ⚠️ WARNING |
| `neutrophils_result` | Neutropenia | < 50% | Neutropenia — Increased infection risk. | 🚨 CRITICAL |
| `lymphocytes_result` | Lymphopenia | < 20% | Lymphopenia — Evaluate immune status. | ⚠️ WARNING |
| `lymphocytes_result` | Lymphocytosis | > 40% | Lymphocytosis — Possible viral infection. | ⚠️ WARNING |

> The `LabValuesCdssService` contains 370+ comprehensive rules including renal, hepatic, cardiac, and metabolic markers not listed above.

### Alert Severity Levels

| Prefix | Severity | Meaning |
|--------|----------|---------|
| 🚨 `CRITICAL:` | Highest | Urgent — escalate immediately |
| ⚠️ `WARNING:` | High | Requires prompt attention |
| ℹ️ `INFO:` | Medium | Monitor or document |
| `No findings.` | None | No abnormality detected |

---

## 🧠 ADPIE / Nursing Diagnosis

After saving a lab values record, the ADPIE workflow can be initiated using the record's `id`. The CDSS analyzes nurse-entered clinical text across all four steps and stores recommendations automatically.

> **Do not change the alerts** — they are generated automatically by the CDSS engine.

### Step 1 — Initialize ADPIE Record

Creates (or retrieves) the `nursing_diagnoses` row linked to this lab values record.

```http
GET /api/adpie/lab-values/{lab_values_id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "ADPIE record initialized",
  "data": {
    "id": 20,
    "lab_values_id": 6,
    "patient_id": 1,
    "diagnosis": "",
    "diagnosis_alert": "",
    "planning": "",
    "planning_alert": "",
    "intervention": "",
    "intervention_alert": "",
    "evaluation": "",
    "evaluation_alert": "",
    "created_at": "2025-01-15T11:05:00.000000Z",
    "updated_at": "2025-01-15T11:05:00.000000Z"
  },
  "assessment": { ...lab_values record... }
}
```

### Step 2 — Analyze a Single ADPIE Field (Optional Live Preview)

```http
POST /api/adpie/analyze
Authorization: Bearer {token}
Content-Type: application/json

{
  "fieldName": "diagnosis",
  "finding": "patient has leukopenia with WBC 3.2 and severe thrombocytopenia with platelets at 45",
  "component": "lab-values"
}
```

Valid `fieldName` values: `diagnosis` · `planning` · `intervention` · `evaluation`

**Response:**
```json
{
  "level": "CRITICAL",
  "message": "RECOMMENDATION: Risk for Infection related to low white blood cell count.",
  "raw_message": "Risk for Infection related to low white blood cell count."
}
```

Returns `"No findings."` in `raw_message` if no CDSS rule matched.

### Step 3 — Analyze Multiple ADPIE Fields at Once

```http
POST /api/adpie/analyze-batch
Authorization: Bearer {token}
Content-Type: application/json

{
  "component": "lab-values",
  "batch": [
    { "fieldName": "diagnosis",    "finding": "leukopenia, anemia, thrombocytopenia, risk for infection and bleeding" },
    { "fieldName": "planning",     "finding": "patient will remain free from infection and bleeding complications" },
    { "fieldName": "intervention", "finding": "monitor CBC daily; implement neutropenic precautions; bleeding precautions; avoid IM injections" },
    { "fieldName": "evaluation",   "finding": "no signs of infection or bleeding after 48 hours, CBC trending upward" }
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
PUT /api/adpie/20/diagnosis

{
  "diagnosis": "Risk for Infection related to leukopenia as evidenced by WBC 3.2 x10³/µL",
  "component": "lab-values"
}
```

#### Save Planning
```http
PUT /api/adpie/20/planning

{
  "planning": "Patient will remain free from signs and symptoms of infection throughout hospitalization",
  "component": "lab-values"
}
```

#### Save Intervention
```http
PUT /api/adpie/20/intervention

{
  "intervention": "Implement neutropenic precautions; strict hand hygiene; monitor temperature q4h; restrict visitors with illness; administer G-CSF as ordered; daily CBC monitoring",
  "component": "lab-values"
}
```

#### Save Evaluation
```http
PUT /api/adpie/20/evaluation

{
  "evaluation": "Patient remained afebrile. No signs of infection noted. WBC trending up to 4.5 after 48 hours. Goal met.",
  "component": "lab-values"
}
```

**Response for each PUT:**
```json
{
  "message": "Diagnosis updated",
  "data": {
    "id": 20,
    "lab_values_id": 6,
    "patient_id": 1,
    "diagnosis": "Risk for Infection related to leukopenia as evidenced by WBC 3.2 x10³/µL",
    "diagnosis_alert": "Risk for Infection related to low white blood cell count.",
    "planning": "",
    "planning_alert": "",
    "intervention": "",
    "intervention_alert": "",
    "evaluation": "",
    "evaluation_alert": "",
    "updated_at": "2025-01-15T11:10:00.000000Z"
  },
  "recommendation": {
    "level": "CRITICAL",
    "message": "RECOMMENDATION: Risk for Infection related to low white blood cell count.",
    "raw_message": "Risk for Infection related to low white blood cell count."
  }
}
```

### `nursing_diagnoses` Table — Field Reference

| Column | Type | Description |
|--------|------|-------------|
| `id` | integer | Auto-increment primary key |
| `lab_values_id` | integer | Foreign key → `lab_values.id` |
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
1. POST /api/lab-values
   → Saves record to `lab_values` table
   → CDSS auto-populates all 14 *_alert columns (age-group aware)
   → Response includes { data.id, data.wbc_alert, data.hgb_alert, ... }

2. GET /api/adpie/lab-values/{data.id}
   → Creates row in `nursing_diagnoses` with lab_values_id

3. PUT /api/adpie/{nursing_diagnosis.id}/diagnosis
   → Saves nurse diagnosis + CDSS alert in diagnosis_alert

4. PUT /api/adpie/{nursing_diagnosis.id}/planning
   → Saves planning + CDSS alert in planning_alert

5. PUT /api/adpie/{nursing_diagnosis.id}/intervention
   → Saves intervention + CDSS alert in intervention_alert

6. PUT /api/adpie/{nursing_diagnosis.id}/evaluation
   → Saves evaluation + CDSS alert in evaluation_alert
```
