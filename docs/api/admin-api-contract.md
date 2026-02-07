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
- Admin auth session check: `GET /api/v1/admin/auth/session`
- Admin auth logout: `POST /api/v1/admin/auth/logout`
- Admin dashboard snapshot (aggregate): `GET /api/v1/admin/dashboard`
- Admin users list: `GET /api/v1/admin/users`
- Admin user detail: `GET /api/v1/admin/users/{id}`
- Admin system settings: `GET /api/v1/admin/system/settings`

## Authentication Model

- Authentication is cookie-based (`HttpOnly`, `Secure`, `SameSite` as per deployment policy).
- Frontend does not store tokens in `localStorage` or `sessionStorage`.
- Frontend sends requests with `withCredentials: true`.
- Backend should issue an access token cookie (`15 minutes` TTL).
- Access token expiry (15 minutes) is enforced by backend. Frontend must not be the source of truth for auth lifetime.

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
    "admin": {
      "id": "admin-1",
      "email": "admin@enterprise.com",
      "roles": ["super_admin"]
    },
    "session": {
      "accessTokenExpiresInSeconds": 900
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

## Session Check Contract

### Request

`GET /api/v1/admin/auth/session`

### Success Response (authenticated)

```json
{
  "success": true,
  "message": "Session active.",
  "data": {
    "authenticated": true,
    "admin": {
      "id": "admin-1",
      "email": "admin@enterprise.com",
      "roles": ["super_admin"]
    },
    "session": {
      "accessTokenExpiresInSeconds": 900
    }
  }
}
```

### Unauthorized Response

Status: `401 Unauthorized`

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

## Logout Contract

### Request

`POST /api/v1/admin/auth/logout`

### Success Response

```json
{
  "success": true,
  "message": "Logged out successfully.",
  "data": {}
}
```

## Frontend Integration Notes

- Login request URL is built from environment variables.
- No tokens are persisted in browser storage.
- Requests to admin API use `withCredentials: true`.
- Guard checks backend session via `GET /auth/session`.

### Global Request Feedback Modal

Frontend uses one shared, blocking request modal for API processing.

- Loading modal appears when an admin API request starts.
- Error popup appears when a request fails (network, timeout, backend error status).
- Modal closes automatically when loading completes successfully.
- If request is not sent (e.g., client-side validation failure), frontend can still trigger the same error modal.
- Success popup is shown only for selected write operations (current usage: admin logout).

Implemented via:

- Interceptor: `src/app/core/http/http-request-feedback.interceptor.ts`
- Service: `src/app/core/http/http-request-feedback.service.ts`
- Context tokens: `src/app/core/http/http-request-feedback.context.ts`
- Global modal component: `src/app/shared/ui/global-request-feedback-modal`

### Naming Convention Used

- Cross-cutting HTTP UI feedback files are prefixed with `http-request-feedback-*`.
- Shared reusable UI components use kebab-case folders with clear feature names.
- API request options use explicit context token names:
  - `SKIP_HTTP_REQUEST_FEEDBACK`
  - `SHOW_HTTP_REQUEST_SUCCESS`
  - `HTTP_REQUEST_LOADING_MESSAGE`
  - `HTTP_REQUEST_SUCCESS_MESSAGE`

## Backend Readiness Checklist

If you only implemented a basic API layer, these backend updates are required for the current frontend behavior:

- Implement `GET /api/{version}/admin/dashboard` with query params:
  - `period=30d|90d`
  - `eventsLimit=<number>`
- Return the standard response envelope (`success`, `message`, `data`, optional `meta`) for dashboard.
- Return meaningful error messages in `message` for non-2xx responses; frontend modal displays this directly.
- Ensure all admin endpoints support cookie auth (`HttpOnly`, `Secure`) with CORS credentials enabled.
- Keep login/logout/session routes aligned:
  - `POST /auth/login`
  - `POST /auth/logout`
  - `GET /auth/session`

Without these, frontend will still work structurally, but users will see blocking error popups for missing/mismatched endpoints.

## Dashboard Snapshot Contract

### Endpoint

`GET /api/v1/admin/dashboard`

### Query Parameters

- `period`: dashboard time window (`30d` | `90d`)
- `eventsLimit`: number of recent events to return

### Example Request

`GET /api/v1/admin/dashboard?period=30d&eventsLimit=6`

### Success Response

```json
{
  "success": true,
  "message": "Dashboard snapshot loaded.",
  "data": {
    "summary": {
      "totalUsers": { "value": 12450, "deltaPct": 12 },
      "activeUsers": { "value": 1102, "deltaPct": 5 },
      "defaultCurrency": { "value": "USD", "deltaPct": 0 },
      "errorCount": { "value": 14, "deltaPct": -2 }
    },
    "currencyUsage": {
      "period": "30d",
      "totalAmount": 1200000,
      "segments": [
        { "code": "USD", "percent": 70, "amount": 840000 },
        { "code": "EUR", "percent": 20, "amount": 240000 },
        { "code": "OTHER", "percent": 10, "amount": 120000 }
      ]
    },
    "recentEvents": [
      {
        "level": "ERROR",
        "message": "DB Connection Timeout",
        "occurredAt": "2m ago"
      },
      {
        "level": "WARN",
        "message": "High CPU usage (85%)",
        "occurredAt": "14m ago"
      }
    ]
  },
  "meta": {
    "requestId": "req-200",
    "timestamp": "2026-02-07T11:15:00.000Z"
  }
}
```

### Frontend Mapping

- `summary` -> KPI cards
- `currencyUsage` -> currency chart section
- `recentEvents` -> event table

### Error Response

Status: `500 Internal Server Error` (example)

```json
{
  "success": false,
  "message": "Unable to load dashboard snapshot."
}
```

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
