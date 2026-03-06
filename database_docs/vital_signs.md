# Table: vital_signs

## Columns

| Column | Type | Constraints |
| --- | --- | --- |
| id | bigint(20) | UNSIGNED NOT NULL |
| patient_id | bigint(20) | UNSIGNED NOT NULL |
| date | date | NOT NULL |
| time | time | NOT NULL |
| day_no | int(11) | DEFAULT NULL |
| temperature | varchar(255) | DEFAULT NULL |
| hr | varchar(255) | DEFAULT NULL |
| rr | varchar(255) | DEFAULT NULL |
| bp | varchar(255) | DEFAULT NULL |
| spo2 | varchar(255) | DEFAULT NULL |
| temperature_alert | varchar(255) | DEFAULT NULL |
| hr_alert | varchar(255) | DEFAULT NULL |
| rr_alert | varchar(255) | DEFAULT NULL |
| bp_alert | varchar(255) | DEFAULT NULL |
| spo2_alert | varchar(255) | DEFAULT NULL |
| diagnosis | text | DEFAULT NULL |
| diagnosis_alert | text | DEFAULT NULL |
| planning | text | DEFAULT NULL |
| planning_alert | text | DEFAULT NULL |
| intervention | text | DEFAULT NULL |
| intervention_alert | text | DEFAULT NULL |
| evaluation | text | DEFAULT NULL |
| evaluation_alert | text | DEFAULT NULL |
| created_at | timestamp | NULL DEFAULT NULL |
| updated_at | timestamp | NULL DEFAULT NULL |

## Sample Data

| id | patient_id | date | time | day_no | temperature | hr | rr | bp | spo2 | alerts | created_at | updated_at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 12 | 2025-12-03 | 06:00:00 | 15233 | 37 | 120 | 30 | 120/80 | 20 |  | 2025-12-03 11:18:47 | 2025-12-03 12:00:01 |
|  2 | 16 | 2025-12-03 | 06:00:00 | 15233 | 37 | 120 | 30 | 120/80 | 20 |  | 2025-12-03 12:00:23 | 2025-12-03 12:00:23 |
|  3 | 18 | 2025-12-03 | 06:00:00 | 13096 | 37 | 120 | 30 | 120/80 | 30 | Normal Findings | 2025-12-03 12:10:42 | 2025-12-03 12:12:22 |
