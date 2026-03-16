# 🩻 Physical Exam API Documentation

**Base URL:** `http://your-domain.com/api`  
**Auth:** All routes require `Authorization: Bearer {token}` header.

---

## 🩻 Physical Exam

Physical exam records store 8 body-system findings. On every save or update the **CDSS engine runs automatically** and populates the corresponding `*_alert` column — scoped to physical exam alerts only, completely separate from ADPIE / nursing diagnosis.

### Endpoints

| Method     | Endpoint                                         | Description                                                     |
| ---------- | ------------------------------------------------ | --------------------------------------------------------------- |
| POST / PUT | `/api/physical-exam`                             | Create or update a physical exam record (runs CDSS)             |
| GET        | `/api/physical-exam/patient/{patient_id}`        | All records for a patient (full fields + alerts)                |
| GET        | `/api/physical-exam/patient/{patient_id}/alerts` | **Latest alerts only** — eye, skin, oral, abdomen + all systems |
| GET        | `/api/physical-exam/{id}/assessment`             | Single record by ID                                             |
| PUT        | `/api/physical-exam/{id}/assessment`             | Update a record by ID (runs CDSS)                               |

### Request Body — Save / Update

All finding fields are **optional strings**. Empty or null values are stored as `"N/A"`. The CDSS alerts are generated automatically — **do not send alert fields**.

```json
{
  "patient_id": 1,
  "general_appearance": "patient appears lethargic and pale",
  "skin_condition": "jaundice noted, mild pallor",
  "eye_condition": "icteric sclera, blurry vision",
  "oral_condition": "dry lips, white curd-like plaques on mucosa",
  "cardiovascular": "regular rate and rhythm",
  "abdomen_condition": "distended abdomen, rebound tenderness noted",
  "extremities": "no edema",
  "neurological": "alert and oriented"
}
```

| Field                | Type           | Required | Description                                          |
| -------------------- | -------------- | -------- | ---------------------------------------------------- |
| `patient_id`         | integer        | ✅ Yes   | Must exist in `patients` table                       |
| `general_appearance` | string \| null | No       | Overall appearance, consciousness, work of breathing |
| `skin_condition`     | string \| null | No       | Color, turgor, lesions, rashes                       |
| `eye_condition`      | string \| null | No       | Pupils, sclera, vision, lids                         |
| `oral_condition`     | string \| null | No       | Lips, gums, mucosa, tongue                           |
| `cardiovascular`     | string \| null | No       | Heart sounds, rhythm, perfusion                      |
| `abdomen_condition`  | string \| null | No       | Tenderness, distension, bowel sounds                 |
| `extremities`        | string \| null | No       | Edema, pulses, range of motion                       |
| `neurological`       | string \| null | No       | Orientation, reflexes, motor function                |

### Response — POST 201 / PUT 200

The response includes a top-level `alerts` object alongside `data` so you can read the generated alerts without digging into the full record.

```json
{
  "message": "Physical exam saved",
  "data": {
    "id": 42,
    "patient_id": 1,
    "eye_condition": "icteric sclera, blurry vision",
    "skin_condition": "jaundice noted, mild pallor",
    "oral_condition": "dry lips, white curd-like plaques on mucosa",
    "abdomen_condition": "distended abdomen, rebound tenderness noted",
    "general_appearance": "patient appears lethargic and pale",
    "cardiovascular": "N/A",
    "extremities": "N/A",
    "neurological": "N/A",
    "eye_alert": "Icteric Sclera / Yellow Eyes — Hyperbilirubinemia. Evaluate for liver disease or hemolysis.",
    "skin_alert": "Jaundice — Suggests liver disease or hemolysis.",
    "oral_alert": "Oral Candidiasis (Thrush) — Treat with antifungals; evaluate immune status.",
    "abdomen_alert": "Peritoneal Irritation — Rebound tenderness indicates peritonitis. Urgent surgical evaluation needed.",
    "general_appearance_alert": "Pallor detected — Consider anemia evaluation.",
    "cardiovascular_alert": "No Findings",
    "extremities_alert": "No Findings",
    "neurological_alert": "No Findings",
    "created_at": "2025-09-16T10:00:00.000000Z",
    "updated_at": "2025-09-16T10:00:00.000000Z"
  },
  "alerts": {
    "eye_alert": "Icteric Sclera / Yellow Eyes — Hyperbilirubinemia. Evaluate for liver disease or hemolysis.",
    "skin_alert": "Jaundice — Suggests liver disease or hemolysis.",
    "oral_alert": "Oral Candidiasis (Thrush) — Treat with antifungals; evaluate immune status.",
    "abdomen_alert": "Peritoneal Irritation — Rebound tenderness indicates peritonitis. Urgent surgical evaluation needed.",
    "general_appearance_alert": "Pallor detected — Consider anemia evaluation.",
    "cardiovascular_alert": "No Findings",
    "extremities_alert": "No Findings",
    "neurological_alert": "No Findings"
  }
}
```

