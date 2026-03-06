# Table: discharge_planning

## Columns

| Column | Type | Constraints |
| --- | --- | --- |
| id | bigint(20) | UNSIGNED NOT NULL |
| patient_id | bigint(20) | UNSIGNED NOT NULL |
| criteria_feverRes | varchar(255) | DEFAULT NULL |
| criteria_patientCount | varchar(255) | DEFAULT NULL |
| criteria_manageFever | varchar(255) | DEFAULT NULL |
| criteria_manageFever2 | varchar(255) | DEFAULT NULL |
| instruction_med | varchar(255) | DEFAULT NULL |
| instruction_appointment | varchar(255) | DEFAULT NULL |
| instruction_fluidIntake | varchar(255) | DEFAULT NULL |
| instruction_exposure | varchar(255) | DEFAULT NULL |
| instruction_complications | varchar(255) | DEFAULT NULL |
| created_at | timestamp | NULL DEFAULT NULL |
| updated_at | timestamp | NULL DEFAULT NULL |

## Sample Data

No sample data available.
