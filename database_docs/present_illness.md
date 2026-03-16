# Table: present_illness

## Columns

| Column         | Type         | Constraints       |
| -------------- | ------------ | ----------------- |
| medical_id     | bigint(20)   | UNSIGNED NOT NULL |
| patient_id     | bigint(20)   | UNSIGNED NOT NULL |
| condition_name | varchar(255) | DEFAULT NULL      |
| description    | text         | DEFAULT NULL      |
| medication     | text         | DEFAULT NULL      |
| dosage         | text         | DEFAULT NULL      |
| side_effect    | text         | DEFAULT NULL      |
| comment        | text         | DEFAULT NULL      |
| created_at     | timestamp    | NULL DEFAULT NULL |
| updated_at     | timestamp    | NULL DEFAULT NULL |

## Sample Data

No sample data available.