### GET `/api/physical-exam/patient/{patient_id}/alerts`

Returns **only the physical exam alert fields** from the patient's latest record. No ADPIE or nursing diagnosis data is included.

```json
{
  "patient_id": 1,
  "exam_id": 42,
  "recorded_at": "2025-09-16T10:05:00.000000Z",
  "alerts": {
    "eye": "Icteric Sclera / Yellow Eyes — Hyperbilirubinemia. Evaluate for liver disease or hemolysis.",
    "skin": "Jaundice — Suggests liver disease or hemolysis.",
    "oral": "Oral Candidiasis (Thrush) — Treat with antifungals; evaluate immune status.",
    "abdomen": "Peritoneal Irritation — Rebound tenderness indicates peritonitis. Urgent surgical evaluation needed.",
    "general_appearance": "Pallor detected — Consider anemia evaluation.",
    "cardiovascular": "No Findings",
    "extremities": "No Findings",
    "neurological": "No Findings"
  }
}
```

Returns `404` if no physical exam record exists for the patient.

### Alert Field Mapping

The CDSS internally uses `_condition_alert` keys; the API correctly maps them to the DB column names before storing:

| Finding Field        | DB Alert Column            | CDSS Key (internal)        |
| -------------------- | -------------------------- | -------------------------- |
| `general_appearance` | `general_appearance_alert` | `general_appearance_alert` |
| `skin_condition`     | `skin_alert`               | `skin_condition_alert`     |
| `eye_condition`      | `eye_alert`                | `eye_condition_alert`      |
| `oral_condition`     | `oral_alert`               | `oral_condition_alert`     |
| `cardiovascular`     | `cardiovascular_alert`     | `cardiovascular_alert`     |
| `abdomen_condition`  | `abdomen_alert`            | `abdomen_condition_alert`  |
| `extremities`        | `extremities_alert`        | `extremities_alert`        |
| `neurological`       | `neurological_alert`       | `neurological_alert`       |

> **Alert values:** `"No Findings"` means the CDSS matched nothing abnormal for that field.

---

## 🚨 Data Alerts

Returns the latest CDSS alert(s) for a patient across all components or for a specific one.

| Method | Endpoint                                             | Description                               |
| ------ | ---------------------------------------------------- | ----------------------------------------- |
| GET    | `/api/data-alert/patient/{patient_id}`               | All alerts for a patient (all components) |
| GET    | `/api/physical-exam/data-alert/patient/{patient_id}` | Alert for a specific component            |

**GET all alerts response:**

```json
{
  "vital_signs": "⚠️ WARNING: Low-grade fever detected.",
  "physical_exam": "Jaundice — Suggests liver disease or hemolysis.",
  "adl": "Risk for falls related to impaired physical mobility.",
  "intake_and_output": "🚨 CRITICAL: Severe oliguria. Immediate renal assessment required.",
  "lab_values": "Leukopenia — Significant risk of infection."
}
```

Fields with no alerts return `"No findings."`.

---

## 🧠 ADPIE / CDSS

The ADPIE (Nursing Diagnosis) workflow applies to all assessment components. It follows 4 steps: **Diagnosis → Planning → Intervention → Evaluation**. CDSS recommendations are generated automatically when each step is saved.

