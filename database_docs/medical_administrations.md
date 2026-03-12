# Table: medical_administrations

## Columns

| Column | Type | Constraints |
| --- | --- | --- |
| id | bigint(20) | UNSIGNED NOT NULL |
| patient_id | bigint(20) | UNSIGNED NOT NULL |
| medication | varchar(255) | DEFAULT NULL |
| dose | varchar(255) | DEFAULT NULL |
| route | varchar(255) | DEFAULT NULL |
| frequency | varchar(255) | DEFAULT NULL |
| comments | varchar(255) | DEFAULT NULL |
| time | time | NOT NULL |
| date | date | NOT NULL |
| created_at | timestamp | NULL DEFAULT NULL |
| updated_at | timestamp | NULL DEFAULT NULL |

## Sample Data

No sample data available.
