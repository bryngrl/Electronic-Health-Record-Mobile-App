# Table: act_of_daily_living

## Columns

| Column | Type | Constraints |
| --- | --- | --- |
| id | bigint(20) | UNSIGNED NOT NULL |
| patient_id | bigint(20) | UNSIGNED NOT NULL |
| mobility_alert | varchar(255) | DEFAULT NULL |
| hygiene_alert | varchar(255) | DEFAULT NULL |
| toileting_alert | varchar(255) | DEFAULT NULL |
| feeding_alert | varchar(255) | DEFAULT NULL |
| hydration_alert | varchar(255) | DEFAULT NULL |
| sleep_pattern_alert | varchar(255) | DEFAULT NULL |
| pain_level_alert | varchar(255) | DEFAULT NULL |
| day_no | int(11) | DEFAULT NULL |
| date | date | DEFAULT NULL |
| mobility_assessment | varchar(255) | DEFAULT NULL |
| hygiene_assessment | varchar(255) | DEFAULT NULL |
| toileting_assessment | varchar(255) | DEFAULT NULL |
| feeding_assessment | varchar(255) | DEFAULT NULL |
| hydration_assessment | varchar(255) | DEFAULT NULL |
| sleep_pattern_assessment | varchar(255) | DEFAULT NULL |
| pain_level_assessment | varchar(255) | DEFAULT NULL |
| created_at | timestamp | NULL DEFAULT NULL |
| updated_at | timestamp | NULL DEFAULT NULL |

## Sample Data

| id | patient_id | mobility_alert | hygiene_alert | toileting_alert | feeding_alert | hydration_alert | sleep_pattern_alert | pain_level_alert | day_no | date | mobility_assessment | hygiene_assessment | toileting_assessment | feeding_assessment | hydration_assessment | sleep_pattern_assessment | pain_level_assessment | created_at | updated_at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 12 | Orthostatic symptoms on standing. Assess vitals and assist with slow changes in position. | Exudate observed on dressing. Notify wound care and document amount/type. | Urinary incontinence increasing skin risk. Implement timed toileting and moisture management. | NULL | NULL | NULL | NULL | 15233 | 2025-12-03 | incision pain stabilize numbness | needs help skin breakdown | hangs on caregiver toilet | NULL | NULL | NULL | NULL | 2025-12-03 12:44:22 | 2025-12-03 12:44:22 |
|  2 | 7 | Orthostatic symptoms on standing. Assess vitals and assist with slow changes in position. | Exudate observed on dressing. Notify wound care and document amount/type. | NULL | NULL | NULL | NULL | NULL | 9994 | 2025-12-03 | incision pain stabilize numbness | needs help skin breakdown | NULL | NULL | NULL | NULL | NULL | 2025-12-03 13:28:41 | 2025-12-03 13:28:41 |
