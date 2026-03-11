# 📱 Master Sync Guide: Mobile App API Reference

---

## Instructions (run this) !!!:

- **STEP 1: Laravel (Website Project):** `php artisan serve --host=0.0.0.0 --port=8000` (run localhost server)
- **STEP 2: React Native (Mobile Project):** `cd ehr, npm run android` (start android app)
- **Note:** (Make sure to input your current IP Adress in apiClient.ts)

---

This document is the complete reference for connecting this React Native app to the Laravel EHR backend.

---

## 1. 🔗 Connection & Auth

- **Base URL:** `http://(YOUR IP):8000/api`
- **Login:** `POST /auth/login?email={username}&password={pass}`
- **Auth Mode:** Bearer Token (Laravel Sanctum). Add `Authorization: Bearer {token}` to all requests.

---

## 2. 🏥 Patient Management

| Action            | Method | Endpoint                      | Key Fields                                                |
| :---------------- | :----- | :---------------------------- | :-------------------------------------------------------- |
| **Register**      | POST   | `/patient`                    | `first_name`, `last_name`, `age`, `sex`, `admission_date` |
| **List Active**   | GET    | `/patient`                    | Returns patients where `is_active: 1`                     |
| **List All**      | GET    | `/patient?all=true`           | Bypass active filter                                      |
| **Edit**          | PUT    | `/patient/{id}`               | Update any patient field                                  |
| **Toggle Status** | POST   | `/patient/{id}/toggle-status` | Body: `{ "is_active": true/false }`                       |

---

## 3. 🩺 Core Assessment & CDSS (ADPIE)

Assessment is the first step. CDSS buttons (ADPIE) are used to analyze findings and provide recommendations.

| Assessment        | Method | Endpoint                 | Key Fields                                        |
| :---------------- | :----- | :----------------------- | :------------------------------------------------ |
| **Vital Signs**   | POST   | `/api/vital-signs`       | `temperature`, `hr`, `rr`, `bp`, `spo2`           |
| **Physical Exam** | POST   | `/api/physical-exam`     | `general_appearance`, `skin_condition`, etc.      |
| **ADL**           | POST   | `/api/adl`               | `mobility_assessment`, `hygiene_assessment`       |
| **Intake/Output** | POST   | `/api/intake-and-output` | `oral_intake`, `iv_fluids_volume`, `urine_output` |
| **Lab Values**    | POST   | `/api/lab-values`        | `sodium`, `potassium`, `glucose`, etc.            |

### **ADPIE / CDSS Workflow**

After saving an assessment, use these endpoints for the CDSS (Clinical Decision Support System) buttons.

| Action               | Method | Endpoint                      | Description                                                                                |
| :------------------- | :----- | :---------------------------- | :----------------------------------------------------------------------------------------- |
| **Initialize ADPIE** | GET    | `/api/adpie/{component}/{id}` | Get/Create Nursing Diagnosis for a record                                                  |
| **Analyze Field**    | POST   | `/api/adpie/analyze`          | Get CDSS recommendation for a field                                                        |
| **Analyze Batch**    | POST   | `/api/adpie/analyze-batch`    | Get recommendations for multiple fields (for loading saved cdss patient quickly if it has) |
| **Save Step**        | PUT    | `/api/adpie/{diag_id}/{step}` | Save Diagnosis, Planning, etc.                                                             |

**Components:** `vital-signs`, `physical-exam`, `adl`, `intake-and-output`, `lab-values`
**Steps:** `diagnosis`, `planning`, `intervention`, `evaluation`

**Analyze Field Body:**

```json
{
  "fieldName": "diagnosis",
  "finding": "Patient has elevated heart rate and fever.",
  "component": "vital-signs"
}
```

**Save Step Body:**

```json
{
  "diagnosis": "Hyperthermia related to infection",
  "component": "vital-signs"
}
```

---

## 💊 4. Medication Administration

To handle display and editing based on time slots without app crashes:

### **A. Load Data for a Time Slot**

When a user selects a time (e.g., 08:00), call this:

- **URL:** `GET /api/medication-administration/patient/{patient_id}/time/{time}`
- **Response Logic:** Always returns **200 OK**. Check `response.data.exists`.

