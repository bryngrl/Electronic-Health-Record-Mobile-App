# Table: lab_values

## Columns

| Column | Type | Constraints |
| --- | --- | --- |
| id | bigint(20) | UNSIGNED NOT NULL |
| patient_id | bigint(20) | UNSIGNED NOT NULL |
| wbc_result | varchar(255) | DEFAULT NULL |
| wbc_normal_range | varchar(255) | DEFAULT NULL |
| rbc_result | varchar(255) | DEFAULT NULL |
| rbc_normal_range | varchar(255) | DEFAULT NULL |
| hgb_result | varchar(255) | DEFAULT NULL |
| hgb_normal_range | varchar(255) | DEFAULT NULL |
| hct_result | varchar(255) | DEFAULT NULL |
| hct_normal_range | varchar(255) | DEFAULT NULL |
| platelets_result | varchar(255) | DEFAULT NULL |
| platelets_normal_range | varchar(255) | DEFAULT NULL |
| mcv_result | varchar(255) | DEFAULT NULL |
| mcv_normal_range | varchar(255) | DEFAULT NULL |
| mch_result | varchar(255) | DEFAULT NULL |
| mch_normal_range | varchar(255) | DEFAULT NULL |
| mchc_result | varchar(255) | DEFAULT NULL |
| mchc_normal_range | varchar(255) | DEFAULT NULL |
| rdw_result | varchar(255) | DEFAULT NULL |
| rdw_normal_range | varchar(255) | DEFAULT NULL |
| neutrophils_result | varchar(255) | DEFAULT NULL |
| neutrophils_normal_range | varchar(255) | DEFAULT NULL |
| lymphocytes_result | varchar(255) | DEFAULT NULL |
| lymphocytes_normal_range | varchar(255) | DEFAULT NULL |
| monocytes_result | varchar(255) | DEFAULT NULL |
| monocytes_normal_range | varchar(255) | DEFAULT NULL |
| eosinophils_result | varchar(255) | DEFAULT NULL |
| eosinophils_normal_range | varchar(255) | DEFAULT NULL |
| basophils_result | varchar(255) | DEFAULT NULL |
| basophils_normal_range | varchar(255) | DEFAULT NULL |
| created_at | timestamp | NULL DEFAULT NULL |
| updated_at | timestamp | NULL DEFAULT NULL |
| wbc_alert | varchar(255) | DEFAULT NULL |
| rbc_alert | varchar(255) | DEFAULT NULL |
| hgb_alert | varchar(255) | DEFAULT NULL |
| hct_alert | varchar(255) | DEFAULT NULL |
| platelets_alert | varchar(255) | DEFAULT NULL |
| mcv_alert | varchar(255) | DEFAULT NULL |
| mch_alert | varchar(255) | DEFAULT NULL |
| mchc_alert | varchar(255) | DEFAULT NULL |
| rdw_alert | varchar(255) | DEFAULT NULL |
| neutrophils_alert | varchar(255) | DEFAULT NULL |
| lymphocytes_alert | varchar(255) | DEFAULT NULL |
| monocytes_alert | varchar(255) | DEFAULT NULL |
| eosinophils_alert | varchar(255) | DEFAULT NULL |
| basophils_alert | varchar(255) | DEFAULT NULL |

## Sample Data

| id | patient_id | wbc_result | wbc_normal_range | rbc_result | rbc_normal_range | hgb_result | hgb_normal_range | hct_result | hct_normal_range | platelets_result | platelets_normal_range | mcv_result | mcv_normal_range | mch_result | mch_normal_range | mchc_result | mchc_normal_range | rdw_result | rdw_normal_range | neutrophils_result | neutrophils_normal_range | lymphocytes_result | lymphocytes_normal_range | monocytes_result | monocytes_normal_range | eosinophils_result | eosinophils_normal_range | basophils_result | basophils_normal_range | created_at | updated_at | wbc_alert | rbc_alert | hgb_alert | hct_alert | platelets_alert | mcv_alert | mch_alert | mchc_alert | rdw_alert | neutrophils_alert | lymphocytes_alert | monocytes_alert | eosinophils_alert | basophils_alert |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 12 | 8 | 10 | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | 2025-12-03 13:38:22 | 2025-12-03 13:38:22 | No findings. | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL |
|  7 | 7 | 10 | 10 | 20 | 20 | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | 2025-12-03 14:33:32 | 2025-12-03 14:50:13 | Normal WBC. | Erythrocytosis. | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL |
|  8 | 13 | 10 | 10 | 20 | 20 | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | 2025-12-03 15:05:26 | 2025-12-03 15:05:26 | No findings. | No findings. | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL |
|  9 | 10 | 8 | 10 | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | 2025-12-05 00:07:32 | 2025-12-05 00:07:32 | No findings. | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL | NULL |
