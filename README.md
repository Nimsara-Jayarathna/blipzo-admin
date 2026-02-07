# BlipzoAdmin

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Admin API Configuration

The admin frontend builds API URLs from environment variables in:

- `src/environments/environment.ts`
- `src/environments/environment.development.ts`

Fields:

- `apiBaseUrl`
- `apiPrefix`
- `apiVersion`
- `adminApiSegment`

Route format:

`{apiBaseUrl}/{apiPrefix}/{apiVersion}/{adminApiSegment}/{path}`

Example:

`https://api.example.com/api/v1/admin/auth/login`

### Authentication mode

- Cookie-based auth (`HttpOnly` + `Secure`) is used.
- Frontend does not use `localStorage` for tokens.
- Admin API requests are sent with `withCredentials: true`.
- Backend should enforce `15 minute` access-token lifetime.

## API Contract Documentation

Admin API contract (routes, request/response envelopes, login schema) is documented in:

- `docs/api/admin-api-contract.md`

## Naming Conventions

Use these conventions for quick readability and consistency.

- Folders and files: `kebab-case`
  - Example: `src/app/shared/ui/global-request-feedback-modal`
- Angular components:
  - File names: `feature-name.ts`, `feature-name.html`
  - Class names: `PascalCase`
  - Example: `dashboard-recent-events.ts` -> `DashboardRecentEventsComponent`
- Services:
  - File names end with `.service.ts`
  - Class names end with `Service`
  - Example: `users.service.ts` -> `UsersService`
- Guards/interceptors:
  - File names include role/scope clearly
  - Example: `auth.guard.ts`, `http-request-feedback.interceptor.ts`
- Models/types:
  - File names end with `.models.ts`
  - Interfaces/types in `PascalCase`
  - Example: `users.models.ts` -> `AdminUser`, `UserStatus`
- Environment keys:
  - `camelCase`
  - Example: `adminUsersPageSize`, `apiBaseUrl`
- API docs:
  - One overview + focused docs per endpoint group
  - Example: `admin-api-contract.md` + `admin-auth-api.md` + `admin-dashboard-api.md` + `users-api.md`

### Dashboard API (aggregate endpoint)

Dashboard first-load data is fetched from one endpoint with params:

- `GET /api/{version}/admin/dashboard?period=30d|90d&eventsLimit=6`

Frontend service:

- `src/app/core/dashboard/dashboard.service.ts`

Dashboard implementation:

- Shell layout: `src/app/pages/dashboard/dashboard.ts`
- Dashboard page: `src/app/pages/dashboard/home/dashboard-home.ts`
- Reusable UI widgets: `src/app/shared/ui/dashboard-*`

## Global API Request Modal

All admin API requests are covered by a centralized blocking request modal.

- Interceptor: `src/app/core/http/http-request-feedback.interceptor.ts`
- Feedback service: `src/app/core/http/http-request-feedback.service.ts`
- Global UI component: `src/app/shared/ui/global-request-feedback-modal`

Context tokens for per-request behavior:

- `SKIP_HTTP_REQUEST_FEEDBACK`
- `SHOW_HTTP_REQUEST_SUCCESS`
- `HTTP_REQUEST_LOADING_MESSAGE`
- `HTTP_REQUEST_SUCCESS_MESSAGE`

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