| Method | Endpoint                        | Description                                                   |
| ------ | ------------------------------- | ------------------------------------------------------------- |
| GET    | `/api/adpie/physical-exam/{id}` | Initialize ADPIE for a record                                 |
| POST   | `/api/adpie/analyze`            | Analyze a single ADPIE field via CDSS                         |
| POST   | `/api/adpie/analyze-batch`      | Analyze multiple ADPIE fields at once                         |
| PUT    | `/api/adpie/{id}/{step}`        | Save a step (`diagnosis\|planning\|intervention\|evaluation`) |

---

## 🔄 Physical Exam Alert — Complete Flow (Form → CDSS → Bell Icon → Modal)

This section documents the **full lifecycle** of a physical exam alert from the moment the nurse types a finding to the bell icon lighting up and the modal appearing. There are **two parallel paths**: the **live typing path** (real-time, no page reload) and the **form submit path** (on SUBMIT/CDSS button click).

---

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  BLADE FORM  (physical-exam.blade.php)                              │
│                                                                     │
│  <textarea class="cdss-input" data-field-name="eye_condition">      │
│  <div data-alert-for="eye_condition">                               │
│    <div class="alert-icon-btn is-empty">  ← gray bell (default)    │
│  </div>                                                             │
└───────────────────────┬─────────────────────────────────────────────┘
                        │ user types
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  alert.js  (resources/js/alert.js)                                  │
│                                                                     │
│  ① input event → showAlertLoading()  ← blue spinner immediately     │
│  ② debounce 500ms                                                   │
│  ③ analyzeField() → POST /physical-exam/analyze-field               │
└───────────────────────┬─────────────────────────────────────────────┘
                        │ HTTP POST
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  PhysicalExamController::runSingleCdssAnalysis()                    │
│                                                                     │
│  → PhysicalExamCdssService::analyzeSingleFinding(field, text)       │
│  → runAnalysis(text, yaml_rules)                                    │
│  ← { alert: "...", severity: "WARNING" }                            │
└───────────────────────┬─────────────────────────────────────────────┘
                        │ JSON response
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│  alert.js → displayAlert()                                          │
│                                                                     │
│  IF alert ≠ "No Findings":                                          │
│    → yellow bell icon (add_alert)  + "Alert available!" bubble      │
│    → bell.onclick → openAlertModal(alertData)                       │
│  ELSE:                                                              │
│    → gray bell icon (notifications) + "No alerts." bubble           │
│    → bubble dissolves after 3s, icon dims                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Path 1 — Live Typing (Real-Time, per field)

#### Step 1 · User types in a textarea

Each textarea in the form has two critical attributes:

```html
<textarea
  class="cdss-input"
  name="eye_condition"
  data-field-name="eye_condition"
></textarea>
```

Next to it is the alert container tied to that field:

```html
<div data-alert-for="eye_condition">
  <div class="alert-icon-btn is-empty">
    <span class="material-symbols-outlined">notifications</span>
    <!-- gray bell -->
  </div>
</div>
```

#### Step 2 · `alert.js` captures the input event

```
initializeCdssForForm(form)
  └─ form.querySelectorAll('.cdss-input')
       └─ input.addEventListener('input', handler)
```

On every **keystroke**:

1. `showAlertLoading(alertCell)` → replaces the bell with a **blue spinner** + animated `"Analyzing..."` text immediately
2. `clearTimeout(debounceTimer)` → resets the 500ms countdown
3. After 500ms of silence → calls `analyzeField(fieldName, finding, ...)`

#### Step 3 · `analyzeField()` — HTTP call to CDSS

```js
POST /physical-exam/analyze-field
Content-Type: application/json
X-CSRF-TOKEN: ...

{ "fieldName": "eye_condition", "finding": "icteric sclera, blurry vision" }
```

#### Step 4 · `PhysicalExamController::runSingleCdssAnalysis()`

```php
// 1. Validate input
$data = $request->validate([
    'fieldName' => 'required|string',
    'finding'   => 'nullable|string',
]);

// 2. Run CDSS
$alert = $cdssService->analyzeSingleFinding($data['fieldName'], $data['finding']);

// 3. Return JSON
return response()->json($alert);
// → { "alert": "Icteric Sclera...", "severity": "WARNING" }
```

#### Step 5 · `PhysicalExamCdssService` — matching algorithm

