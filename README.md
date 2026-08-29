# CashFlowr

CashFlowr is a production-oriented personal finance workspace for tracking money, planning recurring cash flow, managing category budgets, building savings goals, and understanding financial trends from one responsive interface.

**Current release:** `v2.0.0`  
**Frontend:** https://cashflowr-orpin.vercel.app  
**API:** https://cashflowr-api-81rd.onrender.com  

## What changed in v2.0.0

The v2 overhaul moves CashFlowr beyond basic CRUD finance tracking. The application now includes stronger authentication and authorization controls, owner-scoped object access, concurrency protection, idempotent financial writes, server-side pagination/filtering, optimized analytics, savings goals, recurring cash-flow planning, a denser finance workspace UI, and CI gates for both the frontend and API.

## Product capabilities

- Income and expense ledger with categories, notes and dates
- Server-side transaction search, filtering and pagination
- Monthly category budgets with spend, remaining balance and over-budget state
- Savings goals with progress, atomic contributions, completion and archival
- Recurring income and expenses with weekly, monthly, quarterly and yearly schedules
- Idempotent posting of recurring occurrences into the transaction ledger
- Six-month income/expense/balance trend
- Current-month expense-category breakdown
- Savings rate, budget health and 30-day projected balance
- Notifications with unread state and activity metadata
- USD, GBP, EUR and NGN display preferences
- Responsive desktop/mobile navigation and light/dark themes

## Security model

CashFlowr uses bearer JWT authentication backed by server-side account state.

Production hardening includes:

- Short-lived signed JWTs
- Server-side token-version revocation and logout invalidation
- Active-account enforcement
- Generic credential failures
- Registration/login throttling plus global API throttling
- Request IDs for correlation
- Bounded request bodies
- Security response headers
- Explicit CORS allowlisting
- Centralized safe error responses
- Owner-scoped resource queries for BOLA protection
- Mutation-field allowlists to prevent mass assignment
- RBAC authorization primitive with `user`, `support` and `admin` roles
- Roles and account state excluded from self-service profile mutation

A resource identifier alone is never considered authorization. User-owned transactions, categories, budgets, notifications, goals and recurring items are always queried with the authenticated user's ID.

## Financial integrity and concurrency

Finance applications need stronger guarantees than ordinary CRUD applications. CashFlowr v2 adds:

- Per-user transaction idempotency keys
- Duplicate-request replay instead of duplicate ledger rows
- Compare-and-set/version checks for mutable resources
- Conflict responses for stale concurrent updates
- Atomic savings-goal contributions
- Deterministic idempotency keys for recurring occurrences
- Single-winner recurring schedule advancement and notification side effects
- Category dependency protection before deletion/type changes
- Positive-value and two-decimal money normalization
- Database indexes for common per-user/date access paths

Existing production monetary data remains stored as Mongo numeric values to avoid an unsafe one-step data migration. A future integer-minor-unit or Decimal128 migration should be performed separately with reconciliation.

## Performance architecture

The v2 API avoids loading an entire financial history into Node for dashboard calculations.

- Dashboard totals and trends are calculated with MongoDB aggregation
- Analytics use bounded aggregate queries
- Budget spend enrichment uses one grouped aggregation rather than one query per budget
- Transaction history is paginated and filterable at the API boundary
- Notifications are paginated
- Hot user/date/category query paths are indexed

## Frontend

- React 19
- React Router
- Vite
- Tailwind CSS
- Recharts
- Axios
- Lucide React
- Framer Motion
- Context-based authentication/theme/UI state

The authenticated shell uses one navigation definition across desktop and mobile, route-aware page titles, explicit loading/error/empty states, keyboard focus styles and reduced-motion support.

### Application routes

- `/dashboard`
- `/transactions`
- `/categories`
- `/budgets`
- `/goals`
- `/recurring`
- `/analytics`
- `/notifications`
- `/settings`

## Backend

- Node.js 22
- Express 5
- MongoDB
- Mongoose 9
- JWT
- bcryptjs

The Express app is separated from process startup so middleware and routes can be tested without binding a production port. Startup includes database connection handling and graceful shutdown behavior.

## API

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Transactions

```http
GET    /api/transactions
POST   /api/transactions
PUT    /api/transactions/:id
DELETE /api/transactions/:id
```

Transaction listing supports bounded query parameters including page, limit, search, type, category and date ranges. Create requests can provide an `Idempotency-Key` header. Version-sensitive mutations support `If-Match`.

### Categories

```http
GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
```

Categories cannot be removed or changed incompatibly while dependent financial records require them.

### Budgets

```http
GET    /api/budgets
POST   /api/budgets
PUT    /api/budgets/:id
DELETE /api/budgets/:id
```

### Savings goals

```http
GET    /api/goals
POST   /api/goals
PUT    /api/goals/:id
POST   /api/goals/:id/contribute
DELETE /api/goals/:id
```

### Recurring cash flow

```http
GET    /api/recurring
POST   /api/recurring
PUT    /api/recurring/:id
POST   /api/recurring/:id/post
DELETE /api/recurring/:id
```

### Notifications

```http
GET   /api/notifications
GET   /api/notifications/unread-count
PATCH /api/notifications/:id/read
PATCH /api/notifications/mark-all-read
```

### Dashboard and analytics

```http
GET /api/dashboard/summary
GET /api/analytics/summary
```

### User settings

```http
PUT /api/users/settings
```

## Local development

### Backend

```bash
cd server
npm ci
npm run dev
```

Backend environment:

```env
PORT=5000
MONGO_URI=mongodb_connection_string
JWT_SECRET=strong_random_secret
CLIENT_URL=http://localhost:5173
```

### Frontend

```bash
cd client
npm ci
npm run dev
```

Frontend environment:

```env
VITE_API_URL=http://localhost:5000/api
```

## Quality gates

GitHub Actions validates both applications on feature branches, pull requests and `main`.

### API gate

```bash
npm ci
npm audit --omit=dev --audit-level=high
npm run check
npm test
```

### Frontend gate

```bash
npm ci
npm audit --omit=dev --audit-level=high
npm run lint
npm run build
```

A release should not be merged while either job is red.

## Deployment

Production uses the repository's existing automatic deployments:

- **Frontend:** Vercel, `main`
- **Backend:** Render, `main`, root directory `server`
- **Database:** MongoDB

The frontend production API URL is:

```env
VITE_API_URL=https://cashflowr-api-81rd.onrender.com/api
```

The backend allowed frontend origin is:

```env
CLIENT_URL=https://cashflowr-orpin.vercel.app
```

The Render API is hosted on a free service tier and may cold-start after inactivity.

## Repository layout

```text
cashflowr/
├── .github/workflows/ci.yml
├── client/
│   └── src/
│       ├── components/
│       ├── config/
│       ├── context/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       ├── styles/
│       └── utils/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── tests/
│   ├── utils/
│   ├── app.js
│   └── server.js
└── CHANGELOG.md
```

## License

MIT

## Author

Ashibuogwu Williams
