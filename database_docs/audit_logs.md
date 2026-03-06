# Table: audit_logs

## Columns

| Column | Type | Constraints |
| --- | --- | --- |
| id | bigint(20) | UNSIGNED NOT NULL |
| user_id | bigint(20) | UNSIGNED DEFAULT NULL |
| user_name | varchar(255) | DEFAULT NULL |
| user_role | varchar(255) | DEFAULT NULL |
| action | varchar(255) | NOT NULL |
| details | text | DEFAULT NULL |
| created_at | timestamp | NULL DEFAULT NULL |
| updated_at | timestamp | NULL DEFAULT NULL |

## Sample Data

| id | user_id | user_name | user_role | action | details | created_at | updated_at |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 3 | nurse | Nurse | Login Successful | \"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\ | 2025-12-03 10:48:30 | 2025-12-03 10:48:30 |
|  2 | 3 | nurse | Nurse | Physical Exam Created | \"{\\\"details\\\":\\\"User nurse created a new Physical Exam record.\\\",\\\"patient_id\\\":\\\"20\... | 2025-12-03 11:13:06 | 2025-12-03 11:13:06 |
|  3 | 3 | nurse | Nurse | Intake-and-Output Record Created | \"{\\\"details\\\":\\\"User nurse created a new IO record.\\\",\\\"patient_id\\\":\\\"7\\\"}\ | 2025-12-03 11:15:58 | 2025-12-03 11:15:58 |
|  4 | 3 | nurse | Nurse | Vital Signs Record Created | \"{\\\"details\\\":\\\"User nurse created a new Vital Signs record\\\",\\\"patient_id\\\":\\\"12\\\"... | 2025-12-03 11:18:47 | 2025-12-03 11:18:47 |
|  5 | 3 | nurse | Nurse | Vital Signs Record Updated | \"{\\\"details\\\":\\\"User nurse updated a Vital Signs record\\\",\\\"patient_id\\\":\\\"12\\\"}\ | 2025-12-03 12:00:01 | 2025-12-03 12:00:01 |
|  6 | 3 | nurse | Nurse | Vital Signs Record Created | \"{\\\"details\\\":\\\"User nurse created a new Vital Signs record\\\",\\\"patient_id\\\":\\\"16\\\"... | 2025-12-03 12:00:23 | 2025-12-03 12:00:23 |
|  7 | 3 | nurse | Nurse | Intake-and-Output Record Created | \"{\\\"details\\\":\\\"User nurse created a new IO record.\\\",\\\"patient_id\\\":\\\"12\\\"}\ | 2025-12-03 12:05:10 | 2025-12-03 12:05:10 |
|  8 | 3 | nurse | Nurse | Intake-and-Output Record Updated | \"{\\\"details\\\":\\\"User nurse updated an existing IO record.\\\",\\\"patient_id\\\":\\\"12\\\"}\ | 2025-12-03 12:07:06 | 2025-12-03 12:07:06 |
|  9 | 3 | nurse | Nurse | Vital Signs Record Created | \"{\\\"details\\\":\\\"User nurse created a new Vital Signs record\\\",\\\"patient_id\\\":\\\"18\\\"... | 2025-12-03 12:10:42 | 2025-12-03 12:10:42 |
|  10 | 3 | nurse | Nurse | ADL Record Created | \"{\\\"details\\\":\\\"User nurse created a new ADL record.\\\",\\\"patient_id\\\":\\\"12\\\"}\ | 2025-12-03 12:44:22 | 2025-12-03 12:44:22 |
|  11 | 3 | nurse | Nurse | ADL Record Created | \"{\\\"details\\\":\\\"User nurse created a new ADL record.\\\",\\\"patient_id\\\":\\\"7\\\"}\ | 2025-12-03 13:28:41 | 2025-12-03 13:28:41 |
|  12 | 3 | nurse | Nurse | Lab Values Created | \"{\\\"details\\\":\\\"User nurse created a new Lab Values record.\\\",\\\"patient_id\\\":\\\"12\\\"... | 2025-12-03 13:38:22 | 2025-12-03 13:38:22 |
|  13 | 3 | nurse | Nurse | Lab Values Created | \"{\\\"details\\\":\\\"User nurse created a new Lab Values record.\\\",\\\"patient_id\\\":\\\"7\\\"}... | 2025-12-03 14:33:32 | 2025-12-03 14:33:32 |
|  14 | 3 | nurse | Nurse | Lab Values Updated | \"{\\\"details\\\":\\\"User nurse updated an existing Lab Values record.\\\",\\\"patient_id\\\":\\\"... | 2025-12-03 14:50:13 | 2025-12-03 14:50:13 |
|  15 | 3 | nurse | Nurse | Lab Values Created | \"{\\\"details\\\":\\\"User nurse created a new Lab Values record.\\\",\\\"patient_id\\\":\\\"13\\\"... | 2025-12-03 15:05:26 | 2025-12-03 15:05:26 |
|  16 | 3 | nurse | Nurse | Intake-and-Output Record Created | \"{\\\"details\\\":\\\"User nurse created a new IO record.\\\",\\\"patient_id\\\":\\\"20\\\"}\ | 2025-12-03 17:01:38 | 2025-12-03 17:01:38 |
|  17 | 3 | nurse | Nurse | Login Successful | \"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\ | 2025-12-05 00:06:07 | 2025-12-05 00:06:07 |
|  18 | 3 | nurse | Nurse | Lab Values Created | \"{\\\"details\\\":\\\"User nurse created a new Lab Values record.\\\",\\\"patient_id\\\":\\\"10\\\"... | 2025-12-05 00:07:32 | 2025-12-05 00:07:32 |
|  19 | 3 | nurse | Nurse | Login Successful | \"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\ | 2026-01-22 00:16:23 | 2026-01-22 00:16:23 |
|  20 | 3 | nurse | Nurse | Vital Signs Record Created | \"{\\\"details\\\":\\\"User nurse created a new Vital Signs record\\\",\\\"patient_id\\\":\\\"20\\\"... | 2026-01-22 00:17:32 | 2026-01-22 00:17:32 |
|  21 | 3 | nurse | Nurse | Login Successful | \"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\ | 2026-01-27 23:25:01 | 2026-01-27 23:25:01 |
|  22 | 3 | nurse | Nurse | Patient Created | \"{\\\"details\\\":\\\"User nurse created a new patient record.\\\",\\\"patient_id\\\":21}\ | 2026-01-27 23:41:10 | 2026-01-27 23:41:10 |
|  23 | 3 | nurse | Nurse | Patient Updated | \"{\\\"details\\\":\\\"User nurse updated patient record.\\\",\\\"patient_id\\\":21}\ | 2026-01-27 23:45:02 | 2026-01-27 23:45:02 |
|  24 | 3 | nurse | Nurse | Patient Created | \"{\\\"details\\\":\\\"User nurse created a new patient record.\\\",\\\"patient_id\\\":22}\ | 2026-01-27 23:47:11 | 2026-01-27 23:47:11 |
|  25 | 3 | nurse | Nurse | Patient Updated | \"{\\\"details\\\":\\\"User nurse updated patient record.\\\",\\\"patient_id\\\":20}\ | 2026-01-27 23:56:39 | 2026-01-27 23:56:39 |
|  26 | 3 | nurse | Nurse | Patient Updated | \"{\\\"details\\\":\\\"User nurse updated patient record.\\\",\\\"patient_id\\\":20}\ | 2026-01-27 23:57:06 | 2026-01-27 23:57:06 |
|  27 | 3 | nurse | Nurse | Login Successful | \"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\ | 2026-01-28 03:06:26 | 2026-01-28 03:06:26 |
|  28 | 3 | nurse | Nurse | Logout | \"{\\\"details\\\":\\\"User logged out of the system.\\\"}\ | 2026-01-28 03:07:15 | 2026-01-28 03:07:15 |
|  29 | 2 | doctor | Doctor | Login Successful | \"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Doctor\\\"}\ | 2026-01-28 03:07:22 | 2026-01-28 03:07:22 |
|  30 | 2 | doctor | Doctor | Logout | \"{\\\"details\\\":\\\"User logged out of the system.\\\"}\ | 2026-01-28 03:08:04 | 2026-01-28 03:08:04 |
|  31 | 3 | nurse | Nurse | Login Successful | \"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\ | 2026-01-28 03:08:11 | 2026-01-28 03:08:11 |
|  32 | 3 | nurse | Nurse | Patient Updated | \"{\\\"details\\\":\\\"User nurse updated patient record.\\\",\\\"patient_id\\\":21}\ | 2026-01-28 03:14:04 | 2026-01-28 03:14:04 |
|  33 | 3 | nurse | Nurse | Patient Viewed | \"{\\\"details\\\":\\\"User nurse viewed patient record.\\\",\\\"patient_id\\\":21}\ | 2026-01-28 03:14:13 | 2026-01-28 03:14:13 |
|  34 | 3 | nurse | Nurse | Patient Viewed | \"{\\\"details\\\":\\\"User nurse viewed patient record.\\\",\\\"patient_id\\\":21}\ | 2026-01-28 03:14:45 | 2026-01-28 03:14:45 |
|  35 | 3 | nurse | Nurse | Patient Viewed | \"{\\\"details\\\":\\\"User nurse viewed patient record.\\\",\\\"patient_id\\\":21}\ | 2026-01-28 03:14:53 | 2026-01-28 03:14:53 |
|  36 | 3 | nurse | Nurse | Patient Viewed | \"{\\\"details\\\":\\\"User nurse viewed patient record.\\\",\\\"patient_id\\\":21}\ | 2026-01-28 03:15:04 | 2026-01-28 03:15:04 |
|  37 | 3 | nurse | Nurse | Patient Viewed | \"{\\\"details\\\":\\\"User nurse viewed patient record.\\\",\\\"patient_id\\\":21}\ | 2026-01-28 03:15:18 | 2026-01-28 03:15:18 |
|  38 | 3 | nurse | Nurse | Login Successful | \"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\ | 2026-01-28 14:59:30 | 2026-01-28 14:59:30 |
|  39 | 3 | nurse | Nurse | Login Successful | \"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\ | 2026-01-29 06:28:01 | 2026-01-29 06:28:01 |
|  40 | 3 | nurse | Nurse | Patient Updated | \"{\\\"details\\\":\\\"User nurse updated patient record.\\\",\\\"patient_id\\\":2}\ | 2026-01-29 07:11:22 | 2026-01-29 07:11:22 |
|  41 | 3 | nurse | Nurse | Login Successful | \"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\ | 2026-01-29 10:18:51 | 2026-01-29 10:18:51 |
|  42 | 3 | nurse | Nurse | Patient Updated | \"{\\\"details\\\":\\\"User nurse updated patient record.\\\",\\\"patient_id\\\":2}\ | 2026-01-29 10:19:11 | 2026-01-29 10:19:11 |
|  43 | 3 | nurse | Nurse | Patient Updated | \"{\\\"details\\\":\\\"User nurse updated patient record.\\\",\\\"patient_id\\\":16}\ | 2026-01-29 10:19:27 | 2026-01-29 10:19:27 |
|  44 | 3 | nurse | Nurse | Login Successful | \"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\ | 2026-01-29 13:49:21 | 2026-01-29 13:49:21 |
|  45 | 3 | nurse | Nurse | Physical Exam Updated | \"{\\\"details\\\":\\\"User nurse updated an existing Physical Exam record.\\\",\\\"patient_id\\\":\... | 2026-01-29 13:55:51 | 2026-01-29 13:55:51 |
|  46 | 3 | nurse | Nurse | Physical Exam Updated | \"{\\\"details\\\":\\\"User nurse updated an existing Physical Exam record.\\\",\\\"patient_id\\\":\... | 2026-01-29 14:05:29 | 2026-01-29 14:05:29 |
|  47 | 3 | nurse | Nurse | Login Successful | \"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\ | 2026-01-31 00:30:35 | 2026-01-31 00:30:35 |
|  48 | 3 | nurse | Nurse | Login Successful | \"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\ | 2026-02-01 07:55:27 | 2026-02-01 07:55:27 |
|  49 | 3 | nurse | Nurse | Logout | \"{\\\"details\\\":\\\"User logged out of the system.\\\"}\ | 2026-02-01 07:59:08 | 2026-02-01 07:59:08 |
|  50 | 2 | doctor | Doctor | Login Successful | \"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Doctor\\\"}\ | 2026-02-01 07:59:17 | 2026-02-01 07:59:17 |
|  51 | 2 | doctor | Doctor | Logout | \"{\\\"details\\\":\\\"User logged out of the system.\\\"}\ | 2026-02-01 08:00:27 | 2026-02-01 08:00:27 |
|  52 | 3 | nurse | Nurse | Login Successful | \"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\ | 2026-02-01 08:02:51 | 2026-02-01 08:02:51 |
|  53 | 3 | nurse | Nurse | Logout | \"{\\\"details\\\":\\\"User logged out of the system.\\\"}\ | 2026-02-01 08:03:06 | 2026-02-01 08:03:06 |
|  54 | 2 | doctor | Doctor | Login Successful | \"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Doctor\\\"}\ | 2026-02-01 08:03:17 | 2026-02-01 08:03:17 |
|  55 | 2 | doctor | Doctor | Logout | \"{\\\"details\\\":\\\"User logged out of the system.\\\"}\ | 2026-02-01 08:06:04 | 2026-02-01 08:06:04 |
|  56 | 3 | nurse | Nurse | Login Successful | \"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\ | 2026-02-01 08:06:11 | 2026-02-01 08:06:11 |
|  57 | 3 | nurse | Nurse | Physical Exam Created | \"{\\\"details\\\":\\\"User nurse created a new Physical Exam record.\\\",\\\"patient_id\\\":\\\"18\... | 2026-02-01 08:11:19 | 2026-02-01 08:11:19 |
|  58 | 3 | nurse | Nurse | Login Successful | \"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\ | 2026-02-02 00:16:28 | 2026-02-02 00:16:28 |
|  59 | 3 | nurse | Nurse | Logout | \"{\\\"details\\\":\\\"User logged out of the system.\\\"}\ | 2026-02-02 00:19:29 | 2026-02-02 00:19:29 |
|  60 | 2 | doctor | Doctor | Login Successful | \"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Doctor\\\"}\ | 2026-02-02 00:19:37 | 2026-02-02 00:19:37 |
|  61 | 2 | doctor | Doctor | Logout | \"{\\\"details\\\":\\\"User logged out of the system.\\\"}\ | 2026-02-02 00:19:57 | 2026-02-02 00:19:57 |
|  62 | 3 | nurse | Nurse | Login Successful | \"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\ | 2026-02-02 00:20:55 | 2026-02-02 00:20:55 |
|  63 | 3 | nurse | Nurse | Physical Exam Created | \"{\\\"details\\\":\\\"User nurse created a new Physical Exam record.\\\",\\\"patient_id\\\":\\\"13\... | 2026-02-02 00:23:47 | 2026-02-02 00:23:47 |
|  64 | 3 | nurse | Nurse | Logout | \"{\\\"details\\\":\\\"User logged out of the system.\\\"}\ | 2026-02-02 00:29:45 | 2026-02-02 00:29:45 |
|  65 | 1 | admin | Admin | Login Successful | \"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Admin\\\"}\ | 2026-02-02 00:29:52 | 2026-02-02 00:29:52 |
|  66 | 1 | admin | Admin | Logout | \"{\\\"details\\\":\\\"User logged out of the system.\\\"}\ | 2026-02-02 00:30:06 | 2026-02-02 00:30:06 |
|  67 | 3 | nurse | Nurse | Login Successful | \"{\\\"details\\\":\\\"User logged in to the system.\\\",\\\"user_role\\\":\\\"Nurse\\\"}\ | 2026-02-02 00:35:08 | 2026-02-02 00:35:08 |