### **B. Save or Edit**

- **URL:** `POST /api/medication-administration`
- **Logic:** Uses `updateOrCreate`. Automatically overwrites old data for same patient/date/time.

---

## 🤝 5. Medical Reconciliation (Medication Reconciliation)

Handles the 3-category medication sync between mobile and website.

### **A. Unified Fetch (Patient History)**

- **URL:** `GET /api/medical-reconciliation/patient/{patient_id}`
- **Returns:** `{ "current": [], "home": [], "changes": [] }`

### **B. Save / Update Sub-Forms**

The API uses `updateOrCreate` for each category.

| Category         | Method | Endpoint                              |
| :--------------- | :----- | :------------------------------------ |
| **Current Meds** | POST   | `/api/medical-reconciliation/current` |
| **Home Meds**    | POST   | `/api/medical-reconciliation/home`    |
| **Med Changes**  | POST   | `/api/medical-reconciliation/changes` |

**JSON Body Example (Current Meds):**

```json
{
  "patient_id": 19,
  "current_med": "Aspirin",
  "current_dose": "81mg",
  "current_route": "Oral",
  "current_frequency": "Once daily",
  "current_indication": "Blood thinner",
  "current_text": "Patient has been taking this for 2 years"
}
```

---

## 📝 6. Medical History Forms (5 Sub-forms)

Access all history for a patient via `GET /api/medical-history/patient/{id}`.

| Form                | Method | Endpoint                               |
| :------------------ | :----- | :------------------------------------- |
| **Present Illness** | POST   | `/api/medical-history/present-illness` |
| **Past Medical**    | POST   | `/api/medical-history/past-history`    |
| **Allergies**       | POST   | `/api/medical-history/allergies`       |
| **Vaccination**     | POST   | `/api/medical-history/vaccination`     |

---

## 💉 7. Clinical & Diagnostics

| Form               | Method | Endpoint                        |
| :----------------- | :----- | :------------------------------ |
| **IVs & Lines**    | POST   | `/api/ivs-and-lines`            |
| **Discharge Plan** | POST   | `/api/discharge-planning`       |
| **Upload Image**   | POST   | `/api/diagnostics`              |
| **View Images**    | GET    | `/api/diagnostics/patient/{id}` |

---

## 🛠️ 8. Tutorial: Connecting ADPIE API to Mobile Screens

This section explains how to implement the 4-step ADPIE (Diagnosis, Planning, Intervention, Evaluation) workflow in your mobile app using the centralized CDSS API.

### **Step 1: Initialize the ADPIE Record**

When a user clicks the "CDSS" or "ADPIE" button from an assessment (e.g., Physical Exam), first initialize the record.

- **Endpoint:** `GET /api/adpie/{component}/{record_id}`
- **Example:** `GET /api/adpie/physical-exam/15`
- **What to do:** Store the returned `data.id` (this is the `diag_id` used for saving).

### **Step 2: Implement Live CDSS Analysis (Debounced)**

As the nurse types in any field (e.g., the Diagnosis textarea), you should show live recommendations.

- **Logic:** Use a **debounce** (e.g., 800ms) to avoid hitting the API on every keystroke.
- **Endpoint:** `POST /api/adpie/analyze`
- **Body:**
  ```json
  {
    "fieldName": "diagnosis",
    "finding": "Patient has crackles in lungs",
    "component": "physical-exam"
  }
  ```
- **Response Handle:**
  - If `message` is `"NO RECOMMENDATIONS"`, show a "No recommendations yet" placeholder.
  - Otherwise, display the `message` (plain text) in a "Clinical Guidance" card.

### **Step 3: Loading Saved Data (Batch Analysis)**

When the user opens a previously started ADPIE process, use Batch Analysis to get all recommendations at once.

- **Endpoint:** `POST /api/adpie/analyze-batch`
- **Body:**
  ```json
  {
    "component": "physical-exam",
    "batch": [
      { "fie# 📱 Master Sync Guide: Mobile App API Reference
  ```

This document is the complete reference for connecting your React Native app to the Laravel EHR backend.

---

## 1. 🔗 Connection & Auth

