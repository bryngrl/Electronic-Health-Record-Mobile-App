# Table: diagnostics

## Columns

| Column        | Type         | Constraints       |
| ------------- | ------------ | ----------------- |
| id            | bigint(20)   | UNSIGNED NOT NULL |
| patient_id    | bigint(20)   | UNSIGNED NOT NULL |
| type          | varchar(255) | NOT NULL          |
| path          | varchar(255) | NOT NULL          |
| original_name | varchar(255) | DEFAULT NULL      |
| created_at    | timestamp    | NULL DEFAULT NULL |
| updated_at    | timestamp    | NULL DEFAULT NULL |

## Sample Data

| id  | patient_id | type | path                                                               | original_name                               | created_at          | updated_at          |
| --- | ---------- | ---- | ------------------------------------------------------------------ | ------------------------------------------- | ------------------- | ------------------- |
| 1   | 20         | xray | diagnostics/1769932552_Gemini_Generated_Image_vahmo8vahmo8vahm.png | Gemini_Generated_Image_vahmo8vahmo8vahm.png | 2026-02-01 07:55:53 | 2026-02-01 07:55:53 |
| 2   | 18         | xray | diagnostics/1769991563_Gemini_Generated_Image_vahmo8vahmo8vahm.png | Gemini_Generated_Image_vahmo8vahmo8vahm.png | 2026-02-02 00:19:24 | 2026-02-02 00:19:24 |
