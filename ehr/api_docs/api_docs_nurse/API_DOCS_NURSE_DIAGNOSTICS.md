# 🩻 Diagnostics — Nurse API Documentation

**Base URL:** `http://<your-server-ip>:<port>/api`
**Auth:** All routes require `Authorization: Bearer {token}` header.
**Database Table:** `diagnostics`
**Model:** `App\Models\Diagnostic`
**Storage Disk:** `public` → files saved to `storage/app/public/diagnostics/`
**Public URL pattern:** `http://<your-server-ip>:<port>/storage/diagnostics/<filename>`

---

## 📋 Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/diagnostics/patient/{patient_id}` | Get all diagnostic images for a patient |
| POST | `/api/diagnostics` | Upload one or more diagnostic images |
| DELETE | `/api/diagnostics/{id}` | Delete a single diagnostic image |

---

## 📱 Localhost / LAN Setup (Mobile App)

Since you are running on **localhost**, your mobile device must be on the **same Wi-Fi network** as the server.

### Step 1 — Start the server on all interfaces
```bash
php artisan serve --host=0.0.0.0 --port=8000
```
> Do **not** use `php artisan serve` alone — it only listens on `127.0.0.1` and your phone cannot reach it.

### Step 2 — Find your machine's local IP
```bash
# Windows
ipconfig
# Look for: IPv4 Address . . . . . . . . 192.168.x.x
```

### Step 3 — Use that IP in your mobile app
```
Base URL: http://192.168.x.x:8000/api
Image URLs: http://192.168.x.x:8000/storage/diagnostics/<filename>
```

> ✅ The storage symlink (`public/storage → storage/app/public`) is already set up on this project.

---

## 📥 GET All Diagnostics — `/api/diagnostics/patient/{patient_id}`

Returns all diagnostic records for a patient, newest first. Each record includes a ready-to-use `image_url`.

```http
GET /api/diagnostics/patient/16
Authorization: Bearer {token}
```

**Response `200`:**
```json
[
  {
    "id": 12,
    "patient_id": 16,
    "type": "xray",
    "path": "diagnostics/1741234567_abc123_chest.jpg",
    "original_name": "chest.jpg",
    "created_at": "2026-03-11T14:00:00.000000Z",
    "updated_at": "2026-03-11T14:00:00.000000Z",
    "image_url": "http://192.168.1.5:8000/storage/diagnostics/1741234567_abc123_chest.jpg"
  }
]
```

> Use `image_url` directly in an `<Image>` component — no extra path building needed.

---

## 📤 POST Upload Images — `/api/diagnostics`

Upload one or more images for a patient in a single request.

**⚠️ Content-Type must be `multipart/form-data` — NOT JSON.**
Images cannot be sent as JSON/base64 with this endpoint.

