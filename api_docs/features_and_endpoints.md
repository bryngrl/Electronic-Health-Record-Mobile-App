# Application Features and API Connection Guide

This document outlines all the features available in your EHR application (Nurse and Doctor portals) and explains how the frontend fetches and sends data to the FastAPI backend. Use this guide to recreate these interactions in your website version.

## 🔗 How the Connection Works

The mobile app uses **Axios** (`apiClient.ts`) to communicate with the backend. 
- **Base URL**: `http://<backend-ip>:8000`
- **Headers**: 
  - `Content-Type: application/json`
  - `Accept: application/json`

If you are building a website, you can use the browser's native `fetch` API or a library like `axios` to make these exact same requests.

---

## 🔐 1. Authentication
Handles user login and role-based access.

* **Login**
  * **Endpoint:** `POST /auth/login`
  * **How it sends data:** The mobile app currently sends credentials as query parameters: `?email=...&password=...`
  * **Response:** Returns an `access_token`, `role` (nurse, doctor, admin), `full_name`, and `user_id`. The app stores these to maintain the session.

---

## 🧑‍⚕️ 2. Doctor Features

### Doctor Dashboard
Displays recent updates and notifications about patients.
* **Fetch Updates**
  * **Endpoint:** `GET /doctor/updates`
  * **How it gets data:** Returns an array of `PatientUpdate` objects containing the patient's name, update type, status (Read/Unread), and timestamp.
* **Mark Update as Read**
  * **Endpoint:** `PUT /doctor/updates/{updateId}/read`
  * **How it sends data:** Changes the status of a notification from 'Unread' to 'Read'.

---

## 🏥 3. Patient Management (General)

* **Register Patient**
  * **Endpoint:** `POST /patients/`
  * **Body:** JSON containing patient demographic details (name, age, sex, admission date, etc.).
* **Search / List Patients**
  * **Endpoint:** `GET /patients/`
  * **Returns:** An array of all registered patients.
* **Get Patient Details**
  * **Endpoint:** `GET /patients/{patient_id}`
* **Update Patient Details**
  * **Endpoint:** `PUT /patients/{patient_id}`

---

## 🩺 4. Nurse Features (ADPIE Workflow)
These features utilize a 5-step Nursing Process: **Assessment, Diagnosis, Planning, Intervention, Evaluation (ADPIE)**. The backend's Clinical Decision Support System (CDSS) evaluates the Assessment step to generate clinical alerts.

**The standard API flow for these features:**
1. `POST /<feature-name>/` (Sends assessment data, receives CDSS alerts & Record ID).
2. `PUT /<feature-name>/{id}/diagnosis`
3. `PUT /<feature-name>/{id}/planning`
4. `PUT /<feature-name>/{id}/intervention`
5. `PUT /<feature-name>/{id}/evaluation`

**Read Endpoints (common across ADPIE features):**
* `GET /<feature-name>/patient/{patient_id}` - Fetch history for a patient.
* `GET /<feature-name>/{id}/extract-adpie` - Get formatted report for printing/viewing.

### Physical Exam
* **Endpoint Prefix:** `/physical-exam`
* **Assessment Fields:** `general_appearance`, `skin_condition`, `eye_condition`, `oral_condition`, `cardiovascular`, `abdomen_condition`, `extremities`, `neurological`.

### Vital Signs
* **Endpoint Prefix:** `/vital-signs`
* **Assessment Fields:** `date`, `time`, `day_no`, `temperature`, `hr`, `rr`, `bp`, `spo2`.

### Intake and Output
* **Endpoint Prefix:** `/intake-and-output`
* **Assessment Fields:** `day_no`, `oral_intake`, `iv_fluids_volume`, `iv_fluids_type`, `urine_output`.

### Activities of Daily Living (ADL)
* **Endpoint Prefix:** `/adl`
* **Assessment Fields:** Pertains to mobility, hygiene, toileting, feeding, hydration, sleep patterns, and pain levels.

### Lab Values
* **Endpoint Prefix:** `/lab-values`
* **Assessment Fields:** WBC, RBC, HGB, HCT, Platelets, and differential counts (neutrophils, lymphocytes, etc.) along with their normal ranges.

---

## 📋 5. Nurse Features (Standard Data Entry)
These features are straightforward data forms and do not use the full ADPIE/CDSS workflow.

### Medical History
* **Endpoint Prefix:** `/medical-history`
* **Features:** Manages 5 sub-components:
  * Present Illness
  * Past Medical/Surgical
  * Allergies
  * Vaccination
  * Developmental History

### Diagnostics (Imaging)
* **Endpoint Prefix:** `/diagnostics`
* **Usage:** Handles file uploads (X-Rays, Ultrasounds, etc.) and linking them to patient records. Uses `multipart/form-data` instead of JSON.

### IVs & Lines
* **Endpoint Prefix:** `/ivs-and-lines`
* **Fields:** Tracks IV fluid type, rate, site, and status.

### Discharge Planning
* **Endpoint Prefix:** `/discharge-planning`
* **Fields:** Records discharge criteria (e.g., fever resolved) and instructions (medications, appointments).

### Medication Administration
* **Endpoint Prefix:** `/medication-administration`
* **Fields:** Records the medication given, dose, route, frequency, time, and date.

### Medication Reconciliation
* **Endpoint Prefix:** `/medication-reconciliation`
* **Features:** Manages 3 sub-components: Home Medications, Current Medications, and Changes in Medication.

---

## 💻 How to Connect Your Website

To implement these in your website (e.g., using React, Vue, or Vanilla JS), you will follow this pattern:

**Example: Fetching Patients (React/Fetch API)**
```javascript
const fetchPatients = async () => {
  const response = await fetch('http://<your-backend-ip>:8000/patients/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Include authorization token if your backend enforces it later
      // 'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  const data = await response.json();
  console.log(data);
};
```

**Example: Submitting a Physical Exam (Assessment Step)**
```javascript
const submitPhysicalExam = async (patientId, formData) => {
  // Mobile app sanitizes empty strings to "N/A" before sending
  const sanitizedData = sanitizeEmptyFields(formData);

  const response = await fetch('http://<your-backend-ip>:8000/physical-exam/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      patient_id: patientId,
      ...sanitizedData
    })
  });
  
  const result = await response.json();
  // result contains generated CDSS alerts (e.g., result.general_appearance_alert)
  // and the new record ID (result.id) needed for the DPIE steps
  return result;
};
```