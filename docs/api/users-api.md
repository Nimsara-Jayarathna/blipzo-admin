# Users API Contract

This document defines the API + frontend contract for Admin Users.

## Naming Conventions

- Resource paths are plural nouns: `/users`
- Action paths are verb-noun: `/reset-password`, `/force-logout`
- JSON fields use camelCase: `categoryLimit`, `lastLoginAt`
- Status enums are uppercase: `ACTIVE`, `INACTIVE`, `SUSPENDED`

## Endpoints

- `GET /api/v1.1/admin/users`
- `GET /api/v1.1/admin/users/{id}`
- `PATCH /api/v1.1/admin/users/{id}`
- `GET /api/v1.1/admin/users/{id}/activity`
- `POST /api/v1.1/admin/users/{id}/reset-password`
- `POST /api/v1.1/admin/users/{id}/force-logout`

## Frontend Fetch Strategy

Users table uses a single list call, then applies filters + pagination client-side.

## Configurable Pagination Size

Set `adminUsersPageSize` in:

- `src/environments/environment.ts`
- `src/environments/environment.development.ts`

Default is `10`.

## Users List

### Endpoint

`GET /api/v1.1/admin/users`

### Query Parameters

- `name` (string, optional)
- `email` (string, optional)
- `userId` (string, optional)
- `status` (`ACTIVE | INACTIVE | SUSPENDED`, optional)

### Success `data`

```json
{
  "users": [
    {
      "id": "65f0...",
      "name": "Jane Smith",
      "email": "jane.smith@blipzo.io",
      "status": "ACTIVE"
    }
  ],
  "total": 1
}
```

## User Profile

### Endpoint

`GET /api/v1.1/admin/users/{id}`

### Success `data`

```json
{
  "id": "65f0...",
  "name": "Jane Smith",
  "email": "jane.smith@blipzo.io",
  "status": "ACTIVE",
  "categoryLimit": 10,
  "defaultCurrency": "USD ($)",
  "createdAt": "2023-10-12T00:00:00.000Z",
  "lastLoginAt": "2026-02-07T09:20:00.000Z",
  "role": "CONSUMER"
}
```

## Update User

### Endpoint

`PATCH /api/v1.1/admin/users/{id}`

### Request Body

```json
{
  "email": "jane.updated@blipzo.io",
  "status": "ACTIVE",
  "categoryLimit": 25
}
```

### Validation

- `status` must be `ACTIVE | INACTIVE | SUSPENDED`
- `categoryLimit` must be integer `0..1000`
- `email` must be unique across users

## User Activity

### Endpoint

`GET /api/v1.1/admin/users/{id}/activity`

### Success `data`

```json
{
  "activity": [
    {
      "event": "Login",
      "details": "Last successful login",
      "date": "2026-02-07T09:20:00.000Z"
    }
  ]
}
```

## Reset Password

### Endpoint

`POST /api/v1.1/admin/users/{id}/reset-password`

### Behavior

- Generate random temporary password
- Hash + store in `User.password`
- Set `mustChangePassword = true`
- Increment `tokenVersion` (invalidates active tokens)
- Send password email to user

### Success `data`

```json
{
  "userId": "65f0...",
  "email": "jane.smith@blipzo.io"
}
```

## Force Logout

### Endpoint

`POST /api/v1.1/admin/users/{id}/force-logout`

### Behavior

- Increment `tokenVersion` to invalidate active access/refresh tokens.
- Works without dedicated session table.

### Success `data`

```json
{
  "userId": "65f0...",
  "tokenVersion": 4
}
```