```
analyzeSingleFinding("eye_condition", "icteric sclera, blurry vision")
  └─ loadRules()  ← reads storage/app/private/physical_exam/eye_condition.yaml
  └─ runAnalysis(finding, rules)
       ├─ sanitizeAndSplit("icteric sclera, blurry vision")
       │    → ["icteric", "sclera", "blurry", "vision"]
       ├─ foreach rule:
       │    foreach keyword in rule.keywords:
       │      check intersection with input words
       │      if match → score = (word_count × 10) + sum(word_lengths)
       │      accumulate score for the rule
       ├─ sort matched rules: severity DESC, score DESC
       └─ return best match → { alert: "...", severity: "WARNING" }
```

**YAML rule example** (`eye_condition.yaml`):

```yaml
eye_condition:
  - keywords: ['icteric sclera', 'yellow eyes']
    alert: 'Icteric Sclera / Yellow Eyes — Hyperbilirubinemia. Evaluate for liver disease or hemolysis.'
    severity: 'warning'
```

**Scoring example** for input `"icteric sclera"`:

- keyword phrase `"icteric sclera"` → 2 words → base score = `2 × 10 = 20`
- word lengths: `"icteric"(7) + "sclera"(6)` = 13
- total score = `20 + 13 = 33`

Severity numeric values used for sorting:
| Severity | Numeric |
|----------|---------|
| CRITICAL | 4 |
| WARNING | 3 |
| INFO | 2 |
| NONE | 1 |

#### Step 6 · `displayAlert()` — bell icon updates in the form

**If `alert` ≠ `"No Findings"`:**

```html
<!-- alert-cell becomes: -->
<div class="alert-wrapper">
  <div class="alert-icon-btn is-active fade-in">
    ← yellow bell, clickable
    <span class="material-symbols-outlined">add_alert</span>
  </div>
  <div class="alert-bubble show-pop">
    <span style="color:#f59e0b;">Alert available!</span> ← bubble fades after 3s
  </div>
</div>
```

Bell gets `.is-active` class → CSS applies yellow background (`rgba(251,191,36,0.25)`) and yellow border.

**If `alert` = `"No Findings"`:**

```html
<div class="alert-wrapper">
  <div class="alert-icon-btn">
    ← gray bell
    <span class="material-symbols-outlined">notifications</span>
  </div>
  <div class="alert-bubble show-pop">
    <span class="text-gray-400">No alerts.</span> ← bubble fades and dimmed
  </div>
</div>
```

After 3 seconds, the bubble dissolves and the wrapper gets `.is-dimmed` (gray, reduced opacity).

#### Step 7 · User clicks the yellow bell → `openAlertModal()`

```js
alertCell
  .querySelector('.alert-icon-btn')
  .addEventListener('click', () => openAlertModal(alertData));
```

Modal is built and injected into `document.body`:

```html
<div class="alert-modal-overlay">
  ← dim background, click to close
  <div class="alert-modal fade-in">
    <button class="close-btn">&times;</button>
    <h2>Alert Details</h2>
    <p>
      Icteric Sclera / Yellow Eyes — Hyperbilirubinemia. Evaluate for liver
      disease or hemolysis.
    </p>
    <!-- If alertData.recommendation exists: -->
    <h3>Recommendation:</h3>
    <p>...</p>
  </div>
</div>
```

If the alert text contains `;`, it's rendered as a bullet list (`<ul><li>` each item).

Modal closes by:

- Clicking the `×` button
- Clicking anywhere on the overlay background

---

### Path 2 — Form Submit (Persist to Database)

When the nurse clicks **SUBMIT**, the entire form POSTs to `PhysicalExamController::store()`.

#### Step 1 · Form submits

```html
<form
  action="{{ route('physical-exam.store') }}"
  method="POST"
  class="cdss-form"
>
  @csrf
  <input type="hidden" name="patient_id" value="1" />
  <textarea name="eye_condition">icteric sclera, blurry vision</textarea>
  <!-- ... -->
  <button type="submit">SUBMIT</button>
</form>
```

#### Step 2 · `store()` validates → runs CDSS → saves to DB

