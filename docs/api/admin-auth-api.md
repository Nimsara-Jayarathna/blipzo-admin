# Admin Auth API Contract

This document isolates the admin authentication endpoints from the main admin API contract.

## Naming Conventions

- Auth endpoints follow verb-style action paths under `/admin/auth/*`
  - `login`, `session`, `logout`
- Request body keys use lowercase/camelCase
  - `email`, `password`
- Session fields use descriptive camelCase
  - `accessTokenExpiresInSeconds`
- Role values use `snake_case` (current contract)
  - Example: `super_admin`

## Authentication Model

- Authentication is cookie-based (`HttpOnly`, `Secure`, `SameSite` as per deployment policy).
- Frontend does not store tokens in `localStorage` or `sessionStorage`.
- Frontend sends requests with `withCredentials: true`.
- Backend should issue an access token cookie (`15 minutes` TTL).
- Access token expiry (15 minutes) is enforced by backend. Frontend must not be the source of truth for auth lifetime.

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