- **Base URL:** `http://192.168.1.14:8000/api`
- **Login:** `POST /auth/login?email={username}&password={pass}`
- **Auth Mode:** Bearer Token (Laravel Sanctum). Add `Authorization: Bearer {token}` to all requests.

---

## 2. 🏥 Patient Management

| Action            | Method | Endpoint                      | Key Fields                                                |
| :---------------- | :----- | :---------------------------- | :-------------------------------------------------------- |
| **Register**      | POST   | `/patient`                    | `first_name`, `last_name`, `age`, `sex`, `admission_date` |
| **List Active**   | GET    | `/patient`                    | Returns patients where `is_active: 1`                     |
| **List All**      | GET    | `/patient?all=true`           | Bypass active filter                                      |
| **Edit**          | PUT    | `/patient/{id}`               | Update any patient field                                  |
| **Toggle Status** | POST   | `/patient/{id}/toggle-status` | Body: `{ "is_active": true/false }`                       |

---

## 3. 🩺 Core Assessment & CDSS (ADPIE)

Assessment is the first step. CDSS buttons (ADPIE) are used to analyze findings and provide recommendations.

| Assessment        | Method | Endpoint                 | Key Fields                                        |
| :---------------- | :----- | :----------------------- | :------------------------------------------------ |
| **Vital Signs**   | POST   | `/api/vital-signs`       | `temperature`, `hr`, `rr`, `bp`, `spo2`           |
| **Physical Exam** | POST   | `/api/physical-exam`     | `general_appearance`, `skin_condition`, etc.      |
| **ADL**           | POST   | `/api/adl`               | `mobility_assessment`, `hygiene_assessment`       |
| **Intake/Output** | POST   | `/api/intake-and-output` | `oral_intake`, `iv_fluids_volume`, `urine_output` |
| **Lab Values**    | POST   | `/api/lab-values`        | `sodium`, `potassium`, `glucose`, etc.            |

### **ADPIE / CDSS Workflow**

After saving an assessment, use these endpoints for the CDSS (Clinical Decision Support System) buttons.

| Action               | Method | Endpoint                      | Description                                                                                |
| :------------------- | :----- | :---------------------------- | :----------------------------------------------------------------------------------------- |
| **Initialize ADPIE** | GET    | `/api/adpie/{component}/{id}` | Get/Create Nursing Diagnosis for a record                                                  |
| **Analyze Field**    | POST   | `/api/adpie/analyze`          | Get CDSS recommendation for a field                                                        |
| **Analyze Batch**    | POST   | `/api/adpie/analyze-batch`    | Get recommendations for multiple fields (for loading saved cdss patient quickly if it has) |
| **Save Step**        | PUT    | `/api/adpie/{diag_id}/{step}` | Save Diagnosis, Planning, etc.                                                             |

**Components:** `vital-signs`, `physical-exam`, `adl`, `intake-and-output`, `lab-values`
**Steps:** `diagnosis`, `planning`, `intervention`, `evaluation`

**Analyze Field Body:**

```json
{
  "fieldName": "diagnosis",
  "finding": "Patient has elevated heart rate and fever.",
  "component": "vital-signs"
}
```

**Save Step Body:**

```json
{
  "diagnosis": "Hyperthermia related to infection",
  "component": "vital-signs"
}
```

---

## 💊 4. Medication Administration

To handle display and editing based on time slots without app crashes:

### **A. Load Data for a Time Slot**

When a user selects a time (e.g., 08:00), call this:

- **URL:** `GET /api/medication-administration/patient/{patient_id}/time/{time}`
- **Response Logic:** Always returns **200 OK**. Check `response.data.exists`.

### **B. Save or Edit**

- **URL:** `POST /api/medication-administration`
- **Logic:** Uses `updateOrCreate`. Automatically overwrites old data for same patient/date/time.

---

## 🤝 5. Medical Reconciliation (Medication Reconciliation)

Handles the 3-category medication sync between mobile and website.

### **A. Unified Fetch (Patient History)**

- **URL:** `GET /api/medical-reconciliation/patient/{patient_id}`
- **Returns:** `{ "current": [], "home": [], "changes": [] }`

### **B. Save / Update Sub-Forms**

The API uses `updateOrCreate` for each category.

