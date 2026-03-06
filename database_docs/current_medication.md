# Table: current_medication

## Columns

| Column | Type | Constraints |
| --- | --- | --- |
| id | bigint(20) | UNSIGNED NOT NULL |
| patient_id | bigint(20) | UNSIGNED NOT NULL |
| date | date | DEFAULT NULL |
| current_med | varchar(255) | DEFAULT NULL |
| current_dose | varchar(255) | DEFAULT NULL |
| current_route | varchar(255) | DEFAULT NULL |
| current_frequency | varchar(255) | DEFAULT NULL |
| current_indication | varchar(255) | DEFAULT NULL |
| current_text | varchar(255) | DEFAULT NULL |
| created_at | timestamp | NULL DEFAULT NULL |
| updated_at | timestamp | NULL DEFAULT NULL |

## Sample Data

No sample data available.
