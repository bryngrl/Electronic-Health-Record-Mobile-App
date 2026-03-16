# Table: developmental_history

## Columns

| Column         | Type       | Constraints       |
| -------------- | ---------- | ----------------- |
| development_id | bigint(20) | UNSIGNED NOT NULL |
| patient_id     | bigint(20) | UNSIGNED NOT NULL |
| gross_motor    | text       | DEFAULT NULL      |
| fine_motor     | text       | DEFAULT NULL      |
| language       | text       | DEFAULT NULL      |
| cognitive      | text       | DEFAULT NULL      |
| social         | text       | DEFAULT NULL      |
| created_at     | timestamp  | NULL DEFAULT NULL |
| updated_at     | timestamp  | NULL DEFAULT NULL |

## Sample Data

No sample data available.
