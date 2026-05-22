# Architecture Document — AbysApp

## Overview

AbysApp is a web-based service order management system for tech support shops. It follows a full-stack monorepo architecture built on **Next.js 16** with the App Router, backed by **PostgreSQL** via **Prisma ORM**, and secured with **NextAuth.js v5**.

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | 24.x LTS |
| Language | TypeScript | 5.x |
| Framework | Next.js (App Router) | 16.x |
| UI Styling | Tailwind CSS | 4.x |
| Database | PostgreSQL | 16.x |
| ORM | Prisma | 7.x |
| Authentication | NextAuth.js (Auth.js) | 5.x beta |
| Password Hashing | bcryptjs | 3.x |
| Validation | Zod | 4.x |
| Unit Tests | Jest + React Testing Library | 30.x / 16.x |
| E2E Tests | Playwright | 1.x |
| Containerization | Docker + Docker Compose | — |
| CI | GitHub Actions | — |

---

## Project Structure

```
AbysApp/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── api/                    # REST API routes (server-side)
│   │   │   ├── auth/[...nextauth]/ # NextAuth handlers
│   │   │   ├── customers/          # Customers API
│   │   │   ├── devices/            # Devices API
│   │   │   ├── order-statuses/     # Order Statuses API
│   │   │   ├── orders/             # Service Orders API
│   │   │   │   └── [id]/
│   │   │   │       ├── services/   # Order service items
│   │   │   │       ├── parts/      # Order part items (+ stock OUT)
│   │   │   │       └── comments/   # Order comments
│   │   │   ├── parts/              # Parts API + stock movements
│   │   │   ├── services/           # Services API
│   │   │   └── users/              # Users API
│   │   ├── dashboard/              # Authenticated pages (server + client)
│   │   │   ├── layout.tsx          # Shared nav + auth guard
│   │   │   ├── page.tsx            # Dashboard overview
│   │   │   ├── customers/
│   │   │   ├── devices/
│   │   │   ├── order-statuses/
│   │   │   ├── orders/
│   │   │   │   └── [id]/           # Order detail page
│   │   │   ├── parts/
│   │   │   │   └── [id]/stock/     # Stock movements with pagination
│   │   │   ├── services/
│   │   │   └── users/
│   │   └── login/                  # Public login page
│   ├── components/
│   │   └── ui/                     # Reusable UI primitives
│   ├── lib/
│   │   ├── auth.ts                 # NextAuth configuration
│   │   ├── prisma.ts               # Prisma singleton client
│   │   └── utils.ts                # Helpers (formatCurrency, calculateOrderTotal)
│   ├── generated/prisma/           # Auto-generated Prisma client
│   └── middleware.ts               # Auth middleware (protects all /dashboard routes)
├── prisma/
│   ├── schema.prisma               # Database schema (source of truth)
│   ├── migrations/                 # Migration history
│   └── seed.ts                     # Initial data (admin user + default statuses)
├── __tests__/                      # Jest unit + integration tests
├── e2e/                            # Playwright end-to-end tests
├── docs/                           # Architecture and class diagrams
├── docker-compose.yml              # Dev environment
├── Dockerfile                      # Multi-stage build
└── .github/workflows/ci.yml        # GitHub Actions CI
```

---

## Data Flow

```
Browser Request
      │
      ▼
Next.js Middleware (src/middleware.ts)
  └─ Checks JWT session via NextAuth
  └─ Redirects unauthenticated → /login
      │
      ▼
Page Component (Server Component or Client Component)
  └─ Server pages fetch via Prisma directly
  └─ Client pages fetch via /api/* routes
      │
      ▼
API Route Handler (src/app/api/*)
  └─ auth() call — validates session
  └─ Zod validation of request body
  └─ Prisma query → PostgreSQL
      │
      ▼
PostgreSQL (Docker container in dev, standalone in prod)
```

---

## Authentication Flow

1. User submits email + password on `/login`
2. NextAuth `Credentials` provider calls `authorize()`
3. `authorize()` looks up user in DB, verifies bcrypt hash
4. On success, NextAuth issues a JWT stored in an HTTP-only cookie
5. `src/middleware.ts` runs on every request and calls `auth()` to validate the token
6. Unauthenticated requests are redirected to `/login`

---

## Stock Control Logic

When a part is added to a service order (`POST /api/orders/[id]/parts`):
- An `OrderPartItem` row is created
- A `StockMovement` row of type `OUT` is created, linked via `orderPartItemId`

When a part item is removed from an order (`DELETE /api/orders/[id]/parts?itemId=X`):
- The linked `StockMovement` is deleted first
- The `OrderPartItem` is then deleted
- This automatically restores the stock

Current stock for a part = `SUM(quantity WHERE type=IN)` − `SUM(quantity WHERE type=OUT)`

Manual IN entries (stock receiving via `/dashboard/parts/[id]/stock`) have `orderPartItemId = null` and are unaffected by order changes.

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Price snapshot in `OrderServiceItem`/`OrderPartItem` | Prevents catalog price changes from retroactively affecting historical orders |
| `StockMovement` linked to `OrderPartItem` | Enables automatic stock restoration when a part is removed from an order |
| Server Components for data pages | Reduces client JS bundle, better SEO, simpler data fetching |
| Client Components for interactive forms | Required for event handlers, modals, real-time state |
| Zod validation on every API route | Ensures type-safe request parsing at the boundary |
| `int @id @default(autoincrement())` | Simple, sequential IDs, easier to read in URLs and logs |

---

## Running the Application

### Development (local)

```bash
# Start PostgreSQL
docker compose up db -d

# Install dependencies
npm install

# Run migrations + seed
npx prisma migrate dev
npx prisma db seed

# Start dev server
npm run dev
```

### Development (full Docker)

```bash
docker compose up
```

### Production

```bash
docker compose -f docker-compose.yml up --build
```

Default admin: `admin@abysapp.com` / `admin123`
