# 📋 Electronic Health Record — API Documentation

> **Base URL:** `http://your-domain.com/api`
> **Authentication:** Bearer Token (Laravel Sanctum)
> **Content-Type:** `application/json`

---

## 🔐 Authentication

All endpoints require a `Bearer` token **except** `/api/auth/login`.

**Request Header:**
```
Authorization: Bearer {access_token}
```

---

## 1. Auth — `AuthController`

### `POST /api/auth/login`
Authenticate a user and receive an access token.

**Public endpoint — no token required.**

**Request Body:**
```json
{
  "email": "nurse@example.com",
  "password": "secret"
}
```
> You may use `email` or `username` as the identifier field.

**Response `200 OK`:**
```json
{
  "access_token": "1|abc123...",
  "role": "nurse",
  "full_name": "Juan Dela Cruz",
  "user_id": 1
}
```

**Error `401 Unauthorized`:**
```json
{
  "message": "Invalid credentials"
}
```

---

## 2. Patients — `PatientApiController`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patient` | List active patients (supports search & pagination) |
| GET | `/api/patient/{id}` | Get a single patient |
| POST | `/api/patient` | Create a new patient |
| PUT | `/api/patient/{id}` | Update patient details |
| POST | `/api/patient/{id}/toggle-status` | Activate or deactivate a patient |

---

### `GET /api/patient`
List patients. By default only returns **active** patients.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `all` | boolean | Set `true` to include inactive patients |
| `search` | string | Filter by first name, last name, or patient ID |

**Example:**
```
GET /api/patient?search=Juan&all=false
```

**Response `200 OK`:**
```json
[
  {
    "id": "P001",
    "first_name": "Juan",
    "last_name": "Dela Cruz",
    "age": 45,
    "sex": "Male",
    "birthdate": "1979-06-01",
    "admission_date": "2024-01-10",
    "is_active": true
  }
]
```

---

### `GET /api/patient/{id}`
Get a single patient record.

**Response `200 OK`:**
```json
{
  "id": "P001",
  "first_name": "Juan",
  "last_name": "Dela Cruz",
  "age": 45,
  "sex": "Male",
  "birthdate": "1979-06-01",
  "admission_date": "2024-01-10",
  "is_active": true
}
```

---

### `POST /api/patient`
Create a new patient.

**Request Body:**
```json
{
  "first_name": "Juan",
  "last_name": "Dela Cruz",
  "age": 45,
  "birthdate": "1979-06-01",
  "sex": "Male",
  "admission_date": "2024-01-10"
}
```

**Validation Rules:**
- `first_name`: required, string
- `last_name`: required, string
- `age`: required, integer
- `birthdate`: required, date
- `sex`: required, string
- `admission_date`: required, date

**Response `201 Created`:**
```json
{
  "message": "Patient created successfully.",
  "data": { /* patient object */ }
}
```

---

### `PUT /api/patient/{id}`
Update a patient's details. Accepts the same fields as `POST /api/patient`.

---

### `POST /api/patient/{id}/toggle-status`
Activate or deactivate a patient.

**Request Body:**
```json
{
  "is_active": false
}
```

**Response `200 OK`:**
```json
{
  "message": "Patient deactivated."
}
```

> ⚠️ Deactivating a patient also soft-deletes the record.

---

## 3. Vital Signs — `VitalSignsApiController`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vital-signs/patient/{patient_id}` | Get vital signs history |
| GET | `/api/vital-signs/{id}/assessment` | Get a single vitals record |
| POST | `/api/vital-signs` | Create or update vitals (upsert by patient + date + time) |
| PUT | `/api/vital-signs/{id}/assessment` | Update a specific vitals record |

---

