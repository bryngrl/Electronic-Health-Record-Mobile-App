# Table: users

## Columns

| Column | Type | Constraints |
| --- | --- | --- |
| id | bigint(20) | UNSIGNED NOT NULL |
| username | varchar(255) | NOT NULL |
| email | varchar(255) | NOT NULL |
| password | varchar(255) | NOT NULL |
| role | enum( | 'Admin','Doctor','Nurse') NOT NULL DEFAULT 'Nurse' |
| created_at | timestamp | NULL DEFAULT NULL |
| updated_at | timestamp | NULL DEFAULT NULL |

## Sample Data

| id | username | email | password | role | created_at | updated_at |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | admin | admin@example.com | $2y$12$ywBr2v8rmmsdcgi2rvQLq.yXiSu.s3HaoRHOaug0c2OFd3BAjKxbC | Admin | 2025-12-02 16:44:54 | 2025-12-02 16:44:54 |
|  2 | doctor | doctor@example.com | $2y$12$x7zMcDv700y9F7zF5zJnzeuPQnZEj/0DjD7hzUsmvHo8ooVV.FVVa | Doctor | 2025-12-02 16:44:55 | 2025-12-02 16:44:55 |
|  3 | nurse | nurse@example.com | $2y$12$4Jc2Gq/qj2wMMEFVHO9vyeftr/1RRei9viE4lGCBq/jfz0fn1BWem | Nurse | 2025-12-02 16:44:55 | 2025-12-02 16:44:55 |
