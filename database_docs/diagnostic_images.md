# Table: diagnostic_images

## Columns

| Column | Type | Constraints |
| --- | --- | --- |
| id | bigint(20) | UNSIGNED NOT NULL |
| patient_id | bigint(20) | UNSIGNED NOT NULL |
| image_type | enum( | 'xray','ultrasound','ct_scan_mri','echocardiogram') NOT NULL |
| created_at | timestamp | NULL DEFAULT NULL |
| updated_at | timestamp | NULL DEFAULT NULL |

## Sample Data

No sample data available.
