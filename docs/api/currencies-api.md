# Currencies API Contract

This document defines the API + frontend contract for Admin Currencies.

## Naming Conventions

- Resource paths are plural nouns: `/currencies`
- Action paths are verb-noun: `/set-default`, `/toggle-status`
- JSON fields use camelCase: `isActive`, `isDefault`
- Status enums are uppercase display values: `DEFAULT`, `ENABLED`, `DISABLED`

## Endpoints

- `GET /api/v1.1/admin/currencies`
- `GET /api/v1.1/admin/currencies/{id}`
- `POST /api/v1.1/admin/currencies`
- `PATCH /api/v1.1/admin/currencies/{id}`
- `POST /api/v1.1/admin/currencies/{id}/set-default`
- `POST /api/v1.1/admin/currencies/{id}/toggle-status`

## Frontend Fetch Strategy

Currencies table uses a single list call, then applies filters + pagination client-side.

## Configurable Pagination Size

Set `adminCurrenciesPageSize` in:

- `src/environments/environment.ts`
- `src/environments/environment.development.ts`

Default is `10`.

## Currencies List

### Endpoint

`GET /api/v1.1/admin/currencies`

### Query Parameters

- `code` (string, optional)
- `name` (string, optional)
- `symbol` (string, optional)
- `status` (`ALL | DEFAULT | ENABLED | DISABLED`, optional)

### Success `data`

```json
{
  "currencies": [
    {
      "id": "cur-usd",
      "code": "USD",
      "name": "US Dollar",
      "symbol": "$",
      "isActive": true,
      "isDefault": true,
      "status": "DEFAULT"
    }
  ],
  "total": 1
}
```

## Currency Detail

### Endpoint

`GET /api/v1.1/admin/currencies/{id}`

### Success `data`

```json
{
  "id": "cur-usd",
  "code": "USD",
  "name": "US Dollar",
  "symbol": "$",
  "isActive": true,
  "isDefault": true,
  "status": "DEFAULT"
}
```

## Create Currency

### Endpoint

`POST /api/v1.1/admin/currencies`

### Request Body

```json
{
  "code": "EUR",
  "name": "Euro",
  "symbol": "€",
  "isActive": true,
  "isDefault": false
}
```

## Update Currency

### Endpoint

`PATCH /api/v1.1/admin/currencies/{id}`

### Request Body

```json
{
  "code": "EUR",
  "name": "Euro",
  "symbol": "€",
  "isActive": true,
  "isDefault": false
}
```

### Validation

- `code` must be 2-10 uppercase letters and unique.
- `name` is required.
- `symbol` is required.
- Default currency cannot be disabled.

## Set Default

### Endpoint

`POST /api/v1.1/admin/currencies/{id}/set-default`

### Behavior

- Sets target currency as default.
- Clears default flag from all other currencies.
- Ensures default currency is active.

## Toggle Status

### Endpoint

`POST /api/v1.1/admin/currencies/{id}/toggle-status`

### Request Body

```json
{
  "isActive": false
}
```

### Behavior

- Sets enabled/disabled state.
- Rejects disabling the current default currency.