### `GET /api/vital-signs/patient/{patient_id}`

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "patient_id": "P001",
    "date": "2024-01-15",
    "time": "08:00",
    "temperature": "37.5",
    "hr": "80",
    "rr": "18",
    "bp": "120/80",
    "spo2": "98",
    "alerts": "HR is within normal range."
  }
]
```

---

### `POST /api/vital-signs`
Creates or updates vitals (upsert by `patient_id + date + time`).

**Request Body:**
```json
{
  "patient_id": "P001",
  "date": "2024-01-15",
  "time": "08:00",
  "temperature": 37.5,
  "hr": 80,
  "rr": 18,
  "bp": "120/80",
  "spo2": 98
}
```

> If `date` or `time` are omitted, current date/time is used.
> Empty/null fields are stored as `"N/A"`.
> CDSS analysis runs automatically on save and is stored in the `alerts` field.

**Response `200 OK`:**
```json
{
  "message": "Vitals saved.",
  "data": { /* vitals object with alerts */ }
}
```

---

## 4. Physical Exam — `PhysicalExamApiController`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/physical-exam/patient/{patient_id}` | Get exam history |
| GET | `/api/physical-exam/{id}/assessment` | Get single exam record |
| POST | `/api/physical-exam` | Create or update exam (upsert by patient + date) |
| PUT | `/api/physical-exam/{id}/assessment` | Update a specific exam record |

---

### `POST /api/physical-exam`
**Request Body:**
```json
{
  "patient_id": "P001",
  "general_appearance": "Alert and oriented",
  "skin": "Warm, dry, intact",
  "eye": "PERRLA",
  "oral": "Moist mucous membranes",
  "cardiovascular": "Regular rate and rhythm",
  "abdomen": "Soft, non-tender",
  "extremities": "No edema",
  "neurological": "GCS 15"
}
```

> CDSS alerts are auto-generated and stored in `general_appearance_alert`, `skin_alert`, etc.

---

## 5. Activities of Daily Living (ADL) — `AdlApiController`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/adl/patient/{patient_id}` | Get ADL history |
| GET | `/api/adl/{id}/assessment` | Get single ADL record |
| POST | `/api/adl` | Create or update ADL (upsert by patient + date) |
| PUT | `/api/adl/{id}/assessment` | Update a specific ADL record |

---

### `POST /api/adl`
**Request Body:**
```json
{
  "patient_id": "P001",
  "date": "2024-01-15",
  "mobility": "Independent",
  "hygiene": "Needs assistance",
  "toileting": "Independent",
  "feeding": "Independent",
  "hydration": "Adequate",
  "sleep_pattern": "6-8 hrs",
  "pain_level": "2/10"
}
```

> CDSS alerts stored in `mobility_alert`, `hygiene_alert`, etc.

---

## 6. Intake & Output — `IntakeOutputApiController`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/intake-and-output/patient/{patient_id}` | Get I&O history |
| GET | `/api/intake-and-output/{id}/assessment` | Get single record |
| POST | `/api/intake-and-output` | Create or update record (upsert by patient + day_no) |
| PUT | `/api/intake-and-output/{id}/assessment` | Update a specific record |

---

### `POST /api/intake-and-output`
**Request Body:**
```json
{
  "patient_id": "P001",
  "day_no": 1,
  "oral_intake": "1200",
  "iv_intake": "500",
  "urine_output": "800",
  "other_output": "200"
}
```

> If `day_no` is omitted, defaults to `1`.
> CDSS result stored in single `alert` field.

---

## 7. Lab Values — `LabValuesApiController`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lab-values/patient/{patient_id}` | Get lab values history |
| GET | `/api/lab-values/{id}/assessment` | Get single record |
| POST | `/api/lab-values` | Create or update lab values (one record per patient) |
| PUT | `/api/lab-values/{id}/assessment` | Update a specific record |

---

### `POST /api/lab-values`
**Request Body:**
```json
{
  "patient_id": "P001",
  "wbc": "8.0",
  "rbc": "4.5",
  "hemoglobin": "13.5",
  "hematocrit": "40",
  "platelet": "250",
  "sodium": "138",
  "potassium": "4.0",
  "creatinine": "0.9",
  "glucose": "95"
}
```

> CDSS runs age-based analysis; stores per-lab alerts in `wbc_alert`, `rbc_alert`, etc.

---