| Category         | Method | Endpoint                              |
| :--------------- | :----- | :------------------------------------ |
| **Current Meds** | POST   | `/api/medical-reconciliation/current` |
| **Home Meds**    | POST   | `/api/medical-reconciliation/home`    |
| **Med Changes**  | POST   | `/api/medical-reconciliation/changes` |

**JSON Body Example (Current Meds):**

```json
{
  "patient_id": 19,
  "current_med": "Aspirin",
  "current_dose": "81mg",
  "current_route": "Oral",
  "current_frequency": "Once daily",
  "current_indication": "Blood thinner",
  "current_text": "Patient has been taking this for 2 years"
}
```

---

## 📝 6. Medical History Forms (5 Sub-forms)

Access all history for a patient via `GET /api/medical-history/patient/{id}`.

| Form                | Method | Endpoint                               |
| :------------------ | :----- | :------------------------------------- |
| **Present Illness** | POST   | `/api/medical-history/present-illness` |
| **Past Medical**    | POST   | `/api/medical-history/past-history`    |
| **Allergies**       | POST   | `/api/medical-history/allergies`       |
| **Vaccination**     | POST   | `/api/medical-history/vaccination`     |

---

## 💉 7. Clinical & Diagnostics

| Form               | Method | Endpoint                        |
| :----------------- | :----- | :------------------------------ |
| **IVs & Lines**    | POST   | `/api/ivs-and-lines`            |
| **Discharge Plan** | POST   | `/api/discharge-planning`       |
| **Upload Image**   | POST   | `/api/diagnostics`              |
| **View Images**    | GET    | `/api/diagnostics/patient/{id}` |

---

## 🔔 8. Data Alerts API (Summary View)

This API provides the latest clinical alerts generated from assessments. Use this to display "Red Flags" or "Warning" icons in summary views or section headers.

| Action                  | Method | Endpoint                                           | Description                                  |
| :---------------------- | :----- | :------------------------------------------------- | :------------------------------------------- |
| **Get All Alerts**      | GET    | `/api/data-alert/patient/{patient_id}`             | Returns latest alerts for all 5 sections     |
| **Get Component Alert** | GET    | `/api/{component}/data-alert/patient/{patient_id}` | Returns alert for a specific section (ADPIE) |

**Components:** `vital-signs`, `physical-exam`, `adl`, `intake-and-output`, `lab-values`

**Example Response (All Alerts):**

```json
{
  "vital_signs": "Fever with tachycardia; Severe Hypertension",
  "physical_exam": "Abnormal skin turgor; Crackles in lungs",
  "adl": "Pain level: 8/10",
  "intake_and_output": "Low urine output",
  "lab_values": "High WBC count; Low Hemoglobin"
}
```

---

## 🛠️ 9. Tutorial: Physical Exam Alerts & CDSS

The Physical Exam module uses a Clinical Decision Support System (CDSS) to analyze nurse findings in real-time.

### **A. Field Names (Crucial)**

When sending data to the Physical Exam API, you **MUST** use these exact field names for the CDSS to work:

| Field Key            | UI Label           |
| :------------------- | :----------------- |
| `general_appearance` | GENERAL APPEARANCE |
| `skin_condition`     | SKIN               |
| `eye_condition`      | EYES               |
| `oral_condition`     | ORAL CAVITY        |
| `cardiovascular`     | CARDIOVASCULAR     |
| `abdomen_condition`  | ABDOMEN            |
| `extremities`        | EXTRAMITIES        |
| `neurological`       | NEUROLOGICAL       |

### **B. Live Analysis (Real-time Feedback)**

As the nurse types findings into a textarea, call the analysis endpoint to show immediate alerts.

- **Endpoint:** `POST /api/adpie/analyze`
- **Body Example:**

```json
{
  "fieldName": "skin_condition",
  "finding": "Poor skin turgor and dry mucous membranes",
  "component": "physical-exam"
}
```

- **Response Handle:**
  - If `level` is `CRITICAL` or `WARNING`, show a red/amber notification icon next to the input.
  - If `message` is `"NO RECOMMENDATIONS"`, clear any existing alerts.

### **C. Summary Alerts (Section Headers)**

To show if a Physical Exam section has any alerts without opening it:

1. Call `GET /api/physical-exam/data-alert/patient/{id}`.
2. The backend will return a concatenated string of all current physical exam alerts (e.g., `"Abnormal skin turgor; Crackles in lungs"`).
3. If the string is not empty, display a "🔔" icon on the Physical Exam menu item.

---

## 🛠️ 10. Tutorial: Connecting ADPIE API to Mobile Screens

This section explains how to implement the 4-step ADPIE (Diagnosis, Planning, Intervention, Evaluation) workflow in your mobile app using the centralized CDSS API.

### **Step 1: Initialize the ADPIE Record**

When a user clicks the "CDSS" or "ADPIE" button from an assessment (e.g., Physical Exam), first initialize the record.

- **Endpoint:** `GET /api/adpie/{component}/{record_id}`
- **Example:** `GET /api/adpie/physical-exam/15`
- **What to do:** Store the returned `data.id` (this is the `diag_id` used for saving).

### **Step 2: Implement Live CDSS Analysis (Debounced)**

As the nurse types in any field (e.g., the Diagnosis textarea), you should show live recommendations.

- **Logic:** Use a **debounce** (e.g., 800ms) to avoid hitting the API on every keystroke.
- **Endpoint:** `POST /api/adpie/analyze`
- **Body:**
  ```json
  {
    "fieldName": "diagnosis",
    "finding": "Patient has crackles in lungs",
    "component": "physical-exam"
  }
  ```
- **Response Handle:**
  - If `message` is `"NO RECOMMENDATIONS"`, show a "No recommendations yet" placeholder.
  - Otherwise, display the `message` (plain text) in a "Clinical Guidance" card.

### **Step 3: Loading Saved Data (Batch Analysis)**

When the user opens a previously started ADPIE process, use Batch Analysis to get all recommendations at once.

- **Endpoint:** `POST /api/adpie/analyze-batch`
- **Body:**
  ```json
  {
    "component": "physical-exam",
    "batch": [
      { "fieldName": "diagnosis", "finding": "..." },
      { "fieldName": "planning", "finding": "..." },
      { "fieldName": "intervention", "finding": "..." },
      { "fieldName": "evaluation", "finding": "..." }
    ]
  }
  ```

### **Step 4: Saving Progress (Per Step)**

Save the user's input as they move between steps (e.g., clicking "Next" from Diagnosis to Planning).

- **Endpoint:** `PUT /api/adpie/{diag_id}/{step}`
- **Example:** `PUT /api/adpie/42/diagnosis`
- **Body:**
  ```json
  {
    "diagnosis": "Impaired gas exchange related to...",
    "component": "physical-exam"
  }
  ```
- **Pro-Tip:** The backend automatically updates the `diagnosis_alert` in the database based on the latest CDSS rules during this save.

---

## 🛠️ Troubleshooting Tips

1.  **Duplicate Records:** Use the provided ID endpoints to update instead of creating new ones.
2.  **404 Errors:** Double-check the URL prefixes match the organized sections above.
3.  **Syncing:** The website automatically detects mobile updates via the same shared MySQL database.
    ldName": "diagnosis", "finding": "..." },
    { "fieldName": "planning", "finding": "..." },
    { "fieldName": "intervention", "finding": "..." },
    { "fieldName": "evaluation", "finding": "..." }
    ]
    }

````

### **Step 4: Saving Progress (Per Step)**

Save the user's input as they move between steps (e.g., clicking "Next" from Diagnosis to Planning).

- **Endpoint:** `PUT /api/adpie/{diag_id}/{step}`
- **Example:** `PUT /api/adpie/42/diagnosis`
- \*\*Body:
```json
{
  "diagnosis": "Impaired gas exchange related to...",
  "component": "physical-exam"
}
````

- **Pro-Tip:** The backend automatically updates the `diagnosis_alert` in the database based on the latest CDSS rules during this save.

---

## 🛠️ Troubleshooting Tips

1.  **Duplicate Records:** Use the provided ID endpoints to update instead of creating new ones.
2.  **404 Errors:** Double-check the URL prefixes match the organized sections above.
3.  **Syncing:** The website automatically detects mobile updates via the same shared MySQL database.
