# EHR Backend Documentation

**Project**: Electronic Health Record (EHR) System Backend  
**Framework**: FastAPI (Python)  
**Database**: MySQL  
**Date Started**: February 2026  
**Status**: In Development

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [Components Implemented](#components-implemented)
6. [CDSS Engine](#cdss-engine)
7. [API Endpoints](#api-endpoints)
8. [Setup Instructions](#setup-instructions)
9. [Integration with Laravel Frontend](#integration-with-laravel-frontend)
10. [Future Enhancements](#future-enhancements)
11. [Migration Plan](#migration-plan)

---

## Project Overview

The EHR Backend is a comprehensive clinical decision support system (CDSS) designed to:

- **Manage patient health records** with comprehensive data collection
- **Support ADPIE nursing workflow** (Assessment, Diagnosis, Planning, Intervention, Evaluation)
- **Auto-generate clinical alerts** using CDSS rules engine
- **Validate data** against clinical standards
- **Provide RESTful API** for frontend integration

### Key Features

✅ **ADPIE Workflow Support** - Complete nursing process implementation  
✅ **CDSS Engine** - Automated clinical decision support with YAML-based rules  
✅ **Multi-Component System** - Physical Exam, Vital Signs, and more  
✅ **Auto-generated Alerts** - Real-time clinical alerts based on findings  
✅ **Comprehensive Database** - Structured patient and clinical data  
✅ **RESTful API** - FastAPI with automatic documentation  

---

## Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────┐
│     Laravel Web Application (Frontend)    │
│     - Views, Forms, UI Components        │
│     - Patient Management Interface       │
│     - Nurse Data Entry Forms             │
└────────────────┬─────────────────────────┘
                 │ HTTP API Calls (JSON)
                 ▼
┌──────────────────────────────────────────┐
│     FastAPI Backend (Python)              │
│     ┌──────────────────────────────────┐ │
│     │   Routers (API Endpoints)        │ │
│     │   - Physical Exam                │ │
│     │   - Vital Signs                  │ │
│     │   - [Future Components]          │ │
│     └──────────────────────────────────┘ │
│     ┌──────────────────────────────────┐ │
│     │   Business Logic                 │ │
│     │   - CDSS Engine                  │ │
│     │   - Validation & Rules           │ │
│     │   - ADPIE Workflow               │ │
│     └──────────────────────────────────┘ │
│     ┌──────────────────────────────────┐ │
│     │   Models (SQLAlchemy ORM)        │ │
│     │   - Patient, User                │ │
│     │   - PhysicalExam, VitalSigns     │ │
│     │   - [Future Models]              │ │
│     └──────────────────────────────────┘ │
└────────────────┬─────────────────────────┘
                 │
                 ▼
         ┌──────────────────┐
         │   MySQL (ehr_db) │
         │   - Patients     │
         │   - Users        │
         │   - Records      │
         │   - Nursing Diag │
         └──────────────────┘
```

### Directory Structure

```
ehr_backend/
├── app/
│   ├── core/
│   │   ├── cdss_engine.py          # CDSS Rule Engine
│   │   └── security.py              # Authentication & Security
│   ├── database/
│   │   ├── base.py                 # SQLAlchemy Base
│   │   ├── db.py                   # Database Connection
│   │   └── ehr-db-2.sql            # Database Schema
│   ├── models/
│   │   ├── user.py                 # User Model
│   │   ├── patient.py              # Patient Model
│   │   ├── nursing_diagnosis.py    # Nursing Diagnosis Model
│   │   ├── physical_exam/
│   │   │   ├── __init__.py
│   │   │   └── physical_exam.py    # PhysicalExam Model
│   │   └── vital_signs/
│   │       ├── __init__.py
│   │       └── vital_signs.py      # VitalSigns Model
│   ├── routers/
│   │   ├── auth.py                 # Authentication Routes
│   │   ├── patient.py              # Patient Routes
│   │   ├── physical_exam/
│   │   │   ├── __init__.py
│   │   │   ├── nursing_diagnosis.py
│   │   │   └── physical_exam.py    # Physical Exam Routes (ADPIE)
│   │   └── vital_signs/
│   │       ├── __init__.py
│   │       └── vital_signs.py      # Vital Signs Routes (ADPIE)
│   ├── cdss_rules/
│   │   ├── dpie/
│   │   │   ├── diagnosis.yaml      # Diagnosis Rules (all components)
│   │   │   ├── planning.yaml       # Planning Rules (all components)
│   │   │   ├── intervention.yaml   # Intervention Rules (all components)
│   │   │   └── evaluation.yaml     # Evaluation Rules (all components)
│   │   ├── physical_exam/
│   │   │   └── assessment.yaml     # Physical Exam Assessment Rules
│   │   └── vital_signs/
│   │       └── assessment.yaml     # Vital Signs Assessment Rules
│   ├── services/
│   │   └── auth_service.py         # Authentication Service
│   ├── main.py                     # Application Entry Point
│   └── __init__.py
├── requirements.txt                # Python Dependencies
├── babel.config.js
├── jest.config.js
├── metro.config.js
├── tsconfig.json
└── README.md
```

---

## Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.14)
- **ORM**: SQLAlchemy
- **Database**: MySQL
- **Authentication**: JWT/Sessions
- **API Documentation**: Swagger UI (built-in with FastAPI)

### Frontend (Existing)
- **Framework**: React Native (from package.json)
- **TypeScript**: Enabled
- **Testing**: Jest

### Development Tools
- **Virtual Environment**: venv (.venv)
- **Database Driver**: PyMySQL
- **API Testing**: Uvicorn (ASGI server)

---

## Database Schema

### Core Tables

#### `users`
```sql
- id (BIGINT UNSIGNED, PK)
- username (VARCHAR)
- email (VARCHAR, UNIQUE)
- password (VARCHAR)
- role (ENUM: admin, nurse, doctor, etc.)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `patients`
```sql
- patient_id (BIGINT UNSIGNED, PK, AUTO_INCREMENT)
- first_name (VARCHAR 255)
- last_name (VARCHAR 255)
- middle_name (VARCHAR 255)
- age (INT)
- birthdate (DATE)
- sex (ENUM: Male, Female, Other)
- address (VARCHAR 255)
- birthplace (VARCHAR 255)
- religion (VARCHAR 100)
- ethnicity (VARCHAR 100)
- chief_complaints (TEXT)
- admission_date (DATE)
- room_no (VARCHAR 255)
- bed_no (VARCHAR 255)
- contact_name (VARCHAR 255)
- contact_relationship (VARCHAR 255)
- contact_number (VARCHAR 255)
- user_id (BIGINT UNSIGNED, FK → users.id)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- deleted_at (TIMESTAMP, soft delete)
```

#### `physical_exams`
```sql
- id (BIGINT UNSIGNED, PK, AUTO_INCREMENT)
- patient_id (BIGINT UNSIGNED, FK → patients.patient_id)
[Assessment Fields]
- general_appearance (VARCHAR 255)
- skin_condition (VARCHAR 255)
- eye_condition (VARCHAR 255)
- oral_condition (VARCHAR 255)
- cardiovascular (VARCHAR 255)
- abdomen_condition (VARCHAR 255)
- extremities (VARCHAR 255)
- neurological (VARCHAR 255)
[Assessment Alert Fields]
- general_appearance_alert (VARCHAR 255)
- skin_alert (VARCHAR 255)
- eye_alert (VARCHAR 255)
- oral_alert (VARCHAR 255)
- cardiovascular_alert (VARCHAR 255)
- abdomen_alert (VARCHAR 255)
- extremities_alert (VARCHAR 255)
- neurological_alert (VARCHAR 255)
[DPIE Fields]
- diagnosis (TEXT)
- diagnosis_alert (TEXT)
- planning (TEXT)
- planning_alert (TEXT)
- intervention (TEXT)
- intervention_alert (TEXT)
- evaluation (TEXT)
- evaluation_alert (TEXT)
[Metadata]
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `vital_signs`
```sql
- id (BIGINT UNSIGNED, PK, AUTO_INCREMENT)
- patient_id (BIGINT UNSIGNED, FK → patients.patient_id)
[Assessment Fields]
- date (DATE)
- time (TIME)
- day_no (INT)
- temperature (VARCHAR 255)
- hr (VARCHAR 255)
- rr (VARCHAR 255)
- bp (VARCHAR 255)
- spo2 (VARCHAR 255)
[Assessment Alert Fields]
- temperature_alert (VARCHAR 255)
- hr_alert (VARCHAR 255)
- rr_alert (VARCHAR 255)
- bp_alert (VARCHAR 255)
- spo2_alert (VARCHAR 255)
[DPIE Fields]
- diagnosis (TEXT)
- diagnosis_alert (TEXT)
- planning (TEXT)
- planning_alert (TEXT)
- intervention (TEXT)
- intervention_alert (TEXT)
- evaluation (TEXT)
- evaluation_alert (TEXT)
[Metadata]
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `nursing_diagnoses`
```sql
- id (BIGINT UNSIGNED, PK, AUTO_INCREMENT)
- patient_id (VARCHAR 255) [Note: Should be BIGINT UNSIGNED for consistency]
- physical_exam_id (BIGINT UNSIGNED, FK → physical_exams.id)
- vital_signs_id (BIGINT UNSIGNED, FK → vital_signs.id)
- intake_and_output_id (BIGINT UNSIGNED)
- adl_id (BIGINT UNSIGNED)
- lab_values_id (BIGINT UNSIGNED)
[DPIE Fields]
- diagnosis (TEXT)
- diagnosis_alert (TEXT)
- planning (TEXT)
- planning_alert (TEXT)
- intervention (TEXT)
- intervention_alert (TEXT)
- evaluation (TEXT)
- evaluation_alert (TEXT)
- rule_file_path (VARCHAR 255)
[Metadata]
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Key Constraints
- **Foreign Keys**: CASCADE DELETE on patient deletion
- **Unsigned BigInt**: Used for all ID columns for consistency with MySQL
- **Timestamps**: ISO 8601 format via TIMESTAMP columns

---

## Components Implemented

### 1. Physical Exam Component ✅ COMPLETED

**Purpose**: Assess patient's physical condition through systematic examination

**Workflow**: Assessment → Diagnosis → Planning → Intervention → Evaluation (ADPIE)

**Assessment Fields**:
- General Appearance (pale, lethargic, cyanotic, etc.)
- Skin Condition (jaundice, rash, edema, wounds, etc.)
- Eye Condition (blurry, red, unequal pupils, etc.)
- Oral Condition (dry mouth, lesions, bleeding gums, etc.)
- Cardiovascular (murmur, irregular rhythm, chest pain, tachycardia)
- Abdomen Condition (distended, tender, pain)
- Extremities (condition observations)
- Neurological (neurological findings)

**CDSS Rules**:
- File: `app/cdss_rules/physical_exam/assessment.yaml`
- Keyword-based rules with severity levels (critical, warning, info)
- Auto-generates clinical alerts for abnormal findings

**Auto-Generated Alerts Examples**:
- Pallor → "Abnormal Circulation: Patient appears pale..."
- Cyanosis → "CRITICAL: Cyanosis detected. Indicates inadequate oxygenation..."
- Jaundice → "Jaundice (yellowing of skin...) indicates high bilirubin levels..."

---

### 2. Vital Signs Component ✅ COMPLETED

**Purpose**: Monitor and assess patient's vital parameters

**Workflow**: Assessment → Diagnosis → Planning → Intervention → Evaluation (ADPIE)

**Assessment Fields**:
- Date (DATE)
- Time (TIME)
- Day Number (INT, admission day)
- Temperature (Celsius)
- Heart Rate (HR, bpm)
- Respiratory Rate (RR, bpm)
- Blood Pressure (BP, mmHg)
- Oxygen Saturation (SpO2, %)

**CDSS Rules**:
- File: `app/cdss_rules/vital_signs/assessment.yaml`
- Clinical thresholds for abnormality detection
- Severity-based alerts

**Auto-Generated Alerts Examples**:
- Temperature 38°C → "Fever detected (≥38°C). Assess for infection..."
- RR <12 → "CRITICAL: Severe Bradypnea - Possible CNS depression..."
- SpO2 <90% → "CRITICAL: Severe Hypoxemia - Apply oxygen immediately..."
- HR >100 → "Tachycardia detected - Assess for pain, anxiety, fever..."

---

### 3. Shared DPIE Rules ✅ COMPLETED

**Location**: `app/cdss_rules/dpie/`

These rules are used across ALL components for the Diagnosis, Planning, Intervention, and Evaluation steps:

#### `diagnosis.yaml`
- Common diagnosis keywords and recommendations
- Rules for identifying nursing diagnoses
- Examples: pain, infection, breathing pattern, fluid balance, etc.

#### `planning.yaml`
- Planning intervention strategies
- Nursing care planning guidelines
- Examples: monitoring parameters, assessment frequency, etc.

#### `intervention.yaml`
- Nursing intervention protocols
- Clinical procedures and treatments
- Examples: education, medications, IV fluids, oxygen, wound care, etc.

#### `evaluation.yaml`
- Evaluation criteria
- Outcome measurement guidance
- Examples: goal achievement, response to interventions, etc.

---

## CDSS Engine

### Overview

The **Clinical Decision Support System (CDSS) Engine** (`app/core/cdss_engine.py`) is a reusable, generic rule engine that:

- Loads clinical rules from YAML files
- Evaluates patient findings against rules
- Generates automated clinical alerts
- Supports both field-based (assessment) and text-based (DPIE) evaluation

### How It Works

```python
from app.core.cdss_engine import CDSSEngine

# Initialize engine with a rules file
engine = CDSSEngine("cdss_rules/physical_exam/assessment.yaml")

# Evaluate multiple fields (Assessment)
alerts = engine.evaluate({
    "general_appearance": "pale",
    "skin_condition": "jaundice",
    ...
})
# Returns: {"general_appearance_alert": "...", "skin_alert": "..."}

# Evaluate single text input (DPIE steps)
alert = engine.evaluate_single("patient has severe fever and infection")
# Returns: "— WARNING: Fever detected. Assess for infection..."
```

### CDSS Rules Structure (YAML)

#### Field-Based Rules (Assessment)
```yaml
fields:
  field_name:
    alert_field: field_name_alert  # Output field name
    rules:
      - keywords: ["keyword1", "keyword2"]
        severity: warning  # critical, warning, info
        alert: "Alert message..."
```

#### Text-Based Rules (DPIE)
```yaml
rules:
  - keywords: ["keyword1", "keyword2"]
    severity: warning  # critical, warning, info
    alert: "Alert message..."
```

### Severity Levels

| Level | Prefix | Usage |
|-------|--------|-------|
| **critical** | `— CRITICAL: ` | Life-threatening situations requiring immediate action |
| **warning** | `— WARNING: ` | Significant findings requiring attention |
| **info** | `— ` | Informational alerts and normal findings |

### Features

✅ **Case-Insensitive Matching** - Keywords are matched case-insensitively  
✅ **Partial Matching** - Keywords don't need to be exact matches (substring matching)  
✅ **Keyword Lists** - Multiple keywords can trigger the same rule  
✅ **Severity-Based Prefixing** - Alerts are prefixed based on severity  
✅ **Null Handling** - Empty/null fields return "No Findings"  
✅ **Composable Alerts** - Multiple rules can match and be combined  

---

## API Endpoints

### Physical Exam Routes

**Base URL**: `http://localhost:8000/physical-exam`

#### Assessment (Step 1)

**Create Physical Exam**
```
POST /physical-exam/
Content-Type: application/json

{
  "patient_id": 1,
  "general_appearance": "pale",
  "skin_condition": "jaundice",
  "eye_condition": null,
  "oral_condition": "dry mouth",
  "cardiovascular": "murmur",
  "abdomen_condition": "distended",
  "extremities": null,
  "neurological": null
}

Response: 201 Created
{
  "id": 1,
  "patient_id": 1,
  "general_appearance": "pale",
  "general_appearance_alert": "Abnormal Circulation (Pallor): Patient appears pale...",
  "skin_condition": "jaundice",
  "skin_alert": "Jaundice (yellowing of skin...) indicates high bilirubin levels...",
  ...
  "created_at": "2026-02-13T10:30:00",
  "updated_at": "2026-02-13T10:30:00"
}
```

**Update Assessment**
```
PUT /physical-exam/{exam_id}/assessment
Content-Type: application/json

{
  "general_appearance": "alert and oriented",
  "skin_condition": "no jaundice"
}

Response: 200 OK
[Updated record with regenerated alerts]
```

#### Diagnosis (Step 2)

```
PUT /physical-exam/{exam_id}/diagnosis
Content-Type: application/json

{
  "diagnosis": "Impaired skin integrity related to jaundice"
}

Response: 200 OK
{
  ...record...,
  "diagnosis": "Impaired skin integrity related to jaundice",
  "diagnosis_alert": "— WARNING: Jaundice detected. Monitor for pruritus and skin breakdown..."
}
```

#### Planning (Step 3)

```
PUT /physical-exam/{exam_id}/planning
Content-Type: application/json

{
  "planning": "Monitor skin condition daily, apply moisturizer, assess for breakdown"
}

Response: 200 OK
{
  ...record...,
  "planning": "Monitor skin condition daily, apply moisturizer...",
  "planning_alert": "— Document baseline, daily skin assessments, and interventions applied."
}
```

#### Intervention (Step 4)

```
PUT /physical-exam/{exam_id}/intervention
Content-Type: application/json

{
  "intervention": "Apply moisturizing lotion, reposition every 2 hours, educate patient on skin care"
}

Response: 200 OK
{
  ...record...,
  "intervention": "Apply moisturizing lotion, reposition every 2 hours, educate patient on skin care",
  "intervention_alert": "— Include 'teach-back' method to confirm understanding.\n— Reposition patient every 2 hours..."
}
```

#### Evaluation (Step 5)

```
PUT /physical-exam/{exam_id}/evaluation
Content-Type: application/json

{
  "evaluation": "Skin shows improvement, patient demonstrates understanding of care measures"
}

Response: 200 OK
{
  ...record...,
  "evaluation": "Skin shows improvement, patient demonstrates understanding...",
  "evaluation_alert": "— Document specific patient outcomes and response to interventions."
}
```

#### Read Endpoints

```
GET /physical-exam/patient/{patient_id}
Response: 200 OK
[List of all physical exam records for patient, ordered by creation date DESC]

GET /physical-exam/{exam_id}
Response: 200 OK
[Complete ADPIE record]

GET /physical-exam/{exam_id}/extract-adpie
Response: 200 OK
{
  "patient": {...},
  "physical_exam_id": 1,
  "adpie": {
    "assessment": {...},
    "diagnosis": {...},
    "planning": {...},
    "intervention": {...},
    "evaluation": {...}
  },
  "created_at": "...",
  "updated_at": "..."
}

DELETE /physical-exam/{exam_id}
Response: 200 OK
{"detail": "Physical exam deleted"}
```

---

### Vital Signs Routes

**Base URL**: `http://localhost:8000/vital-signs`

#### Assessment (Step 1)

**Create Vital Signs**
```
POST /vital-signs/
Content-Type: application/json

{
  "patient_id": 1,
  "date": "2026-02-13",
  "time": "06:00:00",
  "day_no": 1,
  "temperature": "38.5",
  "hr": "120",
  "rr": "22",
  "bp": "140/90",
  "spo2": "92"
}

Response: 201 Created
{
  "id": 1,
  "patient_id": 1,
  "date": "2026-02-13",
  "time": "06:00:00",
  "day_no": 1,
  "temperature": "38.5",
  "temperature_alert": "— WARNING: Fever detected (≥38°C). Assess for infection...",
  "hr": "120",
  "hr_alert": "— WARNING: Tachycardia detected (HR >100 bpm). Assess for pain, anxiety...",
  ...
  "created_at": "2026-02-13T10:30:00",
  "updated_at": "2026-02-13T10:30:00"
}
```

**Update Assessment**
```
PUT /vital-signs/{record_id}/assessment
[Same as Physical Exam]
```

#### Diagnosis through Evaluation

```
PUT /vital-signs/{record_id}/diagnosis
PUT /vital-signs/{record_id}/planning
PUT /vital-signs/{record_id}/intervention
PUT /vital-signs/{record_id}/evaluation
[Same structure as Physical Exam]
```

#### Read Endpoints

```
GET /vital-signs/patient/{patient_id}
GET /vital-signs/{record_id}
GET /vital-signs/{record_id}/extract-adpie
DELETE /vital-signs/{record_id}
```

---

### Authentication Routes

**Base URL**: `http://localhost:8000/auth`

```
POST /auth/register
POST /auth/login
POST /auth/logout
GET /auth/me
[See routers/auth.py for full implementation]
```

---

### Patient Routes

**Base URL**: `http://localhost:8000/patient`

```
POST /patient/                    # Create patient
GET /patient/{patient_id}         # Get patient
PUT /patient/{patient_id}         # Update patient
DELETE /patient/{patient_id}      # Delete patient
GET /patient/                     # List all patients
[See routers/patient.py for full implementation]
```

---

## Setup Instructions

### Prerequisites

- Python 3.8+
- MySQL 5.7+
- pip (Python package manager)

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd ehr-app-1/ehr_backend
```

2. **Create virtual environment**
```bash
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure database**
- Update `app/database/db.py` with your MySQL credentials
- Create database: `CREATE DATABASE ehr_db;`
- Update `ehr-db-2.sql` schema as needed

5. **Run migrations**
```bash
# SQLAlchemy will auto-create tables on first run
# Or manually import the SQL schema:
mysql -u root -p ehr_db < app/database/ehr-db-2.sql
```

6. **Start the server**
```bash
uvicorn app.main:app --reload
```

7. **Access API Documentation**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## Integration with Laravel Frontend

### Current State
- Laravel web app has its own backend
- Database schema matches Python backend (extracted from Laravel DB)
- Frontend UI and components remain unchanged

### Integration Strategy

#### Phase 1: API Transition (No UI Changes)
1. Keep Laravel frontend exactly as-is
2. Configure Laravel to call Python FastAPI endpoints instead of Laravel routes
3. Update HTTP client calls to point to new API URL
4. Verify all data flows correctly

#### Phase 2: Laravel Routes Mapping

**Laravel routes → Python API endpoints**

| Feature | Laravel Route | Python API |
|---------|---|---|
| Create Patient | `POST /patients` | `POST /patient/` |
| Get Patient | `GET /patients/{id}` | `GET /patient/{id}` |
| Update Patient | `PUT /patients/{id}` | `PUT /patient/{id}` |
| Delete Patient | `DELETE /patients/{id}` | `DELETE /patient/{id}` |
| Physical Exam | `POST /physical-exams` | `POST /physical-exam/` |
| Update Physical Exam | `PUT /physical-exams/{id}` | `PUT /physical-exam/{id}/assessment` |
| Vital Signs | `POST /vital-signs` | `POST /vital-signs/` |
| Update Vital Signs | `PUT /vital-signs/{id}` | `PUT /vital-signs/{id}/assessment` |

#### Phase 3: API Client Configuration (Laravel)

**Update `.env`**:
```env
BACKEND_API_URL=http://localhost:8000
```

**Update HTTP Client** (in Laravel service or controller):
```php
$response = Http::post(env('BACKEND_API_URL') . '/physical-exam/', [
    'patient_id' => $patientId,
    'general_appearance' => $request->general_appearance,
    ...
]);
```

#### Phase 4: Database Synchronization

Options:
1. **Keep separate databases** (recommended initially)
   - Laravel DB for legacy data
   - Python DB for new data
   - Migrate gradually with sync service

2. **Unified database** (recommended long-term)
   - Use single `ehr_db` MySQL database
   - Both Laravel and Python connect to same DB
   - Python models are source of truth

#### Phase 5: Phased Backend Removal

```
Timeline:
Week 1: API working, Laravel calls Python endpoints
Week 2: All critical features validated
Week 3: Legacy Laravel routes disabled gradually
Week 4: Full cutover to Python backend
Week 5+: Remove Laravel backend code (optional, for cleanup)
```

### API Response Format Consistency

**Python Response** (FastAPI):
```json
{
  "id": 1,
  "patient_id": 1,
  "general_appearance": "pale",
  "general_appearance_alert": "...",
  "created_at": "2026-02-13T10:30:00",
  "updated_at": "2026-02-13T10:30:00"
}
```

**Laravel should expect same format** - ensure API response transformers match

### Authentication Integration

- Maintain JWT tokens for API authentication
- Laravel can use same token system
- Update middleware to validate Python-issued JWTs
- Keep user sessions synchronized across both systems

---

## Components Development Roadmap

### ✅ Completed
- [x] Physical Exam Component (ADPIE workflow)
- [x] Vital Signs Component (ADPIE workflow)
- [x] CDSS Engine (Rule-based alert system)
- [x] Patient Model
- [x] User Model
- [x] Authentication Routes
- [x] Patient Routes

### 🔄 In Progress
- [ ] Nursing Diagnosis Component
- [ ] Integration & Testing

### 📋 Planned
- [ ] Intake & Output Component
- [ ] Activities of Daily Living (ADL) Component
- [ ] Lab Values Component
- [ ] Diagnostic Imaging Component
- [ ] Current Medication Component
- [ ] Allergies Component
- [ ] Discharge Planning Component
- [ ] Advanced CDSS Features (ML-based alerts)
- [ ] Audit Logging
- [ ] Data Export (PDF, Reports)
- [ ] Analytics Dashboard
- [ ] Performance Optimization

---

## Important Notes for Future Development

### Database Consistency
- ⚠️ All ID columns must be **UNSIGNED BIGINT** for foreign key constraints
- ⚠️ Signed and unsigned types cannot be mixed in foreign keys
- ⚠️ Always use `BIGINT(unsigned=True)` in SQLAlchemy models

### CDSS Rules Best Practices
- Place component-specific rules in `cdss_rules/[component]/`
- Place shared DPIE rules in `cdss_rules/dpie/`
- Use clear, descriptive keywords
- Include severity levels (critical > warning > info)
- Test rules with sample data before deployment

### API Naming Conventions
- Use snake_case for database columns
- Use snake_case for API parameter names
- Use descriptive endpoint names
- RESTful convention: POST (create), GET (read), PUT (update), DELETE (delete)

### Model Relationships
- Use `back_populates` for bidirectional relationships
- Use `cascade="all, delete-orphan"` for dependent records
- Lazy load relationships when needed
- Document relationships in model docstrings

---

## Troubleshooting

### Foreign Key Constraint Errors
**Error**: `Can't create table ... (errno: 150 "Foreign key constraint is incorrectly formed")`

**Solution**:
1. Ensure referenced table exists and has correct type
2. Verify column types match exactly (both UNSIGNED or both SIGNED)
3. Verify referenced column is PRIMARY KEY or UNIQUE
4. Use `BIGINT(unsigned=True)` for all ID columns

### Import Errors
**Error**: `ModuleNotFoundError: No module named 'app'`

**Solution**:
1. Ensure `__init__.py` exists in all directories
2. Run from project root directory
3. Verify virtual environment is activated

### Database Connection Errors
**Error**: `(pymysql.err.ProgrammingError) (1049, "Unknown database 'ehr_db')`

**Solution**:
1. Create database: `CREATE DATABASE ehr_db;`
2. Verify credentials in `app/database/db.py`
3. Check MySQL service is running

---

## Performance Considerations

- **Database Indexing**: Add indexes on frequently queried columns (patient_id, user_id)
- **Query Optimization**: Use eager loading for related data
- **Caching**: Consider Redis for CDSS rules and patient data
- **Pagination**: Implement for list endpoints
- **Async Operations**: Use async/await for I/O operations
- **Load Testing**: Test with multiple concurrent users before production

---

## Security Considerations

- ✅ Use JWT for API authentication
- ✅ Implement role-based access control (RBAC)
- ✅ Hash passwords with bcrypt or similar
- ✅ Validate all input data with Pydantic models
- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Use environment variables for sensitive data
- ✅ Implement audit logging for sensitive operations

---

## Testing Strategy

### Unit Tests
- Test CDSS Engine with sample data
- Test validation rules

### Integration Tests
- Test API endpoints
- Test database operations
- Test component workflows

### E2E Tests
- Test complete patient workflows
- Test ADPIE processes
- Test Laravel integration

---

## Migration Plan

### Before Cutover
1. ✅ Ensure all components are working
2. ✅ Complete comprehensive testing
3. ✅ Validate all API endpoints
4. ✅ Setup database synchronization
5. ✅ Train team on new system
6. ✅ Create rollback plan

### During Cutover
1. Backup production database
2. Run Laravel → Python data migration
3. Gradually redirect traffic to Python API
4. Monitor for errors and issues
5. Have rollback procedure ready

### After Cutover
1. Monitor system performance
2. Collect user feedback
3. Fix bugs and optimize
4. Plan future enhancements
5. Eventually remove Laravel backend code

---

## Contact & Support

For issues, questions, or contributions:
- Repository: [Link to repo]
- Documentation: [This file]
- Issue Tracker: [Link to issues]

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-13 | Initial setup with Physical Exam and Vital Signs components |

---

**Last Updated**: February 13, 2026  
**Project Status**: In Active Development  
**Next Review**: [Date]