## 8. Medical History — `MedicalHistoryApiController`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/medical-history/patient/{patient_id}` | Get all 5 history categories at once |
| GET | `/api/medical-history/present-illness/{id}` | Get present illness |
| POST | `/api/medical-history/present-illness` | Create/update present illness |
| PUT | `/api/medical-history/present-illness/{id}` | Update by record ID |
| GET | `/api/medical-history/past-history/{id}` | Get past medical/surgical history |
| POST | `/api/medical-history/past-history` | Create/update past history |
| PUT | `/api/medical-history/past-history/{id}` | Update by record ID |
| GET | `/api/medical-history/allergies/{id}` | Get allergies |
| POST | `/api/medical-history/allergies` | Create/update allergies |
| PUT | `/api/medical-history/allergies/{id}` | Update by record ID |
| GET | `/api/medical-history/vaccination/{id}` | Get vaccination history |
| POST | `/api/medical-history/vaccination` | Create/update vaccination |
| PUT | `/api/medical-history/vaccination/{id}` | Update by record ID |
| GET | `/api/medical-history/developmental/{id}` | Get developmental history |
| POST | `/api/medical-history/developmental` | Create/update developmental history |
| PUT | `/api/medical-history/developmental/{id}` | Update by record ID |

---

### `GET /api/medical-history/patient/{patient_id}`
Returns **all 5 categories** in a single request.

**Response `200 OK`:**
```json
{
  "present_illness": { /* PresentIllness record */ },
  "past_history": { /* PastMedicalSurgical record */ },
  "allergies": { /* Allergy record */ },
  "vaccination": { /* Vaccination record */ },
  "developmental": { /* DevelopmentalHistory record */ }
}
```

---

### `POST /api/medical-history/present-illness`
All `store*` methods use `updateOrCreate` with `patient_id` — only one record per patient per category.

**Request Body:**
```json
{
  "patient_id": "P001",
  "chief_complaint": "Chest pain",
  "history_of_present_illness": "Patient presents with..."
}
```

---

## 9. Medication Administration — `MedicationAdministrationApiController`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/medication-administration/patient/{patient_id}` | Get full med admin history |
| GET | `/api/medication-administration/patient/{patient_id}/time/{time}` | Get meds for specific time slot |
| GET | `/api/medication-administration/{id}` | Get single record |
| POST | `/api/medication-administration` | Create or update med record |
| PUT | `/api/medication-administration/{id}` | Update by record ID |

---

### `GET /api/medication-administration/patient/{patient_id}/time/{time}`

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `date` | date | Filter by date (YYYY-MM-DD) |

**Example:**
```
GET /api/medication-administration/patient/P001/time/08:00?date=2024-01-15
```

**Response `200 OK` (record exists):**
```json
{
  "exists": true,
  "id": 1,
  "patient_id": "P001",
  "date": "2024-01-15",
  "time": "08:00:00",
  "medication": "Metformin",
  "dose": "500mg",
  "route": "PO",
  "frequency": "BID",
  "comments": "Give with food"
}
```

**Response `200 OK` (no record):**
```json
{
  "exists": false
}
```

---

### `POST /api/medication-administration`
Upsert by `patient_id + date + time`.

**Request Body:**
```json
{
  "patient_id": "P001",
  "date": "2024-01-15",
  "time": "08:00",
  "medication": "Metformin",
  "dose": "500mg",
  "route": "PO",
  "frequency": "BID",
  "comments": "Give with food"
}
```

> Time is automatically normalized from `HH:mm` to `HH:mm:ss`.

---

## 10. Medication Reconciliation — `MedicationReconciliationApiController`

> ⚠️ This controller supports **3 route prefix aliases**:
> - `/api/medication-reconciliation/...`
> - `/api/medical-reconciliation/...`
> - `/api/medicalreconciliation/...`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/medication-reconciliation/patient/{patient_id}` | Get all 3 med categories at once |
| GET | `/api/medication-reconciliation/current/{id}` | Get current medications |
| POST | `/api/medication-reconciliation/current` | Create/update current meds |
| PUT | `/api/medication-reconciliation/current/{id}` | Update by record ID |
| GET | `/api/medication-reconciliation/home/{id}` | Get home medications |
| POST | `/api/medication-reconciliation/home` | Create/update home meds |
| GET | `/api/medication-reconciliation/changes/{id}` | Get medication changes |
| POST | `/api/medication-reconciliation/changes` | Create/update med changes |

---

### `GET /api/medication-reconciliation/patient/{patient_id}`
Returns all 3 categories in one response.

**Response `200 OK`:**
```json
{
  "current": { /* CurrentMedication record */ },
  "home": { /* HomeMedication record */ },
  "changes": { /* ChangesInMedication record */ }
}
```

---

## 11. Clinical Records — `ClinicalRecordApiController`

### IVs & Lines

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ivs-and-lines/patient/{patient_id}` | Get all IV records for patient |
| GET | `/api/ivs-and-lines/{id}` | Get a single IV record |
| POST | `/api/ivs-and-lines` | Create a new IV record |
| PUT | `/api/ivs-and-lines/{id}` | Update an IV record |

