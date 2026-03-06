# Table: migrations

## Columns

| Column | Type | Constraints |
| --- | --- | --- |
| id | int(10) | UNSIGNED NOT NULL |
| migration | varchar(255) | NOT NULL |
| batch | int(11) | NOT NULL |

## Sample Data

| id | migration | batch |
| --- | --- | --- |
| 1 | 0001_01_01_000000_create_users_table | 1 |
|  2 | 0001_01_01_000001_create_cache_table | 1 |
|  3 | 0001_01_01_000002_create_jobs_table | 1 |
|  4 | 2025_09_10_164127_create_patients_table | 1 |
|  5 | 2025_09_13_111543_create_sessions_table | 1 |
|  6 | 2025_09_15_045355_medical_history_table | 1 |
|  7 | 2025_09_15_144700_rename_name_to_username_in_users_table | 1 |
|  8 | 2025_09_16_100427_create_physical_exams_table | 1 |
|  9 | 2025_09_20_062524_ivs_and_lines | 1 |
|  10 | 2025_09_20_125103_medication_reconciliation | 1 |
|  11 | 2025_09_21_005901_create_act_of_daily_living_table | 1 |
|  12 | 2025_09_21_161059_vital_signs | 1 |
|  13 | 2025_09_21_211721_discharge_planning | 1 |
|  14 | 2025_09_22_000000_create_intake_and_outputs_table | 1 |
|  15 | 2025_09_22_000000_create_intake_and_outputs_table copy | 1 |
|  16 | 2025_09_22_000137_create_lab_values_table | 1 |
|  17 | 2025_09_22_232719_create_audit_logs_table | 1 |
|  18 | 2025_09_23_052739_create_nursing_diagnoses_table | 1 |
|  19 | 2025_10_23_002639_diagnostic_image | 1 |
|  20 | 2025_10_28_220155_diagnostics | 1 |
|  21 | 2025_11_03_023246_add_soft_deletes_to_patients_table | 1 |
|  22 | 2025_11_06_000000_create_medical_administrations_table | 1 |
|  23 | 2025_11_07_212931_rename_io_cdssalerts | 1 |
|  24 | 2025_11_07_214342_add_alerts_to_act_of_daily_living_table | 1 |
|  28 | 2025_11_08_174006_add_alerts_to_nursing_diagnoses_table | 1 |
|  32 | 2025_11_09_085039_add_rule_file_path_to_nursing_diagnoses_table | 1 |
|  33 | 2025_11_09_114956_add_patient_id_in_nursing_diag | 1 |
|  34 | 2025_11_09_121404_make_adpie_fields_nullable_in_nursing_diagnoses_table | 1 |
|  35 | 2025_11_09_121824_add_intake_and_output_id_to_nursing_diagnoses_table | 1 |
|  36 | 2025_11_09_181153_add_vitals_id_to_nursing_diagnoses_table | 1 |
|  37 | 2025_12_03_190821_add_adl_and_lab_values_to_nursing_diagnoses_table | 2 |
|  38 | 2025_11_07_214845_add_alerts_to_act_of_daily_living_table | 3 |
|  39 | 2025_11_07_215315_add_alert_columns_and_remove_alerts_column_from_lab_values_table | 3 |
|  40 | 2025_11_08_005709_remove_date_from_intake_and_outputs_table | 3 |
|  41 | 2025_11_08_190724_add_date_to_medical_reconciliations_table | 3 |
|  42 | 2025_11_08_214745_change_alerts_to_text_in_vital_signs_table | 3 |
|  43 | 2025_11_09_015410_add_contact_and_room_details_to_patients_table | 3 |
|  44 | 2025_12_04_000000_add_alerts_to_act_of_daily_living_table_fix | 3 |
