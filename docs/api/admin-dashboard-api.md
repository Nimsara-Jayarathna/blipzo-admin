# Admin Dashboard API Contract

This document isolates the admin dashboard endpoint from the main admin API contract.

## Naming Conventions

- Dashboard query params use lowercase short tokens
  - `period`, `eventsLimit`
- Period enum values use compact day-window format
  - `30d`, `90d`
- Summary metric keys use lower camel case
  - `totalUsers`, `activeUsers`, `defaultCurrency`, `errorCount`
- Nested KPI shape is consistent across metrics
  - `{ value, deltaPct }`
- Event level values are uppercase enums
  - `ERROR`, `WARN`, `INFO`, `UPDATE`

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
