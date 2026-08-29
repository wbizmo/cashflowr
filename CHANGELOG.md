# Changelog

All notable production releases of CashFlowr are documented here.

## [2.0.0] - 2026-08-29

### Release title

**CashFlowr v2.0.0 — Production Finance Workspace**

### Added

- Savings goals with progress tracking, completion, archival and atomic contributions.
- Recurring cash-flow planning for weekly, monthly, quarterly and yearly income/expenses.
- Idempotent recurring occurrence posting into the transaction ledger.
- 30-day projected balance and upcoming recurring commitments on the dashboard.
- Six-month cash-flow time series and current-month category-spend breakdown.
- Explicit RBAC authorization primitive for user, support and admin roles.
- Server-side token versioning for session revocation.
- Request IDs, security headers, payload limits and API throttling.
- Server-side transaction pagination, search, type/category/date filters.
- GitHub Actions quality gates for API and frontend.
- Production-dependency security audit steps.

### Changed

- Rebuilt the authenticated application shell with unified desktop/mobile navigation and route-aware page titles.
- Rebuilt the dashboard around real financial trend data, budget risk, savings progress and upcoming obligations.
- Rebuilt Transactions around server-driven pagination/filtering and conflict-aware mutations.
- Moved dashboard and analytics calculations into MongoDB aggregations instead of loading complete histories into Node.
- Replaced per-budget N+1 spending calculations with grouped aggregation.
- Hardened category, budget, transaction, goal and recurring write paths with field allowlists and owner-scoped compare-and-set logic.
- Aligned backend dependency metadata with the committed lockfile and Mongoose 9 runtime.
- Tightened frontend motion, focus handling, loading states, empty states and responsive information density.

### Fixed

- BOLA/object ownership gaps around resource mutation assumptions.
- Mass-assignment exposure on generic update payloads.
- Duplicate transaction creation on retried/double-submitted requests.
- Stale concurrent writes that could overwrite newer resource state.
- Concurrent savings-goal contributions losing updates.
- Concurrent recurring posting producing duplicate schedule side effects/notifications.
- Category deletion/type changes invalidating dependent records.
- Budget utilization comparing all-time expenses with current-month limits.
- Dashboard/analytics scalability issues caused by full-history in-memory reduction.
- Notification read endpoint returning misleading success for missing/non-owned records.
- Hardcoded “Dashboard” title on every protected route.
- Transaction UI totals that could become misleading once pagination was enabled.
- Vite ESM path handling and frontend CI lint blockers.
- Server package-lock/package metadata drift that prevented deterministic `npm ci`.

### Security

- Login and registration throttling.
- Global API request throttling.
- Short-lived JWT defaults.
- Server-side logout/token invalidation.
- Active-account enforcement.
- Generic credential errors.
- Explicit CORS origin allowlisting.
- Centralized safe error responses.
- Owner-scoped BOLA enforcement for financial resources.
- Optimistic concurrency/version preconditions for mutable financial data.

### Deployment

- Frontend: Vercel, automatically deployed from `main`.
- Backend: Render, automatically deployed from `main` with `server` as the service root.

## [1.x]

Initial CashFlowr implementation: authenticated transaction, category and budget tracking with dashboards, analytics, notifications, settings and Vercel/Render deployment.
