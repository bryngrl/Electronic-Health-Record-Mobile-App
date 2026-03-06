# 📱 Master Sync Guide: Mobile App API Reference

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

## 3. 🩺 Core Assessment Forms (ADPIE)

These endpoints save the **actual data** from your forms and trigger CDSS.

| Feature           | Method | Endpoint             | Form Data Examples                                           |
| :---------------- | :----- | :------------------- | :----------------------------------------------------------- |
| **Vital Signs**   | POST   | `/vital-signs`       | `temperature`, `hr`, `rr`, `bp`, `spo2`, `time`, `date`      |
| **Physical Exam** | POST   | `/physical-exam`     | `general_appearance`, `skin_condition`, `neurological`, etc. |
| **ADL**           | POST   | `/adl`               | `mobility_assessment`, `hygiene_assessment`, etc.            |
| **Intake/Output** | POST   | `/intake-and-output` | `oral_intake`, `iv_fluids_volume`, `urine_output`            |

**Workflow:**

1. `GET .../{id}/assessment` to load current data.
2. `PUT .../{id}/assessment` to update existing data.
3. `PUT .../{id}/{step}` (diagnosis, planning, etc.) to save ADPIE steps.

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

## 🛠️ Troubleshooting Tips

1.  **Duplicate Records:** Use the provided ID endpoints to update instead of creating new ones.
2.  **404 Errors:** Double-check the URL prefixes match the organized sections above.
3.  **Syncing:** The website automatically detects mobile updates via the same shared MySQL database.
