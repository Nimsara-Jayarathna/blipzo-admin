# Categories API Contract

Admin categories are global template values used during **new user registration**.

## Naming Conventions

- Category types use lowercase enum values: `income`, `expense`
- Category statuses use uppercase labels: `DEFAULT`, `STANDARD`
- Settings payload keys use camelCase: `defaultCategoryLimit`

## Endpoints

- `GET /api/v1.1/admin/categories`
- `POST /api/v1.1/admin/categories`
- `PATCH /api/v1.1/admin/categories/{id}`
- `POST /api/v1.1/admin/categories/{id}/set-default`
- `DELETE /api/v1.1/admin/categories/{id}`
- `PATCH /api/v1.1/admin/categories/settings`

## List Categories

`GET /api/v1.1/admin/categories`

Response data:

```json
{
  "defaults": {
    "income": {
      "id": "...",
      "name": "General Income",
      "type": "income",
      "isDefault": true,
      "isActive": true,
      "status": "DEFAULT"
    },
    "expense": {
      "id": "...",
      "name": "Miscellaneous Expense",
      "type": "expense",
      "isDefault": true,
      "isActive": true,
      "status": "DEFAULT"
    }
  },
  "settings": {
    "defaultCategoryLimit": 10
  },
  "categories": [],
  "total": 0
}
```

## Save Category

`POST /api/v1.1/admin/categories`  
`PATCH /api/v1.1/admin/categories/{id}`

Payload:

```json
{
  "name": "Software Subscriptions",
  "type": "expense",
  "setAsDefault": false
}
```

## Set Default Category

`POST /api/v1.1/admin/categories/{id}/set-default`

Behavior:

- Sets one default per type.
- Updates registration template defaults.

## Delete Category

`DELETE /api/v1.1/admin/categories/{id}`

Rules:

- Default categories cannot be deleted.
- Deletion is soft (inactive), so existing records remain consistent.

## Update Global Limit

`PATCH /api/v1.1/admin/categories/settings`

Payload:

```json
{
  "defaultCategoryLimit": 15
}
```

Rules:

- Must be integer between `1` and `1000`.

## Registration Impact

- These values are applied when creating **new users**.
- Existing users keep their own independent categories and category limits.