### `POST /api/ivs-and-lines`
**Request Body:**
```json
{
  "patient_id": "P001",
  "iv_type": "Peripheral",
  "site": "Left forearm",
  "gauge": "20G",
  "date_inserted": "2024-01-15",
  "date_removed": null,
  "solution": "D5W",
  "rate": "125 mL/hr"
}
```

**Response `201 Created`:**
```json
{
  "message": "IV record saved.",
  "data": { /* IvsAndLine record */ }
}
```

---

### Discharge Planning

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/discharge-planning/patient/{patient_id}` | Get discharge plan |
| POST | `/api/discharge-planning` | Create or update discharge plan |

### `POST /api/discharge-planning`
**Request Body:**
```json
{
  "patient_id": "P001",
  "diet": "Low sodium",
  "activity": "Ambulate as tolerated",
  "medications": "Continue home meds",
  "follow_up": "Cardiology in 2 weeks",
  "instructions": "Monitor BP daily"
}
```

---

## 12. Diagnostics (Imaging) — `DiagnosticApiController`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/diagnostics/patient/{patient_id}` | Get all diagnostic images for patient |
| POST | `/api/diagnostics` | Upload diagnostic images |
| DELETE | `/api/diagnostics/{id}` | Delete a diagnostic image |

---

### `GET /api/diagnostics/patient/{patient_id}`

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "patient_id": "P001",
    "type": "xray",
    "path": "diagnostics/1234567890_chest_xray.jpg",
    "original_name": "chest_xray.jpg",
    "image_url": "http://your-domain.com/storage/diagnostics/1234567890_chest_xray.jpg"
  }
]
```

---

### `POST /api/diagnostics`
Upload one or more images. Must use `multipart/form-data`.

**Request (Form Data):**

| Field | Type | Description |
|-------|------|-------------|
| `patient_id` | string | Required. Must exist in patients table. |
| `type` | string | Required. One of: `xray`, `ultrasound`, `ct_scan`, `echocardiogram` |
| `images[]` | file | Required. Array of image files. Max 8MB each. |

**Example (curl):**
```bash
curl -X POST http://your-domain.com/api/diagnostics \
  -H "Authorization: Bearer {token}" \
  -F "patient_id=P001" \
  -F "type=xray" \
  -F "images[]=@chest_xray.jpg" \
  -F "images[]=@lateral_view.jpg"
```

**Response `201 Created`:**
```json
{
  "message": "2 images uploaded and synced to website.",
  "data": [
    {
      "id": 1,
      "patient_id": "P001",
      "type": "xray",
      "image_url": "http://your-domain.com/storage/diagnostics/..."
    }
  ]
}
```

---

### `DELETE /api/diagnostics/{id}`
Deletes the image from storage and the database.

**Response `200 OK`:**
```json
{
  "message": "Diagnostic record deleted."
}
```

---

## 13. Data Alerts — `DataAlertApiController`

Aggregates CDSS alerts from all assessment components.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/data-alert/patient/{patient_id}` | Get latest alerts from ALL 5 components |
| GET | `/api/{component}/data-alert/patient/{patient_id}` | Get latest alerts for ONE component |

**Supported `{component}` values:**
- `vital-signs`
- `physical-exam`
- `adl`
- `intake-and-output`
- `lab-values`

---

### `GET /api/data-alert/patient/P001`

**Response `200 OK`:**
```json
{
  "vital_signs_alerts": "HR elevated. SpO2 within normal range.",
  "physical_exam_alerts": "Skin: No abnormalities detected.",
  "adl_alerts": "Mobility: Patient needs assistance.",
  "intake_output_alerts": "Fluid balance: Deficit noted.",
  "lab_values_alerts": "WBC elevated. Consider infection workup."
}
```

> Returns `"No findings."` if no records exist for a component.

---

### `GET /api/vital-signs/data-alert/patient/P001`

**Response `200 OK`:**
```json
{
  "alerts": "HR elevated. SpO2 within normal range."
}
```

---

## 14. ADPIE / Nursing Diagnosis — `AdpieApiController`