```php
// 1. Validate
$data = $request->validate([
    'patient_id'    => 'required|exists:patients,patient_id',
    'eye_condition' => 'nullable|string',
    'skin_condition' => 'nullable|string',
    'oral_condition' => 'nullable|string',
    'abdomen_condition' => 'nullable|string',
    // ... all 8 fields
]);

// 2. Run CDSS on ALL 8 fields at once
$cdssService = new PhysicalExamCdssService();
$alerts = $cdssService->analyzeFindings($data);
// Returns: ['eye_condition_alert' => '...', 'skin_condition_alert' => '...', ...]

// 3. Save to physical_exams table (new record OR update existing)
PhysicalExam::updateOrCreate(['patient_id' => $data['patient_id']], array_merge($data, [
    'eye_alert'    => $alerts['eye_condition_alert'],
    'skin_alert'   => $alerts['skin_condition_alert'],
    'oral_alert'   => $alerts['oral_condition_alert'],
    'abdomen_alert' => $alerts['abdomen_condition_alert'],
    // ...
]));

// 4. Log to audit log
AuditLogController::log('Physical Exam Created', ...);

// 5. Redirect back with session data
return redirect()->route('physical-exam.index')
    ->withInput()
    ->with('success', 'Physical exam data saved successfully!');
```

#### Step 3 · Alert keys mapping (CDSS → Database columns)

| CDSS service returns       | Stored in DB column        |
| -------------------------- | -------------------------- |
| `eye_condition_alert`      | `eye_alert`                |
| `skin_condition_alert`     | `skin_alert`               |
| `oral_condition_alert`     | `oral_alert`               |
| `abdomen_condition_alert`  | `abdomen_alert`            |
| `general_appearance_alert` | `general_appearance_alert` |
| `cardiovascular_alert`     | `cardiovascular_alert`     |
| `extremities_alert`        | `extremities_alert`        |
| `neurological_alert`       | `neurological_alert`       |

#### Step 4 · Page reloads → bell icons re-populate via batch analysis

On redirect, `patient-loader.js` fires `cdss:form-reloaded` event. `alert.js` catches it and calls:

```js
window.triggerInitialCdssAnalysis(form)
  └─ POST /physical-exam/analyze-batch
       { "batch": [
           { "fieldName": "eye_condition",  "finding": "icteric sclera, blurry vision" },
           { "fieldName": "skin_condition", "finding": "jaundice" },
           ...
         ]
       }
  └─ Response: [ { alert: "...", severity: "WARNING" }, ... ]
  └─ displayAlert() called for each field → bell icons update
```

---

### Path 3 — CDSS Button (Navigate to Nursing Diagnosis)

When the nurse clicks the **CDSS** button (only visible if `$physicalExam` exists):

```html
<button type="submit" name="action" value="cdss">CDSS</button>
```

The `store()` method detects `action === 'cdss'` and redirects to:

```
/nursing-diagnosis/physical-exam/{exam_id}
```

This initiates the ADPIE workflow (Diagnosis → Planning → Intervention → Evaluation).

---

### Visual States Summary

| State                | Bell Icon       | CSS Class              | Color              |
| -------------------- | --------------- | ---------------------- | ------------------ |
| Default (no patient) | `notifications` | `is-empty`             | Gray, dimmed       |
| Loading (typing)     | `glass-spinner` | —                      | Blue spinner       |
| Alert found          | `add_alert`     | `is-active`            | Yellow             |
| No alert             | `notifications` | `is-dimmed` (after 3s) | Gray               |
| Error                | `notifications` | —                      | Red text in bubble |

---

### YAML Rule Files Location

All CDSS rules are stored in:

```
storage/app/private/physical_exam/
├── eye_condition.yaml
├── skin_condition.yaml
├── oral_condition.yaml
├── abdomen.yaml
├── general_appearance.yaml
├── cardiovascular.yaml
├── extremities.yaml
└── neurological.yaml
```

**Rule structure:**

```yaml
eye_condition:
  - keywords: ['keyword1', 'keyword phrase 2']
    alert: 'Clinical alert message shown to user.'
    severity: 'critical' # critical | warning | info | none
```

The CDSS loads **all YAML files** at service construction time and merges rules by top-level key. Multiple YAML files can contribute rules to the same field.

---

