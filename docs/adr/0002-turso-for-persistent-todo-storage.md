# ADR 0002: Turso-backed storage for persistent todo data

- Status: Accepted
- Date: 2026-11-12

## Context

The app needs to keep personal todo data available beyond a single browser session and to support future deployment to Vercel. The initial localStorage-only approach works for a local demo, but it ties data to one browser and makes it difficult to keep data consistent when the app is served from a deployed environment.

The project also needs a storage boundary that can be changed later without rewriting the UI. The app should keep its user-facing behavior stable while moving the underlying database technology.

## Decision

We will store todo and category data in Turso, accessed through a database client configured with `TURSO_DATABASE_URL`.

When the environment variable is not set, the app will use a local SQLite-style file database path (`file:local.db`) so it remains easy to run on a developer machine.

## Consequences

- Pros:
  - Data persists outside the browser and is easier to move to a deployed environment
  - The app can be deployed to Vercel without depending on browser-only storage
  - The storage layer remains isolated behind the app’s storage module and API route
  - The same app interface continues to work while the backend storage changes

- Cons:
  - Requires database configuration and environment setup
  - Adds a small amount of operational complexity compared with localStorage
  - Needs a valid database URL for production or remote deployment

## Implementation notes

- The UI remains the same; only the persistence backend changes.
- The API route under `app/api/todos/route.ts` acts as the storage boundary between the UI and the database.
- The database connection is created from `TURSO_DATABASE_URL`, with `file:local.db` as the local default.
- The app intentionally keeps a clear boundary so that future database migrations remain low-risk.
