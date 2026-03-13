# 📋 Admin API Documentation & Tutorial

**Base URL:** `http://your-domain.com/api/admin`  
**Auth:** All routes require `Authorization: Bearer {token}` header and **Admin** privileges.

---

## 🚀 Quick Start Tutorial (Complete Guide)

This tutorial walks you through the common workflow of a System Administrator using the API.

### 1. Authenticate

Before any action, you must log in to obtain a Bearer Token.

- **Endpoint:** `POST /api/auth/login`
- **Body:** `{ "username": "admin_user", "password": "secure_password" }`
- **Action:** Save the `access_token` from the response. Include it in the header of all subsequent requests: `Authorization: Bearer YOUR_TOKEN_HERE`.

### 2. Monitor System Health

Check the dashboard stats to see current user counts and system activity.

- **Endpoint:** `GET /api/admin/stats`
- **What to look for:** Ensure `total_users` matches your expectations and check `audit_logs_today` for recent activity.

### 3. Register a New Staff Member

When a new nurse or doctor joins, register their account with complete personal details.

- **Endpoint:** `POST /api/admin/users`
- **Body:**
  ```json
  {
    "username": "nurse_jane",
    "email": "jane@hospital.com",
    "password": "password123",
    "role": "nurse",
    "full_name": "Jane Doe",
    "birthdate": "1992-08-24",
    "age": 33,
    "sex": "Female",
    "address": "789 Medical Plaza, West City",
    "birthplace": "Central Hospital"
  }
  ```

### 4. Search and Update User Profiles

If a staff member changes their address or you need to update their role.

- **Endpoint:** `GET /api/admin/users?search=Jane` (Find the user ID)
- **Endpoint:** `PUT /api/admin/users/{id}`
- **Body:** `{ "address": "New Address 101", "role": "doctor" }`

### 5. Review the Audit Trail

Verify that the registration and updates were recorded correctly in the system logs.

- **Endpoint:** `GET /api/admin/audit-logs`
- **Verification:** Look for actions like `USER REGISTRATION` or `USER UPDATED`. The `sentence` field will provide a human-readable explanation of what occurred.

---

## 🔐 Authentication

### Admin Login

`POST /api/auth/login`

```json
{ "username": "admin_id", "password": "password" }
```

**Response:**

```json
{
  "access_token": "1|AbCdEf...",
  "role": "admin",
  "full_name": "Administrator",
  "user_id": 1
}
```

---

## 📊 Dashboard Statistics

### Get System Overview

`GET /api/admin/stats`

**Response:**

```json
{
  "total_users": 25,
  "total_nurses": 15,
  "total_doctors": 8,
  "total_admins": 2,
  "total_patients": 142,
  "active_patients": 56,
  "audit_logs_today": 12
}
```

---

## 👤 User Management

### List All Users

`GET /api/admin/users`

| Query Param | Description                             |
| ----------- | --------------------------------------- |
| `role`      | Filter by: `nurse`, `doctor`, `admin`   |
| `search`    | Search by username, email, or full name |

**Response:**

```json
[
  {
    "id": 5,
    "username": "nurse_jane",
    "email": "jane@hospital.com",
    "role": "nurse",
    "full_name": "Jane Doe",
    "created_at": "2026-03-13 10:00:00"
  }
]
```

### Get Single User Details

`GET /api/admin/users/{id}`

**Response:**

```json
{
  "id": 5,
  "username": "nurse_jane",
  "email": "jane@hospital.com",
  "role": "nurse",
  "full_name": "Jane Doe",
  "birthdate": "1992-08-24",
  "age": 33,
  "sex": "Female",
  "address": "789 Medical Plaza",
  "birthplace": "Central Hospital",
  "created_at": "2026-03-13 10:00:00"
}
```

### Register New User

`POST /api/admin/users`

| Field        | Required | Description                           |
| ------------ | -------- | ------------------------------------- |
| `username`   | ✅       | Unique identifier for login           |
| `email`      | ✅       | Unique valid email address            |
| `password`   | ✅       | Minimum 8 characters                  |
| `role`       | ✅       | Must be `nurse`, `doctor`, or `admin` |
| `full_name`  | ❌       | User's legal name                     |
| `birthdate`  | ❌       | Format: `YYYY-MM-DD`                  |
| `age`        | ❌       | Integer value                         |
| `sex`        | ❌       | e.g., `Male`, `Female`                |
| `address`    | ❌       | Residential/Contact address           |
| `birthplace` | ❌       | Place of birth                        |

### Update User Details

`PUT /api/admin/users/{id}`
_(All fields are optional; provide only the fields you wish to change)_

### Update User Role (Quick Patch)

`PATCH /api/admin/users/{id}/role`

```json
{ "role": "admin" }
```

---

## 📝 Audit Logs

### View Audit Trail

`GET /api/admin/audit-logs`

| Query Param | Default | Description                        |
| ----------- | ------- | ---------------------------------- |
| `search`    | `""`    | Search by user, action, or details |
| `sort`      | `desc`  | `asc` (oldest) or `desc` (newest)  |
| `per_page`  | `20`    | Results per page (max 100)         |

**Response:**

```json
{
  "data": [
    {
      "id": 501,
      "user_name": "admin_id",
      "user_role": "ADMIN",
      "action": "USER REGISTRATION",
      "sentence": "Administrator admin_id successfully registered a new user: nurse_jane with role NURSE.",
      "date": "2026-03-13",
      "time": "10:05:22",
      "created_at": "2026-03-13 10:05:22"
    },
    {
      "id": 502,
      "user_name": "nurse_jane",
      "user_role": "NURSE",
      "action": "ADL RECORD CREATED",
      "sentence": "Nurse nurse_jane created a new Activities of Daily Living (ADL) record for patient ID: 12.",
      "date": "2026-03-13",
      "time": "10:15:00",
      "created_at": "2026-03-13 10:15:00"
    }
  ],
  "total": 1250,
  "page": 1,
  "per_page": 20,
  "last_page": 63
}
```

---

## ⚠️ Error Reference

| Status | Code                 | Meaning                                           |
| ------ | -------------------- | ------------------------------------------------- |
| `401`  | Unauthorized         | Missing or expired token. Log in again.           |
| `403`  | Forbidden            | Authenticated, but your role is not Admin.        |
| `404`  | Not Found            | The requested user or resource does not exist.    |
| `422`  | Unprocessable Entity | Validation failed (e.g., username already taken). |
| `500`  | Server Error         | Internal system failure. Contact support.         |
