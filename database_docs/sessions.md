# Table: sessions

## Columns

| Column        | Type         | Constraints           |
| ------------- | ------------ | --------------------- |
| id            | varchar(255) | NOT NULL              |
| user_id       | bigint(20)   | UNSIGNED DEFAULT NULL |
| ip_address    | varchar(45)  | DEFAULT NULL          |
| user_agent    | text         | DEFAULT NULL          |
| payload       | text         | NOT NULL              |
| last_activity | int(11)      | NOT NULL              |

## Sample Data

| id  | user_id | ip_address | user_agent | payload | last_activity |
| --- | ------- | ---------- | ---------- | ------- | ------------- |