```http
POST /api/diagnostics
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `patient_id` | integer | ✅ Yes | Must exist in `patients` table |
| `type` | string | ✅ Yes | One of: `xray`, `ultrasound`, `ct_scan`, `echocardiogram` |
| `images[]` | file(s) | ✅ Yes | One or more image files. Each max **8 MB**. Accepted: `jpg`, `jpeg`, `png`, `gif`, `bmp`, `svg`, `webp` |

### Example — React Native (using `FormData`)

```javascript
const uploadDiagnostics = async (patientId, type, imageUris) => {
  const formData = new FormData();
  formData.append('patient_id', patientId);
  formData.append('type', type); // 'xray' | 'ultrasound' | 'ct_scan' | 'echocardiogram'

  imageUris.forEach((uri, index) => {
    const filename = uri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const mimeType = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('images[]', {
      uri: uri,
      name: filename,
      type: mimeType,
    });
  });

  const response = await fetch('http://192.168.1.5:8000/api/diagnostics', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Do NOT set Content-Type manually — let fetch set it with the boundary
    },
    body: formData,
  });

  return await response.json();
};
```

### Example — Flutter (`http` / `dio`)

```dart
Future<void> uploadDiagnostics(int patientId, String type, List<String> filePaths) async {
  final request = http.MultipartRequest(
    'POST',
    Uri.parse('http://192.168.1.5:8000/api/diagnostics'),
  );

  request.headers['Authorization'] = 'Bearer $token';
  request.fields['patient_id'] = patientId.toString();
  request.fields['type'] = type; // 'xray', 'ultrasound', etc.

  for (final path in filePaths) {
    request.files.add(await http.MultipartFile.fromPath('images[]', path));
  }

  final response = await request.send();
  final body = await response.stream.bytesToString();
  print(body);
}
```

### Response `201 Created`

```json
{
  "message": "2 images uploaded and synced to website.",
  "data": [
    {
      "id": 13,
      "patient_id": 16,
      "type": "xray",
      "path": "diagnostics/1741234567_abc123_chest.jpg",
      "original_name": "chest.jpg",
      "created_at": "2026-03-11T14:00:00.000000Z",
      "updated_at": "2026-03-11T14:00:00.000000Z",
      "image_url": "http://192.168.1.5:8000/storage/diagnostics/1741234567_abc123_chest.jpg"
    },
    {
      "id": 14,
      "patient_id": 16,
      "type": "xray",
      "path": "diagnostics/1741234568_def456_lateral.jpg",
      "original_name": "lateral.jpg",
      "created_at": "2026-03-11T14:00:01.000000Z",
      "updated_at": "2026-03-11T14:00:01.000000Z",
      "image_url": "http://192.168.1.5:8000/storage/diagnostics/1741234568_def456_lateral.jpg"
    }
  ]
}
```

### Valid `type` Values

| Value | Meaning |
|-------|---------|
| `xray` | X-Ray |
| `ultrasound` | Ultrasound |
| `ct_scan` | CT Scan |
| `echocardiogram` | Echocardiogram |

---

## 🗑️ DELETE Single Image — `/api/diagnostics/{id}`

Deletes the database record **and** the physical file from storage.

```http
DELETE /api/diagnostics/13
Authorization: Bearer {token}
```

**Response `200`:**
```json
{
  "message": "Image deleted from database and server."
}
```

**Response `404`** if the ID does not exist.

---

## 🗄️ Database Column Reference (`diagnostics` table)

| Column | Type | Description |
|--------|------|-------------|
| `id` | integer | Auto-increment primary key |
| `patient_id` | integer | Foreign key → `patients.patient_id` |
| `type` | string | Diagnostic type (`xray`, `ultrasound`, `ct_scan`, `echocardiogram`) |
| `path` | string | Relative storage path (e.g. `diagnostics/filename.jpg`) |
| `original_name` | string | Original filename from the device |
| `created_at` | timestamp | Auto-managed by Laravel |
| `updated_at` | timestamp | Auto-managed by Laravel |

> `image_url` is **not** stored in the database — it is computed at query time using `url(Storage::url($record->path))`.

---

## 🔍 API Issues Found & Fixed

| Issue | Status | Notes |
|-------|--------|-------|
| `DELETE /api/diagnostics/{id}` route was missing | ✅ Fixed | `destroy()` method existed in controller but had no route |
| Filename collision on batch upload | ✅ Fixed | Added `uniqid()` to filename: `time_uniqid_originalname.jpg` |
| Storage symlink | ✅ Already set up | `public/storage` → `storage/app/public` |

---

## ⚠️ Common Mistakes

| Mistake | Fix |
|---------|-----|
| Sending `Content-Type: application/json` | Remove it — use `multipart/form-data` |
| Sending a single file as `images` (not `images[]`) | Use `images[]` as the field name for each file |
| Using `127.0.0.1` or `localhost` in mobile app | Use the machine's LAN IP (e.g. `192.168.1.5`) |
| Server not reachable from phone | Run `php artisan serve --host=0.0.0.0` |
| Image URL returns 404 | Confirm storage symlink: `php artisan storage:link` |
