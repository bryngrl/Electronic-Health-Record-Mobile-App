# Intake and Output - Combined Assessment Alerts

## Overview
The Intake and Output assessment now uses **COMBINED alerts** based on the relationship between all 3 inputs (oral intake, IV fluids, and urine output), rather than individual alerts for each field.

## Assessment Logic

### Combined Alert Examples

| Scenario | Alert Level | Message |
|----------|------------|---------|
| Urine output < 400mL | **CRITICAL** | ⚠️ OLIGURIA: Urine output X mL (< 400mL). Risk of acute kidney injury. Monitor vital signs and assess hydration status. |
| Low intake + Low output | **CRITICAL** | ⚠️ DEHYDRATION RISK: Total intake X mL is low and urine output Y mL is decreased. Increase fluid intake and monitor closely. |
| High intake + Lower output | **WARNING** | ⚠️ FLUID OVERLOAD RISK: High intake (X mL) vs lower output (Y mL). Monitor for edema, dyspnea, and weight gain. |
| Balanced intake/output | **INFO** | ✓ Hydration status adequate: Intake X mL, Output Y mL. Continue current regimen. |
| Output exceeds intake | **WARNING** | ⚠️ OUTPUT EXCEEDS INTAKE: Output X mL exceeds intake Y mL. Increase fluid replacement. |
| No data yet | **INFO** | Awaiting intake and output data. |

## Decision Tree

```
Input: oral_intake, iv_fluids, urine_output
Calculate: total_intake = oral_intake + iv_fluids

1. If urine_output < 400 mL
   → CRITICAL: OLIGURIA

2. Else if total_intake < 500 AND urine_output < 800
   → CRITICAL: DEHYDRATION RISK

3. Else if total_intake > 2000 AND urine_output < 1500
   → WARNING: FLUID OVERLOAD RISK

4. Else if 1000 ≤ total_intake ≤ 2000 AND 800 ≤ urine_output ≤ 1500
   → INFO: ADEQUATE HYDRATION

5. Else if total_intake < 1000 AND urine_output > 1000
   → WARNING: OUTPUT EXCEEDS INTAKE

6. Else if total_intake == 0 AND urine_output == 0
   → INFO: AWAITING DATA

7. Else
   → INFO: Continue monitoring
```

## Database Schema

```
intake_and_outputs table:
├── id (BIGINT unsigned, PK)
├── patient_id (BIGINT unsigned, FK)
├── oral_intake (INT, nullable) - mL
├── iv_fluids (INT, nullable) - mL
├── urine_output (INT, nullable) - mL
├── assessment_alert (TEXT, nullable) - COMBINED alert
├── diagnosis (TEXT, nullable)
├── diagnosis_alert (TEXT, nullable)
├── planning (TEXT, nullable)
├── planning_alert (TEXT, nullable)
├── intervention (TEXT, nullable)
├── intervention_alert (TEXT, nullable)
├── evaluation (TEXT, nullable)
├── evaluation_alert (TEXT, nullable)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## API Endpoints

### Create Intake and Output Assessment
```
POST /intake-output/
{
  "patient_id": 1,
  "oral_intake": 600,      # mL
  "iv_fluids": 500,        # mL
  "urine_output": 900      # mL
}

Response:
{
  "id": 1,
  "patient_id": 1,
  "oral_intake": 600,
  "iv_fluids": 500,
  "urine_output": 900,
  "assessment_alert": "[INFO] ✓ Hydration status adequate: Intake 1100mL, Output 900mL. Continue current regimen.",
  "diagnosis": null,
  "diagnosis_alert": null,
  ...
}
```

### Update Assessment
```
PUT /intake-output/{record_id}/assessment
{
  "oral_intake": 400,
  "iv_fluids": 600,
  "urine_output": 700
}

Response:
{
  ...updated record with regenerated assessment_alert...
}
```

### Add Diagnosis (Step 2)
```
PUT /intake-output/{record_id}/diagnosis
{
  "diagnosis": "Mild dehydration with adequate compensation"
}
```

### Extract Full ADPIE
```
GET /intake-output/{record_id}/extract-adpie

Response (formatted for printing):
{
  "patient_id": 1,
  "adpie": {
    "assessment": {
      "oral_intake": 600,
      "iv_fluids": 500,
      "urine_output": 900,
      "alert": "[INFO] ✓ Hydration status adequate: Intake 1100mL, Output 900mL. Continue current regimen."
    },
    "diagnosis": "Mild dehydration with adequate compensation",
    "planning": "Monitor intake/output every 4 hours...",
    "intervention": "Encourage oral fluids...",
    "evaluation": "Patient tolerating fluids well..."
  }
}
```

## Clinical Examples

### Example 1: Oliguria Alert
```
Input: oral_intake=500, iv_fluids=500, urine_output=250

Total Intake = 1000 mL
Urine Output = 250 mL (< 400)

Alert: [CRITICAL] ⚠️ OLIGURIA: Urine output 250mL (< 400mL). 
       Risk of acute kidney injury. Monitor vital signs and assess hydration status.
```

### Example 2: Dehydration Risk
```
Input: oral_intake=200, iv_fluids=200, urine_output=600

Total Intake = 400 mL (< 500)
Urine Output = 600 mL (< 800)

Alert: [CRITICAL] ⚠️ DEHYDRATION RISK: Total intake 400mL is low and 
       urine output 600mL is decreased. Increase fluid intake and monitor closely.
```

### Example 3: Fluid Overload Risk
```
Input: oral_intake=1200, iv_fluids=1000, urine_output=1000

Total Intake = 2200 mL (> 2000)
Urine Output = 1000 mL (< 1500)

Alert: [WARNING] ⚠️ FLUID OVERLOAD RISK: High intake (2200mL) vs lower output 
       (1000mL). Monitor for edema, dyspnea, and weight gain.
```

### Example 4: Adequate Hydration
```
Input: oral_intake=700, iv_fluids=400, urine_output=1000

Total Intake = 1100 mL (within 1000-2000 range)
Urine Output = 1000 mL (within 800-1500 range)

Alert: [INFO] ✓ Hydration status adequate: Intake 1100mL, Output 1000mL. 
       Continue current regimen.
```

## Key Changes from Previous Version

| Aspect | Before | After |
|--------|--------|-------|
| **Alert Structure** | 3 individual alerts (one per field) | 1 combined alert |
| **Alert Field** | `oral_intake_alert`, `iv_fluids_alert`, `urine_output_alert` | `assessment_alert` |
| **Alert Logic** | Individual keyword matching | Relational logic (intake vs output comparison) |
| **Clinical Accuracy** | Basic field-by-field | Holistic hydration assessment |
| **CDSS Engine Usage** | Used for field evaluation | Not needed for I&O (logic in router helper) |

## Implementation Notes

- The `_run_assessment_cdss()` helper function in the router now contains the combined alert logic
- The CDSS YAML file is kept for reference and future enhancements
- Every time assessment is created or updated, the combined alert is recalculated
- The alert includes severity level ([CRITICAL], [WARNING], [INFO]) for easy filtering
- Icons are used for visual clarity (⚠️ for warnings, ✓ for normal)

## Workflow

1. **Nurse enters assessment**: oral_intake (mL), iv_fluids (mL), urine_output (mL)
2. **Combined alert auto-generated**: System calculates total intake, compares with output, generates holistic alert
3. **Nurse reviews alert**: Understands patient's hydration status at a glance
4. **Nurse adds diagnosis**: Based on assessment and alert
5. **Nurse adds planning/intervention/evaluation**: Standard ADPIE workflow

This approach is much more intuitive for nurses - they can see the "big picture" of fluid balance immediately!
