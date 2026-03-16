# Table: physical_exams

## Columns

| Column                   | Type         | Constraints       |
| ------------------------ | ------------ | ----------------- |
| id                       | bigint(20)   | UNSIGNED NOT NULL |
| patient_id               | bigint(20)   | UNSIGNED NOT NULL |
| general_appearance       | varchar(255) | DEFAULT NULL      |
| skin_condition           | varchar(255) | DEFAULT NULL      |
| eye_condition            | varchar(255) | DEFAULT NULL      |
| oral_condition           | varchar(255) | DEFAULT NULL      |
| cardiovascular           | varchar(255) | DEFAULT NULL      |
| abdomen_condition        | varchar(255) | DEFAULT NULL      |
| extremities              | varchar(255) | DEFAULT NULL      |
| neurological             | varchar(255) | DEFAULT NULL      |
| general_appearance_alert | varchar(255) | DEFAULT NULL      |
| skin_alert               | varchar(255) | DEFAULT NULL      |
| eye_alert                | varchar(255) | DEFAULT NULL      |
| oral_alert               | varchar(255) | DEFAULT NULL      |
| cardiovascular_alert     | varchar(255) | DEFAULT NULL      |
| abdomen_alert            | varchar(255) | DEFAULT NULL      |
| extremities_alert        | varchar(255) | DEFAULT NULL      |
| neurological_alert       | varchar(255) | DEFAULT NULL      |
| created_at               | timestamp    | NULL DEFAULT NULL |
| updated_at               | timestamp    | NULL DEFAULT NULL |

## Sample Data

| id  | patient_id | general_appearance | skin_condition | eye_condition | oral_condition | cardiovascular | abdomen_condition | extremities | neurological | general_appearance_alert                                                                                | skin_alert                                                                                              | eye_alert                                                                                               | oral_alert  | cardiovascular_alert | abdomen_alert | extremities_alert | neurological_alert | created_at          | updated_at          |
| --- | ---------- | ------------------ | -------------- | ------------- | -------------- | -------------- | ----------------- | ----------- | ------------ | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------- | -------------------- | ------------- | ----------------- | ------------------ | ------------------- | ------------------- |
| 1   | 20         | pale               | jaundice       | blurry eyes   | NULL           | NULL           | NULL              | NULL        | NULL         | Abnormal Circulation (Pallor): Patient appears pale. Pallor can be an early sign of shock due to per... | Jaundice (yellowing of skin and sclera) indicates high bilirubin levels. Assess for liver disease or... | Strabismus (misalignment of the eyes) is common in young children but persistence after 4-6 months o... | No Findings | No Findings          | No Findings   | No Findings       | No Findings        | 2025-12-03 11:13:06 | 2025-12-03 11:13:06 |
| 2   | 18         | pale               | NULL           | NULL          | NULL           | NULL           | NULL              | NULL        | NULL         | Abnormal Circulation (Pallor): Patient appears pale. Pallor can be an early sign of shock due to per... | No Findings                                                                                             | No Findings                                                                                             | No Findings | No Findings          | No Findings   | No Findings       | No Findings        | 2026-02-01 08:11:19 | 2026-02-01 08:11:19 |
| 3   | 13         | pale               | NULL           | NULL          | NULL           | NULL           | NULL              | NULL        | NULL         | Abnormal Circulation (Pallor): Patient appears pale. Pallor can be an early sign of shock due to per... | No Findings                                                                                             | No Findings                                                                                             | No Findings | No Findings          | No Findings   | No Findings       | No Findings        | 2026-02-02 00:23:47 | 2026-02-02 00:23:47 |
