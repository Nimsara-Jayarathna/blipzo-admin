# Admin System API

System monitoring and operations endpoints for the admin panel.

## Base Path

`/api/v1/admin/system`

## Naming Conventions

- Resource nouns are lowercase and hyphenated: `provider-usage`, `delete-requests`.
- Operations use action suffixes only when needed: `backup/run`, `backup/{id}/cancel`.
- Status enums are lowercase in API payloads: `running`, `success`, `failed`, `canceled`, `pending`, `approved`, `denied`.

## Endpoints

### `GET /system`

Returns the system snapshot used by the System Monitoring dashboard.

Response `data`:

- `providerHealth`
- `dbHealth`
- `backup`
- `deleteRequests`

### `GET /system/provider-usage`

Returns provider usage analytics and daily/hourly trend data.

Optional query params:

- `date` (ISO date/time string)

### `POST /system/backup/run`

Starts a manual backup job.

Response `data`:

- Backup job object with `id`, `status`, `progress`, `stage`, timestamps and optional error/file fields.

### `GET /system/backup/{id}`

Returns current backup status for polling.

### `POST /system/backup/{id}/cancel`

Cancels a running backup job.

### `GET /system/delete-requests`

Returns deletion requests and summary counts.

Optional query params:

- `status` (`pending | approved | denied`)

### `POST /system/delete-requests/{id}/decision`

Approves or denies a deletion request.

Request body:

- `decision`: `approve | deny`
- `note` (optional)

## Envelope

All endpoints use the standard admin success envelope:

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