## 📖 Tutorial — How to Connect and Get Physical Exam Alerts (Eye, Skin, Oral, Abdomen)

This tutorial walks through the full flow: **authenticate → submit a physical exam → read the CDSS alerts** for eye, skin, oral, and abdomen findings.

---

### Step 1 — Authenticate

All API requests require a Bearer token. Login first to get one.

**Request:**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "nurse@example.com",
  "password": "password"
}
```

**Response:**

```json
{
  "access_token": "1|abc123tokenhere...",
  "role": "nurse",
  "full_name": "Maria Santos",
  "user_id": 5
}
```

Save the `access_token`. Every subsequent request must include:

```
Authorization: Bearer 1|abc123tokenhere...
```

---

### Step 2 — Submit a Physical Exam (with Eye, Skin, Oral & Abdomen findings)

Send the patient's findings as a POST request. The CDSS engine runs **automatically** and the response will already contain the generated alerts — no extra call needed.

**Request:**

```http
POST /api/physical-exam
Authorization: Bearer {token}
Content-Type: application/json

{
  "patient_id": 1,
  "eye_condition": "icteric sclera, blurry vision noted",
  "skin_condition": "jaundice, pallor, decreased skin turgor",
  "oral_condition": "dry lips, white curd-like plaques on mucosa",
  "abdomen_condition": "distended abdomen, rebound tenderness on palpation"
}
```

> **Tip:** You can include any combination of the 8 finding fields. Fields you omit are stored as `"N/A"` with `"No Findings"` alerts.

**Response (201 Created):**

```json
{
  "message": "Physical exam saved",
  "data": {
    "id": 42,
    "patient_id": 1,

    "eye_condition": "icteric sclera, blurry vision noted",
    "eye_alert": "⚠️ WARNING: Icteric Sclera / Yellow Eyes — Hyperbilirubinemia detected. Evaluate for liver disease or hemolysis.",

    "skin_condition": "jaundice, pallor, decreased skin turgor",
    "skin_alert": "⚠️ WARNING: Jaundice — Suggests liver disease or hemolysis. Evaluate bilirubin levels.",

    "oral_condition": "dry lips, white curd-like plaques on mucosa",
    "oral_alert": "⚠️ WARNING: Oral Candidiasis (Thrush) — Treat with antifungals; evaluate immune status.",

    "abdomen_condition": "distended abdomen, rebound tenderness on palpation",
    "abdomen_alert": "🚨 CRITICAL: Peritoneal Irritation — Rebound tenderness indicates possible peritonitis. Urgent surgical evaluation required.",

    "general_appearance": "N/A",
    "general_appearance_alert": "No Findings",
    "cardiovascular": "N/A",
    "cardiovascular_alert": "No Findings",
    "extremities": "N/A",
    "extremities_alert": "No Findings",
    "neurological": "N/A",
    "neurological_alert": "No Findings",

    "created_at": "2025-09-16T10:00:00.000000Z",
    "updated_at": "2025-09-16T10:00:00.000000Z"
  }
}
```

---

### Step 3 — Read Existing Alerts for a Patient

If the physical exam was already saved and you only need to read the current alerts:

#### Option A — Get all physical exam records for a patient

```http
GET /api/physical-exam/patient/1
Authorization: Bearer {token}
```

**Response:** Array of all physical exam records for that patient (newest first). Each object contains all 8 finding fields and all 8 alert fields.

```json
[
  {
    "id": 42,
    "patient_id": 1,
    "eye_condition": "icteric sclera, blurry vision noted",
    "eye_alert": "⚠️ WARNING: Icteric Sclera / Yellow Eyes — ...",
    "skin_condition": "jaundice, pallor, decreased skin turgor",
    "skin_alert": "⚠️ WARNING: Jaundice — ...",
    "oral_condition": "dry lips, white curd-like plaques on mucosa",
    "oral_alert": "⚠️ WARNING: Oral Candidiasis (Thrush) — ...",
    "abdomen_condition": "distended abdomen, rebound tenderness on palpation",
    "abdomen_alert": "🚨 CRITICAL: Peritoneal Irritation — ...",
    "created_at": "2025-09-16T10:00:00.000000Z",
    "updated_at": "2025-09-16T10:00:00.000000Z"
  }
]
```

#### Option B — Get a single record by ID

```http
GET /api/physical-exam/42/assessment
Authorization: Bearer {token}
```

Returns the same structure as a single object (not an array).

#### Option C — Get all component alerts via the Data Alert endpoint

```http
GET /api/physical-exam/data-alert/patient/1
Authorization: Bearer {token}
```

Returns only the alert data from the physical exam component, without the raw finding text.

---

### Step 4 — Extract the 4 Target Alerts in Your Code

Once you have the response object, read the 4 alert fields directly:

**JavaScript / Fetch example:**

```js
const response = await fetch('/api/physical-exam/patient/1', {
  headers: { Authorization: `Bearer ${token}` },
});
const records = await response.json();
const latest = records[0]; // newest record

