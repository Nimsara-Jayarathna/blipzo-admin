# Users API Contract

This document defines the dedicated API and frontend integration contract for the Admin Users section.

## Naming Conventions

- Endpoint path uses plural resource naming
  - `GET /api/v1/admin/users`
- Query params are lowercase/camelCase
  - `name`, `email`, `userId`, `status`, `page`, `limit`
- User object keys are camelCase and stable
  - `id`, `name`, `email`, `status`
- Status values are uppercase enums
  - `ACTIVE`, `INACTIVE`, `SUSPENDED`
- Paging config variable in frontend uses descriptive camelCase
  - `adminUsersPageSize`

## Endpoint

`GET /api/v1/admin/users`

## Purpose

Load users for the Admin Users page (filters + table + pagination view).

## Frontend Fetch Strategy (Current)

Frontend performs a **single API call** and applies filters + pagination on the client.

- Fetch all users once on page load.
- Store full list in memory.
- Apply filter criteria client-side.
- Slice filtered result for current page.

This is intentional for fast UX at current admin scale.

## Configurable Page Size

Use a single variable in frontend code:

- `pageSize = 10` (recommended default)

Why 10:

- Good density/readability for admin tables.
- Stable row height across laptop screens.
- Easy to scan with minimal scrolling.

Pagination visibility rule:

- Show pagination controls only when `filteredCount > pageSize`.
- If `filteredCount <= pageSize`, render rows without pager controls.

## Query Parameters

Current implementation can work with no query params:

`GET /api/v1/admin/users`

Optional future query parameters (server-side mode ready):

- `name` (string)
- `email` (string)
- `userId` (string)
- `status` (`ACTIVE | INACTIVE | SUSPENDED`)
- `page` (number)
- `limit` (number)

## Success Response Envelope

```json
{
  "success": true,
  "message": "Users loaded.",
  "data": {
    "users": [
      {
        "id": "1001",
        "name": "Johnathan Doe",
        "email": "j.doe@example.com",
        "status": "ACTIVE"
      },
      {
        "id": "1002",
        "name": "Jane Smith",
        "email": "jane.smith@blipzo.io",
        "status": "ACTIVE"
      }
    ],
    "total": 1240
  },
  "meta": {
    "requestId": "req-users-001",
    "timestamp": "2026-02-07T12:00:00.000Z"
  }
}
```

## Field Contract

### User object

- `id`: string (displayed as `#id`)
- `name`: string
- `email`: string
- `status`: `ACTIVE | INACTIVE | SUSPENDED`

### Data object

- `users`: array of user objects
- `total`: total user count for dataset

## Error Response Envelope

```json
{
  "success": false,
  "message": "Unable to load users.",
  "meta": {
    "requestId": "req-users-500",
    "timestamp": "2026-02-07T12:00:02.000Z"
  }
}
```

## Frontend Mapping

- Filter form uses fields: `name`, `email`, `userId`, `status`.
- Table uses: `id`, `name`, `email`, `status`.
- Footer count text uses:
  - `Showing {start}-{end} of {filteredCount} users`
- Pager uses `pageSize` variable and current page index.

## Status Presentation Rules

- `status` display:
  - `ACTIVE`: green dot + green label
  - `INACTIVE`: slate dot + slate label
  - `SUSPENDED`: rose dot + rose label

## Backend Notes

- Keep response envelope consistent with admin standard.
- Include `total` even when returning full list.
- Return `200` with an empty `users` array when no matches.
- Preserve enum casing (`ACTIVE`, `INACTIVE`, `SUSPENDED`).

## Future Migration Path (Optional)

If dataset grows, frontend can migrate to server-side paging without breaking UI contract by enabling query params:

- `GET /admin/users?page=1&limit=10&name=...`

UI components remain reusable; only data source strategy changes.
