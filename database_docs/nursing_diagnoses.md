# Table: nursing_diagnoses

## Columns

| Column               | Type         | Constraints           |
| -------------------- | ------------ | --------------------- |
| id                   | bigint(20)   | UNSIGNED NOT NULL     |
| patient_id           | varchar(255) | DEFAULT NULL          |
| physical_exam_id     | bigint(20)   | UNSIGNED DEFAULT NULL |
| intake_and_output_id | bigint(20)   | UNSIGNED DEFAULT NULL |
| diagnosis            | text         | NOT NULL              |
| diagnosis_alert      | text         | DEFAULT NULL          |
| planning             | text         | DEFAULT NULL          |
| planning_alert       | text         | DEFAULT NULL          |
| intervention         | text         | DEFAULT NULL          |
| intervention_alert   | text         | DEFAULT NULL          |
| evaluation           | text         | DEFAULT NULL          |
| evaluation_alert     | text         | DEFAULT NULL          |
| rule_file_path       | varchar(255) | DEFAULT NULL          |
| created_at           | timestamp    | NULL DEFAULT NULL     |
| updated_at           | timestamp    | NULL DEFAULT NULL     |
| vital_signs_id       | bigint(20)   | UNSIGNED DEFAULT NULL |
| adl_id               | bigint(20)   | UNSIGNED DEFAULT NULL |
| lab_values_id        | bigint(20)   | UNSIGNED DEFAULT NULL |

## Sample Data

| id  | patient_id | physical_exam_id | intake_and_output_id | diagnosis | diagnosis_alert | planning | planning_alert | intervention | intervention_alert | evaluation | evaluation_alert | rule_file_path | created_at | updated_at | vital_signs_id | adl_id | lab_values_id |
| --- | ---------- | ---------------- | -------------------- | --------- | --------------- | -------- | -------------- | ------------ | ------------------ | ---------- | ---------------- | -------------- | ---------- | ---------- | -------------- | ------ | ------------- |