console.log('Eye Alert:', latest.eye_alert);
console.log('Skin Alert:', latest.skin_alert);
console.log('Oral Alert:', latest.oral_alert);
console.log('Abdomen Alert:', latest.abdomen_alert);
```

**PHP / Laravel HTTP Client example:**

```php
$response = Http::withToken($token)
    ->get('/api/physical-exam/patient/1');

$latest = $response->json()[0];

$eyeAlert     = $latest['eye_alert'];
$skinAlert    = $latest['skin_alert'];
$oralAlert    = $latest['oral_alert'];
$abdomenAlert = $latest['abdomen_alert'];
```

---

### Step 5 — Understanding Alert Severity

Each alert string is prefixed with a severity emoji for quick visual triage:

| Prefix         | Severity    | Meaning                                   |
| -------------- | ----------- | ----------------------------------------- |
| 🚨 `CRITICAL:` | 4 — Highest | Urgent / Emergency — escalate immediately |
| ⚠️ `WARNING:`  | 3 — High    | Important — requires prompt attention     |
| ℹ️ `INFO:`     | 2 — Medium  | Informational — monitor or document       |
| `No Findings`  | 1 — None    | Normal — no abnormality detected by CDSS  |

**Parsing example:**

```js
function getSeverity(alertText) {
  if (alertText.includes('CRITICAL')) return 'critical';
  if (alertText.includes('WARNING')) return 'warning';
  if (alertText.includes('INFO')) return 'info';
  return 'none';
}

