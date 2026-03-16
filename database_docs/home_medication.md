# Table: home_medication

## Columns

| Column          | Type         | Constraints       |
| --------------- | ------------ | ----------------- |
| id              | bigint(20)   | UNSIGNED NOT NULL |
| patient_id      | bigint(20)   | UNSIGNED NOT NULL |
| home_med        | varchar(255) | DEFAULT NULL      |
| home_dose       | varchar(255) | DEFAULT NULL      |
| home_route      | varchar(255) | DEFAULT NULL      |
| home_frequency  | varchar(255) | DEFAULT NULL      |
| home_indication | varchar(255) | DEFAULT NULL      |
| home_text       | varchar(255) | DEFAULT NULL      |
| created_at      | timestamp    | NULL DEFAULT NULL |
| updated_at      | timestamp    | NULL DEFAULT NULL |

## Sample Data

No sample data available.
