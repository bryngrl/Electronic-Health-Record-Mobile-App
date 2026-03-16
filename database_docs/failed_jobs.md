# Table: failed_jobs

## Columns

| Column     | Type         | Constraints                          |
| ---------- | ------------ | ------------------------------------ |
| id         | bigint(20)   | UNSIGNED NOT NULL                    |
| uuid       | varchar(255) | NOT NULL                             |
| connection | text         | NOT NULL                             |
| queue      | text         | NOT NULL                             |
| payload    | longtext     | NOT NULL                             |
| exception  | longtext     | NOT NULL                             |
| failed_at  | timestamp    | NOT NULL DEFAULT current_timestamp() |

## Sample Data

No sample data available.