getSeverity(latest.abdomen_alert); // → 'critical'
getSeverity(latest.eye_alert); // → 'warning'
```

---

### Common Alert Keywords Reference

Use these example inputs to trigger alerts in each system:

#### 👁️ Eye — `eye_condition`

| Input Phrase                         | Severity    | Alert Topic                           |
| ------------------------------------ | ----------- | ------------------------------------- |
| `"sudden visual loss"`               | 🚨 CRITICAL | Retinal detachment / artery occlusion |
| `"fixed dilated pupil"`              | 🚨 CRITICAL | Uncal herniation (CN III compression) |
| `"papilledema"`                      | 🚨 CRITICAL | Increased intracranial pressure       |
| `"icteric sclera"` / `"yellow eyes"` | ⚠️ WARNING  | Hyperbilirubinemia                    |
| `"blurry vision"`                    | ⚠️ WARNING  | Refractive error or serious pathology |
| `"conjunctivitis"` / `"pink eye"`    | ⚠️ WARNING  | Infection / inflammation              |
| `"stye"` / `"chalazion"`             | ℹ️ INFO     | Minor eyelid condition                |

#### 🩹 Skin — `skin_condition`

| Input Phrase                       | Severity    | Alert Topic                                    |
| ---------------------------------- | ----------- | ---------------------------------------------- |
| `"cyanosis"`                       | 🚨 CRITICAL | Hypoxia — respiratory/cardiovascular emergency |
| `"petechiae"` / `"purpura"`        | 🚨 CRITICAL | Bleeding disorder or emboli                    |
| `"jaundice"`                       | ⚠️ WARNING  | Liver disease or hemolysis                     |
| `"pallor"`                         | ⚠️ WARNING  | Anemia or shock                                |
| `"decreased turgor"` / `"tenting"` | ⚠️ WARNING  | Dehydration                                    |
| `"clammy skin"` / `"diaphoresis"`  | ⚠️ WARNING  | Shock / hypoglycemia                           |
| `"macule"` / `"papule"`            | ℹ️ INFO     | Minor skin finding                             |

#### 👄 Oral — `oral_condition`

| Input Phrase                             | Severity    | Alert Topic                     |
| ---------------------------------------- | ----------- | ------------------------------- |
| `"blue lips"` / `"cyanotic lips"`        | 🚨 CRITICAL | Central cyanosis — hypoxemia    |
| `"Koplik spots"`                         | 🚨 CRITICAL | Measles (rubeola)               |
| `"leukoplakia"`                          | 🚨 CRITICAL | Premalignant oral lesion        |
| `"dry lips"` / `"cracked lips"`          | ⚠️ WARNING  | Dehydration                     |
| `"white curd-like plaques"` / `"thrush"` | ⚠️ WARNING  | Oral candidiasis                |
| `"pale lips"`                            | ⚠️ WARNING  | Anemia / hypoperfusion          |
| `"angular cheilitis"`                    | ⚠️ WARNING  | Candida or B-vitamin deficiency |

#### 🫁 Abdomen — `abdomen_condition`

| Input Phrase                          | Severity    | Alert Topic                     |
| ------------------------------------- | ----------- | ------------------------------- |
| `"rebound tenderness"`                | 🚨 CRITICAL | Peritonitis                     |
| `"guarding"` / `"board-like abdomen"` | 🚨 CRITICAL | Peritoneal irritation           |
| `"pulsating mass midline"`            | 🚨 CRITICAL | Abdominal aortic aneurysm (AAA) |
| `"Cullen sign"`                       | 🚨 CRITICAL | Intraperitoneal bleeding        |
| `"distended abdomen"`                 | ⚠️ WARNING  | Gas, ascites, or obstruction    |
| `"right upper quadrant tenderness"`   | ⚠️ WARNING  | Hepatobiliary disease           |
| `"shifting dullness"`                 | ⚠️ WARNING  | Ascites                         |
| `"flat abdomen"`                      | ℹ️ INFO     | Normal finding                  |

---

## 📱 Mobile Integration Guide (Flutter, React Native, Swift, Kotlin)

When submitting physical exam data from a mobile app to this Laravel backend, follow these strict requirements for networking and data structure.

### 1. Request Headers

Laravel expects these headers for every request:

- `Accept: application/json` (Ensures Laravel returns JSON even on errors)
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

### 2. Implementation Examples

#### **Flutter (using `http` package)**

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> submitPhysicalExam(String token, Map<String, dynamic> data) async {
  final url = Uri.parse('http://your-domain.com/api/physical-exam');

  final response = await http.post(
    url,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    },
    body: jsonEncode(data),
  );

  if (response.statusCode == 201) {
    print('Success: ${jsonDecode(response.body)['message']}');
  } else {
    print('Error: ${response.statusCode} - ${response.body}');
  }
}
```

#### **React Native (using `axios`)**

```javascript
import axios from 'axios';

const submitExam = async (token, examData) => {
  try {
    const response = await axios.post(
      'http://your-domain.com/api/physical-exam',
      examData,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log('Saved!', response.data.message);
    return response.data;
  } catch (error) {
    console.error('Submission Failed', error.response.data);
  }
};
```

### 3. Handling Validation Errors (422 Unprocessable Content)

If a required field (like `patient_id`) is missing, Laravel returns a `422` status. Your mobile app must parse the `errors` object to show specific feedback.

**Error Response Structure:**

```json
{
  "message": "The patient id field is required.",
  "errors": {
    "patient_id": ["The patient id field is required."]
  }
}
```

### 4. Best Practices for Mobile

- **HTTPS Only:** In production, never use `http`. Ensure your backend has an SSL certificate.
- **Background Sync:** If the nurse is in a low-signal area, implement a local SQLite/Room database to save findings first, then sync to the API when online.
- **Token Persistence:** Securely store the Bearer token using `Flutter Secure Storage` or `React Native Keychain`. Never store it in plain `SharedPreferences` or `LocalStorage`.
- **Debouncing:** If implementing "Live Typing" alerts on mobile, use a debounce of at least 800ms to save battery and reduce data usage.