ADPIE (Assessment → Diagnosis → Planning → Intervention → Evaluation) with CDSS integration.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/adpie/{component}/{id}` | Initialize/get nursing diagnosis for an assessment record |
| POST | `/api/adpie/analyze` | Analyze a single ADPIE field with CDSS |
| POST | `/api/adpie/analyze-batch` | Analyze multiple ADPIE fields at once |
| PUT | `/api/adpie/{id}/{step}` | Update a specific ADPIE step |

**Supported `{component}` values:**
- `vital-signs`
- `physical-exam`
- `adl`
- `intake-and-output`
- `lab-values`

**Supported `{step}` values:**
- `diagnosis`
- `planning`
- `intervention`
- `evaluation`

---

### `GET /api/adpie/vital-signs/1`
Initializes a nursing diagnosis record for vital signs record ID `1` (creates if not exists).

**Response `200 OK`:**
```json
{
  "nursing_diagnosis": {
    "id": 5,
    "vital_signs_id": 1,
    "diagnosis": null,
    "planning": null,
    "intervention": null,
    "evaluation": null,
    "diagnosis_alert": null
  },
  "assessment": { /* linked vitals record */ }
}
```

---

### `POST /api/adpie/analyze`
Get a CDSS recommendation for a single ADPIE field.

**Request Body:**
```json
{
  "fieldName": "diagnosis",
  "finding": "Patient has elevated HR and SpO2 of 92%",
  "component": "vital-signs"
}
```

**Response `200 OK`:**
```json
{
  "level": "WARNING",
  "message": "Consider oxygen therapy. Monitor closely.",
  "raw_message": "SpO2 below 95% — potential hypoxia risk."
}
```

---

### `POST /api/adpie/analyze-batch`
Analyze multiple ADPIE fields at once.

**Request Body:**
```json
{
  "component": "vital-signs",
  "batch": [
    { "fieldName": "diagnosis", "finding": "Elevated HR" },
    { "fieldName": "planning", "finding": "Monitor vitals q4h" },
    { "fieldName": "intervention", "finding": "Administer O2 at 2L/min" }
  ]
}
```

**Response `200 OK`:**
```json
[
  { "fieldName": "diagnosis", "level": "WARNING", "message": "..." },
  { "fieldName": "planning", "level": "INFO", "message": "..." },
  { "fieldName": "intervention", "level": "INFO", "message": "..." }
]
```

---

### `PUT /api/adpie/5/diagnosis`
Update a specific ADPIE step and get CDSS recommendation.

**Request Body:**
```json
{
  "finding": "Impaired gas exchange related to decreased SpO2",
  "component": "vital-signs"
}
```

**Response `200 OK`:**
```json
{
  "record": { /* updated NursingDiagnosis record */ },
  "recommendation": {
    "level": "WARNING",
    "message": "Oxygen therapy recommended.",
    "raw_message": "..."
  }
}
```

---

## 🔄 Global Patterns

### Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success (GET, PUT) |
| 201 | Created (POST) |
| 400 | Bad Request (missing/invalid params) |
| 401 | Unauthorized (missing/invalid token) |
| 404 | Not Found |
| 500 | Server Error |

---

### Standard Error Response
```json
{
  "message": "A descriptive error message.",
  "error": "Exception details (dev mode)",
  "detail": "Additional context if available"
}
```

---

### Upsert Behavior
Most `POST` endpoints use `updateOrCreate()` — meaning:
- If a matching record exists (by `patient_id` + other keys), it is **updated**.
- If no match is found, a new record is **created**.

This prevents duplicate records and simplifies client logic.

---

### CDSS Auto-Analysis
All assessment endpoints (`vital-signs`, `physical-exam`, `adl`, `intake-and-output`, `lab-values`) **automatically run clinical decision support analysis** on every save. Results are stored in `alert` / `alerts` / `*_alert` fields and returned in the response.

---

### Empty Value Handling
Most controllers auto-convert empty or `null` field values to the string `"N/A"` before storing.

---

## 🏗️ System Architecture Summary

```
Mobile App / Web Client
        │
        ▼
  Laravel Sanctum (Auth)
        │
        ▼
  API Routes (routes/api.php)
        │
        ├── AuthController
        ├── PatientApiController
        ├── VitalSignsApiController  ──► VitalCdssService
        ├── PhysicalExamApiController ──► PhysicalExamCdssService
        ├── AdlApiController ──────────► ActOfDailyLivingCdssService
        ├── IntakeOutputApiController ──► IntakeAndOutputCdssService
        ├── LabValuesApiController ─────► LabValuesCdssService
        ├── MedicalHistoryApiController
        ├── MedicationAdministrationApiController
        ├── MedicationReconciliationApiController
        ├── ClinicalRecordApiController
        ├── DiagnosticApiController
        ├── DataAlertApiController
        └── AdpieApiController ─────────► NursingDiagnosisCdssService
                    │
                    ▼
            AuditLogController (logging)
