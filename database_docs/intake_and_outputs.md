# Table: intake_and_outputs

## Columns

| Column           | Type         | Constraints       |
| ---------------- | ------------ | ----------------- |
| id               | bigint(20)   | UNSIGNED NOT NULL |
| patient_id       | bigint(20)   | UNSIGNED NOT NULL |
| day_no           | int(11)      | DEFAULT NULL      |
| oral_intake      | int(11)      | DEFAULT NULL      |
| iv_fluids_volume | int(11)      | DEFAULT NULL      |
| iv_fluids_type   | varchar(255) | DEFAULT NULL      |
| urine_output     | int(11)      | DEFAULT NULL      |
| alert            | varchar(255) | DEFAULT NULL      |
| created_at       | timestamp    | NULL DEFAULT NULL |
| updated_at       | timestamp    | NULL DEFAULT NULL |

## Sample Data

| id  | patient_id | day_no | oral_intake | iv_fluids_volume | iv_fluids_type | urine_output | alert                                                                                                   | created_at          | updated_at          |
| --- | ---------- | ------ | ----------- | ---------------- | -------------- | ------------ | ------------------------------------------------------------------------------------------------------- | ------------------- | ------------------- |
| 1   | 7          | 1      | 1000        | 500              | NULL           | 2500         | WARNING: Negative fluid balance > 500ml. Monitor hydration status.                                      | 2025-12-03 11:15:58 | 2025-12-03 11:15:58 |
| 2   | 12         | 1      | 2000        | 1500             | NULL           | 1000         | CRITICAL: Positive fluid balance > 1500ml. Risk of fluid overload. Assess for edema and respiratory ... | 2025-12-03 12:05:10 | 2025-12-03 12:07:06 |
| 3   | 20         | 1      | 500         | 1500             | NULL           | 200          | CRITICAL: Positive fluid balance > 1500ml. Risk of fluid overload. Assess for edema and respiratory ... | 2025-12-03 17:01:38 | 2025-12-03 17:01:38 |
