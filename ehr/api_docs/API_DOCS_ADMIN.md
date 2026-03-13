# 📋 Admin API Documentation

**Base URL:** `http://your-domain.com/api/admin`  
**Auth:** All routes require `Authorization: Bearer {token}` header + **admin role**.  
**Login first:** `POST /api/auth/login` → use returned `access_token`.

---

## 🔐 Authentication

### Login
`POST /api/auth/login`
```json
{ "email": "admin@example.com", "password": "password" }
```
**Response:**
```json
{ "access_token": "...", "role": "admin", "full_name": "admin_username", "user_id": 1 }
```

---

## 📊 Dashboard Stats

### Get Admin Stats
`GET /api/admin/stats`

**Response:**
```json
{
  "total_users": 15,
  "total_nurses": 10,
  "total_doctors": 4,
  "total_admins": 1,
  "total_patients": 120,
  "active_patients": 45,
  "audit_logs_today": 23
}
```

---

## 👤 User Management

### List All Users
`GET /api/admin/users`

| Query Param | Description |
|-------------|-------------|
| `role` | Filter by role: `nurse`, `doctor`, `admin` |
| `search` | Search by username or email |

**Response:**
```json
[
  {
    "id": 3,
    "username": "nurse_reyes",
    "email": "reyes@hospital.com",
    "role": "nurse",
    "created_at": "2025-01-10 08:00:00"
  }
]
```

### Get Single User
`GET /api/admin/users/{id}`

**Response:**
```json
{
  "id": 3,
  "username": "nurse_reyes",
  "email": "reyes@hospital.com",
  "role": "nurse",
  "created_at": "2025-01-10 08:00:00"
}
```

### Register New User
`POST /api/admin/users`

**Body:**
```json
{
  "username": "dr_santos",
  "email": "santos@hospital.com",
  "password": "securepassword",
  "role": "doctor"
}
```

| Field | Required | Rules |
|-------|----------|-------|
| `username` | ✅ | Unique |
| `email` | ✅ | Valid email, unique |
| `password` | ✅ | Min 8 characters |
| `role` | ✅ | `nurse` · `doctor` · `admin` |

**Response `201`:**
```json
{
  "message": "User registered successfully.",
  "user": {
    "id": 16,
    "username": "dr_santos",
    "email": "santos@hospital.com",
    "role": "doctor"
  }
}
```

**Error `422` (validation):**
```json
{
  "message": "The username has already been taken.",
  "errors": { "username": ["The username has already been taken."] }
}
```

### Update User Role
`PATCH /api/admin/users/{id}/role`

**Body:**
```json
{ "role": "doctor" }
```

**Response:**
```json
{
  "message": "Role updated successfully.",
  "user": { "id": 3, "username": "nurse_reyes", "role": "doctor" }
}
```

---

## 📝 Audit Logs

### Get Audit Logs
`GET /api/admin/audit-logs`

| Query Param | Default | Description |
|-------------|---------|-------------|
| `search` | `""` | Search by username or action |
| `sort` | `desc` | `asc` or `desc` (by date) |
| `page` | `1` | Page number |
| `per_page` | `20` | Results per page (max 100) |

**Response:**
```json
{
  "data": [
    {
      "id": 101,
      "user_id": 3,
      "user_name": "nurse_reyes",
      "user_role": "nurse",
      "action": "Patient Created (Mobile)",
      "details": {
        "details": "User nurse_reyes registered a patient via mobile.",
        "patient_id": 7
      },
      "created_at": "2025-03-10T09:00:00.000000Z"
    }
  ],
  "total": 500,
  "page": 1,
  "per_page": 20,
  "last_page": 25
}
```

---

## ⚠️ Error Responses

| Status | Meaning |
|--------|---------|
| `401` | Missing or invalid token — login first |
| `403` | Authenticated but not an admin |
| `404` | Resource not found |
| `422` | Validation error (see `errors` field) |
