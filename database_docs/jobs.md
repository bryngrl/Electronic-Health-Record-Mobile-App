# Table: jobs

## Columns

| Column | Type | Constraints |
| --- | --- | --- |
| id | bigint(20) | UNSIGNED NOT NULL |
| queue | varchar(255) | NOT NULL |
| payload | longtext | NOT NULL |
| attempts | tinyint(3) | UNSIGNED NOT NULL |
| reserved_at | int(10) | UNSIGNED DEFAULT NULL |
| available_at | int(10) | UNSIGNED NOT NULL |
| created_at | int(10) | UNSIGNED NOT NULL |

## Sample Data

No sample data available.
