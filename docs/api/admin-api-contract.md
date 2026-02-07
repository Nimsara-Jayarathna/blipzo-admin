# Admin API Contract (Overview)

This document is the high-level contract for admin APIs used by the admin frontend.

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

## Endpoint Index

- Admin auth login: `POST /api/v1/admin/auth/login`
- Admin auth session check: `GET /api/v1/admin/auth/session`
- Admin auth logout: `POST /api/v1/admin/auth/logout`
- Admin dashboard snapshot: `GET /api/v1/admin/dashboard`
- Admin users list: `GET /api/v1/admin/users`
- Admin user detail: `GET /api/v1/admin/users/{id}`
- Admin system settings: `GET /api/v1/admin/system/settings`

## Detailed Endpoint Docs

- Admin auth endpoints (login/session/logout):
  - `docs/api/admin-auth-api.md`
- Admin dashboard endpoint:
  - `docs/api/admin-dashboard-api.md`
- Admin users endpoint:
  - `docs/api/users-api.md`

## Naming Conventions

- Doc files: `kebab-case` with scope suffix
  - Examples: `admin-auth-api.md`, `admin-dashboard-api.md`, `users-api.md`
- Endpoint groups use noun-first path segments
  - Examples: `/admin/auth/*`, `/admin/dashboard`, `/admin/users`
- Environment keys use `camelCase`
  - Examples: `apiBaseUrl`, `apiPrefix`, `adminApiSegment`
- Response envelope field names are fixed and lowercase
  - `success`, `message`, `data`, `meta`, `errors`
- Meta fields use lower camel case
  - `requestId`, `timestamp`

## Authentication Model

- Authentication is cookie-based (`HttpOnly`, `Secure`, `SameSite` as per deployment policy).
- Frontend does not store tokens in `localStorage` or `sessionStorage`.
- Frontend sends requests with `withCredentials: true`.
- Backend should issue an access token cookie (`15 minutes` TTL).
- Access token expiry (15 minutes) is enforced by backend.

## Response Envelope Standard

### Success Envelope

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

### Error Envelope

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

## Frontend Integration Notes

- Login request URL is built from environment variables.
- Guard checks backend session via `GET /auth/session`.
- Requests to admin API use `withCredentials: true`.
- Global request feedback modal stack:
  - `src/app/core/http/http-request-feedback.interceptor.ts`
  - `src/app/core/http/http-request-feedback.service.ts`
  - `src/app/core/http/http-request-feedback.context.ts`
  - `src/app/shared/ui/global-request-feedback-modal`

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
