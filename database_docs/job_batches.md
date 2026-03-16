# Table: job_batches

## Columns

| Column         | Type         | Constraints  |
| -------------- | ------------ | ------------ |
| id             | varchar(255) | NOT NULL     |
| name           | varchar(255) | NOT NULL     |
| total_jobs     | int(11)      | NOT NULL     |
| pending_jobs   | int(11)      | NOT NULL     |
| failed_jobs    | int(11)      | NOT NULL     |
| failed_job_ids | longtext     | NOT NULL     |
| options        | mediumtext   | DEFAULT NULL |
| cancelled_at   | int(11)      | DEFAULT NULL |
| created_at     | int(11)      | NOT NULL     |
| finished_at    | int(11)      | DEFAULT NULL |

## Sample Data

No sample data available.