```

---

## 📌 Quick Reference — All Endpoints

```
# Auth
POST   /api/auth/login

# Patients
GET    /api/patient
GET    /api/patient/{id}
POST   /api/patient
PUT    /api/patient/{id}
POST   /api/patient/{id}/toggle-status

# Vital Signs
GET    /api/vital-signs/patient/{patient_id}
GET    /api/vital-signs/{id}/assessment
POST   /api/vital-signs
PUT    /api/vital-signs/{id}/assessment

# Physical Exam
GET    /api/physical-exam/patient/{patient_id}
GET    /api/physical-exam/{id}/assessment
POST   /api/physical-exam
PUT    /api/physical-exam/{id}/assessment

# Activities of Daily Living
GET    /api/adl/patient/{patient_id}
GET    /api/adl/{id}/assessment
POST   /api/adl
PUT    /api/adl/{id}/assessment

# Intake & Output
GET    /api/intake-and-output/patient/{patient_id}
GET    /api/intake-and-output/{id}/assessment
POST   /api/intake-and-output
PUT    /api/intake-and-output/{id}/assessment

# Lab Values
GET    /api/lab-values/patient/{patient_id}
GET    /api/lab-values/{id}/assessment
POST   /api/lab-values
PUT    /api/lab-values/{id}/assessment

# Medical History
GET    /api/medical-history/patient/{patient_id}
GET    /api/medical-history/present-illness/{id}
POST   /api/medical-history/present-illness
PUT    /api/medical-history/present-illness/{id}
GET    /api/medical-history/past-history/{id}
POST   /api/medical-history/past-history
PUT    /api/medical-history/past-history/{id}
GET    /api/medical-history/allergies/{id}
POST   /api/medical-history/allergies
PUT    /api/medical-history/allergies/{id}
GET    /api/medical-history/vaccination/{id}
POST   /api/medical-history/vaccination
PUT    /api/medical-history/vaccination/{id}
GET    /api/medical-history/developmental/{id}
POST   /api/medical-history/developmental
PUT    /api/medical-history/developmental/{id}

# Medication Administration
GET    /api/medication-administration/patient/{patient_id}
GET    /api/medication-administration/patient/{patient_id}/time/{time}
GET    /api/medication-administration/{id}
POST   /api/medication-administration
PUT    /api/medication-administration/{id}

# Medication Reconciliation (also works with /medical-reconciliation/)
GET    /api/medication-reconciliation/patient/{patient_id}
GET    /api/medication-reconciliation/current/{id}
POST   /api/medication-reconciliation/current
PUT    /api/medication-reconciliation/current/{id}
GET    /api/medication-reconciliation/home/{id}
POST   /api/medication-reconciliation/home
GET    /api/medication-reconciliation/changes/{id}
POST   /api/medication-reconciliation/changes

# IVs & Lines
GET    /api/ivs-and-lines/patient/{patient_id}
GET    /api/ivs-and-lines/{id}
POST   /api/ivs-and-lines
PUT    /api/ivs-and-lines/{id}

# Discharge Planning
GET    /api/discharge-planning/patient/{patient_id}
POST   /api/discharge-planning

# Diagnostics
GET    /api/diagnostics/patient/{patient_id}
POST   /api/diagnostics
DELETE /api/diagnostics/{id}

# Data Alerts
GET    /api/data-alert/patient/{patient_id}
GET    /api/{component}/data-alert/patient/{patient_id}

# ADPIE / Nursing Diagnosis
GET    /api/adpie/{component}/{id}
POST   /api/adpie/analyze
POST   /api/adpie/analyze-batch
PUT    /api/adpie/{id}/{step}
```
