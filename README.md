# AbysApp — Service Order Management System

A responsive web application for managing a tech support shop. Handles customers, devices, parts (with stock control), services, service orders, and user authentication.

## Tech Stack

- **Next.js 16** (App Router) + **TypeScript**
- **PostgreSQL 16** via **Prisma 7**
- **NextAuth.js v5** (JWT authentication)
- **Tailwind CSS 4**
- **Docker + Docker Compose**
- **Jest** (unit + integration) + **Playwright** (E2E)

## Features

- Service Orders with services, parts, auto-calculated total, and technician comment history
- Parts with stock control (IN/OUT movements, paginated history: 5/10/30/50 rows)
- Price snapshot on orders — editing an item's price on an order does not affect the catalog
- Removing a part from an order automatically restores its stock
- Configurable order statuses with color labels
- User management with bcrypt-hashed passwords

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js](https://nodejs.org/) 20+ (for local dev tooling)

### Setup

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Start the database
docker compose up db -d

# 3. Install dependencies
npm install

# 4. Run migrations and seed the database
npx prisma migrate dev
npx prisma db seed

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Default admin credentials: `admin@abysapp.com` / `admin123`

### Full Docker (app + database)

```bash
docker compose up --build
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run unit + integration tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:reset` | Reset database (dev only) |

## Project Structure

```
src/
├── app/
│   ├── api/           # REST API routes
│   ├── dashboard/     # Authenticated pages
│   └── login/         # Public login page
├── components/ui/     # Reusable UI components
├── lib/               # Prisma client, NextAuth config, utilities
└── middleware.ts      # Auth guard for all /dashboard routes
prisma/
├── schema.prisma      # Database schema
└── seed.ts            # Initial data
docs/
├── architecture.md    # System architecture
└── class-diagram.md   # Entity relationships
```

## Documentation

- [Architecture](docs/architecture.md)
- [Class Diagram](docs/class-diagram.md)
