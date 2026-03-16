# Table: changes_in_medication

## Columns

| Column           | Type         | Constraints       |
| ---------------- | ------------ | ----------------- |
| id               | bigint(20)   | UNSIGNED NOT NULL |
| patient_id       | bigint(20)   | UNSIGNED NOT NULL |
| change_med       | varchar(255) | DEFAULT NULL      |
| change_dose      | varchar(255) | DEFAULT NULL      |
| change_route     | varchar(255) | DEFAULT NULL      |
| change_frequency | varchar(255) | DEFAULT NULL      |
| change_text      | varchar(255) | DEFAULT NULL      |
| created_at       | timestamp    | NULL DEFAULT NULL |
| updated_at       | timestamp    | NULL DEFAULT NULL |

## Sample Data

No sample data available.
