# Admin API Contract

This document defines the API contract used by the admin frontend.

## Base URL Strategy

Admin API routes follow this format:

`{API_BASE_URL}/{API_PREFIX}/{API_VERSION}/{ADMIN_SEGMENT}/{RESOURCE_PATH}`

Current environment variables:

- `apiBaseUrl`: host + optional base path (example: `https://api.example.com`)
- `apiPrefix`: API namespace (default: `api`)
- `apiVersion`: version segment (example: `v1`)
- `adminApiSegment`: admin namespace (default: `admin`)

Resulting base path:

`https://api.example.com/api/v1/admin`

## Endpoint Convention

- Admin auth login: `POST /api/v1/admin/auth/login`
- Admin users list: `GET /api/v1/admin/users`
- Admin user detail: `GET /api/v1/admin/users/{id}`
- Admin system settings: `GET /api/v1/admin/system/settings`

## Success Response Envelope

All successful responses should use:

```json
{
  "success": true,
  "message": "Operation successful.",
  "data": {},
  "meta": {
    "requestId": "req-001",
    "timestamp": "2026-02-07T10:30:00.000Z"
  }
}
```

## Error Response Envelope

All non-2xx responses should use:

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": {
    "email": ["Email is required."]
  },
  "meta": {
    "requestId": "req-002",
    "timestamp": "2026-02-07T10:30:05.000Z"
  }
}
```

## Login API Contract

### Request

`POST /api/v1/admin/auth/login`

```json
{
  "email": "admin@enterprise.com",
  "password": "password123"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "admin": {
      "id": "admin-1",
      "email": "admin@enterprise.com",
      "roles": ["super_admin"]
    }
  },
  "meta": {
    "requestId": "req-100",
    "timestamp": "2026-02-07T10:30:00.000Z"
  }
}
```

### Error Response (invalid credentials)

Status: `401 Unauthorized`

```json
{
  "success": false,
  "message": "Incorrect email or password.",
  "meta": {
    "requestId": "req-101",
    "timestamp": "2026-02-07T10:30:02.000Z"
  }
}
```

## Frontend Integration Notes

- Login request URL is built from environment variables.
- Auth token is stored as serialized admin session.
- Authorization header is attached automatically for admin endpoints, except login.
- Guard checks `AuthService.isAuthenticated()`.

## Recommended HTTP Status Usage

- `200`: read/query success
- `201`: resource created
- `400`: request invalid
- `401`: unauthenticated/invalid credentials
- `403`: authenticated but not allowed
- `404`: resource not found
- `409`: conflict/duplicate
- `422`: semantic validation errors
- `500`: server error
