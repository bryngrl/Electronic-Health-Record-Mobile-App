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

## 💊 4. Medication Administration (FIXED)

To handle display and editing based on time slots without app crashes:

### **A. Load Data for a Time Slot**

When a user selects a time (e.g., 08:00), call this:

- **URL:** `GET /api/medication-administration/patient/{patient_id}/time/{time}`
- **Response Logic:**
  - Always returns **200 OK** (never 404).
  - If data exists: `response.data.exists` is `true`.
  - If no data: `response.data.exists` is `false`.

**React Native Example:**

```javascript
const response = await apiClient.get(
  `/medication-administration/patient/19/time/08:00`,
);
if (response.data.exists) {
  // Fill inputs with response.data.medication, etc.
} else {
  // Clear inputs for new entry
}
```

### **B. Save or Edit**

- **URL:** `POST /api/medication-administration`
- **Logic:** Uses `updateOrCreate`. Sending the same `patient_id`, `date`, and `time` will **overwrite** the old data automatically.

---

## 📝 5. Medical History Forms (5 Sub-forms)

Access all history for a patient via `GET /api/medical-history/patient/{id}`.

| Form                | Method | Endpoint                               |
| :------------------ | :----- | :------------------------------------- |
| **Present Illness** | POST   | `/api/medical-history/present-illness` |
| **Past Medical**    | POST   | `/api/medical-history/past-history`    |
| **Allergies**       | POST   | `/api/medical-history/allergies`       |
| **Vaccination**     | POST   | `/api/medical-history/vaccination`     |

---

## 💉 6. Clinical & Diagnostics

| Form               | Method | Endpoint                        |
| :----------------- | :----- | :------------------------------ |
| **IVs & Lines**    | POST   | `/api/ivs-and-lines`            |
| **Discharge Plan** | POST   | `/api/discharge-planning`       |
| **Upload Image**   | POST   | `/api/diagnostics`              |
| **View Images**    | GET    | `/api/diagnostics/patient/{id}` |

---

## 🛠️ Troubleshooting Tips

1.  **Duplicate Records:** Ensure your `time` format is consistent (HH:mm). The API will normalize `08:00` to `08:00:00`.
2.  **404 Errors:** Double-check the URL prefixes (`/patient/`, `/time/`, etc.) match exactly.
3.  **Syncing:** The website uses the same `is_active` logic. If you deactivate on mobile, the website row turns red automatically.
